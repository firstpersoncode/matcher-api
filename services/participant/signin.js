const { compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");

const connect = require("../../models/connect");
const getParticipantSession = require("../../handlers/getParticipantSession");
const getParticipantMatch = require("../../handlers/getParticipantMatch");
const Participant = require("../../models/Participant");

module.exports = async function participantSignin(req, res) {
  const currUser = await getParticipantSession(req.headers.token);
  if (currUser) return res.status(403).send("already signed in");

  let { email, password } = req.body;

  try {
    await connect();

    let user = await Participant.findOne({
      email,
    });

    if (!user) return res.status(404).send("user not found");

    user = user.toObject();

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) return res.status(403).send("invalid password");

    const expiresIn = 60 * 60 * 24 * 7;

    const token = sign({ data: user._id }, process.env.JWT_KEY, {
      expiresIn,
    });

    user = await getParticipantMatch(user);

    user.type = "participant";
    delete user.passowrd;

    res.status(200).send({ token, user });
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
