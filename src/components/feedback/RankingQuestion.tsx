
import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface RankingQuestionProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: string[];
}

export const RankingQuestion: React.FC<RankingQuestionProps> = ({ 
  value, 
  onChange, 
  options 
}) => {
  const [items, setItems] = useState<string[]>(value || [...options]);

  useEffect(() => {
    if (value && value.length > 0) {
      setItems(value);
    } else {
      setItems([...options]);
    }
  }, [value, options]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    const newItems = [...items];
    const draggedItem = newItems[dragIndex];
    newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    setItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          className="flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
        >
          <span className="flex items-center justify-center w-8 h-8 bg-[#f97316] text-white rounded-full text-sm font-medium mr-3">
            {index + 1}
          </span>
          <GripVertical className="h-5 w-5 text-gray-400 mr-3" />
          <span className="flex-1 text-gray-800">{item}</span>
        </div>
      ))}
      <p className="text-sm text-gray-600 mt-4">
        Drag and drop to reorder items by importance (1 = most important)
      </p>
    </div>
  );
};
