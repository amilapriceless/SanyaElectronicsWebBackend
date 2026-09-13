import mongoose from "mongoose";

const authCredentialSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["primary", "officer", "systemAdmin"],
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AuthCredential = mongoose.model("AuthCredential", authCredentialSchema);

export default AuthCredential;
