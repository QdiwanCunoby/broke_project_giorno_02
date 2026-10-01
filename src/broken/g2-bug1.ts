// src/broken/g2-bug1.ts
import { readFile } from "fs/promises";

async function readFileASYNC(): Promise<void> {
  const data = await readFile("package.json", "utf-8");
  console.log(JSON.parse(data).name);
}

readFileASYNC();