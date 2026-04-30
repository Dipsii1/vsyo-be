import { imagekit } from "../middlewares/upload.js";

// Upload single file to ImageKit
export const uploadToImageKit = async (file, index) => {
  try {
    const response = await imagekit.upload({
      file: file.buffer,
      fileName: file.originalname,
      folder: "/products",
    });

    return {
      url: response.url,
      fileId: response.fileId,
      isPrimary: index === 0,
    };
  } catch (error) {
    console.error("ImageKit upload error:", error);
    throw new Error("Gagal upload gambar ke ImageKit");
  }
};

// Delete images from ImageKit
export const deleteImagesFromImageKit = async (images) => {
  try {
    await Promise.all(
      images.map((img) => {
        if (img.fileId) {
          return imagekit.deleteFile(img.fileId);
        }
      })
    );
  } catch (error) {
    console.error("ImageKit delete error:", error);
  }
};