require("dotenv").config();

let config = {
    dev: process.env.NODE_ENV !== "production",
    port: process.env.PORT,
};

let db = {
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "ecommerce",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
}

module.exports = { config, db };