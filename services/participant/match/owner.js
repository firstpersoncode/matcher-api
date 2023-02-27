const connect = require("../../../models/connect");
const Match = require("../../../models/Match");
const Participant = require("../../../models/Participant");

module.exports = async function participantMatchOwner(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");
  if (!user.matchOwner)
    return res.status(401).send("only owner can change ownership");
  if (user.match.verified)
    return res.status(403).send("match already verified");

  let { newOwnerRef } = req.query;

  try {
    await connect();

    let participant = await Participant.findOne({ _id: newOwnerRef }).select({
      password: 0,
    });

    if (!participant) return res.status(403).send("user not found");

    await Match.updateOne({ _id: user.match._id }, { owner: participant._id });

    res.socket.server.io.emit("broadcast", {
      type: "match-owner",
      data: { match: user.match, owner: participant },
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
