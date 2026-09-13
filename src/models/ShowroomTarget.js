import mongoose from "mongoose";

const showroomTargetSchema = new mongoose.Schema(
  {
    showroomSlug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2026,
      index: true,
    },
    target: {
      type: Number,
      required: true,
      min: 0,
    },
    updateDate: {
      type: String,
      match: /^\d{4}-\d{2}-\d{2}$/,
      default: "",
    },
    achieved: {
      type: Number,
      required: true,
      min: 0,
    },
    lastYearAchievement: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

showroomTargetSchema.index({ showroomSlug: 1, month: 1, year: 1 }, { unique: true });

const ShowroomTarget = mongoose.model("ShowroomTarget", showroomTargetSchema);

export default ShowroomTarget;
