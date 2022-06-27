module.exports = {
    extends: ["./node_modules/@labeg/code-style/.eslintrc.js"],
    ignorePatterns: ["node_modules/*"],
    rules:{
        // override here
        "react/jsx-no-bind": "off",
        "react/destructuring-assignment": "off",
    }
};
