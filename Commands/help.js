const Command = require("../Structures/Command.js");

module.exports = new Command({
    name: "help",
    description: "help",
    async run (message, args, client) {
      message.channel.send("HOW TO USE THIS BOT\n-----------------------\n\n`bot add <your command>`     explanation: You can make commands, but you will get warnings if the command is inappropriate.\nHow to use your commands: `bot <your command>`\n\n***You can also use other people's command if you know the command name!(Be Creative!! You can use gifs)***")
    }
}); 