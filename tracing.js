// Tracing.js

var Tracing = (function() {
    var INDENT_STRING = "  ";

    var Traces = {},
        globalObject = Function('return this')(),
        traceDepth = 0;

    // Do nothing function.
    function noop () {};

    // Is the given object a function?
    function isFunc (obj) {
        return typeof(obj) === 'function';
    }

    // Is the object empty? (undefined or null)
    function isEmpty (obj) {
        return obj !== undefined && obj !== null;
    }

    // Iterate through the object properties calling the given function.
    function withProperties (obj, fn) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                fn(key, obj[key]);
            }
        }
    }

    // Copies the owned properties from src to dst. Returns dst.
    function copyOwnProperties (src, dst) {
        withProperties(src, function(key, val) {
            dst[key] = val;
        });
        return dst;
    }

    // Converts an arguments object into an array.
    function arguments2array (args) {
        return copyOwnProperties(args, []);
    }

    // Repeat the given string the given number of times.
    function repeatString (str, times) {
         return (new Array(times + 1)).join(str);
    }

    // Traverses the object defined by the string target, if val is passed
    // we set last object value to this value, the value of the object is returned.
    function objectTraverser (target, val) {
        var elements = target.split("."),
            curElement = globalObject;

        for (var i = 0; i < elements.length; i++) {
            if (!(elements[i] in curElement)) {
                throw "Property not found!";
            }

            // If we are setting the value...
            if (arguments.length > 1 && i == (elements.length - 1)) {
                curElement[elements[i]] = val;
            }

            curElement = curElement[elements[i]];
        }

        return curElement;
    }

    // Default before callback. Prints the function name and the arguments passed to it.
    function defaultBeforeTraceFn (fnName, parameters, depth) {
        depth = depth || 1;
        console.log( ">" + repeatString(INDENT_STRING, depth) + fnName + " called with arguments: " + "(" + parameters.join(", ") + ")");
    }

    // Default after callback. Prints the function name and its return value.
    function defaultAfterTraceFn (fnName, returnVal, depth) {
        depth = depth || 1;
        console.log(">" + repeatString(INDENT_STRING, depth) + fnName + " returned: " + returnVal);
    }

    // Sets a function trace.
    function setTrace (fnName, options) {
        var target = objectTraverser(fnName);

        if (!isFunc(target)) {
            throw "Not a valid function to trace!";
        }

        if (isEmpty(Traces[fnName])) {
            throw "This function is already being traced!";
        }

       Traces[fnName]= {
           original: target,
           before:   options.before || noop,
           after:    options.after || noop
       };

        var trace = function () {
            var retval,
                env = Traces[fnName];

            traceDepth++;

            env.before.call(this, fnName, arguments2array(arguments), traceDepth);
            retval = env.original.apply(this, arguments);
            env.after.call(this, fnName, retval, traceDepth);

            traceDepth--;

            return retval;
        };

        // Sometimes functions have stuff attached to them, like jQuery's $.
        copyOwnProperties(target, trace);

        // Sometimes we want to trace constructors, gotta keep their prototype.
        trace.prototype = target.prototype;

        // Change the function to our own.
        objectTraverser(fnName, trace);
    }

    // Removes a function trace.
    function unsetTrace (fnName) {
        if (!Traces[fnName]) {
            throw "This function is not being traced!";
        }

        var tracingFunc = objectTraverser(fnName),
            env = Traces[fnName];

        // If code added properties to the tracing function believing it was the original we need to keep them.
        copyOwnProperties(tracingFunc, env.original);

        // If code modified the prototype we better keep that as well.
        env.prototype = tracingFunc.prototype;

        // Unset the trace.
        objectTraverser(fnName, env.original);

        // Remove the function from our internal data structure.
        delete Traces[fnName];
    }

    return {
        trace: function (fnName, options) {
            setTrace(fnName, options || { before: defaultBeforeTraceFn, after: defaultAfterTraceFn });
        },

        untrace: function (fnName) {
            if (fnName) {
                unsetTrace(fnName);
            }
            else {
                // If no function name given, remove all traces.
                withProperties(Traces, unsetTrace);
            }
        },
        // Just in case people want to use the default functions in their handlers we expose them.
        defaults: {
            before: function (fnName, depth, parameters) {
                return defaultBeforeTraceFn(fnName, depth, parameters);
            },
            after: function (fnName, depth, returnVal) {
                return defaultAfterTraceFn(fnName, depth, returnVal);
            }
        }
    };
}());
