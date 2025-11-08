import React from 'react';

interface StoryTemplate {
    id: string;
    title: string;
    description: string;
    ageGroup: string;
    tags: string[];
    imageUrl: string;
}

interface StoryTemplateCardProps {
    template: StoryTemplate;
    isSelected: boolean;
    onSelect: () => void;
}

const StoryTemplateCard: React.FC<StoryTemplateCardProps> = ({ template, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer bg-gray-800/70 backdrop-blur-md rounded-lg overflow-hidden border-2 transition-all duration-200 ${
        isSelected ? 'border-blue-500 shadow-lg shadow-blue-900/40' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <img className="h-40 w-full object-cover" src={template.imageUrl} alt={template.title} />
      <div className="p-4">
        <h3 className="font-bold text-white">{template.title}</h3>
        <p className="text-xs text-gray-400 mt-1">{template.description}</p>
        <div className="mt-3 flex flex-wrap gap-1">
            {template.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-gray-700/80 text-gray-300">{tag}</span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default StoryTemplateCard;