import { deleteCookie } from "cookies-next";

import getProvider from ".";

export default async function signout(req, res) {
  const currUser = await getProvider(req, res);
  if (!currUser) throw new Error("not signed in");

  deleteCookie("auth", { req, res });
}
