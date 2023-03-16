const { ObjectId } = require("mongodb");
const listMatchByCoordinates = require("../../handlers/listMatchByCoordinates");
const connect = require("../../models/connect");
const Match = require("../../models/Match");
const Participant = require("../../models/Participant");

module.exports = async function matchInvite(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match doesn't exists");

  let totalParticipants = user.match.participants
    .map((p) => p.count)
    .reduce((sum, a) => sum + a, 0);

  let remaining = Number(user.match.count) - totalParticipants;

  if (remaining <= 0) return res.status(403).send("invalid participants");

  let { participantRef } = req.body;

  try {
    await connect();
    let participant = await Participant.findOne({ _id: participantRef }).select(
      { password: 0 }
    );

    if (!participant) return res.status(404).send("participant not found");

    let alreadyInvited = participant.invitations.find(
      (m) => String(m) === String(user.match._id)
    );

    if (alreadyInvited) return res.status(200).send();

    participant.invitations.push(user.match._id);

    let invitedParticipant = await participant.save();

    res.socket.server.io
      .to(String(invitedParticipant._doc._id))
      .emit("private", {
        type: "match-invite",
        data: user.match,
      });

    if (invitedParticipant._doc.fcmToken)
      await res.fcm.admin.messaging().send({
        token: invitedParticipant._doc.fcmToken,
        notification: {
          title: "Match invitation",
          body: `${user.name} is inviting you to join ${user.match.name}`,
          // imageUrl: null,
        },
      });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
