const connect = require("../../../models/connect");
const Match = require("../../../models/Match");
const listMatchByCoordinates = require("../../../handlers/listMatchByCoordinates");

module.exports = async function matchUpdateName(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");
  if (!user.matchOwner)
    return res.status(401).send("only owner can update match");
  if (user.match.verified)
    return res.status(403).send("match already verified");

  let { name } = req.body;

  try {
    await connect();

    let updateMatch = await Match.findOne({ _id: user.match._id });
    updateMatch.name = name;
    updateMatch = await updateMatch.save();

    let matches = await listMatchByCoordinates(
      user.location.coordinates,
      [{ $match: { _id: updateMatch._doc._id } }],
      { limit: 1 }
    );

    let match = matches[0];

    res.socket.server.io.emit("broadcast", {
      type: "match-update",
      data: match,
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
