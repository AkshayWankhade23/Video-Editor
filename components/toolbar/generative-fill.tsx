"use client";

import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Image } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useMemo, useState } from "react";
import { genFill } from "@/server/gen-fill";

export default function GenerativeFill() {
  const setGenerating = useImageStore((state) => state.setGenerating);
  const generating = useImageStore((state) => state.generating);
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const addLayer = useLayerStore((state) => state.addLayer);
  const setActiveLayer = useLayerStore((state) => state.setActiveLayer);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const PREVIEW_SIZE = 300;
  const EXPANSION_THRESHOLD = 250;

  const ExpansionIndicator = ({ value, axis }: { value: number; axis: "x" | "y" }) => {
    const isVisible = Math.abs(value) >= EXPANSION_THRESHOLD;
    const position = axis === "x"
      ? { top: "50%", [value > 0 ? "right" : "left"]: 0, transform: "translateY(-50%)" }
      : { left: "50%", [value > 0 ? "bottom" : "top"]: 0, transform: "translateX(-50%)" };

    return isVisible ? (
      <div className="absolute bg-secondary text-primary px-2 py-1 rounded-md text-xs font-bold" style={position}>
        {Math.abs(value)}px
      </div>
    ) : null;
  };

  const previewStyle = useMemo(() => {
    if (!activeLayer?.width || !activeLayer?.height) return {};
    const newWidth = activeLayer.width + width;
    const newHeight = activeLayer.height + height;
    const scale = Math.min(PREVIEW_SIZE / newWidth, PREVIEW_SIZE / newHeight);

    return {
      width: `${newWidth * scale}px`,
      height: `${newHeight * scale}px`,
      backgroundImage: `url(${activeLayer.url})`,
      backgroundSize: `${activeLayer.width * scale}px ${activeLayer.height * scale}px`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      position: "relative" as const,
    };
  }, [activeLayer, width, height]);

  const previewOverlayStyle = useMemo(() => {
    if (!activeLayer?.width || !activeLayer?.height) return {};
    const scale = Math.min(PREVIEW_SIZE / (activeLayer.width + width), PREVIEW_SIZE / (activeLayer.height + height));

    return {
      position: "absolute" as const,
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      boxShadow: `inset ${(width > 0 ? (width / 2) * scale : 0)}px ${(height > 0 ? (height / 2) * scale : 0)}px 0 rgba(48, 119, 255, 1),
                  inset -${(width > 0 ? (width / 2) * scale : 0)}px ${(height > 0 ? (height / 2) * scale : 0)}px 0 rgba(48, 119, 255, 1),
                  inset ${(width > 0 ? (width / 2) * scale : 0)}px -${(height > 0 ? (height / 2) * scale : 0)}px 0 rgba(48, 119, 255, 1),
                  inset -${(width > 0 ? (width / 2) * scale : 0)}px -${(height > 0 ? (height / 2) * scale : 0)}px 0 rgba(48, 119, 255, 1)`,
    };
  }, [activeLayer, width, height]);

  const handleGenerate = async () => {
    if (!activeLayer?.url) return; // Early return if no URL

    const newLayerId = crypto.randomUUID();
    setGenerating(true);

    const res = await genFill({
      aspect: "1:1",
      height: (activeLayer.height ?? 0) + height,
      width: (activeLayer.width ?? 0) + width,
      activeImage: activeLayer.url,
    });

    if (res?.data?.success) {
      addLayer({
        id: newLayerId,
        url: res.data.success,
        format: activeLayer.format,
        height: (activeLayer.height ?? 0) + height,
        width: (activeLayer.width ?? 0) + width,
        name: "genFill" + activeLayer.name,
        publicId: activeLayer.publicId,
        resourceType: "image",
      });
      setActiveLayer(newLayerId);
    }
    setGenerating(false);
  };

  return (
    <Popover>
      <PopoverTrigger disabled={!activeLayer?.url} asChild>
        <Button variant="outline" className="p-8">
          <span className="flex gap-1 items-center justify-center flex-col text-xs font-medium">
            Generative Fill <Image size={20} />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <div className="flex flex-col h-full">
          <div className="pb-4">
            <h3>Generative Fill</h3>
            <p className="text-sm text-muted-foreground">
              Remove the background of an image with one simple click.
            </p>
          </div>
          {activeLayer?.width && activeLayer?.height && (
            <div className="flex justify-evenly">
              <div className="flex flex-col items-center">
                <span className="text-xs">Current Size:</span>
                <p className="text-sm text-primary font-bold">
                  {activeLayer.width}x{activeLayer.height}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs">New Size</span>
                <p className="text-sm text-primary font-bold">
                  {activeLayer.width + width}x{activeLayer.height + height}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center justify-center">
          <div className="text-center">
            <Label htmlFor="width">Modify Width</Label>
            <Input
              name="width"
              type="range"
              max={activeLayer?.width || 0}
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="h-8"
            />
          </div>
          <div className="text-center">
            <Label htmlFor="height">Modify Height</Label>
            <Input
              name="height"
              type="range"
              max={activeLayer?.height || 0}
              min={activeLayer?.height ? -activeLayer.height + 100 : 0}
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value))}
              className="h-8"
            />
          </div>
        </div>

        <div style={{ width: `${PREVIEW_SIZE}px`, height: `${PREVIEW_SIZE}px` }} className="preview-container flex-grow flex justify-center items-center overflow-hidden m-auto">
          <div style={previewStyle}>
            <div className="animate-pulse" style={previewOverlayStyle}></div>
            <ExpansionIndicator value={width} axis="x" />
            <ExpansionIndicator value={height} axis="y" />
          </div>
        </div>

        <Button
          disabled={!activeLayer?.url || generating}
          onClick={handleGenerate}
          className="w-full mt-4"
        >
          {generating ? "Generating..." : "Generative Fill"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
