const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'ap-south-1' });
const s3 = new AWS.S3();
const csv = require('csv-parser');
const { TABLE_NAME } = process.env;

function toLowerCaseKeys(obj) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key.toLowerCase(), value]));
}

exports.handler = async (event) => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    const params = {
      Bucket: bucket,
      Key: key
    };

    const dataStream = s3.getObject(params).createReadStream();

    const results = await processCSV(dataStream);

    await batchWriteToDynamoDB(results);

    return `Successfully processed ${results.length} items.`;

  } catch (error) {
    console.error('Error in Lambda function:', error);
    throw new Error(error);
  }
};

async function processCSV(stream) {
  return new Promise((resolve, reject) => {
    const results = [];

    stream.pipe(csv())
      .on('data', (data) => {
        Object.keys(data).forEach(key => {
          if (!isNaN(data[key])) {
            data[key] = parseInt(data[key], 10);
          }
        });
        results.push(toLowerCaseKeys(data));
      })
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function batchWriteToDynamoDB(items) {
  const CHUNK_SIZE = 25;
  const chunks = [];

  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    chunks.push(items.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    const putRequests = chunk.map(item => ({
      PutRequest: {
        Item: item
      }
    }));

    const dbParams = {
      RequestItems: {
        [TABLE_NAME]: putRequests
      }
    };

    try {
      await docClient.batchWrite(dbParams).promise();
    } catch (dbError) {
      console.error('Error storing data in DynamoDB:', dbError);
      throw dbError;
    }
  }
}
