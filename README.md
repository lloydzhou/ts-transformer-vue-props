# ts-transformer-vue-props
A TypeScript custom transformer which generate vue3 props for given type.

[![NPM version][npm-image]][npm-url]
[![Downloads](https://img.shields.io/npm/dm/ts-transformer-vue-props.svg)](https://www.npmjs.com/package/ts-transformer-vue-props)

# How to use this package

This package exports 2 functions.
One is `props` which is used in TypeScript codes to obtain props of given type, while the other is a TypeScript custom transformer which is used to compile the `props` function correctly.

## How to use `props`

```ts
import { props } from 'ts-transformer-vue-props';

interface Props {
  id: string;
  name: string;
  age: number;
}
const p = props<Props>();

console.log(p);
--->
{
    "id": String,
    "name": String,
    "age": Number
}
```

## How to use the custom transformer

Unfortunately, TypeScript itself does not currently provide any easy way to use custom transformers (See https://github.com/Microsoft/TypeScript/issues/14419).
The followings are the example usage of the custom transformer.

### webpack (with ts-loader or awesome-typescript-loader)

```js
// webpack.config.js
const propsTransformer = require('ts-transformer-vue-props/transformer').default;

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader', // or 'awesome-typescript-loader'
        options: {
          // make sure not to set `transpileOnly: true` here, otherwise it will not work
          getCustomTransformers: program => ({
              before: [
                  propsTransformer(program)
              ]
          })
        }
      }
    ]
  }
};

```

### Rollup (with rollup-plugin-typescript2)

```js
// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import propsTransformer from 'ts-transformer-vue-props/transformer';

export default {
  // ...
  plugins: [
    resolve(),
    typescript({ transformers: [service => ({
      before: [ propsTransformer(service.getProgram()) ],
      after: []
    })] })
  ]
};
```

### ttypescript

See [ttypescript's README](https://github.com/cevek/ttypescript/blob/master/README.md) for how to use this with module bundlers such as webpack or Rollup.

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "plugins": [
      { "transform": "ts-transformer-vue-props/transformer" }
    ]
  },
  // ...
}
```

# License

MIT

[npm-image]:https://img.shields.io/npm/v/ts-transformer-vue-props.svg?style=flat
[npm-url]:https://npmjs.org/package/ts-transformer-vue-props

