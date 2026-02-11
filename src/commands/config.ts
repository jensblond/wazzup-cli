import { loadConfig, saveConfig } from "../lib/config.js";

export function configCommand(options: { defaultNumber?: string }): void {
  const config = loadConfig();

  if (options.defaultNumber) {
    config.defaultNumber = options.defaultNumber;
    saveConfig(config);
    console.log(`✅ Default number set to ${options.defaultNumber}`);
    return;
  }

  // No flags — show current config
  if (Object.keys(config).length === 0) {
    console.log("No configuration set yet.");
    console.log('  whatsapp config --default-number "+491234567"');
    return;
  }

  console.log("Current configuration:");
  if (config.defaultNumber) {
    console.log(`  Default number: ${config.defaultNumber}`);
  }
}
