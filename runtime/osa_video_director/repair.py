from __future__ import annotations

from .models import EditAction, EditPlan, VerificationReport


class RepairPlanner:
    _MAPPING = {
        "EXCESS_SILENCE": ("remove_silence", "davinci"),
        "RETAKE_REPETITION": ("remove_retake", "davinci"),
        "SYNC_DRIFT": ("trim", "davinci"),
        "BRAND_TOKEN_MISSING": ("insert_graphic", "remotion"),
        "CAPTION_GAP": ("caption", "remotion"),\n        "DURATION_MISMATCH": ("trim", "ffmpeg"),
    }

    def from_report(self, job_id: str, report: VerificationReport) -> EditPlan:
        actions: list[EditAction] = []
        for idx, issue in enumerate(report.issues, start=1):
            mapping = self._MAPPING.get(issue.code)
            if not mapping:
                continue
            kind, adapter = mapping
            actions.append(EditAction(
                action_id=f"R{idx:03d}", kind=kind,
                reason=f"Repair verifier issue {issue.code}: {issue.message}",
                start_s=issue.start_s, end_s=issue.end_s,
                preferred_adapter=adapter,
            ))

        return EditPlan(
            job_id=job_id,
            actions=tuple(actions),
            stage="repair",
            notes=("Repair plan is derived only from verifier evidence.",),
        )
