import express from "express";
import {
  getAll,
  getOne,
  upsert,
} from "../controllers/showroomTarget.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.middleware.js";
import { showroomTargetSchema } from "../validators/showroomTarget.validator.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);
router.get("/:showroomSlug", asyncHandler(getAll));
router.get("/:showroomSlug/:month", asyncHandler(getOne));
router.put(
  "/:showroomSlug/:month",
  validate(showroomTargetSchema),
  asyncHandler(upsert)
);

export default router;
