from __future__ import annotations

import json
import os
import platform
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "runtime"))

from osa_video_director import ExecutionRouter, FFmpegSkillMCPExecutor  # noqa: E402


def main() -> int:
    checks: dict[str, object] = {
        "python": {
            "ok": sys.version_info >= (3, 11),
            "version": platform.python_version(),
        },
        "ffmpeg": {
            "ok": shutil.which("ffmpeg") is not None,
            "path": shutil.which("ffmpeg"),
        },
        "ffprobe": {
            "ok": shutil.which("ffprobe") is not None,
            "path": shutil.which("ffprobe"),
        },
        "runtime": {
            "ok": True,
            "adapters": list(ExecutionRouter().adapter_names),
        },
    }

    skill_root = os.environ.get("FFMPEG_SKILL_ROOT")
    try:
        executor = FFmpegSkillMCPExecutor(skill_root=skill_root, timeout_s=30)
        health = executor.healthcheck()
        checks["ffmpeg_skill"] = {
            "ok": True,
            "root": str(executor.skill_root),
            "server_info": health["server_info"],
            "protocol_version": health["protocol_version"],
            "required_tools": [
                name for name in ("probe", "cut")
                if name in set(health["tool_names"])
            ],
        }
    except Exception as exc:  # health endpoint must explain the broken dependency
        checks["ffmpeg_skill"] = {
            "ok": False,
            "root": skill_root,
            "error": str(exc),
        }

    overall = all(
        bool(value.get("ok"))
        for value in checks.values()
        if isinstance(value, dict)
    )
    payload = {
        "status": "ok" if overall else "degraded",
        "service": "OSA Video Director Agent Workspace",
        "goal": "plan -> route -> execute -> evidence -> verify -> repair",
        "checks": checks,
    }
    print(json.dumps(payload))
    return 0 if overall else 1


if __name__ == "__main__":
    raise SystemExit(main())
