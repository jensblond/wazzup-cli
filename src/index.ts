#!/usr/bin/env node

import { Command } from "commander";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { sendCommand } from "./commands/send.js";
import { receiveCommand } from "./commands/receive.js";
import { configCommand } from "./commands/config.js";

const program = new Command();

program
  .name("wazzup")
  .description("Send WhatsApp messages from the terminal")
  .version("1.0.0");

program
  .command("login")
  .description("Log in by scanning a QR code")
  .action(loginCommand);

program
  .command("logout")
  .description("Log out and delete stored session")
  .action(logoutCommand);

program
  .command("send")
  .description("Send a message")
  .option("--to <number>", "Recipient phone number (with country code, e.g. +491234567)")
  .option("--message <text>", "Message text (or pipe via stdin)")
  .action(sendCommand);

program
  .command("receive")
  .description("Listen for incoming messages and print to stdout")
  .option("--from <number>", "Only show messages from this number")
  .option("--json", "Output as JSON (one object per line)")
  .action(receiveCommand);

program
  .command("config")
  .description("View or set configuration")
  .option("--default-number <number>", "Set default recipient number")
  .action(configCommand);

program.parse();
