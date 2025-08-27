const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { checkCardPermission } = require("../middlewares/cardPermission");
const cardValidation = require("../validations/card.validation");
const cardController = require("../controllers/card.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    checkCardPermission("create"),
    validate(cardValidation.createCard),
    cardController.createCard
  )
  .get(
    auth(),
    checkCardPermission("read"),
    validate(cardValidation.getCards),
    cardController.getCards
  );

// Card reordering
router
  .route("/reorder")
  .patch(
    auth(),
    checkCardPermission("reorder"),
    validate(cardValidation.reorderCards),
    cardController.reorderCards
  );

router
  .route("/:cardId")
  .get(
    auth(),
    checkCardPermission("read"),
    validate(cardValidation.getCard),
    cardController.getCard
  )
  .patch(
    auth(),
    checkCardPermission("update"),
    validate(cardValidation.updateCard),
    cardController.updateCard
  )
  .delete(
    auth(),
    checkCardPermission("delete"),
    validate(cardValidation.deleteCard),
    cardController.deleteCard
  );

module.exports = router;
