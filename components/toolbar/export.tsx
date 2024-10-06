"use client";

import { useLayerStore } from "@/lib/layer-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Car, Download } from "lucide-react";

export default function ExportAsset({ resource }: { resource: string }) {
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const [selected, setSelected] = useState("original");

  const handleDownload = async() => {
    if(activeLayer.publicId){
        try {
            const res = await fetch(`/api/download?publicId=${activeLayer.publicId}&quality=${selected}&resource_type=${activeLayer.resourceType}&format=${activeLayer.format}&url=${activeLayer.url}`)
            if(!res.ok){
                throw new Error('failed to export')
            }
            const data = await res.json();
            if(data.error){
                throw new Error(data.error)
            }
            const imageResponse = await fetch(data.url)
                if(!imageResponse.ok){
                    throw new Error('failed to fetch')
                }
            const imageBlob = await imageResponse.blob();
            const downloadUrl = URL.createObjectURL(imageBlob);
            const link = document.createElement('a');
            link.href = downloadUrl
            link.download = data.filename
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(downloadUrl)
        } catch (error) {
            console.log('download failed')
        }
    }
  }

  return (
    <Dialog>
      <DialogTrigger disabled={!activeLayer?.url} asChild>
        <Button variant="outline" className="py-8">
          <span className="flex gap-1 items-center justify-center flex-col text-xs font-medium">
            Export
            <Download size={18} />
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <h3 className="text-center text-2xl font-medium pb-4">Export</h3>
        <Card
          onClick={() => setSelected("original")}
          className={cn(
            selected === "original" ? "border-primary" : null,
            "p-4 cursor-pointer"
          )}
        >
          <CardContent className="p-0">
            <CardTitle className="text-md">Original</CardTitle>
            <CardDescription>
              {activeLayer.width}X{activeLayer.height}
            </CardDescription>
          </CardContent>
        </Card>
        <Card
          onClick={() => setSelected("large")}
          className={cn(
            selected === "large" ? "border-primary" : null,
            "p-4 cursor-pointer"
          )}
        >
          <CardContent className="p-0">
            <CardTitle className="text-md">Large</CardTitle>
            <CardDescription>
              {(activeLayer.width! * 0.7).toFixed(0)}X
              {(activeLayer.height! * 0.7).toFixed(0)}
            </CardDescription>
          </CardContent>
        </Card>
        <Card
          onClick={() => setSelected("medium")}
          className={cn(
            selected === "medium" ? "border-primary" : null,
            "p-4 cursor-pointer"
          )}
        >
          <CardContent className="p-0">
            <CardTitle className="text-md">Medium</CardTitle>
            <CardDescription>
              {(activeLayer.width! * 0.5).toFixed(0)}X
              {(activeLayer.height! * 0.5).toFixed(0)}
            </CardDescription>
          </CardContent>
        </Card>
        <Card
          onClick={() => setSelected("small")}
          className={cn(
            selected === "small" ? "border-primary" : null,
            "p-4 cursor-pointer"
          )}
        >
          <CardContent className="p-0">
            <CardTitle className="text-md">Small</CardTitle>
            <CardDescription>
              {(activeLayer.width! * 0.3).toFixed(0)}X
              {(activeLayer.height! * 0.3).toFixed(0)}
            </CardDescription>
          </CardContent>
        </Card>
        <Button onClick={handleDownload}>
            Download {selected} {resource}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
