export type Lang = "python" | "javascript" | "c" | "cpp" | "java";

export const images: Record<Lang, { image: string; file: string; compile?: string[]; run: string[] }> = {
  python: {
    image: "python:3.11-alpine",
    file: "main.py",
    run: ["python", "main.py"]
  },
  javascript: {
    image: "node:22-alpine",
    file: "main.js",
    run: ["node", "main.js"]
  },
  c: {
    image: "gcc:13",
    file: "main.c",
    compile: ["sh", "-lc", "gcc main.c -O2 -pipe -static -s -o main"],
    run: ["./main"]
  },
  cpp: {
    image: "gcc:13",
    file: "main.cpp",
    compile: ["sh", "-lc", "g++ main.cpp -O2 -pipe -static -s -o main"],
    run: ["./main"]
  },
  java: {
    image: "eclipse-temurin:21-jdk",
    file: "Main.java",
    compile: ["javac", "Main.java"],
    run: ["java", "Main"]
  }
};
