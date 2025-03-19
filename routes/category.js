const express = require("express");
const router = express.Router();
// import controller
const { create, list, remove } = require("../controllers/category");
// import middleware
const { authCheck, adminCheck } = require("../middlewares/authCheck");

/**
 * @swagger
 * tags:
 *   name: Category
 */

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *     responses:
 *       200:
 *         description: Category successfully created
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized (Requires authentication)
 */
router.post("/category", authCheck, adminCheck, create);

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Successfully retrieved list of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       500:
 *         description: Internal server error
 */
router.get("/category", list);

/**
 * @swagger
 * /api/category/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Category]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID to delete
 *     responses:
 *       200:
 *         description: Successfully deleted category
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Unauthorized (Requires authentication)
 */
router.delete("/category/:id", authCheck, adminCheck, remove);

module.exports = router;
