// Fix: Manually define types for import.meta.env to resolve type errors
// when 'vite/client' types cannot be found. This makes the types available
// globally for the project.
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/**
 * Dichiara una costante globale per la versione dell'app, iniettata da Vite.
 * Questo approccio è più robusto rispetto a modificare `import.meta.env`.
 */
declare const __APP_VERSION__: string;
