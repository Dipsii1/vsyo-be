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
        sizes:true,
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
        sizes:true
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
      sizes,
      color,
      material,
      shopeeUrl,
    } = req.body;

    if (!name || !price || !sizes || !color || !shopeeUrl) {
      return res.status(400).json({
        success: false,
        message: "Field wajib tidak lengkap",
      });
    }

    const parsedSizes = JSON.parse(sizes); // dari FormData

    const files = req.files || [];

    const imageData = files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      isPrimary: index === 0,
    }));

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 0,
        color,
        material,
        shopeeUrl,
        createdById: req.user.id,

        sizes: {
          create: parsedSizes.map((s) => ({
            size: s.toUpperCase(),
          })),
        },

        ...(imageData.length > 0 && {
          images: { create: imageData },
        }),
      },
      include: {
        images: true,
        sizes: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Product berhasil dibuat",
      data: product,
    });
  } catch (error) {
    console.error(error);
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
      sizes,
      color,
      material,
      shopeeUrl,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        images: true,
        sizes: true,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product tidak ditemukan",
      });
    }

    const files = req.files || [];
    let imageData = [];

    if (files.length > 0) {
      imageData = files.map((file, index) => ({
        url: `/uploads/${file.filename}`,
        isPrimary: index === 0,
      }));

      existingProduct.images.forEach((img) => {
        const filePath = path.join("uploads", path.basename(img.url));
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    const parsedSizes = sizes ? JSON.parse(sizes) : null;

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name ?? existingProduct.name,
        description: description ?? existingProduct.description,
        price: price ? parseFloat(price) : existingProduct.price,
        stock: stock ? parseInt(stock) : existingProduct.stock,
        color: color ?? existingProduct.color,
        material: material ?? existingProduct.material,
        shopeeUrl: shopeeUrl ?? existingProduct.shopeeUrl,

        ...(parsedSizes && {
          sizes: {
            deleteMany: {}, // hapus lama
            create: parsedSizes.map((s) => ({
              size: s.toUpperCase(),
            })),
          },
        }),

        ...(imageData.length > 0 && {
          images: {
            deleteMany: {},
            create: imageData,
          },
        }),
      },
      include: {
        images: true,
        sizes: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Product berhasil diupdate",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(error);
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