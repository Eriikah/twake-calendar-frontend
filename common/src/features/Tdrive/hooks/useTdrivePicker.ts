import { useCallback, useRef, useState } from 'react'
import { useAppSelector } from '@common/app/hooks'
import Intents from 'cozy-interapp'
import { exchangeToken } from '../TdriveDao'
import { useTdriveUserContext } from './useTdriveUserContext'
import { createMockCozyClient } from '../cozyClientMock'

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

function convertIntentResultToFile(result: unknown): TdriveFile | null {
  if (!result || typeof result !== 'object') return null

  const doc = result as Record<string, unknown>

  const str = (v: unknown): string | undefined =>
    typeof v === 'string' && v.length > 0 ? v : undefined

  const id = str(doc.id) ?? str(doc._id) ?? str(doc.file_id)
  const name = str(doc.name) ?? str(doc.filename) ?? 'Unnamed'
  const url = str(doc.url) ?? str(doc.sharingLink) ?? str(doc.downloadLink)

  if (!id || !url) return null

  return {
    id,
    name,
    url,
    type:
      str(doc.sharingLink) !== undefined || doc.type === 'sharingLink'
        ? 'sharingLink'
        : 'downloadLink'
  }
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

    if (!tdriveBaseUrl) {
      setOpenPickerError('tdriveUrlNotConfigured')
      return
    }

    if (!idToken) {
      setOpenPickerError('tdriveTokenUnavailable')
      return
    }

    const cancellationRef = { cancelled: false }
    activeCancellationRef.current = cancellationRef

    setIsOpen(true)

    try {
      const tokenResponse = await exchangeToken(tdriveBaseUrl, idToken)

      if (cancellationRef.cancelled) return

      const mockClient = createMockCozyClient({
        uri: tdriveBaseUrl,
        token: tokenResponse.access_token
      })

      const intents = new Intents({ client: mockClient })

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
          console.debug('Tdrive picker iframe loaded')
        },
        onReadyToUse: () => {
          readyCallbackRef.current?.()
        }
      })

      if (cancellationRef.cancelled) return

      const file = convertIntentResultToFile(result)
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
  }, [tdriveBaseUrl, idToken, onFileSelected])

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
