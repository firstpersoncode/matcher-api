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
const messageAnnounce = require("./services/message/announce");
const messageList = require("./services/message/list");
const messagePost = require("./services/message/post");
const messageUnAnnounce = require("./services/message/unannounce");
const settingCoordinates = require("./services/setting/coordinates");

module.exports = (app) => {
  // Setup routes, middleware, and handlers

  app.get("/ping", ping);
  app.get("/session", withSession(), (req, res) =>
    res.status(200).send(req.user)
  );
  app.post("/signin", signIn);
  app.delete("/signout", withSession(), signOut);
  app.post("/signup", signUp);
  app.post("/match/create", withSession(), matchCreate);
  app.delete("/match/delete", withSession(), matchDelete);
  app.put("/match/join", withSession(), matchJoin);
  app.put("/match/leave", withSession(), matchLeave);
  app.get("/match/list", matchList);
  app.get("/match/provider", withSession(), matchProvider);
  app.put("/match/remove", withSession(), matchRemove);
  app.put("/match/update", withSession(), matchUpdate);
  app.put("/message/announce", withSession(), messageAnnounce);
  app.get("/message/list", withSession(), messageList);
  app.post("/message/post", withSession(), messagePost);
  app.put("/message/unannounce", withSession(), messageUnAnnounce);
  app.put("/setting/coordinates", withSession(), settingCoordinates);
};
