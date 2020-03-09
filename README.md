# npm-xeraglobal

***This module requires the cmd with administration rules!***

***Этот модуль требует командную строку с правами администратора!***

The simple npm-cli modifier. Originally written for npm version 6.14.2, there may be conflicts with versions, check yourself. It might work to version 5.

Простой модификатор npm-cli. Изначально написано для npm версии 6.14.2, возможны конфликты с версиями, проверьте сами. Должно работать до 5 версии.

The main purpose of the -x flag is that it puts modules in the %HOMEPATH%/.node_modules/ and %GlobalDirNpm%, while keeping the dependencies in package.json.

Основная задача флага -x заключается в том, что он ставит модули в папки %HOMEPATH%/.node_modules/ и %GlobalDirNpm%, при этом сохраняя зависимости в package.json.

# Installation | Установка

```
npm install npm-xeraglobal -g
npmxer
```

# Update | Обновление

```
npm update npm-xeraglobal -g
npmxer
```

# Usage | Использование
```
npm [i|install] <some-module> [-x|--x|-xer|--xer|-xera|--xera|-хуй|--хуй|-хер|--хер]
```

# Removing modules | Удаление модулей
```
npm [r|rm|un|remove|uninstall] <some-module> [-x|--x|-xer|--xer|-xera|--xera|-хуй|--хуй|-хер|--хер]
```

# Packages upgrade | Обновление пакетов

This will update the package.json in a new project.

Это обновит package.json в новом проекте.

If the package.json does not exist - it will be created.

Если package.json не существует - он будет создан.

```
npm [xerup|upxer|upp||uppackages] <pkg1,pkg2...> [-S|-D|--save|--save-dev](optional, default: -S)
```

# Sorting dependencies | Сортировка зависимостей

This will sort dependencies and devDependencies by name.

Это отсортирует dependencies и devDependencies по имени.

```
npm [xerup|upxer|upp||uppackages] [s|srt|st|sort]
```

Example: ```npm xerup sort```.

# Reversing dependencies | Перестановка зависимостей

This will reverse the contrary dependencies and devDependencies.

Это переставит dependencies и devDependencies местами.

```
npm [xerup|upxer|upp||uppackages] [rv|rvs|rvrs|reverse]
```

Example: ```npm upxer rvrs```.

# Removing dependencies | Удаление зависимостей

```
npm [xerup|upxer|upp||uppackages] [null|d|r|rm|remove|delete] <pkg1,pkg2...> [-S|-D|--save|--save-dev](optional, default: -S)
```

Example: ```npm upp null gulp webpack webpack-stream del```

# Undo | Откат

This will restore the original npm-cli.

Это восстановит оригинальный npm-cli.

```
npmunxer
```

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

# Contacts | Контакты

**Yandex Mail** - vladimirvsevolodovi@yandex.ru

**Github** - https://github.com/StormExecute/

# Github

**StormExecute** - https://github.com/StormExecute/npm-xeraglobal/

# License | Лицензия

**MIT** - https://mit-license.org/