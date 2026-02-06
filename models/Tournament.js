import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
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
          return value <= this.basePrice;
        },
        message: "Bidding price must be less than or equal to base price",
      },
    },
  },
  { _id: false }, // optional (no separate _id for each role)
);

const TournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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

    roles: {
      type: [RoleSchema],
      validate: {
        validator: function (roles) {
          return roles.length > 0;
        },
        message: "At least one role is required",
      },
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Tournament ||
  mongoose.model("Tournament", TournamentSchema);
