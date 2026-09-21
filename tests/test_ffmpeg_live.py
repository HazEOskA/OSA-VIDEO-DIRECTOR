from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path

import pytest

from osa_video_director import (
    ArtifactVerifier,
    ExecutionRouter,
    FFmpegSkillMCPExecutor,
    RepairPlanner,
)
from osa_video_director.models import EditAction


pytestmark = pytest.mark.skipif(
    not os.environ.get("FFMPEG_SKILL_ROOT"),
    reason="live ffmpeg-skill proof requires FFMPEG_SKILL_ROOT",
)


def _make_input(path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f", "lavfi",
            "-i", "testsrc=size=640x360:rate=30",
            "-f", "lavfi",
            "-i", "sine=frequency=440:sample_rate=48000",
            "-t", "6",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-shortest",
            str(path),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
        text=True,
    )


def test_live_ffmpeg_skill_mcp_e2e_and_repair(tmp_path: Path):
    executor = FFmpegSkillMCPExecutor(timeout_s=180)
    health = executor.healthcheck()
    assert health["server_info"]["name"] == "ffmpeg-skill"
    assert {"probe", "cut"}.issubset(set(health["tool_names"]))

    input_path = tmp_path / "input.mp4"
    output_path = tmp_path / "output.mp4"
    repaired_path = tmp_path / "repaired.mp4"
    _make_input(input_path)

    router = ExecutionRouter()
    verifier = ArtifactVerifier()

    action = EditAction(
        action_id="LIVE001",
        kind="trim",
        reason="Create a real three-second candidate through ffmpeg-skill MCP.",
        start_s=1.0,
        end_s=4.0,
        preferred_adapter="ffmpeg",
    )
    command = router.route(action)
    execution = executor.execute(command, input_path, output_path)

    good_report = verifier.verify(
        execution.output,
        expected_duration_s=3.0,
        duration_tolerance_s=0.25,
        repair_range=(1.0, 4.0),
    )
    assert good_report.passed is True
    assert execution.output.size_bytes > 0
    assert execution.output.sha256 != execution.input.sha256

    bad_candidate = executor.inspect(input_path)
    failed_report = verifier.verify(
        bad_candidate,
        expected_duration_s=3.0,
        duration_tolerance_s=0.25,
        repair_range=(1.0, 4.0),
    )
    assert failed_report.passed is False
    assert {issue.code for issue in failed_report.issues} == {"DURATION_MISMATCH"}

    repair_plan = RepairPlanner().from_report("live-proof", failed_report)
    assert len(repair_plan.actions) == 1
    assert repair_plan.actions[0].kind == "trim"
    assert repair_plan.actions[0].preferred_adapter == "ffmpeg"

    repair_command = router.route_plan(repair_plan)[0]
    repair_execution = executor.execute(repair_command, input_path, repaired_path)
    repaired_report = verifier.verify(
        repair_execution.output,
        expected_duration_s=3.0,
        duration_tolerance_s=0.25,
        repair_range=(1.0, 4.0),
    )
    assert repaired_report.passed is True

    proof_path = os.environ.get("OSA_PROOF_PATH")
    if proof_path:
        proof = {
            "github": {
                "run_id": os.environ.get("GITHUB_RUN_ID"),
                "sha": os.environ.get("GITHUB_SHA"),
            },
            "health": {
                "server_info": health["server_info"],
                "protocol_version": health["protocol_version"],
                "required_tools": ["probe", "cut"],
            },
            "input": bad_candidate.to_dict(),
            "execution": execution.to_dict(),
            "verification": good_report.to_dict(),
            "negative_verification": failed_report.to_dict(),
            "repair_plan": repair_plan.to_dict(),
            "repair_execution": repair_execution.to_dict(),
            "repair_verification": repaired_report.to_dict(),
        }
        target = Path(proof_path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(proof, indent=2), encoding="utf-8")
