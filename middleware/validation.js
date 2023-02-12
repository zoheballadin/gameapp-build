import fs from "fs/promises";
import { body, validationResult } from "express-validator";

const registerValidations = () => {
  return [
    body("email", "Please enter a valid email").isEmail(),
    body("fullname", "Name must contain at least 5 characters").isLength({
      min: 5,
    }),
    body("phone", "Phone number must contain at least 10 characters").isLength({
      min: 10,
    }),
    body("password", "Password must be at least 5 characters long").isLength({
      min: 7,
    }),
    body("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }

      // Indicates the success of this synchronous custom validator
      return true;
    }),
  ];
};

const loginValidations = () => {
  return [
    body("email", "Please enter a valid email").isEmail(),
    body("password", "Password must contain at least 7 characters").isLength({
      min: 7,
    }),
  ];
};

const gameValidations = () => {
  return [
    body("title", "Title must contain at least 3 characters").isLength({
      min: 3,
    }),
    body("platform", "Platform must be selected").notEmpty(),
    body("price", "Enter a valid price").isNumeric(),
    body("contactInfo", "Contact info must contain at least 5 characters").isLength({min: 5})
  ];
};

const errorMiddleware = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (req.file) {
      await fs.unlink(`assets/${req.file.filename}`);
    }
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export { errorMiddleware, registerValidations, loginValidations , gameValidations};
