// Product service supports either MongoDB or an explicit in-memory fallback.
import Product from "../models/Product.js";

const useInMemory = process.env.USE_INMEM_DB === "true";
const store = [];
let idCounter = 1;

const paginate = (items, page, limit) => {
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const start = (parsedPage - 1) * parsedLimit;
  return {
    products: items.slice(start, start + parsedLimit),
    total: items.length,
    page: parsedPage,
    totalPages: Math.ceil(items.length / parsedLimit),
  };
};

export const createProduct = async (data) => {
  if (!useInMemory) return Product.create(data);

  const now = new Date().toISOString();
  const product = { _id: String(idCounter++), ...data, createdAt: now, updatedAt: now };
  store.unshift(product);
  return product;
};

export const getProducts = async ({ page = 1, limit = 20, category, brand, search } = {}) => {
  if (!useInMemory) {
    const query = {};
    const normalizedCategory = category === "All Products" ? "All" : category;
    if (normalizedCategory && normalizedCategory !== "All") query.category = normalizedCategory;
    if (brand) query.brand = brand;
    if (search) query.$text = { $search: search };

    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (parsedPage - 1) * parsedLimit;
    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit).lean(),
      Product.countDocuments(query),
    ]);
    return { products, total, page: parsedPage, totalPages: Math.ceil(total / parsedLimit) };
  }

  let products = store.slice();
  if (category && category !== "All" && category !== "All Products") {
    products = products.filter((product) => product.category === category);
  }
  if (brand) products = products.filter((product) => product.brand === brand);
  if (search) {
    const query = String(search).toLowerCase();
    products = products.filter((product) =>
      [product.name, product.productCode, product.brand, product.description]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }
  return paginate(products, page, limit);
};

export const getProductById = async (id) => {
  if (!useInMemory) return Product.findById(id).lean();
  return store.find((product) => product._id === String(id)) || null;
};

export const updateProduct = async (id, data) => {
  if (!useInMemory) {
    return Product.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true }).lean();
  }

  const index = store.findIndex((product) => product._id === String(id));
  if (index === -1) return null;
  store[index] = { ...store[index], ...data, updatedAt: new Date().toISOString() };
  return store[index];
};

export const deleteProduct = async (id) => {
  if (!useInMemory) return Product.findByIdAndDelete(id).lean();

  const index = store.findIndex((product) => product._id === String(id));
  if (index === -1) return null;
  return store.splice(index, 1)[0];
};
