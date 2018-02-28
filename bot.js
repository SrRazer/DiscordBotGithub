const botSettings = require("./config.json");
const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
const ytdl = require("ytdl-core");
const request = require("request");
const fs = require("fs");
const YtId = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");

var config = JSON.parse(fs.readFileSync("./config.json", 'utf-8'));

const prefix = botSettings.prefix;
const yt_api_key = config.yt_api_key;
const bot_controller = config.bot_controller;

var guilds = {};
bot.commands = new Discord.Collection();
bot.mutes = require("./mutes.json");

fs.readdir("./cmds/", (err, files) => {
    if(err) console.error(err);

    let jsfiles = files.filter(f => f.split(".").pop() === "js");
    if(jsfiles.length <= 0){
        console.log("No commands to load!");
        return;
    }
    console.log(`Loading ${jsfiles.length} commands!`);

    jsfiles.forEach((f, i) => {
        let props = require(`./cmds/${f}`);
        console.log(`${i + 1}: ${f} loaded!`);
        bot.commands.set(props.help.name, props);
    });
});
bot.on("ready", async() =>{
    console.log(`Bot is ready! ${bot.user.username}`);
    bot.user.setActivity("over the servers", {type: "WATCHING"});
        bot.setInterval(() =>{
            for(let i in bot.mutes){
                let time = bot.mutes[i].time;
                let GuildId = bot.mutes[i].guild;
                let guild = bot.guilds.get(GuildId);
                let member = guild.members.get(i);
                let mutedRole = guild.roles.find(r => r.name === "DiscordBot Muted");
                if(!mutedRole) continue;

                if(Date.now() > time){
                    member.removeRole(mutedRole);
                    delete bot.mutes[i];
                    fs.writeFile("./mutes.json", JSON.stringify(bot.mutes), err =>{
                        if(err) throw err;
                    });     
                }
            }
    }, 5000)
});
bot.on("message", async message => {
    if(message.author.bot) return;
    if(message.channel.type === "dm") return;

    let messageArray = message.content.split(/\s+/g);
    let command = messageArray[0];
    let args = messageArray.slice(1);
    
    if(!command.startsWith(prefix)) return;

    let cmd = bot.commands.get(command.slice(prefix.length));
    if(cmd) cmd.run(bot, message, args);  
});
bot.on("message", function(message) {
    const member = message.member;
    const mess = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1).join(" ");

    if (!guilds[message.guild.id]) {
        guilds[message.guild.id] = {
            queue: [],
            queueNames: [],
            isPlaying: false,
            dispatcher: null,
            voiceChannel: null,
            skipReq: 0,
            skippers: []
        };
    }
    if(mess.startsWith(prefix + "stop")){
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        if (message.guild.voiceConnection) { 
            message.guild.voiceConnection.disconnect();
            message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`You ended the song!`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        } else{
            message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`There's no song to stop`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        }
        
    }
    if (mess.startsWith(prefix + "play")) {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        if (message.member.voiceChannel || guilds[message.guild.id].voiceChannel != null) {
            if (guilds[message.guild.id].queue.length > 0 || guilds[message.guild.id].isPlaying) {
                getID(args, function(id) {
                    add_to_queue(id, message);
                    fetchVideoInfo(id, function(err, videoInfo) {
                        if (err) throw new Error(err);
                        message.channel.bulkDelete(1)
                        .then( messages => message.channel.send(" added to queue: **" + videoInfo.title + "**").then(msg => msg.delete(10000)))
                        .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
                        guilds[message.guild.id].queueNames.push(videoInfo.title);
                    });
                });
            } else {
                isPlaying = true;
                getID(args, function(id) {
                    guilds[message.guild.id].queue.push(id);
                    playMusic(id, message);
                    fetchVideoInfo(id, function(err, videoInfo) {
                        if (err) throw new Error(err);
                        guilds[message.guild.id].queueNames.push(videoInfo.title);
                        message.channel.bulkDelete(1)
                        .then( messages => message.channel.send(" now playing: **" + videoInfo.title + "**").then(msg => msg.delete(10000)))
                        .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
                    });
                });
            }
        } else {
            message.channel.bulkDelete(1)
            .then( messages => message.channel.send(" you need to be in a voice channel!").then(msg => msg.delete(10000)))
            .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        }
    } else if (mess.startsWith(prefix + "skip")) {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.bulkDelete(1)
        .then( messages => message.channel.sendMessage(`**You do not have the permission to use this command!**`).then(msg => msg.delete(10000)))
        .catch( error => message.channel.sendMessage(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
        if (guilds[message.guild.id].skippers.indexOf(message.author.id) === -1) {
            guilds[message.guild.id].skippers.push(message.author.id);
            guilds[message.guild.id].skipReq++;
            if (guilds[message.guild.id].skipReq >= Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2)) {
                skip_song(message);
                message.channel.bulkDelete(1)
                .then( messages => message.channel.send(" your skip has been acknowledged. Skipping now!").then(msg => msg.delete(10000)))
                .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
            } else {
                message.channel.bulkDelete(1)
                .then( messages => message.channel.send(" your skip has been acknowledged. You need **" + Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2) - guilds[message.guild.id].skipReq) = "**  more skip votes!").then(msg => msg.delete(10000))
                .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
            }
        } else {
            message.channel.bulkDelete(1)
            .then( messages => message.channel.send(" you already voted to skip!").then(msg => msg.delete(10000)))
            .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
            
        }
    } else if (mess.startsWith(prefix + "queue")) {
        var message2 = "```";
        for (var i = 0; i < guilds[message.guild.id].queueNames.length; i++) {
            var temp = (i + 1) + ": " + guilds[message.guild.id].queueNames[i] + (i === 0 ? "**(Current Song)**" : "") + "\n";
            if ((message2 + temp).length <= 2000 - 3) {
                message2 += temp;
            } else {
                message2 += "```";
                message.channel.bulkDelete(1)
                .then( messages => message.channel.send(message2).then(msg => msg.delete(10000)))
                .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
                message2 = "```";
            }
        }
        message2 += "```";
        message.channel.bulkDelete(1)
        .then( messages => message.channel.send(message2).then(msg => msg.delete(10000)))
        .catch( error => message.channel.send(`**ERROR:** ${error.message}`).then(msg => msg.delete(10000)));
    }

});
function skip_song(message) {
    guilds[message.guild.id].dispatcher.end();
}
function playMusic(id, message) {
    guilds[message.guild.id].voiceChannel = message.member.voiceChannel;



    guilds[message.guild.id].voiceChannel.join().then(function(connection) {
        stream = ytdl("https://www.youtube.com/watch?v=" + id, {
            filter: 'audioonly'
        });
        guilds[message.guild.id].skispReq = 0;
        guilds[message.guild.id].skippers = [];

        guilds[message.guild.id].dispatcher = connection.playStream(stream);
        guilds[message.guild.id].dispatcher.on('end', function() {
            guilds[message.guild.id].skipReq = 0;
            guilds[message.guild.id].skippers = [];
            guilds[message.guild.id].queue.shift();
            guilds[message.guild.id].queueNames.shift();
            if (guilds[message.guild.id].queue.length === 0) {
                guilds[message.guild.id].queue = [];
                guilds[message.guild.id].queueNames = [];
                guilds[message.guild.id].isfPlaying = false;
            } else {
                setTimeout(function() {
                    playMusic(guilds[message.guild.id].queue[0], message);
                }, 500);
            }
        });
    });
}



function getID(str, cb) {
    if (isYoutube(str)) {
        cb(getYouTubeID(str));
    } else {
        search_video(str, function(id) {
            cb(id);
        });
    }
}
function add_to_queue(strID, message) {
    if (isYoutube(strID)) {
        guilds[message.guild.id].queue.push(getYouTubeID(strID));
    } else {
        guilds[message.guild.id].queue.push(strID);
    }
}

function search_video(query, callback) {
    request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function(error, response, body) {
        var json = JSON.parse(body);
        if (!json.items[0]) callback("3_-a9nVZYjk");
        else {
            callback(json.items[0].id.videoId);
        }
    });
}

function isYoutube(str) {
    return str.toLowerCase().indexOf("youtube.com") > -1;
}





bot.on('guildMemberAdd', member => {
    var role = member.guild.roles.find('name', 'new');
    member.addRole(role);

    member.guild.channels.find('name', 'welcome').send(`**${member.user.username} has joined the server!**`);
 });

bot.login(botSettings.token);