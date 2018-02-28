const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let embed = new Discord.RichEmbed()
            .setAuthor(message.author.username)
            .setDescription("This is the user's info!")
            .setColor("#00ff00")
            .addField("Full Username", `${message.author.username}#${message.author.discriminator}`)
            .addField("ID", `${message.author.id}`)
            .addField("Created at", `${message.author.createdAt}`)
            .setFooter(message.guild.name);
        message.channel.send(embed);
        message.delete(100);
}
module.exports.help = {
    name: "userinfo"
}