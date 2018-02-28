const Discord = require("discord.js");
module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.send(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    if(isNaN(args[0]))return message.channel.bulkDelete(1).then( messages => message.channel.send(`**Please supply a valid amount of messages to delete**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    if(args[0] > 1000)return message.channel.bulkDelete(1).then( messages => message.channel.send(`**Please supply a number less than 1000**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    message.channel.bulkDelete(args[0])
    .then( messages => message.channel.send(`**Succesfully deleted ${messages.size}/${args[0]} messages**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
}
module.exports.help = {
    name: "purge"
}