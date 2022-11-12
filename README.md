<p style="text-align:center" align="center">
    <a href="https://prebuilder.anfadev.com/"><img width=80 src="https://prebuilder.anfadev.com/images/prebuilder-logo.svg"></img></a>
</p>

<h1 style="text-align:center" align="center">Prebuilder</h1>

<p style="text-align:center" align="center">
    <a href="https://www.npmjs.com/package/prebuilder" alt="Npm version">
        <img src="https://img.shields.io/npm/v/prebuilder">
    </a>
    <a href="https://packagephobia.com/result?p=prebuilder" alt="Licence">
        <img src="https://packagephobia.com/badge?p=prebuilder">
    </a>
    <a href="https://github.com/prebuilderjs/prebuilder" alt="Licence">
        <img src="https://img.shields.io/github/license/prebuilderjs/prebuilder">
    </a>
    <img src="https://visitor-badge.glitch.me/badge?page_id=prebuilderjs.prebuilder&style=flat">
</p>

<p style="text-align:center" align="center">
A pre-processor that allows for C#-like directives for <span style="color: #a59b28; font-weight:bold">Javascript</span>, <span style="color: #126f9b; font-weight:bold">Typescript</span>, <span style="color: #b3690f; font-weight:bold">Rust</span>, <span style="color: #969762; font-weight:bold">Python</span> & any other text-based file!
</p>

## Motivation

When building anything with javascript / typescript, sometimes we would want to have granular control over our codebase
by conditionally including/excluding code or have different code for a specific build preset.

This is very useful in various cases, like for example:
- Building different versions for:
    - different platforms
        - ex: having a *windows* / *unix* specific default path
        - ex: having a different api url for *desktop* / *mobile* platforms
        - ex: importing "path" when building for *Node.js*, or npm's "browser-path" when building for *browser*
    - different client / server versions
- Migrating to a newer version of a dependecy, in a non-destructive way, by retaining old version of code (allowing to go back if needed).
- Enabling *assertions*, *debugging* and any sort of *backdoor* in non-production builds.
- Simplifying unit testing by including test functions only in non-production builds.

## Features
- Source analysis: <br>remembers which are unchanged source files, and skips them for a faster preprocess.
- Comprehensive internal flow checks: <br>preprocess errors like for a missing `#endif` do not stop prebuilding mid-way avoiding any loss of unresolved code.

## Install

```sh
npm i --save-dev prebuilder
```

## Commands

### Resolve:
Resolves directives in every script of a given source folder, and caches their original versions.
```sh
prebuild resolve --dir "src"
```

|       Parameters       |        Required       |   Needs value   |      Example                                                                                   |
|    ---                 |          :---:        |      :---:      |        ---                                                                                     |
| `--dir`                | Yes                   | Yes             | `prebuild resolve --dir "src/somefolder"`                                                      |
| `--formats`            | No                    | Yes             | `prebuild resolve --formats ".js"`<br>`--formats ".js, .ts, .cpp"`                             |
| `--log`                | No                    | No              |                                                                                                |
| `--preprocessDefines`  | No                    | Yes             | `prebuild resolve --preprocessDefines "MY_DEF"`<br>`--preprocessDefines "DEFINE1, DEFINE2"`    |
| `--preprocessMode`     | No                    | Yes             | `prebuild resolve --preprocessMode "both"`                                                     |


### Restore:
Restores back original scripts (with unresolved directives).
```sh
prebuild restore
```

|       Parameters       |        Required       |   Needs value   |
|    ---                 |          :---:        |      :---:      |
| `--log`                | No                    | No              |

### Start:
Resolves scripts, executes a given command then restores them back.<br> 
This is useful to run bundlers and linters on resolved code, thus avoiding runtime errors.
```sh
prebuild start "my command" --dir "src"
```
|       Parameters       |        Required       |   Needs value   |      Example                                                                     |
|    ---                 |          :---:        |      :---:      |        ---                                                                       |
| first parameter        | Yes                   | Yes             | `prebuild start "npx run build"`                                                 |
| all of "resolve" <br>command's parameters  |       |                 | `prebuild start "npx run build" --dir "src" --log`                               |


```sh
# examples for bundling your app with resolved code:
# - webpack
prebuild start "npx webpack --config example.config.js" --dir "src"
# - typescript
prebuild start "npx tsc" --dir "src"
# - rollup
prebuild start "npx rollup -c rollup.config.mjs" --dir "src"
```

### Help:
Prints command line info on this tool.
```sh
prebuild --help
```

## Parameter descriptions:
|       Parameters                    |        Expected values          |        Descriptions                                                                                                    |
|    ---                              |            ---                  |            ---                                                                                                         |
| start command's<br> first parameter |                                 |                                                                                                                        |
| `--dir`                             | path (string)                   | Source folder's relative path.                                                                                         |
| `--log`                             |                                 | Enable debug logging.                                                                                                  |
| `--formats`                         | extention, or set of <br>extentions separated <br>by a comma `,` (string)     | List of file formats to preprocess.                                      |
| `--preprocessDefines`               | define, or set of <br>defines separated <br>by a comma `,` (string)           | List of defines based on which to validate #if statements.               |
| `--preprocessMode`                  | `"plain"\|"commented"\|"both"`  | Wether to preprocess directives written plainly `#if` or in a comment `//#if`. Default value is "both".                |

## Other packages
Currently these packages are alongside this project:
- [`@prebuilder/lib`](./Packages/lib) A preprocess utility usable in Node.js and/or in the browser
- [`@prebuilder/rollup-plugin`](./Packages/rollup-plugin) A rollup plugin for an easier time

## Use case example

```sh
prebuild resolve --dir "src" --preprocessDefines "MY_DIRECTIVE, TARGET_BROWSER, ANDROID"
```

source code :

```c#

// ----------------- CASE 1 -----------------
// import statement, depending on platform
#if TARGET_BROWSER
import path from 'browser-path';
#else
const path = require('path');
#endif

class MyClass {

    constructor() {
        this.fetchedData = fetchSomeData();
    }

    // ----------------- CASE 2 -----------------
    // debugging & testing

    #if DEBUG
    // log info
    console.log("using api: " + myConfig.apiUrl);
    // test
    Test = () => {
        console.log("running MyClass test");

        try {
            JSON.parse(this.fetchedData);
            console.log("✔ data is valid");
        } catch {
            console.error("✘ data is not valid");
        }
    }
    #endif

    // ----------------- CASE 3 -----------------
    // Function definition, depending on feature support:

    // negative #if
#if !PARAM_2_SUPPORTED
    myFunction = (param) => {
        return param + 1;
    }
#else
    myFunction = (param1, param2) => {
        return param * param2 + 1;
    }
#endif

    // ----------------- CASE 4 -----------------
    // Variable definition, depending on platform:

    // commented mode
//#if ANDROID
    myConfig = {
        apiUrl: "https://.api.some-site.net/android",
        greeting: "Hi Android user!",
    };
//#endif
//#if IOS
    //#post-code myConfig = {
    //#post-code     apiUrl: "https://.api.some-site.net/ios",
    //#post-code     greeting: "Hi iOS user!"
    //#post-code };
//#endif

}
```

resolved code :

```js
import path from 'browser-path';

class MyClass {

    constructor() {
        this.fetchedData = fetchSomeData();
    }

    myFunction = (param) => {
        return param + 1;
    }

    myConfig = {
        apiUrl: "https://.api.some-site.net/android"
    };
}
```
</details>

## Planned features
- [x] use a config .json file
- [ ] add possibility to include / exclude files/folders
- [ ] implement `#elseif` directive
- [ ] implement `#put` directive
- [ ] implement `#define-local` directive
- [ ] support html comments (for comment mode)
- [ ] support css comments (for comment mode)
- [ ] allow to have `#else` / `#endif` in same line as `#if`
- [ ] directive extensibility

## Current limitations
- commented mode requires no space between double slash and directive `//#if` not `// #if` (solution planned).
- preduild start doesn't support running cli tools in watch mode.

## Warnings ⚠️
- When using resolve and restore manually, be sure to restore as soon as possible, thus avoiding to forget and modify resolved code that will be overwritten on restore, or commit resolved code instead of the original.
- When executing npm commands with preduild start, be sure to use `npx` instead of `npm`, for more information read this [issue](https://stackoverflow.com/questions/9679932/how-to-use-executables-from-a-package-installed-locally-in-node-modules).
- When executing npm commands with preduild start, avoid using commands that run continuously, such as bundlers in watch mode, source files will be restored (overwritten) only when command has finished!, this means that any change made to source code while command is running, will be lost!

## Licence

[MIT](https://github.com/prebuilderjs/prebuilder/blob/main/README.md)