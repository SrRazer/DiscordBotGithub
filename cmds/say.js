module.exports.run = async (bot, message, args) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
    .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
    .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));

    let botmsg = args.join(" ");
    message.delete().catch();
    message.channel.send(botmsg);
}
module.exports.help = {
    name: "say"
}