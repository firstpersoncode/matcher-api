const connect = require("../../../models/connect");
const Message = require("../../../models/Message");

module.exports = async function participantMessageAnnounce(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");
  if (!user.matchOwner)
    return res.status(401).send("only match owner can announce message");

  let { messageRef } = req.query;

  try {
    await connect();

    let message = await Message.findOne({
      _id: messageRef,
      type: { $ne: "announcement" },
    }).populate({ path: "owner", select: "name" });

    if (!message) return res.status(403).send("message not found");

    message.type = "announcement";
    let announcement = await message.save();

    res.socket.server.io.emit("broadcast", {
      type: "message-announce",
      data: announcement._doc,
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
