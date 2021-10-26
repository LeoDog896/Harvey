const { Client, Intents } = require('discord.js');
const Settings = require('../settings');
const CourseSelector = require('./CourseSelector');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS]});

let a = new CourseSelector(client, 'courses.json');

client.once('ready', function() {
  console.log('Harvey has logged in.');
});

client.login(Settings.token);





/*const Eris = require("eris");
const Settings = require("./settings.json");

var bot = new Eris(Settings.token);

bot.on("ready", () => {

  console.log("Setting up emojis...");
  Settings.roles.forEach((obj) => {

    bot.removeMessageReaction(Settings.channel, obj.message, Settings.emoji).catch(err => {
      //console.log(err);
    });

    bot.addMessageReaction(Settings.channel, obj.message, Settings.emoji).catch(err => {
      //console.log(err);
    });
  });

  console.log('Setting Status');
  bot.editStatus('idle', {
    name: 'on your emotions.',
    type: 0,
    url: 'https://yooogle.co'
  });

  console.log("Ready!");

});

bot.on('guildMemberAdd', (guild, member) => {
  bot.createMessage(Settings.joinMessageChannel, `Welcome to the server <@${member.id}>!\n**Join whatever class you'd like by visiting the <#${Settings.channel}> channel.**`)
  .catch(err => {
    console.log(err);
  });
});

// FIXME: This no work for some reason.
process.on('SIGINT', function() {
  console.log("\nCleaning up emojis...");
  Settings.roles.forEach((obj) => {
    bot.removeMessageReaction(Settings.channel, obj.message, Settings.emoji).catch(err => {
      //console.log(err);
    });
  });

  console.log("Done. I'm gone felisha.");
  process.exit();
});

bot.on("messageReactionAdd", (msg, emoji, reactor) => {
  if(reactor.id === Settings.botId) { return; }
  const refrencedMessage = getRefMessage(msg);
  if(refrencedMessage === null) { return; }

  if(emoji.name === Settings.emoji) {
    bot.addGuildMemberRole(Settings.guild, reactor.id, refrencedMessage.role, `AUTOMATED: ${reactor.name} has been subscribed.`)
    .catch(err => {
      //console.log(err);
    });
  } else {
    bot.removeMessageReactionEmoji(Settings.channel, refrencedMessage.message, emoji.name)
    .catch(err => {
      //console.log(err);
    });;
  }
});

bot.on("messageReactionRemove", (msg, emoji, reactor) => {
  if(reactor.id === Settings.botId) { return; }
  const refrencedMessage = getRefMessage(msg);
  if(refrencedMessage === null) { return; }

  if(emoji.name === Settings.emoji) {
    bot.removeGuildMemberRole(Settings.guild, reactor, refrencedMessage.role, `AUTOMATED: ${reactor.name} has been subscribed.`)
    .catch(err => {
      console.log(err);
    });
  }
});

function getRefMessage(msg) {
  // Find the role/messageId object from the settings.
  const refrencedMessage = Settings.roles.find((obj) => {
    return obj.message == msg.id;
  });

  // Yeet away if the reacted message is not in the list.
  if(refrencedMessage === undefined) {
    return null;
  }

  return refrencedMessage;
}

bot.connect();*/