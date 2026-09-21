from __future__ import annotations

from dataclasses import asdict, dataclass
from hashlib import sha256
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ArtifactEvidence:
    path: str
    sha256: str
    size_bytes: int
    probe: dict[str, Any]

    @classmethod
    def from_file(cls, path: str | Path, probe: dict[str, Any]) -> "ArtifactEvidence":
        artifact = Path(path)
        if not artifact.is_file():
            raise FileNotFoundError(str(artifact))

        digest = sha256()
        with artifact.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                digest.update(chunk)

        return cls(
            path=str(artifact),
            sha256=digest.hexdigest(),
            size_bytes=artifact.stat().st_size,
            probe=probe,
        )

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(frozen=True)
class ExecutionEvidence:
    tool: str
    transport: str
    upstream_version: str
    input: ArtifactEvidence
    output: ArtifactEvidence
    result: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
