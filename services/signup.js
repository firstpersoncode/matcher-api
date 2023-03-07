const { genSalt, hash } = require("bcrypt");
const { sign } = require("jsonwebtoken");

const validateEmail = require("../utils/validateEmail");
const connect = require("../models/connect");
const getSession = require("../handlers/getSession");
const Participant = require("../models/Participant");

module.exports = async function signUp(req, res) {
  const currUser = await getSession(req.headers.token);
  if (currUser) return res.status(403).send("already signed in");

  let { name, email, password, address } = req.body;

  if (!validateEmail(email)) return res.status(403).send("invalid email");

  try {
    await connect();

    const salt = await genSalt(10);
    const encryptedPassword = await hash(password, salt);

    let user = new Participant({
      name,
      email,
      password: encryptedPassword,
      address,
    });

    user = await user.save();
    user = user._doc;

    const expiresIn = 60 * 60 * 24 * 7;

    const token = sign({ data: user._id }, process.env.JWT_KEY, {
      expiresIn,
    });

    user.type = "participant";
    delete user.password;

    res.status(200).send({ token, user });
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
