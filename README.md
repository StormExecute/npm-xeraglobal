# npm-xeraglobal [![NPM version][npm-image]][npm-url]

This tool installs modules in the default global directory(%GlobalDirNpm%) and the global home directory(%HOMEPATH%/.node_modules/), which allows you to include them in your project due to the specificity of the require function.

# Table of Contents

1. [Installation](#install)
2. [Migration](#_migration)
3. [Usage](#_usage)
4. [Troubleshooting](#_troubleshooting)
5. [About --delete-trash flag](#delete-trash)
6. [Local installing modules](#installingModules)
7. [Local removing modules](#removingModules)
8. [Packages upgrade](#upgrade)
9. [Sorting dependencies](#sortingDependencies)
10. [Reversing dependencies](#reversingDependencies)
11. [Removing dependencies](#removingDependencies)
12. [About --use-this-dir and --no-save flags](#useThisDirectoryAndNoSaveFlags)
13. [Unlinking](#unlink)
14. [Linking](#link)
15. [Global delete](#globalDelete)
16. [Examples](#_examples)
17. [Contacts](#_contacts)

# Changelog

[HERE!](https://github.com/StormExecute/npm-xeraglobal/blob/master/CHANGELOG.md)

<a name="install"></a>
# Installation

***To update, you should also run this command.***

```bash
npm install npm-xeraglobal -g
```

<a name="_migration"></a>
# Migration

***To migrate from version 2 to version 3 run the following commands:***

```bash
npmunxer && npm i npm -g && npm install npm-xeraglobal -g
```

<a name="_usage"></a>
# Usage

```bash
(sudo)? [npmx|npmxer|npmxeraglobal] [i|install] <...module > [--dt|--ns|--utd|--sd]
```

<a name="_troubleshooting"></a>
# Troubleshooting

***```sudo gulp task```: module gulp not found, as well as ```sudo webpack``` and ```sudo node```: module <moduleName> not found***:

This error occurs because node.js uses ```safeGetEnv("HOME")``` in ```Module._initPaths```. The solution is to use ```sudo --preserve-env (-E)``` - ```sudo -E gulp task```, ```sudo -E webpack```, ```sudo -E node nodefile```.

***Webpack installation:***

```
npm i webpack-cli --global && npmxer install webpack
```

***Gulp installation:***

```
npmxer install gulp
```

<a name="delete-trash"></a>
# About --delete-trash flag
```bash
npmx install <...module > [-dt|--dt|--delete-trash]
```

Its main task is to delete directories and files located in the root of the module and do not affect the main functionality, if, of course, they are there. It only checks for ```%HOME%/.node_modules/``` path, and the global folder will contain absolutely all files. README, as well as license, authors, and contributors files, are ignored and will not be deleted. Modules installed via @ are also ignored (for example, ```npmx i @babel/core```).

Will be found and deleted:
- Following folders:
	- .idea
	- .git
	- .github
	- example
	- examples
	- test
	- tests
- Following files:
	- .npmignore
	- .npmrc
	- .gitattributes
	- .gitignore
	- .gitmodules
	- .editorconfig
	- .eslintignore
	- .eslintrc
	- .travis.yml
	- .tidelift.yml
	- appveyor.yml
	- make + Make
	- makefile + Makefile
	- rakefile + Rakefile
	
<a name="installingModules"></a>
# Local installing modules

The official package manager can create nasty conflicts with already installed globally modules using this module, for example, delete information about them in package.json.

To install modules locally without conflicts, use the following command:

```bash
npmx [installLocal|il] <...module>
```

Example: ```npmx il someModule```.
Almost equivalent to this: ```npm i someModule```.

<a name="removingModules"></a>
# Local removing modules

The official package manager can create nasty conflicts with already installed globally modules using this module, for example, delete information about them in package.json.

To remove local modules without conflicts, use the following command: 

```bash
npmx [r|rm|rem|remove|uninstall|del|dl|d] <...module>
```

Example: ```npmxer r someModule```.
Almost equivalent to this: ```npm r someModule```.

<a name="upgrade"></a>
# Packages upgrade

This will update the package.json in the new project without loading the module again.

If the package.json does not exist - it will be created.

```bash
npmx [xerup|upxer|up|uppackages] <...packages> [-D|--save-dev]
```

Example: ```npmx up gulp webpack -D```.

<a name="sortingDependencies"></a>
# Sorting dependencies

This will sort dependencies and devDependencies by name.

```bash
npmx [xerup|upxer|up|uppackages] [s|srt|st|sort]
```

Example: ```npmx xerup sort```.

<a name="reversingDependencies"></a>
# Reversing dependencies

This will reverse the contrary dependencies and devDependencies.

```bash
npmx [xerup|upxer|up|uppackages] [rv|rvs|rvrs|reverse]
```

Example: ```npmx upxer rvrs```.

<a name="removingDependencies"></a>
# Removing dependencies

```bash
npmx [xerup|upxer|up|uppackages] [null|d|r|rm|rmv|remove|delete|dlt|dl|del] <...packages> [-D|--save-dev]
```

Example: ```npm uppackages null gulp webpack webpack-stream del```

<a name="useThisDirectoryAndNoSaveFlags"></a>
# About --use-this-dir and --no-save flags

***--use-this-dir:***

The **--use-this-dir**(--utd) flag was added to write dependencies to the directory from which the installation is performed (when installing ***into a project*** without --utd, the ***main project package*** is located).

```bash
npmx [install|i] <...module> [--utd|--use-this-dir]
```

***--no-save:***

Does not write dependencies to package.json .

```bash
npmx [install|i] <...module> [--ns|--no-save]
```

<a name="unlink"></a>
# Unlinking

This command will remove references to the global module from %HOMEPATH%/.node_modules/ .

```bash
npmx [unlink|unl] <...module>
```

<a name="link"></a>
# Linking

This command will allow you to re-link global modules to %HOMEPATH%/.node_modules/ .

```bash
npmx [link|l|lnk] <...module>
```

<a name="globalDelete"></a>
# Global delete

This collection of commands will allow you to uninstall what was installed with npmx install: 

```bash
npm unlink <...module> && npm remove --global <...module>
```

<a name="_examples"></a>
# Examples

First, install the modules.

```
D:\NodeProjects\yourProject> npmx i gulp
D:\NodeProjects\yourProject> npmx i browser-sync -D
```

Then create a file "index.js".

```javascript
"use strict";

const gulp = require("gulp");
const browserSync = require("browser-sync").create();

gulp.task("hello", cb => {
	console.log("Hello");
	cb();
})

gulp.task("serve", () => {

	browserSync.init({
		server: "front"
	});

	browserSync.watch("front/**/*.*").on("change", browserSync.reload);

});
```

And run it!

```
D:\NodeProjects\yourProject> gulp hello
D:\NodeProjects\yourProject> gulp serve
[ctrl+c] y
```

For new projects, gulp and browser-sync (in the context of this example) will be available as local modules.

**Now let's create a new project and update its dependencies.**

```
D:\NodeProjects\yourProject> cd .. && mkdir testProject && cd testProject
D:\NodeProjects\testProject> npmx xerup gulp browser-sync -D
```

Creating index.js:

```javascript
"use strict";

const gulp = require("gulp")

gulp.task("default", cb => {
	console.log("Hello World!")
	cb()
})
```

Run it:

```
D:\NodeProjects\testProject> gulp
```

<a name="_contacts"></a>
# Contacts

**Yandex Mail** - vladimirvsevolodovi@yandex.ru

**Github** - https://github.com/StormExecute/

# Platforms

**Github** - https://github.com/StormExecute/npm-xeraglobal/

**NPM** - https://www.npmjs.com/package/npm-xeraglobal/

# License

**MIT** - https://mit-license.org/

[npm-url]: https://www.npmjs.com/package/npm-xeraglobal
[npm-image]: https://img.shields.io/npm/v/npm-xeraglobal.svg