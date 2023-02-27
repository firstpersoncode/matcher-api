module.exports = async function participantSignout(req, res) {
  res.clearCookie("token", { expires: new Date(), path: "/" });
  res.status(200).send();
};
