const config = require("./config.json");
const Commands = require("./commands.js");
const {client} = require("./client.js")
const {fakeUsers} = require('./debug');

client.once('ready', () => {
    console.log('Ready!');
});

Commands.register();

fakeUsers();

client.login(config.BOT_TOKEN);