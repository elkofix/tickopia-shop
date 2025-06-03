import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["sst.config.ts"],
  },
  ...compat.config({
    extends: ['next'],
    rules: {
      "no-unused-vars": "off",
      '@next/next/no-img-element': 'off',
      "@typescript-eslint/no-unused-vars": "off", // si usas TypeScript
      "unused-imports/no-unused-imports": "off",   // si usas ese plugin
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",

    },
  }),
]

export default eslintConfig;
