const connect = require("../../models/connect");
const Participant = require("../../models/Participant");

module.exports = async function matchRejectInvite(req, res) {
  let user = req.user;

  let { matchRef } = req.body;

  try {
    await connect();
    await Participant.updateOne(
      { _id: user._id },
      { $pull: { invitations: matchRef } }
    );

    res.socket.server.io.to(String(user._id)).emit("private", {
      type: "match-reject-invite",
      data: matchRef,
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
