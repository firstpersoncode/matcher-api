const connect = require("../../models/connect");
const Match = require("../../models/Match");
const Message = require("../../models/Message");

module.exports = async function messageAnnounce(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");
  if (!user.matchOwner)
    return res.status(401).send("only match owner can announce message");

  let { messageRef } = req.body;

  try {
    await connect();

    let message = await Message.findOne({
      _id: messageRef,
      match: user.match._id,
      type: "chat",
    }).populate([
      { path: "owner", select: "name" },
      { path: "match", select: "name" },
    ]);

    if (!message) return res.status(403).send("message not found");

    message.type = "announcement";
    let announcement = await message.save();

    await Match.updateOne(
      { _id: user.match._id },
      { $push: { announcements: messageRef } }
    );

    res.socket.server.io.emit("broadcast", {
      type: "message-announce",
      data: { match: user.match, announcement: announcement._doc },
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
