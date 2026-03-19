import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { outputSuccess, outputError } from '../src/output.js'

describe('output', () => {
  let stdoutWrite: ReturnType<typeof vi.spyOn>
  let stderrWrite: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    stdoutWrite = vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    stderrWrite = vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
  })

  afterEach(() => {
    stdoutWrite.mockRestore()
    stderrWrite.mockRestore()
  })

  it('outputs success JSON to stdout', () => {
    outputSuccess({ title: 'test' })
    const output = stdoutWrite.mock.calls[0][0] as string
    expect(JSON.parse(output)).toEqual({ data: { title: 'test' } })
  })

  it('outputs error JSON to stderr', () => {
    outputError('not found', 'NOT_FOUND')
    const output = stderrWrite.mock.calls[0][0] as string
    expect(JSON.parse(output)).toEqual({ error: 'not found', code: 'NOT_FOUND' })
  })

  it('outputs error with default code', () => {
    outputError('something broke')
    const output = stderrWrite.mock.calls[0][0] as string
    expect(JSON.parse(output)).toEqual({ error: 'something broke', code: 'ERROR' })
  })
})
