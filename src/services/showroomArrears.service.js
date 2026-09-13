import ShowroomArrears from "../models/ShowroomArrears.js";

export const getShowroomArrears = async (showroomSlug, year) =>
  ShowroomArrears.findOne({ showroomSlug, year }).lean();

export const saveShowroomArrears = async (showroomSlug, year, data) =>
  ShowroomArrears.findOneAndUpdate(
    { showroomSlug, year },
    { showroomSlug, year, ...data },
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
