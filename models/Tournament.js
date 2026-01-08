import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    biddingPrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          return value < this.basePrice;
        },
        message: "Bidding price must be less than base price",
      },
    },

    minPlayers: {
      type: Number,
      required: true,
      min: 1,
    },

    maxPlayers: {
      type: Number,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.minPlayers;
        },
        message: "Max players must be greater than or equal to min players",
      },
    },

    rules: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Tournament ||
  mongoose.model("Tournament", TournamentSchema);
