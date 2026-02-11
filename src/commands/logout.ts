import { rmSync, existsSync } from "fs";
import { AUTH_DIR } from "../lib/auth.js";

export function logoutCommand(): void {
  if (!existsSync(AUTH_DIR)) {
    console.log("No active session found. Already logged out.");
    return;
  }

  rmSync(AUTH_DIR, { recursive: true, force: true });
  console.log("✅ Logged out. Session credentials deleted.");
}
