import express from "express";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import {
    getProductsPage,
    renderCreateForm,
    handleCreateProduct,
    renderEditForm,
    handleUpdateProduct,
    handleDeleteProduct,
    showProductDetail,
} from "../controllers/productController.js";
import { getUploadsDir } from "../services/fileService.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, getUploadsDir()),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || ".jpg";
        cb(null, `${uuid()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 4 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Chỉ hỗ trợ tải lên tập tin hình ảnh"));
        }
        cb(null, true);
    },
});

router.get("/", getProductsPage);
router.get("/new", renderCreateForm);
router.post("/", upload.single("image"), handleCreateProduct);
router.get("/:id", showProductDetail);
router.get("/:id/edit", renderEditForm);
router.put("/:id", upload.single("image"), handleUpdateProduct);
router.delete("/:id", handleDeleteProduct);

export default router;
