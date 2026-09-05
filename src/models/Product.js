// This file contains the product schema and model
// for the products collection in the database.

import mongoose from "mongoose";

const warrantySchema = new mongoose.Schema(
  {
    period: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    coverage: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Basic product information
    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Product technical information
    powerConsumption: {
      type: Number,
      required: true,
      min: 0,
    },

    powerConsumptionUnit: {
      type: String,
      default: "W",
      trim: true,
    },

    technology: {
      type: String,
      required: true,
      trim: true,
    },

    // Prices
    prices: {
      cash: {
        type: Number,
        required: true,
        min: 0,
      },

      hire: {
        type: Number,
        required: true,
        min: 0,
      },

      discount: {
        type: Number,
        min: 0,
      },
    },

    // Inventory
    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    // Images
    images: {
      type: [String],
      default: [],
    },

    // Category-specific specifications
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Warranty
    warranty: {
      type: [warrantySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance and preventing full collection scans
productSchema.index({ category: 1, brand: 1 });
productSchema.index({ "prices.cash": 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text", brand: "text", description: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;
