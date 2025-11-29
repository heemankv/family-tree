'use client';

import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => zoomIn({ duration: 200 })}
        className="bg-white shadow-md"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => zoomOut({ duration: 200 })}
        className="bg-white shadow-md"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => fitView({ duration: 300, padding: 0.2 })}
        className="bg-white shadow-md"
        title="Fit to View"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
