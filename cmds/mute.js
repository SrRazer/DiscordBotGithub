const fs = module.require("fs");

module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));;
        
        
        let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
        if(!toMute) return message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**You did not specify a user mention!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        if(toMute.id === message.author.id) returnmessage.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**You cannot mute yourself!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        if(toMute.highestRole.position >= message.member.highestRole.position) return message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**You cannot mute someone who has a higher role!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        let role = message.guild.roles.find(r => r.name === "DiscordBot Muted");
        if(!role){
            try{
                role = await message.guild.createRole({
                    name: "DiscordBot Muted",
                    color: "#7a7a7a",
                    permission: []
                });
                message.guild.channels.forEach(async (channel, id) =>{
                    await channel.overwritePermissions(role, {
                        SEND_MESSAGES: false,
                        ADD_REACTIONS: false
                    });
                });
            } catch(e){
                console.log(e.stack);
            }
        }
        if(toMute.roles.has(role.id)) return message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**This user is already muted!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

        bot.mutes[toMute.id] = {
            guild: message.guild.id,
            time: Date.now() + parseInt(args[1]) * 1000
        }
        fs.writeFile("./mutes.json", JSON.stringify(bot.mutes, null, 4), err =>{
            if(err) throw err;
            message.channel.bulkDelete(1).then( messages => message.channel.sendMessage(`**Succesfully muted ${toMute.id}**`).then(msg => msg.delete(10000)))
            .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        });

        await toMute.addRole(role);
        
}
module.exports.help = {
    name: "mute"
}