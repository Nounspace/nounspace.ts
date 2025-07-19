import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { CompleteFidgets } from "@/fidgets";
import { Card, CardContent } from "../atoms/card";
import { FidgetArgs, FidgetInstanceData, FidgetModule } from "@/common/fidgets";
import Modal from "../molecules/Modal";
import { FidgetOptionsService } from "@/common/data/services/fidgetOptionsService";
import { 
  FidgetOption, 
  StaticFidgetOption, 
  CuratedFidgetOption, 
  MiniAppFidgetOption,
  FidgetCategory,
  FidgetSearchFilters 
} from "@/common/types/fidgetOptions";
import { Input } from "../atoms/input";

import { Search } from "lucide-react";


export interface FidgetPickerModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addFidget: (fidgetId: string, fidget: FidgetModule<any>) => void;
  addFidgetWithCustomSettings: (fidgetId: string, fidget: FidgetModule<any>, customSettings: any) => void;
  setExternalDraggedItem: Dispatch<
    SetStateAction<{ i: string; w: number; h: number } | undefined>
  >;
  setCurrentlyDragging: React.Dispatch<React.SetStateAction<boolean>>;
  generateFidgetInstance(
    fidgetId: string,
    fidget: FidgetModule<FidgetArgs>,
    customSettings?: any,
  ): FidgetInstanceData;
}

export const FidgetPickerModal: React.FC<FidgetPickerModalProps> = ({
  isOpen,
  setIsOpen,
  addFidget,
  addFidgetWithCustomSettings,
  setExternalDraggedItem,
  setCurrentlyDragging,
  generateFidgetInstance,
}) => {
  const [categories, setCategories] = useState<FidgetCategory[]>([]);
  const [fidgetOptions, setFidgetOptions] = useState<FidgetOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const service = FidgetOptionsService.getInstance();

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFidgetOptions();
    }
  }, [isOpen]);

  // Load data when search or category changes
  useEffect(() => {
    if (isOpen) {
      loadFidgetOptions();
    }
  }, [searchQuery, selectedCategory]);

  const loadFidgetOptions = async () => {
    setLoading(true);
    try {
      const filters: FidgetSearchFilters = {};
      
      if (searchQuery) {
        filters.query = searchQuery;
      }
      
      if (selectedCategory) {
        filters.category = selectedCategory;
      }

      const response = await service.getFidgetOptions(filters);
      setFidgetOptions(response.options);
      setCategories(response.categories);
      
      // Set initial category if not set
      if (!selectedCategory && response.categories.length > 0) {
        setSelectedCategory(response.categories[0].id);
      }
    } catch (error) {
      console.error('Error loading fidget options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFidgetSelect = (option: FidgetOption) => {
    if (option.type === 'static') {
      const staticOption = option as StaticFidgetOption;
      const fidgetModule = CompleteFidgets[staticOption.fidgetType];
      if (fidgetModule) {
        addFidget(staticOption.fidgetType, fidgetModule);
      }
    } else if (option.type === 'curated') {
      const curatedOption = option as CuratedFidgetOption;
      const iframeFidget = CompleteFidgets.iframe;
      if (iframeFidget) {
        // Create iframe fidget with pre-populated URL
        addFidgetWithCustomSettings('iframe', iframeFidget, {
          url: curatedOption.url,
          size: 1,
          cropOffsetX: 0,
          cropOffsetY: 0,
          isScrollable: false
        });
      }
    } else if (option.type === 'miniapp') {
      const miniappOption = option as MiniAppFidgetOption;
      const framesFidget = CompleteFidgets.FramesV2;
      if (framesFidget) {
        // Create FramesV2 fidget with pre-populated frame URL
        addFidgetWithCustomSettings('FramesV2', framesFidget, {
          url: miniappOption.frameUrl,
          collapsed: false,
          title: miniappOption.name,
          headingFont: 'Inter'
        });
      }
    }
  };

  const renderFidgetOption = (option: FidgetOption) => {
    const icon = typeof option.icon === 'string' ? option.icon : '🔗';
    
    // Function to render icon properly - handle URLs vs unicode/text
    const renderIcon = () => {
      if (typeof icon === 'string' && icon.startsWith('http')) {
        return (
          <img 
            src={icon} 
            alt={option.name} 
            className="w-8 h-8 rounded object-contain"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        );
      }
      return (
        <span
          className="text-lg leading-none text-black group-hover:text-black"
          role="img"
          aria-label={option.name}
        >
          {icon}
        </span>
      );
    };
    
    return (
      <div
        key={option.id}
        className="z-20 droppable-element flex justify-center items-center transition-transform duration-300"
        draggable={true}
        // unselectable helps with IE support
        // eslint-disable-next-line react/no-unknown-property
        unselectable="on"
        onDragStart={(e) => {
          setCurrentlyDragging(true);
          // For drag and drop, we'll need to handle different types
          if (option.type === 'static') {
            const staticOption = option as StaticFidgetOption;
            const fidgetModule = CompleteFidgets[staticOption.fidgetType];
            if (fidgetModule) {
              e.dataTransfer.setData(
                "text/plain",
                JSON.stringify(generateFidgetInstance(staticOption.fidgetType, fidgetModule)),
              );
              setExternalDraggedItem({
                i: staticOption.fidgetType,
                w: fidgetModule.properties.size.minWidth,
                h: fidgetModule.properties.size.minHeight,
              });
            }
          }
        }}
      >
        <button
          className="group w-full h-16 flex items-center gap-3 p-2 bg-transparent transform-gpu transition-transform will-change-transform hover:scale-[1.02]"
          onClick={() => handleFidgetSelect(option)}
        >
          <Card className="w-full h-full bg-[#F3F4F6] flex items-center p-3 rounded-lg">
            <CardContent className="overflow-hidden flex items-center gap-4 p-0 w-full">
              <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                {renderIcon()}
                <span
                  className="text-lg leading-none text-black group-hover:text-black hidden"
                  role="img"
                  aria-label={option.name}
                >
                  🔗
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-medium text-black text-left leading-none group-hover:text-black truncate">
                    {option.name}
                  </span>
                </div>
                <p className="text-xs text-gray-600 text-left leading-tight truncate">
                  {option.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>
    );
  };



  const getCategoryOptions = () => {
    return fidgetOptions.filter(option => 
      !selectedCategory || option.category === selectedCategory
    );
  };

  return (
    <div>
      <style dangerouslySetInnerHTML={{
        __html: `
          [data-radix-dialog-content] {
            max-width: 1200px !important;
            width: 95vw !important;
          }
        `
      }} />
      <Modal
        open={isOpen}
        setOpen={setIsOpen}
        title="Add Fidget"
        description="Choose a fidget to add to your space"
        showClose={true}
        overlay={true}
      >
        <div className="h-[75vh] max-h-[600px] w-full flex flex-col">
        {/* Search Input */}
        <div className="relative mb-4 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search fidgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Loading fidgets...</div>
              </div>
            ) : (
              <>
                {/* All options */}
                <div className="grid grid-cols-1 gap-2 pb-4">
                  {getCategoryOptions().map(renderFidgetOption)}
                </div>

                {/* No results */}
                {fidgetOptions.length === 0 && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">No fidgets found</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
    </div>
  );
}; 