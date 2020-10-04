# @averjs/typescript-runtime

Official aver package for typescript support on the runtime side with `ts-node`.

## Usage

Install the package

```bash
$ yarn add --dev @averjs/typescript-runtime
#or
$ npm i -D @averjs/typescript-runtime
```

Now you can update your scripts inside your package.json to use the new executable `aver-ts`.

```json
{
  "scripts": {
    "dev": "aver-ts",
    "live": "aver-ts prod",
    "build": "aver-ts build",
    //...
  }
}
```

## CLI

This package is just a wrapper for the official `@averjs/cli`. It registers `ts-node` in order for the node process to able to compile your runtime typescript files. The default aver cli commands are still available and can be used as usual. In addition there are the following new commands.

### ts-init

This command initializes your typescript aver project, by adding the `tsconfig.json` and a `tsconfig.server.json` files to the root of your project.