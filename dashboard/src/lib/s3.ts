import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:9000",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.S3_BUCKET_NAME!;

export async function getPresignedUrl({ key }: { key: string }): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function getAvatarUrl(fileType: string): Promise<{ url: string; key: string }> {
  if (!fileType) {
    throw new Error("Missing fileType");
  }

  const extensionMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  const ext = extensionMap[fileType] || fileType.split("/")[1] || "bin";

  const key = `uploads/${uuidv4()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: fileType,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });

  return { url, key };
}

export async function getUploadUrl(fileType: string): Promise<{ url: string; key: string }> {
  const key = `uploads/${uuidv4()}.${fileType.split("/")[1] ?? "webm"}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: fileType,
    ChecksumAlgorithm: undefined,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 300,
    unhoistableHeaders: new Set(["x-amz-checksum-crc32"]),
  });

  return { url, key };
}