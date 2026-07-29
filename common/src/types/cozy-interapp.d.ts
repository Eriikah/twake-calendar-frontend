declare module 'cozy-interapp' {
  export interface IntentData {
    actions?: Array<{
      sharingLink?: { label: string }
      downloadLink?: { label: string }
    }>
    [key: string]: unknown
  }

  export interface IntentOptions {
    onReady?: () => void
    onReadyToUse?: () => void
    onHideCross?: () => void
    onShowCross?: () => void
  }

  export interface IntentResult {
    [key: string]: unknown
  }

  export interface IntentPromise extends Promise<IntentResult> {
    start: (element: Element, options?: IntentOptions) => Promise<IntentResult>
    stop?: () => void
  }

  export interface CozyClientLike {
    stackClient: {
      fetchJSON: (
        method: string,
        path: string,
        body?: unknown
      ) => Promise<unknown>
    }
  }

  export interface IntentsOptions {
    client: CozyClientLike
  }

  export default class Intents {
    constructor(options: IntentsOptions)
    create(
      action: string,
      type: string,
      data?: IntentData,
      permissions?: string[]
    ): IntentPromise
    createService(
      intentId?: string,
      serviceWindow?: Window
    ): Promise<{
      compose: (
        action: string,
        doctype: string,
        data: IntentData
      ) => Promise<IntentResult>
      getData: () => IntentData
      getIntent: () => IntentResult
      resizeClient: (
        dimensions: Record<string, unknown>,
        transitionProperty?: string
      ) => void
      terminate: (doc: IntentResult) => void
      cancel: () => void
      throw: (error: Error) => void
      hideCross: () => void
      showCross: () => void
      notifyReadyToUse: () => void
    }>
  }
}
