import React, { useEffect, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import MiniAppSettings, { MiniApp } from '../molecules/MiniAppSettings'

interface MobileSettingsProps {
  miniApps?: MiniApp[]
  onUpdateMiniApp: (app: MiniApp) => void
  onReorderMiniApps: (apps: MiniApp[]) => void
}

function DraggableMiniApp({
  miniApp,
  onUpdateMiniApp,
  orderNumber,
}: {
  miniApp: MiniApp
  onUpdateMiniApp: (app: MiniApp) => void
  orderNumber?: number
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
        orderNumber={orderNumber}
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
    const sorted = [...(miniApps ?? [])].sort((a, b) => a.order - b.order)
    setItems(sorted)
  }, [miniApps])

  const handleReorder = (newOrder: MiniApp[]) => {
    setItems(newOrder)
    onReorderMiniApps(newOrder)
  }

  const visibleOrderMap: Record<string | number, number> = {}
  items
    .filter((app) => app.displayOnMobile)
    .forEach((app, index) => {
      visibleOrderMap[app.id] = index + 1
    })

  return (
    <div className="px-2 pt-1 pb-2">
      <p className="text-sm text-gray-500 mb-4">
        Drag fidgets to reorder them in the mobile nav, and customize their
        visibility, display name, and icon.
      </p>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        className="flex flex-col"
      >
        {items.map((miniApp) => (
          <DraggableMiniApp
            key={miniApp.id}
            miniApp={miniApp}
            onUpdateMiniApp={onUpdateMiniApp}
            orderNumber={visibleOrderMap[miniApp.id]}
          />
        ))}
      </Reorder.Group>
    </div>
  )
}

export default MobileSettings
