import express from "express";
import User from "../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../../middleware/index.js";
import { registerValidations, errorMiddleware, loginValidations } from "../../middleware/validation.js";
const router = express.Router();

router.post("/register",registerValidations(), errorMiddleware, async (req, res) => {
  try {
    let { fullname, email, phone, password, password2 } = req.body;
    let findEmail = await User.findOne({ email: email }).catch((err) =>
      console.log(error)
    );

    if (findEmail) {
      return res.status(409).json({ error: "User already exists" });
    }

    let hashpassword = await bcrypt.hash(password, 12);
    let user = new User({
      fullname,
      email,
      phone,
      password: hashpassword,
      role: "user",
    });
    await user.save().catch((err) => {
      return res.status(400).json({ error: "Failed to save to DB", err });
    });
    return res.status(200).json({ message: "User Registered Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login",loginValidations(), errorMiddleware, async (req, res) => {
  try {
    let { email, password } = req.body;
    let findEmail = await User.findOne({ email: email });
    if (!findEmail) {
      return res.status(401).json({ error: "User does not exist" });
    }
    let match = await bcrypt.compare(password, findEmail.password);

    if (!match) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    let payload = { email: email, role: findEmail.role };

    let token = jwt.sign(payload, "zoheballadin", {expiresIn: "24h"});
    return res
      .status(200)
      .json({ message: "Successfully logged in", role: findEmail.role, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete", verifyToken, async (req, res) => {
  let findEmail = await User.findOne({ email: req.payload.email });
  if (!findEmail) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  await User.deleteOne({ email: findEmail.email });
  return res.status(200).json({ message: "Deleted account successfully" });
});

router.get("/auth", verifyToken, async (req, res) => {
  try {
    return res.status(200).json(req.payload);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    console.log(req.params.id)
    let user = await User.findOne({ _id: req.params.id });
    if(!user){
        return res.status(400).json({error: "User does not exist"})
    }
    console.log(user)
    return res
      .status(200)
      .json({
        name: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
