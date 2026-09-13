import ShowroomTarget from "../models/ShowroomTarget.js";

export const getShowroomTargets = async (showroomSlug, year) =>
  ShowroomTarget.find({ showroomSlug, year }).sort({ month: 1 }).lean();

export const getShowroomTarget = async (showroomSlug, month, year) =>
  ShowroomTarget.findOne({ showroomSlug, month, year }).lean();

export const saveShowroomTarget = async (showroomSlug, month, year, data) =>
  ShowroomTarget.findOneAndUpdate(
    { showroomSlug, month, year },
    { showroomSlug, month, year, ...data },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
