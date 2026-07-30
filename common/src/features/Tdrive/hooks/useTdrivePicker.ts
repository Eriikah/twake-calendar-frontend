import { useAppSelector } from '@common/app/hooks'
import Intents from 'cozy-interapp'
import { useCallback, useRef, useState } from 'react'
import { exchangeToken, fetchIntentJSON } from '../TdriveDao'
import { useTdriveUserContext } from './useTdriveUserContext'

export interface TdriveFile {
  id: string
  name: string
  url: string
  type: 'sharingLink' | 'downloadLink'
}

interface UseTdrivePickerReturn {
  isOpen: boolean
  containerRef: React.RefObject<HTMLDivElement>
  openPickerError: string | null
  openPicker: () => Promise<void>
  closePicker: () => void
  onReadyToUse: (callback: () => void) => void
}

interface UseTdrivePickerProps {
  onFileSelected: (file: TdriveFile) => void
}

function extractString(
  doc: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = doc[key]
    if (typeof value === 'string' && value.length > 0) {
      return value
    }
  }
  return undefined
}

function getFileType(
  doc: Record<string, unknown>
): 'sharingLink' | 'downloadLink' {
  const sharingLink = doc.sharingLink
  if (
    (typeof sharingLink === 'string' && sharingLink.length > 0) ||
    doc.type === 'sharingLink'
  ) {
    return 'sharingLink'
  }
  return 'downloadLink'
}

function convertIntentResultToFile(result: unknown): TdriveFile | null {
  if (!result || typeof result !== 'object') return null

  const doc = result as Record<string, unknown>

  const id = extractString(doc, ['id', '_id', 'file_id'])
  const name = extractString(doc, ['name', 'filename']) ?? 'Unnamed'
  const url = extractString(doc, ['url', 'sharingLink', 'downloadLink'])

  if (!id || !url) return null

  return {
    id,
    name,
    url,
    type: getFileType(doc)
  }
}

interface StartTdrivePickerOptions {
  tdriveBaseUrl: string
  idToken: string
  containerRef: React.RefObject<HTMLDivElement | null>
  readyCallbackRef: React.MutableRefObject<(() => void) | null>
  cancellationRef: { cancelled: boolean }
  intentRef: React.MutableRefObject<{ stop?: () => void } | null>
}

async function startTdrivePicker({
  tdriveBaseUrl,
  idToken,
  containerRef,
  readyCallbackRef,
  cancellationRef,
  intentRef
}: StartTdrivePickerOptions): Promise<{
  file: TdriveFile | null
  intent: { stop?: () => void }
}> {
  const tokenResponse = await exchangeToken(tdriveBaseUrl, idToken)

  if (cancellationRef.cancelled) {
    return { file: null, intent: {} }
  }

  const intents = new Intents({
    fetch: fetchIntentJSON({
      tdriveBaseUrl,
      accessToken: tokenResponse.access_token
    })
  })

  const intent = intents.create(
    'PICK',
    'io.cozy.files',
    { actions: [{ sharingLink: { label: 'Add as link' } }] },
    ['GET']
  )

  intentRef.current = intent

  if (!containerRef.current) {
    throw new Error('Picker container is not mounted')
  }

  const result = await intent.start(containerRef.current, {
    onReady: () => {
      console.info('Tdrive picker iframe loaded')
    },
    onReadyToUse: () => {
      readyCallbackRef.current?.()
    }
  })

  if (cancellationRef.cancelled) {
    return { file: null, intent }
  }

  const file = convertIntentResultToFile(result)
  return { file, intent }
}

export function useTdrivePicker({
  onFileSelected
}: UseTdrivePickerProps): UseTdrivePickerReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [openPickerError, setOpenPickerError] = useState<string | null>(null)

  const { tdriveBaseUrl } = useTdriveUserContext()
  const idToken = useAppSelector(state => state.user.tokens?.id_token)

  const containerRef = useRef<HTMLDivElement>(null)
  const intentRef = useRef<{ stop?: () => void } | null>(null)
  const readyCallbackRef = useRef<(() => void) | null>(null)
  const activeCancellationRef = useRef<{ cancelled: boolean } | null>(null)

  const onReadyToUse = useCallback((callback: () => void) => {
    readyCallbackRef.current = callback
  }, [])

  const openPicker = useCallback(async () => {
    setOpenPickerError(null)

    const validationError =
      (isOpen && 'alreadyOpen') ||
      (!tdriveBaseUrl && 'tdriveUrlNotConfigured') ||
      (!idToken && 'tdriveTokenUnavailable') ||
      null

    if (validationError) {
      if (validationError !== 'alreadyOpen') {
        setOpenPickerError(validationError)
      }
      return
    }

    const cancellationRef = { cancelled: false }
    activeCancellationRef.current = cancellationRef

    setIsOpen(true)

    try {
      const { file } = await startTdrivePicker({
        tdriveBaseUrl,
        idToken,
        containerRef,
        readyCallbackRef,
        cancellationRef,
        intentRef
      })

      if (cancellationRef.cancelled) return

      if (file) {
        onFileSelected(file)
      }
    } catch (error) {
      if (cancellationRef.cancelled) return
      console.error('Failed to open Tdrive picker:', error)
      setOpenPickerError('tdrivePickerFailed')
    } finally {
      if (!cancellationRef.cancelled) {
        intentRef.current = null
        readyCallbackRef.current = null
        setIsOpen(false)
      }
    }
  }, [isOpen, tdriveBaseUrl, idToken, onFileSelected])

  const closePicker = useCallback(() => {
    if (activeCancellationRef.current) {
      activeCancellationRef.current.cancelled = true
      activeCancellationRef.current = null
    }
    if (typeof intentRef.current?.stop === 'function') {
      intentRef.current.stop()
    }
    intentRef.current = null
    readyCallbackRef.current = null
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    containerRef,
    openPickerError,
    openPicker,
    closePicker,
    onReadyToUse
  }
}
