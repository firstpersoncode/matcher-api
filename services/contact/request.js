const connect = require("../../models/connect");
const Participant = require("../../models/Participant");

module.exports = async function contactConfirm(req, res) {
  let user = req.user;
  let { contactRef } = req.body;

  let alreadyContact = user.contacts.find(
    (item) => String(item.contact._id) === String(contactRef)
  );

  if (alreadyContact) return res.status(200).send();

  try {
    await connect();
    let contact = await Participant.findOne({
      _id: contactRef,
    })
      .select({ password: 0 })
      .populate("contacts.contact");

    if (!contact) return res.status(404).send("participant not found");

    alreadyContact = contact.contacts.find(
      (item) => String(item.contact._id) === String(user._id)
    );

    if (alreadyContact) return res.status(200).send();

    contact.contacts.push({
      contact: user._id,
      status: "waiting-req",
    });

    let responser = await contact.save();

    let participant = await Participant.findOne({ _id: user._id })
      .select({ password: 0 })
      .populate("contacts.contact");

    participant.contacts.push({
      contact: contactRef,
      status: "waiting-res",
    });

    let requester = await participant.save();

    res.socket.server.io
      .to(String(user._id))
      .to(String(contactRef))
      .emit("private", {
        type: "contact-request",
        data: {
          requester: requester._doc,
          responser: responser._doc,
        },
      });

    if (responser._doc.fcmToken)
      await res.fcm.admin.messaging().send({
        token: responser._doc.fcmToken,
        notification: {
          title: "Friend request",
          body: `${requester._doc.name} is requesting you to be friend!`,
          // imageUrl: null,
        },
      });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
