import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { setCookie } from "cookies-next";

import Provider from "models/Provider";
import getProvider from ".";

export default async function signin(req, res) {
  const currUser = await getProvider(req, res);
  if (currUser) throw new Error("already signed in");

  let { email, password } = req.body;

  const user = await Provider.findOne({
    email,
  });

  if (!user) throw new Error("user not found");

  const passwordMatch = await compare(password, user.password);

  if (!passwordMatch) throw new Error("invalid password");

  const expiresIn = 60 * 60 * 24 * 7;

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
