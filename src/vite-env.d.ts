// Fix: Replaced the non-working vite/client reference with a manual definition
// of ImportMetaEnv to make Vite environment variables available to TypeScript.
// This resolves errors related to `import.meta.env` and the missing type definition file.

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
