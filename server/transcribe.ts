"use server";

import { v2 as cloudinary } from "cloudinary";
import { actionclient } from "@/lib/safe-action";
import z from "zod";

cloudinary.config({
  cloud_name: "dzhnzowab",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const transcriptionData = z.object({
  publicId: z.string(),
});

async function checkTranscriptionStatus(publicId: string): Promise<string> {
    try{
        const result = await cloudinary.api.resource(publicId, {
            resource_type: "video"
        })
        if(
            result.info &&
            result.info.raw_convert &&
            result.info.raw_convert.google_speech
        ) {
            return result.info.raw_convert.google_speech.status
        }
        return "pending"
    } catch (error) {
        throw new Error("Failed to check transcription status")
    }
}

function generatedSubtitledVideoUrl(publicId: string): string{
    return cloudinary.url(publicId, {
        resource_type: "video",
        transformation: [
            {
                overlay: {
                    resource_type: 'subtitles',
                    public_id: `${publicId}.transcript`
                },
            },
            {flags: "layer_apply"},
        ],
    })
}

export const initiateTranscription = actionclient.schema(transcriptionData).action(async({parsedInput: {publicId}}) => {
    try{
        await cloudinary.api.update(publicId, {
            resource_type: "video",
            raw_convert: "google_speech",
        })
        const maxAttempts = 20
        const delay = 1000
        let status = "pending"

        for(let attempt = 0; attempt < maxAttempts; attempt++) {
            status = await checkTranscriptionStatus(publicId)
            console.log(`Attempt ${attempt + 1}: Transcription status - ${status}`)

            if(status === "complete"){
                const subtitledVideoUrl = generatedSubtitledVideoUrl(publicId)
                return{ success: "Transcription completed", subtitledVideoUrl}
            } else if(status === "failed") {
                return{ error: "Transcription failed"}
            }

            await new Promise((resolve) => setTimeout(resolve, delay))
        }
        return {error: "Transcription timed out"}
    } catch (error){
        return{error: "Error in transcription process"}

    }
})