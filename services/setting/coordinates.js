const connect = require("../../models/connect");
const Participant = require("../../models/Participant");

module.exports = async function settingCoordinates(req, res) {
  let user = req.user;

  let { coordinates } = req.body;

  try {
    await connect();

    await Participant.updateOne(
      { _id: user._id },
      {
        location: { type: "Point", coordinates },
      }
    );

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
