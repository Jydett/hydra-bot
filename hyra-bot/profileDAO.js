const fs = require('fs')
const {Classes} = require('./classes');

const SAVE_FILE_PATH = './users.json';

class ProfileDAO {

    constructor() {
        console.log("ProfileDAO created")
        const this_ = this;
        this.read();
        process.on('SIGINT', function() {
            console.log('About to exit, saving users');
            this_.write();
        });
        process.on('SIGTERM', function() {
            console.log('About to exit, saving users');
            this_.write();
        });
    }

    //TODO degeu on ecrit sur le buffer
    write() {
        Object.keys(this.users)
            .map(k => this.users[k])
            .forEach(u => {
                u.elyonClass = u.elyonClass.id
                return u;
            });
        try {
            fs.writeFileSync(SAVE_FILE_PATH, JSON.stringify(this.users))
        } catch (err) {
            console.error(err)
        }
    }

    read() {
        try {
            const parsedData = JSON.parse(fs.readFileSync(SAVE_FILE_PATH, 'utf8'));
            for (const parsedDataKey in parsedData) {
                parsedData[parsedDataKey].elyonClass = Classes[parsedData[parsedDataKey].elyonClass]
            }
            this.users = parsedData;
            console.log('Loaded ' + Object.keys(this.users).length + ' user(s)');
        } catch (err) {
            console.error(err)
            this.users = {}
            return
        }
    }

    fromId(id) {
        if (this.users.hasOwnProperty(id)) {
            return this.users[id];
        } else {
            return null;
        }
    }
}

exports.ProfileDAO = new ProfileDAO();