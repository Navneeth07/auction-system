import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    emailId: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

//compound unique constraint
PlayerSchema.index({ phoneNumber: 1, createdBy: 1 }, { unique: true });

export default mongoose.models.Player || mongoose.model("Player", PlayerSchema);
