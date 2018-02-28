const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("BAN_MEMBERS")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    
    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!bUser) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Couldn't find user!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    if(bUser.hasPermission("BAN_MEMBERS")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You cannot kick ${bUser}!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

    let bReason = args.join(" ").slice(22);
    if(!bReason) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Please fill all fields, !kick [mention] [reason]**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    let banEmbed = new Discord.RichEmbed()
    .setTitle("~Ban~")
    .setColor("#00ff00")
    .addField("Reported by", `${message.author} with ID: ${message.author.id}`)
    .addField("Banned user", `${bUser} with ID: ${bUser.id}`)
    .addField("Channel", `${message.channel}`)
    .addField("Date", `${message.createdAt}`)
    .addField("Reason", `${bReason}`);

    let banChannel = message.guild.channels.find(`name`, "log");
    if(!banChannel) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Couldn't find the log channel**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    message.guild.member(bUser).ban(bReason);
    banChannel.send(banEmbed);
    message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**${bUser} has been banned!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
}
module.exports.help = {
    name: "ban"
}