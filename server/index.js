const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const { Connect } = require("./lib/db");
require("dotenv").config();
const port = 5000;
//
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
//

//
app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
  await Connect(process.env.DATABASE_URL);
});

const io = new Server(server, {
  connectionStateRecovery: {},
});
