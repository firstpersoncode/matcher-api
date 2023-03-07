const connect = require("../../models/connect");
const Match = require("../../models/Match");
const Participant = require("../../models/Participant");

module.exports = async function matchRemove(req, res) {
  let user = req.user;
  if (!user.match) res.status(403).send("match not found");
  if (!user.matchOwner)
    res.status(401).send("only owner can remove participant");
  if (user.match.verified) res.status(403).send("match already verified");

  let { participantRef } = req.body;

  try {
    await connect();

    let participant = await Participant.findOne({ _id: participantRef });

    if (!participant) return res.status(403).send("participant not found");

    await Match.updateOne(
      {
        _id: user.match._id,
      },
      { $pull: { participants: { participant: participant._id } } }
    );

    res.socket.server.io.emit("broadcast", {
      type: "match-remove",
      data: { match: user.match, participant },
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
