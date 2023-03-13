const connect = require("../../models/connect");
const Participant = require("../../models/Participant");

module.exports = async function settingName(req, res) {
  let user = req.user;

  let { name } = req.body;

  try {
    await connect();

    await Participant.updateOne({ _id: user._id }, { name });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
