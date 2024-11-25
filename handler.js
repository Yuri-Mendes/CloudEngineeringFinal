/*Configurações das funções Lambda*/

//Criação das funções Lambda que implementam a lógica descrita.

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sqs = new AWS.SQS();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const SQS_EM_PREPARACAO_URL = process.env.SQS_EM_PREPARACAO_URL;
const SQS_PRONTO_URL = process.env.SQS_PRONTO_URL;
const DYNAMODB_TABLE = 'pedidos-pizzaria';

// Função Lambda que processa o evento do S3 e envia para a fila SQS

module.exports.processPedido = async (event) => {
  const record = event.Records[0];
  const s3Key = record.s3.object.key;
  const pedidoId = s3Key.split('/')[1];  // Extraindo o ID do pedido do S3 Key

  let queueUrl = SQS_EM_PREPARACAO_URL;

  // Escolher para qual fila enviar conforme pasta no S3
  if (s3Key.startsWith('pronto/')) {
    queueUrl = SQS_PRONTO_URL;
  }

  // Enviar mensagem para a fila SQS
  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({
      pedidoId: pedidoId,
      datetime: new Date().toISOString(),
    }),
  };

  try {
    await sqs.sendMessage(params).promise();
    console.log(`Mensagem enviada para a fila: ${queueUrl}`);
  } catch (err) {
    console.error('Erro ao enviar mensagem para a fila:', err);
  }
};

// Função Lambda que processa mensagens da fila 'em-preparacao-pizzaria'

module.exports.processSQSPreparacao = async (event) => {
  for (const record of event.Records) {
    const pedido = JSON.parse(record.body);
    const { pedidoId, datetime } = pedido;

    // Inserir no DynamoDB
    const params = {
      TableName: DYNAMODB_TABLE,
      Item: {
        pedido: pedidoId,
        datetime: datetime,
        status: 'Em Preparação',
      },
    };

    try {
      await dynamoDB.put(params).promise();
      console.log(`Pedido ${pedidoId} inserido como 'Em Preparação'`);
    } catch (err) {
      console.error('Erro ao inserir no DynamoDB:', err);
    }
  }
};

// Função Lambda que processa mensagens da fila 'pronto-pizzaria'

module.exports.processSQSPronto = async (event) => {
  for (const record of event.Records) {
    const pedido = JSON.parse(record.body);
    const { pedidoId, datetime } = pedido;

    // Inserir no DynamoDB
    const params = {
      TableName: DYNAMODB_TABLE,
      Item: {
        pedido: pedidoId,
        datetime: datetime,
        status: 'Pronto',
      },
    };

    try {
      await dynamoDB.put(params).promise();
      console.log(`Pedido ${pedidoId} inserido como 'Pronto'`);
    } catch (err) {
      console.error('Erro ao inserir no DynamoDB:', err);
      
    }
  }
};
