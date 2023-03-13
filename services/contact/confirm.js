const connect = require("../../models/connect");
const Participant = require("../../models/Participant");

module.exports = async function contactConfirm(req, res) {
  let user = req.user;
  let { contactRef } = req.body;

  try {
    await connect();
    let contact = await Participant.findOne({
      _id: contactRef,
    })
      .select({ password: 0 })
      .populate("contacts.contact");

    if (!contact) return res.status(404).send("participant not found");

    let updatedContactContacts = contact.contacts.map((item) => {
      if (String(item.contact._id) === String(user._id)) item.status = "friend";
      return item;
    });

    contact.contacts = updatedContactContacts;

    let requester = await contact.save();

    let participant = await Participant.findOne({ _id: user._id })
      .select({ password: 0 })
      .populate("contacts.contact");

    let updatedParticipantContacts = participant.contacts.map((item) => {
      if (String(item.contact._id) === String(contactRef))
        item.status = "friend";
      return item;
    });

    participant.contacts = updatedParticipantContacts;

    let responser = await participant.save();

    res.socket.server.io
      .to(String(contactRef))
      .to(String(user._id))
      .emit("private", {
        type: "contact-confirm",
        data: {
          requester: requester._doc,
          responser: responser._doc,
        },
      });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
