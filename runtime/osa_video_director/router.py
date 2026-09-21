from __future__ import annotations

from collections.abc import Iterable

from .adapters import (
    AdapterCommand,
    DaVinciResolveAdapter,
    FFmpegAdapter,
    HiggsfieldAdapter,
    PostProductionAdapter,
    RemotionAdapter,
)
from .models import EditAction, EditPlan


class RoutingError(ValueError):
    pass


class ExecutionRouter:
    """Deterministic adapter selection for OSA Video Director.

    Explicit `preferred_adapter` is authoritative. When it is absent, the
    router uses a small deterministic fallback order and never executes tools.
    """

    _FALLBACK_ORDER = ("ffmpeg", "davinci", "remotion", "higgsfield")

    def __init__(self, adapters: Iterable[PostProductionAdapter] | None = None):
        registered = adapters or (
            FFmpegAdapter(),
            DaVinciResolveAdapter(),
            RemotionAdapter(),
            HiggsfieldAdapter(),
        )
        self._adapters = {adapter.name: adapter for adapter in registered}

    @property
    def adapter_names(self) -> tuple[str, ...]:
        return tuple(self._adapters)

    def route(self, action: EditAction) -> AdapterCommand:
        if action.preferred_adapter:
            adapter = self._adapters.get(action.preferred_adapter)
            if adapter is None:
                raise RoutingError(
                    f"Unknown preferred adapter: {action.preferred_adapter}"
                )
            if not adapter.supports(action):
                raise RoutingError(
                    f"Preferred adapter {adapter.name} does not support {action.kind}"
                )
            return adapter.translate(action)

        for name in self._FALLBACK_ORDER:
            adapter = self._adapters.get(name)
            if adapter is not None and adapter.supports(action):
                return adapter.translate(action)

        raise RoutingError(f"No adapter supports action kind: {action.kind}")

    def route_plan(self, plan: EditPlan) -> tuple[AdapterCommand, ...]:
        return tuple(self.route(action) for action in plan.actions)
