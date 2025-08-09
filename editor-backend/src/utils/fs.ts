import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { v4 as uuid } from "uuid";

export async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = join(tmpdir(), `code-${uuid()}`);
  await fs.mkdir(dir, { recursive: true });
  try { return await fn(dir); }
  finally {
    // Best-effort cleanup
    try { await fs.rm(dir, { recursive: true, force: true }); } catch {}
  }
}

export async function writeFile(dir: string, name: string, code: string) {
  await fs.writeFile(join(dir, name), code, "utf8");
}
