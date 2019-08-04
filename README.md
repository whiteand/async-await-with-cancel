# async-await-with-cancel

## Описание

Простая реализация собственных async/await с возможностью отмены цепочки операций. 
Реализовано с помощью промисов, генераторов и MobX. Основной код
содержится в файле `PromiseWithCancel.ts`.

В данном случае вместо `async` выступает `*`, а вместо `await` выступает `yield`. Все
асинхронные функции/методы, кроме тех, где более нет вложенных асинхронных вызовов,
должны быть генераторами - т.е. содержать `*` при объявлении.
Более формально, если функция не просто возвращает промис, а содержит внутри себя асинхронные
вызовы, то её тоже следует обернуть в генератор, а вызов такой функции производить с
помощью `yield*` (композиция генераторов). Подробнее см. в документации по генераторам.

Для создания промиса, который возможно будет отменить в будущем, необходимо использовать
функцию `runWithCancel()`.

## Пример использования

Рассмотрим пример из файла App.tsx. Запуск программы происходит в `ComponentDidMount`.
Как мы видим, методы `doAllTasks`, `doTask1`, `doTask2`, `doTask3` -- асинхронные. С 
помощью `runWithCancel` Мы запускаем метод `doAllTasks`, который, возможно,
 захотим отменить в будущем (он должен являться генератором). Внутри себя этот метод
 вызывает ещё несколько асинхронных методов: `doTasks1`, `doTasks2`, `doTasks3`. Вызовы
 производятся с помощью `yield*` (обратите внимание на звёздочку), т.к. каждый из этих методов содержит внутри себя
 дальнейшие асинхронные вызовы. Далее, каждый из методов с помощью простого `yield`
 вызывает `simpleTimeoutPromise`, который возвращает на выходе обычный промис, поэтому
 здесь после `yield` звёздочка не требуется (далее не происходит композиции генераторов).
 Теперь вернёмся в `componentDidMount`. `Promise.cancel()` вызывается спустя 3 секунды, и,
 таким образом, цепочка промисов завершается как раз по завершении 3-го промиса. 
 
 ## Возможности для улучшения
 
 1. Кажется возможным, заменить вызовы `yield` и `yield*` на вызов какой-нибудь общей
 функции, которая будет сама определять, какой вариант использовать в данном случае (в
 зависимости от возвращаемого значения). 
 
 2. Имея в наличии декораторы, кажется возможным использовать их, чтобы 
 частично/полностью исключить генераторы из конечного кода, приведя его в ещё более
 напоминающий `async/await`ы вид. 
 
 ## Вложенные `runWithCancel`
 
 Этот случай немного сложнее описанного в примере, однако также работает. Можно
 посмотреть на реализацию, если переключиться на ветку `one-inside-another`. Вся сложность
 заключается в том, что нам необходимо создать внешний промис, внутри которого мы будем
 отменять внутренний, полученный с помощью `runWithCancel`.  
  

## Запуск

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.


 
 
