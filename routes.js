const withSession = require("./middlewares/withSession");

const ping = require("./services/ping");
const signIn = require("./services/signin");
const signOut = require("./services/signout");
const signUp = require("./services/signup");

const matchCreate = require("./services/match/create");
const matchDelete = require("./services/match/delete");
const matchJoin = require("./services/match/join");
const matchLeave = require("./services/match/leave");
const matchList = require("./services/match/list");
const matchProvider = require("./services/match/provider");
const matchRemove = require("./services/match/remove");
const matchUpdate = require("./services/match/update");
const matchUpdateName = require("./services/match/update/name");
const matchUpdateProvider = require("./services/match/update/provider");
const matchUpdateSchedule = require("./services/match/update/schedule");
const matchUpdateParticipant = require("./services/match/update/participant");

const messageAnnounce = require("./services/message/announce");
const messageList = require("./services/message/list");
const messagePost = require("./services/message/post");
const messageUnAnnounce = require("./services/message/unannounce");
const settingCoordinates = require("./services/setting/coordinates");

module.exports = (app) => {
  // Setup routes, middleware, and handlers

  app.get("/api/v1/ping", ping);
  app.get("/api/v1/session", withSession(), (req, res) =>
    res.status(200).send(req.user)
  );
  app.post("/api/v1/signin", signIn);
  app.delete("/api/v1/signout", withSession(), signOut);
  app.post("/api/v1/signup", signUp);
  app.post("/api/v1/match/create", withSession(), matchCreate);
  app.delete("/api/v1/match/delete", withSession(), matchDelete);
  app.put("/api/v1/match/join", withSession(), matchJoin);
  app.put("/api/v1/match/leave", withSession(), matchLeave);
  app.get("/api/v1/match/list", matchList);
  app.get("/api/v1/match/provider", withSession(), matchProvider);
  app.put("/api/v1/match/remove", withSession(), matchRemove);
  app.put("/api/v1/match/update", withSession(), matchUpdate);
  app.put("/api/v1/match/update/name", withSession(), matchUpdateName);
  app.put("/api/v1/match/update/provider", withSession(), matchUpdateProvider);
  app.put("/api/v1/match/update/schedule", withSession(), matchUpdateSchedule);
  app.put(
    "/api/v1/match/update/participant",
    withSession(),
    matchUpdateParticipant
  );
  app.put("/api/v1/message/announce", withSession(), messageAnnounce);
  app.get("/api/v1/message/list", withSession(), messageList);
  app.post("/api/v1/message/post", withSession(), messagePost);
  app.put("/api/v1/message/unannounce", withSession(), messageUnAnnounce);
  app.put("/api/v1/setting/coordinates", withSession(), settingCoordinates);
};
