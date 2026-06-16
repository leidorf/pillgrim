module.exports = {
  plugins: ["import", "unused-imports", "react"],
  rules: {
    "unused-imports/no-unused-imports": "error",
    "import/no-unused-modules": ["error", { unusedExports: true }],
    "react/no-unused-prop-types": "error"
  }
};