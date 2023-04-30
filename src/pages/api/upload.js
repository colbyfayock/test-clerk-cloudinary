import { v2 as cloudinary } from 'cloudinary';
import { getAuth, clerkClient } from "@clerk/nextjs/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
  api: {
    bodyParser:{
      sizeLimit: '25mb'
    }
  }
}

const SIZE_LIMIT_FREE = 1 * 1000 * 1000; // 1mb

export default async function handler(req, res) {
  const { image } = JSON.parse(req.body);
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await clerkClient.users.getUser(userId);

  // https://stackoverflow.com/a/70013969
  const imageBase64String = image.split('base64,')[1];
  const imageSize = Buffer.from(imageBase64String, 'base64').length;

  if ( user.publicMetadata.role === 'free' && imageSize >= SIZE_LIMIT_FREE ) {
    res.status(403).json({
      message: 'Free accounts are limited to 1mb uploads'
    });
    return;
  }

  const results = await cloudinary.uploader.upload(image);

  res.status(200).json(results);
}