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

const connect = require("../../models/connect");
const Match = require("../../models/Match");
const Provider = require("../../models/Provider");
const listMatchByCoordinates = require("../../handlers/listMatchByCoordinates");

module.exports = async function matchCreate(req, res) {
  let user = req.user;
  if (user.match) return res.status(403).send("already have ongoing match");

  let { name, start, end, providerRef, count, pcount } = req.body;

  let invalidDateRange =
    isPast(new Date(start)) ||
    isAfter(new Date(start), new Date(end)) ||
    differenceInHours(new Date(end), new Date(start)) > 5;

  if (invalidDateRange) return res.status(403).send("invalid date range");

  let invalidCounts =
    Number(pcount) === 0 ||
    Number(count) === 0 ||
    Number(pcount) > Number(count);

  if (invalidCounts) return res.status(403).send("invalid counts");

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

    let newMatch = new Match();
    newMatch.name = name;
    newMatch.start = start;
    newMatch.end = end;
    newMatch.owner = user._id;
    newMatch.location = provider.location;
    newMatch.provider = provider._id;
    newMatch.count = count;

    let participants = [];
    participants[0] = {
      participant: user._id,
      count: pcount,
    };

    newMatch.participants = participants;
    newMatch = await newMatch.save();

    let matches = await listMatchByCoordinates(
      user.location.coordinates,
      [{ $match: { _id: newMatch._doc._id } }],
      { limit: 1 }
    );

    let match = matches[0];

    res.socket.server.io.emit("broadcast", {
      type: "match-create",
      data: match,
    });

    res.status(200).send();
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
