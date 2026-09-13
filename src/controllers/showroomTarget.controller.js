import ApiError from "../utils/ApiError.js";
import {
  getShowroomTarget,
  getShowroomTargets,
  saveShowroomTarget,
} from "../services/showroomTarget.service.js";

const normalizeParam = (value) => String(value || "").trim().toLowerCase();
const DEFAULT_YEAR = 2026;

const normalizeYear = (value) => {
  const year = Number(value || DEFAULT_YEAR);
  if (!Number.isInteger(year) || year < DEFAULT_YEAR || year > DEFAULT_YEAR + 100) {
    throw new ApiError(400, "Invalid year");
  }
  return year;
};

const validateParams = (req) => {
  const showroomSlug = normalizeParam(req.params.showroomSlug);
  const month = normalizeParam(req.params.month);

  if (!/^[a-z0-9-]+$/.test(showroomSlug) || (month && !/^[a-z]+$/.test(month))) {
    throw new ApiError(400, "Invalid showroom or month");
  }

  return { showroomSlug, month };
};

export const getAll = async (req, res) => {
  const { showroomSlug } = validateParams(req);
  const targets = await getShowroomTargets(showroomSlug, normalizeYear(req.query.year));

  res.status(200).json({ success: true, data: targets });
};

export const getOne = async (req, res) => {
  const { showroomSlug, month } = validateParams(req);
  const target = await getShowroomTarget(showroomSlug, month, normalizeYear(req.query.year));

  res.status(200).json({ success: true, data: target });
};

export const upsert = async (req, res) => {
  const { showroomSlug, month } = validateParams(req);
  const target = await saveShowroomTarget(showroomSlug, month, normalizeYear(req.query.year), req.body);

  res.status(200).json({ success: true, data: target });
};
