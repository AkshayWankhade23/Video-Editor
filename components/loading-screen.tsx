'use client'

import { useLayerStore } from "@/lib/layer-store"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import Lottie from "lottie-react"
import loadingAnimation from '@/public/animations/loading.json'

export default function Loading(){
    const activeLayer = useLayerStore((state) => state.activeLayer)

    return(
        <Dialog>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle> {activeLayer.name}</DialogTitle>
                    <DialogDescription>Please note that this operation might take up to a couple of seconds.</DialogDescription>
                </DialogHeader>
                <Lottie className="w-36" animationData={loadingAnimation} />
            </DialogContent>
        </Dialog>
    )
}