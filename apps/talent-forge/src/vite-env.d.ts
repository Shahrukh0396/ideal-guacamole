/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly TF_API_BASE: string;
  readonly TF_TENANT_ID: string;
  readonly TF_SPA_CLIENT_ID: string;
  readonly TF_API_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
