import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
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

    // simpan payload ke req.user
    req.user = decoded;

    next();
  } catch (error) {

    // handle token expired secara spesifik
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


export const authorize = (...roles) => {
  return (req, res, next) => {

    // pastikan user sudah login
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi.",
      });
    }

    // cek apakah role user termasuk yang diizinkan
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk melakukan aksi ini.",
      });
    }

    next();
  };
};