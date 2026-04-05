import prisma from "../config/prismaClient.js";



// get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: products
        })
    } catch (error) {
        console.error("Error retrieving products:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving products"
        });
    }
}


// get product by id
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Product retrieved successfully",
            data: product
        });
    } catch (error) {
        console.error("Error retrieving product:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving product"
        });
    }
}


// create new product 

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


        //  validasi input
        if (!name || !description || !price || !stock || !size || !color || !material || !shopeeUrl) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // buat produk baru
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: stock ? parseInt(stock) : 0,
                size,
                color,
                material,
                shopeeUrl,
                createdById: req.user.id,
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
            message: "Error creating product"
        });
    }
}


// update product by id
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

        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product tidak ditemukan",
            });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                name: name ?? existingProduct.name,
                description: description ?? existingProduct.description,
                price: price ? parseFloat(price) : existingProduct.price,
                stock: stock ? parseInt(stock) : existingProduct.stock,
                size: size ?? existingProduct.size,
                color: color ?? existingProduct.color,
                material: material ?? existingProduct.material,
                shopeeUrl: shopeeUrl ?? existingProduct.shopeeUrl,
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

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        
        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product tidak ditemukan",
            });
        }

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

export { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };