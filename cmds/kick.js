const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    
    let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!kUser) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Couldn't find user!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    if(kUser.hasPermission("KICK_MEMBERS")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You cannot kick ${kUser}!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

    let kReason = args.join(" ").slice(22);
    if(!kReason) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Please fill all fields, !kick [mention] [reason]**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    let kickEmbed = new Discord.RichEmbed()
    .setTitle("~Kick~")
    .setColor("#00ff00")
    .addField("Reported by", `${message.author} with ID: ${message.author.id}`)
    .addField("Kicked user", `${kUser} with ID: ${kUser.id}`)
    .addField("Channel", `${message.channel}`)
    .addField("Date", `${message.createdAt}`)
    .addField("Reason", `${kReason}`);

    let kickChannel = message.guild.channels.find(`name`, "log");
    if(!kickChannel) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Couldn't find the log channel**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    message.guild.member(kUser).kick(kReason);
    kickChannel.send(kickEmbed);
    message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**${kUser} has been kicked!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
}
module.exports.help = {
    name: "kick"
}