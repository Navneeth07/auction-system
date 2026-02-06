import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: String,
      required: true,
      trim: true,
    },

    shortCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 5,
    },

    totalPurse: {
      type: Number,
      required: true,
      min: 0,
    },

    remainingPurse: {
      type: Number,
      required: true,
      min: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
  },
  { timestamps: true }
);

// Unique per tournament
TeamSchema.index(
  { shortCode: 1, tournamentId: 1 },
  { unique: true }
);

export default mongoose.models.Team ||
  mongoose.model("Team", TeamSchema);
