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
    // Adding createdBy/OrganizerId here ensures quick filtering for BRD Requirement #2
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Performance data for this specific tournament
    score: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["registered", "active", "disqualified", "completed"],
      default: "registered",
    },
  },
  { timestamps: true }
);

/**
 * BRD Logic Implementation:
 * A player can only be registered once per tournament.
 * This compound index prevents duplicate entries.
 */
TournamentPlayerSchema.index({ tournamentId: 1, playerId: 1 }, { unique: true });

/**
 * Performance Index:
 * Helps the Organizer quickly fetch "Past history" for their specific players.
 */
TournamentPlayerSchema.index({ createdBy: 1, playerId: 1 });

export default mongoose.models.TournamentPlayer || mongoose.model("TournamentPlayer", TournamentPlayerSchema);