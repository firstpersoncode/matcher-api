const connect = require("../models/connect");
const getParticipantSession = require("../handlers/getParticipantSession");
// const getProviderSession = require("../handlers/getProviderSession");

module.exports = function withSession(type = "participant") {
  return async (req, res, next) => {
    let user;
    try {
      await connect();
      switch (type) {
        case "participant":
          user = await getParticipantSession(req.headers.token);
          break;
        // case "provider":
        //   user = await getProviderSession(req.cookies);
        //   break;
        default:
          return res.status(405).send();
      }

      if (!user) return res.status(401).send();
      req.user = user;
      return next();
    } catch (err) {
      console.error(err.message || err);
      return res.status(500).send(err.message || err);
    }
  };
};
