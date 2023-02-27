import Provider from "models/Provider";
import getProvider from ".";

export default async function setOpening(req, res) {
  const user = await getProvider(req, res);
  if (!user) throw new Error("not signed in");

  let { opening } = req.body;

  await Provider.updateOne(
    { _id: user._id },
    { opening: opening ? new Date(opening) : null }
  );
}
