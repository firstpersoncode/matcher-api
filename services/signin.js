const { compare } = require("bcrypt");
const { sign } = require("jsonwebtoken");

const connect = require("../models/connect");
const getSession = require("../handlers/getSession");
const populateMatch = require("../handlers/populateMatch");
const Participant = require("../models/Participant");

module.exports = async function signIn(req, res) {
  const currUser = await getSession(req.headers.token);
  if (currUser) return res.status(403).send("already signed in");

  let { email, password } = req.body;

  try {
    await connect();

    let user = await Participant.findOne({
      email,
    }).populate([
      { path: "contacts.contact", select: "name email idString" },
      { path: "invitations", select: "name" },
    ]);

    if (!user) return res.status(404).send("user not found");

    user = user.toObject();

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) return res.status(403).send("invalid password");

    const expiresIn = 60 * 60 * 24 * 7;

    const token = sign({ data: user._id }, process.env.JWT_KEY, {
      expiresIn,
    });

    user = await populateMatch(user);

    user.type = "participant";
    delete user.password;

    res.status(200).send({ token, user });
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
