"use server"

import { actionclient } from "@/lib/safe-action"
import { UploadApiResponse, v2 as cloudinary } from "cloudinary"
import z from "zod"

cloudinary.config({
  cloud_name: "dzhnzowab",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

const bgRemoveSchema = z.object({
  format: z.string(),
  activeImage: z.string(),
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

export const bgRemoval = actionclient
  .schema(bgRemoveSchema)
  .action(async ({ parsedInput: { format, activeImage } }) => {
    const form = activeImage.split(format)
    const pngConvert = form[0] + "png"
    const parts = pngConvert.split("/upload/")
    //https://res.cloudinary.com/demo/image/upload/e_gen_remove:prompt_fork/docs/avocado-salad.jpg
    const bgUrl = `${parts[0]}/upload/e_background_removal/${parts[1]}`
    // Poll the URL to check if the image is processed
    let isProcessed = false
    const maxAttempts = 20
    const delay = 1000 // 1 second
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      isProcessed = await checkImageProcessing(bgUrl)
      if (isProcessed) {
        break
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    if (!isProcessed) {
      throw new Error("Image processing timed out")
    }
    console.log(bgUrl)
    return { success: bgUrl }
  })