import React from 'react';
import { DetectedPlant } from '../services/PlantDetectionAPI';

interface BoundingBoxOverlayProps {
  detections: DetectedPlant[];
  imageRef: React.RefObject<HTMLImageElement>;
  onPlantSelect?: (plant: DetectedPlant) => void;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  detections,
  imageRef,
  onPlantSelect,
}) => {
  const [imageSize, setImageSize] = React.useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const updateSizes = () => {
      if (imageRef.current) {
        const img = imageRef.current;
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        setDisplaySize({ width: img.offsetWidth, height: img.offsetHeight });
      }
    };

    updateSizes();
    window.addEventListener('resize', updateSizes);
    return () => window.removeEventListener('resize', updateSizes);
  }, [imageRef]);

  if (!detections.length || !imageSize.width || !displaySize.width) {
    return null;
  }

  const scaleX = displaySize.width / imageSize.width;
  const scaleY = displaySize.height / imageSize.height;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {detections.map((detection, index) => {
        const bbox = detection.bbox;
        const left = bbox.x1 * scaleX;
        const top = bbox.y1 * scaleY;
        const width = bbox.width * scaleX;
        const height = bbox.height * scaleY;

        const confidenceColor = 
          detection.confidence > 0.8 ? 'border-green-400' :
          detection.confidence > 0.6 ? 'border-yellow-400' :
          'border-orange-400';

        return (
          <div key={index} className="absolute">
            {/* Bounding box */}
            <div
              className={`border-2 ${confidenceColor} bg-black/10 cursor-pointer pointer-events-auto hover:bg-black/20 transition-colors`}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
              onClick={() => onPlantSelect?.(detection)}
            />
            
            {/* Label */}
            <div
              className={`absolute pointer-events-auto px-2 py-1 text-xs font-semibold text-white bg-black/80 rounded ${confidenceColor.replace('border-', 'bg-').replace('400', '600')} backdrop-blur-sm`}
              style={{
                left: `${left}px`,
                top: `${Math.max(0, top - 28)}px`,
              }}
            >
              <div className="flex items-center gap-1">
                <span className="capitalize">{detection.label}</span>
                <span className="text-white/70">
                  {Math.round(detection.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Confidence indicator */}
            <div
              className="absolute right-0 top-0 w-1 bg-gradient-to-b from-green-400 to-red-400"
              style={{
                left: `${left + width - 4}px`,
                top: `${top}px`,
                height: `${height}px`,
                opacity: detection.confidence,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

interface PlantDetailModalProps {
  plant: DetectedPlant | null;
  onClose: () => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({ plant, onClose }) => {
  if (!plant) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
              {plant.label}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {plant.scientific_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Detection Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Confidence:</span>
                <span className="ml-2 font-medium">
                  {Math.round(plant.confidence * 100)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 font-medium capitalize">
                  {plant.category}
                </span>
              </div>
            </div>
          </div>

          {plant.properties.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Medicinal Properties
              </h4>
              <div className="flex flex-wrap gap-1">
                {plant.properties.map((property, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                  >
                    {property}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                // Add to garden logic here
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add to Garden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
