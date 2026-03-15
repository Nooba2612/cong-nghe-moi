import express from "express";
import multer from "multer";
import {
    listProducts,
    renderCreateForm,
    createProduct,
    renderEditForm,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", listProducts);
router.get("/new", renderCreateForm);
router.post("/", upload.single("image"), createProduct);
router.get("/:id/edit", renderEditForm);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
