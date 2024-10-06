'use server'

import { actionclient } from "@/lib/safe-action";
import z from "zod";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { checkImageProcessing } from "@/lib/check-processing";

cloudinary.config({
  cloud_name: "dzhnzowab",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const genFillSchema = z.object({
  activeVideo: z.string(),
  aspect: z.string(),
  height: z.string(),
});

export const genCrop = actionclient
  .schema(genFillSchema)
  .action(async ({ parsedInput: { activeVideo, aspect, height } }) => {
    const parts = activeVideo.split("/upload/");
    const fillUrl = `${parts[0]}/upload/ar_${aspect},c_fill,g_auto,h_${height}/${parts[1]}`;

    let isProcessed = false;
    const maxAttempts = 20;
    const delay = 1000
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      isProcessed = await checkImageProcessing(fillUrl);
      if (isProcessed) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (!isProcessed) {
      return { error: "Video Processing Failed" };
    }
    return { success: fillUrl };
  });
