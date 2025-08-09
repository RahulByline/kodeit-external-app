import { spawn } from "child_process";

export async function runCmd(cmd: string, args: string[], opts: { timeoutMs?: number; cwd?: string } = {}) {
  return new Promise<{ stdout: string; stderr: string; code: number | null }>((resolve, reject) => {
    const p = spawn(cmd, args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    const killTimer = opts.timeoutMs ? setTimeout(() => p.kill("SIGKILL"), opts.timeoutMs) : undefined;
    p.stdout.on("data", d => stdout += d.toString());
    p.stderr.on("data", d => stderr += d.toString());
    p.on("error", reject);
    p.on("close", (code) => { if (killTimer) clearTimeout(killTimer); resolve({ stdout, stderr, code }); });
  });
}
