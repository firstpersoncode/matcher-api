const { verify } = require("jsonwebtoken");

const Participant = require("../models/Participant");
const getParticipantMatch = require("./getParticipantMatch");

module.exports = async function getParticipantSession(token) {
  if (!token) return null;

  const decoded = verify(token, process.env.JWT_KEY);

  let user = await Participant.findOne({ _id: decoded.data }).select({
    password: 0,
  });

  if (!user) return null;

  user = user.toObject();

  user = await getParticipantMatch(user);

  user.type = "participant";

  return user;
};
