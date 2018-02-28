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

    if(wUser.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You cannot kick ${wUser}!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    let wReason = args.join(" ").slice(22);
    if(!wReason) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Please fill all fields, !warn [mention] [reason]**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

    if(!warns[wUser.id]) warns[wUser.id] = {
        warns: 0
    };
    warns[wUser.id].warns++;

    fs.writeFile("./warnings.json", JSON.stringify(warns), (err) => {
        if (err) console.log(err);
    }); 
    let warnEmbed = new Discord.RichEmbed()
    .setTitle("~Warn~")
    .setAuthor(message.author.username)
    .setColor("#00ff00")
    .addField("Warned User", wUser)
    .addField("Warned In", message.channel)
    .addField("Date", message.createdAt)
    .addField("Reason", wReason)

    let warnChannel = message.guild.channels.find(`name`, "log");
    if(!warnChannel) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**Couldn't find the log channel**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

    warnChannel.send(warnEmbed);
    message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**${wUser} has been warned!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));


    let role = message.guild.roles.find(r => r.name === "DiscordBot Muted");
    let mutetime1 = "10s";
    let mutetime2 = "20s";
    let w1Reason = "Has been warned 4 times!";
    let w2Reason = "Has been warned 5 times!";
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
    if(warns[wUser.id].warns == 2){
        if(wUser.roles.has(role.id)) return;
        await wUser.addRole(role);
        setTimeout(function(){
            wUser.removeRole(role.id);

        }, ms(mutetime1));
    }
    if(warns[wUser.id].warns == 3){
        if(wUser.roles.has(role.id)) return;
        await wUser.addRole(role);
        setTimeout(function(){
            wUser.removeRole(role.id);

        }, ms(mutetime2));
    }
    if(warns[wUser.id].warns == 4){
        message.guild.member(wUser).kick(w1Reason);
    }
    if(warns[wUser.id].warns == 5){
        message.guild.member(wUser).ban(w2Reason);
        console.log(`${wUser.username} has been banned, has five warnings`);
        warns[wUser.id].wrans = 1;
    }
}
module.exports.help = {
    name: "warn"
}