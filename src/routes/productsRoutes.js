import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productsControllers.js";

import { authenticate, authorize } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// ambil semua produk
router.get("/", getAllProducts);

// ambil produk berdasarkan id
router.get("/:id", getProductById);

// tambah produk + upload gambar
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  upload.array("images", 5), // max 5 gambar
  createProduct
);

// update produk + optional upload gambar baru
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  upload.array("images", 5),
  updateProduct
);

// hapus produk
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteProduct
);

export default router;