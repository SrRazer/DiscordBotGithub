const Discord = require("discord.js");
const fs = module.require("fs");
const ms = module.require("ms");
let warns = JSON.parse(fs.readFileSync("./warnings.json", "utf8"));

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

    let wUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!wUser) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Couldn't find user!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

    let warnlvl = warns[wUser.id].warns;

    message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**<${wUser.id}> has ${warnlvl} warnings.**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
}
module.exports.help = {
    name: "warnlvl"
}