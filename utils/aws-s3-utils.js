import AWS from 'aws-sdk';

// AWS S3の設定
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// S3に画像をアップロードする関数
export async function uploadImageToS3(imageBuffer, fileName) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: imageBuffer,
    ContentType: 'image/png'
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;
  } catch (error) {
    console.error('uploadImageToS3 error:', error);
    throw error;
  }
}
