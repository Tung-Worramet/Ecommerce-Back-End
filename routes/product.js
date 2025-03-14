const express = require("express");
const router = express.Router();
// import controller
const {
  create,
  list,
  read,
  update,
  remove,
  listby,
  searchFilters,
  createImages,
  removeImages,
} = require("../controllers/product");
// import middleware
const { authCheck, adminCheck } = require("../middlewares/authCheck");

router.post("/product", create);
router.get("/products/:count", list);
router.get("/product/:id", read);
router.put("/product/:id", update);
router.delete("/product/:id", remove);
router.post("/productby", listby);
router.post("/search/filters", searchFilters);

router.post("/images", authCheck, adminCheck, createImages);
router.post("/removeimages", authCheck, adminCheck, removeImages);

module.exports = router;
