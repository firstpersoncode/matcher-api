const connect = require("../../../models/connect");
const Message = require("../../../models/Message");

module.exports = async function participantMessageList(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");

  try {
    await connect();

    let chats = await Message.find({
      match: user.match._id,
    }).populate([
      { path: "owner", select: "name" },
      { path: "match", select: "name" },
    ]);

    res.status(200).send(chats);
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
