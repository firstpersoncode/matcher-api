const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
        default: "Point",
      },
      coordinates: { type: [Number], required: false, default: [0, 0] },
    },
    contacts: [
      {
        contact: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Participant",
          unique: true,
          required: true,
        },
        status: {
          type: String,
          enum: ["friend", "waiting-req", "waiting-res"],
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

ParticipantSchema.index({ email: 1 }, { unique: true });
ParticipantSchema.index({ location: "2dsphere" });

const Participant =
  mongoose.models.Participant ||
  mongoose.model("Participant", ParticipantSchema);

module.exports = Participant;
