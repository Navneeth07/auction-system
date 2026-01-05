import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    auction_date: { type: Date, required: true },
    team_budget: { type: Number, required: true },

    min_players: { type: Number, required: true },
    max_players: { type: Number, required: true },

    players_role: {
      type: String,
      enum: ["batsman", "allrounder", "bowler"]
    },

    base_price: Number,
    bidding_price: Number
  },
  { timestamps: true }
);

export default mongoose.models.Tournament ||
  mongoose.model("Tournament", TournamentSchema);
