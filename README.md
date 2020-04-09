# npm-xeraglobal

***This module requires a command line with administrator rules! For linux, use ```sudo```, for windows - open cmd as an administrator.***

***Этот модуль требует командную строку с правами администратора! Для linux используйте ```sudo```, для windows же - откройте cmd от имени администратора.***

The simple npm-cli modifier. Originally written for npm version 6.14.2, there may be conflicts with last versions, check yourself. It might work with 5 versions.

Простой модификатор npm-cli. Изначально написано для npm версии 6.14.2, возможны конфликты с прошлыми версиями, проверьте сами. Должно работать с 5-ми версиями.

It adds the ```--xer (-x)``` (as main) and ```--delete-trash (-dt)``` flags, and the ```xerup``` command to npm. The main purpose of the -x flag is that it puts modules in the %HOMEPATH%/.node_modules/ and %GlobalDirNpm% folders, while keeping dependencies in package.json.

Добавляет флаги --xer (главный), --delete-trash, а также команду xerup к npm. Основная задача флага -x заключается в том, что он ставит модули в папки %HOMEPATH%/.node_modules/ и %GlobalDirNpm%, при этом сохраняя зависимости в package.json.

# Table of Contents | Оглавление

1. [Installation | Установка](#installation)
2. [Usage | Использование](#usage)
3. [Troubleshooting | Устранение неполадок](#troubleshooting)
4. [About --delete-trash flag | О флаге --delete-trash](#delete-trash)
5. [Removing modules | Удаление модулей](#removingModules)
6. [Packages upgrade | Обновление пакетов](#upgrade)
7. [Sorting dependencies | Сортировка зависимостей](#sortingDependencies)
8. [Reversing dependencies | Перестановка зависимостей](#reversingDependencies)
9. [Removing dependencies | Удаление зависимостей](#removingDependencies)
10. [Undo | Откат](#undo)
11. [Examples | Примеры](#examples)
12. [Contacts | Контакты](#contacts)

# Changelog | Список изменений

[HERE!](https://github.com/StormExecute/npm-xeraglobal/blob/master/CHANGELOG.md)

<a name="installation"></a>
# Installation | Установка

***To update, you should also run these commands.***

***Для обновления вам также следует выполнить данные команды.***

**Windows:**
```bash
npm install npm-xeraglobal -g
npmxer
```

**Linux:**
```bash
sudo npm i npm-xeraglobal -g && sudo npmxer
```

<a name="usage"></a>
# Usage | Использование

***For linux, it is recommended to use ```sudo npm``` on a permanent basis.***

***Для linux рекомендуется использовать ```sudo npm``` на постоянной основе.***

```bash
(sudo?) npm [i|install] <some-module> [-x|--x|-xer|--xer|-xera|--xera|-хуй|--хуй|-хер|--хер] ([-dt|--delete-trash]?)
```

<a name="troubleshooting"></a>
# Troubleshooting | Устранение неполадок

***```sudo gulp task```: module gulp not found, as well as ```sudo webpack``` and ```sudo node```: module <moduleName> not found***:

This error occurs because node.js uses ```safeGetEnv("HOME")``` in ```Module._initPaths```. The solution is to use ```sudo --preserve-env (-E)``` - ```sudo -E gulp task```, ```sudo -E webpack```, ```sudo -E node nodefile```.

Такая ошибка возникает из-за того, что node.js использует ```safeGetEnv("HOME")``` в ```Module._initPaths```. Решением будет использование ```sudo --preserve-env (-E)``` - ```sudo -E gulp task```, ```sudo -E webpack```, ```sudo -E node nodefile```.

***Webpack installation:***

```
npm i webpack -x && npm i webpack-cli -g
```

<a name="delete-trash"></a>
# About --delete-trash flag | О флаге --delete-trash

Its main task is to delete directories and files located in the root of the module and do not affect the main functionality, if, of course, they are there. It only checks for ```%HOME%/.node_modules/``` path, and the global folder will contain absolutely all files. README, as well as license, authors, and contributors files, are ignored and will not be deleted. Modules installed via @ are also ignored (for example, ```sudo npm i @babel/core -x```).

Его основная задача - удаление директорий и файлов, находящихся в корне модуля и не влияющих на основную функциональность, если, конечно, они там есть. Проверяется лишь путь ```%HOME%/.node_modules/```, в глобальной папке будут абсолютно все файлы. README, а также файлы лицензий, авторов и контрибуторов, естественно, игнорируются и не будут удалены. Также игнорируются модули, установленые через @ (к примеру ```sudo npm i @babel/core -x```).

Will be found and deleted: (Rus: Будут найдены и удалены)
- Following folders: (Rus: Следующие директории)
	- .idea
	- .git
	- .github
	- example
	- examples
	- test
	- tests
- Following files: (Rus: Следующие файлы)
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

<a name="removingModules"></a>
# Removing modules | Удаление модулей
```bash
npm [r|rm|un|remove|uninstall] <some-module> [-x|--x|-xer|--xer|-xera|--xera|-хуй|--хуй|-хер|--хер]
```

<a name="upgrade"></a>
# Packages upgrade | Обновление пакетов

This will update the package.json in a new project without a new upload.

Это обновит package.json в новом проекте без новой загрузки.

If the package.json does not exist - it will be created.

Если package.json не существует - он будет создан.

```bash
npm [xerup|upxer|upp||uppackages] <pkg1,pkg2...> [-S|-D|--save|--save-dev](optional, default: -S)
```

<a name="sortingDependencies"></a>
# Sorting dependencies | Сортировка зависимостей

This will sort dependencies and devDependencies by name.

Это отсортирует dependencies и devDependencies по имени.

```bash
npm [xerup|upxer|upp||uppackages] [s|srt|st|sort]
```

Example: ```npm xerup sort```.

<a name="reversingDependencies"></a>
# Reversing dependencies | Перестановка зависимостей

This will reverse the contrary dependencies and devDependencies.

Это переставит dependencies и devDependencies местами.

```bash
npm [xerup|upxer|upp||uppackages] [rv|rvs|rvrs|reverse]
```

Example: ```npm upxer rvrs```.

<a name="removingDependencies"></a>
# Removing dependencies | Удаление зависимостей

```bash
npm [xerup|upxer|upp||uppackages] [null|d|r|rm|remove|delete] <pkg1,pkg2...> [-S|-D|--save|--save-dev](optional, default: -S)
```

Example: ```npm upp null gulp webpack webpack-stream del```

<a name="undo"></a>
# Undo | Откат

This will restore the original npm-cli.

Это восстановит оригинальный npm-cli.

```bash
npmunxer
```

<a name="examples"></a>
# Examples | Примеры

First install the modules with the -x flag.

Сначала установим модули с флагом -x.

```
D:\NodeProjects\yourProject> npm i gulp -x -D
D:\NodeProjects\yourProject> npm i browser-sync --xer -D
```

***FOR RUSSIANS ONLY!***

***ТОЛЬКО ДЛЯ РУССКИХ!***

Так, впринципе, тоже можно :D

```
D:\NodeProjects\yourProject> npm i gulp -хуй --save-dev
D:\NodeProjects\yourProject> npm i browser-sync --хер --save-dev
```

Then create a file "index.js".

Затем создайте файл "index.js".

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

И запустите это!

```
D:\NodeProjects\yourProject> gulp hello
D:\NodeProjects\yourProject> gulp serve
[ctrl+c] y
```

For new projects, gulp and browser-sync (in the context of this example) will be available as local modules.

Для новых проектов будут доступны gulp и browser-sync (в контексте данного примера) в качестве локальных модулей.

**Now let's create a new project and update its dependencies.**

**Теперь давайте создадим новый проект и обновим его зависимости.**

```
D:\NodeProjects\yourProject> cd .. && mkdir testProject && cd testProject
D:\NodeProjects\testProject> npm xerup gulp browser-sync -D
```

Creating index.js:

Создаём index.js:

```javascript
"use strict";

const gulp = require("gulp")

gulp.task("default", cb => {
	console.log("Hello World!")
	cb()
})
```

Run it:

Запускаем:

```
D:\NodeProjects\testProject> gulp
```

<a name="contacts"></a>
# Contacts | Контакты

**Yandex Mail** - vladimirvsevolodovi@yandex.ru

**Github** - https://github.com/StormExecute/

# Github

**StormExecute** - https://github.com/StormExecute/npm-xeraglobal/

# License | Лицензия

**MIT** - https://mit-license.org/