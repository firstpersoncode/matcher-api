const listMatchByCoordinates = require("./listMatchByCoordinates");

module.exports = async function populateMatch(participant) {
  if (!participant) return null;

  let matches = await listMatchByCoordinates(
    participant.location.coordinates,
    [
      {
        $match: {
          $and: [
            {
              $or: [
                {
                  owner: participant._id,
                },
                {
                  "participants.participant": participant._id,
                },
              ],
            },
            { completed: false },
          ],
        },
      },
    ],
    { limit: 1 }
  );

  if (matches.length) {
    let match = matches[0];
    participant.match = match;
    participant.matchOwner =
      String(match.owner._id) === String(participant._id);
  }

  return participant;
};
