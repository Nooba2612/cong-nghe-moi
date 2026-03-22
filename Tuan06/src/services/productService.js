import { v4 as uuid } from "uuid";
import {
    scanProducts,
    getProduct,
    createProduct as putProduct,
    updateProductAttributes,
    deleteProduct as deleteProductRecord,
} from "./dynamoService.js";
import { deleteLocalImage, toPublicUrl } from "./fileService.js";

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getItemId = (item = {}) => item.id || item.ID;

const normalizeItem = (item = {}) => ({
    id: getItemId(item),
    name: item.name,
    price: toNumber(item.price),
    unit_in_stock: toNumber(item.unit_in_stock),
    url_image: item.url_image || "",
});

export const listProducts = async (searchText = "") => {
    const items = await scanProducts(searchText);
    return items.map(normalizeItem).sort((a, b) => a.name.localeCompare(b.name, "vi"));
};

export const findProduct = async (id) => {
    const item = await getProduct(id);
    return item ? normalizeItem(item) : null;
};

export const createProduct = async ({ name, price, unit_in_stock }, file) => {
    const imageUrl = file ? toPublicUrl(file.filename) : "";
    const id = uuid();
    const product = {
        ID: id,
        name,
        price: toNumber(price),
        unit_in_stock: toNumber(unit_in_stock),
        url_image: imageUrl,
        created_at: new Date().toISOString(),
    };
    await putProduct(product);
    return normalizeItem({ ...product, id });
};

export const updateProduct = async (id, { name, price, unit_in_stock }, file) => {
    const current = await getProduct(id);
    if (!current) {
        throw new Error("Sản phẩm không tồn tại");
    }

    const recordId = getItemId(current);
    let imageUrl = current.url_image || "";
    if (file) {
        deleteLocalImage(imageUrl);
        imageUrl = toPublicUrl(file.filename);
    }

    await updateProductAttributes(recordId, {
        name,
        price: toNumber(price, current.price),
        unit_in_stock: toNumber(unit_in_stock, current.unit_in_stock),
        url_image: imageUrl,
        updated_at: new Date().toISOString(),
    });

    return normalizeItem({ ...current, id: recordId, name, price, unit_in_stock, url_image: imageUrl });
};

export const removeProduct = async (id) => {
    const current = await getProduct(id);
    if (!current) {
        return;
    }
    const recordId = getItemId(current);
    deleteLocalImage(current.url_image);
    await deleteProductRecord(recordId);
};
