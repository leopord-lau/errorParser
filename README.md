# errorParser

Parse error objects into more direct objects.

format:
- name: {String} error type
- message: {String} error message
- stack: {Array} stacktrace
- - url: {String} file path
- - lineno: {Number} line number of an error
- - colno: {Number} column number of an error
- - function：{String} in which function is the error located


eg.
```js
import { errorParser } from 'errorParser';
try {
  cont
} catch(e) {
  console.log(errorParser(e))
}
```


support chrome、gecko.