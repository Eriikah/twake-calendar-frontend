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

  const id =
    (doc.id as string) || (doc._id as string) || (doc.file_id as string)
  const name = (doc.name as string) || (doc.filename as string) || 'Unnamed'
  const url =
    (doc.url as string) ||
    (doc.sharingLink as string) ||
    (doc.downloadLink as string)

  if (!id || !url) return null

  return {
    id,
    name,
    url,
    type:
      doc.sharingLink || doc.type === 'sharingLink'
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
  // Callback registered by the dialog to be called when the iframe is ready
  const readyCallbackRef = useRef<(() => void) | null>(null)

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

    setIsOpen(true)

    try {
      const tokenResponse = await exchangeToken(tdriveBaseUrl, idToken)

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

      const result = await intent.start(containerRef.current ?? document.body, {
        onReady: () => {
          console.debug('Tdrive picker iframe loaded')
        },
        onReadyToUse: () => {
          readyCallbackRef.current?.()
        }
      })

      const file = convertIntentResultToFile(result)
      if (file) {
        onFileSelected(file)
      }
    } catch (error) {
      console.error('Failed to open Tdrive picker:', error)
      setOpenPickerError('tdrivePickerFailed')
    } finally {
      intentRef.current = null
      readyCallbackRef.current = null
      setIsOpen(false)
    }
  }, [tdriveBaseUrl, idToken, onFileSelected])

  const closePicker = useCallback(() => {
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
