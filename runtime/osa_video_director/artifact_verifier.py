from __future__ import annotations

from .evidence import ArtifactEvidence
from .models import VerificationIssue, VerificationReport


class ArtifactVerifier:
    """Verify facts measured from a real media artifact."""

    def verify(
        self,
        artifact: ArtifactEvidence,
        *,
        expected_duration_s: float | None = None,
        duration_tolerance_s: float = 0.20,
        require_video: bool = True,
        repair_range: tuple[float, float] | None = None,
    ) -> VerificationReport:
        issues: list[VerificationIssue] = []
        probe = artifact.probe or {}

        if artifact.size_bytes <= 0:
            issues.append(VerificationIssue(
                code="ARTIFACT_EMPTY",
                severity="error",
                message="Artifact exists but has zero bytes.",
            ))

        if require_video and not probe.get("video"):
            issues.append(VerificationIssue(
                code="VIDEO_STREAM_MISSING",
                severity="error",
                message="Verified artifact has no video stream.",
            ))

        raw_duration = probe.get("duration")
        try:
            actual_duration = float(raw_duration) if raw_duration is not None else None
        except (TypeError, ValueError):
            actual_duration = None

        if actual_duration is None:
            issues.append(VerificationIssue(
                code="DURATION_UNREADABLE",
                severity="error",
                message="Artifact duration could not be read from probe evidence.",
            ))
        elif expected_duration_s is not None:
            delta = abs(actual_duration - expected_duration_s)
            if delta > duration_tolerance_s:
                start_s = repair_range[0] if repair_range else None
                end_s = repair_range[1] if repair_range else None
                issues.append(VerificationIssue(
                    code="DURATION_MISMATCH",
                    severity="error",
                    message=(
                        f"Artifact duration {actual_duration:.3f}s differs from "
                        f"expected {expected_duration_s:.3f}s by {delta:.3f}s "
                        f"(tolerance {duration_tolerance_s:.3f}s)."
                    ),
                    start_s=start_s,
                    end_s=end_s,
                ))

        passed = not any(issue.severity == "error" for issue in issues)
        return VerificationReport(
            passed=passed,
            issues=tuple(issues),
            metrics={
                "duration_s": actual_duration if actual_duration is not None else -1.0,
                "size_bytes": artifact.size_bytes,
                "sha256": artifact.sha256,
                "issue_count": len(issues),
                "error_count": sum(i.severity == "error" for i in issues),
            },
        )
