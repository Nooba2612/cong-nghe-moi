import { listProducts, createProduct, findProduct, updateProduct, removeProduct } from "../services/productService.js";

const buildPayload = (body = {}) => ({
    name: body.name?.trim(),
    price: body.price,
    unit_in_stock: body.unit_in_stock,
});

const validatePayload = ({ name, price, unit_in_stock }, missingImage) => {
    const errors = [];
    if (!name) {
        errors.push("Tên sản phẩm không được để trống");
    }
    if (price === undefined || Number(price) < 0) {
        errors.push("Giá bán phải là số không âm");
    }
    if (unit_in_stock === undefined || Number(unit_in_stock) < 0) {
        errors.push("Số lượng tồn phải là số không âm");
    }
    if (missingImage) {
        errors.push("Vui lòng chọn hình ảnh");
    }
    return errors;
};

export const getProductsPage = async (req, res, next) => {
    try {
        const searchText = req.query.q?.trim() || "";
        const products = await listProducts(searchText);
        res.render("products/index", {
            title: "Danh sách sản phẩm",
            products,
            searchText,
        });
    } catch (error) {
        next(error);
    }
};

export const renderCreateForm = (req, res) => {
    res.render("products/create", {
        title: "Thêm sản phẩm",
        values: req.body || {},
        errors: [],
    });
};

export const handleCreateProduct = async (req, res, next) => {
    const payload = buildPayload(req.body);
    try {
        const errors = validatePayload(payload, !req.file);
        if (errors.length) {
            return res.status(400).render("products/create", {
                title: "Thêm sản phẩm",
                values: payload,
                errors,
            });
        }
        await createProduct(payload, req.file);
        res.redirect("/products?success=Đã thêm sản phẩm mới");
    } catch (error) {
        next(error);
    }
};

export const renderEditForm = async (req, res, next) => {
    try {
        const product = await findProduct(req.params.id);
        if (!product) {
            return res.redirect("/products?error=Sản phẩm không tồn tại");
        }
        res.render("products/edit", {
            title: "Chỉnh sửa sản phẩm",
            product,
            errors: [],
        });
    } catch (error) {
        next(error);
    }
};

export const handleUpdateProduct = async (req, res, next) => {
    const payload = buildPayload(req.body);
    try {
        const errors = validatePayload(payload, false);
        if (errors.length) {
            const product = await findProduct(req.params.id);
            return res.status(400).render("products/edit", {
                title: "Chỉnh sửa sản phẩm",
                product: { ...product, ...payload },
                errors,
            });
        }
        await updateProduct(req.params.id, payload, req.file);
        res.redirect("/products?success=Đã cập nhật sản phẩm");
    } catch (error) {
        next(error);
    }
};

export const handleDeleteProduct = async (req, res, next) => {
    try {
        await removeProduct(req.params.id);
        res.redirect("/products?success=Đã xóa sản phẩm");
    } catch (error) {
        next(error);
    }
};

export const showProductDetail = async (req, res, next) => {
    try {
        const product = await findProduct(req.params.id);
        if (!product) {
            return res.redirect("/products?error=Sản phẩm không tồn tại");
        }
        res.render("products/show", {
            title: product.name,
            product,
        });
    } catch (error) {
        next(error);
    }
};
