# npm-xeraglobal changelog

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