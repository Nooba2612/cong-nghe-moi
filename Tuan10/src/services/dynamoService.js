import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    ScanCommand,
    UpdateCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.PRODUCTS_TABLE || "Products";
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
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

export const getProductById = async (id) => {
    const result = await docClient.send(
        new GetCommand({
            TableName: TABLE_NAME,
            Key: { ID: id },
        }),
    );
    return result.Item;
};

export const putProduct = async (item) => {
    await docClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        }),
    );
    return item;
};

export const updateProductAttributes = async (id, attributes) => {
    const setExpressions = [];
    const attributeValues = {};
    const attributeNames = {};

    Object.entries(attributes).forEach(([key, value], index) => {
        const valueKey = `:val${index}`;
        const nameKey = `#attr${index}`;
        setExpressions.push(`${nameKey} = ${valueKey}`);
        attributeValues[valueKey] = value;
        attributeNames[nameKey] = key;
    });

    if (!setExpressions.length) {
        return getProductById(id);
    }

    await docClient.send(
        new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { ID: id },
            UpdateExpression: `SET ${setExpressions.join(", ")}`,
            ExpressionAttributeNames: attributeNames,
            ExpressionAttributeValues: attributeValues,
        }),
    );
    return getProductById(id);
};

export const deleteProductById = async (id) => {
    await docClient.send(
        new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { ID: id },
        }),
    );
};
