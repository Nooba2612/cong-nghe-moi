import fs from "fs";
import path from "path";

const rootDir = path.resolve();
const uploadsDir = path.join(rootDir, "public", "uploads");

export const ensureUploadsDir = () => {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
};

export const getUploadsDir = () => uploadsDir;

const normalizeFilename = (name = "") => name.replace(/^\/+|^uploads\/+/, "");

export const toPublicUrl = (filename = "") => {
    if (!filename) {
        return "";
    }
    return `/uploads/${normalizeFilename(filename)}`;
};

export const deleteLocalImage = (imagePath = "") => {
    if (!imagePath) {
        return;
    }
    const filename = normalizeFilename(imagePath);
    const absolutePath = path.join(uploadsDir, filename);
    if (fs.existsSync(absolutePath)) {
        try {
            fs.unlinkSync(absolutePath);
        } catch (error) {
            console.warn(`Không thể xóa ảnh ${absolutePath}:`, error.message);
        }
    }
};
