import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { AUTH_DIR, isAuthenticated } from "../lib/auth.js";
import { loadConfig } from "../lib/config.js";
import { Boom } from "@hapi/boom";
import P from "pino";

const logger = P({ level: "silent" }) as any;

function formatPhoneNumber(phone: string): string {
  // Remove +, spaces, dashes -> append @s.whatsapp.net
  const cleaned = phone.replace(/[\s\-+]/g, "");
  return `${cleaned}@s.whatsapp.net`;
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve("");
      return;
    }
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
  });
}

export async function sendCommand(options: {
  to?: string;
  message?: string;
}): Promise<void> {
  // Resolve recipient
  const config = loadConfig();
  const recipient = options.to || config.defaultNumber;

  if (!recipient) {
    console.error(
      "Error: No recipient specified. Use --to or set a default number:"
    );
    console.error('  whatsapp-cli config --default-number "+491234567"');
    process.exit(1);
  }

  // Resolve message (flag or stdin)
  let message = options.message;
  if (!message) {
    message = await readStdin();
  }
  if (!message) {
    console.error("Error: No message specified. Use --message or pipe via stdin.");
    process.exit(1);
  }

  // Check auth
  if (!isAuthenticated()) {
    console.error("Error: Not logged in. Run 'whatsapp-cli login' first.");
    process.exit(1);
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    logger,
  });

  sock.ev.on("creds.update", saveCreds);

  const jid = formatPhoneNumber(recipient);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        console.error("Session expired. Please run 'whatsapp-cli login' again.");
        process.exit(1);
      }
      console.error("Connection closed unexpectedly.");
      process.exit(1);
    }

    if (connection === "open") {
      try {
        await sock.sendMessage(jid, { text: message! });
        console.log(`✅ Message sent to ${recipient}`);
      } catch (err) {
        console.error("Failed to send message:", err);
        process.exit(1);
      }
      setTimeout(() => process.exit(0), 1000);
    }
  });
}
