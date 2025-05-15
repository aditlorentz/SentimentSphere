import { X } from "lucide-react";
import { useState } from "react";

interface AIInsightConclusionProps {
  content: string;
  onClose?: () => void;
}

export default function AIInsightConclusion({
  content,
  onClose,
}: AIInsightConclusionProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-white rounded-[12px] shadow-[0_10px_20px_rgba(0,0,0,0.05)] p-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-primary">
            AI Instant Conclusion
          </h2>
          <span className="bg-blue-100 text-secondary text-xs font-medium px-2 py-1 rounded-full">
            AI
          </span>
        </div>
        <button
          className="text-gray-400 hover:text-gray-500"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="text-gray-600 text-sm">{content}</p>
    </div>
  );
}
