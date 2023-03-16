const connect = require("../../models/connect");
const Message = require("../../models/Message");
const Participant = require("../../models/Participant");

module.exports = async function privateMessagePost(req, res) {
  let user = req.user;

  let { text, recipientRef } = req.body;

  try {
    await connect();

    let recipient = await Participant.findOne({ _id: recipientRef }).select({
      password: 0,
    });

    if (!recipient) return res.status(404).send("recipient not found");

    let newChat = new Message();
    newChat.text = text;
    newChat.type = "private-chat";
    newChat.owner = user._id;
    newChat.recipient = recipient._id;

    newChat = await newChat.save();

    res.socket.server.io
      .to(String(user._id))
      .to(String(recipient._id))
      .emit("private", {
        type: "private-message-post",
        data: { ...newChat._doc, owner: user, recipient },
      });

    if (recipient.fcmToken)
      await res.fcm.admin.messaging().send({
        token: recipient.fcmToken,
        notification: {
          title: user.name,
          body: text,
          // imageUrl: null,
        },
        android: { collapse_key: user._id, priority: "high" },
      });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
