"use client";

import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";
import { initiateTranscription } from "@/server/transcribe";
import { useState } from "react";
import { Button } from "../ui/button";
import { Captions } from "lucide-react";

export default function Transcription() {
  const activeLayer = useLayerStore((state) => state.activeLayer);
  const updateLayer = useLayerStore((state) => state.updateLayer);
  const [transcribing, setTranscribing] = useState(false);
  const setGenerating = useImageStore((state) => state.setGenerating);
  const setActiveLayer = useLayerStore((state) => state.setActiveLayer);

  const handleTranscribe = async () => {
    if (!activeLayer.publicId || activeLayer.resourceType !== "video") {
      return;
    }
    setTranscribing(true);
    setGenerating(true);

    try {
      const result = await initiateTranscription({
        publicId: activeLayer.publicId,
      });
      if (result) {
        if (result.data && "success" in result.data) {
          if (result.data.subtitledVideoUrl) {
            updateLayer({
              ...activeLayer,
              transcriptionURL: result.data.subtitledVideoUrl,
            });
            setActiveLayer(activeLayer.id);
          } else {
            console.log(result.data.error);
          }
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTranscribing(false);
      setGenerating(false);
    }
  };

  return (
    <div className="flex items-center">
      {!activeLayer.transcriptionURL && (
        <Button
          disabled={transcribing || activeLayer.resourceType !== "video"}
          variant={"outline"}
          className="py-8 w-full"
          onClick={handleTranscribe}
        >
          <span className="flex gap-1 items-center justify-center flex-col text-xs font-medium">
            {transcribing ? "Transcribing..." : "Transcribe"}{" "}
            <Captions size={18} />
          </span>
        </Button>
      )}
      {activeLayer.transcriptionURL && (
        <Button variant={"outline"} className="py-8 w-full" asChild>
          <a
            href={activeLayer.transcriptionURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="flex gap-1 items-center justify-center flex-col text-xs font-medium">
              View Transcription
              <Captions size={18} />
            </span>
          </a>
        </Button>
      )}
    </div>
  );
}
