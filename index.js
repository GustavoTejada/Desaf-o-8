const express = require('express');
const { Router } = require('express');
const hbs = require('express-handlebars');
const { Server: HttpServer } = require('http');
const {Server: SocketIO } = require('socket.io');
let fs = require('fs');
let {config, db} = require("./config");
let cors = require("cors");
let db_knex_sqlite3 = require("./config/dbSqlite3");
let db_knex_mariaDB = require("./config/dbMariaDB");

const PORT = 3000;
const app = express();
const path = require('path');
const http = new HttpServer(app);
const io = new SocketIO(http);

//middleware
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.engine("handlebars", hbs.engine());
app.set('views', __dirname + '/views');
// ------- HANDLEBARS -------------
app.set('view engine', 'handlebars');

let productos = [];
let mensajes = [];
let routerProductos = new Router();

// Comprueba que exista la tabla Productos, si no existe la crea
(async () => {
    try {
        let existProductTable = await db_knex_mariaDB.schema.hasTable("productos");
        if (!existProductTable) {
            await db_knex_mariaDB.schema.createTable("productos", (table) => {
                table.increments("id").primary;
                table.string("titulo");
                table.integer("precio");
                table.string("thumbnail");
            });
        } else {
            console.log("La tabla productos ya existe");
        }
    } catch (error) {
        console.log(error);
    }
})();

// Comprueba que exista la tabla Mensajes, si no existe la crea
(async () => {
    try {
        let existMensajesTable = await db_knex_sqlite3.schema.hasTable("mensajes");
        if (!existMensajesTable) {
            await db_knex_sqlite3.schema.createTable("mensajes", (table) => {
                table.increments("id").primary;
                table.string("mensaje");
                table.string("email");
                table.time("time");
            });
        } else {
            console.log("La tabla mensajes ya existe");
        }
    } catch (error) {
        console.log(error);
    }
})();

// Obtiene todos los productos
(async () => {
    try {
        productos = await db_knex_mariaDB.from("productos");
        console.table(productos);
    } catch (error) {
        console.log(error);
    }
})();

// Obtiene todos los mensajes
(async () => {
    try {
        mensajes = await db_knex_sqlite3.from("mensajes");
        console.table(mensajes);
    } catch (error) {
        console.log(error);
    }
})();

app.get('/', (req, res) => {
    res.render("index", { productos });
});

io.on("connection", async socket => {
    socket.emit("init", productos);
    socket.emit("init_message", mensajes);
    socket.emit("update_table", productos);
    socket.on("add_product", async producto => {
        let new_product = {
            titulo: producto.title,
            precio: producto.price,
            thumbnail: producto.thumbnail
        }
        await db_knex_mariaDB.from("productos").insert(new_product);
        productos = await db_knex_mariaDB.from("productos");
        io.sockets.emit("update_table", productos);
    })
    socket.on("send_mensaje", async mensaje => {
        let newMessage = {
            ...mensaje
        }
        await db_knex_sqlite3.from("mensajes").insert(newMessage);
        mensajes = await db_knex_sqlite3.from("mensajes");
        io.sockets.emit("update_message", mensajes);
    })
});

app.use("/api/productos", routerProductos);

http.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto http://localhost:${PORT}`);
});