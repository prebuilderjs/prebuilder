<p style="text-align:center" align="center">
    <a href="https://prebuilder.anfadev.com/"><img width=80 src="https://prebuilder.anfadev.com/images/prebuilder-logo.svg"></img></a>
</p>

<h1 style="text-align:center" align="center">Prebuilder</h1>

<p style="text-align:center" align="center">
    <a href="https://www.npmjs.com/package/prebuilder" alt="Npm version">
        <img src="https://img.shields.io/npm/v/prebuilder">
    </a>
    <a href="https://packagephobia.com/result?p=prebuilder" alt="Size">
        <img src="https://packagephobia.com/badge?p=prebuilder">
    </a>
    <a href="https://github.com/prebuilderjs/prebuilder" alt="Licence">
        <img src="https://img.shields.io/github/license/prebuilderjs/prebuilder">
    </a>
    <img src="https://visitor-badge.glitch.me/badge?page_id=prebuilderjs.prebuilder&style=flat">
</p>

<p style="text-align:center" align="center">
A pre-processor that brings C#-like directives to <span style="color: #a59b28; font-weight:bold">Javascript</span>, <span style="color: #126f9b; font-weight:bold">Typescript</span>, <span style="color: #b3690f; font-weight:bold">Rust</span>, <span style="color: #969762; font-weight:bold">Python</span> & any other text-based file!
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

---

<details>
<summary>
  <h2 style="display:inline-block">Use case examples</h2>
  <span style="white-space: pre;">    (click)</span>
</summary>
Using:

```sh
prebuild resolve --srcDir "src" --preprocessDefines "TARGET_BROWSER, ANDROID"
```

### Case 1) import depending on target platform
<table>
    <tr>
        <th>Original</th>
        <th>Resolved</th>
    </tr>
    <tr>
<td>

```c#
#if TARGET_BROWSER
import path from 'browser-path';
#else
const path = require('path');
#endif
```
<!-- these need to no be indented -->
</td>
<td>

```c#

import path from 'browser-path';



```

</td>
    </tr>
</table>

### Case 2) debugging & testing
<table>
    <tr>
        <th>Original</th>
        <th>Resolved</th>
    </tr>
    <tr>
<td>

```c#
class MyClass {

   constructor(apiUrl) {
       this.apiUrl = apiUrl;
       this.myData = fetchData(apiUrl);
   }

   #if DEBUG
   // log info
   console.log("api: " +this.apiUrl);
   // test
   Test = () => {
      console.log("MyClass test:");

      try {
         JSON.parse(this.myData);
         console.log("data ✔");
      } catch {
         console.error("data ✘");
      }
   }
   #endif
}
```
<!-- these need to no be indented -->
</td>
<td>

```c#
class MyClass {

   constructor(apiUrl) {
      this.apiUrl = apiUrl;
      this.myData = fetchData(apiUrl);
   }















}
```

</td>
    </tr>
</table>

### Case 3) Function definition depending on feature support
<table>
    <tr>
        <th>Original</th>
        <th>Resolved</th>
    </tr>
    <tr>
<td>

```c#
    // negative #if
#if !PARAM_2_SUPPORTED
    var myFunction = (param) => {
        return param + 1;
    }
#else
    var myFunction = (param1, param2) => {
        return param * param2 + 1;
    }
#endif
```
<!-- these need to no be indented -->
</td>
<td>

```c#


    var myFunction = (param) => {
        return param + 1;
    }





```

</td>
    </tr>
</table>

### Case 4) Variable definition depending on platform
<table>
    <tr>
        <th>Original</th>
        <th>Resolved</th>
    </tr>
    <tr>
<td>

```c#
    // commented mode
//#if ANDROID
   myConfig = {
      apiUrl:"api.site.net/android",
      greeting: "Hi Android user!",
   };
//#endif
//#if IOS
   //#post-code myConfig = {
   //#post-code    apiUrl: "api.site.net/ios",
   //#post-code    greeting: "Hi iOS user!"
   //#post-code };
//#endif
```
<!-- these need to no be indented -->
</td>
<td>

```c#


myConfig = {
    apiUrl: "api.site.net/android",
    greeting: "Hi Android user!",
};







```

</td>
    </tr>
</table>

</details>

---

## Commands

<details>
<summary>
  <h3 style="display:inline-block">Resolve:</h3>
  <span style="white-space: pre;">    (click)</span>
</summary>

Resolves directives in every script of a given source folder, and caches their original versions.
```sh
prebuild resolve --srcDir "src"
```

![](.screenshots/prebuild%20resolve.svg)

|       Parameters      |        Required       |  Needs value  |      Examples                                                                                |
|    ---                |          :---:        |     :---:     |        ---                                                                                   |
| `--srcDir`            | ✔                     | ✔            | `prebuild resolve --srcDir "src/somefolder"`                                                 |
| `--outDir`            | ✔ (unless <br>`--onTheSpot` is used) | ❌             | `prebuild resolve --outDir "output"`                                        |
| `--formats`           | ❌                    | ✔            | `prebuild resolve --formats ".js"`<br>`--formats ".js, .ts, .cpp"`                           |
| `--onTheSpot`         | ❌                    | ❌           |                                                                                              |
| `--log`               | ❌                    | ❌           |                                                                                              |
| `--watch`             | ❌                    | ❌           |                                                                                              |
| `--preprocessDefines` | ❌                    | ✔            | `prebuild resolve --preprocessDefines "MY_DEF"`<br>`--preprocessDefines "DEFINE1, DEFINE2"`  |
| `--preprocessMode`    | ❌                    | ✔            | `prebuild resolve --preprocessMode "both"`                                                   |
| `--config`            | ❌                    | ✔            | `prebuild resolve --config "myprebulder.config.js"`                                          |

</details>

<details>
<summary>
  <h3 style="display:inline-block">Restore:</h3>
  <span style="white-space: pre;">    (click)</span>
</summary>

Restores back original scripts (with unresolved directives) if resolved with --onTheSpot mode.
```sh
prebuild restore
```

|       Parameters       |     Required     |   Needs value   |
|    ---                 |       :---:      |      :---:      |
| `--log`                | ❌              | ❌              |

</details>

<details>
<summary>
  <h3 style="display:inline-block">Wrap:</h3>
  <span style="white-space: pre;">    (click)</span>
</summary>

Resolves scripts, executes a given command then restores them back.<br> 
This is useful to run bundlers and linters on resolved code, thus avoiding runtime errors.
```sh
prebuild wrap "my command" --srcDir "src"
```

![](.screenshots/prebuild%20wrap.svg)

|       Parameters              |        Required       |  Needs value  |      Examples                                        |
|    ---                        |          :---:        |     :---:     |        ---                                           |
| first parameter               | ✔                    | ✔            | `prebuild wrap "npx run build"`                      |
| all of "resolve" <br>command's parameters  |          |               | `prebuild wrap "npx run build" --srcDir "src" --log` |
| `--wrap_RunCmdFirstTimeOnly`  | ❌                    | ❌           |                                                      |
| `--wrap_RunCmdInParallel`     | ❌                   | ❌           |                                                      |


```sh
# examples for bundling your app with resolved code:
# - webpack
prebuild wrap "npx webpack --config example.config.js" --srcDir "src"
# - typescript
prebuild wrap "npx tsc" --srcDir "src"
# - rollup
prebuild wrap "npx rollup -c rollup.config.mjs" --srcDir "src"
```

</details>

<details>
<summary>
  <h3 style="display:inline-block">Help:</h3>
  <span style="white-space: pre;">    (click)</span>
</summary>

Prints command line info on this tool.
```sh
prebuild --help
```

</details>

## Parameter descriptions:
|       Parameters              | alias |        Expected values          |        Descriptions                                                                                                    |
|    ---                        |  ---  |            ---                  |            ---                                                                                                         |
| wrap command's<br> first parameeter | |                                 | A non-persistent cli command                                                                                           |
| `--srcDir`                    | `-s`  | path (string)                   | Source folder's path.                                                                                                  |
| `--outDir`                    | `-o`  | path (string)                   | Output folder's path.                                                                                                  |
| `--log`                       | `-l`  |                                 | Enable debug logging.                                                                                                  |
| `--formats`                   | `-f`  | extention, or set of <br>extentions separated <br>by a comma `,` (string)     | List of file formats to preprocess.                                      |
| `--watch`                     | `-w`  |                                 | Watch source for changes, and auto-prebuild                                                                            |
| `--onTheSpot`                 |       |                                 | Resolve scripts keeping them in their source folder                                                                    |
| `--wrap_RunCmdFirstTimeOnly`  |       |                                 | Run command only the first time, when passing it to wrap() with watch mode active                                      |
| `--wrap_RunCmdInParallel`     |       |                                 | Run command in another process to avoid freezing prebuilder (useful to run tools in watch mode)                        |
| `--preprocessDefines`         |       | define, or set of <br>defines separated <br>by a comma `,` (string)           | List of defines based on which to validate <br>#if statements.           |
| `--preprocessMode`            |       | `"plain"` or<br>`"commented"` or<br>`"both"`  | Wether to preprocess directives written <br>plainly `#if` or in a comment `//#if`. <br>Default value is "both".  |
| `--config`                    | `-c`  | extention, or set of <br>extentions separated <br>by a comma `,` (string)     | List of file formats to preprocess.                                      |

---

## Planned features
- [x] use a config .js file
- [x] (optional) resolve files in same folder
- [x] watch mode
- [ ] include / exclude files & folders
- [ ] implement `#elseif` directive
- [ ] implement `#put` directive
- [ ] implement `#define-local` directive
- [ ] comment mode support for html
- [ ] comment mode support for css
- [ ] inline directives
- [ ] prebuild multiple sources concurrently
- [ ] directive extensibility
- [ ] config file extensibility

## Current limitations
- commented mode requires no space between double slash and directive `//#if` not `// #if` (solution planned).
- `preduild wrap` doesn't support running cli tools in watch mode.

## Warnings ⚠️
- When using resolve and restore manually, be sure to restore as soon as possible, thus avoiding to forget and modify resolved code that will be overwritten on restore, or commit resolved code instead of the original.
- When executing npm commands with `preduild wrap`, be sure to use `npx` instead of `npm`, for more information read this [issue](https://stackoverflow.com/questions/9679932/how-to-use-executables-from-a-package-installed-locally-in-node-modules).
- When executing npm commands with `preduild wrap`, avoid using commands that run continuously, such as bundlers in watch mode, source files will be restored (overwritten) only when command has finished!, this means that any change made to source code while command is running, will be lost!

## Other packages
Currently these packages are alongside this project:
- [`@prebuilder/lib`](https://github.com/prebuilderjs/lib) A preprocess utility usable in Node.js and/or in the browser
- [`@prebuilder/rollup-plugin`](https://github.com/prebuilderjs/rollup-plugin) A rollup plugin for an easier time
- [`@prebuilder/tsc`](https://github.com/prebuilderjs/tsc) A Prebuilder helper for an out of the box Typescript integration

<details>
<summary>
  <h2 style="display:inline-block">Changelog</h2>
  <span style="white-space: pre;">    (click)</span>
</summary>

### v 1.1
- Load configuration from file
- bugfix: parseArgs returns null

### v 1.2
- Added possibility to resolve files to a specific folder, as default
- resolution in same folder as source with --onTheSpot parameter
- resolve files to a specific folder as default with --outDir
- Renamed `preduild start` command to `preduild wrap`
- Renamed `--dir` command to `--srcDir`
- Hide temp folder on windows

### v 1.3
- Added watch mode
- Added wrap feature: run command only the first time, when passing it to wrap() with watch mode active (useful when running tools in watch mode)
- Added wrap feature: run command in another process to avoid freezing prebuilder (useful when running tools in watch mode)

</details>

## Licence

[MIT](https://github.com/prebuilderjs/prebuilder/blob/main/README.md)