# WhatsApp CLI Design

## Overview

A lightweight CLI tool that sends WhatsApp messages from the terminal using the Baileys library (WhatsApp Web WebSocket protocol). Node.js + TypeScript.

## Commands

- **`whatsapp login`** — Connects to WhatsApp, displays QR code in terminal. Session credentials saved to `~/.whatsapp-cli/auth/`. Exits once authenticated.
- **`whatsapp send --to "+491234567" --message "Hello!"`** — Sends a message. Uses default number from config if `--to` is omitted. Supports stdin pipe for message.
- **`whatsapp config --default-number "+491234567"`** — Sets default recipient number.
- **`whatsapp logout`** — Deletes stored session credentials.

## Config

File: `~/.whatsapp-cli/config.json`

```json
{
  "defaultNumber": "+491234567"
}
```

## Project Structure

```
whatsapp-cli/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # CLI entry point (commander setup)
│   ├── commands/
│   │   ├── login.ts      # QR code display, auth flow
│   │   ├── logout.ts     # Delete auth credentials
│   │   ├── send.ts       # Send message logic
│   │   └── config.ts     # Manage config (default number)
│   ├── lib/
│   │   ├── auth.ts       # Auth store path, session check
│   │   └── config.ts     # Read/write config.json
```

## Dependencies

- `@whiskeysockets/baileys` — WhatsApp Web protocol
- `commander` — CLI argument parsing
- `qrcode-terminal` — QR code ASCII rendering

## Flow: send

1. Load config, resolve recipient (`--to` > defaultNumber > error)
2. Check auth credentials exist
3. Connect to WhatsApp via Baileys with stored session
4. Send message
5. Disconnect and exit
