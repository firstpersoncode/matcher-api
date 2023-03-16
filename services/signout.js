const connect = require("../models/connect");
const Participant = require("../models/Participant");

module.exports = async function signOut(req, res) {
  let user = req.user;
  try {
    await connect();
    await Participant.updateOne(
      { _id: user._id },
      { fcmToken: null, sessionToken: null }
    );
    res.clearCookie("token", { expires: new Date(), path: "/" });
    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
