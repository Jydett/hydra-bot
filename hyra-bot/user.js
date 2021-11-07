const {Classes} = require("./classes")

module.exports = class User {
    constructor(id, name, accountName = undefined,
                elyonClass= Classes.NONE,
                lvl=undefined,
                ilvl=undefined,
                pictURL=undefined, lastUpdatePict = undefined, inscriptionDate = Date.now()) {
        this.id = id;
        this.name = name;
        this.accountName = accountName;
        this.elyonClass = elyonClass;
        this.ilvl = ilvl;
        this.lvl = lvl;
        this.pictURL = pictURL;
        this.lastUpdatePict = lastUpdatePict;
        this.inscriptionDate = inscriptionDate;
    }
}
