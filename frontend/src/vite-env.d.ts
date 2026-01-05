/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  [key: string]: any;
}

// Extend ImportMeta interface globally
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

