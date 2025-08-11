import React, { useState } from 'react';

interface ScratchBlocksProps {
  vmInstance: any;
  onCodeChange: (code: any) => void;
}

const ScratchBlocks: React.FC<ScratchBlocksProps> = ({ vmInstance, onCodeChange }) => {
  const [selectedCategory, setSelectedCategory] = useState('motion');

  const blockCategories = [
    { id: 'motion', name: 'Motion', color: 'bg-blue-500' },
    { id: 'looks', name: 'Looks', color: 'bg-purple-500' },
    { id: 'sound', name: 'Sound', color: 'bg-pink-500' },
    { id: 'events', name: 'Events', color: 'bg-yellow-500' },
    { id: 'control', name: 'Control', color: 'bg-orange-500' },
    { id: 'sensing', name: 'Sensing', color: 'bg-teal-500' },
    { id: 'operators', name: 'Operators', color: 'bg-green-500' },
    { id: 'variables', name: 'Variables', color: 'bg-red-500' }
  ];

  const motionBlocks = [
    { name: 'move 10 steps', action: () => vmInstance?.runtime?.targets?.find((t: any) => !t.isStage)?.setXY(10, 0) },
    { name: 'turn 15 degrees', action: () => vmInstance?.runtime?.targets?.find((t: any) => !t.isStage)?.setDirection(15) },
    { name: 'go to x: 0 y: 0', action: () => vmInstance?.runtime?.targets?.find((t: any) => !t.isStage)?.setXY(0, 0) },
    { name: 'point in direction 90', action: () => vmInstance?.runtime?.targets?.find((t: any) => !t.isStage)?.setDirection(90) }
  ];

  const looksBlocks = [
    { name: 'say Hello! for 2 seconds', action: () => console.log('Say Hello!') },
    { name: 'change size by 10', action: () => vmInstance?.runtime?.targets?.find((t: any) => !t.isStage)?.setSize(110) },
    { name: 'set size to 100%', action: () => vmInstance?.runtime?.targets?.find((t: any) => !t.isStage)?.setSize(100) },
    { name: 'hide', action: () => vmInstance?.runtime?.targets?.find((t: any) => !t.isStage)?.setVisible(false) },
    { name: 'show', action: () => vmInstance?.runtime?.targets?.find((t: any) => !t.isStage)?.setVisible(true) }
  ];

  const getBlocksForCategory = (category: string) => {
    switch (category) {
      case 'motion':
        return motionBlocks;
      case 'looks':
        return looksBlocks;
      default:
        return [];
    }
  };

  const handleBlockClick = (block: any) => {
    if (block.action) {
      block.action();
      onCodeChange({ type: 'block_executed', block: block.name });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 p-2 bg-white border-b">
        {blockCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === category.id
                ? `${category.color} text-white`
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {getBlocksForCategory(selectedCategory).map((block, index) => (
            <div
              key={index}
              onClick={() => handleBlockClick(block)}
              className="p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="text-sm font-medium text-gray-800">{block.name}</div>
              <div className="text-xs text-gray-500 mt-1">Click to execute</div>
            </div>
          ))}
        </div>

        {getBlocksForCategory(selectedCategory).length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-lg mb-2">🚧</div>
            <div className="text-sm">More blocks coming soon!</div>
            <div className="text-xs mt-1">This is a simplified version of Scratch blocks</div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">How to use:</div>
          <div>• Click on blocks to execute them</div>
          <div>• Blocks will affect the sprite on the stage</div>
          <div>• Use the Start/Stop buttons to control execution</div>
        </div>
      </div>
    </div>
  );
};

export default ScratchBlocks;
