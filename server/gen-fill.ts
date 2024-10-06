"use server"

import { actionclient } from "@/lib/safe-action"
import { UploadApiResponse, v2 as cloudinary } from "cloudinary"
import z from "zod"

cloudinary.config({
  cloud_name: "dzhnzowab",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

const genFillSchema = z.object({
  activeImage: z.string(),
  aspect: z.string(),
  width: z.number(),
  height: z.number(),
})

async function checkImageProcessing(url: string) {
  try {
    const response = await fetch(url)
    if (response.ok) {
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

export const genFill = actionclient
  .schema(genFillSchema)
  .action(async ({ parsedInput: { activeImage, aspect, height, width } }) => {
    const parts = activeImage.split('/upload/')
    const fillUrl = `${parts[0]}/upload/ar_${aspect},b_gen_fill,c_pad,w_${width},h_${height}/${parts[1]}`
    // Poll the URL to check if the image is processed
    let isProcessed = false
    const maxAttempts = 20
    const delay = 1000 // 1 second
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      isProcessed = await checkImageProcessing(fillUrl)
      if (isProcessed) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    if (!isProcessed) {
      throw new Error("Image processing timed out")
    }
    console.log(fillUrl)
    return { success: fillUrl }
  })