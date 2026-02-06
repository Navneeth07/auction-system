import mongoose from "mongoose";

const BidHistorySchema = new mongoose.Schema(
  {
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },

    tournamentPlayerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TournamentPlayer",
      required: true,
    },

    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    bidAmount: {
      type: Number,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.BidHistory ||
  mongoose.model("BidHistory", BidHistorySchema);
