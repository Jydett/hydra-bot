const config = require("./config.json");
const Commands = require("./commands.js");
const {client} = require("./client.js")
const {fakeUsers} = require('./debug');

console.log('ENV: ' + process.env.NODE_ENV)

client.once('ready', () => {
    console.log('Ready!');
});

Commands.register();
if (process.env.NODE_ENV !== 'prod') {
    fakeUsers();
}

client.login(config.BOT_TOKEN);