import Provider from "models/Provider";
import getProvider from ".";

export default async function setAddress(req, res) {
  const user = await getProvider(req, res);
  if (!user) throw new Error("not signed in");

  let { address } = req.body;

  await Provider.updateOne({ _id: user._id }, { address });
}
