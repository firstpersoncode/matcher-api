import { genSalt, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { setCookie } from "cookies-next";

import validateEmail from "utils/validateEmail";
import Participant from "models/Participant";
import getParticipant from ".";

export default async function signup(req, res) {
  const currUser = await getParticipant(req, res);
  if (currUser) throw new Error("already signed in");

  let { name, email, password, address } = req.body;

  if (!validateEmail(email)) throw new Error("invalid email");

  const salt = await genSalt(10);
  const encryptedPassword = await hash(password, salt);

  const user = await Participant.create({
    name,
    email,
    password: encryptedPassword,
    address,
  });

  const expiresIn = 60 * 60;

  const token = sign({ data: user._id }, process.env.JWT_KEY, {
    expiresIn,
  });

  setCookie("auth", token, {
    req,
    res,
    httpOnly: true,
    maxAge: expiresIn,
    sameSite: "strict",
    secure: true,
  });
}
