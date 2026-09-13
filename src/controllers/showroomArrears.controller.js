import ApiError from "../utils/ApiError.js";
import {
  getShowroomArrears,
  saveShowroomArrears,
} from "../services/showroomArrears.service.js";

const normalizeParam = (value) => String(value || "").trim().toLowerCase();

const validateParams = (req) => {
  const showroomSlug = normalizeParam(req.params.showroomSlug);
  const year = Number(req.query.year || 2026);

  if (!/^[a-z0-9-]+$/.test(showroomSlug) || !Number.isInteger(year) || year < 2026 || year > 2126) {
    throw new ApiError(400, "Invalid showroom or year");
  }

  return { showroomSlug, year };
};

export const getOne = async (req, res) => {
  const { showroomSlug, year } = validateParams(req);
  const arrears = await getShowroomArrears(showroomSlug, year);
  res.status(200).json({ success: true, data: arrears });
};

export const upsert = async (req, res) => {
  const { showroomSlug, year } = validateParams(req);
  const arrears = await saveShowroomArrears(showroomSlug, year, req.body);
  res.status(200).json({ success: true, data: arrears });
};
