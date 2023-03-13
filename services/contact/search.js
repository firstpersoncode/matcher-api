const connect = require("../../models/connect");
const Participant = require("../../models/Participant");

module.exports = async function contactSearch(req, res) {
  let user = req.user;
  let { id } = req.query;

  try {
    await connect();
    let contact = await Participant.findOne({
      idString: id,
    })
      .select({ password: 0 })
      .populate("contacts.contact");

    if (!contact) return res.status(404).send("participant not found");

    let alreadyContact = contact.contacts.find(
      (item) => String(item.contact._id) === String(user._id)
    );

    if (alreadyContact) res.status(401).send("already in contact");

    res.status(200).send(contact);
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
