const withSession = require("./middlewares/withSession");

const ping = require("./services/ping");
const participantSignin = require("./services/participant/signin");
const participantSignout = require("./services/participant/signout");
const participantSignup = require("./services/participant/signup");
const participantMatchCreate = require("./services/participant/match/create");
const participantMatchDelete = require("./services/participant/match/delete");
const participantMatchJoin = require("./services/participant/match/join");
const participantMatchLeave = require("./services/participant/match/leave");
const participantMatchList = require("./services/participant/match/list");
const participantMatchOwner = require("./services/participant/match/owner");
const participantMatchProvider = require("./services/participant/match/provider");
const participantMatchRemove = require("./services/participant/match/remove");
const participantMatchUpdate = require("./services/participant/match/update");
const participantMessageAnnounce = require("./services/participant/message/announce");
const participantMessageAnnouncement = require("./services/participant/message/announcement");
const participantMessageChat = require("./services/participant/message/chat");
const participantMessagePin = require("./services/participant/message/pin");
const participantMessagePost = require("./services/participant/message/post");
const participantMessageUnanounce = require("./services/participant/message/unannounce");
const participantMessageUnpin = require("./services/participant/message/unpin");
const participantSettingCoordinates = require("./services/participant/setting/coordinates");

module.exports = (app) => {
  // Setup routes, middleware, and handlers

  app.get("/ping", ping);
  app.get("/participant/session", withSession(), (req, res) =>
    res.status(200).send(req.user)
  );
  app.post("/participant/signin", participantSignin);
  app.get("/participant/signout", withSession(), participantSignout);
  app.post("/participant/signup", participantSignup);
  app.post("/participant/match/create", withSession(), participantMatchCreate);
  app.delete(
    "/participant/match/delete",
    withSession(),
    participantMatchDelete
  );
  app.put("/participant/match/join", withSession(), participantMatchJoin);
  app.get("/participant/match/leave", withSession(), participantMatchLeave);
  app.get("/participant/match/list", participantMatchList);
  app.get("/participant/match/owner", withSession(), participantMatchOwner);
  app.get(
    "/participant/match/provider",
    withSession(),
    participantMatchProvider
  );
  app.get("/participant/match/remove", withSession(), participantMatchRemove);
  app.put("/participant/match/update", withSession(), participantMatchUpdate);
  app.get(
    "/participant/message/announce",
    withSession(),
    participantMessageAnnounce
  );
  app.get("/participant/message/announcement", participantMessageAnnouncement);
  app.get("/participant/message/chat", withSession(), participantMessageChat);
  app.get("/participant/message/pin", withSession(), participantMessagePin);
  app.post("/participant/message/post", withSession(), participantMessagePost);
  app.get(
    "/participant/message/unannounce",
    withSession(),
    participantMessageUnanounce
  );
  app.get("/participant/message/unpin", withSession(), participantMessageUnpin);
  app.put(
    "/participant/setting/coordinates",
    withSession(),
    participantSettingCoordinates
  );
};
