from __future__ import annotations

from .base import AdapterCommand
from ..models import EditAction


class RemotionAdapter:
    name = "remotion"
    _SUPPORTED = {"caption", "insert_graphic"}

    def supports(self, action: EditAction) -> bool:
        return action.kind in self._SUPPORTED

    def translate(self, action: EditAction) -> AdapterCommand:
        if not self.supports(action):
            raise ValueError(f"Remotion adapter does not support {action.kind}")
        return AdapterCommand(
            adapter=self.name,
            operation=action.kind,
            parameters={"action_id": action.action_id, "start_s": action.start_s, "end_s": action.end_s, **action.payload},
        )
