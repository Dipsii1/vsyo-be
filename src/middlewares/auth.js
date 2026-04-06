import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";

// ==============================
// Middleware: Authenticate
// ==============================
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token sudah kedaluwarsa. Silakan login ulang.",
      });
    }
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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi.",
      });
    }

    // normalize ke uppercase — cocok dengan apapun yang ada di DB
    const userRole = req.user.role?.name?.toUpperCase();
    const allowed  = roles.map((r) => r.toUpperCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk melakukan aksi ini.",
      });
    }

    next();
  };
};