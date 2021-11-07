const {Classes} = require('./classes');
const {Client} = require('pg');
const {client} = require('./client');
const fs = require('fs');

const SAVE_FILE_PATH = './users.json';

class FileDAO {
    constructor(path) {
        this.SAVE_FILE_PATH = path;
    }

    save(data) {
        fs.writeFileSync(this.SAVE_FILE_PATH, JSON.stringify(data))
    }

    load() {
        return fs.readFileSync(this.SAVE_FILE_PATH, 'utf8');
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
        this.client.query('CREATE TABLE IF NOT EXISTS data (id INTEGER PRIMARY KEY AUTO_INCREMENT, data JSONB)', (err, res) => {
            if (err) throw err;
            this.client.query('INSERT INTO data(id, data) VALUES (1, null)', (err, res) => {
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
        client.query('UPDATE data SET data = $1 WHERE 1=1', data)
        this.client.end();
    }

    load() {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        })
        this.client.connect();
        const {rows} = client.query('SELECT data FROM data LIMIT 1')
        this.client.end();
        return rows[0];
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
            this.DAO.save(JSON.stringify(this.users))
        } catch (err) {
            console.error(err)
        }
    }

    read() {
        try {
            const text = this.DAO.load();
            const parsedData = JSON.parse(text);
            for (const parsedDataKey in parsedData) {
                parsedData[parsedDataKey].elyonClass = Classes[parsedData[parsedDataKey].elyonClass]
            }
            this.users = parsedData;
            console.log('Loaded ' + Object.keys(this.users).length + ' user(s)');
        } catch (err) {
            console.error(err)
            this.users = {}
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