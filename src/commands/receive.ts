import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { AUTH_DIR, isAuthenticated } from "../lib/auth.js";
import { Boom } from "@hapi/boom";
import P from "pino";

const logger = P({ level: "silent" }) as any;

function jidToNumber(jid: string): string {
  // 491234567890@s.whatsapp.net -> +491234567890
  const raw = jid.replace(/@.*$/, "");
  return `+${raw}`;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export async function receiveCommand(options: {
  from?: string;
  json?: boolean;
}): Promise<void> {
  if (!isAuthenticated()) {
    console.error("Error: Not logged in. Run 'wazzup login' first.");
    process.exit(1);
  }

  const filterNumber = options.from
    ? options.from.replace(/[\s\-+]/g, "")
    : undefined;

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  const sock = makeWASocket({
    auth: state,
    logger,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.error("Listening for messages... (Ctrl+C to stop)");
    }

    if (connection === "close") {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        console.error("Session expired. Please run 'wazzup login' again.");
        process.exit(1);
      }
      console.error("Connection closed unexpectedly.");
      process.exit(1);
    }
  });

  sock.ev.on("messages.upsert", ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      // Skip messages sent by us
      if (msg.key.fromMe) continue;

      const jid = msg.key.remoteJid;
      if (!jid || jid === "status@broadcast") continue;

      // Extract sender number from JID
      const senderRaw = jid.replace(/@.*$/, "");

      // Apply filter
      if (filterNumber && senderRaw !== filterNumber) continue;

      const from = jidToNumber(jid);
      const name = msg.pushName || "";
      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        msg.message?.videoMessage?.caption ||
        "";

      if (!text) continue;

      const timestamp = msg.messageTimestamp as number || Math.floor(Date.now() / 1000);

      if (options.json) {
        const obj = {
          timestamp: new Date(timestamp * 1000).toISOString(),
          from,
          name,
          message: text,
        };
        console.log(JSON.stringify(obj));
      } else {
        const ts = formatTimestamp(timestamp);
        const display = name ? `${from} (${name})` : from;
        console.log(`[${ts}] ${display}: ${text}`);
      }
    }
  });
}
