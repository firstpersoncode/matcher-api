const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ["chat", "announcement"],
      required: false,
      default: "chat",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
  },
  { timestamps: true }
);

MessageSchema.index({ created: -1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

module.exports = Message;