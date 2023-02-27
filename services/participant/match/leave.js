const connect = require("../../../models/connect");
const Match = require("../../../models/Match");

module.exports = async function participantMatchLeave(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");
  if (user.matchOwner) return res.status(401).send("owner cannot leave match");
  if (user.match.verified)
    return res.status(403).send("match already verified");

  try {
    await connect();

    await Match.updateOne(
      {
        _id: user.match._id,
      },
      { $pull: { participants: { participant: user._id } } }
    );

    res.socket.server.io.emit("broadcast", {
      type: "match-leave",
      data: { match: user.match, participant: user },
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
