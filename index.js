console.clear();
const mongoose = require('mongoose')
const Discord = require("discord.js");
const Command = require("./Structures/Command.js");
const Client = require("./Structures/Client.js");
const config = require("./Data/config.json");
const client = new Client();
const fs = require("fs");
const express = require('express');
const server = express();
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { Player } = require("discord-player")

const LOAD_SLASH = process.argv[2] == "load"

const CLIENT_ID = "967591632482500678"
const GUILD_ID = "958302519623307275"

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25
  }
})

let SLcommands = []

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles){
  slashcmd = require(`./slash/${file}`)
  console.log(LOAD_SLASH)
  client.slashcommands.set(slashcmd.data.name, slashcmd)
  if(LOAD_SLASH) SLcommands.push(slashcmd.data.toJSON())
}
if (LOAD_SLASH) {
  const rest = new REST({ version:"9" }).setToken(config.tokens)
  console.log("deploying slash commands...")
  rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: SLcommands}).then(() => {
    console.log("Sucess loaded")
  })
  .catch((err) => {
    if(err){
      console.log(err)
      process.exit(1)
    }
  })
}
else {
  client.on("ready", () => console.log("bot is online!"));
  client.on("interactionCreate", (interaction) => {
    async function handleCommand() {
      if(!interaction.isCommand()) return

      const slashcmd = client.slashcommands.get(interaction.commandName)
      if(!slashcmd) interection.reply("Not a valid slash command")

      await interaction.deferReply()
      await slashcmd.run({client, interaction })
    }
    handleCommand()
  })
}

fs.readdirSync("./Commands")
    .filter(file => file.endsWith(".js"))
    .forEach(file => {
        /**
         * @type {Command}
         */

    const command = require(`./Commands/${file}`);
    console.log(`Command ${command.name} loaded`);
    client.commands.set(command.name, command);

    });


client.on("ready", () => {
  client.user.setActivity(`Currently in ${client.guilds.cache.size} servers`)
  setInterval(() => {
    if(client.user.presence.activities[0].name.includes('Currently')){
      client.user.setActivity(`지금 ${client.guilds.cache.size}개 서버에 있음`)
    }else if(client.user.presence.activities[0].name.includes('지금')){
      client.user.setActivity(`Currently in ${client.guilds.cache.size} servers`)
    }
  },30000)
})

client.on("messageCreate", async message => {

  if (!message.content.toLowerCase().startsWith(config.prefix)) return;

  if(message.author == client) return

  const args = message.content.substring(config.prefix.length).split(/ +/);
  
  const command = client.commands.find(cmd => cmd.name == args[0]);

  if(!command) return message.reply(`${args[0]} is not a vaild command!`) 

  command.run(message, args, client);


});

mongoose.connect(config.mongodb_srv, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB Database!')
}).catch((err) => {
    console.log(err)
})

client.login(config.tokens);