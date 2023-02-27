const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  completed: { type: Boolean, required: false, default: false },
  verified: { type: Boolean, required: false, default: false },
  count: { type: Number, required: true },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: false,
      default: "Point",
    },
    coordinates: { type: [Number], required: false, default: [0, 0] },
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true,
  },
  participants: [
    {
      participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Participant",
        required: true,
      },
      count: { type: Number, required: true },
    },
  ],

  created: { type: Date, required: false, default: new Date() },
});

MatchSchema.index({ location: "2dsphere" });

const Match = mongoose.models.Match || mongoose.model("Match", MatchSchema);

module.exports = Match;
