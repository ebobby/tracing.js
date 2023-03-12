Tracing.js - Javascript function tracing.
===

**Tracing.js** is a library/utility to help you debug your javascript code.

Have you ever had the need to know when a function is called? Check its parameters or the return value? Of course you have, it's a part of a developer's life.

You can easily accomplish it by setting a breakpoint inside your code and have the debugger fired up. But what about third party code or native functions? What if the code is minified?

**Tracing.js** is here to help.

Simply put, **Tracing.js** will allow you to run functions of your own before or after target functions get called. It is like events for function invocation.

You can also set up a trace for those functions and **Tracing.js** will print useful information (arguments, return values)  when these functions get called.

It even works for constructors and functions that have other objects attached to themselves, like jQuery's $.

# Installation

```shell
$ npm install @ebobby/tracingjs
```

Import:

```javascript
import { Tracing } from "@ebobby/tracingjs";
```

# Usage

###     Tracing.before(fnName, fn)

Sets a function to be called right before the invocation of the function named by _fnName_. The function _fn_ will be called with the same context as the original function and will be passed the following parameters:

* fnName
  The name of the function you are tracing.
* arguments
  An array of arguments passed to the function.
* depth
  Trace depth, an integer representing the depth of traced calls. (This is not a stack depth per se unless you are actually tracing every function).

Returns Tracing.js itself so calls can be chained.

Examples:

```javascript
> function myFunction() { console.log("Inside function!"); }
> Tracing.before("myFunction", function (fnName, arguments, depth) { console.log("Before calling!"); } )
> myFunction()
Before calling!
Inside function!
```

Tracing jQuery:

```javascript
> Tracing.before('$', function(fnName, args, depth) { console.log("jQuery will be called!"); } );
> $("div")
jQuery will be called!
> $(document)
jQuery will be called!
```

Native functions (be careful with these!) :

```javascript
> Tracing.before('Array.prototype.push', function(fnName, args, depth) { console.log("An array about to get bigger with: " + args[0]); });
> var myArray = [];
> myArray.push(1)
An array about to get bigger with: 1
1
> myArray.push(132)
An array about to get bigger with: 132
2
```

###     Tracing.after(fnName, fn)

Sets a function to be called just after the invocation of the function named by _fnName_. The function _fn_ will be called with the same context as the original function and will be passed the following parameters:

* fnName
  The name of the function you are tracing.
* retval
  The return value of the function after being called.
* depth
  Trace depth, an integer representing the depth of traced calls. (This is not a stack depth per se).

Returns Tracing.js itself so calls can be chained.

Examples:

```javascript
> function myFunction() { console.log("Inside function!"); }
> Tracing.after("myFunction", function (fnName, retval, depth) { console.log("After calling!"); } )
> myFunction()
Inside function!
After calling!
```

Native functions:

```javascript
> Tracing.after('Array.prototype.slice', function(fnName, retval, depth) {
      console.log("Sliced: "); console.log( retval );
  });
> [1,2,3,4,5].slice(0,3)
Sliced:
[1, 2, 3]
[1, 2, 3]
```

###     Tracing.trace(fnName, ...)

Sets tracing on the given functions (you can pass as many functions names as you want). When the target functions get called information about them will be printed, such as the arguments and the return value, this is very useful when debugging specially recursive functions.

Returns Tracing.js itself so calls can be chained.

Example:

```javascript
// Recursive version of common operators.
function add (a, b) {
    if (b > 0) return add(++a, --b);
    return a;
}
function multiply (a, b, accum) {
    accum = accum || 0;
    if (b > 0) return multiply(a, --b, add(accum, a));
    return accum;
}
function square (x) {
    return multiply(x, x);
}

Tracing.untrace().trace('square', 'multiply', 'add');
> square(2)
>  square called with arguments: (2)
>    multiply called with arguments: (2, 2)
>      add called with arguments: (0, 2)
>        add called with arguments: (1, 1)
>          add called with arguments: (2, 0)
>          add returned: 2
>        add returned: 2
>      add returned: 2
>      multiply called with arguments: (2, 1, 2)
>        add called with arguments: (2, 2)
>          add called with arguments: (3, 1)
>            add called with arguments: (4, 0)
>            add returned: 4
>          add returned: 4
>        add returned: 4
>        multiply called with arguments: (2, 0, 4)
>        multiply returned: 4
>      multiply returned: 4
>    multiply returned: 4
>  square returned: 4
4

Tracing.untrace()
square(15)
225
```

###     Tracing.untrace(...)

Removes tracing from the given function names, restoring the original code. You can pass as many function names as you want or if you call it without arguments it will remove every trace currently set.

Returns Tracing.js itself so calls can be chained.

Example:

```javascript
> function myFunction() { }
> Tracing.trace("myFunction")
> myFunction()
>    myFunction called with arguments: ()
>    myFunction returned: undefined
> myFunction(1,2,3)
>    myFunction called with arguments: (1, 2, 3)
>    myFunction returned: undefined
> Tracing.untrace()
> myFunction(1,2,3)
>
```

## Final remarks

That's it, feel free to use the code however you see fit.
