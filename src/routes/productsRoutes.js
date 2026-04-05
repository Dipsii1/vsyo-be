import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsControllers.js";

import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// ==============================
// Public routes
// ==============================

// ambil semua produk
router.get("/", getAllProducts);

// ambil produk berdasarkan id
router.get("/:id", getProductById);

// ==============================
// Protected routes (ADMIN)
// ==============================

// tambah produk
router.post("/", authenticate, authorize("ADMIN"), createProduct);

// update produk
router.put("/:id", authenticate, authorize("ADMIN"), updateProduct);

// hapus produk
router.delete("/:id", authenticate, authorize("ADMIN"), deleteProduct);

export default router;