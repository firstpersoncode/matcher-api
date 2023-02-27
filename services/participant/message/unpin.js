const connect = require("../../../models/connect");
const Message = require("../../../models/Message");

module.exports = async function participantMessageUnpin(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");

  let { messageRef } = req.query;

  try {
    await connect();

    let message = await Message.findOne({ _id: messageRef });
    if (!message) return res.status(403).send("message not found");

    message.pinned = false;
    let unpinnedMessage = await message.save();

    res.socket.server.io.to(String(user.match._id)).emit("message", {
      type: "message-pin",
      data: unpinnedMessage._doc,
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
