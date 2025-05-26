import React, { useEffect, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import MiniAppSettings, { MiniApp } from '../molecules/MiniAppSettings'

interface MobileSettingsProps {
  miniApps: MiniApp[]
  onUpdateMiniApp: (app: MiniApp) => void
  onReorderMiniApps: (apps: MiniApp[]) => void
}

function DraggableMiniApp({
  miniApp,
  onUpdateMiniApp,
}: {
  miniApp: MiniApp
  onUpdateMiniApp: (app: MiniApp) => void
}) {
  const controls = useDragControls()
  return (
    <Reorder.Item
      value={miniApp}
      dragListener={false}
      dragControls={controls}
      className="cursor-default"
    >
      <MiniAppSettings
        miniApp={miniApp}
        onUpdateMiniApp={onUpdateMiniApp}
        dragControls={controls}
      />
    </Reorder.Item>
  )
}

export function MobileSettings({
  miniApps,
  onUpdateMiniApp,
  onReorderMiniApps,
}: MobileSettingsProps) {
  const [items, setItems] = useState<MiniApp[]>([])

  useEffect(() => {
    const sorted = [...miniApps].sort((a, b) => a.order - b.order)
    setItems(sorted)
  }, [miniApps])

  const handleReorder = (newOrder: MiniApp[]) => {
    setItems(newOrder)
    onReorderMiniApps(newOrder)
  }

  return (
    <div className="p-4">
      <p className="text-sm text-gray-500 mb-4">
        Drag fidgets to reorder them in the mobile nav, and customize their
        visibility, display name, and icon.
      </p>
      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3">
        {items.map((miniApp) => (
          <DraggableMiniApp
            key={miniApp.id}
            miniApp={miniApp}
            onUpdateMiniApp={onUpdateMiniApp}
          />
        ))}
      </Reorder.Group>
    </div>
  )
}

export default MobileSettings
