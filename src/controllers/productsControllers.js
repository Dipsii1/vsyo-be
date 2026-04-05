import prisma from "../config/prismaClient.js";
import fs from "fs";
import path from "path";


// GET ALL PRODUCTS

const getAllProducts = async (req, res) => {
  try {
    // ambil semua produk + relasi images
    const products = await prisma.product.findMany({
      include: {
        images: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error retrieving products:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving products",
    });
  }
};


// GET PRODUCT BY ID

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // ambil produk + images
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
      },
    });

    // cek jika tidak ditemukan
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error retrieving product:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving product",
    });
  }
};


// CREATE PRODUCT

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      size,
      color,
      material,
      shopeeUrl,
    } = req.body;

    // validasi field wajib
    if (!name || !price || !size || !color || !shopeeUrl) {
      return res.status(400).json({
        success: false,
        message: "Field wajib tidak lengkap",
      });
    }

    // ambil file dari multer (default array kosong)
    const files = req.files || [];

    // mapping data image jika ada
    const imageData =
      files.length > 0
        ? files.map((file, index) => ({
            url: `/uploads/${file.filename}`,
            isPrimary: index === 0, // gambar pertama jadi utama
          }))
        : [];

    // create product + images
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        size: size.toUpperCase(), // pastikan sesuai enum
        color,
        material,
        shopeeUrl,
        createdById: req.user.id,

        // hanya insert jika ada gambar
        ...(imageData.length > 0 && {
          images: {
            create: imageData,
          },
        }),
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product berhasil dibuat",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
    });
  }
};


// UPDATE PRODUCT

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      price,
      stock,
      size,
      color,
      material,
      shopeeUrl,
    } = req.body;

    // cek produk lama
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product tidak ditemukan",
      });
    }

    // ambil file baru dari multer
    const files = req.files || [];

    let imageData = [];

    // jika upload gambar baru
    if (files.length > 0) {
      imageData = files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        isPrimary: index === 0,
      }));

      // hapus file lama dari folder
      existingProduct.images.forEach((img) => {
        const filePath = path.join("uploads", path.basename(img.url));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // update data
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name ?? existingProduct.name,
        description: description ?? existingProduct.description,
        price: price ? parseFloat(price) : existingProduct.price,
        stock: stock ? parseInt(stock) : existingProduct.stock,
        size: size ? size.toUpperCase() : existingProduct.size,
        color: color ?? existingProduct.color,
        material: material ?? existingProduct.material,
        shopeeUrl: shopeeUrl ?? existingProduct.shopeeUrl,

        // replace images jika ada upload baru
        ...(imageData.length > 0 && {
          images: {
            deleteMany: {}, // hapus relasi lama
            create: imageData,
          },
        }),
      },
      include: {
        images: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product berhasil diupdate",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
    });
  }
};


// DELETE PRODUCT

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // ambil produk + images
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product tidak ditemukan",
      });
    }

    // hapus file dari folder uploads
    existingProduct.images.forEach((img) => {
      const filePath = path.join("uploads", path.basename(img.url));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // hapus produk (images ikut kehapus karena cascade)
    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: "Product berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
    });
  }
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};