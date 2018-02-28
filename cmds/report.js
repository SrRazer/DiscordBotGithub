const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

    let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!rUser) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Couldn't find user!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => message.delete(10000)));

    let reason = args.join(" ").slice(22);
    if(!reason) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Please fill all fields, !report [mention] [reason]**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    let report = new Discord.RichEmbed()
    .setTitle("~Report~")
    .setColor("#00ff00")
    .addField("Reported by", `${message.author} with ID: ${message.author.id}`)
    .addField("Reported User", `${rUser} with ID: ${rUser.id}`)
    .addField("Channel", `${message.channel}`)
    .addField("Date", `${message.createdAt}`)
    .addField("Reason", `${reason}`);

    let reportchannel = message.guild.channels.find(`name`, "reports");
    if(!reportchannel) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Couldn't find the reports channel**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    reportchannel.send(report);
    message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**${rUser} has been reported!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
}
module.exports.help = {
    name: "report"
}