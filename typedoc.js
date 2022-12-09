const pkg = require('./package.json');

module.exports = {
    "name": pkg.config.typedocName,
    "out": "doc",
    "entryPoints": [
        "./src/index.ts"
    ],
    "exclude": "**/node_modules/**",
    "tsconfig": "./tsconfig.doc.json",
    "readme": "none",
    "sort": ["instance-first", "visibility", "source-order"],
    "includeVersion": false,
    "excludeExternals": false,
    "excludePrivate": false,
    "excludeProtected": false,
    "excludeInternal": false,
}
