/*Configurações das funções Lambda*/

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sqs = new AWS.SQS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const SQS_EM_PREPARACAO_URL = process.env.SQS_EM_PREPARACAO_URL;
const SQS_PRONTO_URL = process.env.SQS_PRONTO_URL;
const DYNAMODB_TABLE = 'pedidos-pizzaria';
