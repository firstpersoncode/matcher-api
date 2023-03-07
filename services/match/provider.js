const connect = require("../../models/connect");
const Provider = require("../../models/Provider");

module.exports = async function matchProvider(req, res) {
  let user = req.user;

  let now = new Date();

  try {
    await connect();

    let providers = await Provider.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: user.location.coordinates,
          },
          distanceField: "distance",
          spherical: true,
        },
      },
      {
        $match: {
          $and: [{ opening: { $exists: true } }, { opening: { $lte: now } }],
          availabilities: { $exists: true, $ne: [] },
        },
      },
      { $project: { password: 0 } },
    ]);

    res.status(200).send(providers);
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).send(err.message || err);
  }
};
