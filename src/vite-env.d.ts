/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_ENV: 'development' | 'production' | string
  readonly VITE_APP_CONTEXT_PATH: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_PORT: string
  readonly VITE_TAG_MATCHER_ANALYZE_URL: string
  readonly VITE_ANALOGY_RISK_AGENT_URL: string
  readonly VITE_ANALOGY_RISK_TENANT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
