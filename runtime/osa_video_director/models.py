from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Literal

ActionKind = Literal[
    "cut", "trim", "remove_silence", "remove_retake", "insert_broll",
    "insert_graphic", "caption", "audio_cleanup", "color", "transition", "export",
]
Severity = Literal["info", "warning", "error"]

@dataclass(frozen=True)
class MediaAsset:
    asset_id: str
    path: str
    kind: Literal["video", "audio", "image", "graphic", "subtitle"] = "video"
    duration_s: float | None = None

@dataclass(frozen=True)
class DirectorDNA:
    name: str = "OSA Default"
    cut_pace_s: float = 3.0
    max_silence_s: float = 0.45
    repetition_tolerance: int = 0
    caption_style: str = "bold-clean"
    transition_policy: str = "cut-first"
    brand_tokens: tuple[str, ...] = ("OSA",)
    visual_notes: tuple[str, ...] = ()

@dataclass(frozen=True)
class PostProductionJob:
    job_id: str
    objective: str
    source_assets: tuple[MediaAsset, ...]
    transcript: str = ""
    dna: DirectorDNA = field(default_factory=DirectorDNA)
    output_aspect_ratio: str = "16:9"
    target_duration_s: float | None = None
    allow_generative_assets: bool = True

@dataclass(frozen=True)
class EditAction:
    action_id: str
    kind: ActionKind
    reason: str
    start_s: float | None = None
    end_s: float | None = None
    payload: dict[str, Any] = field(default_factory=dict)
    preferred_adapter: str | None = None

@dataclass(frozen=True)
class EditPlan:
    job_id: str
    actions: tuple[EditAction, ...]
    stage: Literal["direct", "repair"] = "direct"
    notes: tuple[str, ...] = ()
    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

@dataclass(frozen=True)
class TimelineObservation:
    duration_s: float
    silence_regions: tuple[tuple[float, float], ...] = ()
    repeated_regions: tuple[tuple[float, float], ...] = ()
    unsynced_regions: tuple[tuple[float, float], ...] = ()
    missing_brand_tokens: tuple[str, ...] = ()
    caption_gaps: tuple[tuple[float, float], ...] = ()

@dataclass(frozen=True)
class VerificationIssue:
    code: str
    severity: Severity
    message: str
    start_s: float | None = None
    end_s: float | None = None

@dataclass(frozen=True)
class VerificationReport:
    passed: bool
    issues: tuple[VerificationIssue, ...]
    metrics: dict[str, float | int | str] = field(default_factory=dict)
    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
