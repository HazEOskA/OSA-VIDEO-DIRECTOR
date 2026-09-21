from __future__ import annotations

from .base import AdapterCommand
from ..models import EditAction


class FFmpegAdapter:
    """Translate bounded media actions into OSA's normalized FFmpeg contract.

    This adapter is intentionally transport-agnostic. It does not call FFmpeg,
    ffmpeg-skill, MCP, or a shell directly. A live executor may bind these
    normalized operations to the upstream ffmpeg-skill contract later.
    """

    name = "ffmpeg"
    _SUPPORTED = {
        "cut",
        "trim",
        "remove_silence",
        "audio_cleanup",
        "caption",
        "color",
        "transition",
        "export",
    }

    def supports(self, action: EditAction) -> bool:
        return action.kind in self._SUPPORTED

    def translate(self, action: EditAction) -> AdapterCommand:
        if not self.supports(action):
            raise ValueError(f"FFmpeg adapter does not support {action.kind}")

        return AdapterCommand(
            adapter=self.name,
            operation=action.kind,
            parameters={
                "action_id": action.action_id,
                "start_s": action.start_s,
                "end_s": action.end_s,
                **action.payload,
            },
        )
