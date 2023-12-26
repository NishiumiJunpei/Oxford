require('dotenv').config({ path: '.env.local' });

const AWS = require('aws-sdk');
const sharp = require('sharp');

// AWS S3の設定
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;
const maxFileSize = 300 * 1024; // 300KB

async function renameAndCompressS3Objects() {
  try {
    const objects = await listS3Objects('userData/1/');
    let processedCount = 0;

    for (let obj of objects) {
      const newKey = obj.Key.replace('userData/1/', 'wordData/');

      if (await isKeyExists(newKey)) {
        console.log(`Skipped: ${newKey} already exists.`);
      } else {
        await processImage(obj.Key, newKey);
      }

      processedCount++;
      console.log(`Progress: ${processedCount}/${objects.length}`);
    }
  } catch (error) {
    console.error('Error in renameAndCompressS3Objects:', error);
  }
}

async function listS3Objects(prefix) {
  const params = {
    Bucket: bucketName,
    Prefix: prefix
  };

  const objects = [];
  let data = await s3.listObjectsV2(params).promise();

  data.Contents.forEach(obj => objects.push(obj));

  while (data.IsTruncated) {
    params.ContinuationToken = data.NextContinuationToken;
    data = await s3.listObjectsV2(params).promise();
    data.Contents.forEach(obj => objects.push(obj));
  }

  return objects;
}

async function isKeyExists(key) {
  const params = {
    Bucket: bucketName,
    Key: key
  };

  try {
    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    return error.code !== 'NotFound';
  }
}

async function processImage(oldKey, newKey) {
  const file = await s3.getObject({ Bucket: bucketName, Key: oldKey }).promise();
  let buffer = file.Body;
  let compressed = buffer;

  while (compressed.byteLength > maxFileSize) {
    compressed = await sharp(buffer)
      .resize({ width: Math.round(await sharp(buffer).metadata().then(meta => meta.width * 0.75) ) })
      .png({ quality: 80 })
      .toBuffer();
    buffer = compressed;
  }

  await s3.putObject({ Bucket: bucketName, Key: newKey, Body: compressed, ContentType: 'image/png' }).promise();
  console.log(`Compressed and copied: ${oldKey} to ${newKey}`);
}

renameAndCompressS3Objects();
