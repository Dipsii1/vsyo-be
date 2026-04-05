import multer from "multer";
import path from "path";

// storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // folder penyimpanan
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
        cb(null, filename);
    },
});

// filter file (optional)
const fileFilter = (req, file, cb) => {
    const allowedExtensions = /jpeg|jpg|png|webp/;
    const ext = allowedExtensions.test(
        path.extname(file.originalname).toLowerCase()
    );
    if (ext) cb(null, true);
    else cb(new Error("Only images allowed!"));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // max 2MB
    },
});

export default upload;