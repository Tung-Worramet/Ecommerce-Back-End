const express = require("express");
const router = express.Router();
// import controller
const { create, list, remove } = require("../controllers/category");
// import middleware
const { authCheck, adminCheck } = require("../middlewares/authCheck");

router.post("/category", authCheck, adminCheck, create);
router.get("/category", list);
router.delete("/category/:id", authCheck, adminCheck, remove);

module.exports = router;
