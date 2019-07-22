module.exports = {
    parser: 'typescript-eslint-parser',
    env: {
        browser: false,
        es6: true,
        node: true
    },
    // extends: ["eslint:recommended"],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },
    parserOptions: {
        ecmaVersion: 2018,
        parser: "babel-eslint",
        sourceType: "module",
        ecmaFeatures: {
            legacyDecorators: false
        }
    },
    plugins: ["typescript"],
    rules: {
        indent: ["error", 4],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "single"],
        semi: ["error", "always"],
        // 类和接口的命名必须遵守帕斯卡命名法，比如 PersianCat
        'typescript/class-name-casing': 'error'
    }
};
