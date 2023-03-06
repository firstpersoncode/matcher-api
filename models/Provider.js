const mongoose = require("mongoose");

const ProviderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: false,
        default: "Point",
      },
      coordinates: { type: [Number], required: false, default: [0, 0] },
    },
    availabilities: [
      {
        day: {
          type: String,
          enum: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
          required: true,
        },
        start: { type: String, required: true },
        end: { type: String, required: true },
      },
    ],
    opening: { type: Date, required: false },
  },
  { timestamps: true }
);

ProviderSchema.index({ email: 1 }, { unique: true });
ProviderSchema.index({ location: "2dsphere" });

const Provider =
  mongoose.models.Provider || mongoose.model("Provider", ProviderSchema);

module.exports = Provider;
