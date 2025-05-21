import { describe, it, expect } from 'vitest'
import { removeOverlappingGridItems } from '../src/common/lib/utils/layout'

describe('removeOverlappingGridItems', () => {
  it('removes overlapping items and matching fidgets', () => {
    const config = {
      layoutDetails: { layoutConfig: { layout: [
        { i: 'a', x: 0, y: 0, w: 2, h: 2 },
        { i: 'b', x: 1, y: 1, w: 2, h: 2 },
        { i: 'c', x: 3, y: 3, w: 1, h: 1 },
      ] } },
      fidgetInstanceDatums: { a: {}, b: {}, c: {} },
    } as any

    removeOverlappingGridItems(config)

    expect(config.layoutDetails!.layoutConfig!.layout.map((l: any) => l.i)).toEqual(['a', 'c'])
    expect(config.fidgetInstanceDatums!.b).toBeUndefined()
  })

  it('does nothing when no overlap', () => {
    const config = {
      layoutDetails: { layoutConfig: { layout: [
        { i: 'a', x: 0, y: 0, w: 2, h: 2 },
        { i: 'b', x: 2, y: 0, w: 2, h: 2 },
      ] } },
      fidgetInstanceDatums: { a: {}, b: {} },
    } as any

    removeOverlappingGridItems(config)

    expect(config.layoutDetails!.layoutConfig!.layout.length).toBe(2)
    expect(config.fidgetInstanceDatums!.a).toBeDefined()
    expect(config.fidgetInstanceDatums!.b).toBeDefined()
  })
})
