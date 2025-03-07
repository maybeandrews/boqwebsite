import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Warn if required environment variables are missing
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn("⚠️ AWS credentials are missing! Ensure they are set in environment variables.");
}

if (!process.env.S3_BUCKET_NAME) {
  console.warn("⚠️ S3 bucket name is missing! Set S3_BUCKET_NAME in environment variables.");
}

// Create S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined, // Let AWS SDK automatically handle credentials if not set
});

// Export S3 config values
export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "your-bucket-name";
export const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com`;

// Upload file to S3
export async function uploadToS3(buffer: Buffer, key: string, contentType: string) {
  try {
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream", // Default to a generic type
      ACL: "public-read", // Make file publicly accessible
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    return {
      success: true,
      url: `${S3_BASE_URL}/${key}`, // Construct the public file URL
    };
  } catch (error) {
    console.error("❌ S3 upload error:", error);
    return { success: false, message: error.message };
  }
}

// Delete file from S3
export async function deleteFromS3(key: string) {
  try {
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    return { success: true };
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      console.warn(`⚠️ S3 file not found: ${key}`);
      return { success: false, message: "File not found" };
    }
    console.error("❌ S3 delete error:", error);
    throw error;
  }
}
