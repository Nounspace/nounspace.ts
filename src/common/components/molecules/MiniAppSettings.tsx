import React, { useState, useRef } from 'react'
import { DragControls } from 'framer-motion'
import { IconSelector } from './IconSelector'
import { EyeIcon, EyeOffIcon, GripVerticalIcon } from 'lucide-react'
import * as FaIcons from 'react-icons/fa6'
import * as BsIcons from 'react-icons/bs'
import * as GiIcons from 'react-icons/gi'
import type { IconType } from 'react-icons'

const ICON_PACK: Record<string, IconType> = {
  ...FaIcons,
  ...BsIcons,
  ...GiIcons,
}

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
  dragControls?: DragControls
  orderNumber?: number
}

export function MiniAppSettings({ miniApp, onUpdateMiniApp, dragControls, orderNumber }: MiniAppSettingsProps) {
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
    if (!iconName) {
      return (
        <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded">?</div>
      )
    }

    if (iconName.startsWith('http')) {
      return (
        <img src={iconName} alt="icon" className="w-6 h-6 rounded object-contain" />
      )
    }

    const Icon = ICON_PACK[iconName] as IconType | undefined
    if (Icon) {
      return <Icon className="w-6 h-6" />
    }

    return (
      <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded">?</div>
    )
  }
  return (
    <div className="py-2 border-y">
      <div className="px-1">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="cursor-move p-1 hover:bg-gray-100 rounded shrink-0"
            title="Drag to reorder"
            onPointerDown={(e) => dragControls?.start(e)}
          >
            <GripVerticalIcon className="h-4 w-4 text-gray-400" />
          </div>
          <span className="text-xs text-gray-400 w-4 text-center">
            {orderNumber ?? "-"}
          </span>
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
            <label className="block text-xs text-gray-500 mb-1">Display Name</label>
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
