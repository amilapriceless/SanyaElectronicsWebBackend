import express from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/product.controller.js";

import asyncHandler from "../utils/asyncHandler.js";

import validate from "../middleware/validate.middleware.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("systemAdmin"),
  validate(createProductSchema),
  asyncHandler(create)
);

router.get(
  "/",
  asyncHandler(getAll)
);

router.get(
  "/:id",
  asyncHandler(getOne)
);

router.put(
  "/:id",
  requireAuth,
  requireRole("systemAdmin"),
  validate(updateProductSchema),
  asyncHandler(update)
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("systemAdmin"),
  asyncHandler(remove)
);

export default router;