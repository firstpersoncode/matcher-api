const connect = require("../../../models/connect");
const Message = require("../../../models/Message");

module.exports = async function participantMessageAnnouncement(req, res) {
  let { matchRef } = req.query;

  try {
    await connect();

    let announcements = await Message.find({
      match: matchRef,
      type: "announcement",
    }).populate([{ path: "owner", select: "name" }]);

    res.status(200).send(announcements);
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
