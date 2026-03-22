import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    ScanCommand,
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.PRODUCTS_TABLE || "Products";
const REGION = process.env.AWS_REGION || "ap-southeast-1";
const PRIMARY_KEY = process.env.PRODUCT_PRIMARY_KEY || "ID";

const dynamoClient = new DynamoDBClient({
    region: REGION,
    endpoint: process.env.DYNAMODB_ENDPOINT,
});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

export const scanProducts = async (searchText = "") => {
    const params = { TableName: TABLE_NAME };
    if (searchText) {
        params.FilterExpression = "contains(#name, :searchText)";
        params.ExpressionAttributeNames = { "#name": "name" };
        params.ExpressionAttributeValues = { ":searchText": searchText };
    }
    const { Items = [] } = await docClient.send(new ScanCommand(params));
    return Items;
};

export const getProduct = async (id) => {
    const { Item } = await docClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: { [PRIMARY_KEY]: id },
        }),
    );
    return Item;
};

export const createProduct = async (item) => {
    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        }),
    );
    return item;
};

export const updateProductAttributes = async (id, attrs) => {
    const attributeNames = {};
    const attributeValues = {};
    const expressions = [];

    Object.entries(attrs).forEach(([key, value], index) => {
        const nameKey = `#attr${index}`;
        const valueKey = `:val${index}`;
        attributeNames[nameKey] = key;
        attributeValues[valueKey] = value;
        expressions.push(`${nameKey} = ${valueKey}`);
    });

    if (!expressions.length) {
        return getProduct(id);
    }

    await docClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { [PRIMARY_KEY]: id },
            UpdateExpression: `SET ${expressions.join(", ")}`,
            ExpressionAttributeNames: attributeNames,
            ExpressionAttributeValues: attributeValues,
        }),
    );

    return getProduct(id);
};

export const deleteProduct = async (id) => {
    await docClient.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { [PRIMARY_KEY]: id },
        }),
    );
};
