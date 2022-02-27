let knex = require("knex");

var sqlite3 = knex({
    client: "sqlite3",
    connection: {
        filename: './DB/ecommerce.sqlite3',
    },
    pool: {
        min: 0,
        max: 7,
    }
});

class Database {
    static client;

    constructor() {
        if (Database.client) {
            return Database.client;
        }
        Database.client = sqlite3;
        this.client = Database.client;
    }
}

module.exports = new Database().client;
