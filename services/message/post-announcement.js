const connect = require("../../models/connect");
const Match = require("../../models/Match");
const Message = require("../../models/Message");

module.exports = async function messagePostAnnouncement(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");

  let { text } = req.body;

  try {
    await connect();

    let newChat = new Message();
    newChat.text = text;
    newChat.type = "announcement";
    newChat.owner = user._id;
    newChat.match = user.match._id;

    let announcement = await newChat.save();

    await Match.updateOne(
      { _id: user.match._id },
      { $push: { announcements: announcement._doc._id } }
    );

    let message = await Message.findOne({
      _id: announcement._doc._id,
    }).populate([
      { path: "owner", select: "name" },
      { path: "match", select: "name" },
    ]);

    res.socket.server.io.emit("broadcast", {
      type: "announcement",
      data: { match: user.match, announcement: message },
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
