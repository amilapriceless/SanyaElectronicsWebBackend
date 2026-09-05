import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";

import ApiError from "../utils/ApiError.js";
import cache from "../utils/cache.js";

const parsePositiveInteger = (value, fallback, maximum) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return fallback;
  }

  return Math.min(Math.max(Number(value), 1), maximum);
};

const parseFilter = (value, maxLength = 100) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export const create = async (req, res) => {
  const product = await createProduct(req.body);

  // Invalidate product cache on creation
  cache.invalidatePrefix("products:");

  res.status(201).json({
    success: true,
    data: product,
  });
};

export const getAll = async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1, 100000);
  const limit = parsePositiveInteger(req.query.limit, 20, 100);
  const category = parseFilter(req.query.category);
  const brand = parseFilter(req.query.brand);
  const search = parseFilter(req.query.search);

  const cacheKey = `products:all:${JSON.stringify({
    page,
    limit,
    category,
    brand,
    search,
  })}`;

  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.status(200).json({
      success: true,
      data: cachedData,
      cached: true,
    });
  }

  const result = await getProducts({
    page,
    limit,
    category,
    brand,
    search,
  });

  // Cache response for 5 minutes (300s)
  cache.set(cacheKey, result, 300);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getOne = async (req, res) => {
  const { id } = req.params;
  const cacheKey = `products:id:${id}`;

  const cachedProduct = cache.get(cacheKey);
  if (cachedProduct) {
    return res.status(200).json({
      success: true,
      data: cachedProduct,
      cached: true,
    });
  }

  const product = await getProductById(id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  cache.set(cacheKey, product, 300);

  res.status(200).json({
    success: true,
    data: product,
  });
};

export const update = async (req, res) => {
  const product = await updateProduct(req.params.id, req.body);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Invalidate product cache on update
  cache.invalidatePrefix("products:");

  res.status(200).json({
    success: true,
    data: product,
  });
};

export const remove = async (req, res) => {
  const product = await deleteProduct(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Invalidate product cache on delete
  cache.invalidatePrefix("products:");

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};
