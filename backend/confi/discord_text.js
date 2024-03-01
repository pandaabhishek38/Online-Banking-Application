const {Client, GatewayIntentBits}=require('discord.js');

const client= new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const token=process.env.DISCORD_TOKEN;

client.once('ready',()=>{
    console.log('Logged in as ${client.user.tag}');
});

const sendDiscordText = async (userId, message) => {
    const user = await client.users.fetch(userId);
    if (user) {
        try {
            await user.send(message);
            console.log(`Message sent to ${user.tag}`);
        } catch (error) {
            console.error(`Error sending message to ${user.tag}`, error.message);
        }
    } else {
        console.error(`User with ID ${userId} not found`);
    }
};

client.login(token);
module.exports={
    sendDiscordText,
};