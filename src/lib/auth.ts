import { existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export const AUTH_DIR = join(homedir(), ".whatsapp-cli", "auth");

export function isAuthenticated(): boolean {
  return existsSync(AUTH_DIR) && existsSync(join(AUTH_DIR, "creds.json"));
}
