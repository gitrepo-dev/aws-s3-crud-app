const db = require("./dynamodb")
const {
    GetItemCommand,
    PutItemCommand,
    DeleteItemCommand,
    ScanItemCommand
} = require("@aws-sdk/client-dynamodb")
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");



// get all post
const getAllPost = async (e) => {
    const response = { statusCode: 200 }
    try {
        const { Items } = await db.send(new ScanItemCommand(params)) // send params to dynamo client to get data
        console.log({ Items })
        response.body = JSON.stringify({
            message: "Successfully retrieved all posts.",
            data: Items.map((Item)=> unmarshall(Item)),
            Items
        })
    } catch (e) {
        response.body = JSON.stringify({
            statusCode: 500,
            message: `Server error 500`,
            error: e.message,
            stack: e.stack,
            data: {}
        })
    }

    return response;
}



// get one post
const getPost = async (e) => {
    const response = { statusCode: 200 }
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME, // table name from the serverless file
            Key: marshall({ postId: e.pathParameters.postId }) // conver it in dynamo formate
        }
        const { Item } = await db.send(new GetItemCommand(params)) // send params to dynamo client to get data
        console.log({ Item })
        response.body = JSON.stringify({
            message: "Successfully retrieved post.",
            data: (Item) ? unmarshall(Item) : {} //if item or date is defind then decode in json formate or send empty object
        })
    } catch (e) {
        response.body = JSON.stringify({
            statusCode: 500,
            message: `Server error 500`,
            error: e.message,
            stack: e.stack,
            data: {}
        })
    }

    return response;
}



// create post
const createPost = async (e) => {
    const response = { statusCode: 201 }
    try {
        const obj = JSON.parse(e.body)
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME, // table name from the serverless file
            Item: marshall(obj || {}) // conver it in dynamo formate
        }
        const res = await db.send(new PutItemCommand(params))
        console.log(res)
        response.body = JSON.stringify({
            message: "Successfully created post.",
            data: res
        })
    } catch (e) {
        response.body = JSON.stringify({
            statusCode: 500,
            message: `Server error 500`,
            error: e.message,
            stack: e.stack,
            data: {}
        })
    }

    return response;
}



// update post
const updatePost = async (e) => {
    const response = { statusCode: 202 }
    try {
        const obj = JSON.parse(e.body)
        const objKeys = Object.keys(obj);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ postId: e.pathParameters.postId }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };
        const res = await db.send(new PutItemCommand(params))
        console.log(res)
        response.body = JSON.stringify({
            message: "Successfully updated post.",
            data: res
        })
    } catch (e) {
        response.body = JSON.stringify({
            statusCode: 500,
            message: `Server error 500`,
            error: e.message,
            stack: e.stack,
            data: {}
        })
    }

    return response;
}



// delete post
const deletePost = async (e) => {
    const response = { statusCode: 200 }
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ postId: e.pathParameters.postId })
        };
        const res = await db.send(new DeleteItemCommand(params))
        response.body = JSON.stringify({
            message: "Successfully delete post.",
            data: res
        })
        console.log(res)
    } catch (e) {
        response.body = JSON.stringify({
            statusCode: 500,
            message: `Server error 500`,
            error: e.message,
            stack: e.stack,
            data: {}
        })
    }

    return response;
}


module.exports = { getAllPost, getPost, createPost, updatePost, deletePost}