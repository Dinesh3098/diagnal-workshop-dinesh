const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: "AKIA6GBMFFL4KCUP5DVI", // AWS Access Key ID
    secretAccessKey: "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", // AWS Secret Access Key
    region: process.env.AWS_REGION, // AWS region
    signatureVersion: 'v4',
})


const awsS3GeneratePresignedUrl = async (
  path,
  operation = 'putObject', // Default value is putObject, for get use getObject
  expires
) => {
  const params = {
    Bucket: "diagnal-data", // Bucket name
    Key: path, // File name you want to save as in S3
    Expires: 60, // 60 seconds is the default value, change if you want
  }
  const uploadURL = await s3.getSignedUrlPromise(operation, params)
  return uploadURL
}

exports.handler = async (event) => {
  
  console.log("event",event)
  const { arguments: { path } } = event;
  try{
    
    const uploadURL = await awsS3GeneratePresignedUrl(path, 'putObject', 3600)
    console.log("uploadURL",uploadURL)
    return {
      path: path,
      uploadURL: uploadURL
    }
  }catch(error){
    console.error('Error in Lambda function:', error);
    throw new Error(error);
  }
};
