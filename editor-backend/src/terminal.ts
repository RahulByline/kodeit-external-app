import { WebSocketServer } from "ws";
import pty from "node-pty";
import { runCmd } from "./utils/process.js";

export function setupTerminalServer(server: any) {
  const wss = new WebSocketServer({ server, path: "/api/terminal" });

  wss.on("connection", async (ws) => {
    // Create a tiny container and keep it while the WS is alive
    const id = `term-${Math.random().toString(36).slice(2)}`;
    const run = await runCmd("docker", [
      "run", "-dit", "--rm", "--network", "none", "--cpus=0.5", "--memory=256m", "--pids-limit", "256",
      "--name", id, "alpine:3.20", "/bin/sh"
    ], {});

    if (run.code !== 0) { ws.close(); return; }

    const shell = pty.spawn("docker", ["exec", "-it", id, "/bin/sh"], {
      name: "xterm-color",
      cols: 80, rows: 24
    });

    const idleKill = setTimeout(end, 120000);
    function bump() { clearTimeout(idleKill); setTimeout(end, 120000); }

    shell.onData((d) => ws.readyState === 1 && ws.send(d));
    ws.on("message", (m) => { bump(); shell.write(m.toString()); });
    ws.on("close", end);
    ws.on("error", end);

    function end() {
      try { shell.kill(); } catch {}
      runCmd("docker", ["rm", "-f", id], {}).finally(() => {});
      try { ws.close(); } catch {}
    }
  });
}
