/**
 * HF Radar - Main Entry Point
 * Fetches trending Hugging Face models/datasets/spaces daily
 */

const { fetchAllHF } = require("./fetch-trending");
const { generateMarkdown, saveDigest, generateTelegramMessage } = require("./generate-digest");
const { sendTelegram } = require("./telegram");
const { recordDaily } = require("./history-tracker");

async function main() {
  console.log("🤗 HF Radar — Starting daily scan...\n");
  const startTime = Date.now();

  const token = process.env.HF_TOKEN || null;
  if (!token) {
    console.warn("⚠️ No HF_TOKEN — using unauthenticated API (may have lower limits)");
  }

  const data = await fetchAllHF(token);

  const totalItems = Object.values(data).reduce((sum, cat) => sum + cat.items.length, 0);
  console.log(`\n✅ Fetched ${totalItems} items across ${Object.keys(data).length} categories`);

  const history = recordDaily(data);
  const totalTracked = Object.keys(history.items).length;
  console.log(`📊 History: ${totalTracked} unique items tracked`);

  const markdown = generateMarkdown(data);
  const filePath = saveDigest(markdown);

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    const telegramMsg = generateTelegramMessage(data);
    await sendTelegram(telegramMsg, botToken, chatId);
  } else {
    console.log("ℹ️ Telegram not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to enable");
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🏁 Done in ${elapsed}s — Digest: ${filePath}`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
