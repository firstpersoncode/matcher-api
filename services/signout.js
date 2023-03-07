module.exports = async function signOut(req, res) {
  res.clearCookie("token", { expires: new Date(), path: "/" });
  res.status(200).send();
};
