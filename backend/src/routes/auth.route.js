const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const authValidation = require("../validations/auth.validation");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post(
  "/send-code",
  validate(authValidation.sendVerificationCode),
  authController.sendVerificationCode
);

router.post("/signup", validate(authValidation.signup), authController.signup);

router.post("/signin", validate(authValidation.signin), authController.signin);
router.post(
  "/refresh-token",
  validate(authValidation.refreshToken),
  authController.refreshToken
);
router.get("/validate-token", auth(), authController.validateToken);
router.post("/logout", authController.logout);

module.exports = router;
