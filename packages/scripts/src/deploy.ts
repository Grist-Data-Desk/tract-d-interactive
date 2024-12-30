import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const TRACT_D_ASSETS_PATH = "tract-d/dist/assets";

/**
 * Derive the Content-Type header from the file extension.
 * @param file — The name of the file on disk.
 */
const deriveContentType = (file: string): string => {
  const ext = path.extname(file);

  switch (ext) {
    case ".js":
      return "text/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    default:
      console.warn(`Attempting to upload file with unknown extension: ${ext}.`);
      break;
  }
};

/**
 * Deploy the source code located at `packages/interactive/dist/assets` to the
 * Grist Digital Ocean Spaces bucket.
 */
const main = async (): Promise<void> => {
  const s3Client = new S3Client({
    endpoint: "https://nyc3.digitaloceanspaces.com/",
    forcePathStyle: false,
    region: "nyc3",
    credentials: {
      accessKeyId: process.env.DO_SPACES_KEY,
      secretAccessKey: process.env.DO_SPACES_SECRET,
    },
  });

  const files = await fs.readdir(
    path.resolve(__dirname, "../../interactive/dist/assets"),
    { recursive: true },
  );

  console.log(
    `Uploading build artifacts from packages/interactive/dist/assets.`,
  );
  for (const file of files) {
    const Body = await fs.readFile(
      path.resolve(__dirname, "../../interactive/dist/assets/", file),
    );
    const putObjectCommand = new PutObjectCommand({
      Bucket: "grist",
      Key: `${TRACT_D_ASSETS_PATH}/${file}`,
      Body,
      ACL: "public-read",
      ContentType: deriveContentType(file),
    });

    try {
      const response = await s3Client.send(putObjectCommand);
      console.log(`Successfully uploaded ${file}`);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  }
};

main();
