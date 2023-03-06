const Match = require("../models/Match");

module.exports = async function listMatchByCoordinates(
  coordinates,
  filter,
  options = {}
) {
  let { limit, sort } = options;

  let matches = await Match.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates,
        },
        distanceField: "distance",
        spherical: true,
      },
    },

    ...filter,

    {
      $lookup: {
        from: "providers",
        localField: "provider",
        foreignField: "_id",
        as: "provider",
      },
    },
    {
      $unwind: "$provider",
    },

    {
      $lookup: {
        from: "participants",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },

    {
      $lookup: {
        from: "messages",
        localField: "announcements",
        foreignField: "_id",
        as: "announcements",
      },
    },

    {
      $lookup: {
        from: "participants",
        localField: "participants.participant",
        foreignField: "_id",
        as: "participantsParticipant",
      },
    },
    {
      $project: {
        name: 1,
        start: 1,
        end: 1,
        completed: 1,
        verified: 1,
        count: 1,
        location: 1,
        owner: 1,
        provider: 1,
        announcements: 1,
        distance: 1,
        participants: {
          $map: {
            input: "$participants",
            as: "participant",
            in: {
              participant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$participantsParticipant",
                      as: "parti",
                      cond: {
                        $eq: ["$$parti._id", "$$participant.participant"],
                      },
                    },
                  },
                  0,
                ],
              },
              count: "$$participant.count",
            },
          },
        },
      },
    },

    {
      $project: {
        "owner.password": 0,
        "provider.password": 0,
        "provider.availabilities": 0,
        "participants.participant.password": 0,
      },
    },
    ...(sort ? [{ $sort: sort }] : [{ $sort: { distance: 1 } }]),
    ...(limit ? [{ $limit: limit }] : []),
  ]);

  return matches;
};
