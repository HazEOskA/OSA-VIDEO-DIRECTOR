from osa_video_director import DirectorDNA, DirectorRuntime, ExecutionRouter, MediaAsset, PostProductionJob, RepairPlanner, TimelineVerifier
from osa_video_director.models import EditAction, TimelineObservation
from osa_video_director.adapters import DaVinciResolveAdapter, FFmpegAdapter, HiggsfieldAdapter, RemotionAdapter
from osa_video_director.router import RoutingError


def make_job() -> PostProductionJob:
    return PostProductionJob(
        job_id="demo-001",
        objective="Turn raw talking-head footage into a clean OSA-style video.",
        source_assets=(MediaAsset("raw", "/media/raw.mov", duration_s=120.0),),
        transcript="Hello. Hello again. This is the final take.",
        dna=DirectorDNA(
            name="OSA Cyberpunk",
            max_silence_s=0.4,
            caption_style="bold-white",
            brand_tokens=("OSA", "osatechgpt.dev"),
            visual_notes=("dark", "cyberpunk", "premium"),
        ),
    )


def test_director_emits_agentic_pipeline_actions():
    plan = DirectorRuntime().plan(make_job())
    kinds = [a.kind for a in plan.actions]
    assert plan.stage == "direct"
    assert "remove_retake" in kinds
    assert "remove_silence" in kinds
    assert "caption" in kinds
    assert "insert_graphic" in kinds
    assert kinds[-1] == "export"


def test_verifier_and_repair_loop_are_evidence_driven():
    job = make_job()
    observation = TimelineObservation(
        duration_s=75.0,
        silence_regions=((10.0, 10.8),),
        repeated_regions=((20.0, 24.0),),
        unsynced_regions=((30.0, 31.0),),
        missing_brand_tokens=("osatechgpt.dev",),
        caption_gaps=((40.0, 43.0),),
    )
    report = TimelineVerifier().verify(observation, job.dna)
    assert report.passed is False
    assert report.metrics["error_count"] == 2
    repair = RepairPlanner().from_report(job.job_id, report)
    assert repair.stage == "repair"
    assert len(repair.actions) == 5
    assert {a.kind for a in repair.actions} >= {"remove_silence", "remove_retake", "trim", "caption"}


def test_adapter_contracts_translate_without_side_effects():
    plan = DirectorRuntime().plan(make_job())
    adapters = {
        "davinci": DaVinciResolveAdapter(),
        "higgsfield": HiggsfieldAdapter(),
        "remotion": RemotionAdapter(),
    }
    translated = []
    for action in plan.actions:
        adapter = adapters[action.preferred_adapter]
        assert adapter.supports(action)
        translated.append(adapter.translate(action))
    assert len(translated) == len(plan.actions)
    assert translated[0].adapter == "davinci"


def test_ffmpeg_adapter_translates_bounded_media_action():
    action = EditAction(
        action_id="A900",
        kind="export",
        reason="Create deterministic delivery artifact.",
        payload={"aspect_ratio": "9:16", "candidate": True},
        preferred_adapter="ffmpeg",
    )
    adapter = FFmpegAdapter()
    assert adapter.supports(action)
    command = adapter.translate(action)
    assert command.adapter == "ffmpeg"
    assert command.operation == "export"
    assert command.parameters["aspect_ratio"] == "9:16"
    assert command.parameters["candidate"] is True


def test_execution_router_respects_explicit_preferences():
    commands = ExecutionRouter().route_plan(DirectorRuntime().plan(make_job()))
    assert [command.adapter for command in commands] == [
        "davinci",
        "davinci",
        "davinci",
        "remotion",
        "higgsfield",
        "davinci",
        "davinci",
    ]


def test_execution_router_uses_ffmpeg_as_default_for_low_level_action():
    action = EditAction(
        action_id="A901",
        kind="trim",
        reason="Bounded deterministic trim.",
        start_s=1.0,
        end_s=5.0,
    )
    command = ExecutionRouter().route(action)
    assert command.adapter == "ffmpeg"
    assert command.parameters["start_s"] == 1.0
    assert command.parameters["end_s"] == 5.0


def test_execution_router_fails_closed_for_invalid_preference():
    action = EditAction(
        action_id="A902",
        kind="trim",
        reason="Do not silently switch executors.",
        preferred_adapter="remotion",
    )
    try:
        ExecutionRouter().route(action)
    except RoutingError as error:
        assert "does not support trim" in str(error)
    else:
        raise AssertionError("RoutingError was not raised")
