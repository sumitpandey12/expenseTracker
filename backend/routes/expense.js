const express = require("express");

const router = express.Router();

const exprenseController = require("../controllers/expense");

//middlewares
const Authenticate = require("../middleware/auth");

router.post("/", Authenticate, exprenseController.postExpense);
router.get("/", Authenticate, exprenseController.getExpenses);
router.delete("/:id", Authenticate, exprenseController.deleteExpense);
router.get("/download", Authenticate, exprenseController.downloadExpense);

module.exports = router;
