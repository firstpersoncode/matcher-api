const { ObjectId } = require("mongodb");
const listMatchByCoordinates = require("../../../handlers/listMatchByCoordinates");
const connect = require("../../../models/connect");
const Match = require("../../../models/Match");

module.exports = async function participantMatchJoin(req, res) {
  let user = req.user;
  if (user.match) return res.status(403).send("already have ongoing match");

  let { matchRef, count } = req.body;

  try {
    await connect();
    let match;
    let matches = await listMatchByCoordinates(
      user.location.coordinates,
      [
        {
          $match: {
            _id: new ObjectId(matchRef),
            completed: false,
            verified: false,
            owner: { $ne: user._id },
            "participants.participant": { $ne: user._id },
          },
        },
      ],
      { limit: 1 }
    );

    if (matches.length) match = matches[0];

    if (!match) return res.status(403).send("match not found");

    let totalParticipants =
      match.participants.map((p) => p.count).reduce((sum, a) => sum + a, 0) +
      Number(count);

    let remaining = Number(match.count) - totalParticipants;

    if (remaining < 0) return res.status(403).send("invalid participants");

    await Match.updateOne(
      {
        _id: match._id,
      },
      { $push: { participants: { participant: user._id, count } } }
    );

    res.socket.server.io.emit("broadcast", {
      type: "match-join",
      data: { match, participant: user, count },
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
