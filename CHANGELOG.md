# npm-xeraglobal changelog

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
* Fixed the usual npm remove (previously dependencies were set first before removing the module)
* Additional "sort" and "reverse" commands have been added to the ```npm xerup``` command.

Русский:

* Добавлена система контроля версий, структура проекта переработана.
* Дофикшены установочные пути, а также добавлена дополнительная проверка директории глобальной установки.
* Пофикшен обычный npm remove (раньше устанавливал зависимости, прежде чем удалить модуль)
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