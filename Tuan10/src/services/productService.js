import { v4 as uuid } from "uuid";
import {
    scanProducts,
    getProductById,
    putProduct,
    updateProductAttributes,
    deleteProductById,
} from "./dynamoService.js";
import { uploadImage, deleteImage } from "./s3Service.js";

const normalizeProduct = (item = {}) => ({
    id: item.ID,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    imageKey: item.imageKey || "",
});

export const listProducts = async (searchText) => {
    const items = await scanProducts(searchText);
    return items.map(normalizeProduct).sort((a, b) => a.name.localeCompare(b.name));
};

export const findProduct = async (id) => {
    const item = await getProductById(id);
    return item ? normalizeProduct(item) : null;
};

export const createProduct = async ({ name, price, quantity }, imageFile) => {
    const { imageUrl, imageKey } = await uploadImage(imageFile);
    const product = {
        ID: uuid(),
        name,
        price,
        quantity,
        image: imageUrl,
        imageKey,
    };
    await putProduct(product);
    return normalizeProduct(product);
};

export const updateProduct = async (id, { name, price, quantity }, imageFile) => {
    const product = await getProductById(id);
    if (!product) {
        throw new Error("Không tìm thấy sản phẩm.");
    }

    let image = product.image;
    let imageKey = product.imageKey;
    if (imageFile) {
        await deleteImage(product.imageKey);
        const uploaded = await uploadImage(imageFile);
        image = uploaded.imageUrl;
        imageKey = uploaded.imageKey;
    }

    await updateProductAttributes(id, {
        name,
        price,
        quantity,
        image,
        imageKey,
    });
    return normalizeProduct({ ID: id, name, price, quantity, image, imageKey });
};

export const removeProduct = async (id) => {
    const product = await getProductById(id);
    if (!product) {
        return;
    }
    await deleteImage(product.imageKey);
    await deleteProductById(id);
};
