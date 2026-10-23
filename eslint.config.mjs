// Solo reglas de Playwright (eslint-plugin-playwright) sobre los tests, los page objects y los fixtures.
// No es un linter de estilo: busca lo que hace frágil un test o esconde un fallo.
import playwright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

const recommended = playwright.configs["flat/recommended"];

export default [
    {
        ...recommended,
        files: ["tests/**/*.ts", "pages/**/*.ts", "fixtures/**/*.ts"],
        languageOptions: { ...recommended.languageOptions, parser: tseslint.parser },
    },
];
