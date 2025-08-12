import { useState } from "react";
import { runCode } from "../services/runClient";

type Props = {
  getSource: () => string;               // pass editor.getValue
  getLanguage: () => "javascript" | "python" | "c" | "cpp" | "java";
  getStdin?: () => string;
  onOutput: (text: string) => void;       // write to output panel
};

export default function RunButton({ getSource, getLanguage, getStdin, onOutput }: Props) {
  const [busy, setBusy] = useState(false);

  const onRun = async () => {
    setBusy(true);
    onOutput("Running...");
    try {
      const res = await runCode({
        language: getLanguage(),
        source: getSource(),
        stdin: getStdin ? getStdin() : ""
      });

      const finalOut =
        res.compile_output?.trim() ||
        res.stderr?.trim() ||
        res.stdout?.trim() ||
        (res.error ? `Error: ${res.error}` : "No output");
      const status = res.status?.description ? `\n[${res.status.description}]` : "";
      onOutput((finalOut || "") + status);
    } catch (e: any) {
      onOutput(`Client Error: ${e.message || e.toString()}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={onRun} disabled={busy}>
      {busy ? "Running..." : "Run"}
    </button>
  );
}
