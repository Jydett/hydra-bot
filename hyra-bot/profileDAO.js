const {Classes} = require('./classes');
const {Client} = require('pg');
const {client} = require('./client');
const fs = require('fs');

const SAVE_FILE_PATH = './users.json';
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

class FileDAO {
    constructor(path) {
        this.SAVE_FILE_PATH = path;
    }

    save(data) {
        fs.writeFileSync(this.SAVE_FILE_PATH, JSON.stringify(data))
    }

    load(cb) {
        fs.readFile(this.SAVE_FILE_PATH, 'utf8', ((err, data) => cb(err, data)));
    }
}

class PostgresDAO {
     constructor() {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })

        this.client.connect();
        this.client.query('CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY, data JSONB)', (err, res) => {
            if (err) throw err;
            this.client.query('INSERT INTO data(id, data) VALUES (1, $1)', {}, (err, res) => {
                this.client.end();
            })
        })

    }

    save(data) {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })
        this.client.connect();
        this.client.query('UPDATE data SET data = $1 WHERE 1=1', data, (err, res) => {
            if (err) throw err;
            this.client.end();
        })
    }

    load(cb) {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })
        this.client.connect();
        this.client.query('SELECT data FROM data LIMIT 1', (err, res) => {
            this.client.end();
            cb(err, res)
        });
    }
}

class ProfileDAO {

    constructor() {
        if (process.env.NODE_ENV !== 'prod') {
            this.DAO = new FileDAO(SAVE_FILE_PATH);
        } else {
            this.DAO = new PostgresDAO();
        }
        console.log("ProfileDAO created")
        const this_ = this;
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
            this.DAO.save(this.users)
        } catch (err) {
            console.error(err)
        }
    }

    read(cb) {
        this.DAO.load((err, data) => {
            if (err) {
                console.error(err)
                this.users = {}
            } else {
                const parsedData = JSON.parse(data);
                for (const parsedDataKey in parsedData) {
                    parsedData[parsedDataKey].elyonClass = Classes[parsedData[parsedDataKey].elyonClass]
                }
                this.users = parsedData;
                console.log('Loaded ' + Object.keys(this.users).length + ' user(s)');
            }
            cb()
        })
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