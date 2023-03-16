const connect = require("../../models/connect");
const Message = require("../../models/Message");

module.exports = async function messagePost(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");

  let { text } = req.body;

  try {
    await connect();

    let newChat = new Message();
    newChat.text = text;
    newChat.type = "chat";
    newChat.owner = user._id;
    newChat.match = user.match._id;

    newChat = await newChat.save();

    res.socket.server.io.to(String(user.match._id)).emit("private", {
      type: "message-post",
      data: { ...newChat._doc, owner: user, match: user.match },
    });

    await res.fcm.admin.messaging().sendMulticast({
      tokens: user.match.participants
        .filter((p) => p.participant.fcmToken)
        .map((p) => p.participant.fcmToken),
      notification: {
        title: user.match.name,
        body: `${user.name}: ${text}`,
        // imageUrl: null,
      },
      android: { collapse_key: user.match._id, priority: "normal" },
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
