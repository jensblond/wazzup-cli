# wazzup-cli

Send WhatsApp messages from the terminal.

## Install

```bash
npm install -g wazzup-cli
```

## Quick Start

### 1. Log in

```bash
wazzup login
```

Scan the QR code with WhatsApp on your phone (Linked Devices → Link a Device).

### 2. Send a message

```bash
wazzup send --to "+491234567890" --message "Hello from the terminal!"
```

### 3. Pipe messages via stdin

```bash
echo "Server is down!" | wazzup send --to "+491234567890"
```

## Commands

### `wazzup login`

Connect to WhatsApp by scanning a QR code. Session is saved locally so you only need to do this once.

### `wazzup logout`

Delete stored session credentials.

### `wazzup send`

Send a message to a phone number.

| Option | Description |
|---|---|
| `--to <number>` | Recipient phone number with country code (e.g. `+491234567890`) |
| `--message <text>` | Message text. If omitted, reads from stdin. |

### `wazzup config`

View or update configuration.

| Option | Description |
|---|---|
| `--default-number <number>` | Set a default recipient so you can skip `--to` |

```bash
# Set a default number
wazzup config --default-number "+491234567890"

# Then just
wazzup send --message "Quick message"
```

## How It Works

wazzup-cli uses [Baileys](https://github.com/WhiskeySockets/Baileys), an open-source WhatsApp Web API library. It connects as a linked device to your WhatsApp account — no separate phone number or WhatsApp Business account needed.

Session credentials are stored in `~/.whatsapp-cli/auth/`.

## License

MIT
