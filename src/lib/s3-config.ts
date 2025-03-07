import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Environment validation
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn("AWS credentials not found in environment variables. Using fallback values.");
}

if (!process.env.S3_BUCKET_NAME) {
  console.warn("S3 bucket name not found in environment. Using fallback value.");
}

// Create S3 client instance
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Export other configuration values
export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "your-bucket-name";
export const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com`;

export async function uploadToS3(buffer: Buffer, key: string, contentType: string) {
  try {
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    return {
      success: true,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`
    };
  } catch (error) {
    console.error("S3 upload error:", error);
    return { success: false };
  }
}

export async function deleteFromS3(key: string) {
  try {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error("S3 delete error:", error);
    throw error;
  }
}