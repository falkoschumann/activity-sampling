declare global {
  interface Window {
    electron: {
      ping: () => void
      process: {
        versions: {
          electron: string
          chrome: string
          node: string
        }
      }
    }
    api: unknown
  }
}

export {}
