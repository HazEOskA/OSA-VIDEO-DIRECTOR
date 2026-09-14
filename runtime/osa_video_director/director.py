from __future__ import annotations

from .models import EditAction, EditPlan, PostProductionJob


class DirectorRuntime:
    """Deterministic planning core for OSA Video Director V1.

    V1 separates editorial decision-making from tool execution. It emits a
    machine-readable edit plan that adapters can translate to concrete tools.
    """

    def plan(self, job: PostProductionJob) -> EditPlan:
        if not job.source_assets:
            raise ValueError("source_assets cannot be empty")

        actions: list[EditAction] = []
        seq = 1

        if job.transcript.strip():
            actions.append(EditAction(
                action_id=f"A{seq:03d}", kind="remove_retake",
                reason="Collapse repeated deliveries using transcript semantics.",
                payload={"repetition_tolerance": job.dna.repetition_tolerance},
                preferred_adapter="davinci",
            ))
            seq += 1

        actions.append(EditAction(
            action_id=f"A{seq:03d}", kind="remove_silence",
            reason="Remove dead air while preserving natural speech cadence.",
            payload={"max_silence_s": job.dna.max_silence_s},
            preferred_adapter="davinci",
        ))
        seq += 1

        actions.append(EditAction(
            action_id=f"A{seq:03d}", kind="audio_cleanup",
            reason="Normalize dialogue and reduce obvious noise before visual polish.",
            preferred_adapter="davinci",
        ))
        seq += 1

        actions.append(EditAction(
            action_id=f"A{seq:03d}", kind="caption",
            reason="Create captions that follow Director DNA.",
            payload={"style": job.dna.caption_style},
            preferred_adapter="remotion",
        ))
        seq += 1

        if job.allow_generative_assets:
            actions.append(EditAction(
                action_id=f"A{seq:03d}", kind="insert_graphic",
                reason="Generate semantic visual support for key spoken beats.",
                payload={"style": job.dna.visual_notes, "brand_tokens": job.dna.brand_tokens},
                preferred_adapter="higgsfield",
            ))
            seq += 1

        actions.append(EditAction(
            action_id=f"A{seq:03d}", kind="color",
            reason="Apply consistent finishing pass after structural edit.",
            preferred_adapter="davinci",
        ))
        seq += 1

        actions.append(EditAction(
            action_id=f"A{seq:03d}", kind="export",
            reason="Render a verification candidate, not the final master yet.",
            payload={"aspect_ratio": job.output_aspect_ratio, "candidate": True},
            preferred_adapter="davinci",
        ))

        return EditPlan(
            job_id=job.job_id,
            actions=tuple(actions),
            notes=(
                "Pipeline: UNDERSTAND → DIRECT → EDIT → VERIFY → REPAIR → EXPORT",
                "V1 stops before destructive execution unless an adapter is explicitly invoked.",
            ),
        )
