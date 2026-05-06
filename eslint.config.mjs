import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Worktrees Claude et fichiers générés
    ".claude/**",
    "nextjs-temp/**",
    "node_modules/**",
    // Legacy vanilla JS
    "assets/**",
  ]),
  // ─── Overrides de règles pour ce projet ───────────────────────────────────
  {
    rules: {
      // Les function declarations sont hoistées — autoriser leur usage avant déclaration
      // (pattern courant dans les composants React avec async function load())
      '@typescript-eslint/no-use-before-define': ['error', {
        functions: false,
        classes: false,
        variables: true,
      }],
      // Pattern valide : useEffect(() => { void asyncLoad() }, [asyncLoad])
      // asyncLoad est async, setState n'est pas appelé de façon synchrone
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);

export default eslintConfig;
