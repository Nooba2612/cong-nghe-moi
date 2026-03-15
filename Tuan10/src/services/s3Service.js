import dotenv from "dotenv";
import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

dotenv.config();

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;
const s3Client = new S3Client({ region: REGION });

export const uploadImage = async (file) => {
    if (!file) {
        return { imageUrl: "", imageKey: "" };
    }
    if (!BUCKET) {
        throw new Error("Thiếu cấu hình AWS_S3_BUCKET.");
    }

    const key = `products/${uuid()}-${file.originalname}`;
    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        }),
    );

    const imageUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
    return { imageUrl, imageKey: key };
};

export const deleteImage = async (imageKey) => {
    if (!imageKey || !BUCKET) {
        return;
    }
    await s3Client.send(
        new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: imageKey,
        }),
    );
};
