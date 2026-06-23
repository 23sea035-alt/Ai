export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.expo/**"],
  },
  {
    rules: {
      "no-console": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
