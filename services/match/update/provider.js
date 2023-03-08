const {
  differenceInHours,
  format,
  isAfter,
  isBefore,
  isPast,
  setHours,
  setMinutes,
  startOfDay,
} = require("date-fns");

const connect = require("../../../models/connect");
const Match = require("../../../models/Match");
const Provider = require("../../../models/Provider");
const listMatchByCoordinates = require("../../../handlers/listMatchByCoordinates");

module.exports = async function matchUpdateProvider(req, res) {
  let user = req.user;
  if (!user.match) return res.status(403).send("match not found");
  if (!user.matchOwner)
    return res.status(401).send("only owner can update match");
  if (user.match.verified)
    return res.status(403).send("match already verified");

  let { start, end, providerRef } = req.body;

  let invalidDateRange =
    isPast(new Date(start)) ||
    isAfter(new Date(start), new Date(end)) ||
    differenceInHours(new Date(end), new Date(start)) > 5;

  if (invalidDateRange) return res.status(403).send("invalid date range");

  let now = new Date();

  try {
    await connect();

    let provider = await Provider.findOne({
      _id: providerRef,
      $and: [{ opening: { $exists: true } }, { opening: { $lte: now } }],
      availabilities: { $exists: true, $ne: [] },
    }).select({
      password: 0,
    });

    if (!provider) return res.status(403).send("provider not found");

    let selectedDate = startOfDay(new Date(start));
    let selectedDay = format(new Date(selectedDate), "iii").toLowerCase();

    let selectedAvailability = provider.availabilities.find(
      (a) => a.day === selectedDay
    );

    let startHour = setHours(
      selectedDate,
      selectedAvailability.start.split(":")[0]
    );
    startHour = setMinutes(startHour, selectedAvailability.start.split(":")[1]);
    let endHour = setHours(
      selectedDate,
      selectedAvailability.end.split(":")[0]
    );
    endHour = setMinutes(endHour, selectedAvailability.end.split(":")[1]);

    let withinAvailability =
      isAfter(new Date(start), startHour) && isBefore(new Date(end), endHour);

    if (!withinAvailability)
      return res.status(403).send("schedule is not within availabilities");

    let updateMatch = await Match.findOne({ _id: user.match._id });
    updateMatch.start = start;
    updateMatch.end = end;
    updateMatch.location = provider.location;
    updateMatch.provider = provider._id;
    updateMatch = await updateMatch.save();

    let matches = await listMatchByCoordinates(
      user.location.coordinates,
      [{ $match: { _id: updateMatch._doc._id } }],
      { limit: 1 }
    );

    let match = matches[0];

    res.socket.server.io.emit("broadcast", {
      type: "match-update",
      data: match,
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
