/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CONTENT_ADMIN_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
