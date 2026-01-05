import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    owner_name: String,

    tournament_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true
    },

    short_code: String,
    budget_left: Number
  },
  { timestamps: true }
);

export default mongoose.models.Team ||
  mongoose.model("Team", TeamSchema);
