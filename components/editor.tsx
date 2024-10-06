"use client";

import { ModeToggle } from "@/themes/mode-toggle";
import Layers from "./layers/layers";
import ActiveImage from "./upload/active-image";
import UploadForm from "./upload/upload-form";
import { useLayerStore } from "@/lib/layer-store";
import ImageTools from "./toolbar/image-toolbar";
import VideoTools from "./toolbar/video-toolbar";
import Loading from "./loading-screen";
import ExportAsset from "./toolbar/export";

function Editor() {
  const activeLayer = useLayerStore((state) => state.activeLayer);
  return (
    <div className="flex h-full">
      <div className="py-6 px-4 basis-[240px] shrink-0">
        <div className="pb-12 text-center">
          <ModeToggle />
        </div>
        <div className="flex flex-col gap-4">
          {activeLayer.resourceType === "image" ? <ImageTools /> : null}
          {activeLayer.resourceType === "video" ? <VideoTools /> : null}
          <ExportAsset resource={activeLayer.resourceType!} />
        </div>
      </div>
      <Loading />
      <UploadForm />
      <ActiveImage />
      <Layers />
    </div>
  );
}

export default Editor;
