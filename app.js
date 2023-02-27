"use strict";
require("dotenv").config();

const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");

const app = express();

app.use(cors({ credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  socket.on("join", (channel) => {
    socket.join(channel);
  });
  socket.on("leave", (channel) => {
    socket.leave(channel);
  });
});

app.use((_, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  res.socket.server.io = io;
  next();
});

require("./routes")(app);

server.listen(process.env.PORT, () => {
  const { port } = server.address();
  console.log(`Listening on port ${port}`);
});
