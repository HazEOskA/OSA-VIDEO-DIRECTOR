from __future__ import annotations

from .models import DirectorDNA, TimelineObservation, VerificationIssue, VerificationReport


class TimelineVerifier:
    def verify(self, observation: TimelineObservation, dna: DirectorDNA) -> VerificationReport:
        issues: list[VerificationIssue] = []

        for start, end in observation.silence_regions:
            if end - start > dna.max_silence_s:
                issues.append(VerificationIssue(
                    code="EXCESS_SILENCE", severity="warning",
                    message=f"Silence {(end-start):.2f}s exceeds {dna.max_silence_s:.2f}s.",
                    start_s=start, end_s=end,
                ))

        for start, end in observation.repeated_regions:
            issues.append(VerificationIssue(
                code="RETAKE_REPETITION", severity="error",
                message="Repeated delivery remains in the candidate edit.",
                start_s=start, end_s=end,
            ))

        for start, end in observation.unsynced_regions:
            issues.append(VerificationIssue(
                code="SYNC_DRIFT", severity="error",
                message="Audio/visual sync drift detected.",
                start_s=start, end_s=end,
            ))

        for token in observation.missing_brand_tokens:
            issues.append(VerificationIssue(
                code="BRAND_TOKEN_MISSING", severity="warning",
                message=f"Required brand token missing: {token}",
            ))

        for start, end in observation.caption_gaps:
            issues.append(VerificationIssue(
                code="CAPTION_GAP", severity="warning",
                message="Spoken region has no caption coverage.",
                start_s=start, end_s=end,
            ))

        passed = not any(issue.severity == "error" for issue in issues)
        return VerificationReport(
            passed=passed,
            issues=tuple(issues),
            metrics={
                "duration_s": observation.duration_s,
                "issue_count": len(issues),
                "error_count": sum(i.severity == "error" for i in issues),
            },
        )
