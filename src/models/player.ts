import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["batsman", "allrounder", "bowler"],
      required: true
    },
    email: String,
    phone: String,

    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    },

    sold_price: Number
  },
  { timestamps: true }
);

export default mongoose.models.Player ||
  mongoose.model("Player", PlayerSchema);
