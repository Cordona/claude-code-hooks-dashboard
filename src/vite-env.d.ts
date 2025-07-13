/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_BASE_URL: string
  readonly VITE_EVENTS_STREAM_PATH: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENABLE_DEVTOOLS: string
  readonly VITE_ENABLE_MSW: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
