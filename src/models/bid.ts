import mongoose from "mongoose";

const BidSchema = new mongoose.Schema(
  {
    player_id: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    amount: { type: Number, required: true }
  },
  { timestamps: true }
);

export default mongoose.models.Bid ||
  mongoose.model("Bid", BidSchema);
