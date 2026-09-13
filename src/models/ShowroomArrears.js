import mongoose from "mongoose";

const showroomArrearsSchema = new mongoose.Schema(
  {
    showroomSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2026,
    },
    outstanding: {
      type: Number,
      required: true,
      min: 0,
    },
    overdueAccounts: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    nextReview: {
      type: String,
      match: /^$|^\d{4}-\d{2}-\d{2}$/,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { timestamps: true }
);

showroomArrearsSchema.index({ showroomSlug: 1, year: 1 }, { unique: true });

const ShowroomArrears = mongoose.model("ShowroomArrears", showroomArrearsSchema);

export default ShowroomArrears;
