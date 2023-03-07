const { verify } = require("jsonwebtoken");

const Participant = require("../models/Participant");
const populateMatch = require("./populateMatch");

module.exports = async function getSession(token) {
  if (!token) return null;

  const decoded = verify(token, process.env.JWT_KEY);

  let user = await Participant.findOne({ _id: decoded.data }).select({
    password: 0,
  });

  if (!user) return null;

  user = user.toObject();

  user = await populateMatch(user);

  user.type = "participant";

  return user;
};
