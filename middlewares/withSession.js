const connect = require("../models/connect");
const getSession = require("../handlers/getSession");

module.exports = function withSession() {
  return async (req, res, next) => {
    try {
      await connect();
      let user = await getSession(req.headers.token);
      if (!user) return res.status(401).send();
      req.user = user;
      return next();
    } catch (err) {
      console.error(err.message || err);
      return res.status(500).send(err.message || err);
    }
  };
};
