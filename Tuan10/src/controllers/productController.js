import {
    listProducts as listProductsService,
    createProduct as createProductService,
    findProduct,
    updateProduct as updateProductService,
    removeProduct,
} from "../services/productService.js";

const mapFormPayload = (body) => ({
    name: body.name?.trim(),
    price: Number(body.price) || 0,
    quantity: Number(body.quantity) || 0,
});

export const listProducts = async (req, res, next) => {
    try {
        const searchText = req.query.q?.trim() || "";
        const products = await listProductsService(searchText);
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
        title: "Thêm sản phẩm mới",
    });
};

export const createProduct = async (req, res, next) => {
    try {
        const payload = mapFormPayload(req.body);
        await createProductService(payload, req.file);
        res.redirect("/products?success=Đã thêm sản phẩm");
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
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const payload = mapFormPayload(req.body);
        await updateProductService(req.params.id, payload, req.file);
        res.redirect("/products?success=Đã cập nhật sản phẩm");
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        await removeProduct(req.params.id);
        res.redirect("/products?success=Đã xóa sản phẩm");
    } catch (error) {
        next(error);
    }
};
