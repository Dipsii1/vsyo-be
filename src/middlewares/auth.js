import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";

// ==============================
// Middleware: Authenticate
// ==============================
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // cek apakah header ada dan format Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ambil user + role dari database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    // cek user
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    // simpan ke req.user
    req.user = user;

    next();
  } catch (error) {

    // handle token expired
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token sudah kedaluwarsa. Silakan login ulang.",
      });
    }

    // handle token invalid
    return res.status(401).json({
      success: false,
      message: "Token tidak valid.",
    });
  }
};

// ==============================
// Middleware: Authorize
// ==============================
export const authorize = (...roles) => {
  return (req, res, next) => {

    // pastikan user sudah login
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi.",
      });
    }

    // ambil role dari database
    const userRole = req.user.role?.name;

    // cek apakah role diizinkan
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk melakukan aksi ini.",
      });
    }

    next();
  };
};