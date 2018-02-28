const fs = module.require("fs");
module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        
        
        let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if(!toMute) return message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**You did not specify a user mention!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        if(toMute.id === message.author.id) return message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**You cannot unmute yourself!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        let role = message.guild.roles.find(r => r.name === "DiscordBot Muted");
        
        if(!role || !toMute.roles.has(role.id)) return message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**This user is not muted!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

        await toMute.removeRole(role);

        delete bot.mutes[toMute.id];
        fs.writeFile("./mutes.json", JSON.stringify(bot.mutes), err =>{
            if(err) throw err;
        });     
}
module.exports.help = {
    name: "unmute"
}