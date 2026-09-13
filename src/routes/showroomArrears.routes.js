import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getOne, upsert } from "../controllers/showroomArrears.controller.js";
import { showroomArrearsSchema } from "../validators/showroomArrears.validator.js";

const router = express.Router();

router.use(requireAuth);
router.get("/:showroomSlug", asyncHandler(getOne));
router.put("/:showroomSlug", validate(showroomArrearsSchema), asyncHandler(upsert));

export default router;
