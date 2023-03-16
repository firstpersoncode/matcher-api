const { verify } = require("jsonwebtoken");

const Participant = require("../models/Participant");
const populateMatch = require("./populateMatch");

module.exports = async function getSession(token) {
  if (!token) return null;

  const decoded = verify(token, process.env.JWT_KEY);

  let user = await Participant.findOne({ _id: decoded.data })
    .select({
      password: 0,
    })
    .populate([
      { path: "contacts.contact", select: "name email idString" },
      { path: "invitations", select: "name" },
    ]);

  if (!user) return null;

  if (user.sessionToken !== token) return null;

  user = user.toObject();

  user = await populateMatch(user);

  user.type = "participant";

  return user;
};
