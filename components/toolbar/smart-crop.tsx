"use client";

import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Crop, Square } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/lib/utils";
import Youtube from "../icons/youtube";
import TikTok from "../icons/tiktok";
import { genCrop } from "@/server/gen-crop";

export default function SmartCrop() {
  const setGenerating = useImageStore((state) => state.setGenerating);
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const addLayer = useLayerStore((state) => state.addLayer);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const generating = useImageStore((state) => state.generating);
  const setActiveLayer = useLayerStore((state) => state.setActiveLayer);

  const height = activeLayer?.height ?? 0; // Default to 0 if undefined
  const width = activeLayer?.width ?? 0; // Default to 0 if undefined

  const handleCrop = async () => {
    if (!activeLayer?.url) return;

    setGenerating(true);
    const res = await genCrop({
      height: height.toString(),
      aspect: aspectRatio,
      activeVideo: activeLayer.url,
    });

    setGenerating(false);

    if (res?.data?.success) {
      const newLayerId = crypto.randomUUID();
      const thumbnailUrl = res.data.success.replace(/\.[^/.]+$/, ".jpg");

      addLayer({
        id: newLayerId,
        name: "cropped " + activeLayer.name,
        format: activeLayer.format,
        height: height,
        width: width,
        url: res.data.success,
        publicId: activeLayer.publicId,
        resourceType: "video",
        poster: thumbnailUrl,
      });

      setActiveLayer(newLayerId);
    }
  };

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer?.url} asChild>
        <Button variant="outline" className="py-8">
          <span className="flex gap-1 items-center flex-col text-xs font-medium">
            Smart Crop
            <Crop size={18} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="flex flex-col h-full">
          <div className="space-y-2 pb-4">
            <h3 className="font-medium text-center py-2 leading-none">
              Smart Recrop
            </h3>
          </div>
        </div>
        <h4 className="text-md font-medium pb-2">Format</h4>
        <div className="flex gap-4 items-center justify-center pb-2">
          {["16:9", "9:16", "1:1"].map((ratio) => (
            <Card
              key={ratio}
              className={cn(
                aspectRatio === ratio ? "border-primary" : "",
                "p-4 w-36 cursor-pointer"
              )}
              onClick={() => setAspectRatio(ratio)}
            >
              <CardHeader className="text-center p-0">
                <CardTitle className="text-md">
                  {ratio === "16:9" ? "YouTube" : ratio === "9:16" ? "TikTok" : "Square"}
                </CardTitle>
                <CardDescription>
                  <p className="text-sm font-bold">{ratio}</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-0 pt-2">
                {ratio === "16:9" && <Youtube />}
                {ratio === "9:16" && <TikTok />}
                {ratio === "1:1" && <Square className="w-10 h-10" />}
              </CardContent>
            </Card>
          ))}
        </div>
        <Button
          onClick={handleCrop}
          className="w-full mt-4"
          variant="outline"
          disabled={!activeLayer?.url || generating}
        >
          {generating ? "Cropping..." : "Smart Crop"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
