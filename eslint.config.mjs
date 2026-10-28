import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores([
    // Arquivos e pastas gerados pelo Next.js
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Service worker gerado pelo Serwist
    "public/sw.js",
  ]),
]);

export default eslintConfig;
