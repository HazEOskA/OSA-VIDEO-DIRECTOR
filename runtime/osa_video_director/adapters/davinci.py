from __future__ import annotations

from .base import AdapterCommand
from ..models import EditAction


class DaVinciResolveAdapter:
    name = "davinci"
    _SUPPORTED = {"cut", "trim", "remove_silence", "remove_retake", "audio_cleanup", "color", "transition", "export"}

    def supports(self, action: EditAction) -> bool:
        return action.kind in self._SUPPORTED

    def translate(self, action: EditAction) -> AdapterCommand:
        if not self.supports(action):
            raise ValueError(f"DaVinci adapter does not support {action.kind}")
        return AdapterCommand(
            adapter=self.name,
            operation=action.kind,
            parameters={"action_id": action.action_id, "start_s": action.start_s, "end_s": action.end_s, **action.payload},
        )
