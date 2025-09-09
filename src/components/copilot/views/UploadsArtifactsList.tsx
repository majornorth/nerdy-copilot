import React, { useState } from 'react';
import { MagnifyingGlass, FunnelSimple, SortAscending } from 'phosphor-react';
import { mockUploadsArtifacts } from '../../../data/mockUploadsArtifacts';
import { useCopilotStore } from '../../../stores/copilotStore';

export const UploadsArtifactsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { setView } = useCopilotStore();

  const filteredItems = mockUploadsArtifacts.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (itemId: string) => {
    // For now, just log the click
    // In a real implementation, this would open/preview the item
    console.log('Clicked item:', itemId);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Uploads & artifacts</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlass size={16} weight="regular" className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 text-sm"
          />
        </div>

        {/* Filter and Sort buttons */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
            <FunnelSimple size={16} weight="regular" />
            Filter
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
            <SortAscending size={16} weight="regular" />
            Sort
          </button>
        </div>
      </div>

      {/* Uploads & Artifacts List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className="w-full p-4 text-left border border-gray-200 rounded-lg bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-base leading-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {item.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    item.type === 'Artifact' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type}
                  </span>
                </div>
              </div>
              
              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};