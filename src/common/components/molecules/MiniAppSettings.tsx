import React, { useState, useRef } from 'react'
import { IconSelector } from './IconSelector'
import { EyeIcon, EyeOffIcon, GripVerticalIcon } from 'lucide-react'

export interface MiniApp {
  id: string | number
  name: string
  mobileDisplayName: string
  context?: string
  order: number
  icon: string
  displayOnMobile: boolean
}

interface MiniAppSettingsProps {
  miniApp: MiniApp
  onUpdateMiniApp: (app: MiniApp) => void
}

export function MiniAppSettings({ miniApp, onUpdateMiniApp }: MiniAppSettingsProps) {
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false)
  const iconButtonRef = useRef<HTMLButtonElement>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateMiniApp({ ...miniApp, mobileDisplayName: e.target.value })
  }

  const handleIconSelect = (iconName: string) => {
    onUpdateMiniApp({ ...miniApp, icon: iconName })
    setIsIconSelectorOpen(false)
  }

  const toggleVisibility = () => {
    onUpdateMiniApp({ ...miniApp, displayOnMobile: !miniApp.displayOnMobile })
  }

  const getIconComponent = (iconName: string) => {
    const IconMap: Record<string, React.ReactNode> = {
      RssIcon: (
        <div className="w-6 h-6 bg-blue-100 text-blue-600 flex items-center justify-center rounded">
          RSS
        </div>
      ),
      VoteIcon: (
        <div className="w-6 h-6 bg-purple-100 text-purple-600 flex items-center justify-center rounded">
          V
        </div>
      ),
      ImageIcon: (
        <div className="w-6 h-6 bg-green-100 text-green-600 flex items-center justify-center rounded">
          I
        </div>
      ),
      HomeIcon: (
        <div className="w-6 h-6 bg-yellow-100 text-yellow-600 flex items-center justify-center rounded">
          H
        </div>
      ),
      GiftIcon: (
        <div className="w-6 h-6 bg-red-100 text-red-600 flex items-center justify-center rounded">
          G
        </div>
      ),
    }
    return (
      IconMap[iconName] || (
        <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded">?</div>
      )
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="cursor-move p-1 hover:bg-gray-100 rounded shrink-0" title="Drag to reorder">
            <GripVerticalIcon className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-sm text-gray-500 truncate flex-1">
            {miniApp.context}
          </div>
          <button
            onClick={toggleVisibility}
            className={`p-1.5 rounded-md transition-colors shrink-0 ${miniApp.displayOnMobile ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
          >
            {miniApp.displayOnMobile ? (
              <EyeIcon className="h-4 w-4" />
            ) : (
              <EyeOffIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={miniApp.mobileDisplayName}
              onChange={handleNameChange}
              className="w-full h-10 px-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Display name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Icon</label>
            <button
              type="button"
              ref={iconButtonRef}
              onClick={() => setIsIconSelectorOpen(!isIconSelectorOpen)}
              className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getIconComponent(miniApp.icon)}
            </button>
            {isIconSelectorOpen && (
              <IconSelector
                onSelectIcon={handleIconSelect}
                triggerRef={iconButtonRef}
                onClose={() => setIsIconSelectorOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MiniAppSettings
