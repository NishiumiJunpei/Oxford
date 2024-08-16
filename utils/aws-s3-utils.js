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
    Bucket: process.env.AWS_S3_BUCKET_NAME,
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

// S3に音声をアップロードする関数
export async function uploadAudioToS3(audioBuffer, fileName) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME, // S3バケット名
    Key: fileName, // S3内でのファイルのパス（ファイル名）
    Body: audioBuffer, // 音声データ
    ContentType: 'audio/mpeg', // MP3ファイルのMIMEタイプ
    // ACL: 'public-read', // ファイルを公開する場合は設定 (オプション)
  };

  try {
    // アップロード処理
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // S3上のファイルURLを返す
  } catch (error) {
    console.error('uploadAudioToS3 error:', error);
    throw error;
  }
}


export const getS3FileUrl = async (filename) => {

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
    Expires: 60 * 60 * 24 * 3 // URLの有効期限（秒）
  };

  try {
    let url = ''
    if (!filename || filename.trim() === '') {
      url = `/images/under_prep.png`;
    }
    else if (filename == 'NO_IMAGE'){
      url = `/images/no_image.png`;
    }else{
      url = await s3.getSignedUrlPromise('getObject', params);
    }
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return null;
  }
};

export const getS3AudioFileUrl = async (filename) => {

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename,
    Expires: 60 * 60 * 24 * 3 // URLの有効期限（秒）
  };

  try {
    let url = '';
    
    // ファイル名が空の場合はプレースホルダーURLを返す
    if (!filename || filename.trim() === '') {
      url = `/audio/under_prep.mp3`; // 音声ファイルが準備中の場合のプレースホルダー
    }
    else if (filename === 'NO_AUDIO'){
      url = `/audio/no_audio.mp3`; // 音声ファイルが存在しない場合のプレースホルダー
    } else {
      // S3の署名付きURLを生成
      url = await s3.getSignedUrlPromise('getObject', params);
    }
    return url;
  } catch (error) {
    console.error('Error generating signed URL for audio:', error);
    return null;
  }
};

