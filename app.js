const config = require("./config.json");
const Discord = require("discord.js");
const fs = require("fs");
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if(jsfile.length <= 0){
    console.log("Couldn't find commands.");
    return;
  }

  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${f} loaded!`);
    bot.commands.set(props.help.name, props);
  });



//Playing Message
bot.on("ready", async () => {
  console.log(`${bot.user.username} is online on ${bot.guilds.cache.size} servers!`);

  bot.user.setActivity("Protect in ${bot.guilds.cache.size} servers!", {type: "PLAYING"});
});

//Command Manager
bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefix = config.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  
  //Check for prefix
  if(!cmd.startsWith(config.prefix)) return;
  
  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);

});


bot.on("guildMemberAdd", async member => {
    if (member.user.username.startsWith("【ＣＧ】")) {
        try {await member.send("You have been banned from "+member.guild.name+" due to being a Chaos Gang member")} catch (err) {}
        await member.ban({reason:"Chaos Gang Member"})
    } 
    if (member.user.bot) {
        if (!member.user.flags.has(discord.UserFlags.FLAGS.VERIFIED_BOT)) {
            await member.ban({reason:"Non verified bot."})
            await member.guild.fetchAuditLogs({limit:1, type:"BOT_ADD"})
            .then(async audit => {
                first_log = audit.entries.first();
                const {executor, target} = first_log;
                try {
                    await member.guild.members.cache.get(executor.id).ban({reason:"Added a unverified bot."})
                } catch(err) {console.log(err)}

            })

        }
    }
})
//Token need in token.json
bot.login(process.env.TOKEN);
