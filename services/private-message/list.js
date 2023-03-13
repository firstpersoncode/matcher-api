const connect = require("../../models/connect");
const Message = require("../../models/Message");

module.exports = async function privateMessageList(req, res) {
  let user = req.user;

  try {
    await connect();

    let privateChats = await Message.find({
      $or: [{ owner: user._id }, { recipient: user._id }],
      type: "private-chat",
    }).populate([
      { path: "owner", select: "name" },
      { path: "recipient", select: "name" },
    ]);

    res.status(200).send(privateChats);
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
