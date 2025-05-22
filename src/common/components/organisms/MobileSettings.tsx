import React, { useEffect, useState } from 'react'
import { Reorder } from 'framer-motion'
import MiniAppSettings, { MiniApp } from '../molecules/MiniAppSettings'

interface MobileSettingsProps {
  miniApps: MiniApp[]
  onUpdateMiniApp: (app: MiniApp) => void
}

export function MobileSettings({ miniApps, onUpdateMiniApp }: MobileSettingsProps) {
  const [items, setItems] = useState<MiniApp[]>([])

  useEffect(() => {
    const sorted = [...miniApps].sort((a, b) => a.order - b.order)
    setItems(sorted)
  }, [miniApps])

  const handleReorder = (newOrder: MiniApp[]) => {
    setItems(newOrder)
    newOrder.forEach((item, index) => {
      onUpdateMiniApp({ ...item, order: index + 1 })
    })
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
          <Reorder.Item key={miniApp.id} value={miniApp} className="cursor-default">
            <MiniAppSettings miniApp={miniApp} onUpdateMiniApp={onUpdateMiniApp} />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  )
}

export default MobileSettings
