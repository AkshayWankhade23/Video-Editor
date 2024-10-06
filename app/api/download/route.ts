import cloudinary from "cloudinary"
import { NextRequest, NextResponse } from "next/server"
import { checkImageProcessing } from "@/lib/check-processing"

cloudinary.v2.config({
  cloud_name: "dzhnzowab",
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

export async function GET(request: NextRequest){
    const SearchParams = request.nextUrl.searchParams
    const publicId = SearchParams.get("publicId")
    const quality = SearchParams.get("quality")
    const format = SearchParams.get("format")
    const activeUrl = SearchParams.get("url")

    if(!publicId){
        return new NextResponse("Missing publicId parameter", { status: 400})
    }
    let selected = ""
    if(format === "png"){
        selected= ""
    }
    if(format !== 'png'){
        switch(quality){
            case "original":
                break
            case "large":
                selected = "q_50"
                break
            case "small":
                selected = "q_30"
                break
            default:
                return new NextResponse("Invalid quality parameter", {status: 400})
        }
        
    }
    try {
        const parts = activeUrl!.split("/upload/")
        const url = selected
            ? `${parts[0]}/upload/${selected}/${parts[1]}`
            : activeUrl!
        let isProcessed= false
        const maxAttempts = 20
        const delay = 1000
        for(let attempt = 0; attempt < maxAttempts; attempt++){
            isProcessed = await checkImageProcessing(url)

            if(isProcessed){
                break
            }
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
        if(!isProcessed){
            throw new Error("Image processing timed out")
        }
        return NextResponse.json({
            url,
            filename: `${publicId}.${quality}.${format}`,
        })
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {error: "Error generating image URL"},
            {status: 500}
        )
    }
}