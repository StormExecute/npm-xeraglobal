# npm-xeraglobal changelog

## v2.3.1

English:

* Added support for the **--no-save**(--ns) flag for **--xer** flag.
* The **--use-this-dir**(--utd) flag was added to write dependencies to the directory from which the installation is performed (when installing ***into a project*** without --utd, the ***main project package*** is located).
* Added the possibility to use two hyphens for the following flags: ***-dt, -ns, -utd***. And different use cases.

Русский:

* Добавлена поддержка флага **--no-save**(--ns) для флага **--xer**.
* Добавлен флаг **--use-this-dir**(--utd) для записывания зависимостей именно в ту директорию, откуда выполняется установка(если идёт установка ***в проект*** без --utd - находится ***именно проектный пакет***).
* Флагам ***-dt, -ns, -utd*** добавлена возможность использования с двумя дефисами, а также более различных вариаций.

## v2.3.0

English:

***Note: using ```sudo npm``` on Linux is the best option for any action with modules with the --xer flag.***

* Added support for linux:
	* Support for the standard node.js package.
	* Nvm (node version manager) support.
	* Sudo support for ```node```, ```gulp```, ```webpack``` and so on. Note: it requires -E or --preserve-env flags from sudo, since Linux uses saveGetEnv.
* Fixed some problems with inserting supports for modules that don't take the ```%HOME%/.node_modules/``` path.
* Added the experimental flag ```--delete-trash``` (-dt). Its main task is to delete directories and files located in the root of the module and do not affect the main functionality, if, of course, they are there. It only checks for ```%HOME%/.node_modules/``` path, and the global folder will contain absolutely all files. README, as well as license, authors, and contributors files, are ignored and will not be deleted. Modules installed via @ are also ignored (for example, ```sudo npm i @babel/core -x```). Will be found and deleted:
	* Following folders:
		* .idea
		* .git
		* .github
		* example
		* examples
		* test
		* tests
	* Following files:
		* .npmignore
		* .npmrc
		* .gitattributes
		* .gitignore
		* .gitmodules
		* .editorconfig
		* .eslintignore
		* .eslintrc
		* .travis.yml
		* .tidelift.yml
		* appveyor.yml
		* make + Make
		* makefile + Makefile
		* rakefile + Rakefile

Русский:

***Примечание: использование ```sudo npm``` на линуксе - лучший вариант для любого действия с модулями при флаге --xer.***

* Добавлена поддержка для linux:
	* Поддержка стандартного пакета node.js.
	* Поддержка nvm (node version manager).
	* Поддержка sudo для ```node```, ```gulp```, ```webpack``` и так далее. Примечание: требует -E, --preserve-env от sudo, так как для линукса используется saveGetEnv.
* Пофикшены некоторые проблемы со вставкой поддержек для модулей, которые не учитывают путь ```%HOME%/.node_modules/```.
* Добавлен экспериментальный флаг ```--delete-trash``` (-dt). Его основная задача - удаление директорий и файлов, находящихся в корне модуля и не влияющих на основную функциональность, если, конечно, они там есть. Проверяется лишь путь ```%HOME%/.node_modules/```, в глобальной папке будут абсолютно все файлы. README, а также файлы лицензий, авторов и контрибуторов, естественно, игнорируются и не будут удалены. Также игнорируются модули, установленые через @ (к примеру ```sudo npm i @babel/core -x```). Будут найдены и удалены:
	* Следующие папки:
		* .idea
		* .git
		* .github
		* example
		* examples
		* test
		* tests
	* Следующие файлы:
		* .npmignore
		* .npmrc
		* .gitattributes
		* .gitignore
		* .gitmodules
		* .editorconfig
		* .eslintignore
		* .eslintrc
		* .travis.yml
		* .tidelift.yml
		* appveyor.yml
		* make + Make
		* makefile + Makefile
		* rakefile + Rakefile

## v2.2.2

English:

* Added the following supports:
	* Support for %HOMEPATH%/.node_modules for modules: webpack, webpack-stream, @babel/core, resolve.
	* Versioned compatibility. Now you can use:
		```
		npm install [<@scope>/]<name> -x
		npm install [<@scope>/]<name>@<tag> -x
		npm install [<@scope>/]<name>@<version> -x
		npm install [<@scope>/]<name>@<version range> -x
		```
		For example: 
		```
		npm i @babel/core -x
		npm i @babel/core@7.0.0-beta.4 -x
		npm i webpack@0.4.12 -x
		```
		This doesn't apply to ```npm install <git repo url> -x``` and similar manipulations.
		In addition, multitasking ```npm i gulp webpack @babel/core @babel/preset-env --xer``` is not provided.
		The best option would be to use: ```npm i gulp -x && npm i webpack -x```.

Русский:

* Добавлены следующие поддержки:
	* Поддержка %HOMEPATH%/.node_modules для модулей: webpack, webpack-stream, @babel/core, resolve.
	* Версионная совместимость. Теперь допустимо использование:
		```
		npm install [<@scope>/]<name> -x
		npm install [<@scope>/]<name>@<tag> -x
		npm install [<@scope>/]<name>@<version> -x
		npm install [<@scope>/]<name>@<version range> -x
		```
		К примеру:
		```
		npm i @babel/core -x
		npm i @babel/core@7.0.0-beta.4 -x
		npm i webpack@0.4.12 -x
		```	
		Это не относится к ```npm install <git repo url> -x``` и подобным манипуляциям. 
		Кроме того, многозадачность, аля ```npm i gulp webpack @babel/core @babel/preset-env --xer``` не предусматривается. 
		Лучшим вариантом будет использование: ```npm i gulp -x && npm i webpack -x```.

## v2.2.1

English:

* Added protection against xera modifications:
	* If in package.json had no dependencies and devDependencies, then ```npm r <module>``` will do nothing. The original ```npm remove``` would have created an empty dependency object along with package.lock.json.
	* ```npm r <module> -g``` now doesn't make unnecessary changes to the package.json.

Русский:

* Добавлена защита от xera модификаций:
	* Если в package.json не было dependencies и devDependencies, то ```npm r <module>``` ничего не сделает. Оригинальный ```npm remove``` создал бы пустой объект зависимости вместе с package.lock.json.
	* ```npm r <module> -g``` теперь не обновляет текущий package.json лишними модификациями.

## v2.2.0

English:

* Added git, the structure of the project has been refactored.
* Post-fixed installation paths and added additional checking of the global installation directory.
* Fixed the usual npm remove (previously dependencies were set first before removing the module).
* Additional "sort" and "reverse" commands have been added to the ```npm xerup``` command.

Русский:

* Добавлена система контроля версий, структура проекта переработана.
* Дофикшены установочные пути, а также добавлена дополнительная проверка директории глобальной установки.
* Пофикшен обычный npm remove (раньше устанавливал зависимости, прежде чем удалить модуль).
* В команду ```npm xerup``` добавлены дополнительные команды "sort" и "reverse".
	
## v2.1.1

English:

* More or less fixed conflicts with installation paths.

Русский:

* Более менее исправлены конфликты с установочными путями.

## v2.0.0, 2.0.1, 2.0.2, 2.1.0

***DEPRECATED because they have bugs with installation paths!***

***УСТАРЕЛИ ПО ПРИЧИНЕ КОНФЛИКТОВ С УСТАНОВОЧНЫМИ ПУТЯМИ!***

## 2.1.0

English:

* Added the ```npm xerup``` command.

Русский:

* Добавлена команда ```npm xerup``` .

## 2.0.2

English:

* The attempt to fix installation paths - FAIL.

Русский:

* Попытка исправить установочные пути - ПРОВАЛ.

## 2.0.1

English:

* Updated README .

Русский:

* Обновлён README .

## v2.0.0

English:

* Changed the installation method. Now the module becomes global with a simulated --global flag along with the --xer flag, thus eliminating dependency problems.

Русский:

* Изменён способ установки. Теперь модуль становится глобально с имитацией флага --global вместе с флагом --xer, тем самым, исключая проблемы с зависимостями.

## v1.0.0, 1.0.1, 1.0.2, 1.1.0

***DEPRECATED because they have bugs with installation paths!***

***УСТАРЕЛИ ПО ПРИЧИНЕ КОНФЛИКТОВ С УСТАНОВОЧНЫМИ ПУТЯМИ!***

**They didn't have a global installation, they were written quickly and they have had problems with dependencies.**

**У них не было глобальной установки, они были написаны быстро, и у них были проблемы с зависимостями.**

*An example of the syntax of these versions based on the test unreleased version 1.1.1 is given [here](https://github.com/StormExecute/npm-xeraglobal/blob/master/tests/dev/npm-cli-mod-test.js). This version is not completed, it is not recommended to run it!*

*Пример синтаксиса этих версий на основе тестовой неизданной версии 1.1.1 приведен [здесь](https://github.com/StormExecute/npm-xeraglobal/blob/master/tests/dev/npm-cli-mod-test.js). Эта версия не доделана, не рекомендуется её запускать!*