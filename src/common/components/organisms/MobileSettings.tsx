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
      <h2 className="text-lg font-semibold mb-2">Edit</h2>
      <div className="mb-6">
        <h3 className="text-md font-medium mb-1">Mobile Settings</h3>
        <p className="text-sm text-gray-500 mb-4">Configure how fidgets appear on mobile</p>
      </div>
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
