from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

from ..adapters import AdapterCommand
from ..evidence import ArtifactEvidence, ExecutionEvidence


class FFmpegSkillExecutionError(RuntimeError):
    def __init__(self, message: str, *, evidence: dict[str, Any] | None = None):
        super().__init__(message)
        self.evidence = evidence or {}


class FFmpegSkillMCPExecutor:
    """Live ffmpeg-skill executor using its contract-derived MCP stdio server.

    The executor consumes OSA AdapterCommand objects. It never builds a shell
    command and never bypasses ffmpeg-skill for media execution.
    """

    def __init__(
        self,
        skill_root: str | Path | None = None,
        *,
        python_executable: str = sys.executable,
        timeout_s: float = 120.0,
    ):
        configured = skill_root or os.environ.get("FFMPEG_SKILL_ROOT")
        if not configured:
            raise FFmpegSkillExecutionError(
                "FFMPEG_SKILL_ROOT is not configured; live ffmpeg-skill execution is unavailable."
            )
        self.skill_root = Path(configured).resolve()
        self.python_executable = python_executable
        self.timeout_s = timeout_s
        self.server = self.skill_root / "mcp" / "server.py"
        if not self.server.is_file():
            raise FFmpegSkillExecutionError(
                f"ffmpeg-skill MCP server not found: {self.server}"
            )
        self._health: dict[str, Any] | None = None

    def _request(self, method: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params or {},
        }
        try:
            proc = subprocess.run(
                [self.python_executable, str(self.server)],
                input=json.dumps(request) + "\n",
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=self.timeout_s,
                check=False,
            )
        except subprocess.TimeoutExpired as exc:
            raise FFmpegSkillExecutionError(
                f"ffmpeg-skill MCP timeout during {method}"
            ) from exc

        if proc.returncode != 0:
            raise FFmpegSkillExecutionError(
                f"ffmpeg-skill MCP process failed during {method}: "
                f"{proc.stderr.strip()[-500:]}"
            )

        responses = []
        for line in proc.stdout.splitlines():
            line = line.strip()
            if not line:
                continue
            try:
                doc = json.loads(line)
            except ValueError:
                continue
            if isinstance(doc, dict) and doc.get("id") == 1:
                responses.append(doc)

        if not responses:
            raise FFmpegSkillExecutionError(
                f"ffmpeg-skill MCP returned no JSON-RPC response for {method}"
            )

        response = responses[-1]
        if "error" in response:
            raise FFmpegSkillExecutionError(
                f"ffmpeg-skill MCP error during {method}: {response['error']}",
                evidence=response,
            )
        result = response.get("result")
        if not isinstance(result, dict):
            raise FFmpegSkillExecutionError(
                f"ffmpeg-skill MCP returned invalid result for {method}",
                evidence=response,
            )
        return result

    def healthcheck(self) -> dict[str, Any]:
        if self._health is not None:
            return self._health

        initialized = self._request("initialize")
        listed = self._request("tools/list")
        tool_names = tuple(
            tool.get("name")
            for tool in listed.get("tools", [])
            if isinstance(tool, dict) and tool.get("name")
        )
        server_info = initialized.get("serverInfo") or {}
        if server_info.get("name") != "ffmpeg-skill":
            raise FFmpegSkillExecutionError(
                f"Unexpected MCP server identity: {server_info}"
            )
        missing = [name for name in ("probe", "cut") if name not in tool_names]
        if missing:
            raise FFmpegSkillExecutionError(
                f"Required ffmpeg-skill MCP tools not advertised: {missing}"
            )

        self._health = {
            "server_info": server_info,
            "protocol_version": initialized.get("protocolVersion"),
            "tool_names": tool_names,
        }
        return self._health

    def call_tool(self, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        result = self._request(
            "tools/call",
            {"name": name, "arguments": arguments},
        )
        structured = result.get("structuredContent")
        if not isinstance(structured, dict):
            content = result.get("content") or []
            text = content[0].get("text") if content and isinstance(content[0], dict) else ""
            try:
                structured = json.loads(text) if text else None
            except ValueError:
                structured = None

        if result.get("isError") or not isinstance(structured, dict):
            raise FFmpegSkillExecutionError(
                f"ffmpeg-skill tool {name} failed or returned no structured evidence",
                evidence=result,
            )
        if structured.get("status") == "failed":
            raise FFmpegSkillExecutionError(
                f"ffmpeg-skill tool {name} reported failure: {structured.get('error')}",
                evidence=structured,
            )
        return structured

    def inspect(self, path: str | Path) -> ArtifactEvidence:
        media = Path(path).resolve()
        probe_doc = self.call_tool("probe", {"inputs": [str(media)]})
        return ArtifactEvidence.from_file(media, probe_doc)

    def _translate(
        self,
        command: AdapterCommand,
        input_path: Path,
        output_path: Path,
    ) -> tuple[str, dict[str, Any]]:
        if command.adapter != "ffmpeg":
            raise FFmpegSkillExecutionError(
                f"FFmpegSkillMCPExecutor refuses adapter={command.adapter}"
            )

        p = command.parameters
        if command.operation in {"cut", "trim"}:
            start = p.get("start_s")
            end = p.get("end_s")
            if start is None:
                start = 0.0
            if end is None:
                raise FFmpegSkillExecutionError(
                    f"{command.operation} requires end_s for this live slice"
                )
            return "cut", {
                "input": str(input_path),
                "output": str(output_path),
                "start": str(start),
                "end": str(end),
                "accurate": True,
                "overwrite": True,
            }

        raise FFmpegSkillExecutionError(
            f"Live ffmpeg-skill operation not implemented in this slice: "
            f"{command.operation}"
        )

    def execute(
        self,
        command: AdapterCommand,
        input_path: str | Path,
        output_path: str | Path,
    ) -> ExecutionEvidence:
        health = self.healthcheck()
        src = Path(input_path).resolve()
        dst = Path(output_path).resolve()
        before = self.inspect(src)
        tool, arguments = self._translate(command, src, dst)
        result = self.call_tool(tool, arguments)
        after = self.inspect(dst)
        return ExecutionEvidence(
            tool=tool,
            transport="mcp-stdio",
            upstream_version=str((health.get("server_info") or {}).get("version") or "unknown"),
            input=before,
            output=after,
            result=result,
        )
