import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Ensure environment variables are available
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
    : undefined, // Let AWS SDK handle credentials if not set
});

// Export bucket details
export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "your-bucket-name";
export const S3_BASE_URL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com`;

// Upload file to S3
export async function uploadToS3(buffer: Buffer, key: string, contentType: string) {
  try {
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/pdf", // Default to PDF
      ACL: "public-read", // If you want private files, remove this
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    return {
      success: true,
      fileKey: key, // Store in DB
      fileUrl: `${S3_BASE_URL}/${key}`, // Public URL for file access
    };
  } catch (error) {
    console.error("❌ S3 upload error:", error);
    return { success: false, message: error.message };
  }
}

// Generate signed URL for private files (optional)
export async function getSignedFileUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1-hour expiry
    return { success: true, url: signedUrl };
  } catch (error) {
    console.error("❌ Error generating signed URL:", error);
    return { success: false, message: error.message };
  }
}

// Delete file from S3
export async function deleteFromS3(key: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

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
