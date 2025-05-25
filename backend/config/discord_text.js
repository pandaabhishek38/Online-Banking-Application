const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const token = process.env.DISCORD_TOKEN;

let isReady = false;

if (token) {
  client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    isReady = true;
  });

  client.login(token).catch((err) => {
    console.warn("⚠️ Discord login failed:", err.message);
  });
} else {
  console.warn(
    "⚠️ No DISCORD_TOKEN provided. Discord integration is disabled."
  );
}

const sendDiscordText = async (userId, message) => {
  if (!isReady) {
    console.warn("⚠️ Discord client not ready. Skipping message send.");
    return;
  }

  try {
    const user = await client.users.fetch(userId);
    await user.send(message);
    console.log(`Message sent to ${user.tag}`);
  } catch (error) {
    console.error(`Error sending message to ${userId}:`, error.message);
  }
};

module.exports = {
  sendDiscordText,
};
