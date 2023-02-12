import mongoose from "mongoose";

let gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,

    platform: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    contactInfo: {
      type: String,
      required: true
    }
    
  },
  { timestamps: true }
);

gameSchema.index({title: "text", platform: "text", description: "text"}, {name: "default"})

let Game = mongoose.model("Game", gameSchema, "games");
export default Game;
