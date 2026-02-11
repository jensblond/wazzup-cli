import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { AUTH_DIR } from "../lib/auth.js";
import qrcode from "qrcode-terminal";
import { Boom } from "@hapi/boom";
import { mkdirSync } from "fs";
import P from "pino";

const logger = P({ level: "silent" }) as any;

async function startLogin(): Promise<void> {
  mkdirSync(AUTH_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    logger,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("\nScan this QR code with WhatsApp on your phone:\n");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        console.error("Logged out. Please run 'wazzup login' again.");
        process.exit(1);
      }
      if (statusCode === DisconnectReason.restartRequired) {
        // Retry connection after restart-required signal
        startLogin();
      } else {
        const msg = (lastDisconnect?.error as Boom)?.message || "unknown error";
        console.error(`Connection failed (status ${statusCode}): ${msg}`);
        process.exit(1);
      }
    }

    if (connection === "open") {
      console.log("✅ Successfully logged in! Session saved.");
      console.log("You can now use 'wazzup send' to send messages.");
      setTimeout(() => process.exit(0), 1000);
    }
  });
}

export async function loginCommand(): Promise<void> {
  console.log("Connecting to WhatsApp...");
  await startLogin();
}
