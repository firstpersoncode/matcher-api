const mongoose = require("mongoose");
const randomId = require("../utils/randomId");

const ParticipantSchema = new mongoose.Schema(
  {
    idString: { type: String, unique: true, default: randomId(10) },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    sessionToken: { type: String, required: false },
    fcmToken: { type: String, required: false },
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
          required: true,
        },
        status: {
          type: String,
          enum: ["friend", "waiting-req", "waiting-res"],
          required: true,
        },
      },
    ],
    invitations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
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
