from __future__ import annotations

from .base import AdapterCommand
from ..models import EditAction


class HiggsfieldAdapter:
    name = "higgsfield"
    _SUPPORTED = {"insert_broll", "insert_graphic"}

    def supports(self, action: EditAction) -> bool:
        return action.kind in self._SUPPORTED

    def translate(self, action: EditAction) -> AdapterCommand:
        if not self.supports(action):
            raise ValueError(f"Higgsfield adapter does not support {action.kind}")
        return AdapterCommand(
            adapter=self.name,
            operation="generate_asset",
            parameters={"asset_kind": action.kind, "action_id": action.action_id, **action.payload},
        )
