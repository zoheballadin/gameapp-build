import mongoose from "mongoose";
import express from "express";
import User from "../../models/User.js";
import Game from "../../models/Game.js";
import { verifyToken } from "../../middleware/index.js";
import multer from "multer";
import fs from "fs/promises";
import {
  errorMiddleware,
  gameValidations,
} from "../../middleware/validation.js";

//multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets");
  },
  filename: function (req, file, cb) {
    let ext = file.mimetype.split("/")[1];
    cb(null, file.fieldname + "-" + Date.now() + "." + ext);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  "/add",
  verifyToken,
  upload.single("game"),
  gameValidations(),
  errorMiddleware,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image is required" });
      }

      let filename = req.file.filename;
      let imageUrl = `/api/images/${filename}`;

      let email = req.payload.email;
      let findEmail = await User.findOne({ email: email }).catch((err) =>
        console.log(err)
      );

      if (!findEmail) {
        await fs.unlink(`assets/${filename}`);
        return res.status(401).json({ error: "Unauthorized" });
      }
      let { title, description, platform, price, contactInfo } = req.body;
      let owner = findEmail._id;
      let game = new Game({
        title,
        description,
        platform,
        price,
        imageUrl,
        contactInfo,
        owner,
      });
      await game.save().catch((err) => {
        return res.status(200).json({err})
      });
      return res.status(200).json({ message: "Game added successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ err });
    }
  }
);

router.put(
  "/edit/:id",
  verifyToken,
  upload.single("game"),
  gameValidations(),
  errorMiddleware,
  async (req, res) => {
    try {
      let email = req.payload.email;
      let findEmail = await User.findOne({ email: email }).catch((err) =>
        console.log(err)
      );
      if (!findEmail) {
        if (req.file) await fs.unlink(`assets/${req.file.filename}`);
        return res.status(400).json({ error: "Unauthorized" });
      }

      let { title, platform, description, price, contactInfo } = req.body;
      let game = await Game.findOne({
        _id: req.params.id,
        owner: findEmail._id,
      });

      if (!game || !game.owner.equals(findEmail._id)) {
        if (req.file) await fs.unlink(`assets/${req.file.filename}`);
        return res.status(400).json({ error: "Game not found" });
      }

      if (!req.file) {
        await Game.updateOne(
          { _id: req.params.id, owner: findEmail._id },
          { $set: { title, platform, description, price, contactInfo } },
          { upsert: false }
        );
      } else {
        await fs.unlink(`assets/${game.imageUrl.split("/")[3]}`);
        await Game.updateOne(
          { _id: req.params.id, owner: findEmail.id },
          {
            $set: {
              title,
              platform,
              description,
              contactInfo,
              price,
              imageUrl: `/api/images/${req.file.filename}`,
            },
          }
        );
      }

      return res.status(200).json({ message: "Game updated successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/user", verifyToken, async (req, res) => {
  try {
    let email = req.payload.email;
    let findEmail = await User.findOne({ email: email });
    if (!findEmail) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    let games = await Game.find({ owner: findEmail._id });
    return res.status(200).json(games);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    let games = await Game.find();
    return res.status(200).json(games);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/game/:id", async (req, res) => {
  try {
    let id = req.params.id;
    let game = await Game.findOne({ _id: id });
    return res.status(200).json(game);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search/:query", async (req, res) => {
  const word = req.params.query;
  // const query = {$text: {$search: word}}
  // let games = await Game.find({$search :{
  //   "compound": {
  //     "should": [{
  //       "text": {
  //         "query": query,
  //         "path": "title"
  //       }
  //     }]}}})
  let games = await Game.find({ $text: { $search: word } });

  return res.status(200).json(games);
});

router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    let email = req.payload.email;
    let id = req.params.id;

    let findEmail = await User.findOne({ email: email });

    if (!findEmail) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // console.log(findEmail._id)
    let game = await Game.findOne({ _id: id, owner: findEmail._id });
    if (!game || !game.owner.equals(findEmail._id)) {
      return res.status(400).json({ error: "Game not found" });
    }

    let filename = game.imageUrl.split("/")[3];
    await Game.deleteOne({ _id: id, owner: findEmail._id });
    await fs.unlink(`assets/${filename}`);
    return res.status(200).json({ message: "Game deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
