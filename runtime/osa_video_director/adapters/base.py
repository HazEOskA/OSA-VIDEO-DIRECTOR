from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol

from ..models import EditAction


@dataclass(frozen=True)
class AdapterCommand:
    adapter: str
    operation: str
    parameters: dict[str, Any]


class PostProductionAdapter(Protocol):
    name: str
    def supports(self, action: EditAction) -> bool: ...
    def translate(self, action: EditAction) -> AdapterCommand: ...
