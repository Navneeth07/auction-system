import mongoose from "mongoose";

const TournamentPlayerSchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 NEW FIELD – ROLE ASSIGNMENT
    role: {
      type: String,
      required: true,
      trim: true,
    },

    basePrice: {
      type: Number,
      required: true,
    },

    biddingPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["registered", "active", "disqualified", "completed"],
      default: "registered",
    },
  },
  { timestamps: true }
);

// Unique per tournament
TournamentPlayerSchema.index(
  { tournamentId: 1, playerId: 1 },
  { unique: true }
);

export default mongoose.models.TournamentPlayer ||
  mongoose.model("TournamentPlayer", TournamentPlayerSchema);
