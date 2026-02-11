import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_DIR = join(homedir(), ".whatsapp-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface AppConfig {
  defaultNumber?: string;
}

export function loadConfig(): AppConfig {
  if (!existsSync(CONFIG_FILE)) {
    return {};
  }
  const raw = readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(raw) as AppConfig;
}

export function saveConfig(config: AppConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf-8");
}
