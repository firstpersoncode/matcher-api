module.exports = (_, res) => {
  res.socket.server.io.emit("ping", "pong!");
  res.status(200).send("pong!");
};
