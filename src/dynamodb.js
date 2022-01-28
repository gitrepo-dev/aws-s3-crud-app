// config dynamodb
const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const client = new DynamoDBClient({
    // accessKeyId: "aws_id",
    // secretAccessKeyId: "aws_key",
    // endpoint: "http://localhost:8000"
});

module.exports = client;