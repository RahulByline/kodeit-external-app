import { Router } from "express";
import { z } from "zod";
import { withTempDir, writeFile } from "./utils/fs";
import { runCmd } from "./utils/process";
import { Lang } from "./languages";
import { parsePython } from "./parseDiagnostics/python";
import { parseJavaScript } from "./parseDiagnostics/javascript";
import { parseC } from "./parseDiagnostics/c";
import { parseJava } from "./parseDiagnostics/java";

const schema = z.object({
  language: z.enum(["python", "javascript", "c", "cpp", "java"]),
  code: z.string(),
  stdin: z.string().optional()
});

// Local execution specs (without Docker for now)
interface LanguageSpec {
  file: string;
  compile?: string[];
  run: string[];
}

const localSpecs: Record<Lang, LanguageSpec> = {
  python: {
    file: "main.py",
    run: ["python", "main.py"]
  },
  javascript: {
    file: "main.js", 
    run: ["node", "main.js"]
  },
  c: {
    file: "main.c",
    compile: ["gcc", "main.c", "-o", "main.exe"],
    run: ["main.exe"]
  },
  cpp: {
    file: "main.cpp",
    compile: ["g++", "main.cpp", "-o", "main.exe"],
    run: ["main.exe"]
  },
  java: {
    file: "Main.java",
    compile: ["javac", "Main.java"],
    run: ["java", "Main"]
  }
};

function parseDiagnostics(language: Lang, stderr: string) {
  switch (language) {
    case "python": return parsePython(stderr);
    case "javascript": return parseJavaScript(stderr);
    case "c": return parseC(stderr);
    case "cpp": return parseC(stderr);
    case "java": return parseJava(stderr);
  }
}

export const runRouter = Router();

runRouter.post("/run", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { language, code } = parsed.data;
  const spec = localSpecs[language];

  try {
    const result = await withTempDir(async dir => {
      await writeFile(dir, spec.file, code);
      
      // Compile if needed
      const compileRes = spec.compile
        ? await runCmd(spec.compile[0], spec.compile.slice(1), { timeoutMs: 10000, cwd: dir })
        : null;

      if (compileRes && compileRes.code !== 0) {
        const diagnostics = parseDiagnostics(language, compileRes.stderr);
        return { stdout: compileRes.stdout, stderr: compileRes.stderr, exitCode: compileRes.code, diagnostics };
      }

      // Run the code
      const execRes = await runCmd(spec.run[0], spec.run.slice(1), { timeoutMs: 10000, cwd: dir });

      const diagnostics = execRes.code === 0 ? [] : parseDiagnostics(language, execRes.stderr);
      return { stdout: execRes.stdout, stderr: execRes.stderr, exitCode: execRes.code, diagnostics };
    });

    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || "run_failed" });
  }
});

runRouter.post("/save", async (req, res) => {
  const body = z.object({ language: z.string(), code: z.string() }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "bad_request" });

  try {
    const ts = Date.now();
    const path = `/tmp/code-editor/${body.data.language}-${ts}.txt`;
    await runCmd("sh", ["-lc", `mkdir -p /tmp/code-editor && printf %s "${escapeForSh(body.data.code)}" > ${path}`], { });
    res.json({ saved: true, path });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "save_failed" });
  }
});

function escapeForSh(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\$/g, "\\$");
}
