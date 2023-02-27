import { getCookie } from "cookies-next";
import { verify } from "jsonwebtoken";

import Participant from "models/Participant";
import Match from "models/Match";

export default async function getProvider(req, res) {
  const token = getCookie("auth", { req, res });
  if (!token) return null;

  const decoded = verify(token, process.env.JWT_KEY);

  let user = await Participant.findOne({ _id: decoded.data }).select({
    password: 0,
  });

  if (!user) return null;

  user = user.toObject();

  let match = await Match.findOne({
    $or: [
      {
        user: decoded.data,
      },
      {
        "participants.participant": decoded.data,
      },
    ],
    completed: false,
    // end: { $gt: new Date() },
  }).populate([
    { path: "participant", select: "name" },
    { path: "provider", select: "name location address" },
    { path: "participants.participant", select: "name" },
  ]);

  if (match) user.match = match;

  user.type = "provider";

  return user;
}
