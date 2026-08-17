export interface TdriveFile {
  id: string
  name: string
  url: string
  type: 'sharingLink' | 'downloadLink'
  mimeType: string | null
}
