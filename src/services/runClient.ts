export type RunRequest = {
  language: "javascript" | "python" | "c" | "cpp" | "java";
  source: string;
  stdin?: string;
};

export type RunResponse = {
  status?: { id: number; description: string };
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | null;
  memory?: number | null;
  error?: string;
};

const PROXY_URL = import.meta.env.VITE_RUN_PROXY_URL || "http://localhost:8080";

export async function runCode(req: RunRequest): Promise<RunResponse> {
  const resp = await fetch(`${PROXY_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req)
  });
  return await resp.json();
}
