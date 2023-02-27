const connect = require("../../../models/connect");
const listMatchByCoordinates = require("../../../handlers/listMatchByCoordinates");
const getParticipantSession = require("../../../handlers/getParticipantSession");

module.exports = async function participantMatchList(req, res) {
  let userCoordinates;

  try {
    await connect();
    let user = await getParticipantSession(req.headers.token);

    if (!user) {
      let { coords } = req.query;
      userCoordinates = coords.split(",").map((c) => Number(c));
    } else {
      userCoordinates = user.location.coordinates;
    }

    let now = new Date();

    let matches = await listMatchByCoordinates(userCoordinates, [
      {
        $match: {
          completed: false,
          end: { $gt: now },
        },
      },
    ]);

    res.status(200).send(matches);
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
