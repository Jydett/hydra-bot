const {ProfileDAO} = require('./profileDAO');
const User = require('./user');
const {Classes} = require('./classes');

exports.fakeUsers = function () {
    const keys = Object.keys(Classes)
        .filter(id => ! Classes[id].hidden);
    if (Object.keys(ProfileDAO.users).length >= 50) {
        console.log("DAO is full")
        return;
    }
    for (let i = 0; i < 50; i++) {
        const id = getRandomArbitrary(0, 999999).toFixed(0);
        const classId = getRandomArbitrary(0, keys.length - 1).toFixed(0);
        const elyonClass = Classes[keys[classId]];
        ProfileDAO.users[id] = new User(id,
            makeid(10),
            makeid(10),
            elyonClass,
            getRandomArbitrary(0, 40).toFixed(0),
            getRandomArbitrary(0, 300).toFixed(0)
        );
    }
}


function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}