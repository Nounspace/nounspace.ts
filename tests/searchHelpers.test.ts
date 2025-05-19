import { describe, it, expect } from 'vitest'
import type { NextApiRequest } from 'next/types'
import { _isMaybeFid, _isMaybeAddress, _validateQueryParams, QuerySchema } from '../src/pages/api/search/users'

describe('_isMaybeFid', () => {
  it('returns true for numeric strings', () => {
    expect(_isMaybeFid('123')).toBe(true)
    expect(_isMaybeFid('-45')).toBe(true)
  })

  it('returns false for non-numeric strings', () => {
    expect(_isMaybeFid('abc')).toBe(false)
  })
})

describe('_isMaybeAddress', () => {
  it('returns true for valid address', () => {
    expect(_isMaybeAddress('0x' + 'a'.repeat(40))).toBe(true)
  })

  it('returns false for invalid address', () => {
    expect(_isMaybeAddress('0x1234')).toBe(false)
  })
})

describe('_validateQueryParams', () => {
  it('returns params for valid input', () => {
    const req = { query: { q: 'hello', limit: '5' } } as unknown as NextApiRequest
    const [params, error] = _validateQueryParams(req, QuerySchema)
    expect(error).toBeNull()
    expect(params).not.toBeNull()
    expect(params!.q).toBe('hello')
    expect(params!.limit).toBe(5)
  })

  it('returns error for invalid input', () => {
    const req = { query: { q: 'a'.repeat(21) } } as unknown as NextApiRequest
    const [params, error] = _validateQueryParams(req, QuerySchema)
    expect(params).toBeNull()
    expect(error).not.toBeNull()
  })
})
