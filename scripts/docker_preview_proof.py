from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "runtime"))

from osa_video_director import (  # noqa: E402
    ArtifactVerifier,
    ExecutionRouter,
    FFmpegSkillMCPExecutor,
    RepairPlanner,
)
from osa_video_director.models import EditAction  # noqa: E402


def make_input(path: Path) -> None:
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "testsrc=size=640x360:rate=30",
            "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000",
            "-t", "6",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-shortest",
            str(path),
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        check=True,
    )


def main() -> int:
    out_path = Path(os.environ.get("OSA_DOCKER_PROOF_PATH", "/tmp/osa-docker-proof.json"))
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="osa_docker_preview_") as tmp:
        work = Path(tmp)
        input_path = work / "input.mp4"
        output_path = work / "output.mp4"
        repaired_path = work / "repaired.mp4"
        make_input(input_path)

        executor = FFmpegSkillMCPExecutor(timeout_s=180)
        router = ExecutionRouter()
        verifier = ArtifactVerifier()

        action = EditAction(
            action_id="DOCKER001",
            kind="trim",
            reason="Docker preview vertical slice.",
            start_s=1.0,
            end_s=4.0,
            preferred_adapter="ffmpeg",
        )
        command = router.route(action)
        execution = executor.execute(command, input_path, output_path)
        first = verifier.verify(
            execution.output,
            expected_duration_s=3.0,
            duration_tolerance_s=0.25,
            repair_range=(1.0, 4.0),
        )
        if not first.passed:
            raise RuntimeError(f"first verification failed: {first.to_dict()}")

        bad = executor.inspect(input_path)
        negative = verifier.verify(
            bad,
            expected_duration_s=3.0,
            duration_tolerance_s=0.25,
            repair_range=(1.0, 4.0),
        )
        if negative.passed:
            raise RuntimeError("negative proof unexpectedly passed")

        repair = RepairPlanner().from_report("docker-preview", negative)
        if not repair.actions:
            raise RuntimeError("repair planner produced no action")
        repair_command = router.route_plan(repair)[0]
        repair_execution = executor.execute(repair_command, input_path, repaired_path)
        repaired = verifier.verify(
            repair_execution.output,
            expected_duration_s=3.0,
            duration_tolerance_s=0.25,
            repair_range=(1.0, 4.0),
        )
        if not repaired.passed:
            raise RuntimeError(f"repair verification failed: {repaired.to_dict()}")

        proof = {
            "status": "PASS",
            "transport": execution.transport,
            "upstream_version": execution.upstream_version,
            "input": execution.input.to_dict(),
            "output": execution.output.to_dict(),
            "verification": first.to_dict(),
            "negative_verification": negative.to_dict(),
            "repair_plan": repair.to_dict(),
            "repair_output": repair_execution.output.to_dict(),
            "repair_verification": repaired.to_dict(),
        }
        out_path.write_text(json.dumps(proof, indent=2), encoding="utf-8")
        print(json.dumps(proof))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
