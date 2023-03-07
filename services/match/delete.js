const Match = require("../../models/Match");
const Message = require("../../models/Message");

module.exports = async function matchDelete(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");
  if (!user.matchOwner)
    return res.status(401).send("only owner can delete match");
  if (user.match.verified)
    return res.status(403).send("match already verified");

  try {
    await Message.deleteMany({ match: user.match._id });
    await Match.deleteOne({ _id: user.match._id });

    res.socket.server.io.emit("broadcast", {
      type: "match-delete",
      data: user.match,
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
