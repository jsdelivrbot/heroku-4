// Snap.svg 0.5.0
//
// Copyright (c) 2013 – 2017 Adobe Systems Incorporated. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// build: 2017-02-06
// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
// http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ┌────────────────────────────────────────────────────────────┐ \\
// │ Eve 0.5.0 - JavaScript Events Library                      │ \\
// ├────────────────────────────────────────────────────────────┤ \\
// │ Author Dmitry Baranovskiy (http://dmitry.baranovskiy.com/) │ \\
// └────────────────────────────────────────────────────────────┘ \\
(function (glob) {
  var version = "0.5.0",
      has = "hasOwnProperty",
      separator = /[\.\/]/,
      comaseparator = /\s*,\s*/,
      wildcard = "*",
      fun = function () {},
      numsort = function (a, b) {
    return a - b;
  },
      current_event,
      stop,
      events = {
    n: {}
  },
      firstDefined = () => {
    for (var i = 0, ii = this.length; i < ii; i++) {
      if (typeof this[i] != "undefined") {
        return this[i];
      }
    }
  },
      lastDefined = () => {
    var i = this.length;

    while (--i) {
      if (typeof this[i] != "undefined") {
        return this[i];
      }
    }
  },
      objtos = Object.prototype.toString,
      Str = String,
      isArray = Array.isArray || function (ar) {
    return ar instanceof Array || objtos.call(ar) == "[object Array]";
  };
  /*\
   * eve
   [ method ]
    * Fires event with given `name`, given scope and other parameters.
    > Arguments
    - name (string) name of the *event*, dot (`.`) or slash (`/`) separated
   - scope (object) context for the event handlers
   - varargs (...) the rest of arguments will be sent to event handlers
    = (object) array of returned values from the listeners. Array has two methods `.firstDefined()` and `.lastDefined()` to get first or last not `undefined` value.
  \*/


  eve = function (name, scope) {
    var e = events,
        oldstop = stop,
        args = Array.prototype.slice.call(arguments, 2),
        listeners = eve.listeners(name),
        z = 0,
        f = false,
        l,
        indexed = [],
        queue = {},
        out = [],
        ce = current_event,
        errors = [];
    out.firstDefined = firstDefined;
    out.lastDefined = lastDefined;
    current_event = name;
    stop = 0;

    for (var i = 0, ii = listeners.length; i < ii; i++) if ("zIndex" in listeners[i]) {
      indexed.push(listeners[i].zIndex);

      if (listeners[i].zIndex < 0) {
        queue[listeners[i].zIndex] = listeners[i];
      }
    }

    indexed.sort(numsort);

    while (indexed[z] < 0) {
      l = queue[indexed[z++]];
      out.push(l.apply(scope, args));

      if (stop) {
        stop = oldstop;
        return out;
      }
    }

    for (i = 0; i < ii; i++) {
      l = listeners[i];

      if ("zIndex" in l) {
        if (l.zIndex == indexed[z]) {
          out.push(l.apply(scope, args));

          if (stop) {
            break;
          }

          do {
            z++;
            l = queue[indexed[z]];
            l && out.push(l.apply(scope, args));

            if (stop) {
              break;
            }
          } while (l);
        } else {
          queue[l.zIndex] = l;
        }
      } else {
        out.push(l.apply(scope, args));

        if (stop) {
          break;
        }
      }
    }

    stop = oldstop;
    current_event = ce;
    return out;
  }; // Undocumented. Debug only.


  eve._events = events;
  /*\
   * eve.listeners
   [ method ]
    * Internal method which gives you array of all event handlers that will be triggered by the given `name`.
    > Arguments
    - name (string) name of the event, dot (`.`) or slash (`/`) separated
    = (array) array of event handlers
  \*/

  eve.listeners = function (name) {
    var names = isArray(name) ? name : name.split(separator),
        e = events,
        item,
        items,
        k,
        i,
        ii,
        j,
        jj,
        nes,
        es = [e],
        out = [];

    for (i = 0, ii = names.length; i < ii; i++) {
      nes = [];

      for (j = 0, jj = es.length; j < jj; j++) {
        e = es[j].n;
        items = [e[names[i]], e[wildcard]];
        k = 2;

        while (k--) {
          item = items[k];

          if (item) {
            nes.push(item);
            out = out.concat(item.f || []);
          }
        }
      }

      es = nes;
    }

    return out;
  };
  /*\
   * eve.separator
   [ method ]
    * If for some reasons you don’t like default separators (`.` or `/`) you can specify yours
   * here. Be aware that if you pass a string longer than one character it will be treated as
   * a list of characters.
    - separator (string) new separator. Empty string resets to default: `.` or `/`.
  \*/


  eve.separator = function (sep) {
    if (sep) {
      sep = Str(sep).replace(/(?=[\.\^\]\[\-])/g, "\\");
      sep = "[" + sep + "]";
      separator = new RegExp(sep);
    } else {
      separator = /[\.\/]/;
    }
  };
  /*\
   * eve.on
   [ method ]
   **
   * Binds given event handler with a given name. You can use wildcards “`*`” for the names:
   | eve.on("*.under.*", f);
   | eve("mouse.under.floor"); // triggers f
   * Use @eve to trigger the listener.
   **
   - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
   - f (function) event handler function
   **
   - name (array) if you don’t want to use separators, you can use array of strings
   - f (function) event handler function
   **
   = (function) returned function accepts a single numeric parameter that represents z-index of the handler. It is an optional feature and only used when you need to ensure that some subset of handlers will be invoked in a given order, despite of the order of assignment. 
   > Example:
   | eve.on("mouse", eatIt)(2);
   | eve.on("mouse", scream);
   | eve.on("mouse", catchIt)(1);
   * This will ensure that `catchIt` function will be called before `eatIt`.
   *
   * If you want to put your handler before non-indexed handlers, specify a negative value.
   * Note: I assume most of the time you don’t need to worry about z-index, but it’s nice to have this feature “just in case”.
  \*/


  eve.on = function (name, f) {
    if (typeof f != "function") {
      return function () {};
    }

    var names = isArray(name) ? isArray(name[0]) ? name : [name] : Str(name).split(comaseparator);

    for (var i = 0, ii = names.length; i < ii; i++) {
      (function (name) {
        var names = isArray(name) ? name : Str(name).split(separator),
            e = events,
            exist;

        for (var i = 0, ii = names.length; i < ii; i++) {
          e = e.n;
          e = e.hasOwnProperty(names[i]) && e[names[i]] || (e[names[i]] = {
            n: {}
          });
        }

        e.f = e.f || [];

        for (i = 0, ii = e.f.length; i < ii; i++) if (e.f[i] == f) {
          exist = true;
          break;
        }

        !exist && e.f.push(f);
      })(names[i]);
    }

    return function (zIndex) {
      if (+zIndex == +zIndex) {
        f.zIndex = +zIndex;
      }
    };
  };
  /*\
   * eve.f
   [ method ]
   **
   * Returns function that will fire given event with optional arguments.
   * Arguments that will be passed to the result function will be also
   * concated to the list of final arguments.
   | el.onclick = eve.f("click", 1, 2);
   | eve.on("click", function (a, b, c) {
   |     console.log(a, b, c); // 1, 2, [event object]
   | });
   > Arguments
   - event (string) event name
   - varargs (…) and any other arguments
   = (function) possible event handler function
  \*/


  eve.f = function (event) {
    var attrs = [].slice.call(arguments, 1);
    return function () {
      eve.apply(null, [event, null].concat(attrs).concat([].slice.call(arguments, 0)));
    };
  };
  /*\
   * eve.stop
   [ method ]
   **
   * Is used inside an event handler to stop the event, preventing any subsequent listeners from firing.
  \*/


  eve.stop = function () {
    stop = 1;
  };
  /*\
   * eve.nt
   [ method ]
   **
   * Could be used inside event handler to figure out actual name of the event.
   **
   > Arguments
   **
   - subname (string) #optional subname of the event
   **
   = (string) name of the event, if `subname` is not specified
   * or
   = (boolean) `true`, if current event’s name contains `subname`
  \*/


  eve.nt = function (subname) {
    var cur = isArray(current_event) ? current_event.join(".") : current_event;

    if (subname) {
      return new RegExp("(?:\\.|\\/|^)" + subname + "(?:\\.|\\/|$)").test(cur);
    }

    return cur;
  };
  /*\
   * eve.nts
   [ method ]
   **
   * Could be used inside event handler to figure out actual name of the event.
   **
   **
   = (array) names of the event
  \*/


  eve.nts = function () {
    return isArray(current_event) ? current_event : current_event.split(separator);
  };
  /*\
   * eve.off
   [ method ]
   **
   * Removes given function from the list of event listeners assigned to given name.
   * If no arguments specified all the events will be cleared.
   **
   > Arguments
   **
   - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
   - f (function) event handler function
  \*/

  /*\
   * eve.unbind
   [ method ]
   **
   * See @eve.off
  \*/


  eve.off = eve.unbind = function (name, f) {
    if (!name) {
      eve._events = events = {
        n: {}
      };
      return;
    }

    var names = isArray(name) ? isArray(name[0]) ? name : [name] : Str(name).split(comaseparator);

    if (names.length > 1) {
      for (var i = 0, ii = names.length; i < ii; i++) {
        eve.off(names[i], f);
      }

      return;
    }

    names = isArray(name) ? name : Str(name).split(separator);
    var e,
        key,
        splice,
        i,
        ii,
        j,
        jj,
        cur = [events],
        inodes = [];

    for (i = 0, ii = names.length; i < ii; i++) {
      for (j = 0; j < cur.length; j += splice.length - 2) {
        splice = [j, 1];
        e = cur[j].n;

        if (names[i] != wildcard) {
          if (e[names[i]]) {
            splice.push(e[names[i]]);
            inodes.unshift({
              n: e,
              name: names[i]
            });
          }
        } else {
          for (key in e) if (e[has](key)) {
            splice.push(e[key]);
            inodes.unshift({
              n: e,
              name: key
            });
          }
        }

        cur.splice.apply(cur, splice);
      }
    }

    for (i = 0, ii = cur.length; i < ii; i++) {
      e = cur[i];

      while (e.n) {
        if (f) {
          if (e.f) {
            for (j = 0, jj = e.f.length; j < jj; j++) if (e.f[j] == f) {
              e.f.splice(j, 1);
              break;
            }

            !e.f.length && delete e.f;
          }

          for (key in e.n) if (e.n[has](key) && e.n[key].f) {
            var funcs = e.n[key].f;

            for (j = 0, jj = funcs.length; j < jj; j++) if (funcs[j] == f) {
              funcs.splice(j, 1);
              break;
            }

            !funcs.length && delete e.n[key].f;
          }
        } else {
          delete e.f;

          for (key in e.n) if (e.n[has](key) && e.n[key].f) {
            delete e.n[key].f;
          }
        }

        e = e.n;
      }
    } // prune inner nodes in path


    prune: for (i = 0, ii = inodes.length; i < ii; i++) {
      e = inodes[i];

      for (key in e.n[e.name].f) {
        // not empty (has listeners)
        continue prune;
      }

      for (key in e.n[e.name].n) {
        // not empty (has children)
        continue prune;
      } // is empty


      delete e.n[e.name];
    }
  };
  /*\
   * eve.once
   [ method ]
   **
   * Binds given event handler with a given name to only run once then unbind itself.
   | eve.once("login", f);
   | eve("login"); // triggers f
   | eve("login"); // no listeners
   * Use @eve to trigger the listener.
   **
   > Arguments
   **
   - name (string) name of the event, dot (`.`) or slash (`/`) separated, with optional wildcards
   - f (function) event handler function
   **
   = (function) same return function as @eve.on
  \*/


  eve.once = function (name, f) {
    var f2 = function () {
      eve.off(name, f2);
      return f.apply(this, arguments);
    };

    return eve.on(name, f2);
  };
  /*\
   * eve.version
   [ property (string) ]
   **
   * Current version of the library.
  \*/


  eve.version = version;

  eve.toString = function () {
    return "You are running Eve " + version;
  };

  typeof module != "undefined" && module.exports ? module.exports = eve : typeof define === "function" && define.amd ? define("eve", [], function () {
    return eve;
  }) : glob.eve = eve;
})(this);

(function (glob, factory) {
  // AMD support
  if (typeof define == "function" && define.amd) {
    // Define as an anonymous module
    define(["eve"], function (eve) {
      return factory(glob, eve);
    });
  } else if (typeof exports != "undefined") {
    // Next for Node.js or CommonJS
    var eve = require("eve");

    module.exports = factory(glob, eve);
  } else {
    // Browser globals (glob is window)
    // Snap adds itself to window
    factory(glob, glob.eve);
  }
})(window || this, function (window, eve) {
  // Copyright (c) 2017 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.
  var mina = function (eve) {
    var animations = {},
        requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
      setTimeout(callback, 16, new Date().getTime());
      return true;
    },
        requestID,
        isArray = Array.isArray || function (a) {
      return a instanceof Array || Object.prototype.toString.call(a) == "[object Array]";
    },
        idgen = 0,
        idprefix = "M" + (+new Date()).toString(36),
        ID = function () {
      return idprefix + (idgen++).toString(36);
    },
        diff = function (a, b, A, B) {
      if (isArray(a)) {
        res = [];

        for (var i = 0, ii = a.length; i < ii; i++) {
          res[i] = diff(a[i], b, A[i], B);
        }

        return res;
      }

      var dif = (A - a) / (B - b);
      return function (bb) {
        return a + dif * (bb - b);
      };
    },
        timer = Date.now || function () {
      return +new Date();
    },
        sta = function (val) {
      var a = this;

      if (val == null) {
        return a.s;
      }

      var ds = a.s - val;
      a.b += a.dur * ds;
      a.B += a.dur * ds;
      a.s = val;
    },
        speed = function (val) {
      var a = this;

      if (val == null) {
        return a.spd;
      }

      a.spd = val;
    },
        duration = function (val) {
      var a = this;

      if (val == null) {
        return a.dur;
      }

      a.s = a.s * val / a.dur;
      a.dur = val;
    },
        stopit = function () {
      var a = this;
      delete animations[a.id];
      a.update();
      eve("mina.stop." + a.id, a);
    },
        pause = function () {
      var a = this;

      if (a.pdif) {
        return;
      }

      delete animations[a.id];
      a.update();
      a.pdif = a.get() - a.b;
    },
        resume = function () {
      var a = this;

      if (!a.pdif) {
        return;
      }

      a.b = a.get() - a.pdif;
      delete a.pdif;
      animations[a.id] = a;
      frame();
    },
        update = function () {
      var a = this,
          res;

      if (isArray(a.start)) {
        res = [];

        for (var j = 0, jj = a.start.length; j < jj; j++) {
          res[j] = +a.start[j] + (a.end[j] - a.start[j]) * a.easing(a.s);
        }
      } else {
        res = +a.start + (a.end - a.start) * a.easing(a.s);
      }

      a.set(res);
    },
        frame = function (timeStamp) {
      // Manual invokation?
      if (!timeStamp) {
        // Frame loop stopped?
        if (!requestID) {
          // Start frame loop...
          requestID = requestAnimFrame(frame);
        }

        return;
      }

      var len = 0;

      for (var i in animations) if (animations.hasOwnProperty(i)) {
        var a = animations[i],
            b = a.get(),
            res;
        len++;
        a.s = (b - a.b) / (a.dur / a.spd);

        if (a.s >= 1) {
          delete animations[i];
          a.s = 1;
          len--;

          (function (a) {
            setTimeout(function () {
              eve("mina.finish." + a.id, a);
            });
          })(a);
        }

        a.update();
      }

      requestID = len ? requestAnimFrame(frame) : false;
    },

    /*\
     * mina
     [ method ]
     **
     * Generic animation of numbers
     **
     - a (number) start _slave_ number
     - A (number) end _slave_ number
     - b (number) start _master_ number (start time in general case)
     - B (number) end _master_ number (end time in general case)
     - get (function) getter of _master_ number (see @mina.time)
     - set (function) setter of _slave_ number
     - easing (function) #optional easing function, default is @mina.linear
     = (object) animation descriptor
     o {
     o         id (string) animation id,
     o         start (number) start _slave_ number,
     o         end (number) end _slave_ number,
     o         b (number) start _master_ number,
     o         s (number) animation status (0..1),
     o         dur (number) animation duration,
     o         spd (number) animation speed,
     o         get (function) getter of _master_ number (see @mina.time),
     o         set (function) setter of _slave_ number,
     o         easing (function) easing function, default is @mina.linear,
     o         status (function) status getter/setter,
     o         speed (function) speed getter/setter,
     o         duration (function) duration getter/setter,
     o         stop (function) animation stopper
     o         pause (function) pauses the animation
     o         resume (function) resumes the animation
     o         update (function) calles setter with the right value of the animation
     o }
    \*/
    mina = function (a, A, b, B, get, set, easing) {
      var anim = {
        id: ID(),
        start: a,
        end: A,
        b: b,
        s: 0,
        dur: B - b,
        spd: 1,
        get: get,
        set: set,
        easing: easing || mina.linear,
        status: sta,
        speed: speed,
        duration: duration,
        stop: stopit,
        pause: pause,
        resume: resume,
        update: update
      };
      animations[anim.id] = anim;
      var len = 0,
          i;

      for (i in animations) if (animations.hasOwnProperty(i)) {
        len++;

        if (len == 2) {
          break;
        }
      }

      len == 1 && frame();
      return anim;
    };
    /*\
     * mina.time
     [ method ]
     **
     * Returns the current time. Equivalent to:
     | function () {
     |     return (new Date).getTime();
     | }
    \*/


    mina.time = timer;
    /*\
     * mina.getById
     [ method ]
     **
     * Returns an animation by its id
     - id (string) animation's id
     = (object) See @mina
    \*/

    mina.getById = function (id) {
      return animations[id] || null;
    };
    /*\
     * mina.linear
     [ method ]
     **
     * Default linear easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/


    mina.linear = function (n) {
      return n;
    };
    /*\
     * mina.easeout
     [ method ]
     **
     * Easeout easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/


    mina.easeout = function (n) {
      return Math.pow(n, 1.7);
    };
    /*\
     * mina.easein
     [ method ]
     **
     * Easein easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/


    mina.easein = function (n) {
      return Math.pow(n, .48);
    };
    /*\
     * mina.easeinout
     [ method ]
     **
     * Easeinout easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/


    mina.easeinout = function (n) {
      if (n == 1) {
        return 1;
      }

      if (n == 0) {
        return 0;
      }

      var q = .48 - n / 1.04,
          Q = Math.sqrt(.1734 + q * q),
          x = Q - q,
          X = Math.pow(Math.abs(x), 1 / 3) * (x < 0 ? -1 : 1),
          y = -Q - q,
          Y = Math.pow(Math.abs(y), 1 / 3) * (y < 0 ? -1 : 1),
          t = X + Y + .5;
      return (1 - t) * 3 * t * t + t * t * t;
    };
    /*\
     * mina.backin
     [ method ]
     **
     * Backin easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/


    mina.backin = function (n) {
      if (n == 1) {
        return 1;
      }

      var s = 1.70158;
      return n * n * ((s + 1) * n - s);
    };
    /*\
     * mina.backout
     [ method ]
     **
     * Backout easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/


    mina.backout = function (n) {
      if (n == 0) {
        return 0;
      }

      n = n - 1;
      var s = 1.70158;
      return n * n * ((s + 1) * n + s) + 1;
    };
    /*\
     * mina.elastic
     [ method ]
     **
     * Elastic easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/


    mina.elastic = function (n) {
      if (n == !!n) {
        return n;
      }

      return Math.pow(2, -10 * n) * Math.sin((n - .075) * (2 * Math.PI) / .3) + 1;
    };
    /*\
     * mina.bounce
     [ method ]
     **
     * Bounce easing
     - n (number) input 0..1
     = (number) output 0..1
    \*/


    mina.bounce = function (n) {
      var s = 7.5625,
          p = 2.75,
          l;

      if (n < 1 / p) {
        l = s * n * n;
      } else {
        if (n < 2 / p) {
          n -= 1.5 / p;
          l = s * n * n + .75;
        } else {
          if (n < 2.5 / p) {
            n -= 2.25 / p;
            l = s * n * n + .9375;
          } else {
            n -= 2.625 / p;
            l = s * n * n + .984375;
          }
        }
      }

      return l;
    };

    window.mina = mina;
    return mina;
  }(typeof eve == "undefined" ? function () {} : eve); // Copyright (c) 2013 - 2017 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.


  var Snap = function (root) {
    Snap.version = "0.5.1";
    /*\
     * Snap
     [ method ]
     **
     * Creates a drawing surface or wraps existing SVG element.
     **
     - width (number|string) width of surface
     - height (number|string) height of surface
     * or
     - DOM (SVGElement) element to be wrapped into Snap structure
     * or
     - array (array) array of elements (will return set of elements)
     * or
     - query (string) CSS query selector
     = (object) @Element
    \*/

    function Snap(w, h) {
      if (w) {
        if (w.nodeType) {
          return wrap(w);
        }

        if (is(w, "array") && Snap.set) {
          return Snap.set.apply(Snap, w);
        }

        if (w instanceof Element) {
          return w;
        }

        if (h == null) {
          // try {
          w = glob.doc.querySelector(String(w));
          return wrap(w); // } catch (e) {
          // return null;
          // }
        }
      }

      w = w == null ? "100%" : w;
      h = h == null ? "100%" : h;
      return new Paper(w, h);
    }

    Snap.toString = function () {
      return "Snap v" + this.version;
    };

    Snap._ = {};
    var glob = {
      win: root.window,
      doc: root.window.document
    };
    Snap._.glob = glob;

    var has = "hasOwnProperty",
        Str = String,
        toFloat = parseFloat,
        toInt = parseInt,
        math = Math,
        mmax = math.max,
        mmin = math.min,
        abs = math.abs,
        pow = math.pow,
        PI = math.PI,
        round = math.round,
        E = "",
        S = " ",
        objectToString = Object.prototype.toString,
        ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i,
        colourRegExp = /^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?%?)\s*\))\s*$/i,
        bezierrg = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,
        separator = Snap._.separator = /[,\s]+/,
        whitespace = /[\s]/g,
        commaSpaces = /[\s]*,[\s]*/,
        hsrg = {
      hs: 1,
      rg: 1
    },
        pathCommand = /([a-z])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig,
        tCommand = /([rstm])[\s,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\s]*,?[\s]*)+)/ig,
        pathValues = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\s]*,?[\s]*/ig,
        idgen = 0,
        idprefix = "S" + (+new Date()).toString(36),
        ID = function (el) {
      return (el && el.type ? el.type : E) + idprefix + (idgen++).toString(36);
    },
        xlink = "http://www.w3.org/1999/xlink",
        xmlns = "http://www.w3.org/2000/svg",
        hub = {},

    /*\
     * Snap.url
     [ method ]
     **
     * Wraps path into `"url('<path>')"`.
     - value (string) path
     = (string) wrapped path
    \*/
    URL = Snap.url = function (url) {
      return "url('#" + url + "')";
    };

    function $(el, attr) {
      if (attr) {
        if (el == "#text") {
          el = glob.doc.createTextNode(attr.text || attr["#text"] || "");
        }

        if (el == "#comment") {
          el = glob.doc.createComment(attr.text || attr["#text"] || "");
        }

        if (typeof el == "string") {
          el = $(el);
        }

        if (typeof attr == "string") {
          if (el.nodeType == 1) {
            if (attr.substring(0, 6) == "xlink:") {
              return el.getAttributeNS(xlink, attr.substring(6));
            }

            if (attr.substring(0, 4) == "xml:") {
              return el.getAttributeNS(xmlns, attr.substring(4));
            }

            return el.getAttribute(attr);
          } else if (attr == "text") {
            return el.nodeValue;
          } else {
            return null;
          }
        }

        if (el.nodeType == 1) {
          for (var key in attr) if (attr[has](key)) {
            var val = Str(attr[key]);

            if (val) {
              if (key.substring(0, 6) == "xlink:") {
                el.setAttributeNS(xlink, key.substring(6), val);
              } else if (key.substring(0, 4) == "xml:") {
                el.setAttributeNS(xmlns, key.substring(4), val);
              } else {
                el.setAttribute(key, val);
              }
            } else {
              el.removeAttribute(key);
            }
          }
        } else if ("text" in attr) {
          el.nodeValue = attr.text;
        }
      } else {
        el = glob.doc.createElementNS(xmlns, el);
      }

      return el;
    }

    Snap._.$ = $;
    Snap._.id = ID;

    function getAttrs(el) {
      var attrs = el.attributes,
          name,
          out = {};

      for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].namespaceURI == xlink) {
          name = "xlink:";
        } else {
          name = "";
        }

        name += attrs[i].name;
        out[name] = attrs[i].textContent;
      }

      return out;
    }

    function is(o, type) {
      type = Str.prototype.toLowerCase.call(type);

      if (type == "finite") {
        return isFinite(o);
      }

      if (type == "array" && (o instanceof Array || Array.isArray && Array.isArray(o))) {
        return true;
      }

      return type == "null" && o === null || type == typeof o && o !== null || type == "object" && o === Object(o) || objectToString.call(o).slice(8, -1).toLowerCase() == type;
    }
    /*\
     * Snap.format
     [ method ]
     **
     * Replaces construction of type `{<name>}` to the corresponding argument
     **
     - token (string) string to format
     - json (object) object which properties are used as a replacement
     = (string) formatted string
     > Usage
     | // this draws a rectangular shape equivalent to "M10,20h40v50h-40z"
     | paper.path(Snap.format("M{x},{y}h{dim.width}v{dim.height}h{dim['negative width']}z", {
     |     x: 10,
     |     y: 20,
     |     dim: {
     |         width: 40,
     |         height: 50,
     |         "negative width": -40
     |     }
     | }));
    \*/


    Snap.format = function () {
      var tokenRegex = /\{([^\}]+)\}/g,
          objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,
          // matches .xxxxx or ["xxxxx"] to run over object properties
      replacer = function (all, key, obj) {
        var res = obj;
        key.replace(objNotationRegex, function (all, name, quote, quotedName, isFunc) {
          name = name || quotedName;

          if (res) {
            if (name in res) {
              res = res[name];
            }

            typeof res == "function" && isFunc && (res = res());
          }
        });
        res = (res == null || res == obj ? all : res) + "";
        return res;
      };

      return function (str, obj) {
        return Str(str).replace(tokenRegex, function (all, key) {
          return replacer(all, key, obj);
        });
      };
    }();

    function clone(obj) {
      if (typeof obj == "function" || Object(obj) !== obj) {
        return obj;
      }

      var res = new obj.constructor();

      for (var key in obj) if (obj[has](key)) {
        res[key] = clone(obj[key]);
      }

      return res;
    }

    Snap._.clone = clone;

    function repush(array, item) {
      for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
        return array.push(array.splice(i, 1)[0]);
      }
    }

    function cacher(f, scope, postprocessor) {
      function newf() {
        var arg = Array.prototype.slice.call(arguments, 0),
            args = arg.join("\u2400"),
            cache = newf.cache = newf.cache || {},
            count = newf.count = newf.count || [];

        if (cache[has](args)) {
          repush(count, args);
          return postprocessor ? postprocessor(cache[args]) : cache[args];
        }

        count.length >= 1e3 && delete cache[count.shift()];
        count.push(args);
        cache[args] = f.apply(scope, arg);
        return postprocessor ? postprocessor(cache[args]) : cache[args];
      }

      return newf;
    }

    Snap._.cacher = cacher;

    function angle(x1, y1, x2, y2, x3, y3) {
      if (x3 == null) {
        var x = x1 - x2,
            y = y1 - y2;

        if (!x && !y) {
          return 0;
        }

        return (180 + math.atan2(-y, -x) * 180 / PI + 360) % 360;
      } else {
        return angle(x1, y1, x3, y3) - angle(x2, y2, x3, y3);
      }
    }

    function rad(deg) {
      return deg % 360 * PI / 180;
    }

    function deg(rad) {
      return rad * 180 / PI % 360;
    }

    function x_y() {
      return this.x + S + this.y;
    }

    function x_y_w_h() {
      return this.x + S + this.y + S + this.width + " \xd7 " + this.height;
    }
    /*\
     * Snap.rad
     [ method ]
     **
     * Transform angle to radians
     - deg (number) angle in degrees
     = (number) angle in radians
    \*/


    Snap.rad = rad;
    /*\
     * Snap.deg
     [ method ]
     **
     * Transform angle to degrees
     - rad (number) angle in radians
     = (number) angle in degrees
    \*/

    Snap.deg = deg;
    /*\
     * Snap.sin
     [ method ]
     **
     * Equivalent to `Math.sin()` only works with degrees, not radians.
     - angle (number) angle in degrees
     = (number) sin
    \*/

    Snap.sin = function (angle) {
      return math.sin(Snap.rad(angle));
    };
    /*\
     * Snap.tan
     [ method ]
     **
     * Equivalent to `Math.tan()` only works with degrees, not radians.
     - angle (number) angle in degrees
     = (number) tan
    \*/


    Snap.tan = function (angle) {
      return math.tan(Snap.rad(angle));
    };
    /*\
     * Snap.cos
     [ method ]
     **
     * Equivalent to `Math.cos()` only works with degrees, not radians.
     - angle (number) angle in degrees
     = (number) cos
    \*/


    Snap.cos = function (angle) {
      return math.cos(Snap.rad(angle));
    };
    /*\
     * Snap.asin
     [ method ]
     **
     * Equivalent to `Math.asin()` only works with degrees, not radians.
     - num (number) value
     = (number) asin in degrees
    \*/


    Snap.asin = function (num) {
      return Snap.deg(math.asin(num));
    };
    /*\
     * Snap.acos
     [ method ]
     **
     * Equivalent to `Math.acos()` only works with degrees, not radians.
     - num (number) value
     = (number) acos in degrees
    \*/


    Snap.acos = function (num) {
      return Snap.deg(math.acos(num));
    };
    /*\
     * Snap.atan
     [ method ]
     **
     * Equivalent to `Math.atan()` only works with degrees, not radians.
     - num (number) value
     = (number) atan in degrees
    \*/


    Snap.atan = function (num) {
      return Snap.deg(math.atan(num));
    };
    /*\
     * Snap.atan2
     [ method ]
     **
     * Equivalent to `Math.atan2()` only works with degrees, not radians.
     - num (number) value
     = (number) atan2 in degrees
    \*/


    Snap.atan2 = function (num) {
      return Snap.deg(math.atan2(num));
    };
    /*\
     * Snap.angle
     [ method ]
     **
     * Returns an angle between two or three points
     - x1 (number) x coord of first point
     - y1 (number) y coord of first point
     - x2 (number) x coord of second point
     - y2 (number) y coord of second point
     - x3 (number) #optional x coord of third point
     - y3 (number) #optional y coord of third point
     = (number) angle in degrees
    \*/


    Snap.angle = angle;
    /*\
     * Snap.len
     [ method ]
     **
     * Returns distance between two points
     - x1 (number) x coord of first point
     - y1 (number) y coord of first point
     - x2 (number) x coord of second point
     - y2 (number) y coord of second point
     = (number) distance
    \*/

    Snap.len = function (x1, y1, x2, y2) {
      return Math.sqrt(Snap.len2(x1, y1, x2, y2));
    };
    /*\
     * Snap.len2
     [ method ]
     **
     * Returns squared distance between two points
     - x1 (number) x coord of first point
     - y1 (number) y coord of first point
     - x2 (number) x coord of second point
     - y2 (number) y coord of second point
     = (number) distance
    \*/


    Snap.len2 = function (x1, y1, x2, y2) {
      return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    };
    /*\
     * Snap.closestPoint
     [ method ]
     **
     * Returns closest point to a given one on a given path.
     - path (Element) path element
     - x (number) x coord of a point
     - y (number) y coord of a point
     = (object) in format
     {
        x (number) x coord of the point on the path
        y (number) y coord of the point on the path
        length (number) length of the path to the point
        distance (number) distance from the given point to the path
     }
    \*/
    // Copied from http://bl.ocks.org/mbostock/8027637


    Snap.closestPoint = function (path, x, y) {
      function distance2(p) {
        var dx = p.x - x,
            dy = p.y - y;
        return dx * dx + dy * dy;
      }

      var pathNode = path.node,
          pathLength = pathNode.getTotalLength(),
          precision = pathLength / pathNode.pathSegList.numberOfItems * .125,
          best,
          bestLength,
          bestDistance = Infinity; // linear scan for coarse approximation

      for (var scan, scanLength = 0, scanDistance; scanLength <= pathLength; scanLength += precision) {
        if ((scanDistance = distance2(scan = pathNode.getPointAtLength(scanLength))) < bestDistance) {
          best = scan;
          bestLength = scanLength;
          bestDistance = scanDistance;
        }
      } // binary search for precise estimate


      precision *= .5;

      while (precision > .5) {
        var before, after, beforeLength, afterLength, beforeDistance, afterDistance;

        if ((beforeLength = bestLength - precision) >= 0 && (beforeDistance = distance2(before = pathNode.getPointAtLength(beforeLength))) < bestDistance) {
          best = before;
          bestLength = beforeLength;
          bestDistance = beforeDistance;
        } else if ((afterLength = bestLength + precision) <= pathLength && (afterDistance = distance2(after = pathNode.getPointAtLength(afterLength))) < bestDistance) {
          best = after;
          bestLength = afterLength;
          bestDistance = afterDistance;
        } else {
          precision *= .5;
        }
      }

      best = {
        x: best.x,
        y: best.y,
        length: bestLength,
        distance: Math.sqrt(bestDistance)
      };
      return best;
    };
    /*\
     * Snap.is
     [ method ]
     **
     * Handy replacement for the `typeof` operator
     - o (…) any object or primitive
     - type (string) name of the type, e.g., `string`, `function`, `number`, etc.
     = (boolean) `true` if given value is of given type
    \*/


    Snap.is = is;
    /*\
     * Snap.snapTo
     [ method ]
     **
     * Snaps given value to given grid
     - values (array|number) given array of values or step of the grid
     - value (number) value to adjust
     - tolerance (number) #optional maximum distance to the target value that would trigger the snap. Default is `10`.
     = (number) adjusted value
    \*/

    Snap.snapTo = function (values, value, tolerance) {
      tolerance = is(tolerance, "finite") ? tolerance : 10;

      if (is(values, "array")) {
        var i = values.length;

        while (i--) if (abs(values[i] - value) <= tolerance) {
          return values[i];
        }
      } else {
        values = +values;
        var rem = value % values;

        if (rem < tolerance) {
          return value - rem;
        }

        if (rem > values - tolerance) {
          return value - rem + values;
        }
      }

      return value;
    }; // Colour

    /*\
     * Snap.getRGB
     [ method ]
     **
     * Parses color string as RGB object
     - color (string) color string in one of the following formats:
     # <ul>
     #     <li>Color name (<code>red</code>, <code>green</code>, <code>cornflowerblue</code>, etc)</li>
     #     <li>#••• — shortened HTML color: (<code>#000</code>, <code>#fc0</code>, etc.)</li>
     #     <li>#•••••• — full length HTML color: (<code>#000000</code>, <code>#bd2300</code>)</li>
     #     <li>rgb(•••, •••, •••) — red, green and blue channels values: (<code>rgb(200,&nbsp;100,&nbsp;0)</code>)</li>
     #     <li>rgba(•••, •••, •••, •••) — also with opacity</li>
     #     <li>rgb(•••%, •••%, •••%) — same as above, but in %: (<code>rgb(100%,&nbsp;175%,&nbsp;0%)</code>)</li>
     #     <li>rgba(•••%, •••%, •••%, •••%) — also with opacity</li>
     #     <li>hsb(•••, •••, •••) — hue, saturation and brightness values: (<code>hsb(0.5,&nbsp;0.25,&nbsp;1)</code>)</li>
     #     <li>hsba(•••, •••, •••, •••) — also with opacity</li>
     #     <li>hsb(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsba(•••%, •••%, •••%, •••%) — also with opacity</li>
     #     <li>hsl(•••, •••, •••) — hue, saturation and luminosity values: (<code>hsb(0.5,&nbsp;0.25,&nbsp;0.5)</code>)</li>
     #     <li>hsla(•••, •••, •••, •••) — also with opacity</li>
     #     <li>hsl(•••%, •••%, •••%) — same as above, but in %</li>
     #     <li>hsla(•••%, •••%, •••%, •••%) — also with opacity</li>
     # </ul>
     * Note that `%` can be used any time: `rgb(20%, 255, 50%)`.
     = (object) RGB object in the following format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) true if string can't be parsed
     o }
    \*/


    Snap.getRGB = cacher(function (colour) {
      if (!colour || !!((colour = Str(colour)).indexOf("-") + 1)) {
        return {
          r: -1,
          g: -1,
          b: -1,
          hex: "none",
          error: 1,
          toString: rgbtoString
        };
      }

      if (colour == "none") {
        return {
          r: -1,
          g: -1,
          b: -1,
          hex: "none",
          toString: rgbtoString
        };
      }

      !(hsrg[has](colour.toLowerCase().substring(0, 2)) || colour.charAt() == "#") && (colour = toHex(colour));

      if (!colour) {
        return {
          r: -1,
          g: -1,
          b: -1,
          hex: "none",
          error: 1,
          toString: rgbtoString
        };
      }

      var res,
          red,
          green,
          blue,
          opacity,
          t,
          values,
          rgb = colour.match(colourRegExp);

      if (rgb) {
        if (rgb[2]) {
          blue = toInt(rgb[2].substring(5), 16);
          green = toInt(rgb[2].substring(3, 5), 16);
          red = toInt(rgb[2].substring(1, 3), 16);
        }

        if (rgb[3]) {
          blue = toInt((t = rgb[3].charAt(3)) + t, 16);
          green = toInt((t = rgb[3].charAt(2)) + t, 16);
          red = toInt((t = rgb[3].charAt(1)) + t, 16);
        }

        if (rgb[4]) {
          values = rgb[4].split(commaSpaces);
          red = toFloat(values[0]);
          values[0].slice(-1) == "%" && (red *= 2.55);
          green = toFloat(values[1]);
          values[1].slice(-1) == "%" && (green *= 2.55);
          blue = toFloat(values[2]);
          values[2].slice(-1) == "%" && (blue *= 2.55);
          rgb[1].toLowerCase().slice(0, 4) == "rgba" && (opacity = toFloat(values[3]));
          values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
        }

        if (rgb[5]) {
          values = rgb[5].split(commaSpaces);
          red = toFloat(values[0]);
          values[0].slice(-1) == "%" && (red /= 100);
          green = toFloat(values[1]);
          values[1].slice(-1) == "%" && (green /= 100);
          blue = toFloat(values[2]);
          values[2].slice(-1) == "%" && (blue /= 100);
          (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
          rgb[1].toLowerCase().slice(0, 4) == "hsba" && (opacity = toFloat(values[3]));
          values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
          return Snap.hsb2rgb(red, green, blue, opacity);
        }

        if (rgb[6]) {
          values = rgb[6].split(commaSpaces);
          red = toFloat(values[0]);
          values[0].slice(-1) == "%" && (red /= 100);
          green = toFloat(values[1]);
          values[1].slice(-1) == "%" && (green /= 100);
          blue = toFloat(values[2]);
          values[2].slice(-1) == "%" && (blue /= 100);
          (values[0].slice(-3) == "deg" || values[0].slice(-1) == "\xb0") && (red /= 360);
          rgb[1].toLowerCase().slice(0, 4) == "hsla" && (opacity = toFloat(values[3]));
          values[3] && values[3].slice(-1) == "%" && (opacity /= 100);
          return Snap.hsl2rgb(red, green, blue, opacity);
        }

        red = mmin(math.round(red), 255);
        green = mmin(math.round(green), 255);
        blue = mmin(math.round(blue), 255);
        opacity = mmin(mmax(opacity, 0), 1);
        rgb = {
          r: red,
          g: green,
          b: blue,
          toString: rgbtoString
        };
        rgb.hex = "#" + (16777216 | blue | green << 8 | red << 16).toString(16).slice(1);
        rgb.opacity = is(opacity, "finite") ? opacity : 1;
        return rgb;
      }

      return {
        r: -1,
        g: -1,
        b: -1,
        hex: "none",
        error: 1,
        toString: rgbtoString
      };
    }, Snap);
    /*\
     * Snap.hsb
     [ method ]
     **
     * Converts HSB values to a hex representation of the color
     - h (number) hue
     - s (number) saturation
     - b (number) value or brightness
     = (string) hex representation of the color
    \*/

    Snap.hsb = cacher(function (h, s, b) {
      return Snap.hsb2rgb(h, s, b).hex;
    });
    /*\
     * Snap.hsl
     [ method ]
     **
     * Converts HSL values to a hex representation of the color
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (string) hex representation of the color
    \*/

    Snap.hsl = cacher(function (h, s, l) {
      return Snap.hsl2rgb(h, s, l).hex;
    });
    /*\
     * Snap.rgb
     [ method ]
     **
     * Converts RGB values to a hex representation of the color
     - r (number) red
     - g (number) green
     - b (number) blue
     = (string) hex representation of the color
    \*/

    Snap.rgb = cacher(function (r, g, b, o) {
      if (is(o, "finite")) {
        var round = math.round;
        return "rgba(" + [round(r), round(g), round(b), +o.toFixed(2)] + ")";
      }

      return "#" + (16777216 | b | g << 8 | r << 16).toString(16).slice(1);
    });

    var toHex = function (color) {
      var i = glob.doc.getElementsByTagName("head")[0] || glob.doc.getElementsByTagName("svg")[0],
          red = "rgb(255, 0, 0)";
      toHex = cacher(function (color) {
        if (color.toLowerCase() == "red") {
          return red;
        }

        i.style.color = red;
        i.style.color = color;
        var out = glob.doc.defaultView.getComputedStyle(i, E).getPropertyValue("color");
        return out == red ? null : out;
      });
      return toHex(color);
    },
        hsbtoString = function () {
      return "hsb(" + [this.h, this.s, this.b] + ")";
    },
        hsltoString = function () {
      return "hsl(" + [this.h, this.s, this.l] + ")";
    },
        rgbtoString = function () {
      return this.opacity == 1 || this.opacity == null ? this.hex : "rgba(" + [this.r, this.g, this.b, this.opacity] + ")";
    },
        prepareRGB = function (r, g, b) {
      if (g == null && is(r, "object") && "r" in r && "g" in r && "b" in r) {
        b = r.b;
        g = r.g;
        r = r.r;
      }

      if (g == null && is(r, string)) {
        var clr = Snap.getRGB(r);
        r = clr.r;
        g = clr.g;
        b = clr.b;
      }

      if (r > 1 || g > 1 || b > 1) {
        r /= 255;
        g /= 255;
        b /= 255;
      }

      return [r, g, b];
    },
        packageRGB = function (r, g, b, o) {
      r = math.round(r * 255);
      g = math.round(g * 255);
      b = math.round(b * 255);
      var rgb = {
        r: r,
        g: g,
        b: b,
        opacity: is(o, "finite") ? o : 1,
        hex: Snap.rgb(r, g, b),
        toString: rgbtoString
      };
      is(o, "finite") && (rgb.opacity = o);
      return rgb;
    };
    /*\
     * Snap.color
     [ method ]
     **
     * Parses the color string and returns an object featuring the color's component values
     - clr (string) color string in one of the supported formats (see @Snap.getRGB)
     = (object) Combined RGB/HSB object in the following format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••,
     o     error (boolean) `true` if string can't be parsed,
     o     h (number) hue,
     o     s (number) saturation,
     o     v (number) value (brightness),
     o     l (number) lightness
     o }
    \*/


    Snap.color = function (clr) {
      var rgb;

      if (is(clr, "object") && "h" in clr && "s" in clr && "b" in clr) {
        rgb = Snap.hsb2rgb(clr);
        clr.r = rgb.r;
        clr.g = rgb.g;
        clr.b = rgb.b;
        clr.opacity = 1;
        clr.hex = rgb.hex;
      } else if (is(clr, "object") && "h" in clr && "s" in clr && "l" in clr) {
        rgb = Snap.hsl2rgb(clr);
        clr.r = rgb.r;
        clr.g = rgb.g;
        clr.b = rgb.b;
        clr.opacity = 1;
        clr.hex = rgb.hex;
      } else {
        if (is(clr, "string")) {
          clr = Snap.getRGB(clr);
        }

        if (is(clr, "object") && "r" in clr && "g" in clr && "b" in clr && !("error" in clr)) {
          rgb = Snap.rgb2hsl(clr);
          clr.h = rgb.h;
          clr.s = rgb.s;
          clr.l = rgb.l;
          rgb = Snap.rgb2hsb(clr);
          clr.v = rgb.b;
        } else {
          clr = {
            hex: "none"
          };
          clr.r = clr.g = clr.b = clr.h = clr.s = clr.v = clr.l = -1;
          clr.error = 1;
        }
      }

      clr.toString = rgbtoString;
      return clr;
    };
    /*\
     * Snap.hsb2rgb
     [ method ]
     **
     * Converts HSB values to an RGB object
     - h (number) hue
     - s (number) saturation
     - v (number) value or brightness
     = (object) RGB object in the following format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/


    Snap.hsb2rgb = function (h, s, v, o) {
      if (is(h, "object") && "h" in h && "s" in h && "b" in h) {
        v = h.b;
        s = h.s;
        o = h.o;
        h = h.h;
      }

      h *= 360;
      var R, G, B, X, C;
      h = h % 360 / 60;
      C = v * s;
      X = C * (1 - abs(h % 2 - 1));
      R = G = B = v - C;
      h = ~~h;
      R += [C, X, 0, 0, X, C][h];
      G += [X, C, C, X, 0, 0][h];
      B += [0, 0, X, C, C, X][h];
      return packageRGB(R, G, B, o);
    };
    /*\
     * Snap.hsl2rgb
     [ method ]
     **
     * Converts HSL values to an RGB object
     - h (number) hue
     - s (number) saturation
     - l (number) luminosity
     = (object) RGB object in the following format:
     o {
     o     r (number) red,
     o     g (number) green,
     o     b (number) blue,
     o     hex (string) color in HTML/CSS format: #••••••
     o }
    \*/


    Snap.hsl2rgb = function (h, s, l, o) {
      if (is(h, "object") && "h" in h && "s" in h && "l" in h) {
        l = h.l;
        s = h.s;
        h = h.h;
      }

      if (h > 1 || s > 1 || l > 1) {
        h /= 360;
        s /= 100;
        l /= 100;
      }

      h *= 360;
      var R, G, B, X, C;
      h = h % 360 / 60;
      C = 2 * s * (l < .5 ? l : 1 - l);
      X = C * (1 - abs(h % 2 - 1));
      R = G = B = l - C / 2;
      h = ~~h;
      R += [C, X, 0, 0, X, C][h];
      G += [X, C, C, X, 0, 0][h];
      B += [0, 0, X, C, C, X][h];
      return packageRGB(R, G, B, o);
    };
    /*\
     * Snap.rgb2hsb
     [ method ]
     **
     * Converts RGB values to an HSB object
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSB object in the following format:
     o {
     o     h (number) hue,
     o     s (number) saturation,
     o     b (number) brightness
     o }
    \*/


    Snap.rgb2hsb = function (r, g, b) {
      b = prepareRGB(r, g, b);
      r = b[0];
      g = b[1];
      b = b[2];
      var H, S, V, C;
      V = mmax(r, g, b);
      C = V - mmin(r, g, b);
      H = C == 0 ? null : V == r ? (g - b) / C : V == g ? (b - r) / C + 2 : (r - g) / C + 4;
      H = (H + 360) % 6 * 60 / 360;
      S = C == 0 ? 0 : C / V;
      return {
        h: H,
        s: S,
        b: V,
        toString: hsbtoString
      };
    };
    /*\
     * Snap.rgb2hsl
     [ method ]
     **
     * Converts RGB values to an HSL object
     - r (number) red
     - g (number) green
     - b (number) blue
     = (object) HSL object in the following format:
     o {
     o     h (number) hue,
     o     s (number) saturation,
     o     l (number) luminosity
     o }
    \*/


    Snap.rgb2hsl = function (r, g, b) {
      b = prepareRGB(r, g, b);
      r = b[0];
      g = b[1];
      b = b[2];
      var H, S, L, M, m, C;
      M = mmax(r, g, b);
      m = mmin(r, g, b);
      C = M - m;
      H = C == 0 ? null : M == r ? (g - b) / C : M == g ? (b - r) / C + 2 : (r - g) / C + 4;
      H = (H + 360) % 6 * 60 / 360;
      L = (M + m) / 2;
      S = C == 0 ? 0 : L < .5 ? C / (2 * L) : C / (2 - 2 * L);
      return {
        h: H,
        s: S,
        l: L,
        toString: hsltoString
      };
    }; // Transformations

    /*\
     * Snap.parsePathString
     [ method ]
     **
     * Utility method
     **
     * Parses given path string into an array of arrays of path segments
     - pathString (string|array) path string or array of segments (in the last case it is returned straight away)
     = (array) array of segments
    \*/


    Snap.parsePathString = function (pathString) {
      if (!pathString) {
        return null;
      }

      var pth = Snap.path(pathString);

      if (pth.arr) {
        return Snap.path.clone(pth.arr);
      }

      var paramCounts = {
        a: 7,
        c: 6,
        o: 2,
        h: 1,
        l: 2,
        m: 2,
        r: 4,
        q: 4,
        s: 4,
        t: 2,
        v: 1,
        u: 3,
        z: 0
      },
          data = [];

      if (is(pathString, "array") && is(pathString[0], "array")) {
        // rough assumption
        data = Snap.path.clone(pathString);
      }

      if (!data.length) {
        Str(pathString).replace(pathCommand, function (a, b, c) {
          var params = [],
              name = b.toLowerCase();
          c.replace(pathValues, function (a, b) {
            b && params.push(+b);
          });

          if (name == "m" && params.length > 2) {
            data.push([b].concat(params.splice(0, 2)));
            name = "l";
            b = b == "m" ? "l" : "L";
          }

          if (name == "o" && params.length == 1) {
            data.push([b, params[0]]);
          }

          if (name == "r") {
            data.push([b].concat(params));
          } else while (params.length >= paramCounts[name]) {
            data.push([b].concat(params.splice(0, paramCounts[name])));

            if (!paramCounts[name]) {
              break;
            }
          }
        });
      }

      data.toString = Snap.path.toString;
      pth.arr = Snap.path.clone(data);
      return data;
    };
    /*\
     * Snap.parseTransformString
     [ method ]
     **
     * Utility method
     **
     * Parses given transform string into an array of transformations
     - TString (string|array) transform string or array of transformations (in the last case it is returned straight away)
     = (array) array of transformations
    \*/


    var parseTransformString = Snap.parseTransformString = function (TString) {
      if (!TString) {
        return null;
      }

      var paramCounts = {
        r: 3,
        s: 4,
        t: 2,
        m: 6
      },
          data = [];

      if (is(TString, "array") && is(TString[0], "array")) {
        // rough assumption
        data = Snap.path.clone(TString);
      }

      if (!data.length) {
        Str(TString).replace(tCommand, function (a, b, c) {
          var params = [],
              name = b.toLowerCase();
          c.replace(pathValues, function (a, b) {
            b && params.push(+b);
          });
          data.push([b].concat(params));
        });
      }

      data.toString = Snap.path.toString;
      return data;
    };

    function svgTransform2string(tstr) {
      var res = [];
      tstr = tstr.replace(/(?:^|\s)(\w+)\(([^)]+)\)/g, function (all, name, params) {
        params = params.split(/\s*,\s*|\s+/);

        if (name == "rotate" && params.length == 1) {
          params.push(0, 0);
        }

        if (name == "scale") {
          if (params.length > 2) {
            params = params.slice(0, 2);
          } else if (params.length == 2) {
            params.push(0, 0);
          }

          if (params.length == 1) {
            params.push(params[0], 0, 0);
          }
        }

        if (name == "skewX") {
          res.push(["m", 1, 0, math.tan(rad(params[0])), 1, 0, 0]);
        } else if (name == "skewY") {
          res.push(["m", 1, math.tan(rad(params[0])), 0, 1, 0, 0]);
        } else {
          res.push([name.charAt(0)].concat(params));
        }

        return all;
      });
      return res;
    }

    Snap._.svgTransform2string = svgTransform2string;
    Snap._.rgTransform = /^[a-z][\s]*-?\.?\d/i;

    function transform2matrix(tstr, bbox) {
      var tdata = parseTransformString(tstr),
          m = new Snap.Matrix();

      if (tdata) {
        for (var i = 0, ii = tdata.length; i < ii; i++) {
          var t = tdata[i],
              tlen = t.length,
              command = Str(t[0]).toLowerCase(),
              absolute = t[0] != command,
              inver = absolute ? m.invert() : 0,
              x1,
              y1,
              x2,
              y2,
              bb;

          if (command == "t" && tlen == 2) {
            m.translate(t[1], 0);
          } else if (command == "t" && tlen == 3) {
            if (absolute) {
              x1 = inver.x(0, 0);
              y1 = inver.y(0, 0);
              x2 = inver.x(t[1], t[2]);
              y2 = inver.y(t[1], t[2]);
              m.translate(x2 - x1, y2 - y1);
            } else {
              m.translate(t[1], t[2]);
            }
          } else if (command == "r") {
            if (tlen == 2) {
              bb = bb || bbox;
              m.rotate(t[1], bb.x + bb.width / 2, bb.y + bb.height / 2);
            } else if (tlen == 4) {
              if (absolute) {
                x2 = inver.x(t[2], t[3]);
                y2 = inver.y(t[2], t[3]);
                m.rotate(t[1], x2, y2);
              } else {
                m.rotate(t[1], t[2], t[3]);
              }
            }
          } else if (command == "s") {
            if (tlen == 2 || tlen == 3) {
              bb = bb || bbox;
              m.scale(t[1], t[tlen - 1], bb.x + bb.width / 2, bb.y + bb.height / 2);
            } else if (tlen == 4) {
              if (absolute) {
                x2 = inver.x(t[2], t[3]);
                y2 = inver.y(t[2], t[3]);
                m.scale(t[1], t[1], x2, y2);
              } else {
                m.scale(t[1], t[1], t[2], t[3]);
              }
            } else if (tlen == 5) {
              if (absolute) {
                x2 = inver.x(t[3], t[4]);
                y2 = inver.y(t[3], t[4]);
                m.scale(t[1], t[2], x2, y2);
              } else {
                m.scale(t[1], t[2], t[3], t[4]);
              }
            }
          } else if (command == "m" && tlen == 7) {
            m.add(t[1], t[2], t[3], t[4], t[5], t[6]);
          }
        }
      }

      return m;
    }

    Snap._.transform2matrix = transform2matrix;
    Snap._unit2px = unit2px;
    var contains = glob.doc.contains || glob.doc.compareDocumentPosition ? function (a, b) {
      var adown = a.nodeType == 9 ? a.documentElement : a,
          bup = b && b.parentNode;
      return a == bup || !!(bup && bup.nodeType == 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
    } : function (a, b) {
      if (b) {
        while (b) {
          b = b.parentNode;

          if (b == a) {
            return true;
          }
        }
      }

      return false;
    };

    function getSomeDefs(el) {
      var p = el.node.ownerSVGElement && wrap(el.node.ownerSVGElement) || el.node.parentNode && wrap(el.node.parentNode) || Snap.select("svg") || Snap(0, 0),
          pdefs = p.select("defs"),
          defs = pdefs == null ? false : pdefs.node;

      if (!defs) {
        defs = make("defs", p.node).node;
      }

      return defs;
    }

    function getSomeSVG(el) {
      return el.node.ownerSVGElement && wrap(el.node.ownerSVGElement) || Snap.select("svg");
    }

    Snap._.getSomeDefs = getSomeDefs;
    Snap._.getSomeSVG = getSomeSVG;

    function unit2px(el, name, value) {
      var svg = getSomeSVG(el).node,
          out = {},
          mgr = svg.querySelector(".svg---mgr");

      if (!mgr) {
        mgr = $("rect");
        $(mgr, {
          x: -9e9,
          y: -9e9,
          width: 10,
          height: 10,
          "class": "svg---mgr",
          fill: "none"
        });
        svg.appendChild(mgr);
      }

      function getW(val) {
        if (val == null) {
          return E;
        }

        if (val == +val) {
          return val;
        }

        $(mgr, {
          width: val
        });

        try {
          return mgr.getBBox().width;
        } catch (e) {
          return 0;
        }
      }

      function getH(val) {
        if (val == null) {
          return E;
        }

        if (val == +val) {
          return val;
        }

        $(mgr, {
          height: val
        });

        try {
          return mgr.getBBox().height;
        } catch (e) {
          return 0;
        }
      }

      function set(nam, f) {
        if (name == null) {
          out[nam] = f(el.attr(nam) || 0);
        } else if (nam == name) {
          out = f(value == null ? el.attr(nam) || 0 : value);
        }
      }

      switch (el.type) {
        case "rect":
          set("rx", getW);
          set("ry", getH);

        case "image":
          set("width", getW);
          set("height", getH);

        case "text":
          set("x", getW);
          set("y", getH);
          break;

        case "circle":
          set("cx", getW);
          set("cy", getH);
          set("r", getW);
          break;

        case "ellipse":
          set("cx", getW);
          set("cy", getH);
          set("rx", getW);
          set("ry", getH);
          break;

        case "line":
          set("x1", getW);
          set("x2", getW);
          set("y1", getH);
          set("y2", getH);
          break;

        case "marker":
          set("refX", getW);
          set("markerWidth", getW);
          set("refY", getH);
          set("markerHeight", getH);
          break;

        case "radialGradient":
          set("fx", getW);
          set("fy", getH);
          break;

        case "tspan":
          set("dx", getW);
          set("dy", getH);
          break;

        default:
          set(name, getW);
      }

      svg.removeChild(mgr);
      return out;
    }
    /*\
     * Snap.select
     [ method ]
     **
     * Wraps a DOM element specified by CSS selector as @Element
     - query (string) CSS selector of the element
     = (Element) the current element
    \*/


    Snap.select = function (query) {
      query = Str(query).replace(/([^\\]):/g, "$1\\:");
      return wrap(glob.doc.querySelector(query));
    };
    /*\
     * Snap.selectAll
     [ method ]
     **
     * Wraps DOM elements specified by CSS selector as set or array of @Element
     - query (string) CSS selector of the element
     = (Element) the current element
    \*/


    Snap.selectAll = function (query) {
      var nodelist = glob.doc.querySelectorAll(query),
          set = (Snap.set || Array)();

      for (var i = 0; i < nodelist.length; i++) {
        set.push(wrap(nodelist[i]));
      }

      return set;
    };

    function add2group(list) {
      if (!is(list, "array")) {
        list = Array.prototype.slice.call(arguments, 0);
      }

      var i = 0,
          j = 0,
          node = this.node;

      while (this[i]) delete this[i++];

      for (i = 0; i < list.length; i++) {
        if (list[i].type == "set") {
          list[i].forEach(function (el) {
            node.appendChild(el.node);
          });
        } else {
          node.appendChild(list[i].node);
        }
      }

      var children = node.childNodes;

      for (i = 0; i < children.length; i++) {
        this[j++] = wrap(children[i]);
      }

      return this;
    } // Hub garbage collector every 10s


    setInterval(function () {
      for (var key in hub) if (hub[has](key)) {
        var el = hub[key],
            node = el.node;

        if (el.type != "svg" && !node.ownerSVGElement || el.type == "svg" && (!node.parentNode || "ownerSVGElement" in node.parentNode && !node.ownerSVGElement)) {
          delete hub[key];
        }
      }
    }, 1e4);

    function Element(el) {
      if (el.snap in hub) {
        return hub[el.snap];
      }

      var svg;

      try {
        svg = el.ownerSVGElement;
      } catch (e) {}
      /*\
       * Element.node
       [ property (object) ]
       **
       * Gives you a reference to the DOM object, so you can assign event handlers or just mess around.
       > Usage
       | // draw a circle at coordinate 10,10 with radius of 10
       | var c = paper.circle(10, 10, 10);
       | c.node.onclick = function () {
       |     c.attr("fill", "red");
       | };
      \*/


      this.node = el;

      if (svg) {
        this.paper = new Paper(svg);
      }
      /*\
       * Element.type
       [ property (string) ]
       **
       * SVG tag name of the given element.
      \*/


      this.type = el.tagName || el.nodeName;
      var id = this.id = ID(this);
      this.anims = {};
      this._ = {
        transform: []
      };
      el.snap = id;
      hub[id] = this;

      if (this.type == "g") {
        this.add = add2group;
      }

      if (this.type in {
        g: 1,
        mask: 1,
        pattern: 1,
        symbol: 1
      }) {
        for (var method in Paper.prototype) if (Paper.prototype[has](method)) {
          this[method] = Paper.prototype[method];
        }
      }
    }
    /*\
      * Element.attr
      [ method ]
      **
      * Gets or sets given attributes of the element.
      **
      - params (object) contains key-value pairs of attributes you want to set
      * or
      - param (string) name of the attribute
      = (Element) the current element
      * or
      = (string) value of attribute
      > Usage
      | el.attr({
      |     fill: "#fc0",
      |     stroke: "#000",
      |     strokeWidth: 2, // CamelCase...
      |     "fill-opacity": 0.5, // or dash-separated names
      |     width: "*=2" // prefixed values
      | });
      | console.log(el.attr("fill")); // #fc0
      * Prefixed values in format `"+=10"` supported. All four operations
      * (`+`, `-`, `*` and `/`) could be used. Optionally you can use units for `+`
      * and `-`: `"+=2em"`.
     \*/


    Element.prototype.attr = function (params, value) {
      var el = this,
          node = el.node;

      if (!params) {
        if (node.nodeType != 1) {
          return {
            text: node.nodeValue
          };
        }

        var attr = node.attributes,
            out = {};

        for (var i = 0, ii = attr.length; i < ii; i++) {
          out[attr[i].nodeName] = attr[i].nodeValue;
        }

        return out;
      }

      if (is(params, "string")) {
        if (arguments.length > 1) {
          var json = {};
          json[params] = value;
          params = json;
        } else {
          return eve("snap.util.getattr." + params, el).firstDefined();
        }
      }

      for (var att in params) {
        if (params[has](att)) {
          eve("snap.util.attr." + att, el, params[att]);
        }
      }

      return el;
    };
    /*\
     * Snap.parse
     [ method ]
     **
     * Parses SVG fragment and converts it into a @Fragment
     **
     - svg (string) SVG string
     = (Fragment) the @Fragment
    \*/


    Snap.parse = function (svg) {
      var f = glob.doc.createDocumentFragment(),
          full = true,
          div = glob.doc.createElement("div");
      svg = Str(svg);

      if (!svg.match(/^\s*<\s*svg(?:\s|>)/)) {
        svg = "<svg>" + svg + "</svg>";
        full = false;
      }

      div.innerHTML = svg;
      svg = div.getElementsByTagName("svg")[0];

      if (svg) {
        if (full) {
          f = svg;
        } else {
          while (svg.firstChild) {
            f.appendChild(svg.firstChild);
          }
        }
      }

      return new Fragment(f);
    };

    function Fragment(frag) {
      this.node = frag;
    }
    /*\
     * Snap.fragment
     [ method ]
     **
     * Creates a DOM fragment from a given list of elements or strings
     **
     - varargs (…) SVG string
     = (Fragment) the @Fragment
    \*/


    Snap.fragment = function () {
      var args = Array.prototype.slice.call(arguments, 0),
          f = glob.doc.createDocumentFragment();

      for (var i = 0, ii = args.length; i < ii; i++) {
        var item = args[i];

        if (item.node && item.node.nodeType) {
          f.appendChild(item.node);
        }

        if (item.nodeType) {
          f.appendChild(item);
        }

        if (typeof item == "string") {
          f.appendChild(Snap.parse(item).node);
        }
      }

      return new Fragment(f);
    };

    function make(name, parent) {
      var res = $(name);
      parent.appendChild(res);
      var el = wrap(res);
      return el;
    }

    function Paper(w, h) {
      var res,
          desc,
          defs,
          proto = Paper.prototype;

      if (w && w.tagName && w.tagName.toLowerCase() == "svg") {
        if (w.snap in hub) {
          return hub[w.snap];
        }

        var doc = w.ownerDocument;
        res = new Element(w);
        desc = w.getElementsByTagName("desc")[0];
        defs = w.getElementsByTagName("defs")[0];

        if (!desc) {
          desc = $("desc");
          desc.appendChild(doc.createTextNode("Created with Snap"));
          res.node.appendChild(desc);
        }

        if (!defs) {
          defs = $("defs");
          res.node.appendChild(defs);
        }

        res.defs = defs;

        for (var key in proto) if (proto[has](key)) {
          res[key] = proto[key];
        }

        res.paper = res.root = res;
      } else {
        res = make("svg", glob.doc.body);
        $(res.node, {
          height: h,
          version: 1.1,
          width: w,
          xmlns: xmlns
        });
      }

      return res;
    }

    function wrap(dom) {
      if (!dom) {
        return dom;
      }

      if (dom instanceof Element || dom instanceof Fragment) {
        return dom;
      }

      if (dom.tagName && dom.tagName.toLowerCase() == "svg") {
        return new Paper(dom);
      }

      if (dom.tagName && dom.tagName.toLowerCase() == "object" && dom.type == "image/svg+xml") {
        return new Paper(dom.contentDocument.getElementsByTagName("svg")[0]);
      }

      return new Element(dom);
    }

    Snap._.make = make;
    Snap._.wrap = wrap;
    /*\
     * Paper.el
     [ method ]
     **
     * Creates an element on paper with a given name and no attributes
     **
     - name (string) tag name
     - attr (object) attributes
     = (Element) the current element
     > Usage
     | var c = paper.circle(10, 10, 10); // is the same as...
     | var c = paper.el("circle").attr({
     |     cx: 10,
     |     cy: 10,
     |     r: 10
     | });
     | // and the same as
     | var c = paper.el("circle", {
     |     cx: 10,
     |     cy: 10,
     |     r: 10
     | });
    \*/

    Paper.prototype.el = function (name, attr) {
      var el = make(name, this.node);
      attr && el.attr(attr);
      return el;
    };
    /*\
     * Element.children
     [ method ]
     **
     * Returns array of all the children of the element.
     = (array) array of Elements
    \*/


    Element.prototype.children = function () {
      var out = [],
          ch = this.node.childNodes;

      for (var i = 0, ii = ch.length; i < ii; i++) {
        out[i] = Snap(ch[i]);
      }

      return out;
    };

    function jsonFiller(root, o) {
      for (var i = 0, ii = root.length; i < ii; i++) {
        var item = {
          type: root[i].type,
          attr: root[i].attr()
        },
            children = root[i].children();
        o.push(item);

        if (children.length) {
          jsonFiller(children, item.childNodes = []);
        }
      }
    }
    /*\
     * Element.toJSON
     [ method ]
     **
     * Returns object representation of the given element and all its children.
     = (object) in format
     o {
     o     type (string) this.type,
     o     attr (object) attributes map,
     o     childNodes (array) optional array of children in the same format
     o }
    \*/


    Element.prototype.toJSON = function () {
      var out = [];
      jsonFiller([this], out);
      return out[0];
    }; // default


    eve.on("snap.util.getattr", function () {
      var att = eve.nt();
      att = att.substring(att.lastIndexOf(".") + 1);
      var css = att.replace(/[A-Z]/g, function (letter) {
        return "-" + letter.toLowerCase();
      });

      if (cssAttr[has](css)) {
        return this.node.ownerDocument.defaultView.getComputedStyle(this.node, null).getPropertyValue(css);
      } else {
        return $(this.node, att);
      }
    });
    var cssAttr = {
      "alignment-baseline": 0,
      "baseline-shift": 0,
      "clip": 0,
      "clip-path": 0,
      "clip-rule": 0,
      "color": 0,
      "color-interpolation": 0,
      "color-interpolation-filters": 0,
      "color-profile": 0,
      "color-rendering": 0,
      "cursor": 0,
      "direction": 0,
      "display": 0,
      "dominant-baseline": 0,
      "enable-background": 0,
      "fill": 0,
      "fill-opacity": 0,
      "fill-rule": 0,
      "filter": 0,
      "flood-color": 0,
      "flood-opacity": 0,
      "font": 0,
      "font-family": 0,
      "font-size": 0,
      "font-size-adjust": 0,
      "font-stretch": 0,
      "font-style": 0,
      "font-variant": 0,
      "font-weight": 0,
      "glyph-orientation-horizontal": 0,
      "glyph-orientation-vertical": 0,
      "image-rendering": 0,
      "kerning": 0,
      "letter-spacing": 0,
      "lighting-color": 0,
      "marker": 0,
      "marker-end": 0,
      "marker-mid": 0,
      "marker-start": 0,
      "mask": 0,
      "opacity": 0,
      "overflow": 0,
      "pointer-events": 0,
      "shape-rendering": 0,
      "stop-color": 0,
      "stop-opacity": 0,
      "stroke": 0,
      "stroke-dasharray": 0,
      "stroke-dashoffset": 0,
      "stroke-linecap": 0,
      "stroke-linejoin": 0,
      "stroke-miterlimit": 0,
      "stroke-opacity": 0,
      "stroke-width": 0,
      "text-anchor": 0,
      "text-decoration": 0,
      "text-rendering": 0,
      "unicode-bidi": 0,
      "visibility": 0,
      "word-spacing": 0,
      "writing-mode": 0
    };
    eve.on("snap.util.attr", function (value) {
      var att = eve.nt(),
          attr = {};
      att = att.substring(att.lastIndexOf(".") + 1);
      attr[att] = value;
      var style = att.replace(/-(\w)/gi, function (all, letter) {
        return letter.toUpperCase();
      }),
          css = att.replace(/[A-Z]/g, function (letter) {
        return "-" + letter.toLowerCase();
      });

      if (cssAttr[has](css)) {
        this.node.style[style] = value == null ? E : value;
      } else {
        $(this.node, attr);
      }
    });

    (function (proto) {})(Paper.prototype); // simple ajax

    /*\
     * Snap.ajax
     [ method ]
     **
     * Simple implementation of Ajax
     **
     - url (string) URL
     - postData (object|string) data for post request
     - callback (function) callback
     - scope (object) #optional scope of callback
     * or
     - url (string) URL
     - callback (function) callback
     - scope (object) #optional scope of callback
     = (XMLHttpRequest) the XMLHttpRequest object, just in case
    \*/


    Snap.ajax = function (url, postData, callback, scope) {
      var req = new XMLHttpRequest(),
          id = ID();

      if (req) {
        if (is(postData, "function")) {
          scope = callback;
          callback = postData;
          postData = null;
        } else if (is(postData, "object")) {
          var pd = [];

          for (var key in postData) if (postData.hasOwnProperty(key)) {
            pd.push(encodeURIComponent(key) + "=" + encodeURIComponent(postData[key]));
          }

          postData = pd.join("&");
        }

        req.open(postData ? "POST" : "GET", url, true);

        if (postData) {
          req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
          req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        }

        if (callback) {
          eve.once("snap.ajax." + id + ".0", callback);
          eve.once("snap.ajax." + id + ".200", callback);
          eve.once("snap.ajax." + id + ".304", callback);
        }

        req.onreadystatechange = function () {
          if (req.readyState != 4) return;
          eve("snap.ajax." + id + "." + req.status, scope, req);
        };

        if (req.readyState == 4) {
          return req;
        }

        req.send(postData);
        return req;
      }
    };
    /*\
     * Snap.load
     [ method ]
     **
     * Loads external SVG file as a @Fragment (see @Snap.ajax for more advanced AJAX)
     **
     - url (string) URL
     - callback (function) callback
     - scope (object) #optional scope of callback
    \*/


    Snap.load = function (url, callback, scope) {
      Snap.ajax(url, function (req) {
        var f = Snap.parse(req.responseText);
        scope ? callback.call(scope, f) : callback(f);
      });
    };

    var getOffset = function (elem) {
      var box = elem.getBoundingClientRect(),
          doc = elem.ownerDocument,
          body = doc.body,
          docElem = doc.documentElement,
          clientTop = docElem.clientTop || body.clientTop || 0,
          clientLeft = docElem.clientLeft || body.clientLeft || 0,
          top = box.top + (g.win.pageYOffset || docElem.scrollTop || body.scrollTop) - clientTop,
          left = box.left + (g.win.pageXOffset || docElem.scrollLeft || body.scrollLeft) - clientLeft;
      return {
        y: top,
        x: left
      };
    };
    /*\
     * Snap.getElementByPoint
     [ method ]
     **
     * Returns you topmost element under given point.
     **
     = (object) Snap element object
     - x (number) x coordinate from the top left corner of the window
     - y (number) y coordinate from the top left corner of the window
     > Usage
     | Snap.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
    \*/


    Snap.getElementByPoint = function (x, y) {
      var paper = this,
          svg = paper.canvas,
          target = glob.doc.elementFromPoint(x, y);

      if (glob.win.opera && target.tagName == "svg") {
        var so = getOffset(target),
            sr = target.createSVGRect();
        sr.x = x - so.x;
        sr.y = y - so.y;
        sr.width = sr.height = 1;
        var hits = target.getIntersectionList(sr, null);

        if (hits.length) {
          target = hits[hits.length - 1];
        }
      }

      if (!target) {
        return null;
      }

      return wrap(target);
    };
    /*\
     * Snap.plugin
     [ method ]
     **
     * Let you write plugins. You pass in a function with five arguments, like this:
     | Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
     |     Snap.newmethod = function () {};
     |     Element.prototype.newmethod = function () {};
     |     Paper.prototype.newmethod = function () {};
     | });
     * Inside the function you have access to all main objects (and their
     * prototypes). This allow you to extend anything you want.
     **
     - f (function) your plugin body
    \*/


    Snap.plugin = function (f) {
      f(Snap, Element, Paper, glob, Fragment);
    };

    glob.win.Snap = Snap;
    return Snap;
  }(window || this); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.


  Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
    var elproto = Element.prototype,
        is = Snap.is,
        Str = String,
        unit2px = Snap._unit2px,
        $ = Snap._.$,
        make = Snap._.make,
        getSomeDefs = Snap._.getSomeDefs,
        has = "hasOwnProperty",
        wrap = Snap._.wrap;
    /*\
     * Element.getBBox
     [ method ]
     **
     * Returns the bounding box descriptor for the given element
     **
     = (object) bounding box descriptor:
     o {
     o     cx: (number) x of the center,
     o     cy: (number) x of the center,
     o     h: (number) height,
     o     height: (number) height,
     o     path: (string) path command for the box,
     o     r0: (number) radius of a circle that fully encloses the box,
     o     r1: (number) radius of the smallest circle that can be enclosed,
     o     r2: (number) radius of the largest circle that can be enclosed,
     o     vb: (string) box as a viewbox command,
     o     w: (number) width,
     o     width: (number) width,
     o     x2: (number) x of the right side,
     o     x: (number) x of the left side,
     o     y2: (number) y of the bottom edge,
     o     y: (number) y of the top edge
     o }
    \*/

    elproto.getBBox = function (isWithoutTransform) {
      if (this.type == "tspan") {
        return Snap._.box(this.node.getClientRects().item(0));
      }

      if (!Snap.Matrix || !Snap.path) {
        return this.node.getBBox();
      }

      var el = this,
          m = new Snap.Matrix();

      if (el.removed) {
        return Snap._.box();
      }

      while (el.type == "use") {
        if (!isWithoutTransform) {
          m = m.add(el.transform().localMatrix.translate(el.attr("x") || 0, el.attr("y") || 0));
        }

        if (el.original) {
          el = el.original;
        } else {
          var href = el.attr("xlink:href");
          el = el.original = el.node.ownerDocument.getElementById(href.substring(href.indexOf("#") + 1));
        }
      }

      var _ = el._,
          pathfinder = Snap.path.get[el.type] || Snap.path.get.deflt;

      try {
        if (isWithoutTransform) {
          _.bboxwt = pathfinder ? Snap.path.getBBox(el.realPath = pathfinder(el)) : Snap._.box(el.node.getBBox());
          return Snap._.box(_.bboxwt);
        } else {
          el.realPath = pathfinder(el);
          el.matrix = el.transform().localMatrix;
          _.bbox = Snap.path.getBBox(Snap.path.map(el.realPath, m.add(el.matrix)));
          return Snap._.box(_.bbox);
        }
      } catch (e) {
        // Firefox doesn’t give you bbox of hidden element
        return Snap._.box();
      }
    };

    var propString = function () {
      return this.string;
    };

    function extractTransform(el, tstr) {
      if (tstr == null) {
        var doReturn = true;

        if (el.type == "linearGradient" || el.type == "radialGradient") {
          tstr = el.node.getAttribute("gradientTransform");
        } else if (el.type == "pattern") {
          tstr = el.node.getAttribute("patternTransform");
        } else {
          tstr = el.node.getAttribute("transform");
        }

        if (!tstr) {
          return new Snap.Matrix();
        }

        tstr = Snap._.svgTransform2string(tstr);
      } else {
        if (!Snap._.rgTransform.test(tstr)) {
          tstr = Snap._.svgTransform2string(tstr);
        } else {
          tstr = Str(tstr).replace(/\.{3}|\u2026/g, el._.transform || "");
        }

        if (is(tstr, "array")) {
          tstr = Snap.path ? Snap.path.toString.call(tstr) : Str(tstr);
        }

        el._.transform = tstr;
      }

      var m = Snap._.transform2matrix(tstr, el.getBBox(1));

      if (doReturn) {
        return m;
      } else {
        el.matrix = m;
      }
    }
    /*\
     * Element.transform
     [ method ]
     **
     * Gets or sets transformation of the element
     **
     - tstr (string) transform string in Snap or SVG format
     = (Element) the current element
     * or
     = (object) transformation descriptor:
     o {
     o     string (string) transform string,
     o     globalMatrix (Matrix) matrix of all transformations applied to element or its parents,
     o     localMatrix (Matrix) matrix of transformations applied only to the element,
     o     diffMatrix (Matrix) matrix of difference between global and local transformations,
     o     global (string) global transformation as string,
     o     local (string) local transformation as string,
     o     toString (function) returns `string` property
     o }
    \*/


    elproto.transform = function (tstr) {
      var _ = this._;

      if (tstr == null) {
        var papa = this,
            global = new Snap.Matrix(this.node.getCTM()),
            local = extractTransform(this),
            ms = [local],
            m = new Snap.Matrix(),
            i,
            localString = local.toTransformString(),
            string = Str(local) == Str(this.matrix) ? Str(_.transform) : localString;

        while (papa.type != "svg" && (papa = papa.parent())) {
          ms.push(extractTransform(papa));
        }

        i = ms.length;

        while (i--) {
          m.add(ms[i]);
        }

        return {
          string: string,
          globalMatrix: global,
          totalMatrix: m,
          localMatrix: local,
          diffMatrix: global.clone().add(local.invert()),
          global: global.toTransformString(),
          total: m.toTransformString(),
          local: localString,
          toString: propString
        };
      }

      if (tstr instanceof Snap.Matrix) {
        this.matrix = tstr;
        this._.transform = tstr.toTransformString();
      } else {
        extractTransform(this, tstr);
      }

      if (this.node) {
        if (this.type == "linearGradient" || this.type == "radialGradient") {
          $(this.node, {
            gradientTransform: this.matrix
          });
        } else if (this.type == "pattern") {
          $(this.node, {
            patternTransform: this.matrix
          });
        } else {
          $(this.node, {
            transform: this.matrix
          });
        }
      }

      return this;
    };
    /*\
     * Element.parent
     [ method ]
     **
     * Returns the element's parent
     **
     = (Element) the parent element
    \*/


    elproto.parent = function () {
      return wrap(this.node.parentNode);
    };
    /*\
     * Element.append
     [ method ]
     **
     * Appends the given element to current one
     **
     - el (Element|Set) element to append
     = (Element) the parent element
    \*/

    /*\
     * Element.add
     [ method ]
     **
     * See @Element.append
    \*/


    elproto.append = elproto.add = function (el) {
      if (el) {
        if (el.type == "set") {
          var it = this;
          el.forEach(function (el) {
            it.add(el);
          });
          return this;
        }

        el = wrap(el);
        this.node.appendChild(el.node);
        el.paper = this.paper;
      }

      return this;
    };
    /*\
     * Element.appendTo
     [ method ]
     **
     * Appends the current element to the given one
     **
     - el (Element) parent element to append to
     = (Element) the child element
    \*/


    elproto.appendTo = function (el) {
      if (el) {
        el = wrap(el);
        el.append(this);
      }

      return this;
    };
    /*\
     * Element.prepend
     [ method ]
     **
     * Prepends the given element to the current one
     **
     - el (Element) element to prepend
     = (Element) the parent element
    \*/


    elproto.prepend = function (el) {
      if (el) {
        if (el.type == "set") {
          var it = this,
              first;
          el.forEach(function (el) {
            if (first) {
              first.after(el);
            } else {
              it.prepend(el);
            }

            first = el;
          });
          return this;
        }

        el = wrap(el);
        var parent = el.parent();
        this.node.insertBefore(el.node, this.node.firstChild);
        this.add && this.add();
        el.paper = this.paper;
        this.parent() && this.parent().add();
        parent && parent.add();
      }

      return this;
    };
    /*\
     * Element.prependTo
     [ method ]
     **
     * Prepends the current element to the given one
     **
     - el (Element) parent element to prepend to
     = (Element) the child element
    \*/


    elproto.prependTo = function (el) {
      el = wrap(el);
      el.prepend(this);
      return this;
    };
    /*\
     * Element.before
     [ method ]
     **
     * Inserts given element before the current one
     **
     - el (Element) element to insert
     = (Element) the parent element
    \*/


    elproto.before = function (el) {
      if (el.type == "set") {
        var it = this;
        el.forEach(function (el) {
          var parent = el.parent();
          it.node.parentNode.insertBefore(el.node, it.node);
          parent && parent.add();
        });
        this.parent().add();
        return this;
      }

      el = wrap(el);
      var parent = el.parent();
      this.node.parentNode.insertBefore(el.node, this.node);
      this.parent() && this.parent().add();
      parent && parent.add();
      el.paper = this.paper;
      return this;
    };
    /*\
     * Element.after
     [ method ]
     **
     * Inserts given element after the current one
     **
     - el (Element) element to insert
     = (Element) the parent element
    \*/


    elproto.after = function (el) {
      el = wrap(el);
      var parent = el.parent();

      if (this.node.nextSibling) {
        this.node.parentNode.insertBefore(el.node, this.node.nextSibling);
      } else {
        this.node.parentNode.appendChild(el.node);
      }

      this.parent() && this.parent().add();
      parent && parent.add();
      el.paper = this.paper;
      return this;
    };
    /*\
     * Element.insertBefore
     [ method ]
     **
     * Inserts the element after the given one
     **
     - el (Element) element next to whom insert to
     = (Element) the parent element
    \*/


    elproto.insertBefore = function (el) {
      el = wrap(el);
      var parent = this.parent();
      el.node.parentNode.insertBefore(this.node, el.node);
      this.paper = el.paper;
      parent && parent.add();
      el.parent() && el.parent().add();
      return this;
    };
    /*\
     * Element.insertAfter
     [ method ]
     **
     * Inserts the element after the given one
     **
     - el (Element) element next to whom insert to
     = (Element) the parent element
    \*/


    elproto.insertAfter = function (el) {
      el = wrap(el);
      var parent = this.parent();
      el.node.parentNode.insertBefore(this.node, el.node.nextSibling);
      this.paper = el.paper;
      parent && parent.add();
      el.parent() && el.parent().add();
      return this;
    };
    /*\
     * Element.remove
     [ method ]
     **
     * Removes element from the DOM
     = (Element) the detached element
    \*/


    elproto.remove = function () {
      var parent = this.parent();
      this.node.parentNode && this.node.parentNode.removeChild(this.node);
      delete this.paper;
      this.removed = true;
      parent && parent.add();
      return this;
    };
    /*\
     * Element.select
     [ method ]
     **
     * Gathers the nested @Element matching the given set of CSS selectors
     **
     - query (string) CSS selector
     = (Element) result of query selection
    \*/


    elproto.select = function (query) {
      return wrap(this.node.querySelector(query));
    };
    /*\
     * Element.selectAll
     [ method ]
     **
     * Gathers nested @Element objects matching the given set of CSS selectors
     **
     - query (string) CSS selector
     = (Set|array) result of query selection
    \*/


    elproto.selectAll = function (query) {
      var nodelist = this.node.querySelectorAll(query),
          set = (Snap.set || Array)();

      for (var i = 0; i < nodelist.length; i++) {
        set.push(wrap(nodelist[i]));
      }

      return set;
    };
    /*\
     * Element.asPX
     [ method ]
     **
     * Returns given attribute of the element as a `px` value (not %, em, etc.)
     **
     - attr (string) attribute name
     - value (string) #optional attribute value
     = (Element) result of query selection
    \*/


    elproto.asPX = function (attr, value) {
      if (value == null) {
        value = this.attr(attr);
      }

      return +unit2px(this, attr, value);
    }; // SIERRA Element.use(): I suggest adding a note about how to access the original element the returned <use> instantiates. It's a part of SVG with which ordinary web developers may be least familiar.

    /*\
     * Element.use
     [ method ]
     **
     * Creates a `<use>` element linked to the current element
     **
     = (Element) the `<use>` element
    \*/


    elproto.use = function () {
      var use,
          id = this.node.id;

      if (!id) {
        id = this.id;
        $(this.node, {
          id: id
        });
      }

      if (this.type == "linearGradient" || this.type == "radialGradient" || this.type == "pattern") {
        use = make(this.type, this.node.parentNode);
      } else {
        use = make("use", this.node.parentNode);
      }

      $(use.node, {
        "xlink:href": "#" + id
      });
      use.original = this;
      return use;
    };

    function fixids(el) {
      var els = el.selectAll("*"),
          it,
          url = /^\s*url\(("|'|)(.*)\1\)\s*$/,
          ids = [],
          uses = {};

      function urltest(it, name) {
        var val = $(it.node, name);
        val = val && val.match(url);
        val = val && val[2];

        if (val && val.charAt() == "#") {
          val = val.substring(1);
        } else {
          return;
        }

        if (val) {
          uses[val] = (uses[val] || []).concat(function (id) {
            var attr = {};
            attr[name] = Snap.url(id);
            $(it.node, attr);
          });
        }
      }

      function linktest(it) {
        var val = $(it.node, "xlink:href");

        if (val && val.charAt() == "#") {
          val = val.substring(1);
        } else {
          return;
        }

        if (val) {
          uses[val] = (uses[val] || []).concat(function (id) {
            it.attr("xlink:href", "#" + id);
          });
        }
      }

      for (var i = 0, ii = els.length; i < ii; i++) {
        it = els[i];
        urltest(it, "fill");
        urltest(it, "stroke");
        urltest(it, "filter");
        urltest(it, "mask");
        urltest(it, "clip-path");
        linktest(it);
        var oldid = $(it.node, "id");

        if (oldid) {
          $(it.node, {
            id: it.id
          });
          ids.push({
            old: oldid,
            id: it.id
          });
        }
      }

      for (i = 0, ii = ids.length; i < ii; i++) {
        var fs = uses[ids[i].old];

        if (fs) {
          for (var j = 0, jj = fs.length; j < jj; j++) {
            fs[j](ids[i].id);
          }
        }
      }
    }
    /*\
     * Element.clone
     [ method ]
     **
     * Creates a clone of the element and inserts it after the element
     **
     = (Element) the clone
    \*/


    elproto.clone = function () {
      var clone = wrap(this.node.cloneNode(true));

      if ($(clone.node, "id")) {
        $(clone.node, {
          id: clone.id
        });
      }

      fixids(clone);
      clone.insertAfter(this);
      return clone;
    };
    /*\
     * Element.toDefs
     [ method ]
     **
     * Moves element to the shared `<defs>` area
     **
     = (Element) the element
    \*/


    elproto.toDefs = function () {
      var defs = getSomeDefs(this);
      defs.appendChild(this.node);
      return this;
    };
    /*\
     * Element.toPattern
     [ method ]
     **
     * Creates a `<pattern>` element from the current element
     **
     * To create a pattern you have to specify the pattern rect:
     - x (string|number)
     - y (string|number)
     - width (string|number)
     - height (string|number)
     = (Element) the `<pattern>` element
     * You can use pattern later on as an argument for `fill` attribute:
     | var p = paper.path("M10-5-10,15M15,0,0,15M0-5-20,15").attr({
     |         fill: "none",
     |         stroke: "#bada55",
     |         strokeWidth: 5
     |     }).pattern(0, 0, 10, 10),
     |     c = paper.circle(200, 200, 100);
     | c.attr({
     |     fill: p
     | });
    \*/


    elproto.pattern = elproto.toPattern = function (x, y, width, height) {
      var p = make("pattern", getSomeDefs(this));

      if (x == null) {
        x = this.getBBox();
      }

      if (is(x, "object") && "x" in x) {
        y = x.y;
        width = x.width;
        height = x.height;
        x = x.x;
      }

      $(p.node, {
        x: x,
        y: y,
        width: width,
        height: height,
        patternUnits: "userSpaceOnUse",
        id: p.id,
        viewBox: [x, y, width, height].join(" ")
      });
      p.node.appendChild(this.node);
      return p;
    }; // SIERRA Element.marker(): clarify what a reference point is. E.g., helps you offset the object from its edge such as when centering it over a path.
    // SIERRA Element.marker(): I suggest the method should accept default reference point values.  Perhaps centered with (refX = width/2) and (refY = height/2)? Also, couldn't it assume the element's current _width_ and _height_? And please specify what _x_ and _y_ mean: offsets? If so, from where?  Couldn't they also be assigned default values?

    /*\
     * Element.marker
     [ method ]
     **
     * Creates a `<marker>` element from the current element
     **
     * To create a marker you have to specify the bounding rect and reference point:
     - x (number)
     - y (number)
     - width (number)
     - height (number)
     - refX (number)
     - refY (number)
     = (Element) the `<marker>` element
     * You can specify the marker later as an argument for `marker-start`, `marker-end`, `marker-mid`, and `marker` attributes. The `marker` attribute places the marker at every point along the path, and `marker-mid` places them at every point except the start and end.
    \*/
    // TODO add usage for markers


    elproto.marker = function (x, y, width, height, refX, refY) {
      var p = make("marker", getSomeDefs(this));

      if (x == null) {
        x = this.getBBox();
      }

      if (is(x, "object") && "x" in x) {
        y = x.y;
        width = x.width;
        height = x.height;
        refX = x.refX || x.cx;
        refY = x.refY || x.cy;
        x = x.x;
      }

      $(p.node, {
        viewBox: [x, y, width, height].join(" "),
        markerWidth: width,
        markerHeight: height,
        orient: "auto",
        refX: refX || 0,
        refY: refY || 0,
        id: p.id
      });
      p.node.appendChild(this.node);
      return p;
    };

    var eldata = {};
    /*\
     * Element.data
     [ method ]
     **
     * Adds or retrieves given value associated with given key. (Don’t confuse
     * with `data-` attributes)
     *
     * See also @Element.removeData
     - key (string) key to store data
     - value (any) #optional value to store
     = (object) @Element
     * or, if value is not specified:
     = (any) value
     > Usage
     | for (var i = 0, i < 5, i++) {
     |     paper.circle(10 + 15 * i, 10, 10)
     |          .attr({fill: "#000"})
     |          .data("i", i)
     |          .click(function () {
     |             alert(this.data("i"));
     |          });
     | }
    \*/

    elproto.data = function (key, value) {
      var data = eldata[this.id] = eldata[this.id] || {};

      if (arguments.length == 0) {
        eve("snap.data.get." + this.id, this, data, null);
        return data;
      }

      if (arguments.length == 1) {
        if (Snap.is(key, "object")) {
          for (var i in key) if (key[has](i)) {
            this.data(i, key[i]);
          }

          return this;
        }

        eve("snap.data.get." + this.id, this, data[key], key);
        return data[key];
      }

      data[key] = value;
      eve("snap.data.set." + this.id, this, value, key);
      return this;
    };
    /*\
     * Element.removeData
     [ method ]
     **
     * Removes value associated with an element by given key.
     * If key is not provided, removes all the data of the element.
     - key (string) #optional key
     = (object) @Element
    \*/


    elproto.removeData = function (key) {
      if (key == null) {
        eldata[this.id] = {};
      } else {
        eldata[this.id] && delete eldata[this.id][key];
      }

      return this;
    };
    /*\
     * Element.outerSVG
     [ method ]
     **
     * Returns SVG code for the element, equivalent to HTML's `outerHTML`.
     *
     * See also @Element.innerSVG
     = (string) SVG code for the element
    \*/

    /*\
     * Element.toString
     [ method ]
     **
     * See @Element.outerSVG
    \*/


    elproto.outerSVG = elproto.toString = toString(1);
    /*\
     * Element.innerSVG
     [ method ]
     **
     * Returns SVG code for the element's contents, equivalent to HTML's `innerHTML`
     = (string) SVG code for the element
    \*/

    elproto.innerSVG = toString();

    function toString(type) {
      return function () {
        var res = type ? "<" + this.type : "",
            attr = this.node.attributes,
            chld = this.node.childNodes;

        if (type) {
          for (var i = 0, ii = attr.length; i < ii; i++) {
            res += " " + attr[i].name + '="' + attr[i].value.replace(/"/g, '\\"') + '"';
          }
        }

        if (chld.length) {
          type && (res += ">");

          for (i = 0, ii = chld.length; i < ii; i++) {
            if (chld[i].nodeType == 3) {
              res += chld[i].nodeValue;
            } else if (chld[i].nodeType == 1) {
              res += wrap(chld[i]).toString();
            }
          }

          type && (res += "</" + this.type + ">");
        } else {
          type && (res += "/>");
        }

        return res;
      };
    }

    elproto.toDataURL = function () {
      if (window && window.btoa) {
        var bb = this.getBBox(),
            svg = Snap.format('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="{width}" height="{height}" viewBox="{x} {y} {width} {height}">{contents}</svg>', {
          x: +bb.x.toFixed(3),
          y: +bb.y.toFixed(3),
          width: +bb.width.toFixed(3),
          height: +bb.height.toFixed(3),
          contents: this.outerSVG()
        });
        return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
      }
    };
    /*\
     * Fragment.select
     [ method ]
     **
     * See @Element.select
    \*/


    Fragment.prototype.select = elproto.select;
    /*\
     * Fragment.selectAll
     [ method ]
     **
     * See @Element.selectAll
    \*/

    Fragment.prototype.selectAll = elproto.selectAll;
  }); // Copyright (c) 2016 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
    var elproto = Element.prototype,
        is = Snap.is,
        Str = String,
        has = "hasOwnProperty";

    function slice(from, to, f) {
      return function (arr) {
        var res = arr.slice(from, to);

        if (res.length == 1) {
          res = res[0];
        }

        return f ? f(res) : res;
      };
    }

    var Animation = function (attr, ms, easing, callback) {
      if (typeof easing == "function" && !easing.length) {
        callback = easing;
        easing = mina.linear;
      }

      this.attr = attr;
      this.dur = ms;
      easing && (this.easing = easing);
      callback && (this.callback = callback);
    };

    Snap._.Animation = Animation;
    /*\
     * Snap.animation
     [ method ]
     **
     * Creates an animation object
     **
     - attr (object) attributes of final destination
     - duration (number) duration of the animation, in milliseconds
     - easing (function) #optional one of easing functions of @mina or custom one
     - callback (function) #optional callback function that fires when animation ends
     = (object) animation object
    \*/

    Snap.animation = function (attr, ms, easing, callback) {
      return new Animation(attr, ms, easing, callback);
    };
    /*\
     * Element.inAnim
     [ method ]
     **
     * Returns a set of animations that may be able to manipulate the current element
     **
     = (object) in format:
     o {
     o     anim (object) animation object,
     o     mina (object) @mina object,
     o     curStatus (number) 0..1 — status of the animation: 0 — just started, 1 — just finished,
     o     status (function) gets or sets the status of the animation,
     o     stop (function) stops the animation
     o }
    \*/


    elproto.inAnim = function () {
      var el = this,
          res = [];

      for (var id in el.anims) if (el.anims[has](id)) {
        (function (a) {
          res.push({
            anim: new Animation(a._attrs, a.dur, a.easing, a._callback),
            mina: a,
            curStatus: a.status(),
            status: function (val) {
              return a.status(val);
            },
            stop: function () {
              a.stop();
            }
          });
        })(el.anims[id]);
      }

      return res;
    };
    /*\
     * Snap.animate
     [ method ]
     **
     * Runs generic animation of one number into another with a caring function
     **
     - from (number|array) number or array of numbers
     - to (number|array) number or array of numbers
     - setter (function) caring function that accepts one number argument
     - duration (number) duration, in milliseconds
     - easing (function) #optional easing function from @mina or custom
     - callback (function) #optional callback function to execute when animation ends
     = (object) animation object in @mina format
     o {
     o     id (string) animation id, consider it read-only,
     o     duration (function) gets or sets the duration of the animation,
     o     easing (function) easing,
     o     speed (function) gets or sets the speed of the animation,
     o     status (function) gets or sets the status of the animation,
     o     stop (function) stops the animation
     o }
     | var rect = Snap().rect(0, 0, 10, 10);
     | Snap.animate(0, 10, function (val) {
     |     rect.attr({
     |         x: val
     |     });
     | }, 1000);
     | // in given context is equivalent to
     | rect.animate({x: 10}, 1000);
    \*/


    Snap.animate = function (from, to, setter, ms, easing, callback) {
      if (typeof easing == "function" && !easing.length) {
        callback = easing;
        easing = mina.linear;
      }

      var now = mina.time(),
          anim = mina(from, to, now, now + ms, mina.time, setter, easing);
      callback && eve.once("mina.finish." + anim.id, callback);
      return anim;
    };
    /*\
     * Element.stop
     [ method ]
     **
     * Stops all the animations for the current element
     **
     = (Element) the current element
    \*/


    elproto.stop = function () {
      var anims = this.inAnim();

      for (var i = 0, ii = anims.length; i < ii; i++) {
        anims[i].stop();
      }

      return this;
    };
    /*\
     * Element.animate
     [ method ]
     **
     * Animates the given attributes of the element
     **
     - attrs (object) key-value pairs of destination attributes
     - duration (number) duration of the animation in milliseconds
     - easing (function) #optional easing function from @mina or custom
     - callback (function) #optional callback function that executes when the animation ends
     = (Element) the current element
    \*/


    elproto.animate = function (attrs, ms, easing, callback) {
      if (typeof easing == "function" && !easing.length) {
        callback = easing;
        easing = mina.linear;
      }

      if (attrs instanceof Animation) {
        callback = attrs.callback;
        easing = attrs.easing;
        ms = attrs.dur;
        attrs = attrs.attr;
      }

      var fkeys = [],
          tkeys = [],
          keys = {},
          from,
          to,
          f,
          eq,
          el = this;

      for (var key in attrs) if (attrs[has](key)) {
        if (el.equal) {
          eq = el.equal(key, Str(attrs[key]));
          from = eq.from;
          to = eq.to;
          f = eq.f;
        } else {
          from = +el.attr(key);
          to = +attrs[key];
        }

        var len = is(from, "array") ? from.length : 1;
        keys[key] = slice(fkeys.length, fkeys.length + len, f);
        fkeys = fkeys.concat(from);
        tkeys = tkeys.concat(to);
      }

      var now = mina.time(),
          anim = mina(fkeys, tkeys, now, now + ms, mina.time, function (val) {
        var attr = {};

        for (var key in keys) if (keys[has](key)) {
          attr[key] = keys[key](val);
        }

        el.attr(attr);
      }, easing);
      el.anims[anim.id] = anim;
      anim._attrs = attrs;
      anim._callback = callback;
      eve("snap.animcreated." + el.id, anim);
      eve.once("mina.finish." + anim.id, function () {
        eve.off("mina.*." + anim.id);
        delete el.anims[anim.id];
        callback && callback.call(el);
      });
      eve.once("mina.stop." + anim.id, function () {
        eve.off("mina.*." + anim.id);
        delete el.anims[anim.id];
      });
      return el;
    };
  }); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
    var objectToString = Object.prototype.toString,
        Str = String,
        math = Math,
        E = "";

    function Matrix(a, b, c, d, e, f) {
      if (b == null && objectToString.call(a) == "[object SVGMatrix]") {
        this.a = a.a;
        this.b = a.b;
        this.c = a.c;
        this.d = a.d;
        this.e = a.e;
        this.f = a.f;
        return;
      }

      if (a != null) {
        this.a = +a;
        this.b = +b;
        this.c = +c;
        this.d = +d;
        this.e = +e;
        this.f = +f;
      } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
      }
    }

    (function (matrixproto) {
      /*\
       * Matrix.add
       [ method ]
       **
       * Adds the given matrix to existing one
       - a (number)
       - b (number)
       - c (number)
       - d (number)
       - e (number)
       - f (number)
       * or
       - matrix (object) @Matrix
      \*/
      matrixproto.add = function (a, b, c, d, e, f) {
        if (a && a instanceof Matrix) {
          return this.add(a.a, a.b, a.c, a.d, a.e, a.f);
        }

        var aNew = a * this.a + b * this.c,
            bNew = a * this.b + b * this.d;
        this.e += e * this.a + f * this.c;
        this.f += e * this.b + f * this.d;
        this.c = c * this.a + d * this.c;
        this.d = c * this.b + d * this.d;
        this.a = aNew;
        this.b = bNew;
        return this;
      };
      /*\
       * Matrix.multLeft
       [ method ]
       **
       * Multiplies a passed affine transform to the left: M * this.
       - a (number)
       - b (number)
       - c (number)
       - d (number)
       - e (number)
       - f (number)
       * or
       - matrix (object) @Matrix
      \*/


      Matrix.prototype.multLeft = function (a, b, c, d, e, f) {
        if (a && a instanceof Matrix) {
          return this.multLeft(a.a, a.b, a.c, a.d, a.e, a.f);
        }

        var aNew = a * this.a + c * this.b,
            cNew = a * this.c + c * this.d,
            eNew = a * this.e + c * this.f + e;
        this.b = b * this.a + d * this.b;
        this.d = b * this.c + d * this.d;
        this.f = b * this.e + d * this.f + f;
        this.a = aNew;
        this.c = cNew;
        this.e = eNew;
        return this;
      };
      /*\
       * Matrix.invert
       [ method ]
       **
       * Returns an inverted version of the matrix
       = (object) @Matrix
      \*/


      matrixproto.invert = function () {
        var me = this,
            x = me.a * me.d - me.b * me.c;
        return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
      };
      /*\
       * Matrix.clone
       [ method ]
       **
       * Returns a copy of the matrix
       = (object) @Matrix
      \*/


      matrixproto.clone = function () {
        return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
      };
      /*\
       * Matrix.translate
       [ method ]
       **
       * Translate the matrix
       - x (number) horizontal offset distance
       - y (number) vertical offset distance
      \*/


      matrixproto.translate = function (x, y) {
        this.e += x * this.a + y * this.c;
        this.f += x * this.b + y * this.d;
        return this;
      };
      /*\
       * Matrix.scale
       [ method ]
       **
       * Scales the matrix
       - x (number) amount to be scaled, with `1` resulting in no change
       - y (number) #optional amount to scale along the vertical axis. (Otherwise `x` applies to both axes.)
       - cx (number) #optional horizontal origin point from which to scale
       - cy (number) #optional vertical origin point from which to scale
       * Default cx, cy is the middle point of the element.
      \*/


      matrixproto.scale = function (x, y, cx, cy) {
        y == null && (y = x);
        (cx || cy) && this.translate(cx, cy);
        this.a *= x;
        this.b *= x;
        this.c *= y;
        this.d *= y;
        (cx || cy) && this.translate(-cx, -cy);
        return this;
      };
      /*\
       * Matrix.rotate
       [ method ]
       **
       * Rotates the matrix
       - a (number) angle of rotation, in degrees
       - x (number) horizontal origin point from which to rotate
       - y (number) vertical origin point from which to rotate
      \*/


      matrixproto.rotate = function (a, x, y) {
        a = Snap.rad(a);
        x = x || 0;
        y = y || 0;
        var cos = +math.cos(a).toFixed(9),
            sin = +math.sin(a).toFixed(9);
        this.add(cos, sin, -sin, cos, x, y);
        return this.add(1, 0, 0, 1, -x, -y);
      };
      /*\
       * Matrix.skewX
       [ method ]
       **
       * Skews the matrix along the x-axis
       - x (number) Angle to skew along the x-axis (in degrees).
      \*/


      matrixproto.skewX = function (x) {
        return this.skew(x, 0);
      };
      /*\
       * Matrix.skewY
       [ method ]
       **
       * Skews the matrix along the y-axis
       - y (number) Angle to skew along the y-axis (in degrees).
      \*/


      matrixproto.skewY = function (y) {
        return this.skew(0, y);
      };
      /*\
       * Matrix.skew
       [ method ]
       **
       * Skews the matrix
       - y (number) Angle to skew along the y-axis (in degrees).
       - x (number) Angle to skew along the x-axis (in degrees).
      \*/


      matrixproto.skew = function (x, y) {
        x = x || 0;
        y = y || 0;
        x = Snap.rad(x);
        y = Snap.rad(y);
        var c = math.tan(x).toFixed(9);
        var b = math.tan(y).toFixed(9);
        return this.add(1, b, c, 1, 0, 0);
      };
      /*\
       * Matrix.x
       [ method ]
       **
       * Returns x coordinate for given point after transformation described by the matrix. See also @Matrix.y
       - x (number)
       - y (number)
       = (number) x
      \*/


      matrixproto.x = function (x, y) {
        return x * this.a + y * this.c + this.e;
      };
      /*\
       * Matrix.y
       [ method ]
       **
       * Returns y coordinate for given point after transformation described by the matrix. See also @Matrix.x
       - x (number)
       - y (number)
       = (number) y
      \*/


      matrixproto.y = function (x, y) {
        return x * this.b + y * this.d + this.f;
      };

      matrixproto.get = function (i) {
        return +this[Str.fromCharCode(97 + i)].toFixed(4);
      };

      matrixproto.toString = function () {
        return "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")";
      };

      matrixproto.offset = function () {
        return [this.e.toFixed(4), this.f.toFixed(4)];
      };

      function norm(a) {
        return a[0] * a[0] + a[1] * a[1];
      }

      function normalize(a) {
        var mag = math.sqrt(norm(a));
        a[0] && (a[0] /= mag);
        a[1] && (a[1] /= mag);
      }
      /*\
       * Matrix.determinant
       [ method ]
       **
       * Finds determinant of the given matrix.
       = (number) determinant
      \*/


      matrixproto.determinant = function () {
        return this.a * this.d - this.b * this.c;
      };
      /*\
       * Matrix.split
       [ method ]
       **
       * Splits matrix into primitive transformations
       = (object) in format:
       o dx (number) translation by x
       o dy (number) translation by y
       o scalex (number) scale by x
       o scaley (number) scale by y
       o shear (number) shear
       o rotate (number) rotation in deg
       o isSimple (boolean) could it be represented via simple transformations
      \*/


      matrixproto.split = function () {
        var out = {}; // translation

        out.dx = this.e;
        out.dy = this.f; // scale and shear

        var row = [[this.a, this.b], [this.c, this.d]];
        out.scalex = math.sqrt(norm(row[0]));
        normalize(row[0]);
        out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
        row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];
        out.scaley = math.sqrt(norm(row[1]));
        normalize(row[1]);
        out.shear /= out.scaley;

        if (this.determinant() < 0) {
          out.scalex = -out.scalex;
        } // rotation


        var sin = row[0][1],
            cos = row[1][1];

        if (cos < 0) {
          out.rotate = Snap.deg(math.acos(cos));

          if (sin < 0) {
            out.rotate = 360 - out.rotate;
          }
        } else {
          out.rotate = Snap.deg(math.asin(sin));
        }

        out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
        out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
        out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
        return out;
      };
      /*\
       * Matrix.toTransformString
       [ method ]
       **
       * Returns transform string that represents given matrix
       = (string) transform string
      \*/


      matrixproto.toTransformString = function (shorter) {
        var s = shorter || this.split();

        if (!+s.shear.toFixed(9)) {
          s.scalex = +s.scalex.toFixed(4);
          s.scaley = +s.scaley.toFixed(4);
          s.rotate = +s.rotate.toFixed(4);
          return (s.dx || s.dy ? "t" + [+s.dx.toFixed(4), +s.dy.toFixed(4)] : E) + (s.rotate ? "r" + [+s.rotate.toFixed(4), 0, 0] : E) + (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E);
        } else {
          return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
        }
      };
    })(Matrix.prototype);
    /*\
     * Snap.Matrix
     [ method ]
     **
     * Matrix constructor, extend on your own risk.
     * To create matrices use @Snap.matrix.
    \*/


    Snap.Matrix = Matrix;
    /*\
     * Snap.matrix
     [ method ]
     **
     * Utility method
     **
     * Returns a matrix based on the given parameters
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     * or
     - svgMatrix (SVGMatrix)
     = (object) @Matrix
    \*/

    Snap.matrix = function (a, b, c, d, e, f) {
      return new Matrix(a, b, c, d, e, f);
    };
  }); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
    var has = "hasOwnProperty",
        make = Snap._.make,
        wrap = Snap._.wrap,
        is = Snap.is,
        getSomeDefs = Snap._.getSomeDefs,
        reURLValue = /^url\((['"]?)([^)]+)\1\)$/,
        $ = Snap._.$,
        URL = Snap.url,
        Str = String,
        separator = Snap._.separator,
        E = "";
    /*\
     * Snap.deurl
     [ method ]
     **
     * Unwraps path from `"url(<path>)"`.
     - value (string) url path
     = (string) unwrapped path
    \*/

    Snap.deurl = function (value) {
      var res = String(value).match(reURLValue);
      return res ? res[2] : value;
    }; // Attributes event handlers


    eve.on("snap.util.attr.mask", function (value) {
      if (value instanceof Element || value instanceof Fragment) {
        eve.stop();

        if (value instanceof Fragment && value.node.childNodes.length == 1) {
          value = value.node.firstChild;
          getSomeDefs(this).appendChild(value);
          value = wrap(value);
        }

        if (value.type == "mask") {
          var mask = value;
        } else {
          mask = make("mask", getSomeDefs(this));
          mask.node.appendChild(value.node);
        }

        !mask.node.id && $(mask.node, {
          id: mask.id
        });
        $(this.node, {
          mask: URL(mask.id)
        });
      }
    });

    (function (clipIt) {
      eve.on("snap.util.attr.clip", clipIt);
      eve.on("snap.util.attr.clip-path", clipIt);
      eve.on("snap.util.attr.clipPath", clipIt);
    })(function (value) {
      if (value instanceof Element || value instanceof Fragment) {
        eve.stop();
        var clip,
            node = value.node;

        while (node) {
          if (node.nodeName === "clipPath") {
            clip = new Element(node);
            break;
          }

          if (node.nodeName === "svg") {
            clip = undefined;
            break;
          }

          node = node.parentNode;
        }

        if (!clip) {
          clip = make("clipPath", getSomeDefs(this));
          clip.node.appendChild(value.node);
          !clip.node.id && $(clip.node, {
            id: clip.id
          });
        }

        $(this.node, {
          "clip-path": URL(clip.node.id || clip.id)
        });
      }
    });

    function fillStroke(name) {
      return function (value) {
        eve.stop();

        if (value instanceof Fragment && value.node.childNodes.length == 1 && (value.node.firstChild.tagName == "radialGradient" || value.node.firstChild.tagName == "linearGradient" || value.node.firstChild.tagName == "pattern")) {
          value = value.node.firstChild;
          getSomeDefs(this).appendChild(value);
          value = wrap(value);
        }

        if (value instanceof Element) {
          if (value.type == "radialGradient" || value.type == "linearGradient" || value.type == "pattern") {
            if (!value.node.id) {
              $(value.node, {
                id: value.id
              });
            }

            var fill = URL(value.node.id);
          } else {
            fill = value.attr(name);
          }
        } else {
          fill = Snap.color(value);

          if (fill.error) {
            var grad = Snap(getSomeDefs(this).ownerSVGElement).gradient(value);

            if (grad) {
              if (!grad.node.id) {
                $(grad.node, {
                  id: grad.id
                });
              }

              fill = URL(grad.node.id);
            } else {
              fill = value;
            }
          } else {
            fill = Str(fill);
          }
        }

        var attrs = {};
        attrs[name] = fill;
        $(this.node, attrs);
        this.node.style[name] = E;
      };
    }

    eve.on("snap.util.attr.fill", fillStroke("fill"));
    eve.on("snap.util.attr.stroke", fillStroke("stroke"));
    var gradrg = /^([lr])(?:\(([^)]*)\))?(.*)$/i;
    eve.on("snap.util.grad.parse", function parseGrad(string) {
      string = Str(string);
      var tokens = string.match(gradrg);

      if (!tokens) {
        return null;
      }

      var type = tokens[1],
          params = tokens[2],
          stops = tokens[3];
      params = params.split(/\s*,\s*/).map(function (el) {
        return +el == el ? +el : el;
      });

      if (params.length == 1 && params[0] == 0) {
        params = [];
      }

      stops = stops.split("-");
      stops = stops.map(function (el) {
        el = el.split(":");
        var out = {
          color: el[0]
        };

        if (el[1]) {
          out.offset = parseFloat(el[1]);
        }

        return out;
      });
      var len = stops.length,
          start = 0,
          j = 0;

      function seed(i, end) {
        var step = (end - start) / (i - j);

        for (var k = j; k < i; k++) {
          stops[k].offset = +(+start + step * (k - j)).toFixed(2);
        }

        j = i;
        start = end;
      }

      len--;

      for (var i = 0; i < len; i++) if ("offset" in stops[i]) {
        seed(i, stops[i].offset);
      }

      stops[len].offset = stops[len].offset || 100;
      seed(len, stops[len].offset);
      return {
        type: type,
        params: params,
        stops: stops
      };
    });
    eve.on("snap.util.attr.d", function (value) {
      eve.stop();

      if (is(value, "array") && is(value[0], "array")) {
        value = Snap.path.toString.call(value);
      }

      value = Str(value);

      if (value.match(/[ruo]/i)) {
        value = Snap.path.toAbsolute(value);
      }

      $(this.node, {
        d: value
      });
    })(-1);
    eve.on("snap.util.attr.#text", function (value) {
      eve.stop();
      value = Str(value);
      var txt = glob.doc.createTextNode(value);

      while (this.node.firstChild) {
        this.node.removeChild(this.node.firstChild);
      }

      this.node.appendChild(txt);
    })(-1);
    eve.on("snap.util.attr.path", function (value) {
      eve.stop();
      this.attr({
        d: value
      });
    })(-1);
    eve.on("snap.util.attr.class", function (value) {
      eve.stop();
      this.node.className.baseVal = value;
    })(-1);
    eve.on("snap.util.attr.viewBox", function (value) {
      var vb;

      if (is(value, "object") && "x" in value) {
        vb = [value.x, value.y, value.width, value.height].join(" ");
      } else if (is(value, "array")) {
        vb = value.join(" ");
      } else {
        vb = value;
      }

      $(this.node, {
        viewBox: vb
      });
      eve.stop();
    })(-1);
    eve.on("snap.util.attr.transform", function (value) {
      this.transform(value);
      eve.stop();
    })(-1);
    eve.on("snap.util.attr.r", function (value) {
      if (this.type == "rect") {
        eve.stop();
        $(this.node, {
          rx: value,
          ry: value
        });
      }
    })(-1);
    eve.on("snap.util.attr.textpath", function (value) {
      eve.stop();

      if (this.type == "text") {
        var id, tp, node;

        if (!value && this.textPath) {
          tp = this.textPath;

          while (tp.node.firstChild) {
            this.node.appendChild(tp.node.firstChild);
          }

          tp.remove();
          delete this.textPath;
          return;
        }

        if (is(value, "string")) {
          var defs = getSomeDefs(this),
              path = wrap(defs.parentNode).path(value);
          defs.appendChild(path.node);
          id = path.id;
          path.attr({
            id: id
          });
        } else {
          value = wrap(value);

          if (value instanceof Element) {
            id = value.attr("id");

            if (!id) {
              id = value.id;
              value.attr({
                id: id
              });
            }
          }
        }

        if (id) {
          tp = this.textPath;
          node = this.node;

          if (tp) {
            tp.attr({
              "xlink:href": "#" + id
            });
          } else {
            tp = $("textPath", {
              "xlink:href": "#" + id
            });

            while (node.firstChild) {
              tp.appendChild(node.firstChild);
            }

            node.appendChild(tp);
            this.textPath = wrap(tp);
          }
        }
      }
    })(-1);
    eve.on("snap.util.attr.text", function (value) {
      if (this.type == "text") {
        var i = 0,
            node = this.node,
            tuner = function (chunk) {
          var out = $("tspan");

          if (is(chunk, "array")) {
            for (var i = 0; i < chunk.length; i++) {
              out.appendChild(tuner(chunk[i]));
            }
          } else {
            out.appendChild(glob.doc.createTextNode(chunk));
          }

          out.normalize && out.normalize();
          return out;
        };

        while (node.firstChild) {
          node.removeChild(node.firstChild);
        }

        var tuned = tuner(value);

        while (tuned.firstChild) {
          node.appendChild(tuned.firstChild);
        }
      }

      eve.stop();
    })(-1);

    function setFontSize(value) {
      eve.stop();

      if (value == +value) {
        value += "px";
      }

      this.node.style.fontSize = value;
    }

    eve.on("snap.util.attr.fontSize", setFontSize)(-1);
    eve.on("snap.util.attr.font-size", setFontSize)(-1);
    eve.on("snap.util.getattr.transform", function () {
      eve.stop();
      return this.transform();
    })(-1);
    eve.on("snap.util.getattr.textpath", function () {
      eve.stop();
      return this.textPath;
    })(-1); // Markers

    (function () {
      function getter(end) {
        return function () {
          eve.stop();
          var style = glob.doc.defaultView.getComputedStyle(this.node, null).getPropertyValue("marker-" + end);

          if (style == "none") {
            return style;
          } else {
            return Snap(glob.doc.getElementById(style.match(reURLValue)[1]));
          }
        };
      }

      function setter(end) {
        return function (value) {
          eve.stop();
          var name = "marker" + end.charAt(0).toUpperCase() + end.substring(1);

          if (value == "" || !value) {
            this.node.style[name] = "none";
            return;
          }

          if (value.type == "marker") {
            var id = value.node.id;

            if (!id) {
              $(value.node, {
                id: value.id
              });
            }

            this.node.style[name] = URL(id);
            return;
          }
        };
      }

      eve.on("snap.util.getattr.marker-end", getter("end"))(-1);
      eve.on("snap.util.getattr.markerEnd", getter("end"))(-1);
      eve.on("snap.util.getattr.marker-start", getter("start"))(-1);
      eve.on("snap.util.getattr.markerStart", getter("start"))(-1);
      eve.on("snap.util.getattr.marker-mid", getter("mid"))(-1);
      eve.on("snap.util.getattr.markerMid", getter("mid"))(-1);
      eve.on("snap.util.attr.marker-end", setter("end"))(-1);
      eve.on("snap.util.attr.markerEnd", setter("end"))(-1);
      eve.on("snap.util.attr.marker-start", setter("start"))(-1);
      eve.on("snap.util.attr.markerStart", setter("start"))(-1);
      eve.on("snap.util.attr.marker-mid", setter("mid"))(-1);
      eve.on("snap.util.attr.markerMid", setter("mid"))(-1);
    })();

    eve.on("snap.util.getattr.r", function () {
      if (this.type == "rect" && $(this.node, "rx") == $(this.node, "ry")) {
        eve.stop();
        return $(this.node, "rx");
      }
    })(-1);

    function textExtract(node) {
      var out = [];
      var children = node.childNodes;

      for (var i = 0, ii = children.length; i < ii; i++) {
        var chi = children[i];

        if (chi.nodeType == 3) {
          out.push(chi.nodeValue);
        }

        if (chi.tagName == "tspan") {
          if (chi.childNodes.length == 1 && chi.firstChild.nodeType == 3) {
            out.push(chi.firstChild.nodeValue);
          } else {
            out.push(textExtract(chi));
          }
        }
      }

      return out;
    }

    eve.on("snap.util.getattr.text", function () {
      if (this.type == "text" || this.type == "tspan") {
        eve.stop();
        var out = textExtract(this.node);
        return out.length == 1 ? out[0] : out;
      }
    })(-1);
    eve.on("snap.util.getattr.#text", function () {
      return this.node.textContent;
    })(-1);
    eve.on("snap.util.getattr.fill", function (internal) {
      if (internal) {
        return;
      }

      eve.stop();
      var value = eve("snap.util.getattr.fill", this, true).firstDefined();
      return Snap(Snap.deurl(value)) || value;
    })(-1);
    eve.on("snap.util.getattr.stroke", function (internal) {
      if (internal) {
        return;
      }

      eve.stop();
      var value = eve("snap.util.getattr.stroke", this, true).firstDefined();
      return Snap(Snap.deurl(value)) || value;
    })(-1);
    eve.on("snap.util.getattr.viewBox", function () {
      eve.stop();
      var vb = $(this.node, "viewBox");

      if (vb) {
        vb = vb.split(separator);
        return Snap._.box(+vb[0], +vb[1], +vb[2], +vb[3]);
      } else {
        return;
      }
    })(-1);
    eve.on("snap.util.getattr.points", function () {
      var p = $(this.node, "points");
      eve.stop();

      if (p) {
        return p.split(separator);
      } else {
        return;
      }
    })(-1);
    eve.on("snap.util.getattr.path", function () {
      var p = $(this.node, "d");
      eve.stop();
      return p;
    })(-1);
    eve.on("snap.util.getattr.class", function () {
      return this.node.className.baseVal;
    })(-1);

    function getFontSize() {
      eve.stop();
      return this.node.style.fontSize;
    }

    eve.on("snap.util.getattr.fontSize", getFontSize)(-1);
    eve.on("snap.util.getattr.font-size", getFontSize)(-1);
  }); // Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
    var rgNotSpace = /\S+/g,
        rgBadSpace = /[\t\r\n\f]/g,
        rgTrim = /(^\s+|\s+$)/g,
        Str = String,
        elproto = Element.prototype;
    /*\
     * Element.addClass
     [ method ]
     **
     * Adds given class name or list of class names to the element.
     - value (string) class name or space separated list of class names
     **
     = (Element) original element.
    \*/

    elproto.addClass = function (value) {
      var classes = Str(value || "").match(rgNotSpace) || [],
          elem = this.node,
          className = elem.className.baseVal,
          curClasses = className.match(rgNotSpace) || [],
          j,
          pos,
          clazz,
          finalValue;

      if (classes.length) {
        j = 0;

        while (clazz = classes[j++]) {
          pos = curClasses.indexOf(clazz);

          if (!~pos) {
            curClasses.push(clazz);
          }
        }

        finalValue = curClasses.join(" ");

        if (className != finalValue) {
          elem.className.baseVal = finalValue;
        }
      }

      return this;
    };
    /*\
     * Element.removeClass
     [ method ]
     **
     * Removes given class name or list of class names from the element.
     - value (string) class name or space separated list of class names
     **
     = (Element) original element.
    \*/


    elproto.removeClass = function (value) {
      var classes = Str(value || "").match(rgNotSpace) || [],
          elem = this.node,
          className = elem.className.baseVal,
          curClasses = className.match(rgNotSpace) || [],
          j,
          pos,
          clazz,
          finalValue;

      if (curClasses.length) {
        j = 0;

        while (clazz = classes[j++]) {
          pos = curClasses.indexOf(clazz);

          if (~pos) {
            curClasses.splice(pos, 1);
          }
        }

        finalValue = curClasses.join(" ");

        if (className != finalValue) {
          elem.className.baseVal = finalValue;
        }
      }

      return this;
    };
    /*\
     * Element.hasClass
     [ method ]
     **
     * Checks if the element has a given class name in the list of class names applied to it.
     - value (string) class name
     **
     = (boolean) `true` if the element has given class
    \*/


    elproto.hasClass = function (value) {
      var elem = this.node,
          className = elem.className.baseVal,
          curClasses = className.match(rgNotSpace) || [];
      return !!~curClasses.indexOf(value);
    };
    /*\
     * Element.toggleClass
     [ method ]
     **
     * Add or remove one or more classes from the element, depending on either
     * the class’s presence or the value of the `flag` argument.
     - value (string) class name or space separated list of class names
     - flag (boolean) value to determine whether the class should be added or removed
     **
     = (Element) original element.
    \*/


    elproto.toggleClass = function (value, flag) {
      if (flag != null) {
        if (flag) {
          return this.addClass(value);
        } else {
          return this.removeClass(value);
        }
      }

      var classes = (value || "").match(rgNotSpace) || [],
          elem = this.node,
          className = elem.className.baseVal,
          curClasses = className.match(rgNotSpace) || [],
          j,
          pos,
          clazz,
          finalValue;
      j = 0;

      while (clazz = classes[j++]) {
        pos = curClasses.indexOf(clazz);

        if (~pos) {
          curClasses.splice(pos, 1);
        } else {
          curClasses.push(clazz);
        }
      }

      finalValue = curClasses.join(" ");

      if (className != finalValue) {
        elem.className.baseVal = finalValue;
      }

      return this;
    };
  }); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
    var operators = {
      "+": function (x, y) {
        return x + y;
      },
      "-": function (x, y) {
        return x - y;
      },
      "/": function (x, y) {
        return x / y;
      },
      "*": function (x, y) {
        return x * y;
      }
    },
        Str = String,
        reUnit = /[a-z]+$/i,
        reAddon = /^\s*([+\-\/*])\s*=\s*([\d.eE+\-]+)\s*([^\d\s]+)?\s*$/;

    function getNumber(val) {
      return val;
    }

    function getUnit(unit) {
      return function (val) {
        return +val.toFixed(3) + unit;
      };
    }

    eve.on("snap.util.attr", function (val) {
      var plus = Str(val).match(reAddon);

      if (plus) {
        var evnt = eve.nt(),
            name = evnt.substring(evnt.lastIndexOf(".") + 1),
            a = this.attr(name),
            atr = {};
        eve.stop();
        var unit = plus[3] || "",
            aUnit = a.match(reUnit),
            op = operators[plus[1]];

        if (aUnit && aUnit == unit) {
          val = op(parseFloat(a), +plus[2]);
        } else {
          a = this.asPX(name);
          val = op(this.asPX(name), this.asPX(name, plus[2] + unit));
        }

        if (isNaN(a) || isNaN(val)) {
          return;
        }

        atr[name] = val;
        this.attr(atr);
      }
    })(-10);
    eve.on("snap.util.equal", function (name, b) {
      var A,
          B,
          a = Str(this.attr(name) || ""),
          el = this,
          bplus = Str(b).match(reAddon);

      if (bplus) {
        eve.stop();
        var unit = bplus[3] || "",
            aUnit = a.match(reUnit),
            op = operators[bplus[1]];

        if (aUnit && aUnit == unit) {
          return {
            from: parseFloat(a),
            to: op(parseFloat(a), +bplus[2]),
            f: getUnit(aUnit)
          };
        } else {
          a = this.asPX(name);
          return {
            from: a,
            to: op(a, this.asPX(name, bplus[2] + unit)),
            f: getNumber
          };
        }
      }
    })(-10);
  }); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
    var proto = Paper.prototype,
        is = Snap.is;
    /*\
     * Paper.rect
     [ method ]
     *
     * Draws a rectangle
     **
     - x (number) x coordinate of the top left corner
     - y (number) y coordinate of the top left corner
     - width (number) width
     - height (number) height
     - rx (number) #optional horizontal radius for rounded corners, default is 0
     - ry (number) #optional vertical radius for rounded corners, default is rx or 0
     = (object) the `rect` element
     **
     > Usage
     | // regular rectangle
     | var c = paper.rect(10, 10, 50, 50);
     | // rectangle with rounded corners
     | var c = paper.rect(40, 40, 50, 50, 10);
    \*/

    proto.rect = function (x, y, w, h, rx, ry) {
      var attr;

      if (ry == null) {
        ry = rx;
      }

      if (is(x, "object") && x == "[object Object]") {
        attr = x;
      } else if (x != null) {
        attr = {
          x: x,
          y: y,
          width: w,
          height: h
        };

        if (rx != null) {
          attr.rx = rx;
          attr.ry = ry;
        }
      }

      return this.el("rect", attr);
    };
    /*\
     * Paper.circle
     [ method ]
     **
     * Draws a circle
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - r (number) radius
     = (object) the `circle` element
     **
     > Usage
     | var c = paper.circle(50, 50, 40);
    \*/


    proto.circle = function (cx, cy, r) {
      var attr;

      if (is(cx, "object") && cx == "[object Object]") {
        attr = cx;
      } else if (cx != null) {
        attr = {
          cx: cx,
          cy: cy,
          r: r
        };
      }

      return this.el("circle", attr);
    };

    var preload = function () {
      function onerror() {
        this.parentNode.removeChild(this);
      }

      return function (src, f) {
        var img = glob.doc.createElement("img"),
            body = glob.doc.body;
        img.style.cssText = "position:absolute;left:-9999em;top:-9999em";

        img.onload = function () {
          f.call(img);
          img.onload = img.onerror = null;
          body.removeChild(img);
        };

        img.onerror = onerror;
        body.appendChild(img);
        img.src = src;
      };
    }();
    /*\
     * Paper.image
     [ method ]
     **
     * Places an image on the surface
     **
     - src (string) URI of the source image
     - x (number) x offset position
     - y (number) y offset position
     - width (number) width of the image
     - height (number) height of the image
     = (object) the `image` element
     * or
     = (object) Snap element object with type `image`
     **
     > Usage
     | var c = paper.image("apple.png", 10, 10, 80, 80);
    \*/


    proto.image = function (src, x, y, width, height) {
      var el = this.el("image");

      if (is(src, "object") && "src" in src) {
        el.attr(src);
      } else if (src != null) {
        var set = {
          "xlink:href": src,
          preserveAspectRatio: "none"
        };

        if (x != null && y != null) {
          set.x = x;
          set.y = y;
        }

        if (width != null && height != null) {
          set.width = width;
          set.height = height;
        } else {
          preload(src, function () {
            Snap._.$(el.node, {
              width: this.offsetWidth,
              height: this.offsetHeight
            });
          });
        }

        Snap._.$(el.node, set);
      }

      return el;
    };
    /*\
     * Paper.ellipse
     [ method ]
     **
     * Draws an ellipse
     **
     - x (number) x coordinate of the centre
     - y (number) y coordinate of the centre
     - rx (number) horizontal radius
     - ry (number) vertical radius
     = (object) the `ellipse` element
     **
     > Usage
     | var c = paper.ellipse(50, 50, 40, 20);
    \*/


    proto.ellipse = function (cx, cy, rx, ry) {
      var attr;

      if (is(cx, "object") && cx == "[object Object]") {
        attr = cx;
      } else if (cx != null) {
        attr = {
          cx: cx,
          cy: cy,
          rx: rx,
          ry: ry
        };
      }

      return this.el("ellipse", attr);
    }; // SIERRA Paper.path(): Unclear from the link what a Catmull-Rom curveto is, and why it would make life any easier.

    /*\
     * Paper.path
     [ method ]
     **
     * Creates a `<path>` element using the given string as the path's definition
     - pathString (string) #optional path string in SVG format
     * Path string consists of one-letter commands, followed by comma seprarated arguments in numerical form. Example:
     | "M10,20L30,40"
     * This example features two commands: `M`, with arguments `(10, 20)` and `L` with arguments `(30, 40)`. Uppercase letter commands express coordinates in absolute terms, while lowercase commands express them in relative terms from the most recently declared coordinates.
     *
     # <p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a> or <a href="https://developer.mozilla.org/en/SVG/Tutorial/Paths">article about path strings at MDN</a>.</p>
     # <table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody>
     # <tr><td>M</td><td>moveto</td><td>(x y)+</td></tr>
     # <tr><td>Z</td><td>closepath</td><td>(none)</td></tr>
     # <tr><td>L</td><td>lineto</td><td>(x y)+</td></tr>
     # <tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr>
     # <tr><td>V</td><td>vertical lineto</td><td>y+</td></tr>
     # <tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr>
     # <tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr>
     # <tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr>
     # <tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr>
     # <tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr>
     # <tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull–Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table>
     * * _Catmull-Rom curveto_ is a not standard SVG command and added to make life easier.
     * Note: there is a special case when a path consists of only three commands: `M10,10R…z`. In this case the path connects back to its starting point.
     > Usage
     | var c = paper.path("M10 10L90 90");
     | // draw a diagonal line:
     | // move to 10,10, line to 90,90
    \*/


    proto.path = function (d) {
      var attr;

      if (is(d, "object") && !is(d, "array")) {
        attr = d;
      } else if (d) {
        attr = {
          d: d
        };
      }

      return this.el("path", attr);
    };
    /*\
     * Paper.g
     [ method ]
     **
     * Creates a group element
     **
     - varargs (…) #optional elements to nest within the group
     = (object) the `g` element
     **
     > Usage
     | var c1 = paper.circle(),
     |     c2 = paper.rect(),
     |     g = paper.g(c2, c1); // note that the order of elements is different
     * or
     | var c1 = paper.circle(),
     |     c2 = paper.rect(),
     |     g = paper.g();
     | g.add(c2, c1);
    \*/

    /*\
     * Paper.group
     [ method ]
     **
     * See @Paper.g
    \*/


    proto.group = proto.g = function (first) {
      var attr,
          el = this.el("g");

      if (arguments.length == 1 && first && !first.type) {
        el.attr(first);
      } else if (arguments.length) {
        el.add(Array.prototype.slice.call(arguments, 0));
      }

      return el;
    };
    /*\
     * Paper.svg
     [ method ]
     **
     * Creates a nested SVG element.
     - x (number) @optional X of the element
     - y (number) @optional Y of the element
     - width (number) @optional width of the element
     - height (number) @optional height of the element
     - vbx (number) @optional viewbox X
     - vby (number) @optional viewbox Y
     - vbw (number) @optional viewbox width
     - vbh (number) @optional viewbox height
     **
     = (object) the `svg` element
     **
    \*/


    proto.svg = function (x, y, width, height, vbx, vby, vbw, vbh) {
      var attrs = {};

      if (is(x, "object") && y == null) {
        attrs = x;
      } else {
        if (x != null) {
          attrs.x = x;
        }

        if (y != null) {
          attrs.y = y;
        }

        if (width != null) {
          attrs.width = width;
        }

        if (height != null) {
          attrs.height = height;
        }

        if (vbx != null && vby != null && vbw != null && vbh != null) {
          attrs.viewBox = [vbx, vby, vbw, vbh];
        }
      }

      return this.el("svg", attrs);
    };
    /*\
     * Paper.mask
     [ method ]
     **
     * Equivalent in behaviour to @Paper.g, except it’s a mask.
     **
     = (object) the `mask` element
     **
    \*/


    proto.mask = function (first) {
      var attr,
          el = this.el("mask");

      if (arguments.length == 1 && first && !first.type) {
        el.attr(first);
      } else if (arguments.length) {
        el.add(Array.prototype.slice.call(arguments, 0));
      }

      return el;
    };
    /*\
     * Paper.ptrn
     [ method ]
     **
     * Equivalent in behaviour to @Paper.g, except it’s a pattern.
     - x (number) @optional X of the element
     - y (number) @optional Y of the element
     - width (number) @optional width of the element
     - height (number) @optional height of the element
     - vbx (number) @optional viewbox X
     - vby (number) @optional viewbox Y
     - vbw (number) @optional viewbox width
     - vbh (number) @optional viewbox height
     **
     = (object) the `pattern` element
     **
    \*/


    proto.ptrn = function (x, y, width, height, vx, vy, vw, vh) {
      if (is(x, "object")) {
        var attr = x;
      } else {
        attr = {
          patternUnits: "userSpaceOnUse"
        };

        if (x) {
          attr.x = x;
        }

        if (y) {
          attr.y = y;
        }

        if (width != null) {
          attr.width = width;
        }

        if (height != null) {
          attr.height = height;
        }

        if (vx != null && vy != null && vw != null && vh != null) {
          attr.viewBox = [vx, vy, vw, vh];
        } else {
          attr.viewBox = [x || 0, y || 0, width || 0, height || 0];
        }
      }

      return this.el("pattern", attr);
    };
    /*\
     * Paper.use
     [ method ]
     **
     * Creates a <use> element.
     - id (string) @optional id of element to link
     * or
     - id (Element) @optional element to link
     **
     = (object) the `use` element
     **
    \*/


    proto.use = function (id) {
      if (id != null) {
        if (id instanceof Element) {
          if (!id.attr("id")) {
            id.attr({
              id: Snap._.id(id)
            });
          }

          id = id.attr("id");
        }

        if (String(id).charAt() == "#") {
          id = id.substring(1);
        }

        return this.el("use", {
          "xlink:href": "#" + id
        });
      } else {
        return Element.prototype.use.call(this);
      }
    };
    /*\
     * Paper.symbol
     [ method ]
     **
     * Creates a <symbol> element.
     - vbx (number) @optional viewbox X
     - vby (number) @optional viewbox Y
     - vbw (number) @optional viewbox width
     - vbh (number) @optional viewbox height
     = (object) the `symbol` element
     **
    \*/


    proto.symbol = function (vx, vy, vw, vh) {
      var attr = {};

      if (vx != null && vy != null && vw != null && vh != null) {
        attr.viewBox = [vx, vy, vw, vh];
      }

      return this.el("symbol", attr);
    };
    /*\
     * Paper.text
     [ method ]
     **
     * Draws a text string
     **
     - x (number) x coordinate position
     - y (number) y coordinate position
     - text (string|array) The text string to draw or array of strings to nest within separate `<tspan>` elements
     = (object) the `text` element
     **
     > Usage
     | var t1 = paper.text(50, 50, "Snap");
     | var t2 = paper.text(50, 50, ["S","n","a","p"]);
     | // Text path usage
     | t1.attr({textpath: "M10,10L100,100"});
     | // or
     | var pth = paper.path("M10,10L100,100");
     | t1.attr({textpath: pth});
    \*/


    proto.text = function (x, y, text) {
      var attr = {};

      if (is(x, "object")) {
        attr = x;
      } else if (x != null) {
        attr = {
          x: x,
          y: y,
          text: text || ""
        };
      }

      return this.el("text", attr);
    };
    /*\
     * Paper.line
     [ method ]
     **
     * Draws a line
     **
     - x1 (number) x coordinate position of the start
     - y1 (number) y coordinate position of the start
     - x2 (number) x coordinate position of the end
     - y2 (number) y coordinate position of the end
     = (object) the `line` element
     **
     > Usage
     | var t1 = paper.line(50, 50, 100, 100);
    \*/


    proto.line = function (x1, y1, x2, y2) {
      var attr = {};

      if (is(x1, "object")) {
        attr = x1;
      } else if (x1 != null) {
        attr = {
          x1: x1,
          x2: x2,
          y1: y1,
          y2: y2
        };
      }

      return this.el("line", attr);
    };
    /*\
     * Paper.polyline
     [ method ]
     **
     * Draws a polyline
     **
     - points (array) array of points
     * or
     - varargs (…) points
     = (object) the `polyline` element
     **
     > Usage
     | var p1 = paper.polyline([10, 10, 100, 100]);
     | var p2 = paper.polyline(10, 10, 100, 100);
    \*/


    proto.polyline = function (points) {
      if (arguments.length > 1) {
        points = Array.prototype.slice.call(arguments, 0);
      }

      var attr = {};

      if (is(points, "object") && !is(points, "array")) {
        attr = points;
      } else if (points != null) {
        attr = {
          points: points
        };
      }

      return this.el("polyline", attr);
    };
    /*\
     * Paper.polygon
     [ method ]
     **
     * Draws a polygon. See @Paper.polyline
    \*/


    proto.polygon = function (points) {
      if (arguments.length > 1) {
        points = Array.prototype.slice.call(arguments, 0);
      }

      var attr = {};

      if (is(points, "object") && !is(points, "array")) {
        attr = points;
      } else if (points != null) {
        attr = {
          points: points
        };
      }

      return this.el("polygon", attr);
    }; // gradients


    (function () {
      var $ = Snap._.$; // gradients' helpers

      /*\
       * Element.stops
       [ method ]
       **
       * Only for gradients!
       * Returns array of gradient stops elements.
       = (array) the stops array.
      \*/

      function Gstops() {
        return this.selectAll("stop");
      }
      /*\
       * Element.addStop
       [ method ]
       **
       * Only for gradients!
       * Adds another stop to the gradient.
       - color (string) stops color
       - offset (number) stops offset 0..100
       = (object) gradient element
      \*/


      function GaddStop(color, offset) {
        var stop = $("stop"),
            attr = {
          offset: +offset + "%"
        };
        color = Snap.color(color);
        attr["stop-color"] = color.hex;

        if (color.opacity < 1) {
          attr["stop-opacity"] = color.opacity;
        }

        $(stop, attr);
        var stops = this.stops(),
            inserted;

        for (var i = 0; i < stops.length; i++) {
          var stopOffset = parseFloat(stops[i].attr("offset"));

          if (stopOffset > offset) {
            this.node.insertBefore(stop, stops[i].node);
            inserted = true;
            break;
          }
        }

        if (!inserted) {
          this.node.appendChild(stop);
        }

        return this;
      }

      function GgetBBox() {
        if (this.type == "linearGradient") {
          var x1 = $(this.node, "x1") || 0,
              x2 = $(this.node, "x2") || 1,
              y1 = $(this.node, "y1") || 0,
              y2 = $(this.node, "y2") || 0;
          return Snap._.box(x1, y1, math.abs(x2 - x1), math.abs(y2 - y1));
        } else {
          var cx = this.node.cx || .5,
              cy = this.node.cy || .5,
              r = this.node.r || 0;
          return Snap._.box(cx - r, cy - r, r * 2, r * 2);
        }
      }
      /*\
       * Element.setStops
       [ method ]
       **
       * Only for gradients!
       * Updates stops of the gradient based on passed gradient descriptor. See @Ppaer.gradient
       - str (string) gradient descriptor part after `()`.
       = (object) gradient element
       | var g = paper.gradient("l(0, 0, 1, 1)#000-#f00-#fff");
       | g.setStops("#fff-#000-#f00-#fc0");
      \*/


      function GsetStops(str) {
        var grad = str,
            stops = this.stops();

        if (typeof str == "string") {
          grad = eve("snap.util.grad.parse", null, "l(0,0,0,1)" + str).firstDefined().stops;
        }

        if (!Snap.is(grad, "array")) {
          return;
        }

        for (var i = 0; i < stops.length; i++) {
          if (grad[i]) {
            var color = Snap.color(grad[i].color),
                attr = {
              "offset": grad[i].offset + "%"
            };
            attr["stop-color"] = color.hex;

            if (color.opacity < 1) {
              attr["stop-opacity"] = color.opacity;
            }

            stops[i].attr(attr);
          } else {
            stops[i].remove();
          }
        }

        for (i = stops.length; i < grad.length; i++) {
          this.addStop(grad[i].color, grad[i].offset);
        }

        return this;
      }

      function gradient(defs, str) {
        var grad = eve("snap.util.grad.parse", null, str).firstDefined(),
            el;

        if (!grad) {
          return null;
        }

        grad.params.unshift(defs);

        if (grad.type.toLowerCase() == "l") {
          el = gradientLinear.apply(0, grad.params);
        } else {
          el = gradientRadial.apply(0, grad.params);
        }

        if (grad.type != grad.type.toLowerCase()) {
          $(el.node, {
            gradientUnits: "userSpaceOnUse"
          });
        }

        var stops = grad.stops,
            len = stops.length;

        for (var i = 0; i < len; i++) {
          var stop = stops[i];
          el.addStop(stop.color, stop.offset);
        }

        return el;
      }

      function gradientLinear(defs, x1, y1, x2, y2) {
        var el = Snap._.make("linearGradient", defs);

        el.stops = Gstops;
        el.addStop = GaddStop;
        el.getBBox = GgetBBox;
        el.setStops = GsetStops;

        if (x1 != null) {
          $(el.node, {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
          });
        }

        return el;
      }

      function gradientRadial(defs, cx, cy, r, fx, fy) {
        var el = Snap._.make("radialGradient", defs);

        el.stops = Gstops;
        el.addStop = GaddStop;
        el.getBBox = GgetBBox;

        if (cx != null) {
          $(el.node, {
            cx: cx,
            cy: cy,
            r: r
          });
        }

        if (fx != null && fy != null) {
          $(el.node, {
            fx: fx,
            fy: fy
          });
        }

        return el;
      }
      /*\
       * Paper.gradient
       [ method ]
       **
       * Creates a gradient element
       **
       - gradient (string) gradient descriptor
       > Gradient Descriptor
       * The gradient descriptor is an expression formatted as
       * follows: `<type>(<coords>)<colors>`.  The `<type>` can be
       * either linear or radial.  The uppercase `L` or `R` letters
       * indicate absolute coordinates offset from the SVG surface.
       * Lowercase `l` or `r` letters indicate coordinates
       * calculated relative to the element to which the gradient is
       * applied.  Coordinates specify a linear gradient vector as
       * `x1`, `y1`, `x2`, `y2`, or a radial gradient as `cx`, `cy`,
       * `r` and optional `fx`, `fy` specifying a focal point away
       * from the center of the circle. Specify `<colors>` as a list
       * of dash-separated CSS color values.  Each color may be
       * followed by a custom offset value, separated with a colon
       * character.
       > Examples
       * Linear gradient, relative from top-left corner to bottom-right
       * corner, from black through red to white:
       | var g = paper.gradient("l(0, 0, 1, 1)#000-#f00-#fff");
       * Linear gradient, absolute from (0, 0) to (100, 100), from black
       * through red at 25% to white:
       | var g = paper.gradient("L(0, 0, 100, 100)#000-#f00:25-#fff");
       * Radial gradient, relative from the center of the element with radius
       * half the width, from black to white:
       | var g = paper.gradient("r(0.5, 0.5, 0.5)#000-#fff");
       * To apply the gradient:
       | paper.circle(50, 50, 40).attr({
       |     fill: g
       | });
       = (object) the `gradient` element
      \*/


      proto.gradient = function (str) {
        return gradient(this.defs, str);
      };

      proto.gradientLinear = function (x1, y1, x2, y2) {
        return gradientLinear(this.defs, x1, y1, x2, y2);
      };

      proto.gradientRadial = function (cx, cy, r, fx, fy) {
        return gradientRadial(this.defs, cx, cy, r, fx, fy);
      };
      /*\
       * Paper.toString
       [ method ]
       **
       * Returns SVG code for the @Paper
       = (string) SVG code for the @Paper
      \*/


      proto.toString = function () {
        var doc = this.node.ownerDocument,
            f = doc.createDocumentFragment(),
            d = doc.createElement("div"),
            svg = this.node.cloneNode(true),
            res;
        f.appendChild(d);
        d.appendChild(svg);

        Snap._.$(svg, {
          xmlns: "http://www.w3.org/2000/svg"
        });

        res = d.innerHTML;
        f.removeChild(f.firstChild);
        return res;
      };
      /*\
       * Paper.toDataURL
       [ method ]
       **
       * Returns SVG code for the @Paper as Data URI string.
       = (string) Data URI string
      \*/


      proto.toDataURL = function () {
        if (window && window.btoa) {
          return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(this)));
        }
      };
      /*\
       * Paper.clear
       [ method ]
       **
       * Removes all child nodes of the paper, except <defs>.
      \*/


      proto.clear = function () {
        var node = this.node.firstChild,
            next;

        while (node) {
          next = node.nextSibling;

          if (node.tagName != "defs") {
            node.parentNode.removeChild(node);
          } else {
            proto.clear.call({
              node: node
            });
          }

          node = next;
        }
      };
    })();
  }); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob) {
    var elproto = Element.prototype,
        is = Snap.is,
        clone = Snap._.clone,
        has = "hasOwnProperty",
        p2s = /,?([a-z]),?/gi,
        toFloat = parseFloat,
        math = Math,
        PI = math.PI,
        mmin = math.min,
        mmax = math.max,
        pow = math.pow,
        abs = math.abs;

    function paths(ps) {
      var p = paths.ps = paths.ps || {};

      if (p[ps]) {
        p[ps].sleep = 100;
      } else {
        p[ps] = {
          sleep: 100
        };
      }

      setTimeout(function () {
        for (var key in p) if (p[has](key) && key != ps) {
          p[key].sleep--;
          !p[key].sleep && delete p[key];
        }
      });
      return p[ps];
    }

    function box(x, y, width, height) {
      if (x == null) {
        x = y = width = height = 0;
      }

      if (y == null) {
        y = x.y;
        width = x.width;
        height = x.height;
        x = x.x;
      }

      return {
        x: x,
        y: y,
        width: width,
        w: width,
        height: height,
        h: height,
        x2: x + width,
        y2: y + height,
        cx: x + width / 2,
        cy: y + height / 2,
        r1: math.min(width, height) / 2,
        r2: math.max(width, height) / 2,
        r0: math.sqrt(width * width + height * height) / 2,
        path: rectPath(x, y, width, height),
        vb: [x, y, width, height].join(" ")
      };
    }

    function toString() {
      return this.join(",").replace(p2s, "$1");
    }

    function pathClone(pathArray) {
      var res = clone(pathArray);
      res.toString = toString;
      return res;
    }

    function getPointAtSegmentLength(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length) {
      if (length == null) {
        return bezlen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y);
      } else {
        return findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, getTotLen(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, length));
      }
    }

    function getLengthFactory(istotal, subpath) {
      function O(val) {
        return +(+val).toFixed(3);
      }

      return Snap._.cacher(function (path, length, onlystart) {
        if (path instanceof Element) {
          path = path.attr("d");
        }

        path = path2curve(path);
        var x,
            y,
            p,
            l,
            sp = "",
            subpaths = {},
            point,
            len = 0;

        for (var i = 0, ii = path.length; i < ii; i++) {
          p = path[i];

          if (p[0] == "M") {
            x = +p[1];
            y = +p[2];
          } else {
            l = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);

            if (len + l > length) {
              if (subpath && !subpaths.start) {
                point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                sp += ["C" + O(point.start.x), O(point.start.y), O(point.m.x), O(point.m.y), O(point.x), O(point.y)];

                if (onlystart) {
                  return sp;
                }

                subpaths.start = sp;
                sp = ["M" + O(point.x), O(point.y) + "C" + O(point.n.x), O(point.n.y), O(point.end.x), O(point.end.y), O(p[5]), O(p[6])].join();
                len += l;
                x = +p[5];
                y = +p[6];
                continue;
              }

              if (!istotal && !subpath) {
                point = getPointAtSegmentLength(x, y, p[1], p[2], p[3], p[4], p[5], p[6], length - len);
                return point;
              }
            }

            len += l;
            x = +p[5];
            y = +p[6];
          }

          sp += p.shift() + p;
        }

        subpaths.end = sp;
        point = istotal ? len : subpath ? subpaths : findDotsAtSegment(x, y, p[0], p[1], p[2], p[3], p[4], p[5], 1);
        return point;
      }, null, Snap._.clone);
    }

    var getTotalLength = getLengthFactory(1),
        getPointAtLength = getLengthFactory(),
        getSubpathsAtLength = getLengthFactory(0, 1);

    function findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
      var t1 = 1 - t,
          t13 = pow(t1, 3),
          t12 = pow(t1, 2),
          t2 = t * t,
          t3 = t2 * t,
          x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
          y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
          mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
          my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
          nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
          ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
          ax = t1 * p1x + t * c1x,
          ay = t1 * p1y + t * c1y,
          cx = t1 * c2x + t * p2x,
          cy = t1 * c2y + t * p2y,
          alpha = 90 - math.atan2(mx - nx, my - ny) * 180 / PI; // (mx > nx || my < ny) && (alpha += 180);

      return {
        x: x,
        y: y,
        m: {
          x: mx,
          y: my
        },
        n: {
          x: nx,
          y: ny
        },
        start: {
          x: ax,
          y: ay
        },
        end: {
          x: cx,
          y: cy
        },
        alpha: alpha
      };
    }

    function bezierBBox(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {
      if (!Snap.is(p1x, "array")) {
        p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
      }

      var bbox = curveDim.apply(null, p1x);
      return box(bbox.min.x, bbox.min.y, bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y);
    }

    function isPointInsideBBox(bbox, x, y) {
      return x >= bbox.x && x <= bbox.x + bbox.width && y >= bbox.y && y <= bbox.y + bbox.height;
    }

    function isBBoxIntersect(bbox1, bbox2) {
      bbox1 = box(bbox1);
      bbox2 = box(bbox2);
      return isPointInsideBBox(bbox2, bbox1.x, bbox1.y) || isPointInsideBBox(bbox2, bbox1.x2, bbox1.y) || isPointInsideBBox(bbox2, bbox1.x, bbox1.y2) || isPointInsideBBox(bbox2, bbox1.x2, bbox1.y2) || isPointInsideBBox(bbox1, bbox2.x, bbox2.y) || isPointInsideBBox(bbox1, bbox2.x2, bbox2.y) || isPointInsideBBox(bbox1, bbox2.x, bbox2.y2) || isPointInsideBBox(bbox1, bbox2.x2, bbox2.y2) || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x) && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
    }

    function base3(t, p1, p2, p3, p4) {
      var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
          t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
      return t * t2 - 3 * p1 + 3 * p2;
    }

    function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {
      if (z == null) {
        z = 1;
      }

      z = z > 1 ? 1 : z < 0 ? 0 : z;
      var z2 = z / 2,
          n = 12,
          Tvalues = [-.1252, .1252, -.3678, .3678, -.5873, .5873, -.7699, .7699, -.9041, .9041, -.9816, .9816],
          Cvalues = [0.2491, 0.2491, 0.2335, 0.2335, 0.2032, 0.2032, 0.1601, 0.1601, 0.1069, 0.1069, 0.0472, 0.0472],
          sum = 0;

      for (var i = 0; i < n; i++) {
        var ct = z2 * Tvalues[i] + z2,
            xbase = base3(ct, x1, x2, x3, x4),
            ybase = base3(ct, y1, y2, y3, y4),
            comb = xbase * xbase + ybase * ybase;
        sum += Cvalues[i] * math.sqrt(comb);
      }

      return z2 * sum;
    }

    function getTotLen(x1, y1, x2, y2, x3, y3, x4, y4, ll) {
      if (ll < 0 || bezlen(x1, y1, x2, y2, x3, y3, x4, y4) < ll) {
        return;
      }

      var t = 1,
          step = t / 2,
          t2 = t - step,
          l,
          e = .01;
      l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);

      while (abs(l - ll) > e) {
        step /= 2;
        t2 += (l < ll ? 1 : -1) * step;
        l = bezlen(x1, y1, x2, y2, x3, y3, x4, y4, t2);
      }

      return t2;
    }

    function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
      if (mmax(x1, x2) < mmin(x3, x4) || mmin(x1, x2) > mmax(x3, x4) || mmax(y1, y2) < mmin(y3, y4) || mmin(y1, y2) > mmax(y3, y4)) {
        return;
      }

      var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
          ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
          denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

      if (!denominator) {
        return;
      }

      var px = nx / denominator,
          py = ny / denominator,
          px2 = +px.toFixed(2),
          py2 = +py.toFixed(2);

      if (px2 < +mmin(x1, x2).toFixed(2) || px2 > +mmax(x1, x2).toFixed(2) || px2 < +mmin(x3, x4).toFixed(2) || px2 > +mmax(x3, x4).toFixed(2) || py2 < +mmin(y1, y2).toFixed(2) || py2 > +mmax(y1, y2).toFixed(2) || py2 < +mmin(y3, y4).toFixed(2) || py2 > +mmax(y3, y4).toFixed(2)) {
        return;
      }

      return {
        x: px,
        y: py
      };
    }

    function inter(bez1, bez2) {
      return interHelper(bez1, bez2);
    }

    function interCount(bez1, bez2) {
      return interHelper(bez1, bez2, 1);
    }

    function interHelper(bez1, bez2, justCount) {
      var bbox1 = bezierBBox(bez1),
          bbox2 = bezierBBox(bez2);

      if (!isBBoxIntersect(bbox1, bbox2)) {
        return justCount ? 0 : [];
      }

      var l1 = bezlen.apply(0, bez1),
          l2 = bezlen.apply(0, bez2),
          n1 = ~~(l1 / 8),
          n2 = ~~(l2 / 8),
          dots1 = [],
          dots2 = [],
          xy = {},
          res = justCount ? 0 : [];

      for (var i = 0; i < n1 + 1; i++) {
        var p = findDotsAtSegment.apply(0, bez1.concat(i / n1));
        dots1.push({
          x: p.x,
          y: p.y,
          t: i / n1
        });
      }

      for (i = 0; i < n2 + 1; i++) {
        p = findDotsAtSegment.apply(0, bez2.concat(i / n2));
        dots2.push({
          x: p.x,
          y: p.y,
          t: i / n2
        });
      }

      for (i = 0; i < n1; i++) {
        for (var j = 0; j < n2; j++) {
          var di = dots1[i],
              di1 = dots1[i + 1],
              dj = dots2[j],
              dj1 = dots2[j + 1],
              ci = abs(di1.x - di.x) < .001 ? "y" : "x",
              cj = abs(dj1.x - dj.x) < .001 ? "y" : "x",
              is = intersect(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);

          if (is) {
            if (xy[is.x.toFixed(4)] == is.y.toFixed(4)) {
              continue;
            }

            xy[is.x.toFixed(4)] = is.y.toFixed(4);
            var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
                t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);

            if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
              if (justCount) {
                res++;
              } else {
                res.push({
                  x: is.x,
                  y: is.y,
                  t1: t1,
                  t2: t2
                });
              }
            }
          }
        }
      }

      return res;
    }

    function pathIntersection(path1, path2) {
      return interPathHelper(path1, path2);
    }

    function pathIntersectionNumber(path1, path2) {
      return interPathHelper(path1, path2, 1);
    }

    function interPathHelper(path1, path2, justCount) {
      path1 = path2curve(path1);
      path2 = path2curve(path2);
      var x1,
          y1,
          x2,
          y2,
          x1m,
          y1m,
          x2m,
          y2m,
          bez1,
          bez2,
          res = justCount ? 0 : [];

      for (var i = 0, ii = path1.length; i < ii; i++) {
        var pi = path1[i];

        if (pi[0] == "M") {
          x1 = x1m = pi[1];
          y1 = y1m = pi[2];
        } else {
          if (pi[0] == "C") {
            bez1 = [x1, y1].concat(pi.slice(1));
            x1 = bez1[6];
            y1 = bez1[7];
          } else {
            bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
            x1 = x1m;
            y1 = y1m;
          }

          for (var j = 0, jj = path2.length; j < jj; j++) {
            var pj = path2[j];

            if (pj[0] == "M") {
              x2 = x2m = pj[1];
              y2 = y2m = pj[2];
            } else {
              if (pj[0] == "C") {
                bez2 = [x2, y2].concat(pj.slice(1));
                x2 = bez2[6];
                y2 = bez2[7];
              } else {
                bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
                x2 = x2m;
                y2 = y2m;
              }

              var intr = interHelper(bez1, bez2, justCount);

              if (justCount) {
                res += intr;
              } else {
                for (var k = 0, kk = intr.length; k < kk; k++) {
                  intr[k].segment1 = i;
                  intr[k].segment2 = j;
                  intr[k].bez1 = bez1;
                  intr[k].bez2 = bez2;
                }

                res = res.concat(intr);
              }
            }
          }
        }
      }

      return res;
    }

    function isPointInsidePath(path, x, y) {
      var bbox = pathBBox(path);
      return isPointInsideBBox(bbox, x, y) && interPathHelper(path, [["M", x, y], ["H", bbox.x2 + 10]], 1) % 2 == 1;
    }

    function pathBBox(path) {
      var pth = paths(path);

      if (pth.bbox) {
        return clone(pth.bbox);
      }

      if (!path) {
        return box();
      }

      path = path2curve(path);
      var x = 0,
          y = 0,
          X = [],
          Y = [],
          p;

      for (var i = 0, ii = path.length; i < ii; i++) {
        p = path[i];

        if (p[0] == "M") {
          x = p[1];
          y = p[2];
          X.push(x);
          Y.push(y);
        } else {
          var dim = curveDim(x, y, p[1], p[2], p[3], p[4], p[5], p[6]);
          X = X.concat(dim.min.x, dim.max.x);
          Y = Y.concat(dim.min.y, dim.max.y);
          x = p[5];
          y = p[6];
        }
      }

      var xmin = mmin.apply(0, X),
          ymin = mmin.apply(0, Y),
          xmax = mmax.apply(0, X),
          ymax = mmax.apply(0, Y),
          bb = box(xmin, ymin, xmax - xmin, ymax - ymin);
      pth.bbox = clone(bb);
      return bb;
    }

    function rectPath(x, y, w, h, r) {
      if (r) {
        return [["M", +x + +r, y], ["l", w - r * 2, 0], ["a", r, r, 0, 0, 1, r, r], ["l", 0, h - r * 2], ["a", r, r, 0, 0, 1, -r, r], ["l", r * 2 - w, 0], ["a", r, r, 0, 0, 1, -r, -r], ["l", 0, r * 2 - h], ["a", r, r, 0, 0, 1, r, -r], ["z"]];
      }

      var res = [["M", x, y], ["l", w, 0], ["l", 0, h], ["l", -w, 0], ["z"]];
      res.toString = toString;
      return res;
    }

    function ellipsePath(x, y, rx, ry, a) {
      if (a == null && ry == null) {
        ry = rx;
      }

      x = +x;
      y = +y;
      rx = +rx;
      ry = +ry;

      if (a != null) {
        var rad = Math.PI / 180,
            x1 = x + rx * Math.cos(-ry * rad),
            x2 = x + rx * Math.cos(-a * rad),
            y1 = y + rx * Math.sin(-ry * rad),
            y2 = y + rx * Math.sin(-a * rad),
            res = [["M", x1, y1], ["A", rx, rx, 0, +(a - ry > 180), 0, x2, y2]];
      } else {
        res = [["M", x, y], ["m", 0, -ry], ["a", rx, ry, 0, 1, 1, 0, 2 * ry], ["a", rx, ry, 0, 1, 1, 0, -2 * ry], ["z"]];
      }

      res.toString = toString;
      return res;
    }

    var unit2px = Snap._unit2px,
        getPath = {
      path: function (el) {
        return el.attr("path");
      },
      circle: function (el) {
        var attr = unit2px(el);
        return ellipsePath(attr.cx, attr.cy, attr.r);
      },
      ellipse: function (el) {
        var attr = unit2px(el);
        return ellipsePath(attr.cx || 0, attr.cy || 0, attr.rx, attr.ry);
      },
      rect: function (el) {
        var attr = unit2px(el);
        return rectPath(attr.x || 0, attr.y || 0, attr.width, attr.height, attr.rx, attr.ry);
      },
      image: function (el) {
        var attr = unit2px(el);
        return rectPath(attr.x || 0, attr.y || 0, attr.width, attr.height);
      },
      line: function (el) {
        return "M" + [el.attr("x1") || 0, el.attr("y1") || 0, el.attr("x2"), el.attr("y2")];
      },
      polyline: function (el) {
        return "M" + el.attr("points");
      },
      polygon: function (el) {
        return "M" + el.attr("points") + "z";
      },
      deflt: function (el) {
        var bbox = el.node.getBBox();
        return rectPath(bbox.x, bbox.y, bbox.width, bbox.height);
      }
    };

    function pathToRelative(pathArray) {
      var pth = paths(pathArray),
          lowerCase = String.prototype.toLowerCase;

      if (pth.rel) {
        return pathClone(pth.rel);
      }

      if (!Snap.is(pathArray, "array") || !Snap.is(pathArray && pathArray[0], "array")) {
        pathArray = Snap.parsePathString(pathArray);
      }

      var res = [],
          x = 0,
          y = 0,
          mx = 0,
          my = 0,
          start = 0;

      if (pathArray[0][0] == "M") {
        x = pathArray[0][1];
        y = pathArray[0][2];
        mx = x;
        my = y;
        start++;
        res.push(["M", x, y]);
      }

      for (var i = start, ii = pathArray.length; i < ii; i++) {
        var r = res[i] = [],
            pa = pathArray[i];

        if (pa[0] != lowerCase.call(pa[0])) {
          r[0] = lowerCase.call(pa[0]);

          switch (r[0]) {
            case "a":
              r[1] = pa[1];
              r[2] = pa[2];
              r[3] = pa[3];
              r[4] = pa[4];
              r[5] = pa[5];
              r[6] = +(pa[6] - x).toFixed(3);
              r[7] = +(pa[7] - y).toFixed(3);
              break;

            case "v":
              r[1] = +(pa[1] - y).toFixed(3);
              break;

            case "m":
              mx = pa[1];
              my = pa[2];

            default:
              for (var j = 1, jj = pa.length; j < jj; j++) {
                r[j] = +(pa[j] - (j % 2 ? x : y)).toFixed(3);
              }

          }
        } else {
          r = res[i] = [];

          if (pa[0] == "m") {
            mx = pa[1] + x;
            my = pa[2] + y;
          }

          for (var k = 0, kk = pa.length; k < kk; k++) {
            res[i][k] = pa[k];
          }
        }

        var len = res[i].length;

        switch (res[i][0]) {
          case "z":
            x = mx;
            y = my;
            break;

          case "h":
            x += +res[i][len - 1];
            break;

          case "v":
            y += +res[i][len - 1];
            break;

          default:
            x += +res[i][len - 2];
            y += +res[i][len - 1];
        }
      }

      res.toString = toString;
      pth.rel = pathClone(res);
      return res;
    }

    function pathToAbsolute(pathArray) {
      var pth = paths(pathArray);

      if (pth.abs) {
        return pathClone(pth.abs);
      }

      if (!is(pathArray, "array") || !is(pathArray && pathArray[0], "array")) {
        // rough assumption
        pathArray = Snap.parsePathString(pathArray);
      }

      if (!pathArray || !pathArray.length) {
        return [["M", 0, 0]];
      }

      var res = [],
          x = 0,
          y = 0,
          mx = 0,
          my = 0,
          start = 0,
          pa0;

      if (pathArray[0][0] == "M") {
        x = +pathArray[0][1];
        y = +pathArray[0][2];
        mx = x;
        my = y;
        start++;
        res[0] = ["M", x, y];
      }

      var crz = pathArray.length == 3 && pathArray[0][0] == "M" && pathArray[1][0].toUpperCase() == "R" && pathArray[2][0].toUpperCase() == "Z";

      for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
        res.push(r = []);
        pa = pathArray[i];
        pa0 = pa[0];

        if (pa0 != pa0.toUpperCase()) {
          r[0] = pa0.toUpperCase();

          switch (r[0]) {
            case "A":
              r[1] = pa[1];
              r[2] = pa[2];
              r[3] = pa[3];
              r[4] = pa[4];
              r[5] = pa[5];
              r[6] = +pa[6] + x;
              r[7] = +pa[7] + y;
              break;

            case "V":
              r[1] = +pa[1] + y;
              break;

            case "H":
              r[1] = +pa[1] + x;
              break;

            case "R":
              var dots = [x, y].concat(pa.slice(1));

              for (var j = 2, jj = dots.length; j < jj; j++) {
                dots[j] = +dots[j] + x;
                dots[++j] = +dots[j] + y;
              }

              res.pop();
              res = res.concat(catmullRom2bezier(dots, crz));
              break;

            case "O":
              res.pop();
              dots = ellipsePath(x, y, pa[1], pa[2]);
              dots.push(dots[0]);
              res = res.concat(dots);
              break;

            case "U":
              res.pop();
              res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
              r = ["U"].concat(res[res.length - 1].slice(-2));
              break;

            case "M":
              mx = +pa[1] + x;
              my = +pa[2] + y;

            default:
              for (j = 1, jj = pa.length; j < jj; j++) {
                r[j] = +pa[j] + (j % 2 ? x : y);
              }

          }
        } else if (pa0 == "R") {
          dots = [x, y].concat(pa.slice(1));
          res.pop();
          res = res.concat(catmullRom2bezier(dots, crz));
          r = ["R"].concat(pa.slice(-2));
        } else if (pa0 == "O") {
          res.pop();
          dots = ellipsePath(x, y, pa[1], pa[2]);
          dots.push(dots[0]);
          res = res.concat(dots);
        } else if (pa0 == "U") {
          res.pop();
          res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
          r = ["U"].concat(res[res.length - 1].slice(-2));
        } else {
          for (var k = 0, kk = pa.length; k < kk; k++) {
            r[k] = pa[k];
          }
        }

        pa0 = pa0.toUpperCase();

        if (pa0 != "O") {
          switch (r[0]) {
            case "Z":
              x = +mx;
              y = +my;
              break;

            case "H":
              x = r[1];
              break;

            case "V":
              y = r[1];
              break;

            case "M":
              mx = r[r.length - 2];
              my = r[r.length - 1];

            default:
              x = r[r.length - 2];
              y = r[r.length - 1];
          }
        }
      }

      res.toString = toString;
      pth.abs = pathClone(res);
      return res;
    }

    function l2c(x1, y1, x2, y2) {
      return [x1, y1, x2, y2, x2, y2];
    }

    function q2c(x1, y1, ax, ay, x2, y2) {
      var _13 = 1 / 3,
          _23 = 2 / 3;

      return [_13 * x1 + _23 * ax, _13 * y1 + _23 * ay, _13 * x2 + _23 * ax, _13 * y2 + _23 * ay, x2, y2];
    }

    function a2c(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
      // for more information of where this math came from visit:
      // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
      var _120 = PI * 120 / 180,
          rad = PI / 180 * (+angle || 0),
          res = [],
          xy,
          rotate = Snap._.cacher(function (x, y, rad) {
        var X = x * math.cos(rad) - y * math.sin(rad),
            Y = x * math.sin(rad) + y * math.cos(rad);
        return {
          x: X,
          y: Y
        };
      });

      if (!rx || !ry) {
        return [x1, y1, x2, y2, x2, y2];
      }

      if (!recursive) {
        xy = rotate(x1, y1, -rad);
        x1 = xy.x;
        y1 = xy.y;
        xy = rotate(x2, y2, -rad);
        x2 = xy.x;
        y2 = xy.y;
        var cos = math.cos(PI / 180 * angle),
            sin = math.sin(PI / 180 * angle),
            x = (x1 - x2) / 2,
            y = (y1 - y2) / 2;
        var h = x * x / (rx * rx) + y * y / (ry * ry);

        if (h > 1) {
          h = math.sqrt(h);
          rx = h * rx;
          ry = h * ry;
        }

        var rx2 = rx * rx,
            ry2 = ry * ry,
            k = (large_arc_flag == sweep_flag ? -1 : 1) * math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
            cx = k * rx * y / ry + (x1 + x2) / 2,
            cy = k * -ry * x / rx + (y1 + y2) / 2,
            f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
            f2 = math.asin(((y2 - cy) / ry).toFixed(9));
        f1 = x1 < cx ? PI - f1 : f1;
        f2 = x2 < cx ? PI - f2 : f2;
        f1 < 0 && (f1 = PI * 2 + f1);
        f2 < 0 && (f2 = PI * 2 + f2);

        if (sweep_flag && f1 > f2) {
          f1 = f1 - PI * 2;
        }

        if (!sweep_flag && f2 > f1) {
          f2 = f2 - PI * 2;
        }
      } else {
        f1 = recursive[0];
        f2 = recursive[1];
        cx = recursive[2];
        cy = recursive[3];
      }

      var df = f2 - f1;

      if (abs(df) > _120) {
        var f2old = f2,
            x2old = x2,
            y2old = y2;
        f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
        x2 = cx + rx * math.cos(f2);
        y2 = cy + ry * math.sin(f2);
        res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
      }

      df = f2 - f1;
      var c1 = math.cos(f1),
          s1 = math.sin(f1),
          c2 = math.cos(f2),
          s2 = math.sin(f2),
          t = math.tan(df / 4),
          hx = 4 / 3 * rx * t,
          hy = 4 / 3 * ry * t,
          m1 = [x1, y1],
          m2 = [x1 + hx * s1, y1 - hy * c1],
          m3 = [x2 + hx * s2, y2 - hy * c2],
          m4 = [x2, y2];
      m2[0] = 2 * m1[0] - m2[0];
      m2[1] = 2 * m1[1] - m2[1];

      if (recursive) {
        return [m2, m3, m4].concat(res);
      } else {
        res = [m2, m3, m4].concat(res).join().split(",");
        var newres = [];

        for (var i = 0, ii = res.length; i < ii; i++) {
          newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
        }

        return newres;
      }
    }

    function findDotAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
      var t1 = 1 - t;
      return {
        x: pow(t1, 3) * p1x + pow(t1, 2) * 3 * t * c1x + t1 * 3 * t * t * c2x + pow(t, 3) * p2x,
        y: pow(t1, 3) * p1y + pow(t1, 2) * 3 * t * c1y + t1 * 3 * t * t * c2y + pow(t, 3) * p2y
      };
    } // Returns bounding box of cubic bezier curve.
    // Source: http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
    // Original version: NISHIO Hirokazu
    // Modifications: https://github.com/timo22345


    function curveDim(x0, y0, x1, y1, x2, y2, x3, y3) {
      var tvalues = [],
          bounds = [[], []],
          a,
          b,
          c,
          t,
          t1,
          t2,
          b2ac,
          sqrtb2ac;

      for (var i = 0; i < 2; ++i) {
        if (i == 0) {
          b = 6 * x0 - 12 * x1 + 6 * x2;
          a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
          c = 3 * x1 - 3 * x0;
        } else {
          b = 6 * y0 - 12 * y1 + 6 * y2;
          a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
          c = 3 * y1 - 3 * y0;
        }

        if (abs(a) < 1e-12) {
          if (abs(b) < 1e-12) {
            continue;
          }

          t = -c / b;

          if (0 < t && t < 1) {
            tvalues.push(t);
          }

          continue;
        }

        b2ac = b * b - 4 * c * a;
        sqrtb2ac = math.sqrt(b2ac);

        if (b2ac < 0) {
          continue;
        }

        t1 = (-b + sqrtb2ac) / (2 * a);

        if (0 < t1 && t1 < 1) {
          tvalues.push(t1);
        }

        t2 = (-b - sqrtb2ac) / (2 * a);

        if (0 < t2 && t2 < 1) {
          tvalues.push(t2);
        }
      }

      var x,
          y,
          j = tvalues.length,
          jlen = j,
          mt;

      while (j--) {
        t = tvalues[j];
        mt = 1 - t;
        bounds[0][j] = mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3;
        bounds[1][j] = mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3;
      }

      bounds[0][jlen] = x0;
      bounds[1][jlen] = y0;
      bounds[0][jlen + 1] = x3;
      bounds[1][jlen + 1] = y3;
      bounds[0].length = bounds[1].length = jlen + 2;
      return {
        min: {
          x: mmin.apply(0, bounds[0]),
          y: mmin.apply(0, bounds[1])
        },
        max: {
          x: mmax.apply(0, bounds[0]),
          y: mmax.apply(0, bounds[1])
        }
      };
    }

    function path2curve(path, path2) {
      var pth = !path2 && paths(path);

      if (!path2 && pth.curve) {
        return pathClone(pth.curve);
      }

      var p = pathToAbsolute(path),
          p2 = path2 && pathToAbsolute(path2),
          attrs = {
        x: 0,
        y: 0,
        bx: 0,
        by: 0,
        X: 0,
        Y: 0,
        qx: null,
        qy: null
      },
          attrs2 = {
        x: 0,
        y: 0,
        bx: 0,
        by: 0,
        X: 0,
        Y: 0,
        qx: null,
        qy: null
      },
          processPath = function (path, d, pcom) {
        var nx, ny;

        if (!path) {
          return ["C", d.x, d.y, d.x, d.y, d.x, d.y];
        }

        !(path[0] in {
          T: 1,
          Q: 1
        }) && (d.qx = d.qy = null);

        switch (path[0]) {
          case "M":
            d.X = path[1];
            d.Y = path[2];
            break;

          case "A":
            path = ["C"].concat(a2c.apply(0, [d.x, d.y].concat(path.slice(1))));
            break;

          case "S":
            if (pcom == "C" || pcom == "S") {
              // In "S" case we have to take into account, if the previous command is C/S.
              nx = d.x * 2 - d.bx; // And reflect the previous

              ny = d.y * 2 - d.by; // command's control point relative to the current point.
            } else {
              // or some else or nothing
              nx = d.x;
              ny = d.y;
            }

            path = ["C", nx, ny].concat(path.slice(1));
            break;

          case "T":
            if (pcom == "Q" || pcom == "T") {
              // In "T" case we have to take into account, if the previous command is Q/T.
              d.qx = d.x * 2 - d.qx; // And make a reflection similar

              d.qy = d.y * 2 - d.qy; // to case "S".
            } else {
              // or something else or nothing
              d.qx = d.x;
              d.qy = d.y;
            }

            path = ["C"].concat(q2c(d.x, d.y, d.qx, d.qy, path[1], path[2]));
            break;

          case "Q":
            d.qx = path[1];
            d.qy = path[2];
            path = ["C"].concat(q2c(d.x, d.y, path[1], path[2], path[3], path[4]));
            break;

          case "L":
            path = ["C"].concat(l2c(d.x, d.y, path[1], path[2]));
            break;

          case "H":
            path = ["C"].concat(l2c(d.x, d.y, path[1], d.y));
            break;

          case "V":
            path = ["C"].concat(l2c(d.x, d.y, d.x, path[1]));
            break;

          case "Z":
            path = ["C"].concat(l2c(d.x, d.y, d.X, d.Y));
            break;
        }

        return path;
      },
          fixArc = function (pp, i) {
        if (pp[i].length > 7) {
          pp[i].shift();
          var pi = pp[i];

          while (pi.length) {
            pcoms1[i] = "A"; // if created multiple C:s, their original seg is saved

            p2 && (pcoms2[i] = "A"); // the same as above

            pp.splice(i++, 0, ["C"].concat(pi.splice(0, 6)));
          }

          pp.splice(i, 1);
          ii = mmax(p.length, p2 && p2.length || 0);
        }
      },
          fixM = function (path1, path2, a1, a2, i) {
        if (path1 && path2 && path1[i][0] == "M" && path2[i][0] != "M") {
          path2.splice(i, 0, ["M", a2.x, a2.y]);
          a1.bx = 0;
          a1.by = 0;
          a1.x = path1[i][1];
          a1.y = path1[i][2];
          ii = mmax(p.length, p2 && p2.length || 0);
        }
      },
          pcoms1 = [],
          // path commands of original path p
      pcoms2 = [],
          // path commands of original path p2
      pfirst = "",
          // temporary holder for original path command
      pcom = ""; // holder for previous path command of original path


      for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
        p[i] && (pfirst = p[i][0]); // save current path command

        if (pfirst != "C") // C is not saved yet, because it may be result of conversion
          {
            pcoms1[i] = pfirst; // Save current path command

            i && (pcom = pcoms1[i - 1]); // Get previous path command pcom
          }

        p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath

        if (pcoms1[i] != "A" && pfirst == "C") pcoms1[i] = "C"; // A is the only command
        // which may produce multiple C:s
        // so we have to make sure that C is also C in original path

        fixArc(p, i); // fixArc adds also the right amount of A:s to pcoms1

        if (p2) {
          // the same procedures is done to p2
          p2[i] && (pfirst = p2[i][0]);

          if (pfirst != "C") {
            pcoms2[i] = pfirst;
            i && (pcom = pcoms2[i - 1]);
          }

          p2[i] = processPath(p2[i], attrs2, pcom);

          if (pcoms2[i] != "A" && pfirst == "C") {
            pcoms2[i] = "C";
          }

          fixArc(p2, i);
        }

        fixM(p, p2, attrs, attrs2, i);
        fixM(p2, p, attrs2, attrs, i);
        var seg = p[i],
            seg2 = p2 && p2[i],
            seglen = seg.length,
            seg2len = p2 && seg2.length;
        attrs.x = seg[seglen - 2];
        attrs.y = seg[seglen - 1];
        attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
        attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
        attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
        attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
        attrs2.x = p2 && seg2[seg2len - 2];
        attrs2.y = p2 && seg2[seg2len - 1];
      }

      if (!p2) {
        pth.curve = pathClone(p);
      }

      return p2 ? [p, p2] : p;
    }

    function mapPath(path, matrix) {
      if (!matrix) {
        return path;
      }

      var x, y, i, j, ii, jj, pathi;
      path = path2curve(path);

      for (i = 0, ii = path.length; i < ii; i++) {
        pathi = path[i];

        for (j = 1, jj = pathi.length; j < jj; j += 2) {
          x = matrix.x(pathi[j], pathi[j + 1]);
          y = matrix.y(pathi[j], pathi[j + 1]);
          pathi[j] = x;
          pathi[j + 1] = y;
        }
      }

      return path;
    } // http://schepers.cc/getting-to-the-point


    function catmullRom2bezier(crp, z) {
      var d = [];

      for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
        var p = [{
          x: +crp[i - 2],
          y: +crp[i - 1]
        }, {
          x: +crp[i],
          y: +crp[i + 1]
        }, {
          x: +crp[i + 2],
          y: +crp[i + 3]
        }, {
          x: +crp[i + 4],
          y: +crp[i + 5]
        }];

        if (z) {
          if (!i) {
            p[0] = {
              x: +crp[iLen - 2],
              y: +crp[iLen - 1]
            };
          } else if (iLen - 4 == i) {
            p[3] = {
              x: +crp[0],
              y: +crp[1]
            };
          } else if (iLen - 2 == i) {
            p[2] = {
              x: +crp[0],
              y: +crp[1]
            };
            p[3] = {
              x: +crp[2],
              y: +crp[3]
            };
          }
        } else {
          if (iLen - 4 == i) {
            p[3] = p[2];
          } else if (!i) {
            p[0] = {
              x: +crp[i],
              y: +crp[i + 1]
            };
          }
        }

        d.push(["C", (-p[0].x + 6 * p[1].x + p[2].x) / 6, (-p[0].y + 6 * p[1].y + p[2].y) / 6, (p[1].x + 6 * p[2].x - p[3].x) / 6, (p[1].y + 6 * p[2].y - p[3].y) / 6, p[2].x, p[2].y]);
      }

      return d;
    } // export


    Snap.path = paths;
    /*\
     * Snap.path.getTotalLength
     [ method ]
     **
     * Returns the length of the given path in pixels
     **
     - path (string) SVG path string
     **
     = (number) length
    \*/

    Snap.path.getTotalLength = getTotalLength;
    /*\
     * Snap.path.getPointAtLength
     [ method ]
     **
     * Returns the coordinates of the point located at the given length along the given path
     **
     - path (string) SVG path string
     - length (number) length, in pixels, from the start of the path, excluding non-rendering jumps
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate,
     o     y: (number) y coordinate,
     o     alpha: (number) angle of derivative
     o }
    \*/

    Snap.path.getPointAtLength = getPointAtLength;
    /*\
     * Snap.path.getSubpath
     [ method ]
     **
     * Returns the subpath of a given path between given start and end lengths
     **
     - path (string) SVG path string
     - from (number) length, in pixels, from the start of the path to the start of the segment
     - to (number) length, in pixels, from the start of the path to the end of the segment
     **
     = (string) path string definition for the segment
    \*/

    Snap.path.getSubpath = function (path, from, to) {
      if (this.getTotalLength(path) - to < 1e-6) {
        return getSubpathsAtLength(path, from).end;
      }

      var a = getSubpathsAtLength(path, to, 1);
      return from ? getSubpathsAtLength(a, from).end : a;
    };
    /*\
     * Element.getTotalLength
     [ method ]
     **
     * Returns the length of the path in pixels (only works for `path` elements)
     = (number) length
    \*/


    elproto.getTotalLength = function () {
      if (this.node.getTotalLength) {
        return this.node.getTotalLength();
      }
    }; // SIERRA Element.getPointAtLength()/Element.getTotalLength(): If a <path> is broken into different segments, is the jump distance to the new coordinates set by the _M_ or _m_ commands calculated as part of the path's total length?

    /*\
     * Element.getPointAtLength
     [ method ]
     **
     * Returns coordinates of the point located at the given length on the given path (only works for `path` elements)
     **
     - length (number) length, in pixels, from the start of the path, excluding non-rendering jumps
     **
     = (object) representation of the point:
     o {
     o     x: (number) x coordinate,
     o     y: (number) y coordinate,
     o     alpha: (number) angle of derivative
     o }
    \*/


    elproto.getPointAtLength = function (length) {
      return getPointAtLength(this.attr("d"), length);
    }; // SIERRA Element.getSubpath(): Similar to the problem for Element.getPointAtLength(). Unclear how this would work for a segmented path. Overall, the concept of _subpath_ and what I'm calling a _segment_ (series of non-_M_ or _Z_ commands) is unclear.

    /*\
     * Element.getSubpath
     [ method ]
     **
     * Returns subpath of a given element from given start and end lengths (only works for `path` elements)
     **
     - from (number) length, in pixels, from the start of the path to the start of the segment
     - to (number) length, in pixels, from the start of the path to the end of the segment
     **
     = (string) path string definition for the segment
    \*/


    elproto.getSubpath = function (from, to) {
      return Snap.path.getSubpath(this.attr("d"), from, to);
    };

    Snap._.box = box;
    /*\
     * Snap.path.findDotsAtSegment
     [ method ]
     **
     * Utility method
     **
     * Finds dot coordinates on the given cubic beziér curve at the given t
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     - t (number) position on the curve (0..1)
     = (object) point information in format:
     o {
     o     x: (number) x coordinate of the point,
     o     y: (number) y coordinate of the point,
     o     m: {
     o         x: (number) x coordinate of the left anchor,
     o         y: (number) y coordinate of the left anchor
     o     },
     o     n: {
     o         x: (number) x coordinate of the right anchor,
     o         y: (number) y coordinate of the right anchor
     o     },
     o     start: {
     o         x: (number) x coordinate of the start of the curve,
     o         y: (number) y coordinate of the start of the curve
     o     },
     o     end: {
     o         x: (number) x coordinate of the end of the curve,
     o         y: (number) y coordinate of the end of the curve
     o     },
     o     alpha: (number) angle of the curve derivative at the point
     o }
    \*/

    Snap.path.findDotsAtSegment = findDotsAtSegment;
    /*\
     * Snap.path.bezierBBox
     [ method ]
     **
     * Utility method
     **
     * Returns the bounding box of a given cubic beziér curve
     - p1x (number) x of the first point of the curve
     - p1y (number) y of the first point of the curve
     - c1x (number) x of the first anchor of the curve
     - c1y (number) y of the first anchor of the curve
     - c2x (number) x of the second anchor of the curve
     - c2y (number) y of the second anchor of the curve
     - p2x (number) x of the second point of the curve
     - p2y (number) y of the second point of the curve
     * or
     - bez (array) array of six points for beziér curve
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box,
     o     y: (number) y coordinate of the left top point of the box,
     o     x2: (number) x coordinate of the right bottom point of the box,
     o     y2: (number) y coordinate of the right bottom point of the box,
     o     width: (number) width of the box,
     o     height: (number) height of the box
     o }
    \*/

    Snap.path.bezierBBox = bezierBBox;
    /*\
     * Snap.path.isPointInsideBBox
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside bounding box
     - bbox (string) bounding box
     - x (string) x coordinate of the point
     - y (string) y coordinate of the point
     = (boolean) `true` if point is inside
    \*/

    Snap.path.isPointInsideBBox = isPointInsideBBox;

    Snap.closest = function (x, y, X, Y) {
      var r = 100,
          b = box(x - r / 2, y - r / 2, r, r),
          inside = [],
          getter = X[0].hasOwnProperty("x") ? function (i) {
        return {
          x: X[i].x,
          y: X[i].y
        };
      } : function (i) {
        return {
          x: X[i],
          y: Y[i]
        };
      },
          found = 0;

      while (r <= 1e6 && !found) {
        for (var i = 0, ii = X.length; i < ii; i++) {
          var xy = getter(i);

          if (isPointInsideBBox(b, xy.x, xy.y)) {
            found++;
            inside.push(xy);
            break;
          }
        }

        if (!found) {
          r *= 2;
          b = box(x - r / 2, y - r / 2, r, r);
        }
      }

      if (r == 1e6) {
        return;
      }

      var len = Infinity,
          res;

      for (i = 0, ii = inside.length; i < ii; i++) {
        var l = Snap.len(x, y, inside[i].x, inside[i].y);

        if (len > l) {
          len = l;
          inside[i].len = l;
          res = inside[i];
        }
      }

      return res;
    };
    /*\
     * Snap.path.isBBoxIntersect
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if two bounding boxes intersect
     - bbox1 (string) first bounding box
     - bbox2 (string) second bounding box
     = (boolean) `true` if bounding boxes intersect
    \*/


    Snap.path.isBBoxIntersect = isBBoxIntersect;
    /*\
     * Snap.path.intersection
     [ method ]
     **
     * Utility method
     **
     * Finds intersections of two paths
     - path1 (string) path string
     - path2 (string) path string
     = (array) dots of intersection
     o [
     o     {
     o         x: (number) x coordinate of the point,
     o         y: (number) y coordinate of the point,
     o         t1: (number) t value for segment of path1,
     o         t2: (number) t value for segment of path2,
     o         segment1: (number) order number for segment of path1,
     o         segment2: (number) order number for segment of path2,
     o         bez1: (array) eight coordinates representing beziér curve for the segment of path1,
     o         bez2: (array) eight coordinates representing beziér curve for the segment of path2
     o     }
     o ]
    \*/

    Snap.path.intersection = pathIntersection;
    Snap.path.intersectionNumber = pathIntersectionNumber;
    /*\
     * Snap.path.isPointInside
     [ method ]
     **
     * Utility method
     **
     * Returns `true` if given point is inside a given closed path.
     *
     * Note: fill mode doesn’t affect the result of this method.
     - path (string) path string
     - x (number) x of the point
     - y (number) y of the point
     = (boolean) `true` if point is inside the path
    \*/

    Snap.path.isPointInside = isPointInsidePath;
    /*\
     * Snap.path.getBBox
     [ method ]
     **
     * Utility method
     **
     * Returns the bounding box of a given path
     - path (string) path string
     = (object) bounding box
     o {
     o     x: (number) x coordinate of the left top point of the box,
     o     y: (number) y coordinate of the left top point of the box,
     o     x2: (number) x coordinate of the right bottom point of the box,
     o     y2: (number) y coordinate of the right bottom point of the box,
     o     width: (number) width of the box,
     o     height: (number) height of the box
     o }
    \*/

    Snap.path.getBBox = pathBBox;
    Snap.path.get = getPath;
    /*\
     * Snap.path.toRelative
     [ method ]
     **
     * Utility method
     **
     * Converts path coordinates into relative values
     - path (string) path string
     = (array) path string
    \*/

    Snap.path.toRelative = pathToRelative;
    /*\
     * Snap.path.toAbsolute
     [ method ]
     **
     * Utility method
     **
     * Converts path coordinates into absolute values
     - path (string) path string
     = (array) path string
    \*/

    Snap.path.toAbsolute = pathToAbsolute;
    /*\
     * Snap.path.toCubic
     [ method ]
     **
     * Utility method
     **
     * Converts path to a new path where all segments are cubic beziér curves
     - pathString (string|array) path string or array of segments
     = (array) array of segments
    \*/

    Snap.path.toCubic = path2curve;
    /*\
     * Snap.path.map
     [ method ]
     **
     * Transform the path string with the given matrix
     - path (string) path string
     - matrix (object) see @Matrix
     = (string) transformed path string
    \*/

    Snap.path.map = mapPath;
    Snap.path.toString = toString;
    Snap.path.clone = pathClone;
  }); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob) {
    var mmax = Math.max,
        mmin = Math.min; // Set

    var Set = function (items) {
      this.items = [];
      this.bindings = {};
      this.length = 0;
      this.type = "set";

      if (items) {
        for (var i = 0, ii = items.length; i < ii; i++) {
          if (items[i]) {
            this[this.items.length] = this.items[this.items.length] = items[i];
            this.length++;
          }
        }
      }
    },
        setproto = Set.prototype;
    /*\
     * Set.push
     [ method ]
     **
     * Adds each argument to the current set
     = (object) original element
    \*/


    setproto.push = function () {
      var item, len;

      for (var i = 0, ii = arguments.length; i < ii; i++) {
        item = arguments[i];

        if (item) {
          len = this.items.length;
          this[len] = this.items[len] = item;
          this.length++;
        }
      }

      return this;
    };
    /*\
     * Set.pop
     [ method ]
     **
     * Removes last element and returns it
     = (object) element
    \*/


    setproto.pop = function () {
      this.length && delete this[this.length--];
      return this.items.pop();
    };
    /*\
     * Set.forEach
     [ method ]
     **
     * Executes given function for each element in the set
     *
     * If the function returns `false`, the loop stops running.
     **
     - callback (function) function to run
     - thisArg (object) context object for the callback
     = (object) Set object
    \*/


    setproto.forEach = function (callback, thisArg) {
      for (var i = 0, ii = this.items.length; i < ii; i++) {
        if (callback.call(thisArg, this.items[i], i) === false) {
          return this;
        }
      }

      return this;
    };
    /*\
     * Set.animate
     [ method ]
     **
     * Animates each element in set in sync.
     *
     **
     - attrs (object) key-value pairs of destination attributes
     - duration (number) duration of the animation in milliseconds
     - easing (function) #optional easing function from @mina or custom
     - callback (function) #optional callback function that executes when the animation ends
     * or
     - animation (array) array of animation parameter for each element in set in format `[attrs, duration, easing, callback]`
     > Usage
     | // animate all elements in set to radius 10
     | set.animate({r: 10}, 500, mina.easein);
     | // or
     | // animate first element to radius 10, but second to radius 20 and in different time
     | set.animate([{r: 10}, 500, mina.easein], [{r: 20}, 1500, mina.easein]);
     = (Element) the current element
    \*/


    setproto.animate = function (attrs, ms, easing, callback) {
      if (typeof easing == "function" && !easing.length) {
        callback = easing;
        easing = mina.linear;
      }

      if (attrs instanceof Snap._.Animation) {
        callback = attrs.callback;
        easing = attrs.easing;
        ms = easing.dur;
        attrs = attrs.attr;
      }

      var args = arguments;

      if (Snap.is(attrs, "array") && Snap.is(args[args.length - 1], "array")) {
        var each = true;
      }

      var begin,
          handler = function () {
        if (begin) {
          this.b = begin;
        } else {
          begin = this.b;
        }
      },
          cb = 0,
          set = this,
          callbacker = callback && function () {
        if (++cb == set.length) {
          callback.call(this);
        }
      };

      return this.forEach(function (el, i) {
        eve.once("snap.animcreated." + el.id, handler);

        if (each) {
          args[i] && el.animate.apply(el, args[i]);
        } else {
          el.animate(attrs, ms, easing, callbacker);
        }
      });
    };
    /*\
     * Set.remove
     [ method ]
     **
     * Removes all children of the set.
     *
     = (object) Set object
    \*/


    setproto.remove = function () {
      while (this.length) {
        this.pop().remove();
      }

      return this;
    };
    /*\
     * Set.bind
     [ method ]
     **
     * Specifies how to handle a specific attribute when applied
     * to a set.
     *
     **
     - attr (string) attribute name
     - callback (function) function to run
     * or
     - attr (string) attribute name
     - element (Element) specific element in the set to apply the attribute to
     * or
     - attr (string) attribute name
     - element (Element) specific element in the set to apply the attribute to
     - eattr (string) attribute on the element to bind the attribute to
     = (object) Set object
    \*/


    setproto.bind = function (attr, a, b) {
      var data = {};

      if (typeof a == "function") {
        this.bindings[attr] = a;
      } else {
        var aname = b || attr;

        this.bindings[attr] = function (v) {
          data[aname] = v;
          a.attr(data);
        };
      }

      return this;
    };
    /*\
     * Set.attr
     [ method ]
     **
     * Equivalent of @Element.attr.
     = (object) Set object
    \*/


    setproto.attr = function (value) {
      var unbound = {};

      for (var k in value) {
        if (this.bindings[k]) {
          this.bindings[k](value[k]);
        } else {
          unbound[k] = value[k];
        }
      }

      for (var i = 0, ii = this.items.length; i < ii; i++) {
        this.items[i].attr(unbound);
      }

      return this;
    };
    /*\
     * Set.clear
     [ method ]
     **
     * Removes all elements from the set
    \*/


    setproto.clear = function () {
      while (this.length) {
        this.pop();
      }
    };
    /*\
     * Set.splice
     [ method ]
     **
     * Removes range of elements from the set
     **
     - index (number) position of the deletion
     - count (number) number of element to remove
     - insertion… (object) #optional elements to insert
     = (object) set elements that were deleted
    \*/


    setproto.splice = function (index, count, insertion) {
      index = index < 0 ? mmax(this.length + index, 0) : index;
      count = mmax(0, mmin(this.length - index, count));
      var tail = [],
          todel = [],
          args = [],
          i;

      for (i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
      }

      for (i = 0; i < count; i++) {
        todel.push(this[index + i]);
      }

      for (; i < this.length - index; i++) {
        tail.push(this[index + i]);
      }

      var arglen = args.length;

      for (i = 0; i < arglen + tail.length; i++) {
        this.items[index + i] = this[index + i] = i < arglen ? args[i] : tail[i - arglen];
      }

      i = this.items.length = this.length -= count - arglen;

      while (this[i]) {
        delete this[i++];
      }

      return new Set(todel);
    };
    /*\
     * Set.exclude
     [ method ]
     **
     * Removes given element from the set
     **
     - element (object) element to remove
     = (boolean) `true` if object was found and removed from the set
    \*/


    setproto.exclude = function (el) {
      for (var i = 0, ii = this.length; i < ii; i++) if (this[i] == el) {
        this.splice(i, 1);
        return true;
      }

      return false;
    };
    /*\
     * Set.insertAfter
     [ method ]
     **
     * Inserts set elements after given element.
     **
     - element (object) set will be inserted after this element
     = (object) Set object
    \*/


    setproto.insertAfter = function (el) {
      var i = this.items.length;

      while (i--) {
        this.items[i].insertAfter(el);
      }

      return this;
    };
    /*\
     * Set.getBBox
     [ method ]
     **
     * Union of all bboxes of the set. See @Element.getBBox.
     = (object) bounding box descriptor. See @Element.getBBox.
    \*/


    setproto.getBBox = function () {
      var x = [],
          y = [],
          x2 = [],
          y2 = [];

      for (var i = this.items.length; i--;) if (!this.items[i].removed) {
        var box = this.items[i].getBBox();
        x.push(box.x);
        y.push(box.y);
        x2.push(box.x + box.width);
        y2.push(box.y + box.height);
      }

      x = mmin.apply(0, x);
      y = mmin.apply(0, y);
      x2 = mmax.apply(0, x2);
      y2 = mmax.apply(0, y2);
      return {
        x: x,
        y: y,
        x2: x2,
        y2: y2,
        width: x2 - x,
        height: y2 - y,
        cx: x + (x2 - x) / 2,
        cy: y + (y2 - y) / 2
      };
    };
    /*\
     * Set.insertAfter
     [ method ]
     **
     * Creates a clone of the set.
     **
     = (object) New Set object
    \*/


    setproto.clone = function (s) {
      s = new Set();

      for (var i = 0, ii = this.items.length; i < ii; i++) {
        s.push(this.items[i].clone());
      }

      return s;
    };

    setproto.toString = function () {
      return "Snap\u2018s set";
    };

    setproto.type = "set"; // export

    /*\
     * Snap.Set
     [ property ]
     **
     * Set constructor.
    \*/

    Snap.Set = Set;
    /*\
     * Snap.set
     [ method ]
     **
     * Creates a set and fills it with list of arguments.
     **
     = (object) New Set object
     | var r = paper.rect(0, 0, 10, 10),
     |     s1 = Snap.set(), // empty set
     |     s2 = Snap.set(r, paper.circle(100, 100, 20)); // prefilled set
    \*/

    Snap.set = function () {
      var set = new Set();

      if (arguments.length) {
        set.push.apply(set, Array.prototype.slice.call(arguments, 0));
      }

      return set;
    };
  }); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob) {
    var names = {},
        reUnit = /[%a-z]+$/i,
        Str = String;
    names.stroke = names.fill = "colour";

    function getEmpty(item) {
      var l = item[0];

      switch (l.toLowerCase()) {
        case "t":
          return [l, 0, 0];

        case "m":
          return [l, 1, 0, 0, 1, 0, 0];

        case "r":
          if (item.length == 4) {
            return [l, 0, item[2], item[3]];
          } else {
            return [l, 0];
          }

        case "s":
          if (item.length == 5) {
            return [l, 1, 1, item[3], item[4]];
          } else if (item.length == 3) {
            return [l, 1, 1];
          } else {
            return [l, 1];
          }

      }
    }

    function equaliseTransform(t1, t2, getBBox) {
      t1 = t1 || new Snap.Matrix();
      t2 = t2 || new Snap.Matrix();
      t1 = Snap.parseTransformString(t1.toTransformString()) || [];
      t2 = Snap.parseTransformString(t2.toTransformString()) || [];
      var maxlength = Math.max(t1.length, t2.length),
          from = [],
          to = [],
          i = 0,
          j,
          jj,
          tt1,
          tt2;

      for (; i < maxlength; i++) {
        tt1 = t1[i] || getEmpty(t2[i]);
        tt2 = t2[i] || getEmpty(tt1);

        if (tt1[0] != tt2[0] || tt1[0].toLowerCase() == "r" && (tt1[2] != tt2[2] || tt1[3] != tt2[3]) || tt1[0].toLowerCase() == "s" && (tt1[3] != tt2[3] || tt1[4] != tt2[4])) {
          t1 = Snap._.transform2matrix(t1, getBBox());
          t2 = Snap._.transform2matrix(t2, getBBox());
          from = [["m", t1.a, t1.b, t1.c, t1.d, t1.e, t1.f]];
          to = [["m", t2.a, t2.b, t2.c, t2.d, t2.e, t2.f]];
          break;
        }

        from[i] = [];
        to[i] = [];

        for (j = 0, jj = Math.max(tt1.length, tt2.length); j < jj; j++) {
          j in tt1 && (from[i][j] = tt1[j]);
          j in tt2 && (to[i][j] = tt2[j]);
        }
      }

      return {
        from: path2array(from),
        to: path2array(to),
        f: getPath(from)
      };
    }

    function getNumber(val) {
      return val;
    }

    function getUnit(unit) {
      return function (val) {
        return +val.toFixed(3) + unit;
      };
    }

    function getViewBox(val) {
      return val.join(" ");
    }

    function getColour(clr) {
      return Snap.rgb(clr[0], clr[1], clr[2], clr[3]);
    }

    function getPath(path) {
      var k = 0,
          i,
          ii,
          j,
          jj,
          out,
          a,
          b = [];

      for (i = 0, ii = path.length; i < ii; i++) {
        out = "[";
        a = ['"' + path[i][0] + '"'];

        for (j = 1, jj = path[i].length; j < jj; j++) {
          a[j] = "val[" + k++ + "]";
        }

        out += a + "]";
        b[i] = out;
      }

      return Function("val", "return Snap.path.toString.call([" + b + "])");
    }

    function path2array(path) {
      var out = [];

      for (var i = 0, ii = path.length; i < ii; i++) {
        for (var j = 1, jj = path[i].length; j < jj; j++) {
          out.push(path[i][j]);
        }
      }

      return out;
    }

    function isNumeric(obj) {
      return isFinite(obj);
    }

    function arrayEqual(arr1, arr2) {
      if (!Snap.is(arr1, "array") || !Snap.is(arr2, "array")) {
        return false;
      }

      return arr1.toString() == arr2.toString();
    }

    Element.prototype.equal = function (name, b) {
      return eve("snap.util.equal", this, name, b).firstDefined();
    };

    eve.on("snap.util.equal", function (name, b) {
      var A,
          B,
          a = Str(this.attr(name) || ""),
          el = this;

      if (names[name] == "colour") {
        A = Snap.color(a);
        B = Snap.color(b);
        return {
          from: [A.r, A.g, A.b, A.opacity],
          to: [B.r, B.g, B.b, B.opacity],
          f: getColour
        };
      }

      if (name == "viewBox") {
        A = this.attr(name).vb.split(" ").map(Number);
        B = b.split(" ").map(Number);
        return {
          from: A,
          to: B,
          f: getViewBox
        };
      }

      if (name == "transform" || name == "gradientTransform" || name == "patternTransform") {
        if (typeof b == "string") {
          b = Str(b).replace(/\.{3}|\u2026/g, a);
        }

        a = this.matrix;

        if (!Snap._.rgTransform.test(b)) {
          b = Snap._.transform2matrix(Snap._.svgTransform2string(b), this.getBBox());
        } else {
          b = Snap._.transform2matrix(b, this.getBBox());
        }

        return equaliseTransform(a, b, function () {
          return el.getBBox(1);
        });
      }

      if (name == "d" || name == "path") {
        A = Snap.path.toCubic(a, b);
        return {
          from: path2array(A[0]),
          to: path2array(A[1]),
          f: getPath(A[0])
        };
      }

      if (name == "points") {
        A = Str(a).split(Snap._.separator);
        B = Str(b).split(Snap._.separator);
        return {
          from: A,
          to: B,
          f: function (val) {
            return val;
          }
        };
      }

      if (isNumeric(a) && isNumeric(b)) {
        return {
          from: parseFloat(a),
          to: parseFloat(b),
          f: getNumber
        };
      }

      var aUnit = a.match(reUnit),
          bUnit = Str(b).match(reUnit);

      if (aUnit && arrayEqual(aUnit, bUnit)) {
        return {
          from: parseFloat(a),
          to: parseFloat(b),
          f: getUnit(aUnit)
        };
      } else {
        return {
          from: this.asPX(name),
          to: this.asPX(name, b),
          f: getNumber
        };
      }
    });
  }); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  // 
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  // 
  // http://www.apache.org/licenses/LICENSE-2.0
  // 
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob) {
    var elproto = Element.prototype,
        has = "hasOwnProperty",
        supportsTouch = "createTouch" in glob.doc,
        events = ["click", "dblclick", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "touchstart", "touchmove", "touchend", "touchcancel"],
        touchMap = {
      mousedown: "touchstart",
      mousemove: "touchmove",
      mouseup: "touchend"
    },
        getScroll = function (xy, el) {
      var name = xy == "y" ? "scrollTop" : "scrollLeft",
          doc = el && el.node ? el.node.ownerDocument : glob.doc;
      return doc[name in doc.documentElement ? "documentElement" : "body"][name];
    },
        preventDefault = function () {
      this.returnValue = false;
    },
        preventTouch = function () {
      return this.originalEvent.preventDefault();
    },
        stopPropagation = function () {
      this.cancelBubble = true;
    },
        stopTouch = function () {
      return this.originalEvent.stopPropagation();
    },
        addEvent = function (obj, type, fn, element) {
      var realName = supportsTouch && touchMap[type] ? touchMap[type] : type,
          f = function (e) {
        var scrollY = getScroll("y", element),
            scrollX = getScroll("x", element);

        if (supportsTouch && touchMap[has](type)) {
          for (var i = 0, ii = e.targetTouches && e.targetTouches.length; i < ii; i++) {
            if (e.targetTouches[i].target == obj || obj.contains(e.targetTouches[i].target)) {
              var olde = e;
              e = e.targetTouches[i];
              e.originalEvent = olde;
              e.preventDefault = preventTouch;
              e.stopPropagation = stopTouch;
              break;
            }
          }
        }

        var x = e.clientX + scrollX,
            y = e.clientY + scrollY;
        return fn.call(element, e, x, y);
      };

      if (type !== realName) {
        obj.addEventListener(type, f, false);
      }

      obj.addEventListener(realName, f, false);
      return function () {
        if (type !== realName) {
          obj.removeEventListener(type, f, false);
        }

        obj.removeEventListener(realName, f, false);
        return true;
      };
    },
        drag = [],
        dragMove = function (e) {
      var x = e.clientX,
          y = e.clientY,
          scrollY = getScroll("y"),
          scrollX = getScroll("x"),
          dragi,
          j = drag.length;

      while (j--) {
        dragi = drag[j];

        if (supportsTouch) {
          var i = e.touches && e.touches.length,
              touch;

          while (i--) {
            touch = e.touches[i];

            if (touch.identifier == dragi.el._drag.id || dragi.el.node.contains(touch.target)) {
              x = touch.clientX;
              y = touch.clientY;
              (e.originalEvent ? e.originalEvent : e).preventDefault();
              break;
            }
          }
        } else {
          e.preventDefault();
        }

        var node = dragi.el.node,
            o,
            next = node.nextSibling,
            parent = node.parentNode,
            display = node.style.display; // glob.win.opera && parent.removeChild(node);
        // node.style.display = "none";
        // o = dragi.el.paper.getElementByPoint(x, y);
        // node.style.display = display;
        // glob.win.opera && (next ? parent.insertBefore(node, next) : parent.appendChild(node));
        // o && eve("snap.drag.over." + dragi.el.id, dragi.el, o);

        x += scrollX;
        y += scrollY;
        eve("snap.drag.move." + dragi.el.id, dragi.move_scope || dragi.el, x - dragi.el._drag.x, y - dragi.el._drag.y, x, y, e);
      }
    },
        dragUp = function (e) {
      Snap.unmousemove(dragMove).unmouseup(dragUp);
      var i = drag.length,
          dragi;

      while (i--) {
        dragi = drag[i];
        dragi.el._drag = {};
        eve("snap.drag.end." + dragi.el.id, dragi.end_scope || dragi.start_scope || dragi.move_scope || dragi.el, e);
        eve.off("snap.drag.*." + dragi.el.id);
      }

      drag = [];
    };
    /*\
     * Element.click
     [ method ]
     **
     * Adds a click event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.unclick
     [ method ]
     **
     * Removes a click event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.dblclick
     [ method ]
     **
     * Adds a double click event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.undblclick
     [ method ]
     **
     * Removes a double click event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousedown
     [ method ]
     **
     * Adds a mousedown event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.unmousedown
     [ method ]
     **
     * Removes a mousedown event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mousemove
     [ method ]
     **
     * Adds a mousemove event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.unmousemove
     [ method ]
     **
     * Removes a mousemove event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseout
     [ method ]
     **
     * Adds a mouseout event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.unmouseout
     [ method ]
     **
     * Removes a mouseout event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseover
     [ method ]
     **
     * Adds a mouseover event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.unmouseover
     [ method ]
     **
     * Removes a mouseover event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.mouseup
     [ method ]
     **
     * Adds a mouseup event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.unmouseup
     [ method ]
     **
     * Removes a mouseup event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchstart
     [ method ]
     **
     * Adds a touchstart event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.untouchstart
     [ method ]
     **
     * Removes a touchstart event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchmove
     [ method ]
     **
     * Adds a touchmove event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.untouchmove
     [ method ]
     **
     * Removes a touchmove event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchend
     [ method ]
     **
     * Adds a touchend event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.untouchend
     [ method ]
     **
     * Removes a touchend event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.touchcancel
     [ method ]
     **
     * Adds a touchcancel event handler to the element
     - handler (function) handler for the event
     = (object) @Element
    \*/

    /*\
     * Element.untouchcancel
     [ method ]
     **
     * Removes a touchcancel event handler from the element
     - handler (function) handler for the event
     = (object) @Element
    \*/


    for (var i = events.length; i--;) {
      (function (eventName) {
        Snap[eventName] = elproto[eventName] = function (fn, scope) {
          if (Snap.is(fn, "function")) {
            this.events = this.events || [];
            this.events.push({
              name: eventName,
              f: fn,
              unbind: addEvent(this.node || document, eventName, fn, scope || this)
            });
          } else {
            for (var i = 0, ii = this.events.length; i < ii; i++) if (this.events[i].name == eventName) {
              try {
                this.events[i].f.call(this);
              } catch (e) {}
            }
          }

          return this;
        };

        Snap["un" + eventName] = elproto["un" + eventName] = function (fn) {
          var events = this.events || [],
              l = events.length;

          while (l--) if (events[l].name == eventName && (events[l].f == fn || !fn)) {
            events[l].unbind();
            events.splice(l, 1);
            !events.length && delete this.events;
            return this;
          }

          return this;
        };
      })(events[i]);
    }
    /*\
     * Element.hover
     [ method ]
     **
     * Adds hover event handlers to the element
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     - icontext (object) #optional context for hover in handler
     - ocontext (object) #optional context for hover out handler
     = (object) @Element
    \*/


    elproto.hover = function (f_in, f_out, scope_in, scope_out) {
      return this.mouseover(f_in, scope_in).mouseout(f_out, scope_out || scope_in);
    };
    /*\
     * Element.unhover
     [ method ]
     **
     * Removes hover event handlers from the element
     - f_in (function) handler for hover in
     - f_out (function) handler for hover out
     = (object) @Element
    \*/


    elproto.unhover = function (f_in, f_out) {
      return this.unmouseover(f_in).unmouseout(f_out);
    };

    var draggable = []; // SIERRA unclear what _context_ refers to for starting, ending, moving the drag gesture.
    // SIERRA Element.drag(): _x position of the mouse_: Where are the x/y values offset from?
    // SIERRA Element.drag(): much of this member's doc appears to be duplicated for some reason.
    // SIERRA Unclear about this sentence: _Additionally following drag events will be triggered: drag.start.<id> on start, drag.end.<id> on end and drag.move.<id> on every move._ Is there a global _drag_ object to which you can assign handlers keyed by an element's ID?

    /*\
     * Element.drag
     [ method ]
     **
     * Adds event handlers for an element's drag gesture
     **
     - onmove (function) handler for moving
     - onstart (function) handler for drag start
     - onend (function) handler for drag end
     - mcontext (object) #optional context for moving handler
     - scontext (object) #optional context for drag start handler
     - econtext (object) #optional context for drag end handler
     * Additionaly following `drag` events are triggered: `drag.start.<id>` on start, 
     * `drag.end.<id>` on end and `drag.move.<id>` on every move. When element is dragged over another element 
     * `drag.over.<id>` fires as well.
     *
     * Start event and start handler are called in specified context or in context of the element with following parameters:
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * Move event and move handler are called in specified context or in context of the element with following parameters:
     o dx (number) shift by x from the start point
     o dy (number) shift by y from the start point
     o x (number) x position of the mouse
     o y (number) y position of the mouse
     o event (object) DOM event object
     * End event and end handler are called in specified context or in context of the element with following parameters:
     o event (object) DOM event object
     = (object) @Element
    \*/

    elproto.drag = function (onmove, onstart, onend, move_scope, start_scope, end_scope) {
      var el = this;

      if (!arguments.length) {
        var origTransform;
        return el.drag(function (dx, dy) {
          this.attr({
            transform: origTransform + (origTransform ? "T" : "t") + [dx, dy]
          });
        }, function () {
          origTransform = this.transform().local;
        });
      }

      function start(e, x, y) {
        (e.originalEvent || e).preventDefault();
        el._drag.x = x;
        el._drag.y = y;
        el._drag.id = e.identifier;
        !drag.length && Snap.mousemove(dragMove).mouseup(dragUp);
        drag.push({
          el: el,
          move_scope: move_scope,
          start_scope: start_scope,
          end_scope: end_scope
        });
        onstart && eve.on("snap.drag.start." + el.id, onstart);
        onmove && eve.on("snap.drag.move." + el.id, onmove);
        onend && eve.on("snap.drag.end." + el.id, onend);
        eve("snap.drag.start." + el.id, start_scope || move_scope || el, x, y, e);
      }

      function init(e, x, y) {
        eve("snap.draginit." + el.id, el, e, x, y);
      }

      eve.on("snap.draginit." + el.id, start);
      el._drag = {};
      draggable.push({
        el: el,
        start: start,
        init: init
      });
      el.mousedown(init);
      return el;
    };
    /*
     * Element.onDragOver
     [ method ]
     **
     * Shortcut to assign event handler for `drag.over.<id>` event, where `id` is the element's `id` (see @Element.id)
     - f (function) handler for event, first argument would be the element you are dragging over
    \*/
    // elproto.onDragOver = function (f) {
    //     f ? eve.on("snap.drag.over." + this.id, f) : eve.unbind("snap.drag.over." + this.id);
    // };

    /*\
     * Element.undrag
     [ method ]
     **
     * Removes all drag event handlers from the given element
    \*/


    elproto.undrag = function () {
      var i = draggable.length;

      while (i--) if (draggable[i].el == this) {
        this.unmousedown(draggable[i].init);
        draggable.splice(i, 1);
        eve.unbind("snap.drag.*." + this.id);
        eve.unbind("snap.draginit." + this.id);
      }

      !draggable.length && Snap.unmousemove(dragMove).unmouseup(dragUp);
      return this;
    };
  }); // Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob) {
    var elproto = Element.prototype,
        pproto = Paper.prototype,
        rgurl = /^\s*url\((.+)\)/,
        Str = String,
        $ = Snap._.$;
    Snap.filter = {};
    /*\
     * Paper.filter
     [ method ]
     **
     * Creates a `<filter>` element
     **
     - filstr (string) SVG fragment of filter provided as a string
     = (object) @Element
     * Note: It is recommended to use filters embedded into the page inside an empty SVG element.
     > Usage
     | var f = paper.filter('<feGaussianBlur stdDeviation="2"/>'),
     |     c = paper.circle(10, 10, 10).attr({
     |         filter: f
     |     });
    \*/

    pproto.filter = function (filstr) {
      var paper = this;

      if (paper.type != "svg") {
        paper = paper.paper;
      }

      var f = Snap.parse(Str(filstr)),
          id = Snap._.id(),
          width = paper.node.offsetWidth,
          height = paper.node.offsetHeight,
          filter = $("filter");

      $(filter, {
        id: id,
        filterUnits: "userSpaceOnUse"
      });
      filter.appendChild(f.node);
      paper.defs.appendChild(filter);
      return new Element(filter);
    };

    eve.on("snap.util.getattr.filter", function () {
      eve.stop();
      var p = $(this.node, "filter");

      if (p) {
        var match = Str(p).match(rgurl);
        return match && Snap.select(match[1]);
      }
    });
    eve.on("snap.util.attr.filter", function (value) {
      if (value instanceof Element && value.type == "filter") {
        eve.stop();
        var id = value.node.id;

        if (!id) {
          $(value.node, {
            id: value.id
          });
          id = value.id;
        }

        $(this.node, {
          filter: Snap.url(id)
        });
      }

      if (!value || value == "none") {
        eve.stop();
        this.node.removeAttribute("filter");
      }
    });
    /*\
     * Snap.filter.blur
     [ method ]
     **
     * Returns an SVG markup string for the blur filter
     **
     - x (number) amount of horizontal blur, in pixels
     - y (number) #optional amount of vertical blur, in pixels
     = (string) filter representation
     > Usage
     | var f = paper.filter(Snap.filter.blur(5, 10)),
     |     c = paper.circle(10, 10, 10).attr({
     |         filter: f
     |     });
    \*/

    Snap.filter.blur = function (x, y) {
      if (x == null) {
        x = 2;
      }

      var def = y == null ? x : [x, y];
      return Snap.format('\<feGaussianBlur stdDeviation="{def}"/>', {
        def: def
      });
    };

    Snap.filter.blur.toString = function () {
      return this();
    };
    /*\
     * Snap.filter.shadow
     [ method ]
     **
     * Returns an SVG markup string for the shadow filter
     **
     - dx (number) #optional horizontal shift of the shadow, in pixels
     - dy (number) #optional vertical shift of the shadow, in pixels
     - blur (number) #optional amount of blur
     - color (string) #optional color of the shadow
     - opacity (number) #optional `0..1` opacity of the shadow
     * or
     - dx (number) #optional horizontal shift of the shadow, in pixels
     - dy (number) #optional vertical shift of the shadow, in pixels
     - color (string) #optional color of the shadow
     - opacity (number) #optional `0..1` opacity of the shadow
     * which makes blur default to `4`. Or
     - dx (number) #optional horizontal shift of the shadow, in pixels
     - dy (number) #optional vertical shift of the shadow, in pixels
     - opacity (number) #optional `0..1` opacity of the shadow
     = (string) filter representation
     > Usage
     | var f = paper.filter(Snap.filter.shadow(0, 2, .3)),
     |     c = paper.circle(10, 10, 10).attr({
     |         filter: f
     |     });
    \*/


    Snap.filter.shadow = function (dx, dy, blur, color, opacity) {
      if (opacity == null) {
        if (color == null) {
          opacity = blur;
          blur = 4;
          color = "#000";
        } else {
          opacity = color;
          color = blur;
          blur = 4;
        }
      }

      if (blur == null) {
        blur = 4;
      }

      if (opacity == null) {
        opacity = 1;
      }

      if (dx == null) {
        dx = 0;
        dy = 2;
      }

      if (dy == null) {
        dy = dx;
      }

      color = Snap.color(color);
      return Snap.format('<feGaussianBlur in="SourceAlpha" stdDeviation="{blur}"/><feOffset dx="{dx}" dy="{dy}" result="offsetblur"/><feFlood flood-color="{color}"/><feComposite in2="offsetblur" operator="in"/><feComponentTransfer><feFuncA type="linear" slope="{opacity}"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>', {
        color: color,
        dx: dx,
        dy: dy,
        blur: blur,
        opacity: opacity
      });
    };

    Snap.filter.shadow.toString = function () {
      return this();
    };
    /*\
     * Snap.filter.grayscale
     [ method ]
     **
     * Returns an SVG markup string for the grayscale filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/


    Snap.filter.grayscale = function (amount) {
      if (amount == null) {
        amount = 1;
      }

      return Snap.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {b} {h} 0 0 0 0 0 1 0"/>', {
        a: 0.2126 + 0.7874 * (1 - amount),
        b: 0.7152 - 0.7152 * (1 - amount),
        c: 0.0722 - 0.0722 * (1 - amount),
        d: 0.2126 - 0.2126 * (1 - amount),
        e: 0.7152 + 0.2848 * (1 - amount),
        f: 0.0722 - 0.0722 * (1 - amount),
        g: 0.2126 - 0.2126 * (1 - amount),
        h: 0.0722 + 0.9278 * (1 - amount)
      });
    };

    Snap.filter.grayscale.toString = function () {
      return this();
    };
    /*\
     * Snap.filter.sepia
     [ method ]
     **
     * Returns an SVG markup string for the sepia filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/


    Snap.filter.sepia = function (amount) {
      if (amount == null) {
        amount = 1;
      }

      return Snap.format('<feColorMatrix type="matrix" values="{a} {b} {c} 0 0 {d} {e} {f} 0 0 {g} {h} {i} 0 0 0 0 0 1 0"/>', {
        a: 0.393 + 0.607 * (1 - amount),
        b: 0.769 - 0.769 * (1 - amount),
        c: 0.189 - 0.189 * (1 - amount),
        d: 0.349 - 0.349 * (1 - amount),
        e: 0.686 + 0.314 * (1 - amount),
        f: 0.168 - 0.168 * (1 - amount),
        g: 0.272 - 0.272 * (1 - amount),
        h: 0.534 - 0.534 * (1 - amount),
        i: 0.131 + 0.869 * (1 - amount)
      });
    };

    Snap.filter.sepia.toString = function () {
      return this();
    };
    /*\
     * Snap.filter.saturate
     [ method ]
     **
     * Returns an SVG markup string for the saturate filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/


    Snap.filter.saturate = function (amount) {
      if (amount == null) {
        amount = 1;
      }

      return Snap.format('<feColorMatrix type="saturate" values="{amount}"/>', {
        amount: 1 - amount
      });
    };

    Snap.filter.saturate.toString = function () {
      return this();
    };
    /*\
     * Snap.filter.hueRotate
     [ method ]
     **
     * Returns an SVG markup string for the hue-rotate filter
     **
     - angle (number) angle of rotation
     = (string) filter representation
    \*/


    Snap.filter.hueRotate = function (angle) {
      angle = angle || 0;
      return Snap.format('<feColorMatrix type="hueRotate" values="{angle}"/>', {
        angle: angle
      });
    };

    Snap.filter.hueRotate.toString = function () {
      return this();
    };
    /*\
     * Snap.filter.invert
     [ method ]
     **
     * Returns an SVG markup string for the invert filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/


    Snap.filter.invert = function (amount) {
      if (amount == null) {
        amount = 1;
      } //        <feColorMatrix type="matrix" values="-1 0 0 0 1  0 -1 0 0 1  0 0 -1 0 1  0 0 0 1 0" color-interpolation-filters="sRGB"/>


      return Snap.format('<feComponentTransfer><feFuncR type="table" tableValues="{amount} {amount2}"/><feFuncG type="table" tableValues="{amount} {amount2}"/><feFuncB type="table" tableValues="{amount} {amount2}"/></feComponentTransfer>', {
        amount: amount,
        amount2: 1 - amount
      });
    };

    Snap.filter.invert.toString = function () {
      return this();
    };
    /*\
     * Snap.filter.brightness
     [ method ]
     **
     * Returns an SVG markup string for the brightness filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/


    Snap.filter.brightness = function (amount) {
      if (amount == null) {
        amount = 1;
      }

      return Snap.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}"/><feFuncG type="linear" slope="{amount}"/><feFuncB type="linear" slope="{amount}"/></feComponentTransfer>', {
        amount: amount
      });
    };

    Snap.filter.brightness.toString = function () {
      return this();
    };
    /*\
     * Snap.filter.contrast
     [ method ]
     **
     * Returns an SVG markup string for the contrast filter
     **
     - amount (number) amount of filter (`0..1`)
     = (string) filter representation
    \*/


    Snap.filter.contrast = function (amount) {
      if (amount == null) {
        amount = 1;
      }

      return Snap.format('<feComponentTransfer><feFuncR type="linear" slope="{amount}" intercept="{amount2}"/><feFuncG type="linear" slope="{amount}" intercept="{amount2}"/><feFuncB type="linear" slope="{amount}" intercept="{amount2}"/></feComponentTransfer>', {
        amount: amount,
        amount2: .5 - amount / 2
      });
    };

    Snap.filter.contrast.toString = function () {
      return this();
    };
  }); // Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob, Fragment) {
    var box = Snap._.box,
        is = Snap.is,
        firstLetter = /^[^a-z]*([tbmlrc])/i,
        toString = function () {
      return "T" + this.dx + "," + this.dy;
    };
    /*\
     * Element.getAlign
     [ method ]
     **
     * Returns shift needed to align the element relatively to given element.
     * If no elements specified, parent `<svg>` container will be used.
     - el (object) @optional alignment element
     - way (string) one of six values: `"top"`, `"middle"`, `"bottom"`, `"left"`, `"center"`, `"right"`
     = (object|string) Object in format `{dx: , dy: }` also has a string representation as a transformation string
     > Usage
     | el.transform(el.getAlign(el2, "top"));
     * or
     | var dy = el.getAlign(el2, "top").dy;
    \*/


    Element.prototype.getAlign = function (el, way) {
      if (way == null && is(el, "string")) {
        way = el;
        el = null;
      }

      el = el || this.paper;
      var bx = el.getBBox ? el.getBBox() : box(el),
          bb = this.getBBox(),
          out = {};
      way = way && way.match(firstLetter);
      way = way ? way[1].toLowerCase() : "c";

      switch (way) {
        case "t":
          out.dx = 0;
          out.dy = bx.y - bb.y;
          break;

        case "b":
          out.dx = 0;
          out.dy = bx.y2 - bb.y2;
          break;

        case "m":
          out.dx = 0;
          out.dy = bx.cy - bb.cy;
          break;

        case "l":
          out.dx = bx.x - bb.x;
          out.dy = 0;
          break;

        case "r":
          out.dx = bx.x2 - bb.x2;
          out.dy = 0;
          break;

        default:
          out.dx = bx.cx - bb.cx;
          out.dy = 0;
          break;
      }

      out.toString = toString;
      return out;
    };
    /*\
     * Element.align
     [ method ]
     **
     * Aligns the element relatively to given one via transformation.
     * If no elements specified, parent `<svg>` container will be used.
     - el (object) @optional alignment element
     - way (string) one of six values: `"top"`, `"middle"`, `"bottom"`, `"left"`, `"center"`, `"right"`
     = (object) this element
     > Usage
     | el.align(el2, "top");
     * or
     | el.align("middle");
    \*/


    Element.prototype.align = function (el, way) {
      return this.transform("..." + this.getAlign(el, way));
    };
  }); // Copyright (c) 2017 Adobe Systems Incorporated. All rights reserved.
  //
  // Licensed under the Apache License, Version 2.0 (the "License");
  // you may not use this file except in compliance with the License.
  // You may obtain a copy of the License at
  //
  // http://www.apache.org/licenses/LICENSE-2.0
  //
  // Unless required by applicable law or agreed to in writing, software
  // distributed under the License is distributed on an "AS IS" BASIS,
  // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  // See the License for the specific language governing permissions and
  // limitations under the License.

  Snap.plugin(function (Snap, Element, Paper, glob) {
    // Colours are from https://www.materialui.co
    var red = "#ffebee#ffcdd2#ef9a9a#e57373#ef5350#f44336#e53935#d32f2f#c62828#b71c1c#ff8a80#ff5252#ff1744#d50000",
        pink = "#FCE4EC#F8BBD0#F48FB1#F06292#EC407A#E91E63#D81B60#C2185B#AD1457#880E4F#FF80AB#FF4081#F50057#C51162",
        purple = "#F3E5F5#E1BEE7#CE93D8#BA68C8#AB47BC#9C27B0#8E24AA#7B1FA2#6A1B9A#4A148C#EA80FC#E040FB#D500F9#AA00FF",
        deeppurple = "#EDE7F6#D1C4E9#B39DDB#9575CD#7E57C2#673AB7#5E35B1#512DA8#4527A0#311B92#B388FF#7C4DFF#651FFF#6200EA",
        indigo = "#E8EAF6#C5CAE9#9FA8DA#7986CB#5C6BC0#3F51B5#3949AB#303F9F#283593#1A237E#8C9EFF#536DFE#3D5AFE#304FFE",
        blue = "#E3F2FD#BBDEFB#90CAF9#64B5F6#64B5F6#2196F3#1E88E5#1976D2#1565C0#0D47A1#82B1FF#448AFF#2979FF#2962FF",
        lightblue = "#E1F5FE#B3E5FC#81D4FA#4FC3F7#29B6F6#03A9F4#039BE5#0288D1#0277BD#01579B#80D8FF#40C4FF#00B0FF#0091EA",
        cyan = "#E0F7FA#B2EBF2#80DEEA#4DD0E1#26C6DA#00BCD4#00ACC1#0097A7#00838F#006064#84FFFF#18FFFF#00E5FF#00B8D4",
        teal = "#E0F2F1#B2DFDB#80CBC4#4DB6AC#26A69A#009688#00897B#00796B#00695C#004D40#A7FFEB#64FFDA#1DE9B6#00BFA5",
        green = "#E8F5E9#C8E6C9#A5D6A7#81C784#66BB6A#4CAF50#43A047#388E3C#2E7D32#1B5E20#B9F6CA#69F0AE#00E676#00C853",
        lightgreen = "#F1F8E9#DCEDC8#C5E1A5#AED581#9CCC65#8BC34A#7CB342#689F38#558B2F#33691E#CCFF90#B2FF59#76FF03#64DD17",
        lime = "#F9FBE7#F0F4C3#E6EE9C#DCE775#D4E157#CDDC39#C0CA33#AFB42B#9E9D24#827717#F4FF81#EEFF41#C6FF00#AEEA00",
        yellow = "#FFFDE7#FFF9C4#FFF59D#FFF176#FFEE58#FFEB3B#FDD835#FBC02D#F9A825#F57F17#FFFF8D#FFFF00#FFEA00#FFD600",
        amber = "#FFF8E1#FFECB3#FFE082#FFD54F#FFCA28#FFC107#FFB300#FFA000#FF8F00#FF6F00#FFE57F#FFD740#FFC400#FFAB00",
        orange = "#FFF3E0#FFE0B2#FFCC80#FFB74D#FFA726#FF9800#FB8C00#F57C00#EF6C00#E65100#FFD180#FFAB40#FF9100#FF6D00",
        deeporange = "#FBE9E7#FFCCBC#FFAB91#FF8A65#FF7043#FF5722#F4511E#E64A19#D84315#BF360C#FF9E80#FF6E40#FF3D00#DD2C00",
        brown = "#EFEBE9#D7CCC8#BCAAA4#A1887F#8D6E63#795548#6D4C41#5D4037#4E342E#3E2723",
        grey = "#FAFAFA#F5F5F5#EEEEEE#E0E0E0#BDBDBD#9E9E9E#757575#616161#424242#212121",
        bluegrey = "#ECEFF1#CFD8DC#B0BEC5#90A4AE#78909C#607D8B#546E7A#455A64#37474F#263238";
    /*\
     * Snap.mui
     [ property ]
     **
     * Contain Material UI colours.
     | Snap().rect(0, 0, 10, 10).attr({fill: Snap.mui.deeppurple, stroke: Snap.mui.amber[600]});
     # For colour reference: <a href="https://www.materialui.co">https://www.materialui.co</a>.
    \*/

    Snap.mui = {};
    /*\
     * Snap.flat
     [ property ]
     **
     * Contain Flat UI colours.
     | Snap().rect(0, 0, 10, 10).attr({fill: Snap.flat.carrot, stroke: Snap.flat.wetasphalt});
     # For colour reference: <a href="https://www.materialui.co">https://www.materialui.co</a>.
    \*/

    Snap.flat = {};

    function saveColor(colors) {
      colors = colors.split(/(?=#)/);
      var color = new String(colors[5]);
      color[50] = colors[0];
      color[100] = colors[1];
      color[200] = colors[2];
      color[300] = colors[3];
      color[400] = colors[4];
      color[500] = colors[5];
      color[600] = colors[6];
      color[700] = colors[7];
      color[800] = colors[8];
      color[900] = colors[9];

      if (colors[10]) {
        color.A100 = colors[10];
        color.A200 = colors[11];
        color.A400 = colors[12];
        color.A700 = colors[13];
      }

      return color;
    }

    Snap.mui.red = saveColor(red);
    Snap.mui.pink = saveColor(pink);
    Snap.mui.purple = saveColor(purple);
    Snap.mui.deeppurple = saveColor(deeppurple);
    Snap.mui.indigo = saveColor(indigo);
    Snap.mui.blue = saveColor(blue);
    Snap.mui.lightblue = saveColor(lightblue);
    Snap.mui.cyan = saveColor(cyan);
    Snap.mui.teal = saveColor(teal);
    Snap.mui.green = saveColor(green);
    Snap.mui.lightgreen = saveColor(lightgreen);
    Snap.mui.lime = saveColor(lime);
    Snap.mui.yellow = saveColor(yellow);
    Snap.mui.amber = saveColor(amber);
    Snap.mui.orange = saveColor(orange);
    Snap.mui.deeporange = saveColor(deeporange);
    Snap.mui.brown = saveColor(brown);
    Snap.mui.grey = saveColor(grey);
    Snap.mui.bluegrey = saveColor(bluegrey);
    Snap.flat.turquoise = "#1abc9c";
    Snap.flat.greensea = "#16a085";
    Snap.flat.sunflower = "#f1c40f";
    Snap.flat.orange = "#f39c12";
    Snap.flat.emerland = "#2ecc71";
    Snap.flat.nephritis = "#27ae60";
    Snap.flat.carrot = "#e67e22";
    Snap.flat.pumpkin = "#d35400";
    Snap.flat.peterriver = "#3498db";
    Snap.flat.belizehole = "#2980b9";
    Snap.flat.alizarin = "#e74c3c";
    Snap.flat.pomegranate = "#c0392b";
    Snap.flat.amethyst = "#9b59b6";
    Snap.flat.wisteria = "#8e44ad";
    Snap.flat.clouds = "#ecf0f1";
    Snap.flat.silver = "#bdc3c7";
    Snap.flat.wetasphalt = "#34495e";
    Snap.flat.midnightblue = "#2c3e50";
    Snap.flat.concrete = "#95a5a6";
    Snap.flat.asbestos = "#7f8c8d";
    /*\
     * Snap.importMUIColors
     [ method ]
     **
     * Imports Material UI colours into global object.
     | Snap.importMUIColors();
     | Snap().rect(0, 0, 10, 10).attr({fill: deeppurple, stroke: amber[600]});
     # For colour reference: <a href="https://www.materialui.co">https://www.materialui.co</a>.
    \*/

    Snap.importMUIColors = function () {
      for (var color in Snap.mui) {
        if (Snap.mui.hasOwnProperty(color)) {
          window[color] = Snap.mui[color];
        }
      }
    };
  });
  return Snap;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzbmFwLnN2Zy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBTbmFwLnN2ZyAwLjUuMFxuLy9cbi8vIENvcHlyaWdodCAoYykgMjAxMyDigJMgMjAxNyBBZG9iZSBTeXN0ZW1zIEluY29ycG9yYXRlZC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4vL1xuLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4vLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4vLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbi8vXG4vLyBidWlsZDogMjAxNy0wMi0wNlxuLy8gQ29weXJpZ2h0IChjKSAyMDEzIEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vLyBcbi8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy8gXG4vLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4vLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4vLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbi8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbi8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuLy8g4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQIFxcXFxcbi8vIOKUgiBFdmUgMC41LjAgLSBKYXZhU2NyaXB0IEV2ZW50cyBMaWJyYXJ5ICAgICAgICAgICAgICAgICAgICAgIOKUgiBcXFxcXG4vLyDilJzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilKQgXFxcXFxuLy8g4pSCIEF1dGhvciBEbWl0cnkgQmFyYW5vdnNraXkgKGh0dHA6Ly9kbWl0cnkuYmFyYW5vdnNraXkuY29tLykg4pSCIFxcXFxcbi8vIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCBcXFxcXG4oZnVuY3Rpb24gKGdsb2IpIHtcbiAgdmFyIHZlcnNpb24gPSBcIjAuNS4wXCIsXG4gICAgICBoYXMgPSBcImhhc093blByb3BlcnR5XCIsXG4gICAgICBzZXBhcmF0b3IgPSAvW1xcLlxcL10vLFxuICAgICAgY29tYXNlcGFyYXRvciA9IC9cXHMqLFxccyovLFxuICAgICAgd2lsZGNhcmQgPSBcIipcIixcbiAgICAgIGZ1biA9IGZ1bmN0aW9uICgpIHt9LFxuICAgICAgbnVtc29ydCA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIGEgLSBiO1xuICB9LFxuICAgICAgY3VycmVudF9ldmVudCxcbiAgICAgIHN0b3AsXG4gICAgICBldmVudHMgPSB7XG4gICAgbjoge31cbiAgfSxcbiAgICAgIGZpcnN0RGVmaW5lZCA9ICgpID0+IHtcbiAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB0aGlzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpc1tpXSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHJldHVybiB0aGlzW2ldO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgICAgIGxhc3REZWZpbmVkID0gKCkgPT4ge1xuICAgIHZhciBpID0gdGhpcy5sZW5ndGg7XG5cbiAgICB3aGlsZSAoLS1pKSB7XG4gICAgICBpZiAodHlwZW9mIHRoaXNbaV0gIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXR1cm4gdGhpc1tpXTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gICAgICBvYmp0b3MgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgICAgU3RyID0gU3RyaW5nLFxuICAgICAgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFyKSB7XG4gICAgcmV0dXJuIGFyIGluc3RhbmNlb2YgQXJyYXkgfHwgb2JqdG9zLmNhbGwoYXIpID09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgfTtcbiAgLypcXFxuICAgKiBldmVcbiAgIFsgbWV0aG9kIF1cbiAgICAqIEZpcmVzIGV2ZW50IHdpdGggZ2l2ZW4gYG5hbWVgLCBnaXZlbiBzY29wZSBhbmQgb3RoZXIgcGFyYW1ldGVycy5cbiAgICA+IEFyZ3VtZW50c1xuICAgIC0gbmFtZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSAqZXZlbnQqLCBkb3QgKGAuYCkgb3Igc2xhc2ggKGAvYCkgc2VwYXJhdGVkXG4gICAtIHNjb3BlIChvYmplY3QpIGNvbnRleHQgZm9yIHRoZSBldmVudCBoYW5kbGVyc1xuICAgLSB2YXJhcmdzICguLi4pIHRoZSByZXN0IG9mIGFyZ3VtZW50cyB3aWxsIGJlIHNlbnQgdG8gZXZlbnQgaGFuZGxlcnNcbiAgICA9IChvYmplY3QpIGFycmF5IG9mIHJldHVybmVkIHZhbHVlcyBmcm9tIHRoZSBsaXN0ZW5lcnMuIEFycmF5IGhhcyB0d28gbWV0aG9kcyBgLmZpcnN0RGVmaW5lZCgpYCBhbmQgYC5sYXN0RGVmaW5lZCgpYCB0byBnZXQgZmlyc3Qgb3IgbGFzdCBub3QgYHVuZGVmaW5lZGAgdmFsdWUuXG4gIFxcKi9cblxuXG4gIGV2ZSA9IGZ1bmN0aW9uIChuYW1lLCBzY29wZSkge1xuICAgIHZhciBlID0gZXZlbnRzLFxuICAgICAgICBvbGRzdG9wID0gc3RvcCxcbiAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMiksXG4gICAgICAgIGxpc3RlbmVycyA9IGV2ZS5saXN0ZW5lcnMobmFtZSksXG4gICAgICAgIHogPSAwLFxuICAgICAgICBmID0gZmFsc2UsXG4gICAgICAgIGwsXG4gICAgICAgIGluZGV4ZWQgPSBbXSxcbiAgICAgICAgcXVldWUgPSB7fSxcbiAgICAgICAgb3V0ID0gW10sXG4gICAgICAgIGNlID0gY3VycmVudF9ldmVudCxcbiAgICAgICAgZXJyb3JzID0gW107XG4gICAgb3V0LmZpcnN0RGVmaW5lZCA9IGZpcnN0RGVmaW5lZDtcbiAgICBvdXQubGFzdERlZmluZWQgPSBsYXN0RGVmaW5lZDtcbiAgICBjdXJyZW50X2V2ZW50ID0gbmFtZTtcbiAgICBzdG9wID0gMDtcblxuICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGxpc3RlbmVycy5sZW5ndGg7IGkgPCBpaTsgaSsrKSBpZiAoXCJ6SW5kZXhcIiBpbiBsaXN0ZW5lcnNbaV0pIHtcbiAgICAgIGluZGV4ZWQucHVzaChsaXN0ZW5lcnNbaV0uekluZGV4KTtcblxuICAgICAgaWYgKGxpc3RlbmVyc1tpXS56SW5kZXggPCAwKSB7XG4gICAgICAgIHF1ZXVlW2xpc3RlbmVyc1tpXS56SW5kZXhdID0gbGlzdGVuZXJzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluZGV4ZWQuc29ydChudW1zb3J0KTtcblxuICAgIHdoaWxlIChpbmRleGVkW3pdIDwgMCkge1xuICAgICAgbCA9IHF1ZXVlW2luZGV4ZWRbeisrXV07XG4gICAgICBvdXQucHVzaChsLmFwcGx5KHNjb3BlLCBhcmdzKSk7XG5cbiAgICAgIGlmIChzdG9wKSB7XG4gICAgICAgIHN0b3AgPSBvbGRzdG9wO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBpaTsgaSsrKSB7XG4gICAgICBsID0gbGlzdGVuZXJzW2ldO1xuXG4gICAgICBpZiAoXCJ6SW5kZXhcIiBpbiBsKSB7XG4gICAgICAgIGlmIChsLnpJbmRleCA9PSBpbmRleGVkW3pdKSB7XG4gICAgICAgICAgb3V0LnB1c2gobC5hcHBseShzY29wZSwgYXJncykpO1xuXG4gICAgICAgICAgaWYgKHN0b3ApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgIHorKztcbiAgICAgICAgICAgIGwgPSBxdWV1ZVtpbmRleGVkW3pdXTtcbiAgICAgICAgICAgIGwgJiYgb3V0LnB1c2gobC5hcHBseShzY29wZSwgYXJncykpO1xuXG4gICAgICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IHdoaWxlIChsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBxdWV1ZVtsLnpJbmRleF0gPSBsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXQucHVzaChsLmFwcGx5KHNjb3BlLCBhcmdzKSk7XG5cbiAgICAgICAgaWYgKHN0b3ApIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHN0b3AgPSBvbGRzdG9wO1xuICAgIGN1cnJlbnRfZXZlbnQgPSBjZTtcbiAgICByZXR1cm4gb3V0O1xuICB9OyAvLyBVbmRvY3VtZW50ZWQuIERlYnVnIG9ubHkuXG5cblxuICBldmUuX2V2ZW50cyA9IGV2ZW50cztcbiAgLypcXFxuICAgKiBldmUubGlzdGVuZXJzXG4gICBbIG1ldGhvZCBdXG4gICAgKiBJbnRlcm5hbCBtZXRob2Qgd2hpY2ggZ2l2ZXMgeW91IGFycmF5IG9mIGFsbCBldmVudCBoYW5kbGVycyB0aGF0IHdpbGwgYmUgdHJpZ2dlcmVkIGJ5IHRoZSBnaXZlbiBgbmFtZWAuXG4gICAgPiBBcmd1bWVudHNcbiAgICAtIG5hbWUgKHN0cmluZykgbmFtZSBvZiB0aGUgZXZlbnQsIGRvdCAoYC5gKSBvciBzbGFzaCAoYC9gKSBzZXBhcmF0ZWRcbiAgICA9IChhcnJheSkgYXJyYXkgb2YgZXZlbnQgaGFuZGxlcnNcbiAgXFwqL1xuXG4gIGV2ZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBuYW1lcyA9IGlzQXJyYXkobmFtZSkgPyBuYW1lIDogbmFtZS5zcGxpdChzZXBhcmF0b3IpLFxuICAgICAgICBlID0gZXZlbnRzLFxuICAgICAgICBpdGVtLFxuICAgICAgICBpdGVtcyxcbiAgICAgICAgayxcbiAgICAgICAgaSxcbiAgICAgICAgaWksXG4gICAgICAgIGosXG4gICAgICAgIGpqLFxuICAgICAgICBuZXMsXG4gICAgICAgIGVzID0gW2VdLFxuICAgICAgICBvdXQgPSBbXTtcblxuICAgIGZvciAoaSA9IDAsIGlpID0gbmFtZXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgbmVzID0gW107XG5cbiAgICAgIGZvciAoaiA9IDAsIGpqID0gZXMubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICBlID0gZXNbal0ubjtcbiAgICAgICAgaXRlbXMgPSBbZVtuYW1lc1tpXV0sIGVbd2lsZGNhcmRdXTtcbiAgICAgICAgayA9IDI7XG5cbiAgICAgICAgd2hpbGUgKGstLSkge1xuICAgICAgICAgIGl0ZW0gPSBpdGVtc1trXTtcblxuICAgICAgICAgIGlmIChpdGVtKSB7XG4gICAgICAgICAgICBuZXMucHVzaChpdGVtKTtcbiAgICAgICAgICAgIG91dCA9IG91dC5jb25jYXQoaXRlbS5mIHx8IFtdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZXMgPSBuZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfTtcbiAgLypcXFxuICAgKiBldmUuc2VwYXJhdG9yXG4gICBbIG1ldGhvZCBdXG4gICAgKiBJZiBmb3Igc29tZSByZWFzb25zIHlvdSBkb27igJl0IGxpa2UgZGVmYXVsdCBzZXBhcmF0b3JzIChgLmAgb3IgYC9gKSB5b3UgY2FuIHNwZWNpZnkgeW91cnNcbiAgICogaGVyZS4gQmUgYXdhcmUgdGhhdCBpZiB5b3UgcGFzcyBhIHN0cmluZyBsb25nZXIgdGhhbiBvbmUgY2hhcmFjdGVyIGl0IHdpbGwgYmUgdHJlYXRlZCBhc1xuICAgKiBhIGxpc3Qgb2YgY2hhcmFjdGVycy5cbiAgICAtIHNlcGFyYXRvciAoc3RyaW5nKSBuZXcgc2VwYXJhdG9yLiBFbXB0eSBzdHJpbmcgcmVzZXRzIHRvIGRlZmF1bHQ6IGAuYCBvciBgL2AuXG4gIFxcKi9cblxuXG4gIGV2ZS5zZXBhcmF0b3IgPSBmdW5jdGlvbiAoc2VwKSB7XG4gICAgaWYgKHNlcCkge1xuICAgICAgc2VwID0gU3RyKHNlcCkucmVwbGFjZSgvKD89W1xcLlxcXlxcXVxcW1xcLV0pL2csIFwiXFxcXFwiKTtcbiAgICAgIHNlcCA9IFwiW1wiICsgc2VwICsgXCJdXCI7XG4gICAgICBzZXBhcmF0b3IgPSBuZXcgUmVnRXhwKHNlcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlcGFyYXRvciA9IC9bXFwuXFwvXS87XG4gICAgfVxuICB9O1xuICAvKlxcXG4gICAqIGV2ZS5vblxuICAgWyBtZXRob2QgXVxuICAgKipcbiAgICogQmluZHMgZ2l2ZW4gZXZlbnQgaGFuZGxlciB3aXRoIGEgZ2l2ZW4gbmFtZS4gWW91IGNhbiB1c2Ugd2lsZGNhcmRzIOKAnGAqYOKAnSBmb3IgdGhlIG5hbWVzOlxuICAgfCBldmUub24oXCIqLnVuZGVyLipcIiwgZik7XG4gICB8IGV2ZShcIm1vdXNlLnVuZGVyLmZsb29yXCIpOyAvLyB0cmlnZ2VycyBmXG4gICAqIFVzZSBAZXZlIHRvIHRyaWdnZXIgdGhlIGxpc3RlbmVyLlxuICAgKipcbiAgIC0gbmFtZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSBldmVudCwgZG90IChgLmApIG9yIHNsYXNoIChgL2ApIHNlcGFyYXRlZCwgd2l0aCBvcHRpb25hbCB3aWxkY2FyZHNcbiAgIC0gZiAoZnVuY3Rpb24pIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICoqXG4gICAtIG5hbWUgKGFycmF5KSBpZiB5b3UgZG9u4oCZdCB3YW50IHRvIHVzZSBzZXBhcmF0b3JzLCB5b3UgY2FuIHVzZSBhcnJheSBvZiBzdHJpbmdzXG4gICAtIGYgKGZ1bmN0aW9uKSBldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG4gICAqKlxuICAgPSAoZnVuY3Rpb24pIHJldHVybmVkIGZ1bmN0aW9uIGFjY2VwdHMgYSBzaW5nbGUgbnVtZXJpYyBwYXJhbWV0ZXIgdGhhdCByZXByZXNlbnRzIHotaW5kZXggb2YgdGhlIGhhbmRsZXIuIEl0IGlzIGFuIG9wdGlvbmFsIGZlYXR1cmUgYW5kIG9ubHkgdXNlZCB3aGVuIHlvdSBuZWVkIHRvIGVuc3VyZSB0aGF0IHNvbWUgc3Vic2V0IG9mIGhhbmRsZXJzIHdpbGwgYmUgaW52b2tlZCBpbiBhIGdpdmVuIG9yZGVyLCBkZXNwaXRlIG9mIHRoZSBvcmRlciBvZiBhc3NpZ25tZW50LiBcbiAgID4gRXhhbXBsZTpcbiAgIHwgZXZlLm9uKFwibW91c2VcIiwgZWF0SXQpKDIpO1xuICAgfCBldmUub24oXCJtb3VzZVwiLCBzY3JlYW0pO1xuICAgfCBldmUub24oXCJtb3VzZVwiLCBjYXRjaEl0KSgxKTtcbiAgICogVGhpcyB3aWxsIGVuc3VyZSB0aGF0IGBjYXRjaEl0YCBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBiZWZvcmUgYGVhdEl0YC5cbiAgICpcbiAgICogSWYgeW91IHdhbnQgdG8gcHV0IHlvdXIgaGFuZGxlciBiZWZvcmUgbm9uLWluZGV4ZWQgaGFuZGxlcnMsIHNwZWNpZnkgYSBuZWdhdGl2ZSB2YWx1ZS5cbiAgICogTm90ZTogSSBhc3N1bWUgbW9zdCBvZiB0aGUgdGltZSB5b3UgZG9u4oCZdCBuZWVkIHRvIHdvcnJ5IGFib3V0IHotaW5kZXgsIGJ1dCBpdOKAmXMgbmljZSB0byBoYXZlIHRoaXMgZmVhdHVyZSDigJxqdXN0IGluIGNhc2XigJ0uXG4gIFxcKi9cblxuXG4gIGV2ZS5vbiA9IGZ1bmN0aW9uIChuYW1lLCBmKSB7XG4gICAgaWYgKHR5cGVvZiBmICE9IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHt9O1xuICAgIH1cblxuICAgIHZhciBuYW1lcyA9IGlzQXJyYXkobmFtZSkgPyBpc0FycmF5KG5hbWVbMF0pID8gbmFtZSA6IFtuYW1lXSA6IFN0cihuYW1lKS5zcGxpdChjb21hc2VwYXJhdG9yKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IG5hbWVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgIChmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICB2YXIgbmFtZXMgPSBpc0FycmF5KG5hbWUpID8gbmFtZSA6IFN0cihuYW1lKS5zcGxpdChzZXBhcmF0b3IpLFxuICAgICAgICAgICAgZSA9IGV2ZW50cyxcbiAgICAgICAgICAgIGV4aXN0O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IG5hbWVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICBlID0gZS5uO1xuICAgICAgICAgIGUgPSBlLmhhc093blByb3BlcnR5KG5hbWVzW2ldKSAmJiBlW25hbWVzW2ldXSB8fCAoZVtuYW1lc1tpXV0gPSB7XG4gICAgICAgICAgICBuOiB7fVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZS5mID0gZS5mIHx8IFtdO1xuXG4gICAgICAgIGZvciAoaSA9IDAsIGlpID0gZS5mLmxlbmd0aDsgaSA8IGlpOyBpKyspIGlmIChlLmZbaV0gPT0gZikge1xuICAgICAgICAgIGV4aXN0ID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgICFleGlzdCAmJiBlLmYucHVzaChmKTtcbiAgICAgIH0pKG5hbWVzW2ldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKHpJbmRleCkge1xuICAgICAgaWYgKCt6SW5kZXggPT0gK3pJbmRleCkge1xuICAgICAgICBmLnpJbmRleCA9ICt6SW5kZXg7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcbiAgLypcXFxuICAgKiBldmUuZlxuICAgWyBtZXRob2QgXVxuICAgKipcbiAgICogUmV0dXJucyBmdW5jdGlvbiB0aGF0IHdpbGwgZmlyZSBnaXZlbiBldmVudCB3aXRoIG9wdGlvbmFsIGFyZ3VtZW50cy5cbiAgICogQXJndW1lbnRzIHRoYXQgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHJlc3VsdCBmdW5jdGlvbiB3aWxsIGJlIGFsc29cbiAgICogY29uY2F0ZWQgdG8gdGhlIGxpc3Qgb2YgZmluYWwgYXJndW1lbnRzLlxuICAgfCBlbC5vbmNsaWNrID0gZXZlLmYoXCJjbGlja1wiLCAxLCAyKTtcbiAgIHwgZXZlLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgIHwgICAgIGNvbnNvbGUubG9nKGEsIGIsIGMpOyAvLyAxLCAyLCBbZXZlbnQgb2JqZWN0XVxuICAgfCB9KTtcbiAgID4gQXJndW1lbnRzXG4gICAtIGV2ZW50IChzdHJpbmcpIGV2ZW50IG5hbWVcbiAgIC0gdmFyYXJncyAo4oCmKSBhbmQgYW55IG90aGVyIGFyZ3VtZW50c1xuICAgPSAoZnVuY3Rpb24pIHBvc3NpYmxlIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgXFwqL1xuXG5cbiAgZXZlLmYgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB2YXIgYXR0cnMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIGV2ZS5hcHBseShudWxsLCBbZXZlbnQsIG51bGxdLmNvbmNhdChhdHRycykuY29uY2F0KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSkpO1xuICAgIH07XG4gIH07XG4gIC8qXFxcbiAgICogZXZlLnN0b3BcbiAgIFsgbWV0aG9kIF1cbiAgICoqXG4gICAqIElzIHVzZWQgaW5zaWRlIGFuIGV2ZW50IGhhbmRsZXIgdG8gc3RvcCB0aGUgZXZlbnQsIHByZXZlbnRpbmcgYW55IHN1YnNlcXVlbnQgbGlzdGVuZXJzIGZyb20gZmlyaW5nLlxuICBcXCovXG5cblxuICBldmUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICBzdG9wID0gMTtcbiAgfTtcbiAgLypcXFxuICAgKiBldmUubnRcbiAgIFsgbWV0aG9kIF1cbiAgICoqXG4gICAqIENvdWxkIGJlIHVzZWQgaW5zaWRlIGV2ZW50IGhhbmRsZXIgdG8gZmlndXJlIG91dCBhY3R1YWwgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAqKlxuICAgPiBBcmd1bWVudHNcbiAgICoqXG4gICAtIHN1Ym5hbWUgKHN0cmluZykgI29wdGlvbmFsIHN1Ym5hbWUgb2YgdGhlIGV2ZW50XG4gICAqKlxuICAgPSAoc3RyaW5nKSBuYW1lIG9mIHRoZSBldmVudCwgaWYgYHN1Ym5hbWVgIGlzIG5vdCBzcGVjaWZpZWRcbiAgICogb3JcbiAgID0gKGJvb2xlYW4pIGB0cnVlYCwgaWYgY3VycmVudCBldmVudOKAmXMgbmFtZSBjb250YWlucyBgc3VibmFtZWBcbiAgXFwqL1xuXG5cbiAgZXZlLm50ID0gZnVuY3Rpb24gKHN1Ym5hbWUpIHtcbiAgICB2YXIgY3VyID0gaXNBcnJheShjdXJyZW50X2V2ZW50KSA/IGN1cnJlbnRfZXZlbnQuam9pbihcIi5cIikgOiBjdXJyZW50X2V2ZW50O1xuXG4gICAgaWYgKHN1Ym5hbWUpIHtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKFwiKD86XFxcXC58XFxcXC98XilcIiArIHN1Ym5hbWUgKyBcIig/OlxcXFwufFxcXFwvfCQpXCIpLnRlc3QoY3VyKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3VyO1xuICB9O1xuICAvKlxcXG4gICAqIGV2ZS5udHNcbiAgIFsgbWV0aG9kIF1cbiAgICoqXG4gICAqIENvdWxkIGJlIHVzZWQgaW5zaWRlIGV2ZW50IGhhbmRsZXIgdG8gZmlndXJlIG91dCBhY3R1YWwgbmFtZSBvZiB0aGUgZXZlbnQuXG4gICAqKlxuICAgKipcbiAgID0gKGFycmF5KSBuYW1lcyBvZiB0aGUgZXZlbnRcbiAgXFwqL1xuXG5cbiAgZXZlLm50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gaXNBcnJheShjdXJyZW50X2V2ZW50KSA/IGN1cnJlbnRfZXZlbnQgOiBjdXJyZW50X2V2ZW50LnNwbGl0KHNlcGFyYXRvcik7XG4gIH07XG4gIC8qXFxcbiAgICogZXZlLm9mZlxuICAgWyBtZXRob2QgXVxuICAgKipcbiAgICogUmVtb3ZlcyBnaXZlbiBmdW5jdGlvbiBmcm9tIHRoZSBsaXN0IG9mIGV2ZW50IGxpc3RlbmVycyBhc3NpZ25lZCB0byBnaXZlbiBuYW1lLlxuICAgKiBJZiBubyBhcmd1bWVudHMgc3BlY2lmaWVkIGFsbCB0aGUgZXZlbnRzIHdpbGwgYmUgY2xlYXJlZC5cbiAgICoqXG4gICA+IEFyZ3VtZW50c1xuICAgKipcbiAgIC0gbmFtZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSBldmVudCwgZG90IChgLmApIG9yIHNsYXNoIChgL2ApIHNlcGFyYXRlZCwgd2l0aCBvcHRpb25hbCB3aWxkY2FyZHNcbiAgIC0gZiAoZnVuY3Rpb24pIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgXFwqL1xuXG4gIC8qXFxcbiAgICogZXZlLnVuYmluZFxuICAgWyBtZXRob2QgXVxuICAgKipcbiAgICogU2VlIEBldmUub2ZmXG4gIFxcKi9cblxuXG4gIGV2ZS5vZmYgPSBldmUudW5iaW5kID0gZnVuY3Rpb24gKG5hbWUsIGYpIHtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgIGV2ZS5fZXZlbnRzID0gZXZlbnRzID0ge1xuICAgICAgICBuOiB7fVxuICAgICAgfTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbmFtZXMgPSBpc0FycmF5KG5hbWUpID8gaXNBcnJheShuYW1lWzBdKSA/IG5hbWUgOiBbbmFtZV0gOiBTdHIobmFtZSkuc3BsaXQoY29tYXNlcGFyYXRvcik7XG5cbiAgICBpZiAobmFtZXMubGVuZ3RoID4gMSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gbmFtZXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICBldmUub2ZmKG5hbWVzW2ldLCBmKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIG5hbWVzID0gaXNBcnJheShuYW1lKSA/IG5hbWUgOiBTdHIobmFtZSkuc3BsaXQoc2VwYXJhdG9yKTtcbiAgICB2YXIgZSxcbiAgICAgICAga2V5LFxuICAgICAgICBzcGxpY2UsXG4gICAgICAgIGksXG4gICAgICAgIGlpLFxuICAgICAgICBqLFxuICAgICAgICBqaixcbiAgICAgICAgY3VyID0gW2V2ZW50c10sXG4gICAgICAgIGlub2RlcyA9IFtdO1xuXG4gICAgZm9yIChpID0gMCwgaWkgPSBuYW1lcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICBmb3IgKGogPSAwOyBqIDwgY3VyLmxlbmd0aDsgaiArPSBzcGxpY2UubGVuZ3RoIC0gMikge1xuICAgICAgICBzcGxpY2UgPSBbaiwgMV07XG4gICAgICAgIGUgPSBjdXJbal0ubjtcblxuICAgICAgICBpZiAobmFtZXNbaV0gIT0gd2lsZGNhcmQpIHtcbiAgICAgICAgICBpZiAoZVtuYW1lc1tpXV0pIHtcbiAgICAgICAgICAgIHNwbGljZS5wdXNoKGVbbmFtZXNbaV1dKTtcbiAgICAgICAgICAgIGlub2Rlcy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgbjogZSxcbiAgICAgICAgICAgICAgbmFtZTogbmFtZXNbaV1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGtleSBpbiBlKSBpZiAoZVtoYXNdKGtleSkpIHtcbiAgICAgICAgICAgIHNwbGljZS5wdXNoKGVba2V5XSk7XG4gICAgICAgICAgICBpbm9kZXMudW5zaGlmdCh7XG4gICAgICAgICAgICAgIG46IGUsXG4gICAgICAgICAgICAgIG5hbWU6IGtleVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY3VyLnNwbGljZS5hcHBseShjdXIsIHNwbGljZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChpID0gMCwgaWkgPSBjdXIubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgZSA9IGN1cltpXTtcblxuICAgICAgd2hpbGUgKGUubikge1xuICAgICAgICBpZiAoZikge1xuICAgICAgICAgIGlmIChlLmYpIHtcbiAgICAgICAgICAgIGZvciAoaiA9IDAsIGpqID0gZS5mLmxlbmd0aDsgaiA8IGpqOyBqKyspIGlmIChlLmZbal0gPT0gZikge1xuICAgICAgICAgICAgICBlLmYuc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgIWUuZi5sZW5ndGggJiYgZGVsZXRlIGUuZjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmb3IgKGtleSBpbiBlLm4pIGlmIChlLm5baGFzXShrZXkpICYmIGUubltrZXldLmYpIHtcbiAgICAgICAgICAgIHZhciBmdW5jcyA9IGUubltrZXldLmY7XG5cbiAgICAgICAgICAgIGZvciAoaiA9IDAsIGpqID0gZnVuY3MubGVuZ3RoOyBqIDwgamo7IGorKykgaWYgKGZ1bmNzW2pdID09IGYpIHtcbiAgICAgICAgICAgICAgZnVuY3Muc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgIWZ1bmNzLmxlbmd0aCAmJiBkZWxldGUgZS5uW2tleV0uZjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIGUuZjtcblxuICAgICAgICAgIGZvciAoa2V5IGluIGUubikgaWYgKGUubltoYXNdKGtleSkgJiYgZS5uW2tleV0uZikge1xuICAgICAgICAgICAgZGVsZXRlIGUubltrZXldLmY7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZSA9IGUubjtcbiAgICAgIH1cbiAgICB9IC8vIHBydW5lIGlubmVyIG5vZGVzIGluIHBhdGhcblxuXG4gICAgcHJ1bmU6IGZvciAoaSA9IDAsIGlpID0gaW5vZGVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgIGUgPSBpbm9kZXNbaV07XG5cbiAgICAgIGZvciAoa2V5IGluIGUubltlLm5hbWVdLmYpIHtcbiAgICAgICAgLy8gbm90IGVtcHR5IChoYXMgbGlzdGVuZXJzKVxuICAgICAgICBjb250aW51ZSBwcnVuZTtcbiAgICAgIH1cblxuICAgICAgZm9yIChrZXkgaW4gZS5uW2UubmFtZV0ubikge1xuICAgICAgICAvLyBub3QgZW1wdHkgKGhhcyBjaGlsZHJlbilcbiAgICAgICAgY29udGludWUgcHJ1bmU7XG4gICAgICB9IC8vIGlzIGVtcHR5XG5cblxuICAgICAgZGVsZXRlIGUubltlLm5hbWVdO1xuICAgIH1cbiAgfTtcbiAgLypcXFxuICAgKiBldmUub25jZVxuICAgWyBtZXRob2QgXVxuICAgKipcbiAgICogQmluZHMgZ2l2ZW4gZXZlbnQgaGFuZGxlciB3aXRoIGEgZ2l2ZW4gbmFtZSB0byBvbmx5IHJ1biBvbmNlIHRoZW4gdW5iaW5kIGl0c2VsZi5cbiAgIHwgZXZlLm9uY2UoXCJsb2dpblwiLCBmKTtcbiAgIHwgZXZlKFwibG9naW5cIik7IC8vIHRyaWdnZXJzIGZcbiAgIHwgZXZlKFwibG9naW5cIik7IC8vIG5vIGxpc3RlbmVyc1xuICAgKiBVc2UgQGV2ZSB0byB0cmlnZ2VyIHRoZSBsaXN0ZW5lci5cbiAgICoqXG4gICA+IEFyZ3VtZW50c1xuICAgKipcbiAgIC0gbmFtZSAoc3RyaW5nKSBuYW1lIG9mIHRoZSBldmVudCwgZG90IChgLmApIG9yIHNsYXNoIChgL2ApIHNlcGFyYXRlZCwgd2l0aCBvcHRpb25hbCB3aWxkY2FyZHNcbiAgIC0gZiAoZnVuY3Rpb24pIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbiAgICoqXG4gICA9IChmdW5jdGlvbikgc2FtZSByZXR1cm4gZnVuY3Rpb24gYXMgQGV2ZS5vblxuICBcXCovXG5cblxuICBldmUub25jZSA9IGZ1bmN0aW9uIChuYW1lLCBmKSB7XG4gICAgdmFyIGYyID0gZnVuY3Rpb24gKCkge1xuICAgICAgZXZlLm9mZihuYW1lLCBmMik7XG4gICAgICByZXR1cm4gZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG5cbiAgICByZXR1cm4gZXZlLm9uKG5hbWUsIGYyKTtcbiAgfTtcbiAgLypcXFxuICAgKiBldmUudmVyc2lvblxuICAgWyBwcm9wZXJ0eSAoc3RyaW5nKSBdXG4gICAqKlxuICAgKiBDdXJyZW50IHZlcnNpb24gb2YgdGhlIGxpYnJhcnkuXG4gIFxcKi9cblxuXG4gIGV2ZS52ZXJzaW9uID0gdmVyc2lvbjtcblxuICBldmUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFwiWW91IGFyZSBydW5uaW5nIEV2ZSBcIiArIHZlcnNpb247XG4gIH07XG5cbiAgdHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzID8gbW9kdWxlLmV4cG9ydHMgPSBldmUgOiB0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShcImV2ZVwiLCBbXSwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBldmU7XG4gIH0pIDogZ2xvYi5ldmUgPSBldmU7XG59KSh0aGlzKTtcblxuKGZ1bmN0aW9uIChnbG9iLCBmYWN0b3J5KSB7XG4gIC8vIEFNRCBzdXBwb3J0XG4gIGlmICh0eXBlb2YgZGVmaW5lID09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gRGVmaW5lIGFzIGFuIGFub255bW91cyBtb2R1bGVcbiAgICBkZWZpbmUoW1wiZXZlXCJdLCBmdW5jdGlvbiAoZXZlKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeShnbG9iLCBldmUpO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBOZXh0IGZvciBOb2RlLmpzIG9yIENvbW1vbkpTXG4gICAgdmFyIGV2ZSA9IHJlcXVpcmUoXCJldmVcIik7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoZ2xvYiwgZXZlKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKGdsb2IgaXMgd2luZG93KVxuICAgIC8vIFNuYXAgYWRkcyBpdHNlbGYgdG8gd2luZG93XG4gICAgZmFjdG9yeShnbG9iLCBnbG9iLmV2ZSk7XG4gIH1cbn0pKHdpbmRvdyB8fCB0aGlzLCBmdW5jdGlvbiAod2luZG93LCBldmUpIHtcbiAgLy8gQ29weXJpZ2h0IChjKSAyMDE3IEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAvL1xuICAvLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAvLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIC8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAvL1xuICAvLyBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgLy9cbiAgLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAvLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gIC8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAvLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gIC8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICB2YXIgbWluYSA9IGZ1bmN0aW9uIChldmUpIHtcbiAgICB2YXIgYW5pbWF0aW9ucyA9IHt9LFxuICAgICAgICByZXF1ZXN0QW5pbUZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgc2V0VGltZW91dChjYWxsYmFjaywgMTYsIG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgICAgIHJlcXVlc3RJRCxcbiAgICAgICAgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBhIGluc3RhbmNlb2YgQXJyYXkgfHwgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpID09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgICB9LFxuICAgICAgICBpZGdlbiA9IDAsXG4gICAgICAgIGlkcHJlZml4ID0gXCJNXCIgKyAoK25ldyBEYXRlKCkpLnRvU3RyaW5nKDM2KSxcbiAgICAgICAgSUQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaWRwcmVmaXggKyAoaWRnZW4rKykudG9TdHJpbmcoMzYpO1xuICAgIH0sXG4gICAgICAgIGRpZmYgPSBmdW5jdGlvbiAoYSwgYiwgQSwgQikge1xuICAgICAgaWYgKGlzQXJyYXkoYSkpIHtcbiAgICAgICAgcmVzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gYS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgcmVzW2ldID0gZGlmZihhW2ldLCBiLCBBW2ldLCBCKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9XG5cbiAgICAgIHZhciBkaWYgPSAoQSAtIGEpIC8gKEIgLSBiKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYmIpIHtcbiAgICAgICAgcmV0dXJuIGEgKyBkaWYgKiAoYmIgLSBiKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICAgICAgdGltZXIgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gK25ldyBEYXRlKCk7XG4gICAgfSxcbiAgICAgICAgc3RhID0gZnVuY3Rpb24gKHZhbCkge1xuICAgICAgdmFyIGEgPSB0aGlzO1xuXG4gICAgICBpZiAodmFsID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGEucztcbiAgICAgIH1cblxuICAgICAgdmFyIGRzID0gYS5zIC0gdmFsO1xuICAgICAgYS5iICs9IGEuZHVyICogZHM7XG4gICAgICBhLkIgKz0gYS5kdXIgKiBkcztcbiAgICAgIGEucyA9IHZhbDtcbiAgICB9LFxuICAgICAgICBzcGVlZCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIHZhciBhID0gdGhpcztcblxuICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhLnNwZDtcbiAgICAgIH1cblxuICAgICAgYS5zcGQgPSB2YWw7XG4gICAgfSxcbiAgICAgICAgZHVyYXRpb24gPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgICB2YXIgYSA9IHRoaXM7XG5cbiAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYS5kdXI7XG4gICAgICB9XG5cbiAgICAgIGEucyA9IGEucyAqIHZhbCAvIGEuZHVyO1xuICAgICAgYS5kdXIgPSB2YWw7XG4gICAgfSxcbiAgICAgICAgc3RvcGl0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGEgPSB0aGlzO1xuICAgICAgZGVsZXRlIGFuaW1hdGlvbnNbYS5pZF07XG4gICAgICBhLnVwZGF0ZSgpO1xuICAgICAgZXZlKFwibWluYS5zdG9wLlwiICsgYS5pZCwgYSk7XG4gICAgfSxcbiAgICAgICAgcGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYSA9IHRoaXM7XG5cbiAgICAgIGlmIChhLnBkaWYpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkZWxldGUgYW5pbWF0aW9uc1thLmlkXTtcbiAgICAgIGEudXBkYXRlKCk7XG4gICAgICBhLnBkaWYgPSBhLmdldCgpIC0gYS5iO1xuICAgIH0sXG4gICAgICAgIHJlc3VtZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhID0gdGhpcztcblxuICAgICAgaWYgKCFhLnBkaWYpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhLmIgPSBhLmdldCgpIC0gYS5wZGlmO1xuICAgICAgZGVsZXRlIGEucGRpZjtcbiAgICAgIGFuaW1hdGlvbnNbYS5pZF0gPSBhO1xuICAgICAgZnJhbWUoKTtcbiAgICB9LFxuICAgICAgICB1cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYSA9IHRoaXMsXG4gICAgICAgICAgcmVzO1xuXG4gICAgICBpZiAoaXNBcnJheShhLnN0YXJ0KSkge1xuICAgICAgICByZXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBqID0gMCwgamogPSBhLnN0YXJ0Lmxlbmd0aDsgaiA8IGpqOyBqKyspIHtcbiAgICAgICAgICByZXNbal0gPSArYS5zdGFydFtqXSArIChhLmVuZFtqXSAtIGEuc3RhcnRbal0pICogYS5lYXNpbmcoYS5zKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzID0gK2Euc3RhcnQgKyAoYS5lbmQgLSBhLnN0YXJ0KSAqIGEuZWFzaW5nKGEucyk7XG4gICAgICB9XG5cbiAgICAgIGEuc2V0KHJlcyk7XG4gICAgfSxcbiAgICAgICAgZnJhbWUgPSBmdW5jdGlvbiAodGltZVN0YW1wKSB7XG4gICAgICAvLyBNYW51YWwgaW52b2thdGlvbj9cbiAgICAgIGlmICghdGltZVN0YW1wKSB7XG4gICAgICAgIC8vIEZyYW1lIGxvb3Agc3RvcHBlZD9cbiAgICAgICAgaWYgKCFyZXF1ZXN0SUQpIHtcbiAgICAgICAgICAvLyBTdGFydCBmcmFtZSBsb29wLi4uXG4gICAgICAgICAgcmVxdWVzdElEID0gcmVxdWVzdEFuaW1GcmFtZShmcmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW4gPSAwO1xuXG4gICAgICBmb3IgKHZhciBpIGluIGFuaW1hdGlvbnMpIGlmIChhbmltYXRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBhID0gYW5pbWF0aW9uc1tpXSxcbiAgICAgICAgICAgIGIgPSBhLmdldCgpLFxuICAgICAgICAgICAgcmVzO1xuICAgICAgICBsZW4rKztcbiAgICAgICAgYS5zID0gKGIgLSBhLmIpIC8gKGEuZHVyIC8gYS5zcGQpO1xuXG4gICAgICAgIGlmIChhLnMgPj0gMSkge1xuICAgICAgICAgIGRlbGV0ZSBhbmltYXRpb25zW2ldO1xuICAgICAgICAgIGEucyA9IDE7XG4gICAgICAgICAgbGVuLS07XG5cbiAgICAgICAgICAoZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBldmUoXCJtaW5hLmZpbmlzaC5cIiArIGEuaWQsIGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkoYSk7XG4gICAgICAgIH1cblxuICAgICAgICBhLnVwZGF0ZSgpO1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0SUQgPSBsZW4gPyByZXF1ZXN0QW5pbUZyYW1lKGZyYW1lKSA6IGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKlxcXG4gICAgICogbWluYVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogR2VuZXJpYyBhbmltYXRpb24gb2YgbnVtYmVyc1xuICAgICAqKlxuICAgICAtIGEgKG51bWJlcikgc3RhcnQgX3NsYXZlXyBudW1iZXJcbiAgICAgLSBBIChudW1iZXIpIGVuZCBfc2xhdmVfIG51bWJlclxuICAgICAtIGIgKG51bWJlcikgc3RhcnQgX21hc3Rlcl8gbnVtYmVyIChzdGFydCB0aW1lIGluIGdlbmVyYWwgY2FzZSlcbiAgICAgLSBCIChudW1iZXIpIGVuZCBfbWFzdGVyXyBudW1iZXIgKGVuZCB0aW1lIGluIGdlbmVyYWwgY2FzZSlcbiAgICAgLSBnZXQgKGZ1bmN0aW9uKSBnZXR0ZXIgb2YgX21hc3Rlcl8gbnVtYmVyIChzZWUgQG1pbmEudGltZSlcbiAgICAgLSBzZXQgKGZ1bmN0aW9uKSBzZXR0ZXIgb2YgX3NsYXZlXyBudW1iZXJcbiAgICAgLSBlYXNpbmcgKGZ1bmN0aW9uKSAjb3B0aW9uYWwgZWFzaW5nIGZ1bmN0aW9uLCBkZWZhdWx0IGlzIEBtaW5hLmxpbmVhclxuICAgICA9IChvYmplY3QpIGFuaW1hdGlvbiBkZXNjcmlwdG9yXG4gICAgIG8ge1xuICAgICBvICAgICAgICAgaWQgKHN0cmluZykgYW5pbWF0aW9uIGlkLFxuICAgICBvICAgICAgICAgc3RhcnQgKG51bWJlcikgc3RhcnQgX3NsYXZlXyBudW1iZXIsXG4gICAgIG8gICAgICAgICBlbmQgKG51bWJlcikgZW5kIF9zbGF2ZV8gbnVtYmVyLFxuICAgICBvICAgICAgICAgYiAobnVtYmVyKSBzdGFydCBfbWFzdGVyXyBudW1iZXIsXG4gICAgIG8gICAgICAgICBzIChudW1iZXIpIGFuaW1hdGlvbiBzdGF0dXMgKDAuLjEpLFxuICAgICBvICAgICAgICAgZHVyIChudW1iZXIpIGFuaW1hdGlvbiBkdXJhdGlvbixcbiAgICAgbyAgICAgICAgIHNwZCAobnVtYmVyKSBhbmltYXRpb24gc3BlZWQsXG4gICAgIG8gICAgICAgICBnZXQgKGZ1bmN0aW9uKSBnZXR0ZXIgb2YgX21hc3Rlcl8gbnVtYmVyIChzZWUgQG1pbmEudGltZSksXG4gICAgIG8gICAgICAgICBzZXQgKGZ1bmN0aW9uKSBzZXR0ZXIgb2YgX3NsYXZlXyBudW1iZXIsXG4gICAgIG8gICAgICAgICBlYXNpbmcgKGZ1bmN0aW9uKSBlYXNpbmcgZnVuY3Rpb24sIGRlZmF1bHQgaXMgQG1pbmEubGluZWFyLFxuICAgICBvICAgICAgICAgc3RhdHVzIChmdW5jdGlvbikgc3RhdHVzIGdldHRlci9zZXR0ZXIsXG4gICAgIG8gICAgICAgICBzcGVlZCAoZnVuY3Rpb24pIHNwZWVkIGdldHRlci9zZXR0ZXIsXG4gICAgIG8gICAgICAgICBkdXJhdGlvbiAoZnVuY3Rpb24pIGR1cmF0aW9uIGdldHRlci9zZXR0ZXIsXG4gICAgIG8gICAgICAgICBzdG9wIChmdW5jdGlvbikgYW5pbWF0aW9uIHN0b3BwZXJcbiAgICAgbyAgICAgICAgIHBhdXNlIChmdW5jdGlvbikgcGF1c2VzIHRoZSBhbmltYXRpb25cbiAgICAgbyAgICAgICAgIHJlc3VtZSAoZnVuY3Rpb24pIHJlc3VtZXMgdGhlIGFuaW1hdGlvblxuICAgICBvICAgICAgICAgdXBkYXRlIChmdW5jdGlvbikgY2FsbGVzIHNldHRlciB3aXRoIHRoZSByaWdodCB2YWx1ZSBvZiB0aGUgYW5pbWF0aW9uXG4gICAgIG8gfVxuICAgIFxcKi9cbiAgICBtaW5hID0gZnVuY3Rpb24gKGEsIEEsIGIsIEIsIGdldCwgc2V0LCBlYXNpbmcpIHtcbiAgICAgIHZhciBhbmltID0ge1xuICAgICAgICBpZDogSUQoKSxcbiAgICAgICAgc3RhcnQ6IGEsXG4gICAgICAgIGVuZDogQSxcbiAgICAgICAgYjogYixcbiAgICAgICAgczogMCxcbiAgICAgICAgZHVyOiBCIC0gYixcbiAgICAgICAgc3BkOiAxLFxuICAgICAgICBnZXQ6IGdldCxcbiAgICAgICAgc2V0OiBzZXQsXG4gICAgICAgIGVhc2luZzogZWFzaW5nIHx8IG1pbmEubGluZWFyLFxuICAgICAgICBzdGF0dXM6IHN0YSxcbiAgICAgICAgc3BlZWQ6IHNwZWVkLFxuICAgICAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgIHN0b3A6IHN0b3BpdCxcbiAgICAgICAgcGF1c2U6IHBhdXNlLFxuICAgICAgICByZXN1bWU6IHJlc3VtZSxcbiAgICAgICAgdXBkYXRlOiB1cGRhdGVcbiAgICAgIH07XG4gICAgICBhbmltYXRpb25zW2FuaW0uaWRdID0gYW5pbTtcbiAgICAgIHZhciBsZW4gPSAwLFxuICAgICAgICAgIGk7XG5cbiAgICAgIGZvciAoaSBpbiBhbmltYXRpb25zKSBpZiAoYW5pbWF0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICBsZW4rKztcblxuICAgICAgICBpZiAobGVuID09IDIpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBsZW4gPT0gMSAmJiBmcmFtZSgpO1xuICAgICAgcmV0dXJuIGFuaW07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogbWluYS50aW1lXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHRpbWUuIEVxdWl2YWxlbnQgdG86XG4gICAgIHwgZnVuY3Rpb24gKCkge1xuICAgICB8ICAgICByZXR1cm4gKG5ldyBEYXRlKS5nZXRUaW1lKCk7XG4gICAgIHwgfVxuICAgIFxcKi9cblxuXG4gICAgbWluYS50aW1lID0gdGltZXI7XG4gICAgLypcXFxuICAgICAqIG1pbmEuZ2V0QnlJZFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBhbiBhbmltYXRpb24gYnkgaXRzIGlkXG4gICAgIC0gaWQgKHN0cmluZykgYW5pbWF0aW9uJ3MgaWRcbiAgICAgPSAob2JqZWN0KSBTZWUgQG1pbmFcbiAgICBcXCovXG5cbiAgICBtaW5hLmdldEJ5SWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHJldHVybiBhbmltYXRpb25zW2lkXSB8fCBudWxsO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIG1pbmEubGluZWFyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEZWZhdWx0IGxpbmVhciBlYXNpbmdcbiAgICAgLSBuIChudW1iZXIpIGlucHV0IDAuLjFcbiAgICAgPSAobnVtYmVyKSBvdXRwdXQgMC4uMVxuICAgIFxcKi9cblxuXG4gICAgbWluYS5saW5lYXIgPSBmdW5jdGlvbiAobikge1xuICAgICAgcmV0dXJuIG47XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogbWluYS5lYXNlb3V0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBFYXNlb3V0IGVhc2luZ1xuICAgICAtIG4gKG51bWJlcikgaW5wdXQgMC4uMVxuICAgICA9IChudW1iZXIpIG91dHB1dCAwLi4xXG4gICAgXFwqL1xuXG5cbiAgICBtaW5hLmVhc2VvdXQgPSBmdW5jdGlvbiAobikge1xuICAgICAgcmV0dXJuIE1hdGgucG93KG4sIDEuNyk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogbWluYS5lYXNlaW5cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEVhc2VpbiBlYXNpbmdcbiAgICAgLSBuIChudW1iZXIpIGlucHV0IDAuLjFcbiAgICAgPSAobnVtYmVyKSBvdXRwdXQgMC4uMVxuICAgIFxcKi9cblxuXG4gICAgbWluYS5lYXNlaW4gPSBmdW5jdGlvbiAobikge1xuICAgICAgcmV0dXJuIE1hdGgucG93KG4sIC40OCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogbWluYS5lYXNlaW5vdXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEVhc2Vpbm91dCBlYXNpbmdcbiAgICAgLSBuIChudW1iZXIpIGlucHV0IDAuLjFcbiAgICAgPSAobnVtYmVyKSBvdXRwdXQgMC4uMVxuICAgIFxcKi9cblxuXG4gICAgbWluYS5lYXNlaW5vdXQgPSBmdW5jdGlvbiAobikge1xuICAgICAgaWYgKG4gPT0gMSkge1xuICAgICAgICByZXR1cm4gMTtcbiAgICAgIH1cblxuICAgICAgaWYgKG4gPT0gMCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cblxuICAgICAgdmFyIHEgPSAuNDggLSBuIC8gMS4wNCxcbiAgICAgICAgICBRID0gTWF0aC5zcXJ0KC4xNzM0ICsgcSAqIHEpLFxuICAgICAgICAgIHggPSBRIC0gcSxcbiAgICAgICAgICBYID0gTWF0aC5wb3coTWF0aC5hYnMoeCksIDEgLyAzKSAqICh4IDwgMCA/IC0xIDogMSksXG4gICAgICAgICAgeSA9IC1RIC0gcSxcbiAgICAgICAgICBZID0gTWF0aC5wb3coTWF0aC5hYnMoeSksIDEgLyAzKSAqICh5IDwgMCA/IC0xIDogMSksXG4gICAgICAgICAgdCA9IFggKyBZICsgLjU7XG4gICAgICByZXR1cm4gKDEgLSB0KSAqIDMgKiB0ICogdCArIHQgKiB0ICogdDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBtaW5hLmJhY2tpblxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQmFja2luIGVhc2luZ1xuICAgICAtIG4gKG51bWJlcikgaW5wdXQgMC4uMVxuICAgICA9IChudW1iZXIpIG91dHB1dCAwLi4xXG4gICAgXFwqL1xuXG5cbiAgICBtaW5hLmJhY2tpbiA9IGZ1bmN0aW9uIChuKSB7XG4gICAgICBpZiAobiA9PSAxKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgICAgfVxuXG4gICAgICB2YXIgcyA9IDEuNzAxNTg7XG4gICAgICByZXR1cm4gbiAqIG4gKiAoKHMgKyAxKSAqIG4gLSBzKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBtaW5hLmJhY2tvdXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEJhY2tvdXQgZWFzaW5nXG4gICAgIC0gbiAobnVtYmVyKSBpbnB1dCAwLi4xXG4gICAgID0gKG51bWJlcikgb3V0cHV0IDAuLjFcbiAgICBcXCovXG5cblxuICAgIG1pbmEuYmFja291dCA9IGZ1bmN0aW9uIChuKSB7XG4gICAgICBpZiAobiA9PSAwKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuXG4gICAgICBuID0gbiAtIDE7XG4gICAgICB2YXIgcyA9IDEuNzAxNTg7XG4gICAgICByZXR1cm4gbiAqIG4gKiAoKHMgKyAxKSAqIG4gKyBzKSArIDE7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogbWluYS5lbGFzdGljXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBFbGFzdGljIGVhc2luZ1xuICAgICAtIG4gKG51bWJlcikgaW5wdXQgMC4uMVxuICAgICA9IChudW1iZXIpIG91dHB1dCAwLi4xXG4gICAgXFwqL1xuXG5cbiAgICBtaW5hLmVsYXN0aWMgPSBmdW5jdGlvbiAobikge1xuICAgICAgaWYgKG4gPT0gISFuKSB7XG4gICAgICAgIHJldHVybiBuO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gTWF0aC5wb3coMiwgLTEwICogbikgKiBNYXRoLnNpbigobiAtIC4wNzUpICogKDIgKiBNYXRoLlBJKSAvIC4zKSArIDE7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogbWluYS5ib3VuY2VcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEJvdW5jZSBlYXNpbmdcbiAgICAgLSBuIChudW1iZXIpIGlucHV0IDAuLjFcbiAgICAgPSAobnVtYmVyKSBvdXRwdXQgMC4uMVxuICAgIFxcKi9cblxuXG4gICAgbWluYS5ib3VuY2UgPSBmdW5jdGlvbiAobikge1xuICAgICAgdmFyIHMgPSA3LjU2MjUsXG4gICAgICAgICAgcCA9IDIuNzUsXG4gICAgICAgICAgbDtcblxuICAgICAgaWYgKG4gPCAxIC8gcCkge1xuICAgICAgICBsID0gcyAqIG4gKiBuO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG4gPCAyIC8gcCkge1xuICAgICAgICAgIG4gLT0gMS41IC8gcDtcbiAgICAgICAgICBsID0gcyAqIG4gKiBuICsgLjc1O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChuIDwgMi41IC8gcCkge1xuICAgICAgICAgICAgbiAtPSAyLjI1IC8gcDtcbiAgICAgICAgICAgIGwgPSBzICogbiAqIG4gKyAuOTM3NTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbiAtPSAyLjYyNSAvIHA7XG4gICAgICAgICAgICBsID0gcyAqIG4gKiBuICsgLjk4NDM3NTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGw7XG4gICAgfTtcblxuICAgIHdpbmRvdy5taW5hID0gbWluYTtcbiAgICByZXR1cm4gbWluYTtcbiAgfSh0eXBlb2YgZXZlID09IFwidW5kZWZpbmVkXCIgPyBmdW5jdGlvbiAoKSB7fSA6IGV2ZSk7IC8vIENvcHlyaWdodCAoYykgMjAxMyAtIDIwMTcgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gIC8vXG4gIC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIC8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gIC8vXG4gIC8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAvL1xuICAvLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIC8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIC8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cblxuICB2YXIgU25hcCA9IGZ1bmN0aW9uIChyb290KSB7XG4gICAgU25hcC52ZXJzaW9uID0gXCIwLjUuMVwiO1xuICAgIC8qXFxcbiAgICAgKiBTbmFwXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGEgZHJhd2luZyBzdXJmYWNlIG9yIHdyYXBzIGV4aXN0aW5nIFNWRyBlbGVtZW50LlxuICAgICAqKlxuICAgICAtIHdpZHRoIChudW1iZXJ8c3RyaW5nKSB3aWR0aCBvZiBzdXJmYWNlXG4gICAgIC0gaGVpZ2h0IChudW1iZXJ8c3RyaW5nKSBoZWlnaHQgb2Ygc3VyZmFjZVxuICAgICAqIG9yXG4gICAgIC0gRE9NIChTVkdFbGVtZW50KSBlbGVtZW50IHRvIGJlIHdyYXBwZWQgaW50byBTbmFwIHN0cnVjdHVyZVxuICAgICAqIG9yXG4gICAgIC0gYXJyYXkgKGFycmF5KSBhcnJheSBvZiBlbGVtZW50cyAod2lsbCByZXR1cm4gc2V0IG9mIGVsZW1lbnRzKVxuICAgICAqIG9yXG4gICAgIC0gcXVlcnkgKHN0cmluZykgQ1NTIHF1ZXJ5IHNlbGVjdG9yXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG5cbiAgICBmdW5jdGlvbiBTbmFwKHcsIGgpIHtcbiAgICAgIGlmICh3KSB7XG4gICAgICAgIGlmICh3Lm5vZGVUeXBlKSB7XG4gICAgICAgICAgcmV0dXJuIHdyYXAodyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXModywgXCJhcnJheVwiKSAmJiBTbmFwLnNldCkge1xuICAgICAgICAgIHJldHVybiBTbmFwLnNldC5hcHBseShTbmFwLCB3KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3IGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgIHJldHVybiB3O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGggPT0gbnVsbCkge1xuICAgICAgICAgIC8vIHRyeSB7XG4gICAgICAgICAgdyA9IGdsb2IuZG9jLnF1ZXJ5U2VsZWN0b3IoU3RyaW5nKHcpKTtcbiAgICAgICAgICByZXR1cm4gd3JhcCh3KTsgLy8gfSBjYXRjaCAoZSkge1xuICAgICAgICAgIC8vIHJldHVybiBudWxsO1xuICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB3ID0gdyA9PSBudWxsID8gXCIxMDAlXCIgOiB3O1xuICAgICAgaCA9IGggPT0gbnVsbCA/IFwiMTAwJVwiIDogaDtcbiAgICAgIHJldHVybiBuZXcgUGFwZXIodywgaCk7XG4gICAgfVxuXG4gICAgU25hcC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBcIlNuYXAgdlwiICsgdGhpcy52ZXJzaW9uO1xuICAgIH07XG5cbiAgICBTbmFwLl8gPSB7fTtcbiAgICB2YXIgZ2xvYiA9IHtcbiAgICAgIHdpbjogcm9vdC53aW5kb3csXG4gICAgICBkb2M6IHJvb3Qud2luZG93LmRvY3VtZW50XG4gICAgfTtcbiAgICBTbmFwLl8uZ2xvYiA9IGdsb2I7XG5cbiAgICB2YXIgaGFzID0gXCJoYXNPd25Qcm9wZXJ0eVwiLFxuICAgICAgICBTdHIgPSBTdHJpbmcsXG4gICAgICAgIHRvRmxvYXQgPSBwYXJzZUZsb2F0LFxuICAgICAgICB0b0ludCA9IHBhcnNlSW50LFxuICAgICAgICBtYXRoID0gTWF0aCxcbiAgICAgICAgbW1heCA9IG1hdGgubWF4LFxuICAgICAgICBtbWluID0gbWF0aC5taW4sXG4gICAgICAgIGFicyA9IG1hdGguYWJzLFxuICAgICAgICBwb3cgPSBtYXRoLnBvdyxcbiAgICAgICAgUEkgPSBtYXRoLlBJLFxuICAgICAgICByb3VuZCA9IG1hdGgucm91bmQsXG4gICAgICAgIEUgPSBcIlwiLFxuICAgICAgICBTID0gXCIgXCIsXG4gICAgICAgIG9iamVjdFRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyxcbiAgICAgICAgSVNVUkwgPSAvXnVybFxcKFsnXCJdPyhbXlxcKV0rPylbJ1wiXT9cXCkkL2ksXG4gICAgICAgIGNvbG91clJlZ0V4cCA9IC9eXFxzKigoI1thLWZcXGRdezZ9KXwoI1thLWZcXGRdezN9KXxyZ2JhP1xcKFxccyooW1xcZFxcLl0rJT9cXHMqLFxccypbXFxkXFwuXSslP1xccyosXFxzKltcXGRcXC5dKyU/KD86XFxzKixcXHMqW1xcZFxcLl0rJT8pPylcXHMqXFwpfGhzYmE/XFwoXFxzKihbXFxkXFwuXSsoPzpkZWd8XFx4YjB8JSk/XFxzKixcXHMqW1xcZFxcLl0rJT9cXHMqLFxccypbXFxkXFwuXSsoPzolP1xccyosXFxzKltcXGRcXC5dKyk/JT8pXFxzKlxcKXxoc2xhP1xcKFxccyooW1xcZFxcLl0rKD86ZGVnfFxceGIwfCUpP1xccyosXFxzKltcXGRcXC5dKyU/XFxzKixcXHMqW1xcZFxcLl0rKD86JT9cXHMqLFxccypbXFxkXFwuXSspPyU/KVxccypcXCkpXFxzKiQvaSxcbiAgICAgICAgYmV6aWVycmcgPSAvXig/OmN1YmljLSk/YmV6aWVyXFwoKFteLF0rKSwoW14sXSspLChbXixdKyksKFteXFwpXSspXFwpLyxcbiAgICAgICAgc2VwYXJhdG9yID0gU25hcC5fLnNlcGFyYXRvciA9IC9bLFxcc10rLyxcbiAgICAgICAgd2hpdGVzcGFjZSA9IC9bXFxzXS9nLFxuICAgICAgICBjb21tYVNwYWNlcyA9IC9bXFxzXSosW1xcc10qLyxcbiAgICAgICAgaHNyZyA9IHtcbiAgICAgIGhzOiAxLFxuICAgICAgcmc6IDFcbiAgICB9LFxuICAgICAgICBwYXRoQ29tbWFuZCA9IC8oW2Etel0pW1xccyxdKigoLT9cXGQqXFwuP1xcZCooPzplW1xcLStdP1xcZCspP1tcXHNdKiw/W1xcc10qKSspL2lnLFxuICAgICAgICB0Q29tbWFuZCA9IC8oW3JzdG1dKVtcXHMsXSooKC0/XFxkKlxcLj9cXGQqKD86ZVtcXC0rXT9cXGQrKT9bXFxzXSosP1tcXHNdKikrKS9pZyxcbiAgICAgICAgcGF0aFZhbHVlcyA9IC8oLT9cXGQqXFwuP1xcZCooPzplW1xcLStdP1xcZCspPylbXFxzXSosP1tcXHNdKi9pZyxcbiAgICAgICAgaWRnZW4gPSAwLFxuICAgICAgICBpZHByZWZpeCA9IFwiU1wiICsgKCtuZXcgRGF0ZSgpKS50b1N0cmluZygzNiksXG4gICAgICAgIElEID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICByZXR1cm4gKGVsICYmIGVsLnR5cGUgPyBlbC50eXBlIDogRSkgKyBpZHByZWZpeCArIChpZGdlbisrKS50b1N0cmluZygzNik7XG4gICAgfSxcbiAgICAgICAgeGxpbmsgPSBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixcbiAgICAgICAgeG1sbnMgPSBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXG4gICAgICAgIGh1YiA9IHt9LFxuXG4gICAgLypcXFxuICAgICAqIFNuYXAudXJsXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBXcmFwcyBwYXRoIGludG8gYFwidXJsKCc8cGF0aD4nKVwiYC5cbiAgICAgLSB2YWx1ZSAoc3RyaW5nKSBwYXRoXG4gICAgID0gKHN0cmluZykgd3JhcHBlZCBwYXRoXG4gICAgXFwqL1xuICAgIFVSTCA9IFNuYXAudXJsID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgcmV0dXJuIFwidXJsKCcjXCIgKyB1cmwgKyBcIicpXCI7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uICQoZWwsIGF0dHIpIHtcbiAgICAgIGlmIChhdHRyKSB7XG4gICAgICAgIGlmIChlbCA9PSBcIiN0ZXh0XCIpIHtcbiAgICAgICAgICBlbCA9IGdsb2IuZG9jLmNyZWF0ZVRleHROb2RlKGF0dHIudGV4dCB8fCBhdHRyW1wiI3RleHRcIl0gfHwgXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZWwgPT0gXCIjY29tbWVudFwiKSB7XG4gICAgICAgICAgZWwgPSBnbG9iLmRvYy5jcmVhdGVDb21tZW50KGF0dHIudGV4dCB8fCBhdHRyW1wiI3RleHRcIl0gfHwgXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGVsID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICBlbCA9ICQoZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhdHRyID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICBpZiAoZWwubm9kZVR5cGUgPT0gMSkge1xuICAgICAgICAgICAgaWYgKGF0dHIuc3Vic3RyaW5nKDAsIDYpID09IFwieGxpbms6XCIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZU5TKHhsaW5rLCBhdHRyLnN1YnN0cmluZyg2KSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhdHRyLnN1YnN0cmluZygwLCA0KSA9PSBcInhtbDpcIikge1xuICAgICAgICAgICAgICByZXR1cm4gZWwuZ2V0QXR0cmlidXRlTlMoeG1sbnMsIGF0dHIuc3Vic3RyaW5nKDQpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGVsLmdldEF0dHJpYnV0ZShhdHRyKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGF0dHIgPT0gXCJ0ZXh0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBlbC5ub2RlVmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbC5ub2RlVHlwZSA9PSAxKSB7XG4gICAgICAgICAgZm9yICh2YXIga2V5IGluIGF0dHIpIGlmIChhdHRyW2hhc10oa2V5KSkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IFN0cihhdHRyW2tleV0pO1xuXG4gICAgICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICAgIGlmIChrZXkuc3Vic3RyaW5nKDAsIDYpID09IFwieGxpbms6XCIpIHtcbiAgICAgICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyh4bGluaywga2V5LnN1YnN0cmluZyg2KSwgdmFsKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkuc3Vic3RyaW5nKDAsIDQpID09IFwieG1sOlwiKSB7XG4gICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMoeG1sbnMsIGtleS5zdWJzdHJpbmcoNCksIHZhbCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKGtleSwgdmFsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZWwucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKFwidGV4dFwiIGluIGF0dHIpIHtcbiAgICAgICAgICBlbC5ub2RlVmFsdWUgPSBhdHRyLnRleHQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsID0gZ2xvYi5kb2MuY3JlYXRlRWxlbWVudE5TKHhtbG5zLCBlbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBlbDtcbiAgICB9XG5cbiAgICBTbmFwLl8uJCA9ICQ7XG4gICAgU25hcC5fLmlkID0gSUQ7XG5cbiAgICBmdW5jdGlvbiBnZXRBdHRycyhlbCkge1xuICAgICAgdmFyIGF0dHJzID0gZWwuYXR0cmlidXRlcyxcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIG91dCA9IHt9O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGF0dHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhdHRyc1tpXS5uYW1lc3BhY2VVUkkgPT0geGxpbmspIHtcbiAgICAgICAgICBuYW1lID0gXCJ4bGluazpcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuYW1lID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIG5hbWUgKz0gYXR0cnNbaV0ubmFtZTtcbiAgICAgICAgb3V0W25hbWVdID0gYXR0cnNbaV0udGV4dENvbnRlbnQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXMobywgdHlwZSkge1xuICAgICAgdHlwZSA9IFN0ci5wcm90b3R5cGUudG9Mb3dlckNhc2UuY2FsbCh0eXBlKTtcblxuICAgICAgaWYgKHR5cGUgPT0gXCJmaW5pdGVcIikge1xuICAgICAgICByZXR1cm4gaXNGaW5pdGUobyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlID09IFwiYXJyYXlcIiAmJiAobyBpbnN0YW5jZW9mIEFycmF5IHx8IEFycmF5LmlzQXJyYXkgJiYgQXJyYXkuaXNBcnJheShvKSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0eXBlID09IFwibnVsbFwiICYmIG8gPT09IG51bGwgfHwgdHlwZSA9PSB0eXBlb2YgbyAmJiBvICE9PSBudWxsIHx8IHR5cGUgPT0gXCJvYmplY3RcIiAmJiBvID09PSBPYmplY3QobykgfHwgb2JqZWN0VG9TdHJpbmcuY2FsbChvKS5zbGljZSg4LCAtMSkudG9Mb3dlckNhc2UoKSA9PSB0eXBlO1xuICAgIH1cbiAgICAvKlxcXG4gICAgICogU25hcC5mb3JtYXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlcGxhY2VzIGNvbnN0cnVjdGlvbiBvZiB0eXBlIGB7PG5hbWU+fWAgdG8gdGhlIGNvcnJlc3BvbmRpbmcgYXJndW1lbnRcbiAgICAgKipcbiAgICAgLSB0b2tlbiAoc3RyaW5nKSBzdHJpbmcgdG8gZm9ybWF0XG4gICAgIC0ganNvbiAob2JqZWN0KSBvYmplY3Qgd2hpY2ggcHJvcGVydGllcyBhcmUgdXNlZCBhcyBhIHJlcGxhY2VtZW50XG4gICAgID0gKHN0cmluZykgZm9ybWF0dGVkIHN0cmluZ1xuICAgICA+IFVzYWdlXG4gICAgIHwgLy8gdGhpcyBkcmF3cyBhIHJlY3Rhbmd1bGFyIHNoYXBlIGVxdWl2YWxlbnQgdG8gXCJNMTAsMjBoNDB2NTBoLTQwelwiXG4gICAgIHwgcGFwZXIucGF0aChTbmFwLmZvcm1hdChcIk17eH0se3l9aHtkaW0ud2lkdGh9dntkaW0uaGVpZ2h0fWh7ZGltWyduZWdhdGl2ZSB3aWR0aCddfXpcIiwge1xuICAgICB8ICAgICB4OiAxMCxcbiAgICAgfCAgICAgeTogMjAsXG4gICAgIHwgICAgIGRpbToge1xuICAgICB8ICAgICAgICAgd2lkdGg6IDQwLFxuICAgICB8ICAgICAgICAgaGVpZ2h0OiA1MCxcbiAgICAgfCAgICAgICAgIFwibmVnYXRpdmUgd2lkdGhcIjogLTQwXG4gICAgIHwgICAgIH1cbiAgICAgfCB9KSk7XG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB0b2tlblJlZ2V4ID0gL1xceyhbXlxcfV0rKVxcfS9nLFxuICAgICAgICAgIG9iak5vdGF0aW9uUmVnZXggPSAvKD86KD86XnxcXC4pKC4rPykoPz1cXFt8XFwufCR8XFwoKXxcXFsoJ3xcIikoLis/KVxcMlxcXSkoXFwoXFwpKT8vZyxcbiAgICAgICAgICAvLyBtYXRjaGVzIC54eHh4eCBvciBbXCJ4eHh4eFwiXSB0byBydW4gb3ZlciBvYmplY3QgcHJvcGVydGllc1xuICAgICAgcmVwbGFjZXIgPSBmdW5jdGlvbiAoYWxsLCBrZXksIG9iaikge1xuICAgICAgICB2YXIgcmVzID0gb2JqO1xuICAgICAgICBrZXkucmVwbGFjZShvYmpOb3RhdGlvblJlZ2V4LCBmdW5jdGlvbiAoYWxsLCBuYW1lLCBxdW90ZSwgcXVvdGVkTmFtZSwgaXNGdW5jKSB7XG4gICAgICAgICAgbmFtZSA9IG5hbWUgfHwgcXVvdGVkTmFtZTtcblxuICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgIGlmIChuYW1lIGluIHJlcykge1xuICAgICAgICAgICAgICByZXMgPSByZXNbbmFtZV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHR5cGVvZiByZXMgPT0gXCJmdW5jdGlvblwiICYmIGlzRnVuYyAmJiAocmVzID0gcmVzKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJlcyA9IChyZXMgPT0gbnVsbCB8fCByZXMgPT0gb2JqID8gYWxsIDogcmVzKSArIFwiXCI7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9O1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHN0ciwgb2JqKSB7XG4gICAgICAgIHJldHVybiBTdHIoc3RyKS5yZXBsYWNlKHRva2VuUmVnZXgsIGZ1bmN0aW9uIChhbGwsIGtleSkge1xuICAgICAgICAgIHJldHVybiByZXBsYWNlcihhbGwsIGtleSwgb2JqKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0oKTtcblxuICAgIGZ1bmN0aW9uIGNsb25lKG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmogPT0gXCJmdW5jdGlvblwiIHx8IE9iamVjdChvYmopICE9PSBvYmopIHtcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcyA9IG5ldyBvYmouY29uc3RydWN0b3IoKTtcblxuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKG9ialtoYXNdKGtleSkpIHtcbiAgICAgICAgcmVzW2tleV0gPSBjbG9uZShvYmpba2V5XSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgU25hcC5fLmNsb25lID0gY2xvbmU7XG5cbiAgICBmdW5jdGlvbiByZXB1c2goYXJyYXksIGl0ZW0pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGFycmF5Lmxlbmd0aDsgaSA8IGlpOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkge1xuICAgICAgICByZXR1cm4gYXJyYXkucHVzaChhcnJheS5zcGxpY2UoaSwgMSlbMF0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNhY2hlcihmLCBzY29wZSwgcG9zdHByb2Nlc3Nvcikge1xuICAgICAgZnVuY3Rpb24gbmV3ZigpIHtcbiAgICAgICAgdmFyIGFyZyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCksXG4gICAgICAgICAgICBhcmdzID0gYXJnLmpvaW4oXCJcXHUyNDAwXCIpLFxuICAgICAgICAgICAgY2FjaGUgPSBuZXdmLmNhY2hlID0gbmV3Zi5jYWNoZSB8fCB7fSxcbiAgICAgICAgICAgIGNvdW50ID0gbmV3Zi5jb3VudCA9IG5ld2YuY291bnQgfHwgW107XG5cbiAgICAgICAgaWYgKGNhY2hlW2hhc10oYXJncykpIHtcbiAgICAgICAgICByZXB1c2goY291bnQsIGFyZ3MpO1xuICAgICAgICAgIHJldHVybiBwb3N0cHJvY2Vzc29yID8gcG9zdHByb2Nlc3NvcihjYWNoZVthcmdzXSkgOiBjYWNoZVthcmdzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvdW50Lmxlbmd0aCA+PSAxZTMgJiYgZGVsZXRlIGNhY2hlW2NvdW50LnNoaWZ0KCldO1xuICAgICAgICBjb3VudC5wdXNoKGFyZ3MpO1xuICAgICAgICBjYWNoZVthcmdzXSA9IGYuYXBwbHkoc2NvcGUsIGFyZyk7XG4gICAgICAgIHJldHVybiBwb3N0cHJvY2Vzc29yID8gcG9zdHByb2Nlc3NvcihjYWNoZVthcmdzXSkgOiBjYWNoZVthcmdzXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ld2Y7XG4gICAgfVxuXG4gICAgU25hcC5fLmNhY2hlciA9IGNhY2hlcjtcblxuICAgIGZ1bmN0aW9uIGFuZ2xlKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMpIHtcbiAgICAgIGlmICh4MyA9PSBudWxsKSB7XG4gICAgICAgIHZhciB4ID0geDEgLSB4MixcbiAgICAgICAgICAgIHkgPSB5MSAtIHkyO1xuXG4gICAgICAgIGlmICgheCAmJiAheSkge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgxODAgKyBtYXRoLmF0YW4yKC15LCAteCkgKiAxODAgLyBQSSArIDM2MCkgJSAzNjA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYW5nbGUoeDEsIHkxLCB4MywgeTMpIC0gYW5nbGUoeDIsIHkyLCB4MywgeTMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJhZChkZWcpIHtcbiAgICAgIHJldHVybiBkZWcgJSAzNjAgKiBQSSAvIDE4MDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkZWcocmFkKSB7XG4gICAgICByZXR1cm4gcmFkICogMTgwIC8gUEkgJSAzNjA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24geF95KCkge1xuICAgICAgcmV0dXJuIHRoaXMueCArIFMgKyB0aGlzLnk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24geF95X3dfaCgpIHtcbiAgICAgIHJldHVybiB0aGlzLnggKyBTICsgdGhpcy55ICsgUyArIHRoaXMud2lkdGggKyBcIiBcXHhkNyBcIiArIHRoaXMuaGVpZ2h0O1xuICAgIH1cbiAgICAvKlxcXG4gICAgICogU25hcC5yYWRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFRyYW5zZm9ybSBhbmdsZSB0byByYWRpYW5zXG4gICAgIC0gZGVnIChudW1iZXIpIGFuZ2xlIGluIGRlZ3JlZXNcbiAgICAgPSAobnVtYmVyKSBhbmdsZSBpbiByYWRpYW5zXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLnJhZCA9IHJhZDtcbiAgICAvKlxcXG4gICAgICogU25hcC5kZWdcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFRyYW5zZm9ybSBhbmdsZSB0byBkZWdyZWVzXG4gICAgIC0gcmFkIChudW1iZXIpIGFuZ2xlIGluIHJhZGlhbnNcbiAgICAgPSAobnVtYmVyKSBhbmdsZSBpbiBkZWdyZWVzXG4gICAgXFwqL1xuXG4gICAgU25hcC5kZWcgPSBkZWc7XG4gICAgLypcXFxuICAgICAqIFNuYXAuc2luXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBFcXVpdmFsZW50IHRvIGBNYXRoLnNpbigpYCBvbmx5IHdvcmtzIHdpdGggZGVncmVlcywgbm90IHJhZGlhbnMuXG4gICAgIC0gYW5nbGUgKG51bWJlcikgYW5nbGUgaW4gZGVncmVlc1xuICAgICA9IChudW1iZXIpIHNpblxuICAgIFxcKi9cblxuICAgIFNuYXAuc2luID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG4gICAgICByZXR1cm4gbWF0aC5zaW4oU25hcC5yYWQoYW5nbGUpKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLnRhblxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRXF1aXZhbGVudCB0byBgTWF0aC50YW4oKWAgb25seSB3b3JrcyB3aXRoIGRlZ3JlZXMsIG5vdCByYWRpYW5zLlxuICAgICAtIGFuZ2xlIChudW1iZXIpIGFuZ2xlIGluIGRlZ3JlZXNcbiAgICAgPSAobnVtYmVyKSB0YW5cbiAgICBcXCovXG5cblxuICAgIFNuYXAudGFuID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG4gICAgICByZXR1cm4gbWF0aC50YW4oU25hcC5yYWQoYW5nbGUpKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmNvc1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRXF1aXZhbGVudCB0byBgTWF0aC5jb3MoKWAgb25seSB3b3JrcyB3aXRoIGRlZ3JlZXMsIG5vdCByYWRpYW5zLlxuICAgICAtIGFuZ2xlIChudW1iZXIpIGFuZ2xlIGluIGRlZ3JlZXNcbiAgICAgPSAobnVtYmVyKSBjb3NcbiAgICBcXCovXG5cblxuICAgIFNuYXAuY29zID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG4gICAgICByZXR1cm4gbWF0aC5jb3MoU25hcC5yYWQoYW5nbGUpKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmFzaW5cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEVxdWl2YWxlbnQgdG8gYE1hdGguYXNpbigpYCBvbmx5IHdvcmtzIHdpdGggZGVncmVlcywgbm90IHJhZGlhbnMuXG4gICAgIC0gbnVtIChudW1iZXIpIHZhbHVlXG4gICAgID0gKG51bWJlcikgYXNpbiBpbiBkZWdyZWVzXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmFzaW4gPSBmdW5jdGlvbiAobnVtKSB7XG4gICAgICByZXR1cm4gU25hcC5kZWcobWF0aC5hc2luKG51bSkpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNuYXAuYWNvc1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRXF1aXZhbGVudCB0byBgTWF0aC5hY29zKClgIG9ubHkgd29ya3Mgd2l0aCBkZWdyZWVzLCBub3QgcmFkaWFucy5cbiAgICAgLSBudW0gKG51bWJlcikgdmFsdWVcbiAgICAgPSAobnVtYmVyKSBhY29zIGluIGRlZ3JlZXNcbiAgICBcXCovXG5cblxuICAgIFNuYXAuYWNvcyA9IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgIHJldHVybiBTbmFwLmRlZyhtYXRoLmFjb3MobnVtKSk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5hdGFuXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBFcXVpdmFsZW50IHRvIGBNYXRoLmF0YW4oKWAgb25seSB3b3JrcyB3aXRoIGRlZ3JlZXMsIG5vdCByYWRpYW5zLlxuICAgICAtIG51bSAobnVtYmVyKSB2YWx1ZVxuICAgICA9IChudW1iZXIpIGF0YW4gaW4gZGVncmVlc1xuICAgIFxcKi9cblxuXG4gICAgU25hcC5hdGFuID0gZnVuY3Rpb24gKG51bSkge1xuICAgICAgcmV0dXJuIFNuYXAuZGVnKG1hdGguYXRhbihudW0pKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmF0YW4yXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBFcXVpdmFsZW50IHRvIGBNYXRoLmF0YW4yKClgIG9ubHkgd29ya3Mgd2l0aCBkZWdyZWVzLCBub3QgcmFkaWFucy5cbiAgICAgLSBudW0gKG51bWJlcikgdmFsdWVcbiAgICAgPSAobnVtYmVyKSBhdGFuMiBpbiBkZWdyZWVzXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmF0YW4yID0gZnVuY3Rpb24gKG51bSkge1xuICAgICAgcmV0dXJuIFNuYXAuZGVnKG1hdGguYXRhbjIobnVtKSk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5hbmdsZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBhbiBhbmdsZSBiZXR3ZWVuIHR3byBvciB0aHJlZSBwb2ludHNcbiAgICAgLSB4MSAobnVtYmVyKSB4IGNvb3JkIG9mIGZpcnN0IHBvaW50XG4gICAgIC0geTEgKG51bWJlcikgeSBjb29yZCBvZiBmaXJzdCBwb2ludFxuICAgICAtIHgyIChudW1iZXIpIHggY29vcmQgb2Ygc2Vjb25kIHBvaW50XG4gICAgIC0geTIgKG51bWJlcikgeSBjb29yZCBvZiBzZWNvbmQgcG9pbnRcbiAgICAgLSB4MyAobnVtYmVyKSAjb3B0aW9uYWwgeCBjb29yZCBvZiB0aGlyZCBwb2ludFxuICAgICAtIHkzIChudW1iZXIpICNvcHRpb25hbCB5IGNvb3JkIG9mIHRoaXJkIHBvaW50XG4gICAgID0gKG51bWJlcikgYW5nbGUgaW4gZGVncmVlc1xuICAgIFxcKi9cblxuXG4gICAgU25hcC5hbmdsZSA9IGFuZ2xlO1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmxlblxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbiAgICAgLSB4MSAobnVtYmVyKSB4IGNvb3JkIG9mIGZpcnN0IHBvaW50XG4gICAgIC0geTEgKG51bWJlcikgeSBjb29yZCBvZiBmaXJzdCBwb2ludFxuICAgICAtIHgyIChudW1iZXIpIHggY29vcmQgb2Ygc2Vjb25kIHBvaW50XG4gICAgIC0geTIgKG51bWJlcikgeSBjb29yZCBvZiBzZWNvbmQgcG9pbnRcbiAgICAgPSAobnVtYmVyKSBkaXN0YW5jZVxuICAgIFxcKi9cblxuICAgIFNuYXAubGVuID0gZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICByZXR1cm4gTWF0aC5zcXJ0KFNuYXAubGVuMih4MSwgeTEsIHgyLCB5MikpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNuYXAubGVuMlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuICAgICAtIHgxIChudW1iZXIpIHggY29vcmQgb2YgZmlyc3QgcG9pbnRcbiAgICAgLSB5MSAobnVtYmVyKSB5IGNvb3JkIG9mIGZpcnN0IHBvaW50XG4gICAgIC0geDIgKG51bWJlcikgeCBjb29yZCBvZiBzZWNvbmQgcG9pbnRcbiAgICAgLSB5MiAobnVtYmVyKSB5IGNvb3JkIG9mIHNlY29uZCBwb2ludFxuICAgICA9IChudW1iZXIpIGRpc3RhbmNlXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmxlbjIgPSBmdW5jdGlvbiAoeDEsIHkxLCB4MiwgeTIpIHtcbiAgICAgIHJldHVybiAoeDEgLSB4MikgKiAoeDEgLSB4MikgKyAoeTEgLSB5MikgKiAoeTEgLSB5Mik7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5jbG9zZXN0UG9pbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgY2xvc2VzdCBwb2ludCB0byBhIGdpdmVuIG9uZSBvbiBhIGdpdmVuIHBhdGguXG4gICAgIC0gcGF0aCAoRWxlbWVudCkgcGF0aCBlbGVtZW50XG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkIG9mIGEgcG9pbnRcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmQgb2YgYSBwb2ludFxuICAgICA9IChvYmplY3QpIGluIGZvcm1hdFxuICAgICB7XG4gICAgICAgIHggKG51bWJlcikgeCBjb29yZCBvZiB0aGUgcG9pbnQgb24gdGhlIHBhdGhcbiAgICAgICAgeSAobnVtYmVyKSB5IGNvb3JkIG9mIHRoZSBwb2ludCBvbiB0aGUgcGF0aFxuICAgICAgICBsZW5ndGggKG51bWJlcikgbGVuZ3RoIG9mIHRoZSBwYXRoIHRvIHRoZSBwb2ludFxuICAgICAgICBkaXN0YW5jZSAobnVtYmVyKSBkaXN0YW5jZSBmcm9tIHRoZSBnaXZlbiBwb2ludCB0byB0aGUgcGF0aFxuICAgICB9XG4gICAgXFwqL1xuICAgIC8vIENvcGllZCBmcm9tIGh0dHA6Ly9ibC5vY2tzLm9yZy9tYm9zdG9jay84MDI3NjM3XG5cblxuICAgIFNuYXAuY2xvc2VzdFBvaW50ID0gZnVuY3Rpb24gKHBhdGgsIHgsIHkpIHtcbiAgICAgIGZ1bmN0aW9uIGRpc3RhbmNlMihwKSB7XG4gICAgICAgIHZhciBkeCA9IHAueCAtIHgsXG4gICAgICAgICAgICBkeSA9IHAueSAtIHk7XG4gICAgICAgIHJldHVybiBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBhdGhOb2RlID0gcGF0aC5ub2RlLFxuICAgICAgICAgIHBhdGhMZW5ndGggPSBwYXRoTm9kZS5nZXRUb3RhbExlbmd0aCgpLFxuICAgICAgICAgIHByZWNpc2lvbiA9IHBhdGhMZW5ndGggLyBwYXRoTm9kZS5wYXRoU2VnTGlzdC5udW1iZXJPZkl0ZW1zICogLjEyNSxcbiAgICAgICAgICBiZXN0LFxuICAgICAgICAgIGJlc3RMZW5ndGgsXG4gICAgICAgICAgYmVzdERpc3RhbmNlID0gSW5maW5pdHk7IC8vIGxpbmVhciBzY2FuIGZvciBjb2Fyc2UgYXBwcm94aW1hdGlvblxuXG4gICAgICBmb3IgKHZhciBzY2FuLCBzY2FuTGVuZ3RoID0gMCwgc2NhbkRpc3RhbmNlOyBzY2FuTGVuZ3RoIDw9IHBhdGhMZW5ndGg7IHNjYW5MZW5ndGggKz0gcHJlY2lzaW9uKSB7XG4gICAgICAgIGlmICgoc2NhbkRpc3RhbmNlID0gZGlzdGFuY2UyKHNjYW4gPSBwYXRoTm9kZS5nZXRQb2ludEF0TGVuZ3RoKHNjYW5MZW5ndGgpKSkgPCBiZXN0RGlzdGFuY2UpIHtcbiAgICAgICAgICBiZXN0ID0gc2NhbjtcbiAgICAgICAgICBiZXN0TGVuZ3RoID0gc2Nhbkxlbmd0aDtcbiAgICAgICAgICBiZXN0RGlzdGFuY2UgPSBzY2FuRGlzdGFuY2U7XG4gICAgICAgIH1cbiAgICAgIH0gLy8gYmluYXJ5IHNlYXJjaCBmb3IgcHJlY2lzZSBlc3RpbWF0ZVxuXG5cbiAgICAgIHByZWNpc2lvbiAqPSAuNTtcblxuICAgICAgd2hpbGUgKHByZWNpc2lvbiA+IC41KSB7XG4gICAgICAgIHZhciBiZWZvcmUsIGFmdGVyLCBiZWZvcmVMZW5ndGgsIGFmdGVyTGVuZ3RoLCBiZWZvcmVEaXN0YW5jZSwgYWZ0ZXJEaXN0YW5jZTtcblxuICAgICAgICBpZiAoKGJlZm9yZUxlbmd0aCA9IGJlc3RMZW5ndGggLSBwcmVjaXNpb24pID49IDAgJiYgKGJlZm9yZURpc3RhbmNlID0gZGlzdGFuY2UyKGJlZm9yZSA9IHBhdGhOb2RlLmdldFBvaW50QXRMZW5ndGgoYmVmb3JlTGVuZ3RoKSkpIDwgYmVzdERpc3RhbmNlKSB7XG4gICAgICAgICAgYmVzdCA9IGJlZm9yZTtcbiAgICAgICAgICBiZXN0TGVuZ3RoID0gYmVmb3JlTGVuZ3RoO1xuICAgICAgICAgIGJlc3REaXN0YW5jZSA9IGJlZm9yZURpc3RhbmNlO1xuICAgICAgICB9IGVsc2UgaWYgKChhZnRlckxlbmd0aCA9IGJlc3RMZW5ndGggKyBwcmVjaXNpb24pIDw9IHBhdGhMZW5ndGggJiYgKGFmdGVyRGlzdGFuY2UgPSBkaXN0YW5jZTIoYWZ0ZXIgPSBwYXRoTm9kZS5nZXRQb2ludEF0TGVuZ3RoKGFmdGVyTGVuZ3RoKSkpIDwgYmVzdERpc3RhbmNlKSB7XG4gICAgICAgICAgYmVzdCA9IGFmdGVyO1xuICAgICAgICAgIGJlc3RMZW5ndGggPSBhZnRlckxlbmd0aDtcbiAgICAgICAgICBiZXN0RGlzdGFuY2UgPSBhZnRlckRpc3RhbmNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByZWNpc2lvbiAqPSAuNTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBiZXN0ID0ge1xuICAgICAgICB4OiBiZXN0LngsXG4gICAgICAgIHk6IGJlc3QueSxcbiAgICAgICAgbGVuZ3RoOiBiZXN0TGVuZ3RoLFxuICAgICAgICBkaXN0YW5jZTogTWF0aC5zcXJ0KGJlc3REaXN0YW5jZSlcbiAgICAgIH07XG4gICAgICByZXR1cm4gYmVzdDtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmlzXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBIYW5keSByZXBsYWNlbWVudCBmb3IgdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gICAgIC0gbyAo4oCmKSBhbnkgb2JqZWN0IG9yIHByaW1pdGl2ZVxuICAgICAtIHR5cGUgKHN0cmluZykgbmFtZSBvZiB0aGUgdHlwZSwgZS5nLiwgYHN0cmluZ2AsIGBmdW5jdGlvbmAsIGBudW1iZXJgLCBldGMuXG4gICAgID0gKGJvb2xlYW4pIGB0cnVlYCBpZiBnaXZlbiB2YWx1ZSBpcyBvZiBnaXZlbiB0eXBlXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmlzID0gaXM7XG4gICAgLypcXFxuICAgICAqIFNuYXAuc25hcFRvXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTbmFwcyBnaXZlbiB2YWx1ZSB0byBnaXZlbiBncmlkXG4gICAgIC0gdmFsdWVzIChhcnJheXxudW1iZXIpIGdpdmVuIGFycmF5IG9mIHZhbHVlcyBvciBzdGVwIG9mIHRoZSBncmlkXG4gICAgIC0gdmFsdWUgKG51bWJlcikgdmFsdWUgdG8gYWRqdXN0XG4gICAgIC0gdG9sZXJhbmNlIChudW1iZXIpICNvcHRpb25hbCBtYXhpbXVtIGRpc3RhbmNlIHRvIHRoZSB0YXJnZXQgdmFsdWUgdGhhdCB3b3VsZCB0cmlnZ2VyIHRoZSBzbmFwLiBEZWZhdWx0IGlzIGAxMGAuXG4gICAgID0gKG51bWJlcikgYWRqdXN0ZWQgdmFsdWVcbiAgICBcXCovXG5cbiAgICBTbmFwLnNuYXBUbyA9IGZ1bmN0aW9uICh2YWx1ZXMsIHZhbHVlLCB0b2xlcmFuY2UpIHtcbiAgICAgIHRvbGVyYW5jZSA9IGlzKHRvbGVyYW5jZSwgXCJmaW5pdGVcIikgPyB0b2xlcmFuY2UgOiAxMDtcblxuICAgICAgaWYgKGlzKHZhbHVlcywgXCJhcnJheVwiKSkge1xuICAgICAgICB2YXIgaSA9IHZhbHVlcy5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKGktLSkgaWYgKGFicyh2YWx1ZXNbaV0gLSB2YWx1ZSkgPD0gdG9sZXJhbmNlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlc1tpXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVzID0gK3ZhbHVlcztcbiAgICAgICAgdmFyIHJlbSA9IHZhbHVlICUgdmFsdWVzO1xuXG4gICAgICAgIGlmIChyZW0gPCB0b2xlcmFuY2UpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUgLSByZW07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVtID4gdmFsdWVzIC0gdG9sZXJhbmNlKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlIC0gcmVtICsgdmFsdWVzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9OyAvLyBDb2xvdXJcblxuICAgIC8qXFxcbiAgICAgKiBTbmFwLmdldFJHQlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUGFyc2VzIGNvbG9yIHN0cmluZyBhcyBSR0Igb2JqZWN0XG4gICAgIC0gY29sb3IgKHN0cmluZykgY29sb3Igc3RyaW5nIGluIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1hdHM6XG4gICAgICMgPHVsPlxuICAgICAjICAgICA8bGk+Q29sb3IgbmFtZSAoPGNvZGU+cmVkPC9jb2RlPiwgPGNvZGU+Z3JlZW48L2NvZGU+LCA8Y29kZT5jb3JuZmxvd2VyYmx1ZTwvY29kZT4sIGV0Yyk8L2xpPlxuICAgICAjICAgICA8bGk+I+KAouKAouKAoiDigJQgc2hvcnRlbmVkIEhUTUwgY29sb3I6ICg8Y29kZT4jMDAwPC9jb2RlPiwgPGNvZGU+I2ZjMDwvY29kZT4sIGV0Yy4pPC9saT5cbiAgICAgIyAgICAgPGxpPiPigKLigKLigKLigKLigKLigKIg4oCUIGZ1bGwgbGVuZ3RoIEhUTUwgY29sb3I6ICg8Y29kZT4jMDAwMDAwPC9jb2RlPiwgPGNvZGU+I2JkMjMwMDwvY29kZT4pPC9saT5cbiAgICAgIyAgICAgPGxpPnJnYijigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgcmVkLCBncmVlbiBhbmQgYmx1ZSBjaGFubmVscyB2YWx1ZXM6ICg8Y29kZT5yZ2IoMjAwLCZuYnNwOzEwMCwmbmJzcDswKTwvY29kZT4pPC9saT5cbiAgICAgIyAgICAgPGxpPnJnYmEo4oCi4oCi4oCiLCDigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgYWxzbyB3aXRoIG9wYWNpdHk8L2xpPlxuICAgICAjICAgICA8bGk+cmdiKOKAouKAouKAoiUsIOKAouKAouKAoiUsIOKAouKAouKAoiUpIOKAlCBzYW1lIGFzIGFib3ZlLCBidXQgaW4gJTogKDxjb2RlPnJnYigxMDAlLCZuYnNwOzE3NSUsJm5ic3A7MCUpPC9jb2RlPik8L2xpPlxuICAgICAjICAgICA8bGk+cmdiYSjigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlLCDigKLigKLigKIlKSDigJQgYWxzbyB3aXRoIG9wYWNpdHk8L2xpPlxuICAgICAjICAgICA8bGk+aHNiKOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCBodWUsIHNhdHVyYXRpb24gYW5kIGJyaWdodG5lc3MgdmFsdWVzOiAoPGNvZGU+aHNiKDAuNSwmbmJzcDswLjI1LCZuYnNwOzEpPC9jb2RlPik8L2xpPlxuICAgICAjICAgICA8bGk+aHNiYSjigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCBhbHNvIHdpdGggb3BhY2l0eTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2Io4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCBpbiAlPC9saT5cbiAgICAgIyAgICAgPGxpPmhzYmEo4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIGFsc28gd2l0aCBvcGFjaXR5PC9saT5cbiAgICAgIyAgICAgPGxpPmhzbCjigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiKSDigJQgaHVlLCBzYXR1cmF0aW9uIGFuZCBsdW1pbm9zaXR5IHZhbHVlczogKDxjb2RlPmhzYigwLjUsJm5ic3A7MC4yNSwmbmJzcDswLjUpPC9jb2RlPik8L2xpPlxuICAgICAjICAgICA8bGk+aHNsYSjigKLigKLigKIsIOKAouKAouKAoiwg4oCi4oCi4oCiLCDigKLigKLigKIpIOKAlCBhbHNvIHdpdGggb3BhY2l0eTwvbGk+XG4gICAgICMgICAgIDxsaT5oc2wo4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIHNhbWUgYXMgYWJvdmUsIGJ1dCBpbiAlPC9saT5cbiAgICAgIyAgICAgPGxpPmhzbGEo4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSwg4oCi4oCi4oCiJSkg4oCUIGFsc28gd2l0aCBvcGFjaXR5PC9saT5cbiAgICAgIyA8L3VsPlxuICAgICAqIE5vdGUgdGhhdCBgJWAgY2FuIGJlIHVzZWQgYW55IHRpbWU6IGByZ2IoMjAlLCAyNTUsIDUwJSlgLlxuICAgICA9IChvYmplY3QpIFJHQiBvYmplY3QgaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICByIChudW1iZXIpIHJlZCxcbiAgICAgbyAgICAgZyAobnVtYmVyKSBncmVlbixcbiAgICAgbyAgICAgYiAobnVtYmVyKSBibHVlLFxuICAgICBvICAgICBoZXggKHN0cmluZykgY29sb3IgaW4gSFRNTC9DU1MgZm9ybWF0OiAj4oCi4oCi4oCi4oCi4oCi4oCiLFxuICAgICBvICAgICBlcnJvciAoYm9vbGVhbikgdHJ1ZSBpZiBzdHJpbmcgY2FuJ3QgYmUgcGFyc2VkXG4gICAgIG8gfVxuICAgIFxcKi9cblxuXG4gICAgU25hcC5nZXRSR0IgPSBjYWNoZXIoZnVuY3Rpb24gKGNvbG91cikge1xuICAgICAgaWYgKCFjb2xvdXIgfHwgISEoKGNvbG91ciA9IFN0cihjb2xvdXIpKS5pbmRleE9mKFwiLVwiKSArIDEpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcjogLTEsXG4gICAgICAgICAgZzogLTEsXG4gICAgICAgICAgYjogLTEsXG4gICAgICAgICAgaGV4OiBcIm5vbmVcIixcbiAgICAgICAgICBlcnJvcjogMSxcbiAgICAgICAgICB0b1N0cmluZzogcmdidG9TdHJpbmdcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKGNvbG91ciA9PSBcIm5vbmVcIikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHI6IC0xLFxuICAgICAgICAgIGc6IC0xLFxuICAgICAgICAgIGI6IC0xLFxuICAgICAgICAgIGhleDogXCJub25lXCIsXG4gICAgICAgICAgdG9TdHJpbmc6IHJnYnRvU3RyaW5nXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgICEoaHNyZ1toYXNdKGNvbG91ci50b0xvd2VyQ2FzZSgpLnN1YnN0cmluZygwLCAyKSkgfHwgY29sb3VyLmNoYXJBdCgpID09IFwiI1wiKSAmJiAoY29sb3VyID0gdG9IZXgoY29sb3VyKSk7XG5cbiAgICAgIGlmICghY29sb3VyKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcjogLTEsXG4gICAgICAgICAgZzogLTEsXG4gICAgICAgICAgYjogLTEsXG4gICAgICAgICAgaGV4OiBcIm5vbmVcIixcbiAgICAgICAgICBlcnJvcjogMSxcbiAgICAgICAgICB0b1N0cmluZzogcmdidG9TdHJpbmdcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcyxcbiAgICAgICAgICByZWQsXG4gICAgICAgICAgZ3JlZW4sXG4gICAgICAgICAgYmx1ZSxcbiAgICAgICAgICBvcGFjaXR5LFxuICAgICAgICAgIHQsXG4gICAgICAgICAgdmFsdWVzLFxuICAgICAgICAgIHJnYiA9IGNvbG91ci5tYXRjaChjb2xvdXJSZWdFeHApO1xuXG4gICAgICBpZiAocmdiKSB7XG4gICAgICAgIGlmIChyZ2JbMl0pIHtcbiAgICAgICAgICBibHVlID0gdG9JbnQocmdiWzJdLnN1YnN0cmluZyg1KSwgMTYpO1xuICAgICAgICAgIGdyZWVuID0gdG9JbnQocmdiWzJdLnN1YnN0cmluZygzLCA1KSwgMTYpO1xuICAgICAgICAgIHJlZCA9IHRvSW50KHJnYlsyXS5zdWJzdHJpbmcoMSwgMyksIDE2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZ2JbM10pIHtcbiAgICAgICAgICBibHVlID0gdG9JbnQoKHQgPSByZ2JbM10uY2hhckF0KDMpKSArIHQsIDE2KTtcbiAgICAgICAgICBncmVlbiA9IHRvSW50KCh0ID0gcmdiWzNdLmNoYXJBdCgyKSkgKyB0LCAxNik7XG4gICAgICAgICAgcmVkID0gdG9JbnQoKHQgPSByZ2JbM10uY2hhckF0KDEpKSArIHQsIDE2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZ2JbNF0pIHtcbiAgICAgICAgICB2YWx1ZXMgPSByZ2JbNF0uc3BsaXQoY29tbWFTcGFjZXMpO1xuICAgICAgICAgIHJlZCA9IHRvRmxvYXQodmFsdWVzWzBdKTtcbiAgICAgICAgICB2YWx1ZXNbMF0uc2xpY2UoLTEpID09IFwiJVwiICYmIChyZWQgKj0gMi41NSk7XG4gICAgICAgICAgZ3JlZW4gPSB0b0Zsb2F0KHZhbHVlc1sxXSk7XG4gICAgICAgICAgdmFsdWVzWzFdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAoZ3JlZW4gKj0gMi41NSk7XG4gICAgICAgICAgYmx1ZSA9IHRvRmxvYXQodmFsdWVzWzJdKTtcbiAgICAgICAgICB2YWx1ZXNbMl0uc2xpY2UoLTEpID09IFwiJVwiICYmIChibHVlICo9IDIuNTUpO1xuICAgICAgICAgIHJnYlsxXS50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsIDQpID09IFwicmdiYVwiICYmIChvcGFjaXR5ID0gdG9GbG9hdCh2YWx1ZXNbM10pKTtcbiAgICAgICAgICB2YWx1ZXNbM10gJiYgdmFsdWVzWzNdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAob3BhY2l0eSAvPSAxMDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJnYls1XSkge1xuICAgICAgICAgIHZhbHVlcyA9IHJnYls1XS5zcGxpdChjb21tYVNwYWNlcyk7XG4gICAgICAgICAgcmVkID0gdG9GbG9hdCh2YWx1ZXNbMF0pO1xuICAgICAgICAgIHZhbHVlc1swXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKHJlZCAvPSAxMDApO1xuICAgICAgICAgIGdyZWVuID0gdG9GbG9hdCh2YWx1ZXNbMV0pO1xuICAgICAgICAgIHZhbHVlc1sxXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKGdyZWVuIC89IDEwMCk7XG4gICAgICAgICAgYmx1ZSA9IHRvRmxvYXQodmFsdWVzWzJdKTtcbiAgICAgICAgICB2YWx1ZXNbMl0uc2xpY2UoLTEpID09IFwiJVwiICYmIChibHVlIC89IDEwMCk7XG4gICAgICAgICAgKHZhbHVlc1swXS5zbGljZSgtMykgPT0gXCJkZWdcIiB8fCB2YWx1ZXNbMF0uc2xpY2UoLTEpID09IFwiXFx4YjBcIikgJiYgKHJlZCAvPSAzNjApO1xuICAgICAgICAgIHJnYlsxXS50b0xvd2VyQ2FzZSgpLnNsaWNlKDAsIDQpID09IFwiaHNiYVwiICYmIChvcGFjaXR5ID0gdG9GbG9hdCh2YWx1ZXNbM10pKTtcbiAgICAgICAgICB2YWx1ZXNbM10gJiYgdmFsdWVzWzNdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAob3BhY2l0eSAvPSAxMDApO1xuICAgICAgICAgIHJldHVybiBTbmFwLmhzYjJyZ2IocmVkLCBncmVlbiwgYmx1ZSwgb3BhY2l0eSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmdiWzZdKSB7XG4gICAgICAgICAgdmFsdWVzID0gcmdiWzZdLnNwbGl0KGNvbW1hU3BhY2VzKTtcbiAgICAgICAgICByZWQgPSB0b0Zsb2F0KHZhbHVlc1swXSk7XG4gICAgICAgICAgdmFsdWVzWzBdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAocmVkIC89IDEwMCk7XG4gICAgICAgICAgZ3JlZW4gPSB0b0Zsb2F0KHZhbHVlc1sxXSk7XG4gICAgICAgICAgdmFsdWVzWzFdLnNsaWNlKC0xKSA9PSBcIiVcIiAmJiAoZ3JlZW4gLz0gMTAwKTtcbiAgICAgICAgICBibHVlID0gdG9GbG9hdCh2YWx1ZXNbMl0pO1xuICAgICAgICAgIHZhbHVlc1syXS5zbGljZSgtMSkgPT0gXCIlXCIgJiYgKGJsdWUgLz0gMTAwKTtcbiAgICAgICAgICAodmFsdWVzWzBdLnNsaWNlKC0zKSA9PSBcImRlZ1wiIHx8IHZhbHVlc1swXS5zbGljZSgtMSkgPT0gXCJcXHhiMFwiKSAmJiAocmVkIC89IDM2MCk7XG4gICAgICAgICAgcmdiWzFdLnRvTG93ZXJDYXNlKCkuc2xpY2UoMCwgNCkgPT0gXCJoc2xhXCIgJiYgKG9wYWNpdHkgPSB0b0Zsb2F0KHZhbHVlc1szXSkpO1xuICAgICAgICAgIHZhbHVlc1szXSAmJiB2YWx1ZXNbM10uc2xpY2UoLTEpID09IFwiJVwiICYmIChvcGFjaXR5IC89IDEwMCk7XG4gICAgICAgICAgcmV0dXJuIFNuYXAuaHNsMnJnYihyZWQsIGdyZWVuLCBibHVlLCBvcGFjaXR5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlZCA9IG1taW4obWF0aC5yb3VuZChyZWQpLCAyNTUpO1xuICAgICAgICBncmVlbiA9IG1taW4obWF0aC5yb3VuZChncmVlbiksIDI1NSk7XG4gICAgICAgIGJsdWUgPSBtbWluKG1hdGgucm91bmQoYmx1ZSksIDI1NSk7XG4gICAgICAgIG9wYWNpdHkgPSBtbWluKG1tYXgob3BhY2l0eSwgMCksIDEpO1xuICAgICAgICByZ2IgPSB7XG4gICAgICAgICAgcjogcmVkLFxuICAgICAgICAgIGc6IGdyZWVuLFxuICAgICAgICAgIGI6IGJsdWUsXG4gICAgICAgICAgdG9TdHJpbmc6IHJnYnRvU3RyaW5nXG4gICAgICAgIH07XG4gICAgICAgIHJnYi5oZXggPSBcIiNcIiArICgxNjc3NzIxNiB8IGJsdWUgfCBncmVlbiA8PCA4IHwgcmVkIDw8IDE2KS50b1N0cmluZygxNikuc2xpY2UoMSk7XG4gICAgICAgIHJnYi5vcGFjaXR5ID0gaXMob3BhY2l0eSwgXCJmaW5pdGVcIikgPyBvcGFjaXR5IDogMTtcbiAgICAgICAgcmV0dXJuIHJnYjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcjogLTEsXG4gICAgICAgIGc6IC0xLFxuICAgICAgICBiOiAtMSxcbiAgICAgICAgaGV4OiBcIm5vbmVcIixcbiAgICAgICAgZXJyb3I6IDEsXG4gICAgICAgIHRvU3RyaW5nOiByZ2J0b1N0cmluZ1xuICAgICAgfTtcbiAgICB9LCBTbmFwKTtcbiAgICAvKlxcXG4gICAgICogU25hcC5oc2JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIEhTQiB2YWx1ZXMgdG8gYSBoZXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbG9yXG4gICAgIC0gaCAobnVtYmVyKSBodWVcbiAgICAgLSBzIChudW1iZXIpIHNhdHVyYXRpb25cbiAgICAgLSBiIChudW1iZXIpIHZhbHVlIG9yIGJyaWdodG5lc3NcbiAgICAgPSAoc3RyaW5nKSBoZXggcmVwcmVzZW50YXRpb24gb2YgdGhlIGNvbG9yXG4gICAgXFwqL1xuXG4gICAgU25hcC5oc2IgPSBjYWNoZXIoZnVuY3Rpb24gKGgsIHMsIGIpIHtcbiAgICAgIHJldHVybiBTbmFwLmhzYjJyZ2IoaCwgcywgYikuaGV4O1xuICAgIH0pO1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmhzbFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgSFNMIHZhbHVlcyB0byBhIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3JcbiAgICAgLSBoIChudW1iZXIpIGh1ZVxuICAgICAtIHMgKG51bWJlcikgc2F0dXJhdGlvblxuICAgICAtIGwgKG51bWJlcikgbHVtaW5vc2l0eVxuICAgICA9IChzdHJpbmcpIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3JcbiAgICBcXCovXG5cbiAgICBTbmFwLmhzbCA9IGNhY2hlcihmdW5jdGlvbiAoaCwgcywgbCkge1xuICAgICAgcmV0dXJuIFNuYXAuaHNsMnJnYihoLCBzLCBsKS5oZXg7XG4gICAgfSk7XG4gICAgLypcXFxuICAgICAqIFNuYXAucmdiXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBSR0IgdmFsdWVzIHRvIGEgaGV4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBjb2xvclxuICAgICAtIHIgKG51bWJlcikgcmVkXG4gICAgIC0gZyAobnVtYmVyKSBncmVlblxuICAgICAtIGIgKG51bWJlcikgYmx1ZVxuICAgICA9IChzdHJpbmcpIGhleCByZXByZXNlbnRhdGlvbiBvZiB0aGUgY29sb3JcbiAgICBcXCovXG5cbiAgICBTbmFwLnJnYiA9IGNhY2hlcihmdW5jdGlvbiAociwgZywgYiwgbykge1xuICAgICAgaWYgKGlzKG8sIFwiZmluaXRlXCIpKSB7XG4gICAgICAgIHZhciByb3VuZCA9IG1hdGgucm91bmQ7XG4gICAgICAgIHJldHVybiBcInJnYmEoXCIgKyBbcm91bmQociksIHJvdW5kKGcpLCByb3VuZChiKSwgK28udG9GaXhlZCgyKV0gKyBcIilcIjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFwiI1wiICsgKDE2Nzc3MjE2IHwgYiB8IGcgPDwgOCB8IHIgPDwgMTYpLnRvU3RyaW5nKDE2KS5zbGljZSgxKTtcbiAgICB9KTtcblxuICAgIHZhciB0b0hleCA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgICAgdmFyIGkgPSBnbG9iLmRvYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF0gfHwgZ2xvYi5kb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJzdmdcIilbMF0sXG4gICAgICAgICAgcmVkID0gXCJyZ2IoMjU1LCAwLCAwKVwiO1xuICAgICAgdG9IZXggPSBjYWNoZXIoZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgICAgIGlmIChjb2xvci50b0xvd2VyQ2FzZSgpID09IFwicmVkXCIpIHtcbiAgICAgICAgICByZXR1cm4gcmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaS5zdHlsZS5jb2xvciA9IHJlZDtcbiAgICAgICAgaS5zdHlsZS5jb2xvciA9IGNvbG9yO1xuICAgICAgICB2YXIgb3V0ID0gZ2xvYi5kb2MuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShpLCBFKS5nZXRQcm9wZXJ0eVZhbHVlKFwiY29sb3JcIik7XG4gICAgICAgIHJldHVybiBvdXQgPT0gcmVkID8gbnVsbCA6IG91dDtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRvSGV4KGNvbG9yKTtcbiAgICB9LFxuICAgICAgICBoc2J0b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBcImhzYihcIiArIFt0aGlzLmgsIHRoaXMucywgdGhpcy5iXSArIFwiKVwiO1xuICAgIH0sXG4gICAgICAgIGhzbHRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFwiaHNsKFwiICsgW3RoaXMuaCwgdGhpcy5zLCB0aGlzLmxdICsgXCIpXCI7XG4gICAgfSxcbiAgICAgICAgcmdidG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGFjaXR5ID09IDEgfHwgdGhpcy5vcGFjaXR5ID09IG51bGwgPyB0aGlzLmhleCA6IFwicmdiYShcIiArIFt0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCB0aGlzLm9wYWNpdHldICsgXCIpXCI7XG4gICAgfSxcbiAgICAgICAgcHJlcGFyZVJHQiA9IGZ1bmN0aW9uIChyLCBnLCBiKSB7XG4gICAgICBpZiAoZyA9PSBudWxsICYmIGlzKHIsIFwib2JqZWN0XCIpICYmIFwiclwiIGluIHIgJiYgXCJnXCIgaW4gciAmJiBcImJcIiBpbiByKSB7XG4gICAgICAgIGIgPSByLmI7XG4gICAgICAgIGcgPSByLmc7XG4gICAgICAgIHIgPSByLnI7XG4gICAgICB9XG5cbiAgICAgIGlmIChnID09IG51bGwgJiYgaXMociwgc3RyaW5nKSkge1xuICAgICAgICB2YXIgY2xyID0gU25hcC5nZXRSR0Iocik7XG4gICAgICAgIHIgPSBjbHIucjtcbiAgICAgICAgZyA9IGNsci5nO1xuICAgICAgICBiID0gY2xyLmI7XG4gICAgICB9XG5cbiAgICAgIGlmIChyID4gMSB8fCBnID4gMSB8fCBiID4gMSkge1xuICAgICAgICByIC89IDI1NTtcbiAgICAgICAgZyAvPSAyNTU7XG4gICAgICAgIGIgLz0gMjU1O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gW3IsIGcsIGJdO1xuICAgIH0sXG4gICAgICAgIHBhY2thZ2VSR0IgPSBmdW5jdGlvbiAociwgZywgYiwgbykge1xuICAgICAgciA9IG1hdGgucm91bmQociAqIDI1NSk7XG4gICAgICBnID0gbWF0aC5yb3VuZChnICogMjU1KTtcbiAgICAgIGIgPSBtYXRoLnJvdW5kKGIgKiAyNTUpO1xuICAgICAgdmFyIHJnYiA9IHtcbiAgICAgICAgcjogcixcbiAgICAgICAgZzogZyxcbiAgICAgICAgYjogYixcbiAgICAgICAgb3BhY2l0eTogaXMobywgXCJmaW5pdGVcIikgPyBvIDogMSxcbiAgICAgICAgaGV4OiBTbmFwLnJnYihyLCBnLCBiKSxcbiAgICAgICAgdG9TdHJpbmc6IHJnYnRvU3RyaW5nXG4gICAgICB9O1xuICAgICAgaXMobywgXCJmaW5pdGVcIikgJiYgKHJnYi5vcGFjaXR5ID0gbyk7XG4gICAgICByZXR1cm4gcmdiO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNuYXAuY29sb3JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFBhcnNlcyB0aGUgY29sb3Igc3RyaW5nIGFuZCByZXR1cm5zIGFuIG9iamVjdCBmZWF0dXJpbmcgdGhlIGNvbG9yJ3MgY29tcG9uZW50IHZhbHVlc1xuICAgICAtIGNsciAoc3RyaW5nKSBjb2xvciBzdHJpbmcgaW4gb25lIG9mIHRoZSBzdXBwb3J0ZWQgZm9ybWF0cyAoc2VlIEBTbmFwLmdldFJHQilcbiAgICAgPSAob2JqZWN0KSBDb21iaW5lZCBSR0IvSFNCIG9iamVjdCBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHIgKG51bWJlcikgcmVkLFxuICAgICBvICAgICBnIChudW1iZXIpIGdyZWVuLFxuICAgICBvICAgICBiIChudW1iZXIpIGJsdWUsXG4gICAgIG8gICAgIGhleCAoc3RyaW5nKSBjb2xvciBpbiBIVE1ML0NTUyBmb3JtYXQ6ICPigKLigKLigKLigKLigKLigKIsXG4gICAgIG8gICAgIGVycm9yIChib29sZWFuKSBgdHJ1ZWAgaWYgc3RyaW5nIGNhbid0IGJlIHBhcnNlZCxcbiAgICAgbyAgICAgaCAobnVtYmVyKSBodWUsXG4gICAgIG8gICAgIHMgKG51bWJlcikgc2F0dXJhdGlvbixcbiAgICAgbyAgICAgdiAobnVtYmVyKSB2YWx1ZSAoYnJpZ2h0bmVzcyksXG4gICAgIG8gICAgIGwgKG51bWJlcikgbGlnaHRuZXNzXG4gICAgIG8gfVxuICAgIFxcKi9cblxuXG4gICAgU25hcC5jb2xvciA9IGZ1bmN0aW9uIChjbHIpIHtcbiAgICAgIHZhciByZ2I7XG5cbiAgICAgIGlmIChpcyhjbHIsIFwib2JqZWN0XCIpICYmIFwiaFwiIGluIGNsciAmJiBcInNcIiBpbiBjbHIgJiYgXCJiXCIgaW4gY2xyKSB7XG4gICAgICAgIHJnYiA9IFNuYXAuaHNiMnJnYihjbHIpO1xuICAgICAgICBjbHIuciA9IHJnYi5yO1xuICAgICAgICBjbHIuZyA9IHJnYi5nO1xuICAgICAgICBjbHIuYiA9IHJnYi5iO1xuICAgICAgICBjbHIub3BhY2l0eSA9IDE7XG4gICAgICAgIGNsci5oZXggPSByZ2IuaGV4O1xuICAgICAgfSBlbHNlIGlmIChpcyhjbHIsIFwib2JqZWN0XCIpICYmIFwiaFwiIGluIGNsciAmJiBcInNcIiBpbiBjbHIgJiYgXCJsXCIgaW4gY2xyKSB7XG4gICAgICAgIHJnYiA9IFNuYXAuaHNsMnJnYihjbHIpO1xuICAgICAgICBjbHIuciA9IHJnYi5yO1xuICAgICAgICBjbHIuZyA9IHJnYi5nO1xuICAgICAgICBjbHIuYiA9IHJnYi5iO1xuICAgICAgICBjbHIub3BhY2l0eSA9IDE7XG4gICAgICAgIGNsci5oZXggPSByZ2IuaGV4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzKGNsciwgXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICBjbHIgPSBTbmFwLmdldFJHQihjbHIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzKGNsciwgXCJvYmplY3RcIikgJiYgXCJyXCIgaW4gY2xyICYmIFwiZ1wiIGluIGNsciAmJiBcImJcIiBpbiBjbHIgJiYgIShcImVycm9yXCIgaW4gY2xyKSkge1xuICAgICAgICAgIHJnYiA9IFNuYXAucmdiMmhzbChjbHIpO1xuICAgICAgICAgIGNsci5oID0gcmdiLmg7XG4gICAgICAgICAgY2xyLnMgPSByZ2IucztcbiAgICAgICAgICBjbHIubCA9IHJnYi5sO1xuICAgICAgICAgIHJnYiA9IFNuYXAucmdiMmhzYihjbHIpO1xuICAgICAgICAgIGNsci52ID0gcmdiLmI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2xyID0ge1xuICAgICAgICAgICAgaGV4OiBcIm5vbmVcIlxuICAgICAgICAgIH07XG4gICAgICAgICAgY2xyLnIgPSBjbHIuZyA9IGNsci5iID0gY2xyLmggPSBjbHIucyA9IGNsci52ID0gY2xyLmwgPSAtMTtcbiAgICAgICAgICBjbHIuZXJyb3IgPSAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNsci50b1N0cmluZyA9IHJnYnRvU3RyaW5nO1xuICAgICAgcmV0dXJuIGNscjtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmhzYjJyZ2JcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENvbnZlcnRzIEhTQiB2YWx1ZXMgdG8gYW4gUkdCIG9iamVjdFxuICAgICAtIGggKG51bWJlcikgaHVlXG4gICAgIC0gcyAobnVtYmVyKSBzYXR1cmF0aW9uXG4gICAgIC0gdiAobnVtYmVyKSB2YWx1ZSBvciBicmlnaHRuZXNzXG4gICAgID0gKG9iamVjdCkgUkdCIG9iamVjdCBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHIgKG51bWJlcikgcmVkLFxuICAgICBvICAgICBnIChudW1iZXIpIGdyZWVuLFxuICAgICBvICAgICBiIChudW1iZXIpIGJsdWUsXG4gICAgIG8gICAgIGhleCAoc3RyaW5nKSBjb2xvciBpbiBIVE1ML0NTUyBmb3JtYXQ6ICPigKLigKLigKLigKLigKLigKJcbiAgICAgbyB9XG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmhzYjJyZ2IgPSBmdW5jdGlvbiAoaCwgcywgdiwgbykge1xuICAgICAgaWYgKGlzKGgsIFwib2JqZWN0XCIpICYmIFwiaFwiIGluIGggJiYgXCJzXCIgaW4gaCAmJiBcImJcIiBpbiBoKSB7XG4gICAgICAgIHYgPSBoLmI7XG4gICAgICAgIHMgPSBoLnM7XG4gICAgICAgIG8gPSBoLm87XG4gICAgICAgIGggPSBoLmg7XG4gICAgICB9XG5cbiAgICAgIGggKj0gMzYwO1xuICAgICAgdmFyIFIsIEcsIEIsIFgsIEM7XG4gICAgICBoID0gaCAlIDM2MCAvIDYwO1xuICAgICAgQyA9IHYgKiBzO1xuICAgICAgWCA9IEMgKiAoMSAtIGFicyhoICUgMiAtIDEpKTtcbiAgICAgIFIgPSBHID0gQiA9IHYgLSBDO1xuICAgICAgaCA9IH5+aDtcbiAgICAgIFIgKz0gW0MsIFgsIDAsIDAsIFgsIENdW2hdO1xuICAgICAgRyArPSBbWCwgQywgQywgWCwgMCwgMF1baF07XG4gICAgICBCICs9IFswLCAwLCBYLCBDLCBDLCBYXVtoXTtcbiAgICAgIHJldHVybiBwYWNrYWdlUkdCKFIsIEcsIEIsIG8pO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNuYXAuaHNsMnJnYlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgSFNMIHZhbHVlcyB0byBhbiBSR0Igb2JqZWN0XG4gICAgIC0gaCAobnVtYmVyKSBodWVcbiAgICAgLSBzIChudW1iZXIpIHNhdHVyYXRpb25cbiAgICAgLSBsIChudW1iZXIpIGx1bWlub3NpdHlcbiAgICAgPSAob2JqZWN0KSBSR0Igb2JqZWN0IGluIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgciAobnVtYmVyKSByZWQsXG4gICAgIG8gICAgIGcgKG51bWJlcikgZ3JlZW4sXG4gICAgIG8gICAgIGIgKG51bWJlcikgYmx1ZSxcbiAgICAgbyAgICAgaGV4IChzdHJpbmcpIGNvbG9yIGluIEhUTUwvQ1NTIGZvcm1hdDogI+KAouKAouKAouKAouKAouKAolxuICAgICBvIH1cbiAgICBcXCovXG5cblxuICAgIFNuYXAuaHNsMnJnYiA9IGZ1bmN0aW9uIChoLCBzLCBsLCBvKSB7XG4gICAgICBpZiAoaXMoaCwgXCJvYmplY3RcIikgJiYgXCJoXCIgaW4gaCAmJiBcInNcIiBpbiBoICYmIFwibFwiIGluIGgpIHtcbiAgICAgICAgbCA9IGgubDtcbiAgICAgICAgcyA9IGgucztcbiAgICAgICAgaCA9IGguaDtcbiAgICAgIH1cblxuICAgICAgaWYgKGggPiAxIHx8IHMgPiAxIHx8IGwgPiAxKSB7XG4gICAgICAgIGggLz0gMzYwO1xuICAgICAgICBzIC89IDEwMDtcbiAgICAgICAgbCAvPSAxMDA7XG4gICAgICB9XG5cbiAgICAgIGggKj0gMzYwO1xuICAgICAgdmFyIFIsIEcsIEIsIFgsIEM7XG4gICAgICBoID0gaCAlIDM2MCAvIDYwO1xuICAgICAgQyA9IDIgKiBzICogKGwgPCAuNSA/IGwgOiAxIC0gbCk7XG4gICAgICBYID0gQyAqICgxIC0gYWJzKGggJSAyIC0gMSkpO1xuICAgICAgUiA9IEcgPSBCID0gbCAtIEMgLyAyO1xuICAgICAgaCA9IH5+aDtcbiAgICAgIFIgKz0gW0MsIFgsIDAsIDAsIFgsIENdW2hdO1xuICAgICAgRyArPSBbWCwgQywgQywgWCwgMCwgMF1baF07XG4gICAgICBCICs9IFswLCAwLCBYLCBDLCBDLCBYXVtoXTtcbiAgICAgIHJldHVybiBwYWNrYWdlUkdCKFIsIEcsIEIsIG8pO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNuYXAucmdiMmhzYlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ29udmVydHMgUkdCIHZhbHVlcyB0byBhbiBIU0Igb2JqZWN0XG4gICAgIC0gciAobnVtYmVyKSByZWRcbiAgICAgLSBnIChudW1iZXIpIGdyZWVuXG4gICAgIC0gYiAobnVtYmVyKSBibHVlXG4gICAgID0gKG9iamVjdCkgSFNCIG9iamVjdCBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIGggKG51bWJlcikgaHVlLFxuICAgICBvICAgICBzIChudW1iZXIpIHNhdHVyYXRpb24sXG4gICAgIG8gICAgIGIgKG51bWJlcikgYnJpZ2h0bmVzc1xuICAgICBvIH1cbiAgICBcXCovXG5cblxuICAgIFNuYXAucmdiMmhzYiA9IGZ1bmN0aW9uIChyLCBnLCBiKSB7XG4gICAgICBiID0gcHJlcGFyZVJHQihyLCBnLCBiKTtcbiAgICAgIHIgPSBiWzBdO1xuICAgICAgZyA9IGJbMV07XG4gICAgICBiID0gYlsyXTtcbiAgICAgIHZhciBILCBTLCBWLCBDO1xuICAgICAgViA9IG1tYXgociwgZywgYik7XG4gICAgICBDID0gViAtIG1taW4ociwgZywgYik7XG4gICAgICBIID0gQyA9PSAwID8gbnVsbCA6IFYgPT0gciA/IChnIC0gYikgLyBDIDogViA9PSBnID8gKGIgLSByKSAvIEMgKyAyIDogKHIgLSBnKSAvIEMgKyA0O1xuICAgICAgSCA9IChIICsgMzYwKSAlIDYgKiA2MCAvIDM2MDtcbiAgICAgIFMgPSBDID09IDAgPyAwIDogQyAvIFY7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBoOiBILFxuICAgICAgICBzOiBTLFxuICAgICAgICBiOiBWLFxuICAgICAgICB0b1N0cmluZzogaHNidG9TdHJpbmdcbiAgICAgIH07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5yZ2IyaHNsXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDb252ZXJ0cyBSR0IgdmFsdWVzIHRvIGFuIEhTTCBvYmplY3RcbiAgICAgLSByIChudW1iZXIpIHJlZFxuICAgICAtIGcgKG51bWJlcikgZ3JlZW5cbiAgICAgLSBiIChudW1iZXIpIGJsdWVcbiAgICAgPSAob2JqZWN0KSBIU0wgb2JqZWN0IGluIHRoZSBmb2xsb3dpbmcgZm9ybWF0OlxuICAgICBvIHtcbiAgICAgbyAgICAgaCAobnVtYmVyKSBodWUsXG4gICAgIG8gICAgIHMgKG51bWJlcikgc2F0dXJhdGlvbixcbiAgICAgbyAgICAgbCAobnVtYmVyKSBsdW1pbm9zaXR5XG4gICAgIG8gfVxuICAgIFxcKi9cblxuXG4gICAgU25hcC5yZ2IyaHNsID0gZnVuY3Rpb24gKHIsIGcsIGIpIHtcbiAgICAgIGIgPSBwcmVwYXJlUkdCKHIsIGcsIGIpO1xuICAgICAgciA9IGJbMF07XG4gICAgICBnID0gYlsxXTtcbiAgICAgIGIgPSBiWzJdO1xuICAgICAgdmFyIEgsIFMsIEwsIE0sIG0sIEM7XG4gICAgICBNID0gbW1heChyLCBnLCBiKTtcbiAgICAgIG0gPSBtbWluKHIsIGcsIGIpO1xuICAgICAgQyA9IE0gLSBtO1xuICAgICAgSCA9IEMgPT0gMCA/IG51bGwgOiBNID09IHIgPyAoZyAtIGIpIC8gQyA6IE0gPT0gZyA/IChiIC0gcikgLyBDICsgMiA6IChyIC0gZykgLyBDICsgNDtcbiAgICAgIEggPSAoSCArIDM2MCkgJSA2ICogNjAgLyAzNjA7XG4gICAgICBMID0gKE0gKyBtKSAvIDI7XG4gICAgICBTID0gQyA9PSAwID8gMCA6IEwgPCAuNSA/IEMgLyAoMiAqIEwpIDogQyAvICgyIC0gMiAqIEwpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaDogSCxcbiAgICAgICAgczogUyxcbiAgICAgICAgbDogTCxcbiAgICAgICAgdG9TdHJpbmc6IGhzbHRvU3RyaW5nXG4gICAgICB9O1xuICAgIH07IC8vIFRyYW5zZm9ybWF0aW9uc1xuXG4gICAgLypcXFxuICAgICAqIFNuYXAucGFyc2VQYXRoU3RyaW5nXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFBhcnNlcyBnaXZlbiBwYXRoIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIGFycmF5cyBvZiBwYXRoIHNlZ21lbnRzXG4gICAgIC0gcGF0aFN0cmluZyAoc3RyaW5nfGFycmF5KSBwYXRoIHN0cmluZyBvciBhcnJheSBvZiBzZWdtZW50cyAoaW4gdGhlIGxhc3QgY2FzZSBpdCBpcyByZXR1cm5lZCBzdHJhaWdodCBhd2F5KVxuICAgICA9IChhcnJheSkgYXJyYXkgb2Ygc2VnbWVudHNcbiAgICBcXCovXG5cblxuICAgIFNuYXAucGFyc2VQYXRoU3RyaW5nID0gZnVuY3Rpb24gKHBhdGhTdHJpbmcpIHtcbiAgICAgIGlmICghcGF0aFN0cmluZykge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgdmFyIHB0aCA9IFNuYXAucGF0aChwYXRoU3RyaW5nKTtcblxuICAgICAgaWYgKHB0aC5hcnIpIHtcbiAgICAgICAgcmV0dXJuIFNuYXAucGF0aC5jbG9uZShwdGguYXJyKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHBhcmFtQ291bnRzID0ge1xuICAgICAgICBhOiA3LFxuICAgICAgICBjOiA2LFxuICAgICAgICBvOiAyLFxuICAgICAgICBoOiAxLFxuICAgICAgICBsOiAyLFxuICAgICAgICBtOiAyLFxuICAgICAgICByOiA0LFxuICAgICAgICBxOiA0LFxuICAgICAgICBzOiA0LFxuICAgICAgICB0OiAyLFxuICAgICAgICB2OiAxLFxuICAgICAgICB1OiAzLFxuICAgICAgICB6OiAwXG4gICAgICB9LFxuICAgICAgICAgIGRhdGEgPSBbXTtcblxuICAgICAgaWYgKGlzKHBhdGhTdHJpbmcsIFwiYXJyYXlcIikgJiYgaXMocGF0aFN0cmluZ1swXSwgXCJhcnJheVwiKSkge1xuICAgICAgICAvLyByb3VnaCBhc3N1bXB0aW9uXG4gICAgICAgIGRhdGEgPSBTbmFwLnBhdGguY2xvbmUocGF0aFN0cmluZyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgU3RyKHBhdGhTdHJpbmcpLnJlcGxhY2UocGF0aENvbW1hbmQsIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICAgICAgdmFyIHBhcmFtcyA9IFtdLFxuICAgICAgICAgICAgICBuYW1lID0gYi50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgIGMucmVwbGFjZShwYXRoVmFsdWVzLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgYiAmJiBwYXJhbXMucHVzaCgrYik7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAobmFtZSA9PSBcIm1cIiAmJiBwYXJhbXMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgZGF0YS5wdXNoKFtiXS5jb25jYXQocGFyYW1zLnNwbGljZSgwLCAyKSkpO1xuICAgICAgICAgICAgbmFtZSA9IFwibFwiO1xuICAgICAgICAgICAgYiA9IGIgPT0gXCJtXCIgPyBcImxcIiA6IFwiTFwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChuYW1lID09IFwib1wiICYmIHBhcmFtcy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgZGF0YS5wdXNoKFtiLCBwYXJhbXNbMF1dKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobmFtZSA9PSBcInJcIikge1xuICAgICAgICAgICAgZGF0YS5wdXNoKFtiXS5jb25jYXQocGFyYW1zKSk7XG4gICAgICAgICAgfSBlbHNlIHdoaWxlIChwYXJhbXMubGVuZ3RoID49IHBhcmFtQ291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICBkYXRhLnB1c2goW2JdLmNvbmNhdChwYXJhbXMuc3BsaWNlKDAsIHBhcmFtQ291bnRzW25hbWVdKSkpO1xuXG4gICAgICAgICAgICBpZiAoIXBhcmFtQ291bnRzW25hbWVdKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGRhdGEudG9TdHJpbmcgPSBTbmFwLnBhdGgudG9TdHJpbmc7XG4gICAgICBwdGguYXJyID0gU25hcC5wYXRoLmNsb25lKGRhdGEpO1xuICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5wYXJzZVRyYW5zZm9ybVN0cmluZ1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBQYXJzZXMgZ2l2ZW4gdHJhbnNmb3JtIHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIHRyYW5zZm9ybWF0aW9uc1xuICAgICAtIFRTdHJpbmcgKHN0cmluZ3xhcnJheSkgdHJhbnNmb3JtIHN0cmluZyBvciBhcnJheSBvZiB0cmFuc2Zvcm1hdGlvbnMgKGluIHRoZSBsYXN0IGNhc2UgaXQgaXMgcmV0dXJuZWQgc3RyYWlnaHQgYXdheSlcbiAgICAgPSAoYXJyYXkpIGFycmF5IG9mIHRyYW5zZm9ybWF0aW9uc1xuICAgIFxcKi9cblxuXG4gICAgdmFyIHBhcnNlVHJhbnNmb3JtU3RyaW5nID0gU25hcC5wYXJzZVRyYW5zZm9ybVN0cmluZyA9IGZ1bmN0aW9uIChUU3RyaW5nKSB7XG4gICAgICBpZiAoIVRTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciBwYXJhbUNvdW50cyA9IHtcbiAgICAgICAgcjogMyxcbiAgICAgICAgczogNCxcbiAgICAgICAgdDogMixcbiAgICAgICAgbTogNlxuICAgICAgfSxcbiAgICAgICAgICBkYXRhID0gW107XG5cbiAgICAgIGlmIChpcyhUU3RyaW5nLCBcImFycmF5XCIpICYmIGlzKFRTdHJpbmdbMF0sIFwiYXJyYXlcIikpIHtcbiAgICAgICAgLy8gcm91Z2ggYXNzdW1wdGlvblxuICAgICAgICBkYXRhID0gU25hcC5wYXRoLmNsb25lKFRTdHJpbmcpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgIFN0cihUU3RyaW5nKS5yZXBsYWNlKHRDb21tYW5kLCBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgICAgIHZhciBwYXJhbXMgPSBbXSxcbiAgICAgICAgICAgICAgbmFtZSA9IGIudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBjLnJlcGxhY2UocGF0aFZhbHVlcywgZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIGIgJiYgcGFyYW1zLnB1c2goK2IpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGRhdGEucHVzaChbYl0uY29uY2F0KHBhcmFtcykpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZGF0YS50b1N0cmluZyA9IFNuYXAucGF0aC50b1N0cmluZztcbiAgICAgIHJldHVybiBkYXRhO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzdmdUcmFuc2Zvcm0yc3RyaW5nKHRzdHIpIHtcbiAgICAgIHZhciByZXMgPSBbXTtcbiAgICAgIHRzdHIgPSB0c3RyLnJlcGxhY2UoLyg/Ol58XFxzKShcXHcrKVxcKChbXildKylcXCkvZywgZnVuY3Rpb24gKGFsbCwgbmFtZSwgcGFyYW1zKSB7XG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcy5zcGxpdCgvXFxzKixcXHMqfFxccysvKTtcblxuICAgICAgICBpZiAobmFtZSA9PSBcInJvdGF0ZVwiICYmIHBhcmFtcy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgIHBhcmFtcy5wdXNoKDAsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5hbWUgPT0gXCJzY2FsZVwiKSB7XG4gICAgICAgICAgaWYgKHBhcmFtcy5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMuc2xpY2UoMCwgMik7XG4gICAgICAgICAgfSBlbHNlIGlmIChwYXJhbXMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKDAsIDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKHBhcmFtc1swXSwgMCwgMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5hbWUgPT0gXCJza2V3WFwiKSB7XG4gICAgICAgICAgcmVzLnB1c2goW1wibVwiLCAxLCAwLCBtYXRoLnRhbihyYWQocGFyYW1zWzBdKSksIDEsIDAsIDBdKTtcbiAgICAgICAgfSBlbHNlIGlmIChuYW1lID09IFwic2tld1lcIikge1xuICAgICAgICAgIHJlcy5wdXNoKFtcIm1cIiwgMSwgbWF0aC50YW4ocmFkKHBhcmFtc1swXSkpLCAwLCAxLCAwLCAwXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzLnB1c2goW25hbWUuY2hhckF0KDApXS5jb25jYXQocGFyYW1zKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYWxsO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIFNuYXAuXy5zdmdUcmFuc2Zvcm0yc3RyaW5nID0gc3ZnVHJhbnNmb3JtMnN0cmluZztcbiAgICBTbmFwLl8ucmdUcmFuc2Zvcm0gPSAvXlthLXpdW1xcc10qLT9cXC4/XFxkL2k7XG5cbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm0ybWF0cml4KHRzdHIsIGJib3gpIHtcbiAgICAgIHZhciB0ZGF0YSA9IHBhcnNlVHJhbnNmb3JtU3RyaW5nKHRzdHIpLFxuICAgICAgICAgIG0gPSBuZXcgU25hcC5NYXRyaXgoKTtcblxuICAgICAgaWYgKHRkYXRhKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHRkYXRhLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICB2YXIgdCA9IHRkYXRhW2ldLFxuICAgICAgICAgICAgICB0bGVuID0gdC5sZW5ndGgsXG4gICAgICAgICAgICAgIGNvbW1hbmQgPSBTdHIodFswXSkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgYWJzb2x1dGUgPSB0WzBdICE9IGNvbW1hbmQsXG4gICAgICAgICAgICAgIGludmVyID0gYWJzb2x1dGUgPyBtLmludmVydCgpIDogMCxcbiAgICAgICAgICAgICAgeDEsXG4gICAgICAgICAgICAgIHkxLFxuICAgICAgICAgICAgICB4MixcbiAgICAgICAgICAgICAgeTIsXG4gICAgICAgICAgICAgIGJiO1xuXG4gICAgICAgICAgaWYgKGNvbW1hbmQgPT0gXCJ0XCIgJiYgdGxlbiA9PSAyKSB7XG4gICAgICAgICAgICBtLnRyYW5zbGF0ZSh0WzFdLCAwKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT0gXCJ0XCIgJiYgdGxlbiA9PSAzKSB7XG4gICAgICAgICAgICBpZiAoYWJzb2x1dGUpIHtcbiAgICAgICAgICAgICAgeDEgPSBpbnZlci54KDAsIDApO1xuICAgICAgICAgICAgICB5MSA9IGludmVyLnkoMCwgMCk7XG4gICAgICAgICAgICAgIHgyID0gaW52ZXIueCh0WzFdLCB0WzJdKTtcbiAgICAgICAgICAgICAgeTIgPSBpbnZlci55KHRbMV0sIHRbMl0pO1xuICAgICAgICAgICAgICBtLnRyYW5zbGF0ZSh4MiAtIHgxLCB5MiAtIHkxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG0udHJhbnNsYXRlKHRbMV0sIHRbMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PSBcInJcIikge1xuICAgICAgICAgICAgaWYgKHRsZW4gPT0gMikge1xuICAgICAgICAgICAgICBiYiA9IGJiIHx8IGJib3g7XG4gICAgICAgICAgICAgIG0ucm90YXRlKHRbMV0sIGJiLnggKyBiYi53aWR0aCAvIDIsIGJiLnkgKyBiYi5oZWlnaHQgLyAyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGxlbiA9PSA0KSB7XG4gICAgICAgICAgICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgICAgICAgICAgIHgyID0gaW52ZXIueCh0WzJdLCB0WzNdKTtcbiAgICAgICAgICAgICAgICB5MiA9IGludmVyLnkodFsyXSwgdFszXSk7XG4gICAgICAgICAgICAgICAgbS5yb3RhdGUodFsxXSwgeDIsIHkyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtLnJvdGF0ZSh0WzFdLCB0WzJdLCB0WzNdKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoY29tbWFuZCA9PSBcInNcIikge1xuICAgICAgICAgICAgaWYgKHRsZW4gPT0gMiB8fCB0bGVuID09IDMpIHtcbiAgICAgICAgICAgICAgYmIgPSBiYiB8fCBiYm94O1xuICAgICAgICAgICAgICBtLnNjYWxlKHRbMV0sIHRbdGxlbiAtIDFdLCBiYi54ICsgYmIud2lkdGggLyAyLCBiYi55ICsgYmIuaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRsZW4gPT0gNCkge1xuICAgICAgICAgICAgICBpZiAoYWJzb2x1dGUpIHtcbiAgICAgICAgICAgICAgICB4MiA9IGludmVyLngodFsyXSwgdFszXSk7XG4gICAgICAgICAgICAgICAgeTIgPSBpbnZlci55KHRbMl0sIHRbM10pO1xuICAgICAgICAgICAgICAgIG0uc2NhbGUodFsxXSwgdFsxXSwgeDIsIHkyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtLnNjYWxlKHRbMV0sIHRbMV0sIHRbMl0sIHRbM10pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRsZW4gPT0gNSkge1xuICAgICAgICAgICAgICBpZiAoYWJzb2x1dGUpIHtcbiAgICAgICAgICAgICAgICB4MiA9IGludmVyLngodFszXSwgdFs0XSk7XG4gICAgICAgICAgICAgICAgeTIgPSBpbnZlci55KHRbM10sIHRbNF0pO1xuICAgICAgICAgICAgICAgIG0uc2NhbGUodFsxXSwgdFsyXSwgeDIsIHkyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtLnNjYWxlKHRbMV0sIHRbMl0sIHRbM10sIHRbNF0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChjb21tYW5kID09IFwibVwiICYmIHRsZW4gPT0gNykge1xuICAgICAgICAgICAgbS5hZGQodFsxXSwgdFsyXSwgdFszXSwgdFs0XSwgdFs1XSwgdFs2XSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBtO1xuICAgIH1cblxuICAgIFNuYXAuXy50cmFuc2Zvcm0ybWF0cml4ID0gdHJhbnNmb3JtMm1hdHJpeDtcbiAgICBTbmFwLl91bml0MnB4ID0gdW5pdDJweDtcbiAgICB2YXIgY29udGFpbnMgPSBnbG9iLmRvYy5jb250YWlucyB8fCBnbG9iLmRvYy5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiA/IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICB2YXIgYWRvd24gPSBhLm5vZGVUeXBlID09IDkgPyBhLmRvY3VtZW50RWxlbWVudCA6IGEsXG4gICAgICAgICAgYnVwID0gYiAmJiBiLnBhcmVudE5vZGU7XG4gICAgICByZXR1cm4gYSA9PSBidXAgfHwgISEoYnVwICYmIGJ1cC5ub2RlVHlwZSA9PSAxICYmIChhZG93bi5jb250YWlucyA/IGFkb3duLmNvbnRhaW5zKGJ1cCkgOiBhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uICYmIGEuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYnVwKSAmIDE2KSk7XG4gICAgfSA6IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICBpZiAoYikge1xuICAgICAgICB3aGlsZSAoYikge1xuICAgICAgICAgIGIgPSBiLnBhcmVudE5vZGU7XG5cbiAgICAgICAgICBpZiAoYiA9PSBhKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRTb21lRGVmcyhlbCkge1xuICAgICAgdmFyIHAgPSBlbC5ub2RlLm93bmVyU1ZHRWxlbWVudCAmJiB3cmFwKGVsLm5vZGUub3duZXJTVkdFbGVtZW50KSB8fCBlbC5ub2RlLnBhcmVudE5vZGUgJiYgd3JhcChlbC5ub2RlLnBhcmVudE5vZGUpIHx8IFNuYXAuc2VsZWN0KFwic3ZnXCIpIHx8IFNuYXAoMCwgMCksXG4gICAgICAgICAgcGRlZnMgPSBwLnNlbGVjdChcImRlZnNcIiksXG4gICAgICAgICAgZGVmcyA9IHBkZWZzID09IG51bGwgPyBmYWxzZSA6IHBkZWZzLm5vZGU7XG5cbiAgICAgIGlmICghZGVmcykge1xuICAgICAgICBkZWZzID0gbWFrZShcImRlZnNcIiwgcC5ub2RlKS5ub2RlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGVmcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTb21lU1ZHKGVsKSB7XG4gICAgICByZXR1cm4gZWwubm9kZS5vd25lclNWR0VsZW1lbnQgJiYgd3JhcChlbC5ub2RlLm93bmVyU1ZHRWxlbWVudCkgfHwgU25hcC5zZWxlY3QoXCJzdmdcIik7XG4gICAgfVxuXG4gICAgU25hcC5fLmdldFNvbWVEZWZzID0gZ2V0U29tZURlZnM7XG4gICAgU25hcC5fLmdldFNvbWVTVkcgPSBnZXRTb21lU1ZHO1xuXG4gICAgZnVuY3Rpb24gdW5pdDJweChlbCwgbmFtZSwgdmFsdWUpIHtcbiAgICAgIHZhciBzdmcgPSBnZXRTb21lU1ZHKGVsKS5ub2RlLFxuICAgICAgICAgIG91dCA9IHt9LFxuICAgICAgICAgIG1nciA9IHN2Zy5xdWVyeVNlbGVjdG9yKFwiLnN2Zy0tLW1nclwiKTtcblxuICAgICAgaWYgKCFtZ3IpIHtcbiAgICAgICAgbWdyID0gJChcInJlY3RcIik7XG4gICAgICAgICQobWdyLCB7XG4gICAgICAgICAgeDogLTllOSxcbiAgICAgICAgICB5OiAtOWU5LFxuICAgICAgICAgIHdpZHRoOiAxMCxcbiAgICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICAgIFwiY2xhc3NcIjogXCJzdmctLS1tZ3JcIixcbiAgICAgICAgICBmaWxsOiBcIm5vbmVcIlxuICAgICAgICB9KTtcbiAgICAgICAgc3ZnLmFwcGVuZENoaWxkKG1ncik7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdldFcodmFsKSB7XG4gICAgICAgIGlmICh2YWwgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBFO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbCA9PSArdmFsKSB7XG4gICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgICQobWdyLCB7XG4gICAgICAgICAgd2lkdGg6IHZhbFxuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBtZ3IuZ2V0QkJveCgpLndpZHRoO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZ2V0SCh2YWwpIHtcbiAgICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIEU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsID09ICt2YWwpIHtcbiAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9XG5cbiAgICAgICAgJChtZ3IsIHtcbiAgICAgICAgICBoZWlnaHQ6IHZhbFxuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBtZ3IuZ2V0QkJveCgpLmhlaWdodDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldChuYW0sIGYpIHtcbiAgICAgICAgaWYgKG5hbWUgPT0gbnVsbCkge1xuICAgICAgICAgIG91dFtuYW1dID0gZihlbC5hdHRyKG5hbSkgfHwgMCk7XG4gICAgICAgIH0gZWxzZSBpZiAobmFtID09IG5hbWUpIHtcbiAgICAgICAgICBvdXQgPSBmKHZhbHVlID09IG51bGwgPyBlbC5hdHRyKG5hbSkgfHwgMCA6IHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKGVsLnR5cGUpIHtcbiAgICAgICAgY2FzZSBcInJlY3RcIjpcbiAgICAgICAgICBzZXQoXCJyeFwiLCBnZXRXKTtcbiAgICAgICAgICBzZXQoXCJyeVwiLCBnZXRIKTtcblxuICAgICAgICBjYXNlIFwiaW1hZ2VcIjpcbiAgICAgICAgICBzZXQoXCJ3aWR0aFwiLCBnZXRXKTtcbiAgICAgICAgICBzZXQoXCJoZWlnaHRcIiwgZ2V0SCk7XG5cbiAgICAgICAgY2FzZSBcInRleHRcIjpcbiAgICAgICAgICBzZXQoXCJ4XCIsIGdldFcpO1xuICAgICAgICAgIHNldChcInlcIiwgZ2V0SCk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImNpcmNsZVwiOlxuICAgICAgICAgIHNldChcImN4XCIsIGdldFcpO1xuICAgICAgICAgIHNldChcImN5XCIsIGdldEgpO1xuICAgICAgICAgIHNldChcInJcIiwgZ2V0Vyk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImVsbGlwc2VcIjpcbiAgICAgICAgICBzZXQoXCJjeFwiLCBnZXRXKTtcbiAgICAgICAgICBzZXQoXCJjeVwiLCBnZXRIKTtcbiAgICAgICAgICBzZXQoXCJyeFwiLCBnZXRXKTtcbiAgICAgICAgICBzZXQoXCJyeVwiLCBnZXRIKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwibGluZVwiOlxuICAgICAgICAgIHNldChcIngxXCIsIGdldFcpO1xuICAgICAgICAgIHNldChcIngyXCIsIGdldFcpO1xuICAgICAgICAgIHNldChcInkxXCIsIGdldEgpO1xuICAgICAgICAgIHNldChcInkyXCIsIGdldEgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJtYXJrZXJcIjpcbiAgICAgICAgICBzZXQoXCJyZWZYXCIsIGdldFcpO1xuICAgICAgICAgIHNldChcIm1hcmtlcldpZHRoXCIsIGdldFcpO1xuICAgICAgICAgIHNldChcInJlZllcIiwgZ2V0SCk7XG4gICAgICAgICAgc2V0KFwibWFya2VySGVpZ2h0XCIsIGdldEgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJyYWRpYWxHcmFkaWVudFwiOlxuICAgICAgICAgIHNldChcImZ4XCIsIGdldFcpO1xuICAgICAgICAgIHNldChcImZ5XCIsIGdldEgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJ0c3BhblwiOlxuICAgICAgICAgIHNldChcImR4XCIsIGdldFcpO1xuICAgICAgICAgIHNldChcImR5XCIsIGdldEgpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgc2V0KG5hbWUsIGdldFcpO1xuICAgICAgfVxuXG4gICAgICBzdmcucmVtb3ZlQ2hpbGQobWdyKTtcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBTbmFwLnNlbGVjdFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogV3JhcHMgYSBET00gZWxlbWVudCBzcGVjaWZpZWQgYnkgQ1NTIHNlbGVjdG9yIGFzIEBFbGVtZW50XG4gICAgIC0gcXVlcnkgKHN0cmluZykgQ1NTIHNlbGVjdG9yIG9mIHRoZSBlbGVtZW50XG4gICAgID0gKEVsZW1lbnQpIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICBcXCovXG5cblxuICAgIFNuYXAuc2VsZWN0ID0gZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICBxdWVyeSA9IFN0cihxdWVyeSkucmVwbGFjZSgvKFteXFxcXF0pOi9nLCBcIiQxXFxcXDpcIik7XG4gICAgICByZXR1cm4gd3JhcChnbG9iLmRvYy5xdWVyeVNlbGVjdG9yKHF1ZXJ5KSk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5zZWxlY3RBbGxcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFdyYXBzIERPTSBlbGVtZW50cyBzcGVjaWZpZWQgYnkgQ1NTIHNlbGVjdG9yIGFzIHNldCBvciBhcnJheSBvZiBARWxlbWVudFxuICAgICAtIHF1ZXJ5IChzdHJpbmcpIENTUyBzZWxlY3RvciBvZiB0aGUgZWxlbWVudFxuICAgICA9IChFbGVtZW50KSB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLnNlbGVjdEFsbCA9IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgdmFyIG5vZGVsaXN0ID0gZ2xvYi5kb2MucXVlcnlTZWxlY3RvckFsbChxdWVyeSksXG4gICAgICAgICAgc2V0ID0gKFNuYXAuc2V0IHx8IEFycmF5KSgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNldC5wdXNoKHdyYXAobm9kZWxpc3RbaV0pKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNldDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gYWRkMmdyb3VwKGxpc3QpIHtcbiAgICAgIGlmICghaXMobGlzdCwgXCJhcnJheVwiKSkge1xuICAgICAgICBsaXN0ID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgIGogPSAwLFxuICAgICAgICAgIG5vZGUgPSB0aGlzLm5vZGU7XG5cbiAgICAgIHdoaWxlICh0aGlzW2ldKSBkZWxldGUgdGhpc1tpKytdO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAobGlzdFtpXS50eXBlID09IFwic2V0XCIpIHtcbiAgICAgICAgICBsaXN0W2ldLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKGVsLm5vZGUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQobGlzdFtpXS5ub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgY2hpbGRyZW4gPSBub2RlLmNoaWxkTm9kZXM7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzW2orK10gPSB3cmFwKGNoaWxkcmVuW2ldKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSAvLyBIdWIgZ2FyYmFnZSBjb2xsZWN0b3IgZXZlcnkgMTBzXG5cblxuICAgIHNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBodWIpIGlmIChodWJbaGFzXShrZXkpKSB7XG4gICAgICAgIHZhciBlbCA9IGh1YltrZXldLFxuICAgICAgICAgICAgbm9kZSA9IGVsLm5vZGU7XG5cbiAgICAgICAgaWYgKGVsLnR5cGUgIT0gXCJzdmdcIiAmJiAhbm9kZS5vd25lclNWR0VsZW1lbnQgfHwgZWwudHlwZSA9PSBcInN2Z1wiICYmICghbm9kZS5wYXJlbnROb2RlIHx8IFwib3duZXJTVkdFbGVtZW50XCIgaW4gbm9kZS5wYXJlbnROb2RlICYmICFub2RlLm93bmVyU1ZHRWxlbWVudCkpIHtcbiAgICAgICAgICBkZWxldGUgaHViW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAxZTQpO1xuXG4gICAgZnVuY3Rpb24gRWxlbWVudChlbCkge1xuICAgICAgaWYgKGVsLnNuYXAgaW4gaHViKSB7XG4gICAgICAgIHJldHVybiBodWJbZWwuc25hcF07XG4gICAgICB9XG5cbiAgICAgIHZhciBzdmc7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHN2ZyA9IGVsLm93bmVyU1ZHRWxlbWVudDtcbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAvKlxcXG4gICAgICAgKiBFbGVtZW50Lm5vZGVcbiAgICAgICBbIHByb3BlcnR5IChvYmplY3QpIF1cbiAgICAgICAqKlxuICAgICAgICogR2l2ZXMgeW91IGEgcmVmZXJlbmNlIHRvIHRoZSBET00gb2JqZWN0LCBzbyB5b3UgY2FuIGFzc2lnbiBldmVudCBoYW5kbGVycyBvciBqdXN0IG1lc3MgYXJvdW5kLlxuICAgICAgID4gVXNhZ2VcbiAgICAgICB8IC8vIGRyYXcgYSBjaXJjbGUgYXQgY29vcmRpbmF0ZSAxMCwxMCB3aXRoIHJhZGl1cyBvZiAxMFxuICAgICAgIHwgdmFyIGMgPSBwYXBlci5jaXJjbGUoMTAsIDEwLCAxMCk7XG4gICAgICAgfCBjLm5vZGUub25jbGljayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICB8ICAgICBjLmF0dHIoXCJmaWxsXCIsIFwicmVkXCIpO1xuICAgICAgIHwgfTtcbiAgICAgIFxcKi9cblxuXG4gICAgICB0aGlzLm5vZGUgPSBlbDtcblxuICAgICAgaWYgKHN2Zykge1xuICAgICAgICB0aGlzLnBhcGVyID0gbmV3IFBhcGVyKHN2Zyk7XG4gICAgICB9XG4gICAgICAvKlxcXG4gICAgICAgKiBFbGVtZW50LnR5cGVcbiAgICAgICBbIHByb3BlcnR5IChzdHJpbmcpIF1cbiAgICAgICAqKlxuICAgICAgICogU1ZHIHRhZyBuYW1lIG9mIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgICAgXFwqL1xuXG5cbiAgICAgIHRoaXMudHlwZSA9IGVsLnRhZ05hbWUgfHwgZWwubm9kZU5hbWU7XG4gICAgICB2YXIgaWQgPSB0aGlzLmlkID0gSUQodGhpcyk7XG4gICAgICB0aGlzLmFuaW1zID0ge307XG4gICAgICB0aGlzLl8gPSB7XG4gICAgICAgIHRyYW5zZm9ybTogW11cbiAgICAgIH07XG4gICAgICBlbC5zbmFwID0gaWQ7XG4gICAgICBodWJbaWRdID0gdGhpcztcblxuICAgICAgaWYgKHRoaXMudHlwZSA9PSBcImdcIikge1xuICAgICAgICB0aGlzLmFkZCA9IGFkZDJncm91cDtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudHlwZSBpbiB7XG4gICAgICAgIGc6IDEsXG4gICAgICAgIG1hc2s6IDEsXG4gICAgICAgIHBhdHRlcm46IDEsXG4gICAgICAgIHN5bWJvbDogMVxuICAgICAgfSkge1xuICAgICAgICBmb3IgKHZhciBtZXRob2QgaW4gUGFwZXIucHJvdG90eXBlKSBpZiAoUGFwZXIucHJvdG90eXBlW2hhc10obWV0aG9kKSkge1xuICAgICAgICAgIHRoaXNbbWV0aG9kXSA9IFBhcGVyLnByb3RvdHlwZVttZXRob2RdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8qXFxcbiAgICAgICogRWxlbWVudC5hdHRyXG4gICAgICBbIG1ldGhvZCBdXG4gICAgICAqKlxuICAgICAgKiBHZXRzIG9yIHNldHMgZ2l2ZW4gYXR0cmlidXRlcyBvZiB0aGUgZWxlbWVudC5cbiAgICAgICoqXG4gICAgICAtIHBhcmFtcyAob2JqZWN0KSBjb250YWlucyBrZXktdmFsdWUgcGFpcnMgb2YgYXR0cmlidXRlcyB5b3Ugd2FudCB0byBzZXRcbiAgICAgICogb3JcbiAgICAgIC0gcGFyYW0gKHN0cmluZykgbmFtZSBvZiB0aGUgYXR0cmlidXRlXG4gICAgICA9IChFbGVtZW50KSB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICAqIG9yXG4gICAgICA9IChzdHJpbmcpIHZhbHVlIG9mIGF0dHJpYnV0ZVxuICAgICAgPiBVc2FnZVxuICAgICAgfCBlbC5hdHRyKHtcbiAgICAgIHwgICAgIGZpbGw6IFwiI2ZjMFwiLFxuICAgICAgfCAgICAgc3Ryb2tlOiBcIiMwMDBcIixcbiAgICAgIHwgICAgIHN0cm9rZVdpZHRoOiAyLCAvLyBDYW1lbENhc2UuLi5cbiAgICAgIHwgICAgIFwiZmlsbC1vcGFjaXR5XCI6IDAuNSwgLy8gb3IgZGFzaC1zZXBhcmF0ZWQgbmFtZXNcbiAgICAgIHwgICAgIHdpZHRoOiBcIio9MlwiIC8vIHByZWZpeGVkIHZhbHVlc1xuICAgICAgfCB9KTtcbiAgICAgIHwgY29uc29sZS5sb2coZWwuYXR0cihcImZpbGxcIikpOyAvLyAjZmMwXG4gICAgICAqIFByZWZpeGVkIHZhbHVlcyBpbiBmb3JtYXQgYFwiKz0xMFwiYCBzdXBwb3J0ZWQuIEFsbCBmb3VyIG9wZXJhdGlvbnNcbiAgICAgICogKGArYCwgYC1gLCBgKmAgYW5kIGAvYCkgY291bGQgYmUgdXNlZC4gT3B0aW9uYWxseSB5b3UgY2FuIHVzZSB1bml0cyBmb3IgYCtgXG4gICAgICAqIGFuZCBgLWA6IGBcIis9MmVtXCJgLlxuICAgICBcXCovXG5cblxuICAgIEVsZW1lbnQucHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbiAocGFyYW1zLCB2YWx1ZSkge1xuICAgICAgdmFyIGVsID0gdGhpcyxcbiAgICAgICAgICBub2RlID0gZWwubm9kZTtcblxuICAgICAgaWYgKCFwYXJhbXMpIHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgIT0gMSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0ZXh0OiBub2RlLm5vZGVWYWx1ZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYXR0ciA9IG5vZGUuYXR0cmlidXRlcyxcbiAgICAgICAgICAgIG91dCA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGF0dHIubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgIG91dFthdHRyW2ldLm5vZGVOYW1lXSA9IGF0dHJbaV0ubm9kZVZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG91dDtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzKHBhcmFtcywgXCJzdHJpbmdcIikpIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdmFyIGpzb24gPSB7fTtcbiAgICAgICAgICBqc29uW3BhcmFtc10gPSB2YWx1ZTtcbiAgICAgICAgICBwYXJhbXMgPSBqc29uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBldmUoXCJzbmFwLnV0aWwuZ2V0YXR0ci5cIiArIHBhcmFtcywgZWwpLmZpcnN0RGVmaW5lZCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGF0dCBpbiBwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtc1toYXNdKGF0dCkpIHtcbiAgICAgICAgICBldmUoXCJzbmFwLnV0aWwuYXR0ci5cIiArIGF0dCwgZWwsIHBhcmFtc1thdHRdKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZWw7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5wYXJzZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUGFyc2VzIFNWRyBmcmFnbWVudCBhbmQgY29udmVydHMgaXQgaW50byBhIEBGcmFnbWVudFxuICAgICAqKlxuICAgICAtIHN2ZyAoc3RyaW5nKSBTVkcgc3RyaW5nXG4gICAgID0gKEZyYWdtZW50KSB0aGUgQEZyYWdtZW50XG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLnBhcnNlID0gZnVuY3Rpb24gKHN2Zykge1xuICAgICAgdmFyIGYgPSBnbG9iLmRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXG4gICAgICAgICAgZnVsbCA9IHRydWUsXG4gICAgICAgICAgZGl2ID0gZ2xvYi5kb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIHN2ZyA9IFN0cihzdmcpO1xuXG4gICAgICBpZiAoIXN2Zy5tYXRjaCgvXlxccyo8XFxzKnN2Zyg/Olxcc3w+KS8pKSB7XG4gICAgICAgIHN2ZyA9IFwiPHN2Zz5cIiArIHN2ZyArIFwiPC9zdmc+XCI7XG4gICAgICAgIGZ1bGwgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgZGl2LmlubmVySFRNTCA9IHN2ZztcbiAgICAgIHN2ZyA9IGRpdi5nZXRFbGVtZW50c0J5VGFnTmFtZShcInN2Z1wiKVswXTtcblxuICAgICAgaWYgKHN2Zykge1xuICAgICAgICBpZiAoZnVsbCkge1xuICAgICAgICAgIGYgPSBzdmc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgd2hpbGUgKHN2Zy5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBmLmFwcGVuZENoaWxkKHN2Zy5maXJzdENoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBGcmFnbWVudChmKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gRnJhZ21lbnQoZnJhZykge1xuICAgICAgdGhpcy5ub2RlID0gZnJhZztcbiAgICB9XG4gICAgLypcXFxuICAgICAqIFNuYXAuZnJhZ21lbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYSBET00gZnJhZ21lbnQgZnJvbSBhIGdpdmVuIGxpc3Qgb2YgZWxlbWVudHMgb3Igc3RyaW5nc1xuICAgICAqKlxuICAgICAtIHZhcmFyZ3MgKOKApikgU1ZHIHN0cmluZ1xuICAgICA9IChGcmFnbWVudCkgdGhlIEBGcmFnbWVudFxuICAgIFxcKi9cblxuXG4gICAgU25hcC5mcmFnbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSxcbiAgICAgICAgICBmID0gZ2xvYi5kb2MuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBhcmdzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgdmFyIGl0ZW0gPSBhcmdzW2ldO1xuXG4gICAgICAgIGlmIChpdGVtLm5vZGUgJiYgaXRlbS5ub2RlLm5vZGVUeXBlKSB7XG4gICAgICAgICAgZi5hcHBlbmRDaGlsZChpdGVtLm5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGl0ZW0ubm9kZVR5cGUpIHtcbiAgICAgICAgICBmLmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICBmLmFwcGVuZENoaWxkKFNuYXAucGFyc2UoaXRlbSkubm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBGcmFnbWVudChmKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbWFrZShuYW1lLCBwYXJlbnQpIHtcbiAgICAgIHZhciByZXMgPSAkKG5hbWUpO1xuICAgICAgcGFyZW50LmFwcGVuZENoaWxkKHJlcyk7XG4gICAgICB2YXIgZWwgPSB3cmFwKHJlcyk7XG4gICAgICByZXR1cm4gZWw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gUGFwZXIodywgaCkge1xuICAgICAgdmFyIHJlcyxcbiAgICAgICAgICBkZXNjLFxuICAgICAgICAgIGRlZnMsXG4gICAgICAgICAgcHJvdG8gPSBQYXBlci5wcm90b3R5cGU7XG5cbiAgICAgIGlmICh3ICYmIHcudGFnTmFtZSAmJiB3LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PSBcInN2Z1wiKSB7XG4gICAgICAgIGlmICh3LnNuYXAgaW4gaHViKSB7XG4gICAgICAgICAgcmV0dXJuIGh1Ylt3LnNuYXBdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGRvYyA9IHcub3duZXJEb2N1bWVudDtcbiAgICAgICAgcmVzID0gbmV3IEVsZW1lbnQodyk7XG4gICAgICAgIGRlc2MgPSB3LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiZGVzY1wiKVswXTtcbiAgICAgICAgZGVmcyA9IHcuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJkZWZzXCIpWzBdO1xuXG4gICAgICAgIGlmICghZGVzYykge1xuICAgICAgICAgIGRlc2MgPSAkKFwiZGVzY1wiKTtcbiAgICAgICAgICBkZXNjLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShcIkNyZWF0ZWQgd2l0aCBTbmFwXCIpKTtcbiAgICAgICAgICByZXMubm9kZS5hcHBlbmRDaGlsZChkZXNjKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZGVmcykge1xuICAgICAgICAgIGRlZnMgPSAkKFwiZGVmc1wiKTtcbiAgICAgICAgICByZXMubm9kZS5hcHBlbmRDaGlsZChkZWZzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcy5kZWZzID0gZGVmcztcblxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gcHJvdG8pIGlmIChwcm90b1toYXNdKGtleSkpIHtcbiAgICAgICAgICByZXNba2V5XSA9IHByb3RvW2tleV07XG4gICAgICAgIH1cblxuICAgICAgICByZXMucGFwZXIgPSByZXMucm9vdCA9IHJlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcyA9IG1ha2UoXCJzdmdcIiwgZ2xvYi5kb2MuYm9keSk7XG4gICAgICAgICQocmVzLm5vZGUsIHtcbiAgICAgICAgICBoZWlnaHQ6IGgsXG4gICAgICAgICAgdmVyc2lvbjogMS4xLFxuICAgICAgICAgIHdpZHRoOiB3LFxuICAgICAgICAgIHhtbG5zOiB4bWxuc1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB3cmFwKGRvbSkge1xuICAgICAgaWYgKCFkb20pIHtcbiAgICAgICAgcmV0dXJuIGRvbTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvbSBpbnN0YW5jZW9mIEVsZW1lbnQgfHwgZG9tIGluc3RhbmNlb2YgRnJhZ21lbnQpIHtcbiAgICAgICAgcmV0dXJuIGRvbTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRvbS50YWdOYW1lICYmIGRvbS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT0gXCJzdmdcIikge1xuICAgICAgICByZXR1cm4gbmV3IFBhcGVyKGRvbSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkb20udGFnTmFtZSAmJiBkb20udGFnTmFtZS50b0xvd2VyQ2FzZSgpID09IFwib2JqZWN0XCIgJiYgZG9tLnR5cGUgPT0gXCJpbWFnZS9zdmcreG1sXCIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQYXBlcihkb20uY29udGVudERvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic3ZnXCIpWzBdKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBFbGVtZW50KGRvbSk7XG4gICAgfVxuXG4gICAgU25hcC5fLm1ha2UgPSBtYWtlO1xuICAgIFNuYXAuXy53cmFwID0gd3JhcDtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuZWxcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYW4gZWxlbWVudCBvbiBwYXBlciB3aXRoIGEgZ2l2ZW4gbmFtZSBhbmQgbm8gYXR0cmlidXRlc1xuICAgICAqKlxuICAgICAtIG5hbWUgKHN0cmluZykgdGFnIG5hbWVcbiAgICAgLSBhdHRyIChvYmplY3QpIGF0dHJpYnV0ZXNcbiAgICAgPSAoRWxlbWVudCkgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIGMgPSBwYXBlci5jaXJjbGUoMTAsIDEwLCAxMCk7IC8vIGlzIHRoZSBzYW1lIGFzLi4uXG4gICAgIHwgdmFyIGMgPSBwYXBlci5lbChcImNpcmNsZVwiKS5hdHRyKHtcbiAgICAgfCAgICAgY3g6IDEwLFxuICAgICB8ICAgICBjeTogMTAsXG4gICAgIHwgICAgIHI6IDEwXG4gICAgIHwgfSk7XG4gICAgIHwgLy8gYW5kIHRoZSBzYW1lIGFzXG4gICAgIHwgdmFyIGMgPSBwYXBlci5lbChcImNpcmNsZVwiLCB7XG4gICAgIHwgICAgIGN4OiAxMCxcbiAgICAgfCAgICAgY3k6IDEwLFxuICAgICB8ICAgICByOiAxMFxuICAgICB8IH0pO1xuICAgIFxcKi9cblxuICAgIFBhcGVyLnByb3RvdHlwZS5lbCA9IGZ1bmN0aW9uIChuYW1lLCBhdHRyKSB7XG4gICAgICB2YXIgZWwgPSBtYWtlKG5hbWUsIHRoaXMubm9kZSk7XG4gICAgICBhdHRyICYmIGVsLmF0dHIoYXR0cik7XG4gICAgICByZXR1cm4gZWw7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5jaGlsZHJlblxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBhcnJheSBvZiBhbGwgdGhlIGNoaWxkcmVuIG9mIHRoZSBlbGVtZW50LlxuICAgICA9IChhcnJheSkgYXJyYXkgb2YgRWxlbWVudHNcbiAgICBcXCovXG5cblxuICAgIEVsZW1lbnQucHJvdG90eXBlLmNoaWxkcmVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG91dCA9IFtdLFxuICAgICAgICAgIGNoID0gdGhpcy5ub2RlLmNoaWxkTm9kZXM7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IGNoLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgb3V0W2ldID0gU25hcChjaFtpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGpzb25GaWxsZXIocm9vdCwgbykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcm9vdC5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgIHR5cGU6IHJvb3RbaV0udHlwZSxcbiAgICAgICAgICBhdHRyOiByb290W2ldLmF0dHIoKVxuICAgICAgICB9LFxuICAgICAgICAgICAgY2hpbGRyZW4gPSByb290W2ldLmNoaWxkcmVuKCk7XG4gICAgICAgIG8ucHVzaChpdGVtKTtcblxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAganNvbkZpbGxlcihjaGlsZHJlbiwgaXRlbS5jaGlsZE5vZGVzID0gW10pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRvSlNPTlxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIGVsZW1lbnQgYW5kIGFsbCBpdHMgY2hpbGRyZW4uXG4gICAgID0gKG9iamVjdCkgaW4gZm9ybWF0XG4gICAgIG8ge1xuICAgICBvICAgICB0eXBlIChzdHJpbmcpIHRoaXMudHlwZSxcbiAgICAgbyAgICAgYXR0ciAob2JqZWN0KSBhdHRyaWJ1dGVzIG1hcCxcbiAgICAgbyAgICAgY2hpbGROb2RlcyAoYXJyYXkpIG9wdGlvbmFsIGFycmF5IG9mIGNoaWxkcmVuIGluIHRoZSBzYW1lIGZvcm1hdFxuICAgICBvIH1cbiAgICBcXCovXG5cblxuICAgIEVsZW1lbnQucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBvdXQgPSBbXTtcbiAgICAgIGpzb25GaWxsZXIoW3RoaXNdLCBvdXQpO1xuICAgICAgcmV0dXJuIG91dFswXTtcbiAgICB9OyAvLyBkZWZhdWx0XG5cblxuICAgIGV2ZS5vbihcInNuYXAudXRpbC5nZXRhdHRyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBhdHQgPSBldmUubnQoKTtcbiAgICAgIGF0dCA9IGF0dC5zdWJzdHJpbmcoYXR0Lmxhc3RJbmRleE9mKFwiLlwiKSArIDEpO1xuICAgICAgdmFyIGNzcyA9IGF0dC5yZXBsYWNlKC9bQS1aXS9nLCBmdW5jdGlvbiAobGV0dGVyKSB7XG4gICAgICAgIHJldHVybiBcIi1cIiArIGxldHRlci50b0xvd2VyQ2FzZSgpO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChjc3NBdHRyW2hhc10oY3NzKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLm5vZGUsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoY3NzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAkKHRoaXMubm9kZSwgYXR0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgY3NzQXR0ciA9IHtcbiAgICAgIFwiYWxpZ25tZW50LWJhc2VsaW5lXCI6IDAsXG4gICAgICBcImJhc2VsaW5lLXNoaWZ0XCI6IDAsXG4gICAgICBcImNsaXBcIjogMCxcbiAgICAgIFwiY2xpcC1wYXRoXCI6IDAsXG4gICAgICBcImNsaXAtcnVsZVwiOiAwLFxuICAgICAgXCJjb2xvclwiOiAwLFxuICAgICAgXCJjb2xvci1pbnRlcnBvbGF0aW9uXCI6IDAsXG4gICAgICBcImNvbG9yLWludGVycG9sYXRpb24tZmlsdGVyc1wiOiAwLFxuICAgICAgXCJjb2xvci1wcm9maWxlXCI6IDAsXG4gICAgICBcImNvbG9yLXJlbmRlcmluZ1wiOiAwLFxuICAgICAgXCJjdXJzb3JcIjogMCxcbiAgICAgIFwiZGlyZWN0aW9uXCI6IDAsXG4gICAgICBcImRpc3BsYXlcIjogMCxcbiAgICAgIFwiZG9taW5hbnQtYmFzZWxpbmVcIjogMCxcbiAgICAgIFwiZW5hYmxlLWJhY2tncm91bmRcIjogMCxcbiAgICAgIFwiZmlsbFwiOiAwLFxuICAgICAgXCJmaWxsLW9wYWNpdHlcIjogMCxcbiAgICAgIFwiZmlsbC1ydWxlXCI6IDAsXG4gICAgICBcImZpbHRlclwiOiAwLFxuICAgICAgXCJmbG9vZC1jb2xvclwiOiAwLFxuICAgICAgXCJmbG9vZC1vcGFjaXR5XCI6IDAsXG4gICAgICBcImZvbnRcIjogMCxcbiAgICAgIFwiZm9udC1mYW1pbHlcIjogMCxcbiAgICAgIFwiZm9udC1zaXplXCI6IDAsXG4gICAgICBcImZvbnQtc2l6ZS1hZGp1c3RcIjogMCxcbiAgICAgIFwiZm9udC1zdHJldGNoXCI6IDAsXG4gICAgICBcImZvbnQtc3R5bGVcIjogMCxcbiAgICAgIFwiZm9udC12YXJpYW50XCI6IDAsXG4gICAgICBcImZvbnQtd2VpZ2h0XCI6IDAsXG4gICAgICBcImdseXBoLW9yaWVudGF0aW9uLWhvcml6b250YWxcIjogMCxcbiAgICAgIFwiZ2x5cGgtb3JpZW50YXRpb24tdmVydGljYWxcIjogMCxcbiAgICAgIFwiaW1hZ2UtcmVuZGVyaW5nXCI6IDAsXG4gICAgICBcImtlcm5pbmdcIjogMCxcbiAgICAgIFwibGV0dGVyLXNwYWNpbmdcIjogMCxcbiAgICAgIFwibGlnaHRpbmctY29sb3JcIjogMCxcbiAgICAgIFwibWFya2VyXCI6IDAsXG4gICAgICBcIm1hcmtlci1lbmRcIjogMCxcbiAgICAgIFwibWFya2VyLW1pZFwiOiAwLFxuICAgICAgXCJtYXJrZXItc3RhcnRcIjogMCxcbiAgICAgIFwibWFza1wiOiAwLFxuICAgICAgXCJvcGFjaXR5XCI6IDAsXG4gICAgICBcIm92ZXJmbG93XCI6IDAsXG4gICAgICBcInBvaW50ZXItZXZlbnRzXCI6IDAsXG4gICAgICBcInNoYXBlLXJlbmRlcmluZ1wiOiAwLFxuICAgICAgXCJzdG9wLWNvbG9yXCI6IDAsXG4gICAgICBcInN0b3Atb3BhY2l0eVwiOiAwLFxuICAgICAgXCJzdHJva2VcIjogMCxcbiAgICAgIFwic3Ryb2tlLWRhc2hhcnJheVwiOiAwLFxuICAgICAgXCJzdHJva2UtZGFzaG9mZnNldFwiOiAwLFxuICAgICAgXCJzdHJva2UtbGluZWNhcFwiOiAwLFxuICAgICAgXCJzdHJva2UtbGluZWpvaW5cIjogMCxcbiAgICAgIFwic3Ryb2tlLW1pdGVybGltaXRcIjogMCxcbiAgICAgIFwic3Ryb2tlLW9wYWNpdHlcIjogMCxcbiAgICAgIFwic3Ryb2tlLXdpZHRoXCI6IDAsXG4gICAgICBcInRleHQtYW5jaG9yXCI6IDAsXG4gICAgICBcInRleHQtZGVjb3JhdGlvblwiOiAwLFxuICAgICAgXCJ0ZXh0LXJlbmRlcmluZ1wiOiAwLFxuICAgICAgXCJ1bmljb2RlLWJpZGlcIjogMCxcbiAgICAgIFwidmlzaWJpbGl0eVwiOiAwLFxuICAgICAgXCJ3b3JkLXNwYWNpbmdcIjogMCxcbiAgICAgIFwid3JpdGluZy1tb2RlXCI6IDBcbiAgICB9O1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5hdHRyXCIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIGF0dCA9IGV2ZS5udCgpLFxuICAgICAgICAgIGF0dHIgPSB7fTtcbiAgICAgIGF0dCA9IGF0dC5zdWJzdHJpbmcoYXR0Lmxhc3RJbmRleE9mKFwiLlwiKSArIDEpO1xuICAgICAgYXR0clthdHRdID0gdmFsdWU7XG4gICAgICB2YXIgc3R5bGUgPSBhdHQucmVwbGFjZSgvLShcXHcpL2dpLCBmdW5jdGlvbiAoYWxsLCBsZXR0ZXIpIHtcbiAgICAgICAgcmV0dXJuIGxldHRlci50b1VwcGVyQ2FzZSgpO1xuICAgICAgfSksXG4gICAgICAgICAgY3NzID0gYXR0LnJlcGxhY2UoL1tBLVpdL2csIGZ1bmN0aW9uIChsZXR0ZXIpIHtcbiAgICAgICAgcmV0dXJuIFwiLVwiICsgbGV0dGVyLnRvTG93ZXJDYXNlKCk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGNzc0F0dHJbaGFzXShjc3MpKSB7XG4gICAgICAgIHRoaXMubm9kZS5zdHlsZVtzdHlsZV0gPSB2YWx1ZSA9PSBudWxsID8gRSA6IHZhbHVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJCh0aGlzLm5vZGUsIGF0dHIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgKGZ1bmN0aW9uIChwcm90bykge30pKFBhcGVyLnByb3RvdHlwZSk7IC8vIHNpbXBsZSBhamF4XG5cbiAgICAvKlxcXG4gICAgICogU25hcC5hamF4XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTaW1wbGUgaW1wbGVtZW50YXRpb24gb2YgQWpheFxuICAgICAqKlxuICAgICAtIHVybCAoc3RyaW5nKSBVUkxcbiAgICAgLSBwb3N0RGF0YSAob2JqZWN0fHN0cmluZykgZGF0YSBmb3IgcG9zdCByZXF1ZXN0XG4gICAgIC0gY2FsbGJhY2sgKGZ1bmN0aW9uKSBjYWxsYmFja1xuICAgICAtIHNjb3BlIChvYmplY3QpICNvcHRpb25hbCBzY29wZSBvZiBjYWxsYmFja1xuICAgICAqIG9yXG4gICAgIC0gdXJsIChzdHJpbmcpIFVSTFxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgY2FsbGJhY2tcbiAgICAgLSBzY29wZSAob2JqZWN0KSAjb3B0aW9uYWwgc2NvcGUgb2YgY2FsbGJhY2tcbiAgICAgPSAoWE1MSHR0cFJlcXVlc3QpIHRoZSBYTUxIdHRwUmVxdWVzdCBvYmplY3QsIGp1c3QgaW4gY2FzZVxuICAgIFxcKi9cblxuXG4gICAgU25hcC5hamF4ID0gZnVuY3Rpb24gKHVybCwgcG9zdERhdGEsIGNhbGxiYWNrLCBzY29wZSkge1xuICAgICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLFxuICAgICAgICAgIGlkID0gSUQoKTtcblxuICAgICAgaWYgKHJlcSkge1xuICAgICAgICBpZiAoaXMocG9zdERhdGEsIFwiZnVuY3Rpb25cIikpIHtcbiAgICAgICAgICBzY29wZSA9IGNhbGxiYWNrO1xuICAgICAgICAgIGNhbGxiYWNrID0gcG9zdERhdGE7XG4gICAgICAgICAgcG9zdERhdGEgPSBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKGlzKHBvc3REYXRhLCBcIm9iamVjdFwiKSkge1xuICAgICAgICAgIHZhciBwZCA9IFtdO1xuXG4gICAgICAgICAgZm9yICh2YXIga2V5IGluIHBvc3REYXRhKSBpZiAocG9zdERhdGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcGQucHVzaChlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHBvc3REYXRhW2tleV0pKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwb3N0RGF0YSA9IHBkLmpvaW4oXCImXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVxLm9wZW4ocG9zdERhdGEgPyBcIlBPU1RcIiA6IFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG5cbiAgICAgICAgaWYgKHBvc3REYXRhKSB7XG4gICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJYLVJlcXVlc3RlZC1XaXRoXCIsIFwiWE1MSHR0cFJlcXVlc3RcIik7XG4gICAgICAgICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICBldmUub25jZShcInNuYXAuYWpheC5cIiArIGlkICsgXCIuMFwiLCBjYWxsYmFjayk7XG4gICAgICAgICAgZXZlLm9uY2UoXCJzbmFwLmFqYXguXCIgKyBpZCArIFwiLjIwMFwiLCBjYWxsYmFjayk7XG4gICAgICAgICAgZXZlLm9uY2UoXCJzbmFwLmFqYXguXCIgKyBpZCArIFwiLjMwNFwiLCBjYWxsYmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICByZXEub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSAhPSA0KSByZXR1cm47XG4gICAgICAgICAgZXZlKFwic25hcC5hamF4LlwiICsgaWQgKyBcIi5cIiArIHJlcS5zdGF0dXMsIHNjb3BlLCByZXEpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSA9PSA0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlcTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcS5zZW5kKHBvc3REYXRhKTtcbiAgICAgICAgcmV0dXJuIHJlcTtcbiAgICAgIH1cbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmxvYWRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIExvYWRzIGV4dGVybmFsIFNWRyBmaWxlIGFzIGEgQEZyYWdtZW50IChzZWUgQFNuYXAuYWpheCBmb3IgbW9yZSBhZHZhbmNlZCBBSkFYKVxuICAgICAqKlxuICAgICAtIHVybCAoc3RyaW5nKSBVUkxcbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pIGNhbGxiYWNrXG4gICAgIC0gc2NvcGUgKG9iamVjdCkgI29wdGlvbmFsIHNjb3BlIG9mIGNhbGxiYWNrXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmxvYWQgPSBmdW5jdGlvbiAodXJsLCBjYWxsYmFjaywgc2NvcGUpIHtcbiAgICAgIFNuYXAuYWpheCh1cmwsIGZ1bmN0aW9uIChyZXEpIHtcbiAgICAgICAgdmFyIGYgPSBTbmFwLnBhcnNlKHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICBzY29wZSA/IGNhbGxiYWNrLmNhbGwoc2NvcGUsIGYpIDogY2FsbGJhY2soZik7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgdmFyIGdldE9mZnNldCA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICB2YXIgYm94ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICBkb2MgPSBlbGVtLm93bmVyRG9jdW1lbnQsXG4gICAgICAgICAgYm9keSA9IGRvYy5ib2R5LFxuICAgICAgICAgIGRvY0VsZW0gPSBkb2MuZG9jdW1lbnRFbGVtZW50LFxuICAgICAgICAgIGNsaWVudFRvcCA9IGRvY0VsZW0uY2xpZW50VG9wIHx8IGJvZHkuY2xpZW50VG9wIHx8IDAsXG4gICAgICAgICAgY2xpZW50TGVmdCA9IGRvY0VsZW0uY2xpZW50TGVmdCB8fCBib2R5LmNsaWVudExlZnQgfHwgMCxcbiAgICAgICAgICB0b3AgPSBib3gudG9wICsgKGcud2luLnBhZ2VZT2Zmc2V0IHx8IGRvY0VsZW0uc2Nyb2xsVG9wIHx8IGJvZHkuc2Nyb2xsVG9wKSAtIGNsaWVudFRvcCxcbiAgICAgICAgICBsZWZ0ID0gYm94LmxlZnQgKyAoZy53aW4ucGFnZVhPZmZzZXQgfHwgZG9jRWxlbS5zY3JvbGxMZWZ0IHx8IGJvZHkuc2Nyb2xsTGVmdCkgLSBjbGllbnRMZWZ0O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeTogdG9wLFxuICAgICAgICB4OiBsZWZ0XG4gICAgICB9O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNuYXAuZ2V0RWxlbWVudEJ5UG9pbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgeW91IHRvcG1vc3QgZWxlbWVudCB1bmRlciBnaXZlbiBwb2ludC5cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBTbmFwIGVsZW1lbnQgb2JqZWN0XG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgZnJvbSB0aGUgdG9wIGxlZnQgY29ybmVyIG9mIHRoZSB3aW5kb3dcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBmcm9tIHRoZSB0b3AgbGVmdCBjb3JuZXIgb2YgdGhlIHdpbmRvd1xuICAgICA+IFVzYWdlXG4gICAgIHwgU25hcC5nZXRFbGVtZW50QnlQb2ludChtb3VzZVgsIG1vdXNlWSkuYXR0cih7c3Ryb2tlOiBcIiNmMDBcIn0pO1xuICAgIFxcKi9cblxuXG4gICAgU25hcC5nZXRFbGVtZW50QnlQb2ludCA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICB2YXIgcGFwZXIgPSB0aGlzLFxuICAgICAgICAgIHN2ZyA9IHBhcGVyLmNhbnZhcyxcbiAgICAgICAgICB0YXJnZXQgPSBnbG9iLmRvYy5lbGVtZW50RnJvbVBvaW50KHgsIHkpO1xuXG4gICAgICBpZiAoZ2xvYi53aW4ub3BlcmEgJiYgdGFyZ2V0LnRhZ05hbWUgPT0gXCJzdmdcIikge1xuICAgICAgICB2YXIgc28gPSBnZXRPZmZzZXQodGFyZ2V0KSxcbiAgICAgICAgICAgIHNyID0gdGFyZ2V0LmNyZWF0ZVNWR1JlY3QoKTtcbiAgICAgICAgc3IueCA9IHggLSBzby54O1xuICAgICAgICBzci55ID0geSAtIHNvLnk7XG4gICAgICAgIHNyLndpZHRoID0gc3IuaGVpZ2h0ID0gMTtcbiAgICAgICAgdmFyIGhpdHMgPSB0YXJnZXQuZ2V0SW50ZXJzZWN0aW9uTGlzdChzciwgbnVsbCk7XG5cbiAgICAgICAgaWYgKGhpdHMubGVuZ3RoKSB7XG4gICAgICAgICAgdGFyZ2V0ID0gaGl0c1toaXRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gd3JhcCh0YXJnZXQpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNuYXAucGx1Z2luXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBMZXQgeW91IHdyaXRlIHBsdWdpbnMuIFlvdSBwYXNzIGluIGEgZnVuY3Rpb24gd2l0aCBmaXZlIGFyZ3VtZW50cywgbGlrZSB0aGlzOlxuICAgICB8IFNuYXAucGx1Z2luKGZ1bmN0aW9uIChTbmFwLCBFbGVtZW50LCBQYXBlciwgZ2xvYmFsLCBGcmFnbWVudCkge1xuICAgICB8ICAgICBTbmFwLm5ld21ldGhvZCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICB8ICAgICBFbGVtZW50LnByb3RvdHlwZS5uZXdtZXRob2QgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgfCAgICAgUGFwZXIucHJvdG90eXBlLm5ld21ldGhvZCA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICB8IH0pO1xuICAgICAqIEluc2lkZSB0aGUgZnVuY3Rpb24geW91IGhhdmUgYWNjZXNzIHRvIGFsbCBtYWluIG9iamVjdHMgKGFuZCB0aGVpclxuICAgICAqIHByb3RvdHlwZXMpLiBUaGlzIGFsbG93IHlvdSB0byBleHRlbmQgYW55dGhpbmcgeW91IHdhbnQuXG4gICAgICoqXG4gICAgIC0gZiAoZnVuY3Rpb24pIHlvdXIgcGx1Z2luIGJvZHlcbiAgICBcXCovXG5cblxuICAgIFNuYXAucGx1Z2luID0gZnVuY3Rpb24gKGYpIHtcbiAgICAgIGYoU25hcCwgRWxlbWVudCwgUGFwZXIsIGdsb2IsIEZyYWdtZW50KTtcbiAgICB9O1xuXG4gICAgZ2xvYi53aW4uU25hcCA9IFNuYXA7XG4gICAgcmV0dXJuIFNuYXA7XG4gIH0od2luZG93IHx8IHRoaXMpOyAvLyBDb3B5cmlnaHQgKGMpIDIwMTMgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gIC8vXG4gIC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIC8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gIC8vXG4gIC8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAvL1xuICAvLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIC8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIC8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cblxuICBTbmFwLnBsdWdpbihmdW5jdGlvbiAoU25hcCwgRWxlbWVudCwgUGFwZXIsIGdsb2IsIEZyYWdtZW50KSB7XG4gICAgdmFyIGVscHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZSxcbiAgICAgICAgaXMgPSBTbmFwLmlzLFxuICAgICAgICBTdHIgPSBTdHJpbmcsXG4gICAgICAgIHVuaXQycHggPSBTbmFwLl91bml0MnB4LFxuICAgICAgICAkID0gU25hcC5fLiQsXG4gICAgICAgIG1ha2UgPSBTbmFwLl8ubWFrZSxcbiAgICAgICAgZ2V0U29tZURlZnMgPSBTbmFwLl8uZ2V0U29tZURlZnMsXG4gICAgICAgIGhhcyA9IFwiaGFzT3duUHJvcGVydHlcIixcbiAgICAgICAgd3JhcCA9IFNuYXAuXy53cmFwO1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmdldEJCb3hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgdGhlIGJvdW5kaW5nIGJveCBkZXNjcmlwdG9yIGZvciB0aGUgZ2l2ZW4gZWxlbWVudFxuICAgICAqKlxuICAgICA9IChvYmplY3QpIGJvdW5kaW5nIGJveCBkZXNjcmlwdG9yOlxuICAgICBvIHtcbiAgICAgbyAgICAgY3g6IChudW1iZXIpIHggb2YgdGhlIGNlbnRlcixcbiAgICAgbyAgICAgY3k6IChudW1iZXIpIHggb2YgdGhlIGNlbnRlcixcbiAgICAgbyAgICAgaDogKG51bWJlcikgaGVpZ2h0LFxuICAgICBvICAgICBoZWlnaHQ6IChudW1iZXIpIGhlaWdodCxcbiAgICAgbyAgICAgcGF0aDogKHN0cmluZykgcGF0aCBjb21tYW5kIGZvciB0aGUgYm94LFxuICAgICBvICAgICByMDogKG51bWJlcikgcmFkaXVzIG9mIGEgY2lyY2xlIHRoYXQgZnVsbHkgZW5jbG9zZXMgdGhlIGJveCxcbiAgICAgbyAgICAgcjE6IChudW1iZXIpIHJhZGl1cyBvZiB0aGUgc21hbGxlc3QgY2lyY2xlIHRoYXQgY2FuIGJlIGVuY2xvc2VkLFxuICAgICBvICAgICByMjogKG51bWJlcikgcmFkaXVzIG9mIHRoZSBsYXJnZXN0IGNpcmNsZSB0aGF0IGNhbiBiZSBlbmNsb3NlZCxcbiAgICAgbyAgICAgdmI6IChzdHJpbmcpIGJveCBhcyBhIHZpZXdib3ggY29tbWFuZCxcbiAgICAgbyAgICAgdzogKG51bWJlcikgd2lkdGgsXG4gICAgIG8gICAgIHdpZHRoOiAobnVtYmVyKSB3aWR0aCxcbiAgICAgbyAgICAgeDI6IChudW1iZXIpIHggb2YgdGhlIHJpZ2h0IHNpZGUsXG4gICAgIG8gICAgIHg6IChudW1iZXIpIHggb2YgdGhlIGxlZnQgc2lkZSxcbiAgICAgbyAgICAgeTI6IChudW1iZXIpIHkgb2YgdGhlIGJvdHRvbSBlZGdlLFxuICAgICBvICAgICB5OiAobnVtYmVyKSB5IG9mIHRoZSB0b3AgZWRnZVxuICAgICBvIH1cbiAgICBcXCovXG5cbiAgICBlbHByb3RvLmdldEJCb3ggPSBmdW5jdGlvbiAoaXNXaXRob3V0VHJhbnNmb3JtKSB7XG4gICAgICBpZiAodGhpcy50eXBlID09IFwidHNwYW5cIikge1xuICAgICAgICByZXR1cm4gU25hcC5fLmJveCh0aGlzLm5vZGUuZ2V0Q2xpZW50UmVjdHMoKS5pdGVtKDApKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFTbmFwLk1hdHJpeCB8fCAhU25hcC5wYXRoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5vZGUuZ2V0QkJveCgpO1xuICAgICAgfVxuXG4gICAgICB2YXIgZWwgPSB0aGlzLFxuICAgICAgICAgIG0gPSBuZXcgU25hcC5NYXRyaXgoKTtcblxuICAgICAgaWYgKGVsLnJlbW92ZWQpIHtcbiAgICAgICAgcmV0dXJuIFNuYXAuXy5ib3goKTtcbiAgICAgIH1cblxuICAgICAgd2hpbGUgKGVsLnR5cGUgPT0gXCJ1c2VcIikge1xuICAgICAgICBpZiAoIWlzV2l0aG91dFRyYW5zZm9ybSkge1xuICAgICAgICAgIG0gPSBtLmFkZChlbC50cmFuc2Zvcm0oKS5sb2NhbE1hdHJpeC50cmFuc2xhdGUoZWwuYXR0cihcInhcIikgfHwgMCwgZWwuYXR0cihcInlcIikgfHwgMCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVsLm9yaWdpbmFsKSB7XG4gICAgICAgICAgZWwgPSBlbC5vcmlnaW5hbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgaHJlZiA9IGVsLmF0dHIoXCJ4bGluazpocmVmXCIpO1xuICAgICAgICAgIGVsID0gZWwub3JpZ2luYWwgPSBlbC5ub2RlLm93bmVyRG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaHJlZi5zdWJzdHJpbmcoaHJlZi5pbmRleE9mKFwiI1wiKSArIDEpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgXyA9IGVsLl8sXG4gICAgICAgICAgcGF0aGZpbmRlciA9IFNuYXAucGF0aC5nZXRbZWwudHlwZV0gfHwgU25hcC5wYXRoLmdldC5kZWZsdDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKGlzV2l0aG91dFRyYW5zZm9ybSkge1xuICAgICAgICAgIF8uYmJveHd0ID0gcGF0aGZpbmRlciA/IFNuYXAucGF0aC5nZXRCQm94KGVsLnJlYWxQYXRoID0gcGF0aGZpbmRlcihlbCkpIDogU25hcC5fLmJveChlbC5ub2RlLmdldEJCb3goKSk7XG4gICAgICAgICAgcmV0dXJuIFNuYXAuXy5ib3goXy5iYm94d3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsLnJlYWxQYXRoID0gcGF0aGZpbmRlcihlbCk7XG4gICAgICAgICAgZWwubWF0cml4ID0gZWwudHJhbnNmb3JtKCkubG9jYWxNYXRyaXg7XG4gICAgICAgICAgXy5iYm94ID0gU25hcC5wYXRoLmdldEJCb3goU25hcC5wYXRoLm1hcChlbC5yZWFsUGF0aCwgbS5hZGQoZWwubWF0cml4KSkpO1xuICAgICAgICAgIHJldHVybiBTbmFwLl8uYm94KF8uYmJveCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRmlyZWZveCBkb2VzbuKAmXQgZ2l2ZSB5b3UgYmJveCBvZiBoaWRkZW4gZWxlbWVudFxuICAgICAgICByZXR1cm4gU25hcC5fLmJveCgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgcHJvcFN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0cmluZztcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZXh0cmFjdFRyYW5zZm9ybShlbCwgdHN0cikge1xuICAgICAgaWYgKHRzdHIgPT0gbnVsbCkge1xuICAgICAgICB2YXIgZG9SZXR1cm4gPSB0cnVlO1xuXG4gICAgICAgIGlmIChlbC50eXBlID09IFwibGluZWFyR3JhZGllbnRcIiB8fCBlbC50eXBlID09IFwicmFkaWFsR3JhZGllbnRcIikge1xuICAgICAgICAgIHRzdHIgPSBlbC5ub2RlLmdldEF0dHJpYnV0ZShcImdyYWRpZW50VHJhbnNmb3JtXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKGVsLnR5cGUgPT0gXCJwYXR0ZXJuXCIpIHtcbiAgICAgICAgICB0c3RyID0gZWwubm9kZS5nZXRBdHRyaWJ1dGUoXCJwYXR0ZXJuVHJhbnNmb3JtXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRzdHIgPSBlbC5ub2RlLmdldEF0dHJpYnV0ZShcInRyYW5zZm9ybVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdHN0cikge1xuICAgICAgICAgIHJldHVybiBuZXcgU25hcC5NYXRyaXgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRzdHIgPSBTbmFwLl8uc3ZnVHJhbnNmb3JtMnN0cmluZyh0c3RyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghU25hcC5fLnJnVHJhbnNmb3JtLnRlc3QodHN0cikpIHtcbiAgICAgICAgICB0c3RyID0gU25hcC5fLnN2Z1RyYW5zZm9ybTJzdHJpbmcodHN0cik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHN0ciA9IFN0cih0c3RyKS5yZXBsYWNlKC9cXC57M318XFx1MjAyNi9nLCBlbC5fLnRyYW5zZm9ybSB8fCBcIlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpcyh0c3RyLCBcImFycmF5XCIpKSB7XG4gICAgICAgICAgdHN0ciA9IFNuYXAucGF0aCA/IFNuYXAucGF0aC50b1N0cmluZy5jYWxsKHRzdHIpIDogU3RyKHRzdHIpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWwuXy50cmFuc2Zvcm0gPSB0c3RyO1xuICAgICAgfVxuXG4gICAgICB2YXIgbSA9IFNuYXAuXy50cmFuc2Zvcm0ybWF0cml4KHRzdHIsIGVsLmdldEJCb3goMSkpO1xuXG4gICAgICBpZiAoZG9SZXR1cm4pIHtcbiAgICAgICAgcmV0dXJuIG07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbC5tYXRyaXggPSBtO1xuICAgICAgfVxuICAgIH1cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50cmFuc2Zvcm1cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEdldHMgb3Igc2V0cyB0cmFuc2Zvcm1hdGlvbiBvZiB0aGUgZWxlbWVudFxuICAgICAqKlxuICAgICAtIHRzdHIgKHN0cmluZykgdHJhbnNmb3JtIHN0cmluZyBpbiBTbmFwIG9yIFNWRyBmb3JtYXRcbiAgICAgPSAoRWxlbWVudCkgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgICAqIG9yXG4gICAgID0gKG9iamVjdCkgdHJhbnNmb3JtYXRpb24gZGVzY3JpcHRvcjpcbiAgICAgbyB7XG4gICAgIG8gICAgIHN0cmluZyAoc3RyaW5nKSB0cmFuc2Zvcm0gc3RyaW5nLFxuICAgICBvICAgICBnbG9iYWxNYXRyaXggKE1hdHJpeCkgbWF0cml4IG9mIGFsbCB0cmFuc2Zvcm1hdGlvbnMgYXBwbGllZCB0byBlbGVtZW50IG9yIGl0cyBwYXJlbnRzLFxuICAgICBvICAgICBsb2NhbE1hdHJpeCAoTWF0cml4KSBtYXRyaXggb2YgdHJhbnNmb3JtYXRpb25zIGFwcGxpZWQgb25seSB0byB0aGUgZWxlbWVudCxcbiAgICAgbyAgICAgZGlmZk1hdHJpeCAoTWF0cml4KSBtYXRyaXggb2YgZGlmZmVyZW5jZSBiZXR3ZWVuIGdsb2JhbCBhbmQgbG9jYWwgdHJhbnNmb3JtYXRpb25zLFxuICAgICBvICAgICBnbG9iYWwgKHN0cmluZykgZ2xvYmFsIHRyYW5zZm9ybWF0aW9uIGFzIHN0cmluZyxcbiAgICAgbyAgICAgbG9jYWwgKHN0cmluZykgbG9jYWwgdHJhbnNmb3JtYXRpb24gYXMgc3RyaW5nLFxuICAgICBvICAgICB0b1N0cmluZyAoZnVuY3Rpb24pIHJldHVybnMgYHN0cmluZ2AgcHJvcGVydHlcbiAgICAgbyB9XG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh0c3RyKSB7XG4gICAgICB2YXIgXyA9IHRoaXMuXztcblxuICAgICAgaWYgKHRzdHIgPT0gbnVsbCkge1xuICAgICAgICB2YXIgcGFwYSA9IHRoaXMsXG4gICAgICAgICAgICBnbG9iYWwgPSBuZXcgU25hcC5NYXRyaXgodGhpcy5ub2RlLmdldENUTSgpKSxcbiAgICAgICAgICAgIGxvY2FsID0gZXh0cmFjdFRyYW5zZm9ybSh0aGlzKSxcbiAgICAgICAgICAgIG1zID0gW2xvY2FsXSxcbiAgICAgICAgICAgIG0gPSBuZXcgU25hcC5NYXRyaXgoKSxcbiAgICAgICAgICAgIGksXG4gICAgICAgICAgICBsb2NhbFN0cmluZyA9IGxvY2FsLnRvVHJhbnNmb3JtU3RyaW5nKCksXG4gICAgICAgICAgICBzdHJpbmcgPSBTdHIobG9jYWwpID09IFN0cih0aGlzLm1hdHJpeCkgPyBTdHIoXy50cmFuc2Zvcm0pIDogbG9jYWxTdHJpbmc7XG5cbiAgICAgICAgd2hpbGUgKHBhcGEudHlwZSAhPSBcInN2Z1wiICYmIChwYXBhID0gcGFwYS5wYXJlbnQoKSkpIHtcbiAgICAgICAgICBtcy5wdXNoKGV4dHJhY3RUcmFuc2Zvcm0ocGFwYSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaSA9IG1zLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgbS5hZGQobXNbaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdHJpbmc6IHN0cmluZyxcbiAgICAgICAgICBnbG9iYWxNYXRyaXg6IGdsb2JhbCxcbiAgICAgICAgICB0b3RhbE1hdHJpeDogbSxcbiAgICAgICAgICBsb2NhbE1hdHJpeDogbG9jYWwsXG4gICAgICAgICAgZGlmZk1hdHJpeDogZ2xvYmFsLmNsb25lKCkuYWRkKGxvY2FsLmludmVydCgpKSxcbiAgICAgICAgICBnbG9iYWw6IGdsb2JhbC50b1RyYW5zZm9ybVN0cmluZygpLFxuICAgICAgICAgIHRvdGFsOiBtLnRvVHJhbnNmb3JtU3RyaW5nKCksXG4gICAgICAgICAgbG9jYWw6IGxvY2FsU3RyaW5nLFxuICAgICAgICAgIHRvU3RyaW5nOiBwcm9wU3RyaW5nXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGlmICh0c3RyIGluc3RhbmNlb2YgU25hcC5NYXRyaXgpIHtcbiAgICAgICAgdGhpcy5tYXRyaXggPSB0c3RyO1xuICAgICAgICB0aGlzLl8udHJhbnNmb3JtID0gdHN0ci50b1RyYW5zZm9ybVN0cmluZygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXh0cmFjdFRyYW5zZm9ybSh0aGlzLCB0c3RyKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMubm9kZSkge1xuICAgICAgICBpZiAodGhpcy50eXBlID09IFwibGluZWFyR3JhZGllbnRcIiB8fCB0aGlzLnR5cGUgPT0gXCJyYWRpYWxHcmFkaWVudFwiKSB7XG4gICAgICAgICAgJCh0aGlzLm5vZGUsIHtcbiAgICAgICAgICAgIGdyYWRpZW50VHJhbnNmb3JtOiB0aGlzLm1hdHJpeFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PSBcInBhdHRlcm5cIikge1xuICAgICAgICAgICQodGhpcy5ub2RlLCB7XG4gICAgICAgICAgICBwYXR0ZXJuVHJhbnNmb3JtOiB0aGlzLm1hdHJpeFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICQodGhpcy5ub2RlLCB7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRoaXMubWF0cml4XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5wYXJlbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgdGhlIGVsZW1lbnQncyBwYXJlbnRcbiAgICAgKipcbiAgICAgPSAoRWxlbWVudCkgdGhlIHBhcmVudCBlbGVtZW50XG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLnBhcmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB3cmFwKHRoaXMubm9kZS5wYXJlbnROb2RlKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmFwcGVuZFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQXBwZW5kcyB0aGUgZ2l2ZW4gZWxlbWVudCB0byBjdXJyZW50IG9uZVxuICAgICAqKlxuICAgICAtIGVsIChFbGVtZW50fFNldCkgZWxlbWVudCB0byBhcHBlbmRcbiAgICAgPSAoRWxlbWVudCkgdGhlIHBhcmVudCBlbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuYWRkXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTZWUgQEVsZW1lbnQuYXBwZW5kXG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLmFwcGVuZCA9IGVscHJvdG8uYWRkID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICBpZiAoZWwpIHtcbiAgICAgICAgaWYgKGVsLnR5cGUgPT0gXCJzZXRcIikge1xuICAgICAgICAgIHZhciBpdCA9IHRoaXM7XG4gICAgICAgICAgZWwuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGl0LmFkZChlbCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBlbCA9IHdyYXAoZWwpO1xuICAgICAgICB0aGlzLm5vZGUuYXBwZW5kQ2hpbGQoZWwubm9kZSk7XG4gICAgICAgIGVsLnBhcGVyID0gdGhpcy5wYXBlcjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5hcHBlbmRUb1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQXBwZW5kcyB0aGUgY3VycmVudCBlbGVtZW50IHRvIHRoZSBnaXZlbiBvbmVcbiAgICAgKipcbiAgICAgLSBlbCAoRWxlbWVudCkgcGFyZW50IGVsZW1lbnQgdG8gYXBwZW5kIHRvXG4gICAgID0gKEVsZW1lbnQpIHRoZSBjaGlsZCBlbGVtZW50XG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLmFwcGVuZFRvID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICBpZiAoZWwpIHtcbiAgICAgICAgZWwgPSB3cmFwKGVsKTtcbiAgICAgICAgZWwuYXBwZW5kKHRoaXMpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnByZXBlbmRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFByZXBlbmRzIHRoZSBnaXZlbiBlbGVtZW50IHRvIHRoZSBjdXJyZW50IG9uZVxuICAgICAqKlxuICAgICAtIGVsIChFbGVtZW50KSBlbGVtZW50IHRvIHByZXBlbmRcbiAgICAgPSAoRWxlbWVudCkgdGhlIHBhcmVudCBlbGVtZW50XG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLnByZXBlbmQgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGlmIChlbCkge1xuICAgICAgICBpZiAoZWwudHlwZSA9PSBcInNldFwiKSB7XG4gICAgICAgICAgdmFyIGl0ID0gdGhpcyxcbiAgICAgICAgICAgICAgZmlyc3Q7XG4gICAgICAgICAgZWwuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICAgICAgICBmaXJzdC5hZnRlcihlbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpdC5wcmVwZW5kKGVsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZmlyc3QgPSBlbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIGVsID0gd3JhcChlbCk7XG4gICAgICAgIHZhciBwYXJlbnQgPSBlbC5wYXJlbnQoKTtcbiAgICAgICAgdGhpcy5ub2RlLmluc2VydEJlZm9yZShlbC5ub2RlLCB0aGlzLm5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICAgIHRoaXMuYWRkICYmIHRoaXMuYWRkKCk7XG4gICAgICAgIGVsLnBhcGVyID0gdGhpcy5wYXBlcjtcbiAgICAgICAgdGhpcy5wYXJlbnQoKSAmJiB0aGlzLnBhcmVudCgpLmFkZCgpO1xuICAgICAgICBwYXJlbnQgJiYgcGFyZW50LmFkZCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnByZXBlbmRUb1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUHJlcGVuZHMgdGhlIGN1cnJlbnQgZWxlbWVudCB0byB0aGUgZ2l2ZW4gb25lXG4gICAgICoqXG4gICAgIC0gZWwgKEVsZW1lbnQpIHBhcmVudCBlbGVtZW50IHRvIHByZXBlbmQgdG9cbiAgICAgPSAoRWxlbWVudCkgdGhlIGNoaWxkIGVsZW1lbnRcbiAgICBcXCovXG5cblxuICAgIGVscHJvdG8ucHJlcGVuZFRvID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICBlbCA9IHdyYXAoZWwpO1xuICAgICAgZWwucHJlcGVuZCh0aGlzKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuYmVmb3JlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBJbnNlcnRzIGdpdmVuIGVsZW1lbnQgYmVmb3JlIHRoZSBjdXJyZW50IG9uZVxuICAgICAqKlxuICAgICAtIGVsIChFbGVtZW50KSBlbGVtZW50IHRvIGluc2VydFxuICAgICA9IChFbGVtZW50KSB0aGUgcGFyZW50IGVsZW1lbnRcbiAgICBcXCovXG5cblxuICAgIGVscHJvdG8uYmVmb3JlID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICBpZiAoZWwudHlwZSA9PSBcInNldFwiKSB7XG4gICAgICAgIHZhciBpdCA9IHRoaXM7XG4gICAgICAgIGVsLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xuICAgICAgICAgIGl0Lm5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwubm9kZSwgaXQubm9kZSk7XG4gICAgICAgICAgcGFyZW50ICYmIHBhcmVudC5hZGQoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGFyZW50KCkuYWRkKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBlbCA9IHdyYXAoZWwpO1xuICAgICAgdmFyIHBhcmVudCA9IGVsLnBhcmVudCgpO1xuICAgICAgdGhpcy5ub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsLm5vZGUsIHRoaXMubm9kZSk7XG4gICAgICB0aGlzLnBhcmVudCgpICYmIHRoaXMucGFyZW50KCkuYWRkKCk7XG4gICAgICBwYXJlbnQgJiYgcGFyZW50LmFkZCgpO1xuICAgICAgZWwucGFwZXIgPSB0aGlzLnBhcGVyO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5hZnRlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogSW5zZXJ0cyBnaXZlbiBlbGVtZW50IGFmdGVyIHRoZSBjdXJyZW50IG9uZVxuICAgICAqKlxuICAgICAtIGVsIChFbGVtZW50KSBlbGVtZW50IHRvIGluc2VydFxuICAgICA9IChFbGVtZW50KSB0aGUgcGFyZW50IGVsZW1lbnRcbiAgICBcXCovXG5cblxuICAgIGVscHJvdG8uYWZ0ZXIgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGVsID0gd3JhcChlbCk7XG4gICAgICB2YXIgcGFyZW50ID0gZWwucGFyZW50KCk7XG5cbiAgICAgIGlmICh0aGlzLm5vZGUubmV4dFNpYmxpbmcpIHtcbiAgICAgICAgdGhpcy5ub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsLm5vZGUsIHRoaXMubm9kZS5uZXh0U2libGluZyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm5vZGUucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChlbC5ub2RlKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wYXJlbnQoKSAmJiB0aGlzLnBhcmVudCgpLmFkZCgpO1xuICAgICAgcGFyZW50ICYmIHBhcmVudC5hZGQoKTtcbiAgICAgIGVsLnBhcGVyID0gdGhpcy5wYXBlcjtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuaW5zZXJ0QmVmb3JlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBJbnNlcnRzIHRoZSBlbGVtZW50IGFmdGVyIHRoZSBnaXZlbiBvbmVcbiAgICAgKipcbiAgICAgLSBlbCAoRWxlbWVudCkgZWxlbWVudCBuZXh0IHRvIHdob20gaW5zZXJ0IHRvXG4gICAgID0gKEVsZW1lbnQpIHRoZSBwYXJlbnQgZWxlbWVudFxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5pbnNlcnRCZWZvcmUgPSBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGVsID0gd3JhcChlbCk7XG4gICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQoKTtcbiAgICAgIGVsLm5vZGUucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUodGhpcy5ub2RlLCBlbC5ub2RlKTtcbiAgICAgIHRoaXMucGFwZXIgPSBlbC5wYXBlcjtcbiAgICAgIHBhcmVudCAmJiBwYXJlbnQuYWRkKCk7XG4gICAgICBlbC5wYXJlbnQoKSAmJiBlbC5wYXJlbnQoKS5hZGQoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuaW5zZXJ0QWZ0ZXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEluc2VydHMgdGhlIGVsZW1lbnQgYWZ0ZXIgdGhlIGdpdmVuIG9uZVxuICAgICAqKlxuICAgICAtIGVsIChFbGVtZW50KSBlbGVtZW50IG5leHQgdG8gd2hvbSBpbnNlcnQgdG9cbiAgICAgPSAoRWxlbWVudCkgdGhlIHBhcmVudCBlbGVtZW50XG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLmluc2VydEFmdGVyID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICBlbCA9IHdyYXAoZWwpO1xuICAgICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50KCk7XG4gICAgICBlbC5ub2RlLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMubm9kZSwgZWwubm9kZS5uZXh0U2libGluZyk7XG4gICAgICB0aGlzLnBhcGVyID0gZWwucGFwZXI7XG4gICAgICBwYXJlbnQgJiYgcGFyZW50LmFkZCgpO1xuICAgICAgZWwucGFyZW50KCkgJiYgZWwucGFyZW50KCkuYWRkKCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnJlbW92ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBlbGVtZW50IGZyb20gdGhlIERPTVxuICAgICA9IChFbGVtZW50KSB0aGUgZGV0YWNoZWQgZWxlbWVudFxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnQoKTtcbiAgICAgIHRoaXMubm9kZS5wYXJlbnROb2RlICYmIHRoaXMubm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMubm9kZSk7XG4gICAgICBkZWxldGUgdGhpcy5wYXBlcjtcbiAgICAgIHRoaXMucmVtb3ZlZCA9IHRydWU7XG4gICAgICBwYXJlbnQgJiYgcGFyZW50LmFkZCgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5zZWxlY3RcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEdhdGhlcnMgdGhlIG5lc3RlZCBARWxlbWVudCBtYXRjaGluZyB0aGUgZ2l2ZW4gc2V0IG9mIENTUyBzZWxlY3RvcnNcbiAgICAgKipcbiAgICAgLSBxdWVyeSAoc3RyaW5nKSBDU1Mgc2VsZWN0b3JcbiAgICAgPSAoRWxlbWVudCkgcmVzdWx0IG9mIHF1ZXJ5IHNlbGVjdGlvblxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5zZWxlY3QgPSBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgIHJldHVybiB3cmFwKHRoaXMubm9kZS5xdWVyeVNlbGVjdG9yKHF1ZXJ5KSk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5zZWxlY3RBbGxcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEdhdGhlcnMgbmVzdGVkIEBFbGVtZW50IG9iamVjdHMgbWF0Y2hpbmcgdGhlIGdpdmVuIHNldCBvZiBDU1Mgc2VsZWN0b3JzXG4gICAgICoqXG4gICAgIC0gcXVlcnkgKHN0cmluZykgQ1NTIHNlbGVjdG9yXG4gICAgID0gKFNldHxhcnJheSkgcmVzdWx0IG9mIHF1ZXJ5IHNlbGVjdGlvblxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5zZWxlY3RBbGwgPSBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgIHZhciBub2RlbGlzdCA9IHRoaXMubm9kZS5xdWVyeVNlbGVjdG9yQWxsKHF1ZXJ5KSxcbiAgICAgICAgICBzZXQgPSAoU25hcC5zZXQgfHwgQXJyYXkpKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbm9kZWxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2V0LnB1c2god3JhcChub2RlbGlzdFtpXSkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0O1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuYXNQWFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBnaXZlbiBhdHRyaWJ1dGUgb2YgdGhlIGVsZW1lbnQgYXMgYSBgcHhgIHZhbHVlIChub3QgJSwgZW0sIGV0Yy4pXG4gICAgICoqXG4gICAgIC0gYXR0ciAoc3RyaW5nKSBhdHRyaWJ1dGUgbmFtZVxuICAgICAtIHZhbHVlIChzdHJpbmcpICNvcHRpb25hbCBhdHRyaWJ1dGUgdmFsdWVcbiAgICAgPSAoRWxlbWVudCkgcmVzdWx0IG9mIHF1ZXJ5IHNlbGVjdGlvblxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5hc1BYID0gZnVuY3Rpb24gKGF0dHIsIHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICB2YWx1ZSA9IHRoaXMuYXR0cihhdHRyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICt1bml0MnB4KHRoaXMsIGF0dHIsIHZhbHVlKTtcbiAgICB9OyAvLyBTSUVSUkEgRWxlbWVudC51c2UoKTogSSBzdWdnZXN0IGFkZGluZyBhIG5vdGUgYWJvdXQgaG93IHRvIGFjY2VzcyB0aGUgb3JpZ2luYWwgZWxlbWVudCB0aGUgcmV0dXJuZWQgPHVzZT4gaW5zdGFudGlhdGVzLiBJdCdzIGEgcGFydCBvZiBTVkcgd2l0aCB3aGljaCBvcmRpbmFyeSB3ZWIgZGV2ZWxvcGVycyBtYXkgYmUgbGVhc3QgZmFtaWxpYXIuXG5cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51c2VcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYSBgPHVzZT5gIGVsZW1lbnQgbGlua2VkIHRvIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAgKipcbiAgICAgPSAoRWxlbWVudCkgdGhlIGA8dXNlPmAgZWxlbWVudFxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by51c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdXNlLFxuICAgICAgICAgIGlkID0gdGhpcy5ub2RlLmlkO1xuXG4gICAgICBpZiAoIWlkKSB7XG4gICAgICAgIGlkID0gdGhpcy5pZDtcbiAgICAgICAgJCh0aGlzLm5vZGUsIHtcbiAgICAgICAgICBpZDogaWRcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnR5cGUgPT0gXCJsaW5lYXJHcmFkaWVudFwiIHx8IHRoaXMudHlwZSA9PSBcInJhZGlhbEdyYWRpZW50XCIgfHwgdGhpcy50eXBlID09IFwicGF0dGVyblwiKSB7XG4gICAgICAgIHVzZSA9IG1ha2UodGhpcy50eXBlLCB0aGlzLm5vZGUucGFyZW50Tm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1c2UgPSBtYWtlKFwidXNlXCIsIHRoaXMubm9kZS5wYXJlbnROb2RlKTtcbiAgICAgIH1cblxuICAgICAgJCh1c2Uubm9kZSwge1xuICAgICAgICBcInhsaW5rOmhyZWZcIjogXCIjXCIgKyBpZFxuICAgICAgfSk7XG4gICAgICB1c2Uub3JpZ2luYWwgPSB0aGlzO1xuICAgICAgcmV0dXJuIHVzZTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZml4aWRzKGVsKSB7XG4gICAgICB2YXIgZWxzID0gZWwuc2VsZWN0QWxsKFwiKlwiKSxcbiAgICAgICAgICBpdCxcbiAgICAgICAgICB1cmwgPSAvXlxccyp1cmxcXCgoXCJ8J3wpKC4qKVxcMVxcKVxccyokLyxcbiAgICAgICAgICBpZHMgPSBbXSxcbiAgICAgICAgICB1c2VzID0ge307XG5cbiAgICAgIGZ1bmN0aW9uIHVybHRlc3QoaXQsIG5hbWUpIHtcbiAgICAgICAgdmFyIHZhbCA9ICQoaXQubm9kZSwgbmFtZSk7XG4gICAgICAgIHZhbCA9IHZhbCAmJiB2YWwubWF0Y2godXJsKTtcbiAgICAgICAgdmFsID0gdmFsICYmIHZhbFsyXTtcblxuICAgICAgICBpZiAodmFsICYmIHZhbC5jaGFyQXQoKSA9PSBcIiNcIikge1xuICAgICAgICAgIHZhbCA9IHZhbC5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbCkge1xuICAgICAgICAgIHVzZXNbdmFsXSA9ICh1c2VzW3ZhbF0gfHwgW10pLmNvbmNhdChmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgICAgIHZhciBhdHRyID0ge307XG4gICAgICAgICAgICBhdHRyW25hbWVdID0gU25hcC51cmwoaWQpO1xuICAgICAgICAgICAgJChpdC5ub2RlLCBhdHRyKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBsaW5rdGVzdChpdCkge1xuICAgICAgICB2YXIgdmFsID0gJChpdC5ub2RlLCBcInhsaW5rOmhyZWZcIik7XG5cbiAgICAgICAgaWYgKHZhbCAmJiB2YWwuY2hhckF0KCkgPT0gXCIjXCIpIHtcbiAgICAgICAgICB2YWwgPSB2YWwuc3Vic3RyaW5nKDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICB1c2VzW3ZhbF0gPSAodXNlc1t2YWxdIHx8IFtdKS5jb25jYXQoZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgICAgICBpdC5hdHRyKFwieGxpbms6aHJlZlwiLCBcIiNcIiArIGlkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBlbHMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICBpdCA9IGVsc1tpXTtcbiAgICAgICAgdXJsdGVzdChpdCwgXCJmaWxsXCIpO1xuICAgICAgICB1cmx0ZXN0KGl0LCBcInN0cm9rZVwiKTtcbiAgICAgICAgdXJsdGVzdChpdCwgXCJmaWx0ZXJcIik7XG4gICAgICAgIHVybHRlc3QoaXQsIFwibWFza1wiKTtcbiAgICAgICAgdXJsdGVzdChpdCwgXCJjbGlwLXBhdGhcIik7XG4gICAgICAgIGxpbmt0ZXN0KGl0KTtcbiAgICAgICAgdmFyIG9sZGlkID0gJChpdC5ub2RlLCBcImlkXCIpO1xuXG4gICAgICAgIGlmIChvbGRpZCkge1xuICAgICAgICAgICQoaXQubm9kZSwge1xuICAgICAgICAgICAgaWQ6IGl0LmlkXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgaWRzLnB1c2goe1xuICAgICAgICAgICAgb2xkOiBvbGRpZCxcbiAgICAgICAgICAgIGlkOiBpdC5pZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAoaSA9IDAsIGlpID0gaWRzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgdmFyIGZzID0gdXNlc1tpZHNbaV0ub2xkXTtcblxuICAgICAgICBpZiAoZnMpIHtcbiAgICAgICAgICBmb3IgKHZhciBqID0gMCwgamogPSBmcy5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICBmc1tqXShpZHNbaV0uaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5jbG9uZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhIGNsb25lIG9mIHRoZSBlbGVtZW50IGFuZCBpbnNlcnRzIGl0IGFmdGVyIHRoZSBlbGVtZW50XG4gICAgICoqXG4gICAgID0gKEVsZW1lbnQpIHRoZSBjbG9uZVxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjbG9uZSA9IHdyYXAodGhpcy5ub2RlLmNsb25lTm9kZSh0cnVlKSk7XG5cbiAgICAgIGlmICgkKGNsb25lLm5vZGUsIFwiaWRcIikpIHtcbiAgICAgICAgJChjbG9uZS5ub2RlLCB7XG4gICAgICAgICAgaWQ6IGNsb25lLmlkXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmaXhpZHMoY2xvbmUpO1xuICAgICAgY2xvbmUuaW5zZXJ0QWZ0ZXIodGhpcyk7XG4gICAgICByZXR1cm4gY2xvbmU7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50b0RlZnNcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIE1vdmVzIGVsZW1lbnQgdG8gdGhlIHNoYXJlZCBgPGRlZnM+YCBhcmVhXG4gICAgICoqXG4gICAgID0gKEVsZW1lbnQpIHRoZSBlbGVtZW50XG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLnRvRGVmcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBkZWZzID0gZ2V0U29tZURlZnModGhpcyk7XG4gICAgICBkZWZzLmFwcGVuZENoaWxkKHRoaXMubm9kZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRvUGF0dGVyblxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhIGA8cGF0dGVybj5gIGVsZW1lbnQgZnJvbSB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgICoqXG4gICAgICogVG8gY3JlYXRlIGEgcGF0dGVybiB5b3UgaGF2ZSB0byBzcGVjaWZ5IHRoZSBwYXR0ZXJuIHJlY3Q6XG4gICAgIC0geCAoc3RyaW5nfG51bWJlcilcbiAgICAgLSB5IChzdHJpbmd8bnVtYmVyKVxuICAgICAtIHdpZHRoIChzdHJpbmd8bnVtYmVyKVxuICAgICAtIGhlaWdodCAoc3RyaW5nfG51bWJlcilcbiAgICAgPSAoRWxlbWVudCkgdGhlIGA8cGF0dGVybj5gIGVsZW1lbnRcbiAgICAgKiBZb3UgY2FuIHVzZSBwYXR0ZXJuIGxhdGVyIG9uIGFzIGFuIGFyZ3VtZW50IGZvciBgZmlsbGAgYXR0cmlidXRlOlxuICAgICB8IHZhciBwID0gcGFwZXIucGF0aChcIk0xMC01LTEwLDE1TTE1LDAsMCwxNU0wLTUtMjAsMTVcIikuYXR0cih7XG4gICAgIHwgICAgICAgICBmaWxsOiBcIm5vbmVcIixcbiAgICAgfCAgICAgICAgIHN0cm9rZTogXCIjYmFkYTU1XCIsXG4gICAgIHwgICAgICAgICBzdHJva2VXaWR0aDogNVxuICAgICB8ICAgICB9KS5wYXR0ZXJuKDAsIDAsIDEwLCAxMCksXG4gICAgIHwgICAgIGMgPSBwYXBlci5jaXJjbGUoMjAwLCAyMDAsIDEwMCk7XG4gICAgIHwgYy5hdHRyKHtcbiAgICAgfCAgICAgZmlsbDogcFxuICAgICB8IH0pO1xuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5wYXR0ZXJuID0gZWxwcm90by50b1BhdHRlcm4gPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgdmFyIHAgPSBtYWtlKFwicGF0dGVyblwiLCBnZXRTb21lRGVmcyh0aGlzKSk7XG5cbiAgICAgIGlmICh4ID09IG51bGwpIHtcbiAgICAgICAgeCA9IHRoaXMuZ2V0QkJveCgpO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXMoeCwgXCJvYmplY3RcIikgJiYgXCJ4XCIgaW4geCkge1xuICAgICAgICB5ID0geC55O1xuICAgICAgICB3aWR0aCA9IHgud2lkdGg7XG4gICAgICAgIGhlaWdodCA9IHguaGVpZ2h0O1xuICAgICAgICB4ID0geC54O1xuICAgICAgfVxuXG4gICAgICAkKHAubm9kZSwge1xuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5LFxuICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICBwYXR0ZXJuVW5pdHM6IFwidXNlclNwYWNlT25Vc2VcIixcbiAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgIHZpZXdCb3g6IFt4LCB5LCB3aWR0aCwgaGVpZ2h0XS5qb2luKFwiIFwiKVxuICAgICAgfSk7XG4gICAgICBwLm5vZGUuYXBwZW5kQ2hpbGQodGhpcy5ub2RlKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH07IC8vIFNJRVJSQSBFbGVtZW50Lm1hcmtlcigpOiBjbGFyaWZ5IHdoYXQgYSByZWZlcmVuY2UgcG9pbnQgaXMuIEUuZy4sIGhlbHBzIHlvdSBvZmZzZXQgdGhlIG9iamVjdCBmcm9tIGl0cyBlZGdlIHN1Y2ggYXMgd2hlbiBjZW50ZXJpbmcgaXQgb3ZlciBhIHBhdGguXG4gICAgLy8gU0lFUlJBIEVsZW1lbnQubWFya2VyKCk6IEkgc3VnZ2VzdCB0aGUgbWV0aG9kIHNob3VsZCBhY2NlcHQgZGVmYXVsdCByZWZlcmVuY2UgcG9pbnQgdmFsdWVzLiAgUGVyaGFwcyBjZW50ZXJlZCB3aXRoIChyZWZYID0gd2lkdGgvMikgYW5kIChyZWZZID0gaGVpZ2h0LzIpPyBBbHNvLCBjb3VsZG4ndCBpdCBhc3N1bWUgdGhlIGVsZW1lbnQncyBjdXJyZW50IF93aWR0aF8gYW5kIF9oZWlnaHRfPyBBbmQgcGxlYXNlIHNwZWNpZnkgd2hhdCBfeF8gYW5kIF95XyBtZWFuOiBvZmZzZXRzPyBJZiBzbywgZnJvbSB3aGVyZT8gIENvdWxkbid0IHRoZXkgYWxzbyBiZSBhc3NpZ25lZCBkZWZhdWx0IHZhbHVlcz9cblxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lm1hcmtlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhIGA8bWFya2VyPmAgZWxlbWVudCBmcm9tIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAgKipcbiAgICAgKiBUbyBjcmVhdGUgYSBtYXJrZXIgeW91IGhhdmUgdG8gc3BlY2lmeSB0aGUgYm91bmRpbmcgcmVjdCBhbmQgcmVmZXJlbmNlIHBvaW50OlxuICAgICAtIHggKG51bWJlcilcbiAgICAgLSB5IChudW1iZXIpXG4gICAgIC0gd2lkdGggKG51bWJlcilcbiAgICAgLSBoZWlnaHQgKG51bWJlcilcbiAgICAgLSByZWZYIChudW1iZXIpXG4gICAgIC0gcmVmWSAobnVtYmVyKVxuICAgICA9IChFbGVtZW50KSB0aGUgYDxtYXJrZXI+YCBlbGVtZW50XG4gICAgICogWW91IGNhbiBzcGVjaWZ5IHRoZSBtYXJrZXIgbGF0ZXIgYXMgYW4gYXJndW1lbnQgZm9yIGBtYXJrZXItc3RhcnRgLCBgbWFya2VyLWVuZGAsIGBtYXJrZXItbWlkYCwgYW5kIGBtYXJrZXJgIGF0dHJpYnV0ZXMuIFRoZSBgbWFya2VyYCBhdHRyaWJ1dGUgcGxhY2VzIHRoZSBtYXJrZXIgYXQgZXZlcnkgcG9pbnQgYWxvbmcgdGhlIHBhdGgsIGFuZCBgbWFya2VyLW1pZGAgcGxhY2VzIHRoZW0gYXQgZXZlcnkgcG9pbnQgZXhjZXB0IHRoZSBzdGFydCBhbmQgZW5kLlxuICAgIFxcKi9cbiAgICAvLyBUT0RPIGFkZCB1c2FnZSBmb3IgbWFya2Vyc1xuXG5cbiAgICBlbHByb3RvLm1hcmtlciA9IGZ1bmN0aW9uICh4LCB5LCB3aWR0aCwgaGVpZ2h0LCByZWZYLCByZWZZKSB7XG4gICAgICB2YXIgcCA9IG1ha2UoXCJtYXJrZXJcIiwgZ2V0U29tZURlZnModGhpcykpO1xuXG4gICAgICBpZiAoeCA9PSBudWxsKSB7XG4gICAgICAgIHggPSB0aGlzLmdldEJCb3goKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzKHgsIFwib2JqZWN0XCIpICYmIFwieFwiIGluIHgpIHtcbiAgICAgICAgeSA9IHgueTtcbiAgICAgICAgd2lkdGggPSB4LndpZHRoO1xuICAgICAgICBoZWlnaHQgPSB4LmhlaWdodDtcbiAgICAgICAgcmVmWCA9IHgucmVmWCB8fCB4LmN4O1xuICAgICAgICByZWZZID0geC5yZWZZIHx8IHguY3k7XG4gICAgICAgIHggPSB4Lng7XG4gICAgICB9XG5cbiAgICAgICQocC5ub2RlLCB7XG4gICAgICAgIHZpZXdCb3g6IFt4LCB5LCB3aWR0aCwgaGVpZ2h0XS5qb2luKFwiIFwiKSxcbiAgICAgICAgbWFya2VyV2lkdGg6IHdpZHRoLFxuICAgICAgICBtYXJrZXJIZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgb3JpZW50OiBcImF1dG9cIixcbiAgICAgICAgcmVmWDogcmVmWCB8fCAwLFxuICAgICAgICByZWZZOiByZWZZIHx8IDAsXG4gICAgICAgIGlkOiBwLmlkXG4gICAgICB9KTtcbiAgICAgIHAubm9kZS5hcHBlbmRDaGlsZCh0aGlzLm5vZGUpO1xuICAgICAgcmV0dXJuIHA7XG4gICAgfTtcblxuICAgIHZhciBlbGRhdGEgPSB7fTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5kYXRhXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIG9yIHJldHJpZXZlcyBnaXZlbiB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggZ2l2ZW4ga2V5LiAoRG9u4oCZdCBjb25mdXNlXG4gICAgICogd2l0aCBgZGF0YS1gIGF0dHJpYnV0ZXMpXG4gICAgICpcbiAgICAgKiBTZWUgYWxzbyBARWxlbWVudC5yZW1vdmVEYXRhXG4gICAgIC0ga2V5IChzdHJpbmcpIGtleSB0byBzdG9yZSBkYXRhXG4gICAgIC0gdmFsdWUgKGFueSkgI29wdGlvbmFsIHZhbHVlIHRvIHN0b3JlXG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICAgKiBvciwgaWYgdmFsdWUgaXMgbm90IHNwZWNpZmllZDpcbiAgICAgPSAoYW55KSB2YWx1ZVxuICAgICA+IFVzYWdlXG4gICAgIHwgZm9yICh2YXIgaSA9IDAsIGkgPCA1LCBpKyspIHtcbiAgICAgfCAgICAgcGFwZXIuY2lyY2xlKDEwICsgMTUgKiBpLCAxMCwgMTApXG4gICAgIHwgICAgICAgICAgLmF0dHIoe2ZpbGw6IFwiIzAwMFwifSlcbiAgICAgfCAgICAgICAgICAuZGF0YShcImlcIiwgaSlcbiAgICAgfCAgICAgICAgICAuY2xpY2soZnVuY3Rpb24gKCkge1xuICAgICB8ICAgICAgICAgICAgIGFsZXJ0KHRoaXMuZGF0YShcImlcIikpO1xuICAgICB8ICAgICAgICAgIH0pO1xuICAgICB8IH1cbiAgICBcXCovXG5cbiAgICBlbHByb3RvLmRhdGEgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIGRhdGEgPSBlbGRhdGFbdGhpcy5pZF0gPSBlbGRhdGFbdGhpcy5pZF0gfHwge307XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDApIHtcbiAgICAgICAgZXZlKFwic25hcC5kYXRhLmdldC5cIiArIHRoaXMuaWQsIHRoaXMsIGRhdGEsIG51bGwpO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgIH1cblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSkge1xuICAgICAgICBpZiAoU25hcC5pcyhrZXksIFwib2JqZWN0XCIpKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSBpbiBrZXkpIGlmIChrZXlbaGFzXShpKSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhKGksIGtleVtpXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBldmUoXCJzbmFwLmRhdGEuZ2V0LlwiICsgdGhpcy5pZCwgdGhpcywgZGF0YVtrZXldLCBrZXkpO1xuICAgICAgICByZXR1cm4gZGF0YVtrZXldO1xuICAgICAgfVxuXG4gICAgICBkYXRhW2tleV0gPSB2YWx1ZTtcbiAgICAgIGV2ZShcInNuYXAuZGF0YS5zZXQuXCIgKyB0aGlzLmlkLCB0aGlzLCB2YWx1ZSwga2V5KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQucmVtb3ZlRGF0YVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggYW4gZWxlbWVudCBieSBnaXZlbiBrZXkuXG4gICAgICogSWYga2V5IGlzIG5vdCBwcm92aWRlZCwgcmVtb3ZlcyBhbGwgdGhlIGRhdGEgb2YgdGhlIGVsZW1lbnQuXG4gICAgIC0ga2V5IChzdHJpbmcpICNvcHRpb25hbCBrZXlcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5yZW1vdmVEYXRhID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgaWYgKGtleSA9PSBudWxsKSB7XG4gICAgICAgIGVsZGF0YVt0aGlzLmlkXSA9IHt9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxkYXRhW3RoaXMuaWRdICYmIGRlbGV0ZSBlbGRhdGFbdGhpcy5pZF1ba2V5XTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5vdXRlclNWR1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBTVkcgY29kZSBmb3IgdGhlIGVsZW1lbnQsIGVxdWl2YWxlbnQgdG8gSFRNTCdzIGBvdXRlckhUTUxgLlxuICAgICAqXG4gICAgICogU2VlIGFsc28gQEVsZW1lbnQuaW5uZXJTVkdcbiAgICAgPSAoc3RyaW5nKSBTVkcgY29kZSBmb3IgdGhlIGVsZW1lbnRcbiAgICBcXCovXG5cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50b1N0cmluZ1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2VlIEBFbGVtZW50Lm91dGVyU1ZHXG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLm91dGVyU1ZHID0gZWxwcm90by50b1N0cmluZyA9IHRvU3RyaW5nKDEpO1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmlubmVyU1ZHXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIFNWRyBjb2RlIGZvciB0aGUgZWxlbWVudCdzIGNvbnRlbnRzLCBlcXVpdmFsZW50IHRvIEhUTUwncyBgaW5uZXJIVE1MYFxuICAgICA9IChzdHJpbmcpIFNWRyBjb2RlIGZvciB0aGUgZWxlbWVudFxuICAgIFxcKi9cblxuICAgIGVscHJvdG8uaW5uZXJTVkcgPSB0b1N0cmluZygpO1xuXG4gICAgZnVuY3Rpb24gdG9TdHJpbmcodHlwZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHJlcyA9IHR5cGUgPyBcIjxcIiArIHRoaXMudHlwZSA6IFwiXCIsXG4gICAgICAgICAgICBhdHRyID0gdGhpcy5ub2RlLmF0dHJpYnV0ZXMsXG4gICAgICAgICAgICBjaGxkID0gdGhpcy5ub2RlLmNoaWxkTm9kZXM7XG5cbiAgICAgICAgaWYgKHR5cGUpIHtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBhdHRyLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICAgIHJlcyArPSBcIiBcIiArIGF0dHJbaV0ubmFtZSArICc9XCInICsgYXR0cltpXS52YWx1ZS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykgKyAnXCInO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjaGxkLmxlbmd0aCkge1xuICAgICAgICAgIHR5cGUgJiYgKHJlcyArPSBcIj5cIik7XG5cbiAgICAgICAgICBmb3IgKGkgPSAwLCBpaSA9IGNobGQubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNobGRbaV0ubm9kZVR5cGUgPT0gMykge1xuICAgICAgICAgICAgICByZXMgKz0gY2hsZFtpXS5ub2RlVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNobGRbaV0ubm9kZVR5cGUgPT0gMSkge1xuICAgICAgICAgICAgICByZXMgKz0gd3JhcChjaGxkW2ldKS50b1N0cmluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHR5cGUgJiYgKHJlcyArPSBcIjwvXCIgKyB0aGlzLnR5cGUgKyBcIj5cIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHlwZSAmJiAocmVzICs9IFwiLz5cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBlbHByb3RvLnRvRGF0YVVSTCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh3aW5kb3cgJiYgd2luZG93LmJ0b2EpIHtcbiAgICAgICAgdmFyIGJiID0gdGhpcy5nZXRCQm94KCksXG4gICAgICAgICAgICBzdmcgPSBTbmFwLmZvcm1hdCgnPHN2ZyB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHdpZHRoPVwie3dpZHRofVwiIGhlaWdodD1cIntoZWlnaHR9XCIgdmlld0JveD1cInt4fSB7eX0ge3dpZHRofSB7aGVpZ2h0fVwiPntjb250ZW50c308L3N2Zz4nLCB7XG4gICAgICAgICAgeDogK2JiLngudG9GaXhlZCgzKSxcbiAgICAgICAgICB5OiArYmIueS50b0ZpeGVkKDMpLFxuICAgICAgICAgIHdpZHRoOiArYmIud2lkdGgudG9GaXhlZCgzKSxcbiAgICAgICAgICBoZWlnaHQ6ICtiYi5oZWlnaHQudG9GaXhlZCgzKSxcbiAgICAgICAgICBjb250ZW50czogdGhpcy5vdXRlclNWRygpXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFwiICsgYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoc3ZnKSkpO1xuICAgICAgfVxuICAgIH07XG4gICAgLypcXFxuICAgICAqIEZyYWdtZW50LnNlbGVjdFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2VlIEBFbGVtZW50LnNlbGVjdFxuICAgIFxcKi9cblxuXG4gICAgRnJhZ21lbnQucHJvdG90eXBlLnNlbGVjdCA9IGVscHJvdG8uc2VsZWN0O1xuICAgIC8qXFxcbiAgICAgKiBGcmFnbWVudC5zZWxlY3RBbGxcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNlZSBARWxlbWVudC5zZWxlY3RBbGxcbiAgICBcXCovXG5cbiAgICBGcmFnbWVudC5wcm90b3R5cGUuc2VsZWN0QWxsID0gZWxwcm90by5zZWxlY3RBbGw7XG4gIH0pOyAvLyBDb3B5cmlnaHQgKGMpIDIwMTYgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gIC8vXG4gIC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIC8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gIC8vXG4gIC8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAvL1xuICAvLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIC8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIC8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiAgU25hcC5wbHVnaW4oZnVuY3Rpb24gKFNuYXAsIEVsZW1lbnQsIFBhcGVyLCBnbG9iLCBGcmFnbWVudCkge1xuICAgIHZhciBlbHByb3RvID0gRWxlbWVudC5wcm90b3R5cGUsXG4gICAgICAgIGlzID0gU25hcC5pcyxcbiAgICAgICAgU3RyID0gU3RyaW5nLFxuICAgICAgICBoYXMgPSBcImhhc093blByb3BlcnR5XCI7XG5cbiAgICBmdW5jdGlvbiBzbGljZShmcm9tLCB0bywgZikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgdmFyIHJlcyA9IGFyci5zbGljZShmcm9tLCB0byk7XG5cbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgIHJlcyA9IHJlc1swXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmID8gZihyZXMpIDogcmVzO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgQW5pbWF0aW9uID0gZnVuY3Rpb24gKGF0dHIsIG1zLCBlYXNpbmcsIGNhbGxiYWNrKSB7XG4gICAgICBpZiAodHlwZW9mIGVhc2luZyA9PSBcImZ1bmN0aW9uXCIgJiYgIWVhc2luZy5sZW5ndGgpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBlYXNpbmc7XG4gICAgICAgIGVhc2luZyA9IG1pbmEubGluZWFyO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmF0dHIgPSBhdHRyO1xuICAgICAgdGhpcy5kdXIgPSBtcztcbiAgICAgIGVhc2luZyAmJiAodGhpcy5lYXNpbmcgPSBlYXNpbmcpO1xuICAgICAgY2FsbGJhY2sgJiYgKHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIFNuYXAuXy5BbmltYXRpb24gPSBBbmltYXRpb247XG4gICAgLypcXFxuICAgICAqIFNuYXAuYW5pbWF0aW9uXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGFuIGFuaW1hdGlvbiBvYmplY3RcbiAgICAgKipcbiAgICAgLSBhdHRyIChvYmplY3QpIGF0dHJpYnV0ZXMgb2YgZmluYWwgZGVzdGluYXRpb25cbiAgICAgLSBkdXJhdGlvbiAobnVtYmVyKSBkdXJhdGlvbiBvZiB0aGUgYW5pbWF0aW9uLCBpbiBtaWxsaXNlY29uZHNcbiAgICAgLSBlYXNpbmcgKGZ1bmN0aW9uKSAjb3B0aW9uYWwgb25lIG9mIGVhc2luZyBmdW5jdGlvbnMgb2YgQG1pbmEgb3IgY3VzdG9tIG9uZVxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgI29wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgZmlyZXMgd2hlbiBhbmltYXRpb24gZW5kc1xuICAgICA9IChvYmplY3QpIGFuaW1hdGlvbiBvYmplY3RcbiAgICBcXCovXG5cbiAgICBTbmFwLmFuaW1hdGlvbiA9IGZ1bmN0aW9uIChhdHRyLCBtcywgZWFzaW5nLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIG5ldyBBbmltYXRpb24oYXR0ciwgbXMsIGVhc2luZywgY2FsbGJhY2spO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuaW5BbmltXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGEgc2V0IG9mIGFuaW1hdGlvbnMgdGhhdCBtYXkgYmUgYWJsZSB0byBtYW5pcHVsYXRlIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBpbiBmb3JtYXQ6XG4gICAgIG8ge1xuICAgICBvICAgICBhbmltIChvYmplY3QpIGFuaW1hdGlvbiBvYmplY3QsXG4gICAgIG8gICAgIG1pbmEgKG9iamVjdCkgQG1pbmEgb2JqZWN0LFxuICAgICBvICAgICBjdXJTdGF0dXMgKG51bWJlcikgMC4uMSDigJQgc3RhdHVzIG9mIHRoZSBhbmltYXRpb246IDAg4oCUIGp1c3Qgc3RhcnRlZCwgMSDigJQganVzdCBmaW5pc2hlZCxcbiAgICAgbyAgICAgc3RhdHVzIChmdW5jdGlvbikgZ2V0cyBvciBzZXRzIHRoZSBzdGF0dXMgb2YgdGhlIGFuaW1hdGlvbixcbiAgICAgbyAgICAgc3RvcCAoZnVuY3Rpb24pIHN0b3BzIHRoZSBhbmltYXRpb25cbiAgICAgbyB9XG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLmluQW5pbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBlbCA9IHRoaXMsXG4gICAgICAgICAgcmVzID0gW107XG5cbiAgICAgIGZvciAodmFyIGlkIGluIGVsLmFuaW1zKSBpZiAoZWwuYW5pbXNbaGFzXShpZCkpIHtcbiAgICAgICAgKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgcmVzLnB1c2goe1xuICAgICAgICAgICAgYW5pbTogbmV3IEFuaW1hdGlvbihhLl9hdHRycywgYS5kdXIsIGEuZWFzaW5nLCBhLl9jYWxsYmFjayksXG4gICAgICAgICAgICBtaW5hOiBhLFxuICAgICAgICAgICAgY3VyU3RhdHVzOiBhLnN0YXR1cygpLFxuICAgICAgICAgICAgc3RhdHVzOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBhLnN0YXR1cyh2YWwpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgYS5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pKGVsLmFuaW1zW2lkXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5hbmltYXRlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSdW5zIGdlbmVyaWMgYW5pbWF0aW9uIG9mIG9uZSBudW1iZXIgaW50byBhbm90aGVyIHdpdGggYSBjYXJpbmcgZnVuY3Rpb25cbiAgICAgKipcbiAgICAgLSBmcm9tIChudW1iZXJ8YXJyYXkpIG51bWJlciBvciBhcnJheSBvZiBudW1iZXJzXG4gICAgIC0gdG8gKG51bWJlcnxhcnJheSkgbnVtYmVyIG9yIGFycmF5IG9mIG51bWJlcnNcbiAgICAgLSBzZXR0ZXIgKGZ1bmN0aW9uKSBjYXJpbmcgZnVuY3Rpb24gdGhhdCBhY2NlcHRzIG9uZSBudW1iZXIgYXJndW1lbnRcbiAgICAgLSBkdXJhdGlvbiAobnVtYmVyKSBkdXJhdGlvbiwgaW4gbWlsbGlzZWNvbmRzXG4gICAgIC0gZWFzaW5nIChmdW5jdGlvbikgI29wdGlvbmFsIGVhc2luZyBmdW5jdGlvbiBmcm9tIEBtaW5hIG9yIGN1c3RvbVxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgI29wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBhbmltYXRpb24gZW5kc1xuICAgICA9IChvYmplY3QpIGFuaW1hdGlvbiBvYmplY3QgaW4gQG1pbmEgZm9ybWF0XG4gICAgIG8ge1xuICAgICBvICAgICBpZCAoc3RyaW5nKSBhbmltYXRpb24gaWQsIGNvbnNpZGVyIGl0IHJlYWQtb25seSxcbiAgICAgbyAgICAgZHVyYXRpb24gKGZ1bmN0aW9uKSBnZXRzIG9yIHNldHMgdGhlIGR1cmF0aW9uIG9mIHRoZSBhbmltYXRpb24sXG4gICAgIG8gICAgIGVhc2luZyAoZnVuY3Rpb24pIGVhc2luZyxcbiAgICAgbyAgICAgc3BlZWQgKGZ1bmN0aW9uKSBnZXRzIG9yIHNldHMgdGhlIHNwZWVkIG9mIHRoZSBhbmltYXRpb24sXG4gICAgIG8gICAgIHN0YXR1cyAoZnVuY3Rpb24pIGdldHMgb3Igc2V0cyB0aGUgc3RhdHVzIG9mIHRoZSBhbmltYXRpb24sXG4gICAgIG8gICAgIHN0b3AgKGZ1bmN0aW9uKSBzdG9wcyB0aGUgYW5pbWF0aW9uXG4gICAgIG8gfVxuICAgICB8IHZhciByZWN0ID0gU25hcCgpLnJlY3QoMCwgMCwgMTAsIDEwKTtcbiAgICAgfCBTbmFwLmFuaW1hdGUoMCwgMTAsIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgfCAgICAgcmVjdC5hdHRyKHtcbiAgICAgfCAgICAgICAgIHg6IHZhbFxuICAgICB8ICAgICB9KTtcbiAgICAgfCB9LCAxMDAwKTtcbiAgICAgfCAvLyBpbiBnaXZlbiBjb250ZXh0IGlzIGVxdWl2YWxlbnQgdG9cbiAgICAgfCByZWN0LmFuaW1hdGUoe3g6IDEwfSwgMTAwMCk7XG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmFuaW1hdGUgPSBmdW5jdGlvbiAoZnJvbSwgdG8sIHNldHRlciwgbXMsIGVhc2luZywgY2FsbGJhY2spIHtcbiAgICAgIGlmICh0eXBlb2YgZWFzaW5nID09IFwiZnVuY3Rpb25cIiAmJiAhZWFzaW5nLmxlbmd0aCkge1xuICAgICAgICBjYWxsYmFjayA9IGVhc2luZztcbiAgICAgICAgZWFzaW5nID0gbWluYS5saW5lYXI7XG4gICAgICB9XG5cbiAgICAgIHZhciBub3cgPSBtaW5hLnRpbWUoKSxcbiAgICAgICAgICBhbmltID0gbWluYShmcm9tLCB0bywgbm93LCBub3cgKyBtcywgbWluYS50aW1lLCBzZXR0ZXIsIGVhc2luZyk7XG4gICAgICBjYWxsYmFjayAmJiBldmUub25jZShcIm1pbmEuZmluaXNoLlwiICsgYW5pbS5pZCwgY2FsbGJhY2spO1xuICAgICAgcmV0dXJuIGFuaW07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5zdG9wXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBTdG9wcyBhbGwgdGhlIGFuaW1hdGlvbnMgZm9yIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAgICAgKipcbiAgICAgPSAoRWxlbWVudCkgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGFuaW1zID0gdGhpcy5pbkFuaW0oKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gYW5pbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICBhbmltc1tpXS5zdG9wKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuYW5pbWF0ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQW5pbWF0ZXMgdGhlIGdpdmVuIGF0dHJpYnV0ZXMgb2YgdGhlIGVsZW1lbnRcbiAgICAgKipcbiAgICAgLSBhdHRycyAob2JqZWN0KSBrZXktdmFsdWUgcGFpcnMgb2YgZGVzdGluYXRpb24gYXR0cmlidXRlc1xuICAgICAtIGR1cmF0aW9uIChudW1iZXIpIGR1cmF0aW9uIG9mIHRoZSBhbmltYXRpb24gaW4gbWlsbGlzZWNvbmRzXG4gICAgIC0gZWFzaW5nIChmdW5jdGlvbikgI29wdGlvbmFsIGVhc2luZyBmdW5jdGlvbiBmcm9tIEBtaW5hIG9yIGN1c3RvbVxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgI29wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgZXhlY3V0ZXMgd2hlbiB0aGUgYW5pbWF0aW9uIGVuZHNcbiAgICAgPSAoRWxlbWVudCkgdGhlIGN1cnJlbnQgZWxlbWVudFxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5hbmltYXRlID0gZnVuY3Rpb24gKGF0dHJzLCBtcywgZWFzaW5nLCBjYWxsYmFjaykge1xuICAgICAgaWYgKHR5cGVvZiBlYXNpbmcgPT0gXCJmdW5jdGlvblwiICYmICFlYXNpbmcubGVuZ3RoKSB7XG4gICAgICAgIGNhbGxiYWNrID0gZWFzaW5nO1xuICAgICAgICBlYXNpbmcgPSBtaW5hLmxpbmVhcjtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHJzIGluc3RhbmNlb2YgQW5pbWF0aW9uKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYXR0cnMuY2FsbGJhY2s7XG4gICAgICAgIGVhc2luZyA9IGF0dHJzLmVhc2luZztcbiAgICAgICAgbXMgPSBhdHRycy5kdXI7XG4gICAgICAgIGF0dHJzID0gYXR0cnMuYXR0cjtcbiAgICAgIH1cblxuICAgICAgdmFyIGZrZXlzID0gW10sXG4gICAgICAgICAgdGtleXMgPSBbXSxcbiAgICAgICAgICBrZXlzID0ge30sXG4gICAgICAgICAgZnJvbSxcbiAgICAgICAgICB0byxcbiAgICAgICAgICBmLFxuICAgICAgICAgIGVxLFxuICAgICAgICAgIGVsID0gdGhpcztcblxuICAgICAgZm9yICh2YXIga2V5IGluIGF0dHJzKSBpZiAoYXR0cnNbaGFzXShrZXkpKSB7XG4gICAgICAgIGlmIChlbC5lcXVhbCkge1xuICAgICAgICAgIGVxID0gZWwuZXF1YWwoa2V5LCBTdHIoYXR0cnNba2V5XSkpO1xuICAgICAgICAgIGZyb20gPSBlcS5mcm9tO1xuICAgICAgICAgIHRvID0gZXEudG87XG4gICAgICAgICAgZiA9IGVxLmY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZnJvbSA9ICtlbC5hdHRyKGtleSk7XG4gICAgICAgICAgdG8gPSArYXR0cnNba2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW4gPSBpcyhmcm9tLCBcImFycmF5XCIpID8gZnJvbS5sZW5ndGggOiAxO1xuICAgICAgICBrZXlzW2tleV0gPSBzbGljZShma2V5cy5sZW5ndGgsIGZrZXlzLmxlbmd0aCArIGxlbiwgZik7XG4gICAgICAgIGZrZXlzID0gZmtleXMuY29uY2F0KGZyb20pO1xuICAgICAgICB0a2V5cyA9IHRrZXlzLmNvbmNhdCh0byk7XG4gICAgICB9XG5cbiAgICAgIHZhciBub3cgPSBtaW5hLnRpbWUoKSxcbiAgICAgICAgICBhbmltID0gbWluYShma2V5cywgdGtleXMsIG5vdywgbm93ICsgbXMsIG1pbmEudGltZSwgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICB2YXIgYXR0ciA9IHt9O1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBrZXlzKSBpZiAoa2V5c1toYXNdKGtleSkpIHtcbiAgICAgICAgICBhdHRyW2tleV0gPSBrZXlzW2tleV0odmFsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsLmF0dHIoYXR0cik7XG4gICAgICB9LCBlYXNpbmcpO1xuICAgICAgZWwuYW5pbXNbYW5pbS5pZF0gPSBhbmltO1xuICAgICAgYW5pbS5fYXR0cnMgPSBhdHRycztcbiAgICAgIGFuaW0uX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICBldmUoXCJzbmFwLmFuaW1jcmVhdGVkLlwiICsgZWwuaWQsIGFuaW0pO1xuICAgICAgZXZlLm9uY2UoXCJtaW5hLmZpbmlzaC5cIiArIGFuaW0uaWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXZlLm9mZihcIm1pbmEuKi5cIiArIGFuaW0uaWQpO1xuICAgICAgICBkZWxldGUgZWwuYW5pbXNbYW5pbS5pZF07XG4gICAgICAgIGNhbGxiYWNrICYmIGNhbGxiYWNrLmNhbGwoZWwpO1xuICAgICAgfSk7XG4gICAgICBldmUub25jZShcIm1pbmEuc3RvcC5cIiArIGFuaW0uaWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZXZlLm9mZihcIm1pbmEuKi5cIiArIGFuaW0uaWQpO1xuICAgICAgICBkZWxldGUgZWwuYW5pbXNbYW5pbS5pZF07XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBlbDtcbiAgICB9O1xuICB9KTsgLy8gQ29weXJpZ2h0IChjKSAyMDEzIEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAvL1xuICAvLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAvLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIC8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAvL1xuICAvLyBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgLy9cbiAgLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAvLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gIC8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAvLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gIC8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4gIFNuYXAucGx1Z2luKGZ1bmN0aW9uIChTbmFwLCBFbGVtZW50LCBQYXBlciwgZ2xvYiwgRnJhZ21lbnQpIHtcbiAgICB2YXIgb2JqZWN0VG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLFxuICAgICAgICBTdHIgPSBTdHJpbmcsXG4gICAgICAgIG1hdGggPSBNYXRoLFxuICAgICAgICBFID0gXCJcIjtcblxuICAgIGZ1bmN0aW9uIE1hdHJpeChhLCBiLCBjLCBkLCBlLCBmKSB7XG4gICAgICBpZiAoYiA9PSBudWxsICYmIG9iamVjdFRvU3RyaW5nLmNhbGwoYSkgPT0gXCJbb2JqZWN0IFNWR01hdHJpeF1cIikge1xuICAgICAgICB0aGlzLmEgPSBhLmE7XG4gICAgICAgIHRoaXMuYiA9IGEuYjtcbiAgICAgICAgdGhpcy5jID0gYS5jO1xuICAgICAgICB0aGlzLmQgPSBhLmQ7XG4gICAgICAgIHRoaXMuZSA9IGEuZTtcbiAgICAgICAgdGhpcy5mID0gYS5mO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChhICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5hID0gK2E7XG4gICAgICAgIHRoaXMuYiA9ICtiO1xuICAgICAgICB0aGlzLmMgPSArYztcbiAgICAgICAgdGhpcy5kID0gK2Q7XG4gICAgICAgIHRoaXMuZSA9ICtlO1xuICAgICAgICB0aGlzLmYgPSArZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYSA9IDE7XG4gICAgICAgIHRoaXMuYiA9IDA7XG4gICAgICAgIHRoaXMuYyA9IDA7XG4gICAgICAgIHRoaXMuZCA9IDE7XG4gICAgICAgIHRoaXMuZSA9IDA7XG4gICAgICAgIHRoaXMuZiA9IDA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgKGZ1bmN0aW9uIChtYXRyaXhwcm90bykge1xuICAgICAgLypcXFxuICAgICAgICogTWF0cml4LmFkZFxuICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAqKlxuICAgICAgICogQWRkcyB0aGUgZ2l2ZW4gbWF0cml4IHRvIGV4aXN0aW5nIG9uZVxuICAgICAgIC0gYSAobnVtYmVyKVxuICAgICAgIC0gYiAobnVtYmVyKVxuICAgICAgIC0gYyAobnVtYmVyKVxuICAgICAgIC0gZCAobnVtYmVyKVxuICAgICAgIC0gZSAobnVtYmVyKVxuICAgICAgIC0gZiAobnVtYmVyKVxuICAgICAgICogb3JcbiAgICAgICAtIG1hdHJpeCAob2JqZWN0KSBATWF0cml4XG4gICAgICBcXCovXG4gICAgICBtYXRyaXhwcm90by5hZGQgPSBmdW5jdGlvbiAoYSwgYiwgYywgZCwgZSwgZikge1xuICAgICAgICBpZiAoYSAmJiBhIGluc3RhbmNlb2YgTWF0cml4KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKGEuYSwgYS5iLCBhLmMsIGEuZCwgYS5lLCBhLmYpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFOZXcgPSBhICogdGhpcy5hICsgYiAqIHRoaXMuYyxcbiAgICAgICAgICAgIGJOZXcgPSBhICogdGhpcy5iICsgYiAqIHRoaXMuZDtcbiAgICAgICAgdGhpcy5lICs9IGUgKiB0aGlzLmEgKyBmICogdGhpcy5jO1xuICAgICAgICB0aGlzLmYgKz0gZSAqIHRoaXMuYiArIGYgKiB0aGlzLmQ7XG4gICAgICAgIHRoaXMuYyA9IGMgKiB0aGlzLmEgKyBkICogdGhpcy5jO1xuICAgICAgICB0aGlzLmQgPSBjICogdGhpcy5iICsgZCAqIHRoaXMuZDtcbiAgICAgICAgdGhpcy5hID0gYU5ldztcbiAgICAgICAgdGhpcy5iID0gYk5ldztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLypcXFxuICAgICAgICogTWF0cml4Lm11bHRMZWZ0XG4gICAgICAgWyBtZXRob2QgXVxuICAgICAgICoqXG4gICAgICAgKiBNdWx0aXBsaWVzIGEgcGFzc2VkIGFmZmluZSB0cmFuc2Zvcm0gdG8gdGhlIGxlZnQ6IE0gKiB0aGlzLlxuICAgICAgIC0gYSAobnVtYmVyKVxuICAgICAgIC0gYiAobnVtYmVyKVxuICAgICAgIC0gYyAobnVtYmVyKVxuICAgICAgIC0gZCAobnVtYmVyKVxuICAgICAgIC0gZSAobnVtYmVyKVxuICAgICAgIC0gZiAobnVtYmVyKVxuICAgICAgICogb3JcbiAgICAgICAtIG1hdHJpeCAob2JqZWN0KSBATWF0cml4XG4gICAgICBcXCovXG5cblxuICAgICAgTWF0cml4LnByb3RvdHlwZS5tdWx0TGVmdCA9IGZ1bmN0aW9uIChhLCBiLCBjLCBkLCBlLCBmKSB7XG4gICAgICAgIGlmIChhICYmIGEgaW5zdGFuY2VvZiBNYXRyaXgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5tdWx0TGVmdChhLmEsIGEuYiwgYS5jLCBhLmQsIGEuZSwgYS5mKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhTmV3ID0gYSAqIHRoaXMuYSArIGMgKiB0aGlzLmIsXG4gICAgICAgICAgICBjTmV3ID0gYSAqIHRoaXMuYyArIGMgKiB0aGlzLmQsXG4gICAgICAgICAgICBlTmV3ID0gYSAqIHRoaXMuZSArIGMgKiB0aGlzLmYgKyBlO1xuICAgICAgICB0aGlzLmIgPSBiICogdGhpcy5hICsgZCAqIHRoaXMuYjtcbiAgICAgICAgdGhpcy5kID0gYiAqIHRoaXMuYyArIGQgKiB0aGlzLmQ7XG4gICAgICAgIHRoaXMuZiA9IGIgKiB0aGlzLmUgKyBkICogdGhpcy5mICsgZjtcbiAgICAgICAgdGhpcy5hID0gYU5ldztcbiAgICAgICAgdGhpcy5jID0gY05ldztcbiAgICAgICAgdGhpcy5lID0gZU5ldztcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9O1xuICAgICAgLypcXFxuICAgICAgICogTWF0cml4LmludmVydFxuICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAqKlxuICAgICAgICogUmV0dXJucyBhbiBpbnZlcnRlZCB2ZXJzaW9uIG9mIHRoZSBtYXRyaXhcbiAgICAgICA9IChvYmplY3QpIEBNYXRyaXhcbiAgICAgIFxcKi9cblxuXG4gICAgICBtYXRyaXhwcm90by5pbnZlcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBtZSA9IHRoaXMsXG4gICAgICAgICAgICB4ID0gbWUuYSAqIG1lLmQgLSBtZS5iICogbWUuYztcbiAgICAgICAgcmV0dXJuIG5ldyBNYXRyaXgobWUuZCAvIHgsIC1tZS5iIC8geCwgLW1lLmMgLyB4LCBtZS5hIC8geCwgKG1lLmMgKiBtZS5mIC0gbWUuZCAqIG1lLmUpIC8geCwgKG1lLmIgKiBtZS5lIC0gbWUuYSAqIG1lLmYpIC8geCk7XG4gICAgICB9O1xuICAgICAgLypcXFxuICAgICAgICogTWF0cml4LmNsb25lXG4gICAgICAgWyBtZXRob2QgXVxuICAgICAgICoqXG4gICAgICAgKiBSZXR1cm5zIGEgY29weSBvZiB0aGUgbWF0cml4XG4gICAgICAgPSAob2JqZWN0KSBATWF0cml4XG4gICAgICBcXCovXG5cblxuICAgICAgbWF0cml4cHJvdG8uY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBuZXcgTWF0cml4KHRoaXMuYSwgdGhpcy5iLCB0aGlzLmMsIHRoaXMuZCwgdGhpcy5lLCB0aGlzLmYpO1xuICAgICAgfTtcbiAgICAgIC8qXFxcbiAgICAgICAqIE1hdHJpeC50cmFuc2xhdGVcbiAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgKipcbiAgICAgICAqIFRyYW5zbGF0ZSB0aGUgbWF0cml4XG4gICAgICAgLSB4IChudW1iZXIpIGhvcml6b250YWwgb2Zmc2V0IGRpc3RhbmNlXG4gICAgICAgLSB5IChudW1iZXIpIHZlcnRpY2FsIG9mZnNldCBkaXN0YW5jZVxuICAgICAgXFwqL1xuXG5cbiAgICAgIG1hdHJpeHByb3RvLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHRoaXMuZSArPSB4ICogdGhpcy5hICsgeSAqIHRoaXMuYztcbiAgICAgICAgdGhpcy5mICs9IHggKiB0aGlzLmIgKyB5ICogdGhpcy5kO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvKlxcXG4gICAgICAgKiBNYXRyaXguc2NhbGVcbiAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgKipcbiAgICAgICAqIFNjYWxlcyB0aGUgbWF0cml4XG4gICAgICAgLSB4IChudW1iZXIpIGFtb3VudCB0byBiZSBzY2FsZWQsIHdpdGggYDFgIHJlc3VsdGluZyBpbiBubyBjaGFuZ2VcbiAgICAgICAtIHkgKG51bWJlcikgI29wdGlvbmFsIGFtb3VudCB0byBzY2FsZSBhbG9uZyB0aGUgdmVydGljYWwgYXhpcy4gKE90aGVyd2lzZSBgeGAgYXBwbGllcyB0byBib3RoIGF4ZXMuKVxuICAgICAgIC0gY3ggKG51bWJlcikgI29wdGlvbmFsIGhvcml6b250YWwgb3JpZ2luIHBvaW50IGZyb20gd2hpY2ggdG8gc2NhbGVcbiAgICAgICAtIGN5IChudW1iZXIpICNvcHRpb25hbCB2ZXJ0aWNhbCBvcmlnaW4gcG9pbnQgZnJvbSB3aGljaCB0byBzY2FsZVxuICAgICAgICogRGVmYXVsdCBjeCwgY3kgaXMgdGhlIG1pZGRsZSBwb2ludCBvZiB0aGUgZWxlbWVudC5cbiAgICAgIFxcKi9cblxuXG4gICAgICBtYXRyaXhwcm90by5zY2FsZSA9IGZ1bmN0aW9uICh4LCB5LCBjeCwgY3kpIHtcbiAgICAgICAgeSA9PSBudWxsICYmICh5ID0geCk7XG4gICAgICAgIChjeCB8fCBjeSkgJiYgdGhpcy50cmFuc2xhdGUoY3gsIGN5KTtcbiAgICAgICAgdGhpcy5hICo9IHg7XG4gICAgICAgIHRoaXMuYiAqPSB4O1xuICAgICAgICB0aGlzLmMgKj0geTtcbiAgICAgICAgdGhpcy5kICo9IHk7XG4gICAgICAgIChjeCB8fCBjeSkgJiYgdGhpcy50cmFuc2xhdGUoLWN4LCAtY3kpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH07XG4gICAgICAvKlxcXG4gICAgICAgKiBNYXRyaXgucm90YXRlXG4gICAgICAgWyBtZXRob2QgXVxuICAgICAgICoqXG4gICAgICAgKiBSb3RhdGVzIHRoZSBtYXRyaXhcbiAgICAgICAtIGEgKG51bWJlcikgYW5nbGUgb2Ygcm90YXRpb24sIGluIGRlZ3JlZXNcbiAgICAgICAtIHggKG51bWJlcikgaG9yaXpvbnRhbCBvcmlnaW4gcG9pbnQgZnJvbSB3aGljaCB0byByb3RhdGVcbiAgICAgICAtIHkgKG51bWJlcikgdmVydGljYWwgb3JpZ2luIHBvaW50IGZyb20gd2hpY2ggdG8gcm90YXRlXG4gICAgICBcXCovXG5cblxuICAgICAgbWF0cml4cHJvdG8ucm90YXRlID0gZnVuY3Rpb24gKGEsIHgsIHkpIHtcbiAgICAgICAgYSA9IFNuYXAucmFkKGEpO1xuICAgICAgICB4ID0geCB8fCAwO1xuICAgICAgICB5ID0geSB8fCAwO1xuICAgICAgICB2YXIgY29zID0gK21hdGguY29zKGEpLnRvRml4ZWQoOSksXG4gICAgICAgICAgICBzaW4gPSArbWF0aC5zaW4oYSkudG9GaXhlZCg5KTtcbiAgICAgICAgdGhpcy5hZGQoY29zLCBzaW4sIC1zaW4sIGNvcywgeCwgeSk7XG4gICAgICAgIHJldHVybiB0aGlzLmFkZCgxLCAwLCAwLCAxLCAteCwgLXkpO1xuICAgICAgfTtcbiAgICAgIC8qXFxcbiAgICAgICAqIE1hdHJpeC5za2V3WFxuICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAqKlxuICAgICAgICogU2tld3MgdGhlIG1hdHJpeCBhbG9uZyB0aGUgeC1heGlzXG4gICAgICAgLSB4IChudW1iZXIpIEFuZ2xlIHRvIHNrZXcgYWxvbmcgdGhlIHgtYXhpcyAoaW4gZGVncmVlcykuXG4gICAgICBcXCovXG5cblxuICAgICAgbWF0cml4cHJvdG8uc2tld1ggPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gdGhpcy5za2V3KHgsIDApO1xuICAgICAgfTtcbiAgICAgIC8qXFxcbiAgICAgICAqIE1hdHJpeC5za2V3WVxuICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAqKlxuICAgICAgICogU2tld3MgdGhlIG1hdHJpeCBhbG9uZyB0aGUgeS1heGlzXG4gICAgICAgLSB5IChudW1iZXIpIEFuZ2xlIHRvIHNrZXcgYWxvbmcgdGhlIHktYXhpcyAoaW4gZGVncmVlcykuXG4gICAgICBcXCovXG5cblxuICAgICAgbWF0cml4cHJvdG8uc2tld1kgPSBmdW5jdGlvbiAoeSkge1xuICAgICAgICByZXR1cm4gdGhpcy5za2V3KDAsIHkpO1xuICAgICAgfTtcbiAgICAgIC8qXFxcbiAgICAgICAqIE1hdHJpeC5za2V3XG4gICAgICAgWyBtZXRob2QgXVxuICAgICAgICoqXG4gICAgICAgKiBTa2V3cyB0aGUgbWF0cml4XG4gICAgICAgLSB5IChudW1iZXIpIEFuZ2xlIHRvIHNrZXcgYWxvbmcgdGhlIHktYXhpcyAoaW4gZGVncmVlcykuXG4gICAgICAgLSB4IChudW1iZXIpIEFuZ2xlIHRvIHNrZXcgYWxvbmcgdGhlIHgtYXhpcyAoaW4gZGVncmVlcykuXG4gICAgICBcXCovXG5cblxuICAgICAgbWF0cml4cHJvdG8uc2tldyA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHggPSB4IHx8IDA7XG4gICAgICAgIHkgPSB5IHx8IDA7XG4gICAgICAgIHggPSBTbmFwLnJhZCh4KTtcbiAgICAgICAgeSA9IFNuYXAucmFkKHkpO1xuICAgICAgICB2YXIgYyA9IG1hdGgudGFuKHgpLnRvRml4ZWQoOSk7XG4gICAgICAgIHZhciBiID0gbWF0aC50YW4oeSkudG9GaXhlZCg5KTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkKDEsIGIsIGMsIDEsIDAsIDApO1xuICAgICAgfTtcbiAgICAgIC8qXFxcbiAgICAgICAqIE1hdHJpeC54XG4gICAgICAgWyBtZXRob2QgXVxuICAgICAgICoqXG4gICAgICAgKiBSZXR1cm5zIHggY29vcmRpbmF0ZSBmb3IgZ2l2ZW4gcG9pbnQgYWZ0ZXIgdHJhbnNmb3JtYXRpb24gZGVzY3JpYmVkIGJ5IHRoZSBtYXRyaXguIFNlZSBhbHNvIEBNYXRyaXgueVxuICAgICAgIC0geCAobnVtYmVyKVxuICAgICAgIC0geSAobnVtYmVyKVxuICAgICAgID0gKG51bWJlcikgeFxuICAgICAgXFwqL1xuXG5cbiAgICAgIG1hdHJpeHByb3RvLnggPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICByZXR1cm4geCAqIHRoaXMuYSArIHkgKiB0aGlzLmMgKyB0aGlzLmU7XG4gICAgICB9O1xuICAgICAgLypcXFxuICAgICAgICogTWF0cml4LnlcbiAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgKipcbiAgICAgICAqIFJldHVybnMgeSBjb29yZGluYXRlIGZvciBnaXZlbiBwb2ludCBhZnRlciB0cmFuc2Zvcm1hdGlvbiBkZXNjcmliZWQgYnkgdGhlIG1hdHJpeC4gU2VlIGFsc28gQE1hdHJpeC54XG4gICAgICAgLSB4IChudW1iZXIpXG4gICAgICAgLSB5IChudW1iZXIpXG4gICAgICAgPSAobnVtYmVyKSB5XG4gICAgICBcXCovXG5cblxuICAgICAgbWF0cml4cHJvdG8ueSA9IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHJldHVybiB4ICogdGhpcy5iICsgeSAqIHRoaXMuZCArIHRoaXMuZjtcbiAgICAgIH07XG5cbiAgICAgIG1hdHJpeHByb3RvLmdldCA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHJldHVybiArdGhpc1tTdHIuZnJvbUNoYXJDb2RlKDk3ICsgaSldLnRvRml4ZWQoNCk7XG4gICAgICB9O1xuXG4gICAgICBtYXRyaXhwcm90by50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIFwibWF0cml4KFwiICsgW3RoaXMuZ2V0KDApLCB0aGlzLmdldCgxKSwgdGhpcy5nZXQoMiksIHRoaXMuZ2V0KDMpLCB0aGlzLmdldCg0KSwgdGhpcy5nZXQoNSldLmpvaW4oKSArIFwiKVwiO1xuICAgICAgfTtcblxuICAgICAgbWF0cml4cHJvdG8ub2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gW3RoaXMuZS50b0ZpeGVkKDQpLCB0aGlzLmYudG9GaXhlZCg0KV07XG4gICAgICB9O1xuXG4gICAgICBmdW5jdGlvbiBub3JtKGEpIHtcbiAgICAgICAgcmV0dXJuIGFbMF0gKiBhWzBdICsgYVsxXSAqIGFbMV07XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG5vcm1hbGl6ZShhKSB7XG4gICAgICAgIHZhciBtYWcgPSBtYXRoLnNxcnQobm9ybShhKSk7XG4gICAgICAgIGFbMF0gJiYgKGFbMF0gLz0gbWFnKTtcbiAgICAgICAgYVsxXSAmJiAoYVsxXSAvPSBtYWcpO1xuICAgICAgfVxuICAgICAgLypcXFxuICAgICAgICogTWF0cml4LmRldGVybWluYW50XG4gICAgICAgWyBtZXRob2QgXVxuICAgICAgICoqXG4gICAgICAgKiBGaW5kcyBkZXRlcm1pbmFudCBvZiB0aGUgZ2l2ZW4gbWF0cml4LlxuICAgICAgID0gKG51bWJlcikgZGV0ZXJtaW5hbnRcbiAgICAgIFxcKi9cblxuXG4gICAgICBtYXRyaXhwcm90by5kZXRlcm1pbmFudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYSAqIHRoaXMuZCAtIHRoaXMuYiAqIHRoaXMuYztcbiAgICAgIH07XG4gICAgICAvKlxcXG4gICAgICAgKiBNYXRyaXguc3BsaXRcbiAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgKipcbiAgICAgICAqIFNwbGl0cyBtYXRyaXggaW50byBwcmltaXRpdmUgdHJhbnNmb3JtYXRpb25zXG4gICAgICAgPSAob2JqZWN0KSBpbiBmb3JtYXQ6XG4gICAgICAgbyBkeCAobnVtYmVyKSB0cmFuc2xhdGlvbiBieSB4XG4gICAgICAgbyBkeSAobnVtYmVyKSB0cmFuc2xhdGlvbiBieSB5XG4gICAgICAgbyBzY2FsZXggKG51bWJlcikgc2NhbGUgYnkgeFxuICAgICAgIG8gc2NhbGV5IChudW1iZXIpIHNjYWxlIGJ5IHlcbiAgICAgICBvIHNoZWFyIChudW1iZXIpIHNoZWFyXG4gICAgICAgbyByb3RhdGUgKG51bWJlcikgcm90YXRpb24gaW4gZGVnXG4gICAgICAgbyBpc1NpbXBsZSAoYm9vbGVhbikgY291bGQgaXQgYmUgcmVwcmVzZW50ZWQgdmlhIHNpbXBsZSB0cmFuc2Zvcm1hdGlvbnNcbiAgICAgIFxcKi9cblxuXG4gICAgICBtYXRyaXhwcm90by5zcGxpdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG91dCA9IHt9OyAvLyB0cmFuc2xhdGlvblxuXG4gICAgICAgIG91dC5keCA9IHRoaXMuZTtcbiAgICAgICAgb3V0LmR5ID0gdGhpcy5mOyAvLyBzY2FsZSBhbmQgc2hlYXJcblxuICAgICAgICB2YXIgcm93ID0gW1t0aGlzLmEsIHRoaXMuYl0sIFt0aGlzLmMsIHRoaXMuZF1dO1xuICAgICAgICBvdXQuc2NhbGV4ID0gbWF0aC5zcXJ0KG5vcm0ocm93WzBdKSk7XG4gICAgICAgIG5vcm1hbGl6ZShyb3dbMF0pO1xuICAgICAgICBvdXQuc2hlYXIgPSByb3dbMF1bMF0gKiByb3dbMV1bMF0gKyByb3dbMF1bMV0gKiByb3dbMV1bMV07XG4gICAgICAgIHJvd1sxXSA9IFtyb3dbMV1bMF0gLSByb3dbMF1bMF0gKiBvdXQuc2hlYXIsIHJvd1sxXVsxXSAtIHJvd1swXVsxXSAqIG91dC5zaGVhcl07XG4gICAgICAgIG91dC5zY2FsZXkgPSBtYXRoLnNxcnQobm9ybShyb3dbMV0pKTtcbiAgICAgICAgbm9ybWFsaXplKHJvd1sxXSk7XG4gICAgICAgIG91dC5zaGVhciAvPSBvdXQuc2NhbGV5O1xuXG4gICAgICAgIGlmICh0aGlzLmRldGVybWluYW50KCkgPCAwKSB7XG4gICAgICAgICAgb3V0LnNjYWxleCA9IC1vdXQuc2NhbGV4O1xuICAgICAgICB9IC8vIHJvdGF0aW9uXG5cblxuICAgICAgICB2YXIgc2luID0gcm93WzBdWzFdLFxuICAgICAgICAgICAgY29zID0gcm93WzFdWzFdO1xuXG4gICAgICAgIGlmIChjb3MgPCAwKSB7XG4gICAgICAgICAgb3V0LnJvdGF0ZSA9IFNuYXAuZGVnKG1hdGguYWNvcyhjb3MpKTtcblxuICAgICAgICAgIGlmIChzaW4gPCAwKSB7XG4gICAgICAgICAgICBvdXQucm90YXRlID0gMzYwIC0gb3V0LnJvdGF0ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3V0LnJvdGF0ZSA9IFNuYXAuZGVnKG1hdGguYXNpbihzaW4pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG91dC5pc1NpbXBsZSA9ICErb3V0LnNoZWFyLnRvRml4ZWQoOSkgJiYgKG91dC5zY2FsZXgudG9GaXhlZCg5KSA9PSBvdXQuc2NhbGV5LnRvRml4ZWQoOSkgfHwgIW91dC5yb3RhdGUpO1xuICAgICAgICBvdXQuaXNTdXBlclNpbXBsZSA9ICErb3V0LnNoZWFyLnRvRml4ZWQoOSkgJiYgb3V0LnNjYWxleC50b0ZpeGVkKDkpID09IG91dC5zY2FsZXkudG9GaXhlZCg5KSAmJiAhb3V0LnJvdGF0ZTtcbiAgICAgICAgb3V0Lm5vUm90YXRpb24gPSAhK291dC5zaGVhci50b0ZpeGVkKDkpICYmICFvdXQucm90YXRlO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgfTtcbiAgICAgIC8qXFxcbiAgICAgICAqIE1hdHJpeC50b1RyYW5zZm9ybVN0cmluZ1xuICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAqKlxuICAgICAgICogUmV0dXJucyB0cmFuc2Zvcm0gc3RyaW5nIHRoYXQgcmVwcmVzZW50cyBnaXZlbiBtYXRyaXhcbiAgICAgICA9IChzdHJpbmcpIHRyYW5zZm9ybSBzdHJpbmdcbiAgICAgIFxcKi9cblxuXG4gICAgICBtYXRyaXhwcm90by50b1RyYW5zZm9ybVN0cmluZyA9IGZ1bmN0aW9uIChzaG9ydGVyKSB7XG4gICAgICAgIHZhciBzID0gc2hvcnRlciB8fCB0aGlzLnNwbGl0KCk7XG5cbiAgICAgICAgaWYgKCErcy5zaGVhci50b0ZpeGVkKDkpKSB7XG4gICAgICAgICAgcy5zY2FsZXggPSArcy5zY2FsZXgudG9GaXhlZCg0KTtcbiAgICAgICAgICBzLnNjYWxleSA9ICtzLnNjYWxleS50b0ZpeGVkKDQpO1xuICAgICAgICAgIHMucm90YXRlID0gK3Mucm90YXRlLnRvRml4ZWQoNCk7XG4gICAgICAgICAgcmV0dXJuIChzLmR4IHx8IHMuZHkgPyBcInRcIiArIFsrcy5keC50b0ZpeGVkKDQpLCArcy5keS50b0ZpeGVkKDQpXSA6IEUpICsgKHMucm90YXRlID8gXCJyXCIgKyBbK3Mucm90YXRlLnRvRml4ZWQoNCksIDAsIDBdIDogRSkgKyAocy5zY2FsZXggIT0gMSB8fCBzLnNjYWxleSAhPSAxID8gXCJzXCIgKyBbcy5zY2FsZXgsIHMuc2NhbGV5LCAwLCAwXSA6IEUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBcIm1cIiArIFt0aGlzLmdldCgwKSwgdGhpcy5nZXQoMSksIHRoaXMuZ2V0KDIpLCB0aGlzLmdldCgzKSwgdGhpcy5nZXQoNCksIHRoaXMuZ2V0KDUpXTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KShNYXRyaXgucHJvdG90eXBlKTtcbiAgICAvKlxcXG4gICAgICogU25hcC5NYXRyaXhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIE1hdHJpeCBjb25zdHJ1Y3RvciwgZXh0ZW5kIG9uIHlvdXIgb3duIHJpc2suXG4gICAgICogVG8gY3JlYXRlIG1hdHJpY2VzIHVzZSBAU25hcC5tYXRyaXguXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLk1hdHJpeCA9IE1hdHJpeDtcbiAgICAvKlxcXG4gICAgICogU25hcC5tYXRyaXhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUmV0dXJucyBhIG1hdHJpeCBiYXNlZCBvbiB0aGUgZ2l2ZW4gcGFyYW1ldGVyc1xuICAgICAtIGEgKG51bWJlcilcbiAgICAgLSBiIChudW1iZXIpXG4gICAgIC0gYyAobnVtYmVyKVxuICAgICAtIGQgKG51bWJlcilcbiAgICAgLSBlIChudW1iZXIpXG4gICAgIC0gZiAobnVtYmVyKVxuICAgICAqIG9yXG4gICAgIC0gc3ZnTWF0cml4IChTVkdNYXRyaXgpXG4gICAgID0gKG9iamVjdCkgQE1hdHJpeFxuICAgIFxcKi9cblxuICAgIFNuYXAubWF0cml4ID0gZnVuY3Rpb24gKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgICAgIHJldHVybiBuZXcgTWF0cml4KGEsIGIsIGMsIGQsIGUsIGYpO1xuICAgIH07XG4gIH0pOyAvLyBDb3B5cmlnaHQgKGMpIDIwMTMgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gIC8vXG4gIC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIC8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gIC8vXG4gIC8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAvL1xuICAvLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIC8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIC8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiAgU25hcC5wbHVnaW4oZnVuY3Rpb24gKFNuYXAsIEVsZW1lbnQsIFBhcGVyLCBnbG9iLCBGcmFnbWVudCkge1xuICAgIHZhciBoYXMgPSBcImhhc093blByb3BlcnR5XCIsXG4gICAgICAgIG1ha2UgPSBTbmFwLl8ubWFrZSxcbiAgICAgICAgd3JhcCA9IFNuYXAuXy53cmFwLFxuICAgICAgICBpcyA9IFNuYXAuaXMsXG4gICAgICAgIGdldFNvbWVEZWZzID0gU25hcC5fLmdldFNvbWVEZWZzLFxuICAgICAgICByZVVSTFZhbHVlID0gL151cmxcXCgoWydcIl0/KShbXildKylcXDFcXCkkLyxcbiAgICAgICAgJCA9IFNuYXAuXy4kLFxuICAgICAgICBVUkwgPSBTbmFwLnVybCxcbiAgICAgICAgU3RyID0gU3RyaW5nLFxuICAgICAgICBzZXBhcmF0b3IgPSBTbmFwLl8uc2VwYXJhdG9yLFxuICAgICAgICBFID0gXCJcIjtcbiAgICAvKlxcXG4gICAgICogU25hcC5kZXVybFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVW53cmFwcyBwYXRoIGZyb20gYFwidXJsKDxwYXRoPilcImAuXG4gICAgIC0gdmFsdWUgKHN0cmluZykgdXJsIHBhdGhcbiAgICAgPSAoc3RyaW5nKSB1bndyYXBwZWQgcGF0aFxuICAgIFxcKi9cblxuICAgIFNuYXAuZGV1cmwgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHZhciByZXMgPSBTdHJpbmcodmFsdWUpLm1hdGNoKHJlVVJMVmFsdWUpO1xuICAgICAgcmV0dXJuIHJlcyA/IHJlc1syXSA6IHZhbHVlO1xuICAgIH07IC8vIEF0dHJpYnV0ZXMgZXZlbnQgaGFuZGxlcnNcblxuXG4gICAgZXZlLm9uKFwic25hcC51dGlsLmF0dHIubWFza1wiLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEVsZW1lbnQgfHwgdmFsdWUgaW5zdGFuY2VvZiBGcmFnbWVudCkge1xuICAgICAgICBldmUuc3RvcCgpO1xuXG4gICAgICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEZyYWdtZW50ICYmIHZhbHVlLm5vZGUuY2hpbGROb2Rlcy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgIHZhbHVlID0gdmFsdWUubm9kZS5maXJzdENoaWxkO1xuICAgICAgICAgIGdldFNvbWVEZWZzKHRoaXMpLmFwcGVuZENoaWxkKHZhbHVlKTtcbiAgICAgICAgICB2YWx1ZSA9IHdyYXAodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlLnR5cGUgPT0gXCJtYXNrXCIpIHtcbiAgICAgICAgICB2YXIgbWFzayA9IHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG1hc2sgPSBtYWtlKFwibWFza1wiLCBnZXRTb21lRGVmcyh0aGlzKSk7XG4gICAgICAgICAgbWFzay5ub2RlLmFwcGVuZENoaWxkKHZhbHVlLm5vZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgIW1hc2subm9kZS5pZCAmJiAkKG1hc2subm9kZSwge1xuICAgICAgICAgIGlkOiBtYXNrLmlkXG4gICAgICAgIH0pO1xuICAgICAgICAkKHRoaXMubm9kZSwge1xuICAgICAgICAgIG1hc2s6IFVSTChtYXNrLmlkKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIChmdW5jdGlvbiAoY2xpcEl0KSB7XG4gICAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5jbGlwXCIsIGNsaXBJdCk7XG4gICAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5jbGlwLXBhdGhcIiwgY2xpcEl0KTtcbiAgICAgIGV2ZS5vbihcInNuYXAudXRpbC5hdHRyLmNsaXBQYXRoXCIsIGNsaXBJdCk7XG4gICAgfSkoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBFbGVtZW50IHx8IHZhbHVlIGluc3RhbmNlb2YgRnJhZ21lbnQpIHtcbiAgICAgICAgZXZlLnN0b3AoKTtcbiAgICAgICAgdmFyIGNsaXAsXG4gICAgICAgICAgICBub2RlID0gdmFsdWUubm9kZTtcblxuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSBcImNsaXBQYXRoXCIpIHtcbiAgICAgICAgICAgIGNsaXAgPSBuZXcgRWxlbWVudChub2RlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChub2RlLm5vZGVOYW1lID09PSBcInN2Z1wiKSB7XG4gICAgICAgICAgICBjbGlwID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY2xpcCkge1xuICAgICAgICAgIGNsaXAgPSBtYWtlKFwiY2xpcFBhdGhcIiwgZ2V0U29tZURlZnModGhpcykpO1xuICAgICAgICAgIGNsaXAubm9kZS5hcHBlbmRDaGlsZCh2YWx1ZS5ub2RlKTtcbiAgICAgICAgICAhY2xpcC5ub2RlLmlkICYmICQoY2xpcC5ub2RlLCB7XG4gICAgICAgICAgICBpZDogY2xpcC5pZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh0aGlzLm5vZGUsIHtcbiAgICAgICAgICBcImNsaXAtcGF0aFwiOiBVUkwoY2xpcC5ub2RlLmlkIHx8IGNsaXAuaWQpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZmlsbFN0cm9rZShuYW1lKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGV2ZS5zdG9wKCk7XG5cbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRnJhZ21lbnQgJiYgdmFsdWUubm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA9PSAxICYmICh2YWx1ZS5ub2RlLmZpcnN0Q2hpbGQudGFnTmFtZSA9PSBcInJhZGlhbEdyYWRpZW50XCIgfHwgdmFsdWUubm9kZS5maXJzdENoaWxkLnRhZ05hbWUgPT0gXCJsaW5lYXJHcmFkaWVudFwiIHx8IHZhbHVlLm5vZGUuZmlyc3RDaGlsZC50YWdOYW1lID09IFwicGF0dGVyblwiKSkge1xuICAgICAgICAgIHZhbHVlID0gdmFsdWUubm9kZS5maXJzdENoaWxkO1xuICAgICAgICAgIGdldFNvbWVEZWZzKHRoaXMpLmFwcGVuZENoaWxkKHZhbHVlKTtcbiAgICAgICAgICB2YWx1ZSA9IHdyYXAodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgIGlmICh2YWx1ZS50eXBlID09IFwicmFkaWFsR3JhZGllbnRcIiB8fCB2YWx1ZS50eXBlID09IFwibGluZWFyR3JhZGllbnRcIiB8fCB2YWx1ZS50eXBlID09IFwicGF0dGVyblwiKSB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlLm5vZGUuaWQpIHtcbiAgICAgICAgICAgICAgJCh2YWx1ZS5ub2RlLCB7XG4gICAgICAgICAgICAgICAgaWQ6IHZhbHVlLmlkXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZmlsbCA9IFVSTCh2YWx1ZS5ub2RlLmlkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsbCA9IHZhbHVlLmF0dHIobmFtZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZpbGwgPSBTbmFwLmNvbG9yKHZhbHVlKTtcblxuICAgICAgICAgIGlmIChmaWxsLmVycm9yKSB7XG4gICAgICAgICAgICB2YXIgZ3JhZCA9IFNuYXAoZ2V0U29tZURlZnModGhpcykub3duZXJTVkdFbGVtZW50KS5ncmFkaWVudCh2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmIChncmFkKSB7XG4gICAgICAgICAgICAgIGlmICghZ3JhZC5ub2RlLmlkKSB7XG4gICAgICAgICAgICAgICAgJChncmFkLm5vZGUsIHtcbiAgICAgICAgICAgICAgICAgIGlkOiBncmFkLmlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBmaWxsID0gVVJMKGdyYWQubm9kZS5pZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBmaWxsID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbGwgPSBTdHIoZmlsbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGF0dHJzID0ge307XG4gICAgICAgIGF0dHJzW25hbWVdID0gZmlsbDtcbiAgICAgICAgJCh0aGlzLm5vZGUsIGF0dHJzKTtcbiAgICAgICAgdGhpcy5ub2RlLnN0eWxlW25hbWVdID0gRTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZXZlLm9uKFwic25hcC51dGlsLmF0dHIuZmlsbFwiLCBmaWxsU3Ryb2tlKFwiZmlsbFwiKSk7XG4gICAgZXZlLm9uKFwic25hcC51dGlsLmF0dHIuc3Ryb2tlXCIsIGZpbGxTdHJva2UoXCJzdHJva2VcIikpO1xuICAgIHZhciBncmFkcmcgPSAvXihbbHJdKSg/OlxcKChbXildKilcXCkpPyguKikkL2k7XG4gICAgZXZlLm9uKFwic25hcC51dGlsLmdyYWQucGFyc2VcIiwgZnVuY3Rpb24gcGFyc2VHcmFkKHN0cmluZykge1xuICAgICAgc3RyaW5nID0gU3RyKHN0cmluZyk7XG4gICAgICB2YXIgdG9rZW5zID0gc3RyaW5nLm1hdGNoKGdyYWRyZyk7XG5cbiAgICAgIGlmICghdG9rZW5zKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgdHlwZSA9IHRva2Vuc1sxXSxcbiAgICAgICAgICBwYXJhbXMgPSB0b2tlbnNbMl0sXG4gICAgICAgICAgc3RvcHMgPSB0b2tlbnNbM107XG4gICAgICBwYXJhbXMgPSBwYXJhbXMuc3BsaXQoL1xccyosXFxzKi8pLm1hcChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgcmV0dXJuICtlbCA9PSBlbCA/ICtlbCA6IGVsO1xuICAgICAgfSk7XG5cbiAgICAgIGlmIChwYXJhbXMubGVuZ3RoID09IDEgJiYgcGFyYW1zWzBdID09IDApIHtcbiAgICAgICAgcGFyYW1zID0gW107XG4gICAgICB9XG5cbiAgICAgIHN0b3BzID0gc3RvcHMuc3BsaXQoXCItXCIpO1xuICAgICAgc3RvcHMgPSBzdG9wcy5tYXAoZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIGVsID0gZWwuc3BsaXQoXCI6XCIpO1xuICAgICAgICB2YXIgb3V0ID0ge1xuICAgICAgICAgIGNvbG9yOiBlbFswXVxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChlbFsxXSkge1xuICAgICAgICAgIG91dC5vZmZzZXQgPSBwYXJzZUZsb2F0KGVsWzFdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvdXQ7XG4gICAgICB9KTtcbiAgICAgIHZhciBsZW4gPSBzdG9wcy5sZW5ndGgsXG4gICAgICAgICAgc3RhcnQgPSAwLFxuICAgICAgICAgIGogPSAwO1xuXG4gICAgICBmdW5jdGlvbiBzZWVkKGksIGVuZCkge1xuICAgICAgICB2YXIgc3RlcCA9IChlbmQgLSBzdGFydCkgLyAoaSAtIGopO1xuXG4gICAgICAgIGZvciAodmFyIGsgPSBqOyBrIDwgaTsgaysrKSB7XG4gICAgICAgICAgc3RvcHNba10ub2Zmc2V0ID0gKygrc3RhcnQgKyBzdGVwICogKGsgLSBqKSkudG9GaXhlZCgyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGogPSBpO1xuICAgICAgICBzdGFydCA9IGVuZDtcbiAgICAgIH1cblxuICAgICAgbGVuLS07XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIGlmIChcIm9mZnNldFwiIGluIHN0b3BzW2ldKSB7XG4gICAgICAgIHNlZWQoaSwgc3RvcHNbaV0ub2Zmc2V0KTtcbiAgICAgIH1cblxuICAgICAgc3RvcHNbbGVuXS5vZmZzZXQgPSBzdG9wc1tsZW5dLm9mZnNldCB8fCAxMDA7XG4gICAgICBzZWVkKGxlbiwgc3RvcHNbbGVuXS5vZmZzZXQpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgcGFyYW1zOiBwYXJhbXMsXG4gICAgICAgIHN0b3BzOiBzdG9wc1xuICAgICAgfTtcbiAgICB9KTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5kXCIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgZXZlLnN0b3AoKTtcblxuICAgICAgaWYgKGlzKHZhbHVlLCBcImFycmF5XCIpICYmIGlzKHZhbHVlWzBdLCBcImFycmF5XCIpKSB7XG4gICAgICAgIHZhbHVlID0gU25hcC5wYXRoLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICAgICAgfVxuXG4gICAgICB2YWx1ZSA9IFN0cih2YWx1ZSk7XG5cbiAgICAgIGlmICh2YWx1ZS5tYXRjaCgvW3J1b10vaSkpIHtcbiAgICAgICAgdmFsdWUgPSBTbmFwLnBhdGgudG9BYnNvbHV0ZSh2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgICQodGhpcy5ub2RlLCB7XG4gICAgICAgIGQ6IHZhbHVlXG4gICAgICB9KTtcbiAgICB9KSgtMSk7XG4gICAgZXZlLm9uKFwic25hcC51dGlsLmF0dHIuI3RleHRcIiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBldmUuc3RvcCgpO1xuICAgICAgdmFsdWUgPSBTdHIodmFsdWUpO1xuICAgICAgdmFyIHR4dCA9IGdsb2IuZG9jLmNyZWF0ZVRleHROb2RlKHZhbHVlKTtcblxuICAgICAgd2hpbGUgKHRoaXMubm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgIHRoaXMubm9kZS5yZW1vdmVDaGlsZCh0aGlzLm5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubm9kZS5hcHBlbmRDaGlsZCh0eHQpO1xuICAgIH0pKC0xKTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5wYXRoXCIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgZXZlLnN0b3AoKTtcbiAgICAgIHRoaXMuYXR0cih7XG4gICAgICAgIGQ6IHZhbHVlXG4gICAgICB9KTtcbiAgICB9KSgtMSk7XG4gICAgZXZlLm9uKFwic25hcC51dGlsLmF0dHIuY2xhc3NcIiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBldmUuc3RvcCgpO1xuICAgICAgdGhpcy5ub2RlLmNsYXNzTmFtZS5iYXNlVmFsID0gdmFsdWU7XG4gICAgfSkoLTEpO1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5hdHRyLnZpZXdCb3hcIiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgdmI7XG5cbiAgICAgIGlmIChpcyh2YWx1ZSwgXCJvYmplY3RcIikgJiYgXCJ4XCIgaW4gdmFsdWUpIHtcbiAgICAgICAgdmIgPSBbdmFsdWUueCwgdmFsdWUueSwgdmFsdWUud2lkdGgsIHZhbHVlLmhlaWdodF0uam9pbihcIiBcIik7XG4gICAgICB9IGVsc2UgaWYgKGlzKHZhbHVlLCBcImFycmF5XCIpKSB7XG4gICAgICAgIHZiID0gdmFsdWUuam9pbihcIiBcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YiA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICAkKHRoaXMubm9kZSwge1xuICAgICAgICB2aWV3Qm94OiB2YlxuICAgICAgfSk7XG4gICAgICBldmUuc3RvcCgpO1xuICAgIH0pKC0xKTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci50cmFuc2Zvcm1cIiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB0aGlzLnRyYW5zZm9ybSh2YWx1ZSk7XG4gICAgICBldmUuc3RvcCgpO1xuICAgIH0pKC0xKTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5yXCIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PSBcInJlY3RcIikge1xuICAgICAgICBldmUuc3RvcCgpO1xuICAgICAgICAkKHRoaXMubm9kZSwge1xuICAgICAgICAgIHJ4OiB2YWx1ZSxcbiAgICAgICAgICByeTogdmFsdWVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSkoLTEpO1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5hdHRyLnRleHRwYXRoXCIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgZXZlLnN0b3AoKTtcblxuICAgICAgaWYgKHRoaXMudHlwZSA9PSBcInRleHRcIikge1xuICAgICAgICB2YXIgaWQsIHRwLCBub2RlO1xuXG4gICAgICAgIGlmICghdmFsdWUgJiYgdGhpcy50ZXh0UGF0aCkge1xuICAgICAgICAgIHRwID0gdGhpcy50ZXh0UGF0aDtcblxuICAgICAgICAgIHdoaWxlICh0cC5ub2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIHRoaXMubm9kZS5hcHBlbmRDaGlsZCh0cC5ub2RlLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRwLnJlbW92ZSgpO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLnRleHRQYXRoO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpcyh2YWx1ZSwgXCJzdHJpbmdcIikpIHtcbiAgICAgICAgICB2YXIgZGVmcyA9IGdldFNvbWVEZWZzKHRoaXMpLFxuICAgICAgICAgICAgICBwYXRoID0gd3JhcChkZWZzLnBhcmVudE5vZGUpLnBhdGgodmFsdWUpO1xuICAgICAgICAgIGRlZnMuYXBwZW5kQ2hpbGQocGF0aC5ub2RlKTtcbiAgICAgICAgICBpZCA9IHBhdGguaWQ7XG4gICAgICAgICAgcGF0aC5hdHRyKHtcbiAgICAgICAgICAgIGlkOiBpZFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gd3JhcCh2YWx1ZSk7XG5cbiAgICAgICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICAgICAgICBpZCA9IHZhbHVlLmF0dHIoXCJpZFwiKTtcblxuICAgICAgICAgICAgaWYgKCFpZCkge1xuICAgICAgICAgICAgICBpZCA9IHZhbHVlLmlkO1xuICAgICAgICAgICAgICB2YWx1ZS5hdHRyKHtcbiAgICAgICAgICAgICAgICBpZDogaWRcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgdHAgPSB0aGlzLnRleHRQYXRoO1xuICAgICAgICAgIG5vZGUgPSB0aGlzLm5vZGU7XG5cbiAgICAgICAgICBpZiAodHApIHtcbiAgICAgICAgICAgIHRwLmF0dHIoe1xuICAgICAgICAgICAgICBcInhsaW5rOmhyZWZcIjogXCIjXCIgKyBpZFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRwID0gJChcInRleHRQYXRoXCIsIHtcbiAgICAgICAgICAgICAgXCJ4bGluazpocmVmXCI6IFwiI1wiICsgaWRcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB3aGlsZSAobm9kZS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICAgIHRwLmFwcGVuZENoaWxkKG5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5vZGUuYXBwZW5kQ2hpbGQodHApO1xuICAgICAgICAgICAgdGhpcy50ZXh0UGF0aCA9IHdyYXAodHApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKC0xKTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci50ZXh0XCIsIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PSBcInRleHRcIikge1xuICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICBub2RlID0gdGhpcy5ub2RlLFxuICAgICAgICAgICAgdHVuZXIgPSBmdW5jdGlvbiAoY2h1bmspIHtcbiAgICAgICAgICB2YXIgb3V0ID0gJChcInRzcGFuXCIpO1xuXG4gICAgICAgICAgaWYgKGlzKGNodW5rLCBcImFycmF5XCIpKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNodW5rLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIG91dC5hcHBlbmRDaGlsZCh0dW5lcihjaHVua1tpXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXQuYXBwZW5kQ2hpbGQoZ2xvYi5kb2MuY3JlYXRlVGV4dE5vZGUoY2h1bmspKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvdXQubm9ybWFsaXplICYmIG91dC5ub3JtYWxpemUoKTtcbiAgICAgICAgICByZXR1cm4gb3V0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHdoaWxlIChub2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG5vZGUuZmlyc3RDaGlsZCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdHVuZWQgPSB0dW5lcih2YWx1ZSk7XG5cbiAgICAgICAgd2hpbGUgKHR1bmVkLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKHR1bmVkLmZpcnN0Q2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGV2ZS5zdG9wKCk7XG4gICAgfSkoLTEpO1xuXG4gICAgZnVuY3Rpb24gc2V0Rm9udFNpemUodmFsdWUpIHtcbiAgICAgIGV2ZS5zdG9wKCk7XG5cbiAgICAgIGlmICh2YWx1ZSA9PSArdmFsdWUpIHtcbiAgICAgICAgdmFsdWUgKz0gXCJweFwiO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm5vZGUuc3R5bGUuZm9udFNpemUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5mb250U2l6ZVwiLCBzZXRGb250U2l6ZSkoLTEpO1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5hdHRyLmZvbnQtc2l6ZVwiLCBzZXRGb250U2l6ZSkoLTEpO1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5nZXRhdHRyLnRyYW5zZm9ybVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBldmUuc3RvcCgpO1xuICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtKCk7XG4gICAgfSkoLTEpO1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5nZXRhdHRyLnRleHRwYXRoXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGV2ZS5zdG9wKCk7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0UGF0aDtcbiAgICB9KSgtMSk7IC8vIE1hcmtlcnNcblxuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICBmdW5jdGlvbiBnZXR0ZXIoZW5kKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZXZlLnN0b3AoKTtcbiAgICAgICAgICB2YXIgc3R5bGUgPSBnbG9iLmRvYy5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKHRoaXMubm9kZSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShcIm1hcmtlci1cIiArIGVuZCk7XG5cbiAgICAgICAgICBpZiAoc3R5bGUgPT0gXCJub25lXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHlsZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFNuYXAoZ2xvYi5kb2MuZ2V0RWxlbWVudEJ5SWQoc3R5bGUubWF0Y2gocmVVUkxWYWx1ZSlbMV0pKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldHRlcihlbmQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgIGV2ZS5zdG9wKCk7XG4gICAgICAgICAgdmFyIG5hbWUgPSBcIm1hcmtlclwiICsgZW5kLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZW5kLnN1YnN0cmluZygxKTtcblxuICAgICAgICAgIGlmICh2YWx1ZSA9PSBcIlwiIHx8ICF2YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLnN0eWxlW25hbWVdID0gXCJub25lXCI7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHZhbHVlLnR5cGUgPT0gXCJtYXJrZXJcIikge1xuICAgICAgICAgICAgdmFyIGlkID0gdmFsdWUubm9kZS5pZDtcblxuICAgICAgICAgICAgaWYgKCFpZCkge1xuICAgICAgICAgICAgICAkKHZhbHVlLm5vZGUsIHtcbiAgICAgICAgICAgICAgICBpZDogdmFsdWUuaWRcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubm9kZS5zdHlsZVtuYW1lXSA9IFVSTChpZCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBldmUub24oXCJzbmFwLnV0aWwuZ2V0YXR0ci5tYXJrZXItZW5kXCIsIGdldHRlcihcImVuZFwiKSkoLTEpO1xuICAgICAgZXZlLm9uKFwic25hcC51dGlsLmdldGF0dHIubWFya2VyRW5kXCIsIGdldHRlcihcImVuZFwiKSkoLTEpO1xuICAgICAgZXZlLm9uKFwic25hcC51dGlsLmdldGF0dHIubWFya2VyLXN0YXJ0XCIsIGdldHRlcihcInN0YXJ0XCIpKSgtMSk7XG4gICAgICBldmUub24oXCJzbmFwLnV0aWwuZ2V0YXR0ci5tYXJrZXJTdGFydFwiLCBnZXR0ZXIoXCJzdGFydFwiKSkoLTEpO1xuICAgICAgZXZlLm9uKFwic25hcC51dGlsLmdldGF0dHIubWFya2VyLW1pZFwiLCBnZXR0ZXIoXCJtaWRcIikpKC0xKTtcbiAgICAgIGV2ZS5vbihcInNuYXAudXRpbC5nZXRhdHRyLm1hcmtlck1pZFwiLCBnZXR0ZXIoXCJtaWRcIikpKC0xKTtcbiAgICAgIGV2ZS5vbihcInNuYXAudXRpbC5hdHRyLm1hcmtlci1lbmRcIiwgc2V0dGVyKFwiZW5kXCIpKSgtMSk7XG4gICAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5tYXJrZXJFbmRcIiwgc2V0dGVyKFwiZW5kXCIpKSgtMSk7XG4gICAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5tYXJrZXItc3RhcnRcIiwgc2V0dGVyKFwic3RhcnRcIikpKC0xKTtcbiAgICAgIGV2ZS5vbihcInNuYXAudXRpbC5hdHRyLm1hcmtlclN0YXJ0XCIsIHNldHRlcihcInN0YXJ0XCIpKSgtMSk7XG4gICAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5tYXJrZXItbWlkXCIsIHNldHRlcihcIm1pZFwiKSkoLTEpO1xuICAgICAgZXZlLm9uKFwic25hcC51dGlsLmF0dHIubWFya2VyTWlkXCIsIHNldHRlcihcIm1pZFwiKSkoLTEpO1xuICAgIH0pKCk7XG5cbiAgICBldmUub24oXCJzbmFwLnV0aWwuZ2V0YXR0ci5yXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLnR5cGUgPT0gXCJyZWN0XCIgJiYgJCh0aGlzLm5vZGUsIFwicnhcIikgPT0gJCh0aGlzLm5vZGUsIFwicnlcIikpIHtcbiAgICAgICAgZXZlLnN0b3AoKTtcbiAgICAgICAgcmV0dXJuICQodGhpcy5ub2RlLCBcInJ4XCIpO1xuICAgICAgfVxuICAgIH0pKC0xKTtcblxuICAgIGZ1bmN0aW9uIHRleHRFeHRyYWN0KG5vZGUpIHtcbiAgICAgIHZhciBvdXQgPSBbXTtcbiAgICAgIHZhciBjaGlsZHJlbiA9IG5vZGUuY2hpbGROb2RlcztcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICB2YXIgY2hpID0gY2hpbGRyZW5baV07XG5cbiAgICAgICAgaWYgKGNoaS5ub2RlVHlwZSA9PSAzKSB7XG4gICAgICAgICAgb3V0LnB1c2goY2hpLm5vZGVWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hpLnRhZ05hbWUgPT0gXCJ0c3BhblwiKSB7XG4gICAgICAgICAgaWYgKGNoaS5jaGlsZE5vZGVzLmxlbmd0aCA9PSAxICYmIGNoaS5maXJzdENoaWxkLm5vZGVUeXBlID09IDMpIHtcbiAgICAgICAgICAgIG91dC5wdXNoKGNoaS5maXJzdENoaWxkLm5vZGVWYWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dC5wdXNoKHRleHRFeHRyYWN0KGNoaSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cblxuICAgIGV2ZS5vbihcInNuYXAudXRpbC5nZXRhdHRyLnRleHRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHRoaXMudHlwZSA9PSBcInRleHRcIiB8fCB0aGlzLnR5cGUgPT0gXCJ0c3BhblwiKSB7XG4gICAgICAgIGV2ZS5zdG9wKCk7XG4gICAgICAgIHZhciBvdXQgPSB0ZXh0RXh0cmFjdCh0aGlzLm5vZGUpO1xuICAgICAgICByZXR1cm4gb3V0Lmxlbmd0aCA9PSAxID8gb3V0WzBdIDogb3V0O1xuICAgICAgfVxuICAgIH0pKC0xKTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuZ2V0YXR0ci4jdGV4dFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5ub2RlLnRleHRDb250ZW50O1xuICAgIH0pKC0xKTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuZ2V0YXR0ci5maWxsXCIsIGZ1bmN0aW9uIChpbnRlcm5hbCkge1xuICAgICAgaWYgKGludGVybmFsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZXZlLnN0b3AoKTtcbiAgICAgIHZhciB2YWx1ZSA9IGV2ZShcInNuYXAudXRpbC5nZXRhdHRyLmZpbGxcIiwgdGhpcywgdHJ1ZSkuZmlyc3REZWZpbmVkKCk7XG4gICAgICByZXR1cm4gU25hcChTbmFwLmRldXJsKHZhbHVlKSkgfHwgdmFsdWU7XG4gICAgfSkoLTEpO1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5nZXRhdHRyLnN0cm9rZVwiLCBmdW5jdGlvbiAoaW50ZXJuYWwpIHtcbiAgICAgIGlmIChpbnRlcm5hbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGV2ZS5zdG9wKCk7XG4gICAgICB2YXIgdmFsdWUgPSBldmUoXCJzbmFwLnV0aWwuZ2V0YXR0ci5zdHJva2VcIiwgdGhpcywgdHJ1ZSkuZmlyc3REZWZpbmVkKCk7XG4gICAgICByZXR1cm4gU25hcChTbmFwLmRldXJsKHZhbHVlKSkgfHwgdmFsdWU7XG4gICAgfSkoLTEpO1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5nZXRhdHRyLnZpZXdCb3hcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgZXZlLnN0b3AoKTtcbiAgICAgIHZhciB2YiA9ICQodGhpcy5ub2RlLCBcInZpZXdCb3hcIik7XG5cbiAgICAgIGlmICh2Yikge1xuICAgICAgICB2YiA9IHZiLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICAgIHJldHVybiBTbmFwLl8uYm94KCt2YlswXSwgK3ZiWzFdLCArdmJbMl0sICt2YlszXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSkoLTEpO1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5nZXRhdHRyLnBvaW50c1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcCA9ICQodGhpcy5ub2RlLCBcInBvaW50c1wiKTtcbiAgICAgIGV2ZS5zdG9wKCk7XG5cbiAgICAgIGlmIChwKSB7XG4gICAgICAgIHJldHVybiBwLnNwbGl0KHNlcGFyYXRvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSkoLTEpO1xuICAgIGV2ZS5vbihcInNuYXAudXRpbC5nZXRhdHRyLnBhdGhcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHAgPSAkKHRoaXMubm9kZSwgXCJkXCIpO1xuICAgICAgZXZlLnN0b3AoKTtcbiAgICAgIHJldHVybiBwO1xuICAgIH0pKC0xKTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuZ2V0YXR0ci5jbGFzc1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5ub2RlLmNsYXNzTmFtZS5iYXNlVmFsO1xuICAgIH0pKC0xKTtcblxuICAgIGZ1bmN0aW9uIGdldEZvbnRTaXplKCkge1xuICAgICAgZXZlLnN0b3AoKTtcbiAgICAgIHJldHVybiB0aGlzLm5vZGUuc3R5bGUuZm9udFNpemU7XG4gICAgfVxuXG4gICAgZXZlLm9uKFwic25hcC51dGlsLmdldGF0dHIuZm9udFNpemVcIiwgZ2V0Rm9udFNpemUpKC0xKTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuZ2V0YXR0ci5mb250LXNpemVcIiwgZ2V0Rm9udFNpemUpKC0xKTtcbiAgfSk7IC8vIENvcHlyaWdodCAoYykgMjAxNCBBZG9iZSBTeXN0ZW1zIEluY29ycG9yYXRlZC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAgLy9cbiAgLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAvLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgLy9cbiAgLy8gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gIC8vXG4gIC8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICAvLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAvLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuICBTbmFwLnBsdWdpbihmdW5jdGlvbiAoU25hcCwgRWxlbWVudCwgUGFwZXIsIGdsb2IsIEZyYWdtZW50KSB7XG4gICAgdmFyIHJnTm90U3BhY2UgPSAvXFxTKy9nLFxuICAgICAgICByZ0JhZFNwYWNlID0gL1tcXHRcXHJcXG5cXGZdL2csXG4gICAgICAgIHJnVHJpbSA9IC8oXlxccyt8XFxzKyQpL2csXG4gICAgICAgIFN0ciA9IFN0cmluZyxcbiAgICAgICAgZWxwcm90byA9IEVsZW1lbnQucHJvdG90eXBlO1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmFkZENsYXNzXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGdpdmVuIGNsYXNzIG5hbWUgb3IgbGlzdCBvZiBjbGFzcyBuYW1lcyB0byB0aGUgZWxlbWVudC5cbiAgICAgLSB2YWx1ZSAoc3RyaW5nKSBjbGFzcyBuYW1lIG9yIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzIG5hbWVzXG4gICAgICoqXG4gICAgID0gKEVsZW1lbnQpIG9yaWdpbmFsIGVsZW1lbnQuXG4gICAgXFwqL1xuXG4gICAgZWxwcm90by5hZGRDbGFzcyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgdmFyIGNsYXNzZXMgPSBTdHIodmFsdWUgfHwgXCJcIikubWF0Y2gocmdOb3RTcGFjZSkgfHwgW10sXG4gICAgICAgICAgZWxlbSA9IHRoaXMubm9kZSxcbiAgICAgICAgICBjbGFzc05hbWUgPSBlbGVtLmNsYXNzTmFtZS5iYXNlVmFsLFxuICAgICAgICAgIGN1ckNsYXNzZXMgPSBjbGFzc05hbWUubWF0Y2gocmdOb3RTcGFjZSkgfHwgW10sXG4gICAgICAgICAgaixcbiAgICAgICAgICBwb3MsXG4gICAgICAgICAgY2xhenosXG4gICAgICAgICAgZmluYWxWYWx1ZTtcblxuICAgICAgaWYgKGNsYXNzZXMubGVuZ3RoKSB7XG4gICAgICAgIGogPSAwO1xuXG4gICAgICAgIHdoaWxlIChjbGF6eiA9IGNsYXNzZXNbaisrXSkge1xuICAgICAgICAgIHBvcyA9IGN1ckNsYXNzZXMuaW5kZXhPZihjbGF6eik7XG5cbiAgICAgICAgICBpZiAoIX5wb3MpIHtcbiAgICAgICAgICAgIGN1ckNsYXNzZXMucHVzaChjbGF6eik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZmluYWxWYWx1ZSA9IGN1ckNsYXNzZXMuam9pbihcIiBcIik7XG5cbiAgICAgICAgaWYgKGNsYXNzTmFtZSAhPSBmaW5hbFZhbHVlKSB7XG4gICAgICAgICAgZWxlbS5jbGFzc05hbWUuYmFzZVZhbCA9IGZpbmFsVmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5yZW1vdmVDbGFzc1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBnaXZlbiBjbGFzcyBuYW1lIG9yIGxpc3Qgb2YgY2xhc3MgbmFtZXMgZnJvbSB0aGUgZWxlbWVudC5cbiAgICAgLSB2YWx1ZSAoc3RyaW5nKSBjbGFzcyBuYW1lIG9yIHNwYWNlIHNlcGFyYXRlZCBsaXN0IG9mIGNsYXNzIG5hbWVzXG4gICAgICoqXG4gICAgID0gKEVsZW1lbnQpIG9yaWdpbmFsIGVsZW1lbnQuXG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgY2xhc3NlcyA9IFN0cih2YWx1ZSB8fCBcIlwiKS5tYXRjaChyZ05vdFNwYWNlKSB8fCBbXSxcbiAgICAgICAgICBlbGVtID0gdGhpcy5ub2RlLFxuICAgICAgICAgIGNsYXNzTmFtZSA9IGVsZW0uY2xhc3NOYW1lLmJhc2VWYWwsXG4gICAgICAgICAgY3VyQ2xhc3NlcyA9IGNsYXNzTmFtZS5tYXRjaChyZ05vdFNwYWNlKSB8fCBbXSxcbiAgICAgICAgICBqLFxuICAgICAgICAgIHBvcyxcbiAgICAgICAgICBjbGF6eixcbiAgICAgICAgICBmaW5hbFZhbHVlO1xuXG4gICAgICBpZiAoY3VyQ2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgICAgaiA9IDA7XG5cbiAgICAgICAgd2hpbGUgKGNsYXp6ID0gY2xhc3Nlc1tqKytdKSB7XG4gICAgICAgICAgcG9zID0gY3VyQ2xhc3Nlcy5pbmRleE9mKGNsYXp6KTtcblxuICAgICAgICAgIGlmICh+cG9zKSB7XG4gICAgICAgICAgICBjdXJDbGFzc2VzLnNwbGljZShwb3MsIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZpbmFsVmFsdWUgPSBjdXJDbGFzc2VzLmpvaW4oXCIgXCIpO1xuXG4gICAgICAgIGlmIChjbGFzc05hbWUgIT0gZmluYWxWYWx1ZSkge1xuICAgICAgICAgIGVsZW0uY2xhc3NOYW1lLmJhc2VWYWwgPSBmaW5hbFZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuaGFzQ2xhc3NcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENoZWNrcyBpZiB0aGUgZWxlbWVudCBoYXMgYSBnaXZlbiBjbGFzcyBuYW1lIGluIHRoZSBsaXN0IG9mIGNsYXNzIG5hbWVzIGFwcGxpZWQgdG8gaXQuXG4gICAgIC0gdmFsdWUgKHN0cmluZykgY2xhc3MgbmFtZVxuICAgICAqKlxuICAgICA9IChib29sZWFuKSBgdHJ1ZWAgaWYgdGhlIGVsZW1lbnQgaGFzIGdpdmVuIGNsYXNzXG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLmhhc0NsYXNzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgZWxlbSA9IHRoaXMubm9kZSxcbiAgICAgICAgICBjbGFzc05hbWUgPSBlbGVtLmNsYXNzTmFtZS5iYXNlVmFsLFxuICAgICAgICAgIGN1ckNsYXNzZXMgPSBjbGFzc05hbWUubWF0Y2gocmdOb3RTcGFjZSkgfHwgW107XG4gICAgICByZXR1cm4gISF+Y3VyQ2xhc3Nlcy5pbmRleE9mKHZhbHVlKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnRvZ2dsZUNsYXNzXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGQgb3IgcmVtb3ZlIG9uZSBvciBtb3JlIGNsYXNzZXMgZnJvbSB0aGUgZWxlbWVudCwgZGVwZW5kaW5nIG9uIGVpdGhlclxuICAgICAqIHRoZSBjbGFzc+KAmXMgcHJlc2VuY2Ugb3IgdGhlIHZhbHVlIG9mIHRoZSBgZmxhZ2AgYXJndW1lbnQuXG4gICAgIC0gdmFsdWUgKHN0cmluZykgY2xhc3MgbmFtZSBvciBzcGFjZSBzZXBhcmF0ZWQgbGlzdCBvZiBjbGFzcyBuYW1lc1xuICAgICAtIGZsYWcgKGJvb2xlYW4pIHZhbHVlIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBjbGFzcyBzaG91bGQgYmUgYWRkZWQgb3IgcmVtb3ZlZFxuICAgICAqKlxuICAgICA9IChFbGVtZW50KSBvcmlnaW5hbCBlbGVtZW50LlxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by50b2dnbGVDbGFzcyA9IGZ1bmN0aW9uICh2YWx1ZSwgZmxhZykge1xuICAgICAgaWYgKGZsYWcgIT0gbnVsbCkge1xuICAgICAgICBpZiAoZmxhZykge1xuICAgICAgICAgIHJldHVybiB0aGlzLmFkZENsYXNzKHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmVDbGFzcyh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGNsYXNzZXMgPSAodmFsdWUgfHwgXCJcIikubWF0Y2gocmdOb3RTcGFjZSkgfHwgW10sXG4gICAgICAgICAgZWxlbSA9IHRoaXMubm9kZSxcbiAgICAgICAgICBjbGFzc05hbWUgPSBlbGVtLmNsYXNzTmFtZS5iYXNlVmFsLFxuICAgICAgICAgIGN1ckNsYXNzZXMgPSBjbGFzc05hbWUubWF0Y2gocmdOb3RTcGFjZSkgfHwgW10sXG4gICAgICAgICAgaixcbiAgICAgICAgICBwb3MsXG4gICAgICAgICAgY2xhenosXG4gICAgICAgICAgZmluYWxWYWx1ZTtcbiAgICAgIGogPSAwO1xuXG4gICAgICB3aGlsZSAoY2xhenogPSBjbGFzc2VzW2orK10pIHtcbiAgICAgICAgcG9zID0gY3VyQ2xhc3Nlcy5pbmRleE9mKGNsYXp6KTtcblxuICAgICAgICBpZiAofnBvcykge1xuICAgICAgICAgIGN1ckNsYXNzZXMuc3BsaWNlKHBvcywgMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY3VyQ2xhc3Nlcy5wdXNoKGNsYXp6KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmaW5hbFZhbHVlID0gY3VyQ2xhc3Nlcy5qb2luKFwiIFwiKTtcblxuICAgICAgaWYgKGNsYXNzTmFtZSAhPSBmaW5hbFZhbHVlKSB7XG4gICAgICAgIGVsZW0uY2xhc3NOYW1lLmJhc2VWYWwgPSBmaW5hbFZhbHVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICB9KTsgLy8gQ29weXJpZ2h0IChjKSAyMDEzIEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAvL1xuICAvLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAvLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIC8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAvL1xuICAvLyBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgLy9cbiAgLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAvLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gIC8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAvLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gIC8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4gIFNuYXAucGx1Z2luKGZ1bmN0aW9uIChTbmFwLCBFbGVtZW50LCBQYXBlciwgZ2xvYiwgRnJhZ21lbnQpIHtcbiAgICB2YXIgb3BlcmF0b3JzID0ge1xuICAgICAgXCIrXCI6IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHJldHVybiB4ICsgeTtcbiAgICAgIH0sXG4gICAgICBcIi1cIjogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgcmV0dXJuIHggLSB5O1xuICAgICAgfSxcbiAgICAgIFwiL1wiOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICByZXR1cm4geCAvIHk7XG4gICAgICB9LFxuICAgICAgXCIqXCI6IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgIHJldHVybiB4ICogeTtcbiAgICAgIH1cbiAgICB9LFxuICAgICAgICBTdHIgPSBTdHJpbmcsXG4gICAgICAgIHJlVW5pdCA9IC9bYS16XSskL2ksXG4gICAgICAgIHJlQWRkb24gPSAvXlxccyooWytcXC1cXC8qXSlcXHMqPVxccyooW1xcZC5lRStcXC1dKylcXHMqKFteXFxkXFxzXSspP1xccyokLztcblxuICAgIGZ1bmN0aW9uIGdldE51bWJlcih2YWwpIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VW5pdCh1bml0KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICByZXR1cm4gK3ZhbC50b0ZpeGVkKDMpICsgdW5pdDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZXZlLm9uKFwic25hcC51dGlsLmF0dHJcIiwgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgdmFyIHBsdXMgPSBTdHIodmFsKS5tYXRjaChyZUFkZG9uKTtcblxuICAgICAgaWYgKHBsdXMpIHtcbiAgICAgICAgdmFyIGV2bnQgPSBldmUubnQoKSxcbiAgICAgICAgICAgIG5hbWUgPSBldm50LnN1YnN0cmluZyhldm50Lmxhc3RJbmRleE9mKFwiLlwiKSArIDEpLFxuICAgICAgICAgICAgYSA9IHRoaXMuYXR0cihuYW1lKSxcbiAgICAgICAgICAgIGF0ciA9IHt9O1xuICAgICAgICBldmUuc3RvcCgpO1xuICAgICAgICB2YXIgdW5pdCA9IHBsdXNbM10gfHwgXCJcIixcbiAgICAgICAgICAgIGFVbml0ID0gYS5tYXRjaChyZVVuaXQpLFxuICAgICAgICAgICAgb3AgPSBvcGVyYXRvcnNbcGx1c1sxXV07XG5cbiAgICAgICAgaWYgKGFVbml0ICYmIGFVbml0ID09IHVuaXQpIHtcbiAgICAgICAgICB2YWwgPSBvcChwYXJzZUZsb2F0KGEpLCArcGx1c1syXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYSA9IHRoaXMuYXNQWChuYW1lKTtcbiAgICAgICAgICB2YWwgPSBvcCh0aGlzLmFzUFgobmFtZSksIHRoaXMuYXNQWChuYW1lLCBwbHVzWzJdICsgdW5pdCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzTmFOKGEpIHx8IGlzTmFOKHZhbCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhdHJbbmFtZV0gPSB2YWw7XG4gICAgICAgIHRoaXMuYXR0cihhdHIpO1xuICAgICAgfVxuICAgIH0pKC0xMCk7XG4gICAgZXZlLm9uKFwic25hcC51dGlsLmVxdWFsXCIsIGZ1bmN0aW9uIChuYW1lLCBiKSB7XG4gICAgICB2YXIgQSxcbiAgICAgICAgICBCLFxuICAgICAgICAgIGEgPSBTdHIodGhpcy5hdHRyKG5hbWUpIHx8IFwiXCIpLFxuICAgICAgICAgIGVsID0gdGhpcyxcbiAgICAgICAgICBicGx1cyA9IFN0cihiKS5tYXRjaChyZUFkZG9uKTtcblxuICAgICAgaWYgKGJwbHVzKSB7XG4gICAgICAgIGV2ZS5zdG9wKCk7XG4gICAgICAgIHZhciB1bml0ID0gYnBsdXNbM10gfHwgXCJcIixcbiAgICAgICAgICAgIGFVbml0ID0gYS5tYXRjaChyZVVuaXQpLFxuICAgICAgICAgICAgb3AgPSBvcGVyYXRvcnNbYnBsdXNbMV1dO1xuXG4gICAgICAgIGlmIChhVW5pdCAmJiBhVW5pdCA9PSB1bml0KSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZyb206IHBhcnNlRmxvYXQoYSksXG4gICAgICAgICAgICB0bzogb3AocGFyc2VGbG9hdChhKSwgK2JwbHVzWzJdKSxcbiAgICAgICAgICAgIGY6IGdldFVuaXQoYVVuaXQpXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhID0gdGhpcy5hc1BYKG5hbWUpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmcm9tOiBhLFxuICAgICAgICAgICAgdG86IG9wKGEsIHRoaXMuYXNQWChuYW1lLCBicGx1c1syXSArIHVuaXQpKSxcbiAgICAgICAgICAgIGY6IGdldE51bWJlclxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSgtMTApO1xuICB9KTsgLy8gQ29weXJpZ2h0IChjKSAyMDEzIEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAvL1xuICAvLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAvLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIC8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAvL1xuICAvLyBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgLy9cbiAgLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAvLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gIC8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAvLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gIC8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4gIFNuYXAucGx1Z2luKGZ1bmN0aW9uIChTbmFwLCBFbGVtZW50LCBQYXBlciwgZ2xvYiwgRnJhZ21lbnQpIHtcbiAgICB2YXIgcHJvdG8gPSBQYXBlci5wcm90b3R5cGUsXG4gICAgICAgIGlzID0gU25hcC5pcztcbiAgICAvKlxcXG4gICAgICogUGFwZXIucmVjdFxuICAgICBbIG1ldGhvZCBdXG4gICAgICpcbiAgICAgKiBEcmF3cyBhIHJlY3RhbmdsZVxuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSB0b3AgbGVmdCBjb3JuZXJcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgdG9wIGxlZnQgY29ybmVyXG4gICAgIC0gd2lkdGggKG51bWJlcikgd2lkdGhcbiAgICAgLSBoZWlnaHQgKG51bWJlcikgaGVpZ2h0XG4gICAgIC0gcnggKG51bWJlcikgI29wdGlvbmFsIGhvcml6b250YWwgcmFkaXVzIGZvciByb3VuZGVkIGNvcm5lcnMsIGRlZmF1bHQgaXMgMFxuICAgICAtIHJ5IChudW1iZXIpICNvcHRpb25hbCB2ZXJ0aWNhbCByYWRpdXMgZm9yIHJvdW5kZWQgY29ybmVycywgZGVmYXVsdCBpcyByeCBvciAwXG4gICAgID0gKG9iamVjdCkgdGhlIGByZWN0YCBlbGVtZW50XG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCAvLyByZWd1bGFyIHJlY3RhbmdsZVxuICAgICB8IHZhciBjID0gcGFwZXIucmVjdCgxMCwgMTAsIDUwLCA1MCk7XG4gICAgIHwgLy8gcmVjdGFuZ2xlIHdpdGggcm91bmRlZCBjb3JuZXJzXG4gICAgIHwgdmFyIGMgPSBwYXBlci5yZWN0KDQwLCA0MCwgNTAsIDUwLCAxMCk7XG4gICAgXFwqL1xuXG4gICAgcHJvdG8ucmVjdCA9IGZ1bmN0aW9uICh4LCB5LCB3LCBoLCByeCwgcnkpIHtcbiAgICAgIHZhciBhdHRyO1xuXG4gICAgICBpZiAocnkgPT0gbnVsbCkge1xuICAgICAgICByeSA9IHJ4O1xuICAgICAgfVxuXG4gICAgICBpZiAoaXMoeCwgXCJvYmplY3RcIikgJiYgeCA9PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG4gICAgICAgIGF0dHIgPSB4O1xuICAgICAgfSBlbHNlIGlmICh4ICE9IG51bGwpIHtcbiAgICAgICAgYXR0ciA9IHtcbiAgICAgICAgICB4OiB4LFxuICAgICAgICAgIHk6IHksXG4gICAgICAgICAgd2lkdGg6IHcsXG4gICAgICAgICAgaGVpZ2h0OiBoXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHJ4ICE9IG51bGwpIHtcbiAgICAgICAgICBhdHRyLnJ4ID0gcng7XG4gICAgICAgICAgYXR0ci5yeSA9IHJ5O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVsKFwicmVjdFwiLCBhdHRyKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5jaXJjbGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIERyYXdzIGEgY2lyY2xlXG4gICAgICoqXG4gICAgIC0geCAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIGNlbnRyZVxuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBjZW50cmVcbiAgICAgLSByIChudW1iZXIpIHJhZGl1c1xuICAgICA9IChvYmplY3QpIHRoZSBgY2lyY2xlYCBlbGVtZW50XG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgYyA9IHBhcGVyLmNpcmNsZSg1MCwgNTAsIDQwKTtcbiAgICBcXCovXG5cblxuICAgIHByb3RvLmNpcmNsZSA9IGZ1bmN0aW9uIChjeCwgY3ksIHIpIHtcbiAgICAgIHZhciBhdHRyO1xuXG4gICAgICBpZiAoaXMoY3gsIFwib2JqZWN0XCIpICYmIGN4ID09IFwiW29iamVjdCBPYmplY3RdXCIpIHtcbiAgICAgICAgYXR0ciA9IGN4O1xuICAgICAgfSBlbHNlIGlmIChjeCAhPSBudWxsKSB7XG4gICAgICAgIGF0dHIgPSB7XG4gICAgICAgICAgY3g6IGN4LFxuICAgICAgICAgIGN5OiBjeSxcbiAgICAgICAgICByOiByXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVsKFwiY2lyY2xlXCIsIGF0dHIpO1xuICAgIH07XG5cbiAgICB2YXIgcHJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGZ1bmN0aW9uIG9uZXJyb3IoKSB7XG4gICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzcmMsIGYpIHtcbiAgICAgICAgdmFyIGltZyA9IGdsb2IuZG9jLmNyZWF0ZUVsZW1lbnQoXCJpbWdcIiksXG4gICAgICAgICAgICBib2R5ID0gZ2xvYi5kb2MuYm9keTtcbiAgICAgICAgaW1nLnN0eWxlLmNzc1RleHQgPSBcInBvc2l0aW9uOmFic29sdXRlO2xlZnQ6LTk5OTllbTt0b3A6LTk5OTllbVwiO1xuXG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZi5jYWxsKGltZyk7XG4gICAgICAgICAgaW1nLm9ubG9hZCA9IGltZy5vbmVycm9yID0gbnVsbDtcbiAgICAgICAgICBib2R5LnJlbW92ZUNoaWxkKGltZyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaW1nLm9uZXJyb3IgPSBvbmVycm9yO1xuICAgICAgICBib2R5LmFwcGVuZENoaWxkKGltZyk7XG4gICAgICAgIGltZy5zcmMgPSBzcmM7XG4gICAgICB9O1xuICAgIH0oKTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuaW1hZ2VcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFBsYWNlcyBhbiBpbWFnZSBvbiB0aGUgc3VyZmFjZVxuICAgICAqKlxuICAgICAtIHNyYyAoc3RyaW5nKSBVUkkgb2YgdGhlIHNvdXJjZSBpbWFnZVxuICAgICAtIHggKG51bWJlcikgeCBvZmZzZXQgcG9zaXRpb25cbiAgICAgLSB5IChudW1iZXIpIHkgb2Zmc2V0IHBvc2l0aW9uXG4gICAgIC0gd2lkdGggKG51bWJlcikgd2lkdGggb2YgdGhlIGltYWdlXG4gICAgIC0gaGVpZ2h0IChudW1iZXIpIGhlaWdodCBvZiB0aGUgaW1hZ2VcbiAgICAgPSAob2JqZWN0KSB0aGUgYGltYWdlYCBlbGVtZW50XG4gICAgICogb3JcbiAgICAgPSAob2JqZWN0KSBTbmFwIGVsZW1lbnQgb2JqZWN0IHdpdGggdHlwZSBgaW1hZ2VgXG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgYyA9IHBhcGVyLmltYWdlKFwiYXBwbGUucG5nXCIsIDEwLCAxMCwgODAsIDgwKTtcbiAgICBcXCovXG5cblxuICAgIHByb3RvLmltYWdlID0gZnVuY3Rpb24gKHNyYywgeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgdmFyIGVsID0gdGhpcy5lbChcImltYWdlXCIpO1xuXG4gICAgICBpZiAoaXMoc3JjLCBcIm9iamVjdFwiKSAmJiBcInNyY1wiIGluIHNyYykge1xuICAgICAgICBlbC5hdHRyKHNyYyk7XG4gICAgICB9IGVsc2UgaWYgKHNyYyAhPSBudWxsKSB7XG4gICAgICAgIHZhciBzZXQgPSB7XG4gICAgICAgICAgXCJ4bGluazpocmVmXCI6IHNyYyxcbiAgICAgICAgICBwcmVzZXJ2ZUFzcGVjdFJhdGlvOiBcIm5vbmVcIlxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh4ICE9IG51bGwgJiYgeSAhPSBudWxsKSB7XG4gICAgICAgICAgc2V0LnggPSB4O1xuICAgICAgICAgIHNldC55ID0geTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aWR0aCAhPSBudWxsICYmIGhlaWdodCAhPSBudWxsKSB7XG4gICAgICAgICAgc2V0LndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgc2V0LmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcmVsb2FkKHNyYywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgU25hcC5fLiQoZWwubm9kZSwge1xuICAgICAgICAgICAgICB3aWR0aDogdGhpcy5vZmZzZXRXaWR0aCxcbiAgICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLm9mZnNldEhlaWdodFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBTbmFwLl8uJChlbC5ub2RlLCBzZXQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZWw7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuZWxsaXBzZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRHJhd3MgYW4gZWxsaXBzZVxuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBjZW50cmVcbiAgICAgLSB5IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgY2VudHJlXG4gICAgIC0gcnggKG51bWJlcikgaG9yaXpvbnRhbCByYWRpdXNcbiAgICAgLSByeSAobnVtYmVyKSB2ZXJ0aWNhbCByYWRpdXNcbiAgICAgPSAob2JqZWN0KSB0aGUgYGVsbGlwc2VgIGVsZW1lbnRcbiAgICAgKipcbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciBjID0gcGFwZXIuZWxsaXBzZSg1MCwgNTAsIDQwLCAyMCk7XG4gICAgXFwqL1xuXG5cbiAgICBwcm90by5lbGxpcHNlID0gZnVuY3Rpb24gKGN4LCBjeSwgcngsIHJ5KSB7XG4gICAgICB2YXIgYXR0cjtcblxuICAgICAgaWYgKGlzKGN4LCBcIm9iamVjdFwiKSAmJiBjeCA9PSBcIltvYmplY3QgT2JqZWN0XVwiKSB7XG4gICAgICAgIGF0dHIgPSBjeDtcbiAgICAgIH0gZWxzZSBpZiAoY3ggIT0gbnVsbCkge1xuICAgICAgICBhdHRyID0ge1xuICAgICAgICAgIGN4OiBjeCxcbiAgICAgICAgICBjeTogY3ksXG4gICAgICAgICAgcng6IHJ4LFxuICAgICAgICAgIHJ5OiByeVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5lbChcImVsbGlwc2VcIiwgYXR0cik7XG4gICAgfTsgLy8gU0lFUlJBIFBhcGVyLnBhdGgoKTogVW5jbGVhciBmcm9tIHRoZSBsaW5rIHdoYXQgYSBDYXRtdWxsLVJvbSBjdXJ2ZXRvIGlzLCBhbmQgd2h5IGl0IHdvdWxkIG1ha2UgbGlmZSBhbnkgZWFzaWVyLlxuXG4gICAgLypcXFxuICAgICAqIFBhcGVyLnBhdGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYSBgPHBhdGg+YCBlbGVtZW50IHVzaW5nIHRoZSBnaXZlbiBzdHJpbmcgYXMgdGhlIHBhdGgncyBkZWZpbml0aW9uXG4gICAgIC0gcGF0aFN0cmluZyAoc3RyaW5nKSAjb3B0aW9uYWwgcGF0aCBzdHJpbmcgaW4gU1ZHIGZvcm1hdFxuICAgICAqIFBhdGggc3RyaW5nIGNvbnNpc3RzIG9mIG9uZS1sZXR0ZXIgY29tbWFuZHMsIGZvbGxvd2VkIGJ5IGNvbW1hIHNlcHJhcmF0ZWQgYXJndW1lbnRzIGluIG51bWVyaWNhbCBmb3JtLiBFeGFtcGxlOlxuICAgICB8IFwiTTEwLDIwTDMwLDQwXCJcbiAgICAgKiBUaGlzIGV4YW1wbGUgZmVhdHVyZXMgdHdvIGNvbW1hbmRzOiBgTWAsIHdpdGggYXJndW1lbnRzIGAoMTAsIDIwKWAgYW5kIGBMYCB3aXRoIGFyZ3VtZW50cyBgKDMwLCA0MClgLiBVcHBlcmNhc2UgbGV0dGVyIGNvbW1hbmRzIGV4cHJlc3MgY29vcmRpbmF0ZXMgaW4gYWJzb2x1dGUgdGVybXMsIHdoaWxlIGxvd2VyY2FzZSBjb21tYW5kcyBleHByZXNzIHRoZW0gaW4gcmVsYXRpdmUgdGVybXMgZnJvbSB0aGUgbW9zdCByZWNlbnRseSBkZWNsYXJlZCBjb29yZGluYXRlcy5cbiAgICAgKlxuICAgICAjIDxwPkhlcmUgaXMgc2hvcnQgbGlzdCBvZiBjb21tYW5kcyBhdmFpbGFibGUsIGZvciBtb3JlIGRldGFpbHMgc2VlIDxhIGhyZWY9XCJodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvcGF0aHMuaHRtbCNQYXRoRGF0YVwiIHRpdGxlPVwiRGV0YWlscyBvZiBhIHBhdGgncyBkYXRhIGF0dHJpYnV0ZSdzIGZvcm1hdCBhcmUgZGVzY3JpYmVkIGluIHRoZSBTVkcgc3BlY2lmaWNhdGlvbi5cIj5TVkcgcGF0aCBzdHJpbmcgZm9ybWF0PC9hPiBvciA8YSBocmVmPVwiaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vU1ZHL1R1dG9yaWFsL1BhdGhzXCI+YXJ0aWNsZSBhYm91dCBwYXRoIHN0cmluZ3MgYXQgTUROPC9hPi48L3A+XG4gICAgICMgPHRhYmxlPjx0aGVhZD48dHI+PHRoPkNvbW1hbmQ8L3RoPjx0aD5OYW1lPC90aD48dGg+UGFyYW1ldGVyczwvdGg+PC90cj48L3RoZWFkPjx0Ym9keT5cbiAgICAgIyA8dHI+PHRkPk08L3RkPjx0ZD5tb3ZldG88L3RkPjx0ZD4oeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5aPC90ZD48dGQ+Y2xvc2VwYXRoPC90ZD48dGQ+KG5vbmUpPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+TDwvdGQ+PHRkPmxpbmV0bzwvdGQ+PHRkPih4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPkg8L3RkPjx0ZD5ob3Jpem9udGFsIGxpbmV0bzwvdGQ+PHRkPngrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+VjwvdGQ+PHRkPnZlcnRpY2FsIGxpbmV0bzwvdGQ+PHRkPnkrPC90ZD48L3RyPlxuICAgICAjIDx0cj48dGQ+QzwvdGQ+PHRkPmN1cnZldG88L3RkPjx0ZD4oeDEgeTEgeDIgeTIgeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5TPC90ZD48dGQ+c21vb3RoIGN1cnZldG88L3RkPjx0ZD4oeDIgeTIgeCB5KSs8L3RkPjwvdHI+XG4gICAgICMgPHRyPjx0ZD5RPC90ZD48dGQ+cXVhZHJhdGljIELDqXppZXIgY3VydmV0bzwvdGQ+PHRkPih4MSB5MSB4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPlQ8L3RkPjx0ZD5zbW9vdGggcXVhZHJhdGljIELDqXppZXIgY3VydmV0bzwvdGQ+PHRkPih4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPkE8L3RkPjx0ZD5lbGxpcHRpY2FsIGFyYzwvdGQ+PHRkPihyeCByeSB4LWF4aXMtcm90YXRpb24gbGFyZ2UtYXJjLWZsYWcgc3dlZXAtZmxhZyB4IHkpKzwvdGQ+PC90cj5cbiAgICAgIyA8dHI+PHRkPlI8L3RkPjx0ZD48YSBocmVmPVwiaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DYXRtdWxs4oCTUm9tX3NwbGluZSNDYXRtdWxsLkUyLjgwLjkzUm9tX3NwbGluZVwiPkNhdG11bGwtUm9tIGN1cnZldG88L2E+KjwvdGQ+PHRkPngxIHkxICh4IHkpKzwvdGQ+PC90cj48L3Rib2R5PjwvdGFibGU+XG4gICAgICogKiBfQ2F0bXVsbC1Sb20gY3VydmV0b18gaXMgYSBub3Qgc3RhbmRhcmQgU1ZHIGNvbW1hbmQgYW5kIGFkZGVkIHRvIG1ha2UgbGlmZSBlYXNpZXIuXG4gICAgICogTm90ZTogdGhlcmUgaXMgYSBzcGVjaWFsIGNhc2Ugd2hlbiBhIHBhdGggY29uc2lzdHMgb2Ygb25seSB0aHJlZSBjb21tYW5kczogYE0xMCwxMFLigKZ6YC4gSW4gdGhpcyBjYXNlIHRoZSBwYXRoIGNvbm5lY3RzIGJhY2sgdG8gaXRzIHN0YXJ0aW5nIHBvaW50LlxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIGMgPSBwYXBlci5wYXRoKFwiTTEwIDEwTDkwIDkwXCIpO1xuICAgICB8IC8vIGRyYXcgYSBkaWFnb25hbCBsaW5lOlxuICAgICB8IC8vIG1vdmUgdG8gMTAsMTAsIGxpbmUgdG8gOTAsOTBcbiAgICBcXCovXG5cblxuICAgIHByb3RvLnBhdGggPSBmdW5jdGlvbiAoZCkge1xuICAgICAgdmFyIGF0dHI7XG5cbiAgICAgIGlmIChpcyhkLCBcIm9iamVjdFwiKSAmJiAhaXMoZCwgXCJhcnJheVwiKSkge1xuICAgICAgICBhdHRyID0gZDtcbiAgICAgIH0gZWxzZSBpZiAoZCkge1xuICAgICAgICBhdHRyID0ge1xuICAgICAgICAgIGQ6IGRcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZWwoXCJwYXRoXCIsIGF0dHIpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLmdcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYSBncm91cCBlbGVtZW50XG4gICAgICoqXG4gICAgIC0gdmFyYXJncyAo4oCmKSAjb3B0aW9uYWwgZWxlbWVudHMgdG8gbmVzdCB3aXRoaW4gdGhlIGdyb3VwXG4gICAgID0gKG9iamVjdCkgdGhlIGBnYCBlbGVtZW50XG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgYzEgPSBwYXBlci5jaXJjbGUoKSxcbiAgICAgfCAgICAgYzIgPSBwYXBlci5yZWN0KCksXG4gICAgIHwgICAgIGcgPSBwYXBlci5nKGMyLCBjMSk7IC8vIG5vdGUgdGhhdCB0aGUgb3JkZXIgb2YgZWxlbWVudHMgaXMgZGlmZmVyZW50XG4gICAgICogb3JcbiAgICAgfCB2YXIgYzEgPSBwYXBlci5jaXJjbGUoKSxcbiAgICAgfCAgICAgYzIgPSBwYXBlci5yZWN0KCksXG4gICAgIHwgICAgIGcgPSBwYXBlci5nKCk7XG4gICAgIHwgZy5hZGQoYzIsIGMxKTtcbiAgICBcXCovXG5cbiAgICAvKlxcXG4gICAgICogUGFwZXIuZ3JvdXBcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNlZSBAUGFwZXIuZ1xuICAgIFxcKi9cblxuXG4gICAgcHJvdG8uZ3JvdXAgPSBwcm90by5nID0gZnVuY3Rpb24gKGZpcnN0KSB7XG4gICAgICB2YXIgYXR0cixcbiAgICAgICAgICBlbCA9IHRoaXMuZWwoXCJnXCIpO1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxICYmIGZpcnN0ICYmICFmaXJzdC50eXBlKSB7XG4gICAgICAgIGVsLmF0dHIoZmlyc3QpO1xuICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGVsLmFkZChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVsO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnN2Z1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQ3JlYXRlcyBhIG5lc3RlZCBTVkcgZWxlbWVudC5cbiAgICAgLSB4IChudW1iZXIpIEBvcHRpb25hbCBYIG9mIHRoZSBlbGVtZW50XG4gICAgIC0geSAobnVtYmVyKSBAb3B0aW9uYWwgWSBvZiB0aGUgZWxlbWVudFxuICAgICAtIHdpZHRoIChudW1iZXIpIEBvcHRpb25hbCB3aWR0aCBvZiB0aGUgZWxlbWVudFxuICAgICAtIGhlaWdodCAobnVtYmVyKSBAb3B0aW9uYWwgaGVpZ2h0IG9mIHRoZSBlbGVtZW50XG4gICAgIC0gdmJ4IChudW1iZXIpIEBvcHRpb25hbCB2aWV3Ym94IFhcbiAgICAgLSB2YnkgKG51bWJlcikgQG9wdGlvbmFsIHZpZXdib3ggWVxuICAgICAtIHZidyAobnVtYmVyKSBAb3B0aW9uYWwgdmlld2JveCB3aWR0aFxuICAgICAtIHZiaCAobnVtYmVyKSBAb3B0aW9uYWwgdmlld2JveCBoZWlnaHRcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSB0aGUgYHN2Z2AgZWxlbWVudFxuICAgICAqKlxuICAgIFxcKi9cblxuXG4gICAgcHJvdG8uc3ZnID0gZnVuY3Rpb24gKHgsIHksIHdpZHRoLCBoZWlnaHQsIHZieCwgdmJ5LCB2YncsIHZiaCkge1xuICAgICAgdmFyIGF0dHJzID0ge307XG5cbiAgICAgIGlmIChpcyh4LCBcIm9iamVjdFwiKSAmJiB5ID09IG51bGwpIHtcbiAgICAgICAgYXR0cnMgPSB4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHggIT0gbnVsbCkge1xuICAgICAgICAgIGF0dHJzLnggPSB4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHkgIT0gbnVsbCkge1xuICAgICAgICAgIGF0dHJzLnkgPSB5O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpZHRoICE9IG51bGwpIHtcbiAgICAgICAgICBhdHRycy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhlaWdodCAhPSBudWxsKSB7XG4gICAgICAgICAgYXR0cnMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZieCAhPSBudWxsICYmIHZieSAhPSBudWxsICYmIHZidyAhPSBudWxsICYmIHZiaCAhPSBudWxsKSB7XG4gICAgICAgICAgYXR0cnMudmlld0JveCA9IFt2YngsIHZieSwgdmJ3LCB2YmhdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVsKFwic3ZnXCIsIGF0dHJzKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5tYXNrXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBFcXVpdmFsZW50IGluIGJlaGF2aW91ciB0byBAUGFwZXIuZywgZXhjZXB0IGl04oCZcyBhIG1hc2suXG4gICAgICoqXG4gICAgID0gKG9iamVjdCkgdGhlIGBtYXNrYCBlbGVtZW50XG4gICAgICoqXG4gICAgXFwqL1xuXG5cbiAgICBwcm90by5tYXNrID0gZnVuY3Rpb24gKGZpcnN0KSB7XG4gICAgICB2YXIgYXR0cixcbiAgICAgICAgICBlbCA9IHRoaXMuZWwoXCJtYXNrXCIpO1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxICYmIGZpcnN0ICYmICFmaXJzdC50eXBlKSB7XG4gICAgICAgIGVsLmF0dHIoZmlyc3QpO1xuICAgICAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGVsLmFkZChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGVsO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnB0cm5cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEVxdWl2YWxlbnQgaW4gYmVoYXZpb3VyIHRvIEBQYXBlci5nLCBleGNlcHQgaXTigJlzIGEgcGF0dGVybi5cbiAgICAgLSB4IChudW1iZXIpIEBvcHRpb25hbCBYIG9mIHRoZSBlbGVtZW50XG4gICAgIC0geSAobnVtYmVyKSBAb3B0aW9uYWwgWSBvZiB0aGUgZWxlbWVudFxuICAgICAtIHdpZHRoIChudW1iZXIpIEBvcHRpb25hbCB3aWR0aCBvZiB0aGUgZWxlbWVudFxuICAgICAtIGhlaWdodCAobnVtYmVyKSBAb3B0aW9uYWwgaGVpZ2h0IG9mIHRoZSBlbGVtZW50XG4gICAgIC0gdmJ4IChudW1iZXIpIEBvcHRpb25hbCB2aWV3Ym94IFhcbiAgICAgLSB2YnkgKG51bWJlcikgQG9wdGlvbmFsIHZpZXdib3ggWVxuICAgICAtIHZidyAobnVtYmVyKSBAb3B0aW9uYWwgdmlld2JveCB3aWR0aFxuICAgICAtIHZiaCAobnVtYmVyKSBAb3B0aW9uYWwgdmlld2JveCBoZWlnaHRcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSB0aGUgYHBhdHRlcm5gIGVsZW1lbnRcbiAgICAgKipcbiAgICBcXCovXG5cblxuICAgIHByb3RvLnB0cm4gPSBmdW5jdGlvbiAoeCwgeSwgd2lkdGgsIGhlaWdodCwgdngsIHZ5LCB2dywgdmgpIHtcbiAgICAgIGlmIChpcyh4LCBcIm9iamVjdFwiKSkge1xuICAgICAgICB2YXIgYXR0ciA9IHg7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyID0ge1xuICAgICAgICAgIHBhdHRlcm5Vbml0czogXCJ1c2VyU3BhY2VPblVzZVwiXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHgpIHtcbiAgICAgICAgICBhdHRyLnggPSB4O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHkpIHtcbiAgICAgICAgICBhdHRyLnkgPSB5O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpZHRoICE9IG51bGwpIHtcbiAgICAgICAgICBhdHRyLndpZHRoID0gd2lkdGg7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGVpZ2h0ICE9IG51bGwpIHtcbiAgICAgICAgICBhdHRyLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2eCAhPSBudWxsICYmIHZ5ICE9IG51bGwgJiYgdncgIT0gbnVsbCAmJiB2aCAhPSBudWxsKSB7XG4gICAgICAgICAgYXR0ci52aWV3Qm94ID0gW3Z4LCB2eSwgdncsIHZoXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhdHRyLnZpZXdCb3ggPSBbeCB8fCAwLCB5IHx8IDAsIHdpZHRoIHx8IDAsIGhlaWdodCB8fCAwXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5lbChcInBhdHRlcm5cIiwgYXR0cik7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIudXNlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGEgPHVzZT4gZWxlbWVudC5cbiAgICAgLSBpZCAoc3RyaW5nKSBAb3B0aW9uYWwgaWQgb2YgZWxlbWVudCB0byBsaW5rXG4gICAgICogb3JcbiAgICAgLSBpZCAoRWxlbWVudCkgQG9wdGlvbmFsIGVsZW1lbnQgdG8gbGlua1xuICAgICAqKlxuICAgICA9IChvYmplY3QpIHRoZSBgdXNlYCBlbGVtZW50XG4gICAgICoqXG4gICAgXFwqL1xuXG5cbiAgICBwcm90by51c2UgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICAgIGlmIChpZCBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgICAgICBpZiAoIWlkLmF0dHIoXCJpZFwiKSkge1xuICAgICAgICAgICAgaWQuYXR0cih7XG4gICAgICAgICAgICAgIGlkOiBTbmFwLl8uaWQoaWQpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZCA9IGlkLmF0dHIoXCJpZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTdHJpbmcoaWQpLmNoYXJBdCgpID09IFwiI1wiKSB7XG4gICAgICAgICAgaWQgPSBpZC5zdWJzdHJpbmcoMSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5lbChcInVzZVwiLCB7XG4gICAgICAgICAgXCJ4bGluazpocmVmXCI6IFwiI1wiICsgaWRcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gRWxlbWVudC5wcm90b3R5cGUudXNlLmNhbGwodGhpcyk7XG4gICAgICB9XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIuc3ltYm9sXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGEgPHN5bWJvbD4gZWxlbWVudC5cbiAgICAgLSB2YnggKG51bWJlcikgQG9wdGlvbmFsIHZpZXdib3ggWFxuICAgICAtIHZieSAobnVtYmVyKSBAb3B0aW9uYWwgdmlld2JveCBZXG4gICAgIC0gdmJ3IChudW1iZXIpIEBvcHRpb25hbCB2aWV3Ym94IHdpZHRoXG4gICAgIC0gdmJoIChudW1iZXIpIEBvcHRpb25hbCB2aWV3Ym94IGhlaWdodFxuICAgICA9IChvYmplY3QpIHRoZSBgc3ltYm9sYCBlbGVtZW50XG4gICAgICoqXG4gICAgXFwqL1xuXG5cbiAgICBwcm90by5zeW1ib2wgPSBmdW5jdGlvbiAodngsIHZ5LCB2dywgdmgpIHtcbiAgICAgIHZhciBhdHRyID0ge307XG5cbiAgICAgIGlmICh2eCAhPSBudWxsICYmIHZ5ICE9IG51bGwgJiYgdncgIT0gbnVsbCAmJiB2aCAhPSBudWxsKSB7XG4gICAgICAgIGF0dHIudmlld0JveCA9IFt2eCwgdnksIHZ3LCB2aF07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVsKFwic3ltYm9sXCIsIGF0dHIpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnRleHRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIERyYXdzIGEgdGV4dCBzdHJpbmdcbiAgICAgKipcbiAgICAgLSB4IChudW1iZXIpIHggY29vcmRpbmF0ZSBwb3NpdGlvblxuICAgICAtIHkgKG51bWJlcikgeSBjb29yZGluYXRlIHBvc2l0aW9uXG4gICAgIC0gdGV4dCAoc3RyaW5nfGFycmF5KSBUaGUgdGV4dCBzdHJpbmcgdG8gZHJhdyBvciBhcnJheSBvZiBzdHJpbmdzIHRvIG5lc3Qgd2l0aGluIHNlcGFyYXRlIGA8dHNwYW4+YCBlbGVtZW50c1xuICAgICA9IChvYmplY3QpIHRoZSBgdGV4dGAgZWxlbWVudFxuICAgICAqKlxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIHQxID0gcGFwZXIudGV4dCg1MCwgNTAsIFwiU25hcFwiKTtcbiAgICAgfCB2YXIgdDIgPSBwYXBlci50ZXh0KDUwLCA1MCwgW1wiU1wiLFwiblwiLFwiYVwiLFwicFwiXSk7XG4gICAgIHwgLy8gVGV4dCBwYXRoIHVzYWdlXG4gICAgIHwgdDEuYXR0cih7dGV4dHBhdGg6IFwiTTEwLDEwTDEwMCwxMDBcIn0pO1xuICAgICB8IC8vIG9yXG4gICAgIHwgdmFyIHB0aCA9IHBhcGVyLnBhdGgoXCJNMTAsMTBMMTAwLDEwMFwiKTtcbiAgICAgfCB0MS5hdHRyKHt0ZXh0cGF0aDogcHRofSk7XG4gICAgXFwqL1xuXG5cbiAgICBwcm90by50ZXh0ID0gZnVuY3Rpb24gKHgsIHksIHRleHQpIHtcbiAgICAgIHZhciBhdHRyID0ge307XG5cbiAgICAgIGlmIChpcyh4LCBcIm9iamVjdFwiKSkge1xuICAgICAgICBhdHRyID0geDtcbiAgICAgIH0gZWxzZSBpZiAoeCAhPSBudWxsKSB7XG4gICAgICAgIGF0dHIgPSB7XG4gICAgICAgICAgeDogeCxcbiAgICAgICAgICB5OiB5LFxuICAgICAgICAgIHRleHQ6IHRleHQgfHwgXCJcIlxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5lbChcInRleHRcIiwgYXR0cik7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogUGFwZXIubGluZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogRHJhd3MgYSBsaW5lXG4gICAgICoqXG4gICAgIC0geDEgKG51bWJlcikgeCBjb29yZGluYXRlIHBvc2l0aW9uIG9mIHRoZSBzdGFydFxuICAgICAtIHkxIChudW1iZXIpIHkgY29vcmRpbmF0ZSBwb3NpdGlvbiBvZiB0aGUgc3RhcnRcbiAgICAgLSB4MiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgcG9zaXRpb24gb2YgdGhlIGVuZFxuICAgICAtIHkyIChudW1iZXIpIHkgY29vcmRpbmF0ZSBwb3NpdGlvbiBvZiB0aGUgZW5kXG4gICAgID0gKG9iamVjdCkgdGhlIGBsaW5lYCBlbGVtZW50XG4gICAgICoqXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgdDEgPSBwYXBlci5saW5lKDUwLCA1MCwgMTAwLCAxMDApO1xuICAgIFxcKi9cblxuXG4gICAgcHJvdG8ubGluZSA9IGZ1bmN0aW9uICh4MSwgeTEsIHgyLCB5Mikge1xuICAgICAgdmFyIGF0dHIgPSB7fTtcblxuICAgICAgaWYgKGlzKHgxLCBcIm9iamVjdFwiKSkge1xuICAgICAgICBhdHRyID0geDE7XG4gICAgICB9IGVsc2UgaWYgKHgxICE9IG51bGwpIHtcbiAgICAgICAgYXR0ciA9IHtcbiAgICAgICAgICB4MTogeDEsXG4gICAgICAgICAgeDI6IHgyLFxuICAgICAgICAgIHkxOiB5MSxcbiAgICAgICAgICB5MjogeTJcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZWwoXCJsaW5lXCIsIGF0dHIpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFBhcGVyLnBvbHlsaW5lXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEcmF3cyBhIHBvbHlsaW5lXG4gICAgICoqXG4gICAgIC0gcG9pbnRzIChhcnJheSkgYXJyYXkgb2YgcG9pbnRzXG4gICAgICogb3JcbiAgICAgLSB2YXJhcmdzICjigKYpIHBvaW50c1xuICAgICA9IChvYmplY3QpIHRoZSBgcG9seWxpbmVgIGVsZW1lbnRcbiAgICAgKipcbiAgICAgPiBVc2FnZVxuICAgICB8IHZhciBwMSA9IHBhcGVyLnBvbHlsaW5lKFsxMCwgMTAsIDEwMCwgMTAwXSk7XG4gICAgIHwgdmFyIHAyID0gcGFwZXIucG9seWxpbmUoMTAsIDEwLCAxMDAsIDEwMCk7XG4gICAgXFwqL1xuXG5cbiAgICBwcm90by5wb2x5bGluZSA9IGZ1bmN0aW9uIChwb2ludHMpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBwb2ludHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgfVxuXG4gICAgICB2YXIgYXR0ciA9IHt9O1xuXG4gICAgICBpZiAoaXMocG9pbnRzLCBcIm9iamVjdFwiKSAmJiAhaXMocG9pbnRzLCBcImFycmF5XCIpKSB7XG4gICAgICAgIGF0dHIgPSBwb2ludHM7XG4gICAgICB9IGVsc2UgaWYgKHBvaW50cyAhPSBudWxsKSB7XG4gICAgICAgIGF0dHIgPSB7XG4gICAgICAgICAgcG9pbnRzOiBwb2ludHNcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZWwoXCJwb2x5bGluZVwiLCBhdHRyKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5wb2x5Z29uXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBEcmF3cyBhIHBvbHlnb24uIFNlZSBAUGFwZXIucG9seWxpbmVcbiAgICBcXCovXG5cblxuICAgIHByb3RvLnBvbHlnb24gPSBmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcG9pbnRzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGF0dHIgPSB7fTtcblxuICAgICAgaWYgKGlzKHBvaW50cywgXCJvYmplY3RcIikgJiYgIWlzKHBvaW50cywgXCJhcnJheVwiKSkge1xuICAgICAgICBhdHRyID0gcG9pbnRzO1xuICAgICAgfSBlbHNlIGlmIChwb2ludHMgIT0gbnVsbCkge1xuICAgICAgICBhdHRyID0ge1xuICAgICAgICAgIHBvaW50czogcG9pbnRzXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVsKFwicG9seWdvblwiLCBhdHRyKTtcbiAgICB9OyAvLyBncmFkaWVudHNcblxuXG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciAkID0gU25hcC5fLiQ7IC8vIGdyYWRpZW50cycgaGVscGVyc1xuXG4gICAgICAvKlxcXG4gICAgICAgKiBFbGVtZW50LnN0b3BzXG4gICAgICAgWyBtZXRob2QgXVxuICAgICAgICoqXG4gICAgICAgKiBPbmx5IGZvciBncmFkaWVudHMhXG4gICAgICAgKiBSZXR1cm5zIGFycmF5IG9mIGdyYWRpZW50IHN0b3BzIGVsZW1lbnRzLlxuICAgICAgID0gKGFycmF5KSB0aGUgc3RvcHMgYXJyYXkuXG4gICAgICBcXCovXG5cbiAgICAgIGZ1bmN0aW9uIEdzdG9wcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0QWxsKFwic3RvcFwiKTtcbiAgICAgIH1cbiAgICAgIC8qXFxcbiAgICAgICAqIEVsZW1lbnQuYWRkU3RvcFxuICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAqKlxuICAgICAgICogT25seSBmb3IgZ3JhZGllbnRzIVxuICAgICAgICogQWRkcyBhbm90aGVyIHN0b3AgdG8gdGhlIGdyYWRpZW50LlxuICAgICAgIC0gY29sb3IgKHN0cmluZykgc3RvcHMgY29sb3JcbiAgICAgICAtIG9mZnNldCAobnVtYmVyKSBzdG9wcyBvZmZzZXQgMC4uMTAwXG4gICAgICAgPSAob2JqZWN0KSBncmFkaWVudCBlbGVtZW50XG4gICAgICBcXCovXG5cblxuICAgICAgZnVuY3Rpb24gR2FkZFN0b3AoY29sb3IsIG9mZnNldCkge1xuICAgICAgICB2YXIgc3RvcCA9ICQoXCJzdG9wXCIpLFxuICAgICAgICAgICAgYXR0ciA9IHtcbiAgICAgICAgICBvZmZzZXQ6ICtvZmZzZXQgKyBcIiVcIlxuICAgICAgICB9O1xuICAgICAgICBjb2xvciA9IFNuYXAuY29sb3IoY29sb3IpO1xuICAgICAgICBhdHRyW1wic3RvcC1jb2xvclwiXSA9IGNvbG9yLmhleDtcblxuICAgICAgICBpZiAoY29sb3Iub3BhY2l0eSA8IDEpIHtcbiAgICAgICAgICBhdHRyW1wic3RvcC1vcGFjaXR5XCJdID0gY29sb3Iub3BhY2l0eTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoc3RvcCwgYXR0cik7XG4gICAgICAgIHZhciBzdG9wcyA9IHRoaXMuc3RvcHMoKSxcbiAgICAgICAgICAgIGluc2VydGVkO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgc3RvcE9mZnNldCA9IHBhcnNlRmxvYXQoc3RvcHNbaV0uYXR0cihcIm9mZnNldFwiKSk7XG5cbiAgICAgICAgICBpZiAoc3RvcE9mZnNldCA+IG9mZnNldCkge1xuICAgICAgICAgICAgdGhpcy5ub2RlLmluc2VydEJlZm9yZShzdG9wLCBzdG9wc1tpXS5ub2RlKTtcbiAgICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaW5zZXJ0ZWQpIHtcbiAgICAgICAgICB0aGlzLm5vZGUuYXBwZW5kQ2hpbGQoc3RvcCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gR2dldEJCb3goKSB7XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gXCJsaW5lYXJHcmFkaWVudFwiKSB7XG4gICAgICAgICAgdmFyIHgxID0gJCh0aGlzLm5vZGUsIFwieDFcIikgfHwgMCxcbiAgICAgICAgICAgICAgeDIgPSAkKHRoaXMubm9kZSwgXCJ4MlwiKSB8fCAxLFxuICAgICAgICAgICAgICB5MSA9ICQodGhpcy5ub2RlLCBcInkxXCIpIHx8IDAsXG4gICAgICAgICAgICAgIHkyID0gJCh0aGlzLm5vZGUsIFwieTJcIikgfHwgMDtcbiAgICAgICAgICByZXR1cm4gU25hcC5fLmJveCh4MSwgeTEsIG1hdGguYWJzKHgyIC0geDEpLCBtYXRoLmFicyh5MiAtIHkxKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGN4ID0gdGhpcy5ub2RlLmN4IHx8IC41LFxuICAgICAgICAgICAgICBjeSA9IHRoaXMubm9kZS5jeSB8fCAuNSxcbiAgICAgICAgICAgICAgciA9IHRoaXMubm9kZS5yIHx8IDA7XG4gICAgICAgICAgcmV0dXJuIFNuYXAuXy5ib3goY3ggLSByLCBjeSAtIHIsIHIgKiAyLCByICogMik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8qXFxcbiAgICAgICAqIEVsZW1lbnQuc2V0U3RvcHNcbiAgICAgICBbIG1ldGhvZCBdXG4gICAgICAgKipcbiAgICAgICAqIE9ubHkgZm9yIGdyYWRpZW50cyFcbiAgICAgICAqIFVwZGF0ZXMgc3RvcHMgb2YgdGhlIGdyYWRpZW50IGJhc2VkIG9uIHBhc3NlZCBncmFkaWVudCBkZXNjcmlwdG9yLiBTZWUgQFBwYWVyLmdyYWRpZW50XG4gICAgICAgLSBzdHIgKHN0cmluZykgZ3JhZGllbnQgZGVzY3JpcHRvciBwYXJ0IGFmdGVyIGAoKWAuXG4gICAgICAgPSAob2JqZWN0KSBncmFkaWVudCBlbGVtZW50XG4gICAgICAgfCB2YXIgZyA9IHBhcGVyLmdyYWRpZW50KFwibCgwLCAwLCAxLCAxKSMwMDAtI2YwMC0jZmZmXCIpO1xuICAgICAgIHwgZy5zZXRTdG9wcyhcIiNmZmYtIzAwMC0jZjAwLSNmYzBcIik7XG4gICAgICBcXCovXG5cblxuICAgICAgZnVuY3Rpb24gR3NldFN0b3BzKHN0cikge1xuICAgICAgICB2YXIgZ3JhZCA9IHN0cixcbiAgICAgICAgICAgIHN0b3BzID0gdGhpcy5zdG9wcygpO1xuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RyID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICBncmFkID0gZXZlKFwic25hcC51dGlsLmdyYWQucGFyc2VcIiwgbnVsbCwgXCJsKDAsMCwwLDEpXCIgKyBzdHIpLmZpcnN0RGVmaW5lZCgpLnN0b3BzO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFTbmFwLmlzKGdyYWQsIFwiYXJyYXlcIikpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0b3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGdyYWRbaV0pIHtcbiAgICAgICAgICAgIHZhciBjb2xvciA9IFNuYXAuY29sb3IoZ3JhZFtpXS5jb2xvciksXG4gICAgICAgICAgICAgICAgYXR0ciA9IHtcbiAgICAgICAgICAgICAgXCJvZmZzZXRcIjogZ3JhZFtpXS5vZmZzZXQgKyBcIiVcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGF0dHJbXCJzdG9wLWNvbG9yXCJdID0gY29sb3IuaGV4O1xuXG4gICAgICAgICAgICBpZiAoY29sb3Iub3BhY2l0eSA8IDEpIHtcbiAgICAgICAgICAgICAgYXR0cltcInN0b3Atb3BhY2l0eVwiXSA9IGNvbG9yLm9wYWNpdHk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN0b3BzW2ldLmF0dHIoYXR0cik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0b3BzW2ldLnJlbW92ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IHN0b3BzLmxlbmd0aDsgaSA8IGdyYWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB0aGlzLmFkZFN0b3AoZ3JhZFtpXS5jb2xvciwgZ3JhZFtpXS5vZmZzZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdyYWRpZW50KGRlZnMsIHN0cikge1xuICAgICAgICB2YXIgZ3JhZCA9IGV2ZShcInNuYXAudXRpbC5ncmFkLnBhcnNlXCIsIG51bGwsIHN0cikuZmlyc3REZWZpbmVkKCksXG4gICAgICAgICAgICBlbDtcblxuICAgICAgICBpZiAoIWdyYWQpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGdyYWQucGFyYW1zLnVuc2hpZnQoZGVmcyk7XG5cbiAgICAgICAgaWYgKGdyYWQudHlwZS50b0xvd2VyQ2FzZSgpID09IFwibFwiKSB7XG4gICAgICAgICAgZWwgPSBncmFkaWVudExpbmVhci5hcHBseSgwLCBncmFkLnBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwgPSBncmFkaWVudFJhZGlhbC5hcHBseSgwLCBncmFkLnBhcmFtcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZ3JhZC50eXBlICE9IGdyYWQudHlwZS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgICAgJChlbC5ub2RlLCB7XG4gICAgICAgICAgICBncmFkaWVudFVuaXRzOiBcInVzZXJTcGFjZU9uVXNlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdG9wcyA9IGdyYWQuc3RvcHMsXG4gICAgICAgICAgICBsZW4gPSBzdG9wcy5sZW5ndGg7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIHZhciBzdG9wID0gc3RvcHNbaV07XG4gICAgICAgICAgZWwuYWRkU3RvcChzdG9wLmNvbG9yLCBzdG9wLm9mZnNldCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdyYWRpZW50TGluZWFyKGRlZnMsIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgIHZhciBlbCA9IFNuYXAuXy5tYWtlKFwibGluZWFyR3JhZGllbnRcIiwgZGVmcyk7XG5cbiAgICAgICAgZWwuc3RvcHMgPSBHc3RvcHM7XG4gICAgICAgIGVsLmFkZFN0b3AgPSBHYWRkU3RvcDtcbiAgICAgICAgZWwuZ2V0QkJveCA9IEdnZXRCQm94O1xuICAgICAgICBlbC5zZXRTdG9wcyA9IEdzZXRTdG9wcztcblxuICAgICAgICBpZiAoeDEgIT0gbnVsbCkge1xuICAgICAgICAgICQoZWwubm9kZSwge1xuICAgICAgICAgICAgeDE6IHgxLFxuICAgICAgICAgICAgeTE6IHkxLFxuICAgICAgICAgICAgeDI6IHgyLFxuICAgICAgICAgICAgeTI6IHkyXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZWw7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdyYWRpZW50UmFkaWFsKGRlZnMsIGN4LCBjeSwgciwgZngsIGZ5KSB7XG4gICAgICAgIHZhciBlbCA9IFNuYXAuXy5tYWtlKFwicmFkaWFsR3JhZGllbnRcIiwgZGVmcyk7XG5cbiAgICAgICAgZWwuc3RvcHMgPSBHc3RvcHM7XG4gICAgICAgIGVsLmFkZFN0b3AgPSBHYWRkU3RvcDtcbiAgICAgICAgZWwuZ2V0QkJveCA9IEdnZXRCQm94O1xuXG4gICAgICAgIGlmIChjeCAhPSBudWxsKSB7XG4gICAgICAgICAgJChlbC5ub2RlLCB7XG4gICAgICAgICAgICBjeDogY3gsXG4gICAgICAgICAgICBjeTogY3ksXG4gICAgICAgICAgICByOiByXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZnggIT0gbnVsbCAmJiBmeSAhPSBudWxsKSB7XG4gICAgICAgICAgJChlbC5ub2RlLCB7XG4gICAgICAgICAgICBmeDogZngsXG4gICAgICAgICAgICBmeTogZnlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlbDtcbiAgICAgIH1cbiAgICAgIC8qXFxcbiAgICAgICAqIFBhcGVyLmdyYWRpZW50XG4gICAgICAgWyBtZXRob2QgXVxuICAgICAgICoqXG4gICAgICAgKiBDcmVhdGVzIGEgZ3JhZGllbnQgZWxlbWVudFxuICAgICAgICoqXG4gICAgICAgLSBncmFkaWVudCAoc3RyaW5nKSBncmFkaWVudCBkZXNjcmlwdG9yXG4gICAgICAgPiBHcmFkaWVudCBEZXNjcmlwdG9yXG4gICAgICAgKiBUaGUgZ3JhZGllbnQgZGVzY3JpcHRvciBpcyBhbiBleHByZXNzaW9uIGZvcm1hdHRlZCBhc1xuICAgICAgICogZm9sbG93czogYDx0eXBlPig8Y29vcmRzPik8Y29sb3JzPmAuICBUaGUgYDx0eXBlPmAgY2FuIGJlXG4gICAgICAgKiBlaXRoZXIgbGluZWFyIG9yIHJhZGlhbC4gIFRoZSB1cHBlcmNhc2UgYExgIG9yIGBSYCBsZXR0ZXJzXG4gICAgICAgKiBpbmRpY2F0ZSBhYnNvbHV0ZSBjb29yZGluYXRlcyBvZmZzZXQgZnJvbSB0aGUgU1ZHIHN1cmZhY2UuXG4gICAgICAgKiBMb3dlcmNhc2UgYGxgIG9yIGByYCBsZXR0ZXJzIGluZGljYXRlIGNvb3JkaW5hdGVzXG4gICAgICAgKiBjYWxjdWxhdGVkIHJlbGF0aXZlIHRvIHRoZSBlbGVtZW50IHRvIHdoaWNoIHRoZSBncmFkaWVudCBpc1xuICAgICAgICogYXBwbGllZC4gIENvb3JkaW5hdGVzIHNwZWNpZnkgYSBsaW5lYXIgZ3JhZGllbnQgdmVjdG9yIGFzXG4gICAgICAgKiBgeDFgLCBgeTFgLCBgeDJgLCBgeTJgLCBvciBhIHJhZGlhbCBncmFkaWVudCBhcyBgY3hgLCBgY3lgLFxuICAgICAgICogYHJgIGFuZCBvcHRpb25hbCBgZnhgLCBgZnlgIHNwZWNpZnlpbmcgYSBmb2NhbCBwb2ludCBhd2F5XG4gICAgICAgKiBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGNpcmNsZS4gU3BlY2lmeSBgPGNvbG9ycz5gIGFzIGEgbGlzdFxuICAgICAgICogb2YgZGFzaC1zZXBhcmF0ZWQgQ1NTIGNvbG9yIHZhbHVlcy4gIEVhY2ggY29sb3IgbWF5IGJlXG4gICAgICAgKiBmb2xsb3dlZCBieSBhIGN1c3RvbSBvZmZzZXQgdmFsdWUsIHNlcGFyYXRlZCB3aXRoIGEgY29sb25cbiAgICAgICAqIGNoYXJhY3Rlci5cbiAgICAgICA+IEV4YW1wbGVzXG4gICAgICAgKiBMaW5lYXIgZ3JhZGllbnQsIHJlbGF0aXZlIGZyb20gdG9wLWxlZnQgY29ybmVyIHRvIGJvdHRvbS1yaWdodFxuICAgICAgICogY29ybmVyLCBmcm9tIGJsYWNrIHRocm91Z2ggcmVkIHRvIHdoaXRlOlxuICAgICAgIHwgdmFyIGcgPSBwYXBlci5ncmFkaWVudChcImwoMCwgMCwgMSwgMSkjMDAwLSNmMDAtI2ZmZlwiKTtcbiAgICAgICAqIExpbmVhciBncmFkaWVudCwgYWJzb2x1dGUgZnJvbSAoMCwgMCkgdG8gKDEwMCwgMTAwKSwgZnJvbSBibGFja1xuICAgICAgICogdGhyb3VnaCByZWQgYXQgMjUlIHRvIHdoaXRlOlxuICAgICAgIHwgdmFyIGcgPSBwYXBlci5ncmFkaWVudChcIkwoMCwgMCwgMTAwLCAxMDApIzAwMC0jZjAwOjI1LSNmZmZcIik7XG4gICAgICAgKiBSYWRpYWwgZ3JhZGllbnQsIHJlbGF0aXZlIGZyb20gdGhlIGNlbnRlciBvZiB0aGUgZWxlbWVudCB3aXRoIHJhZGl1c1xuICAgICAgICogaGFsZiB0aGUgd2lkdGgsIGZyb20gYmxhY2sgdG8gd2hpdGU6XG4gICAgICAgfCB2YXIgZyA9IHBhcGVyLmdyYWRpZW50KFwicigwLjUsIDAuNSwgMC41KSMwMDAtI2ZmZlwiKTtcbiAgICAgICAqIFRvIGFwcGx5IHRoZSBncmFkaWVudDpcbiAgICAgICB8IHBhcGVyLmNpcmNsZSg1MCwgNTAsIDQwKS5hdHRyKHtcbiAgICAgICB8ICAgICBmaWxsOiBnXG4gICAgICAgfCB9KTtcbiAgICAgICA9IChvYmplY3QpIHRoZSBgZ3JhZGllbnRgIGVsZW1lbnRcbiAgICAgIFxcKi9cblxuXG4gICAgICBwcm90by5ncmFkaWVudCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgcmV0dXJuIGdyYWRpZW50KHRoaXMuZGVmcywgc3RyKTtcbiAgICAgIH07XG5cbiAgICAgIHByb3RvLmdyYWRpZW50TGluZWFyID0gZnVuY3Rpb24gKHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgICAgIHJldHVybiBncmFkaWVudExpbmVhcih0aGlzLmRlZnMsIHgxLCB5MSwgeDIsIHkyKTtcbiAgICAgIH07XG5cbiAgICAgIHByb3RvLmdyYWRpZW50UmFkaWFsID0gZnVuY3Rpb24gKGN4LCBjeSwgciwgZngsIGZ5KSB7XG4gICAgICAgIHJldHVybiBncmFkaWVudFJhZGlhbCh0aGlzLmRlZnMsIGN4LCBjeSwgciwgZngsIGZ5KTtcbiAgICAgIH07XG4gICAgICAvKlxcXG4gICAgICAgKiBQYXBlci50b1N0cmluZ1xuICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAqKlxuICAgICAgICogUmV0dXJucyBTVkcgY29kZSBmb3IgdGhlIEBQYXBlclxuICAgICAgID0gKHN0cmluZykgU1ZHIGNvZGUgZm9yIHRoZSBAUGFwZXJcbiAgICAgIFxcKi9cblxuXG4gICAgICBwcm90by50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRvYyA9IHRoaXMubm9kZS5vd25lckRvY3VtZW50LFxuICAgICAgICAgICAgZiA9IGRvYy5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXG4gICAgICAgICAgICBkID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICBzdmcgPSB0aGlzLm5vZGUuY2xvbmVOb2RlKHRydWUpLFxuICAgICAgICAgICAgcmVzO1xuICAgICAgICBmLmFwcGVuZENoaWxkKGQpO1xuICAgICAgICBkLmFwcGVuZENoaWxkKHN2Zyk7XG5cbiAgICAgICAgU25hcC5fLiQoc3ZnLCB7XG4gICAgICAgICAgeG1sbnM6IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuICAgICAgICB9KTtcblxuICAgICAgICByZXMgPSBkLmlubmVySFRNTDtcbiAgICAgICAgZi5yZW1vdmVDaGlsZChmLmZpcnN0Q2hpbGQpO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgfTtcbiAgICAgIC8qXFxcbiAgICAgICAqIFBhcGVyLnRvRGF0YVVSTFxuICAgICAgIFsgbWV0aG9kIF1cbiAgICAgICAqKlxuICAgICAgICogUmV0dXJucyBTVkcgY29kZSBmb3IgdGhlIEBQYXBlciBhcyBEYXRhIFVSSSBzdHJpbmcuXG4gICAgICAgPSAoc3RyaW5nKSBEYXRhIFVSSSBzdHJpbmdcbiAgICAgIFxcKi9cblxuXG4gICAgICBwcm90by50b0RhdGFVUkwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh3aW5kb3cgJiYgd2luZG93LmJ0b2EpIHtcbiAgICAgICAgICByZXR1cm4gXCJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFwiICsgYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQodGhpcykpKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIC8qXFxcbiAgICAgICAqIFBhcGVyLmNsZWFyXG4gICAgICAgWyBtZXRob2QgXVxuICAgICAgICoqXG4gICAgICAgKiBSZW1vdmVzIGFsbCBjaGlsZCBub2RlcyBvZiB0aGUgcGFwZXIsIGV4Y2VwdCA8ZGVmcz4uXG4gICAgICBcXCovXG5cblxuICAgICAgcHJvdG8uY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlLmZpcnN0Q2hpbGQsXG4gICAgICAgICAgICBuZXh0O1xuXG4gICAgICAgIHdoaWxlIChub2RlKSB7XG4gICAgICAgICAgbmV4dCA9IG5vZGUubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgICBpZiAobm9kZS50YWdOYW1lICE9IFwiZGVmc1wiKSB7XG4gICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3RvLmNsZWFyLmNhbGwoe1xuICAgICAgICAgICAgICBub2RlOiBub2RlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBub2RlID0gbmV4dDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSgpO1xuICB9KTsgLy8gQ29weXJpZ2h0IChjKSAyMDEzIEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICAvL1xuICAvLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAvLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIC8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAvL1xuICAvLyBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAgLy9cbiAgLy8gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICAvLyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gIC8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuICAvLyBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gIC8vIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuXG4gIFNuYXAucGx1Z2luKGZ1bmN0aW9uIChTbmFwLCBFbGVtZW50LCBQYXBlciwgZ2xvYikge1xuICAgIHZhciBlbHByb3RvID0gRWxlbWVudC5wcm90b3R5cGUsXG4gICAgICAgIGlzID0gU25hcC5pcyxcbiAgICAgICAgY2xvbmUgPSBTbmFwLl8uY2xvbmUsXG4gICAgICAgIGhhcyA9IFwiaGFzT3duUHJvcGVydHlcIixcbiAgICAgICAgcDJzID0gLyw/KFthLXpdKSw/L2dpLFxuICAgICAgICB0b0Zsb2F0ID0gcGFyc2VGbG9hdCxcbiAgICAgICAgbWF0aCA9IE1hdGgsXG4gICAgICAgIFBJID0gbWF0aC5QSSxcbiAgICAgICAgbW1pbiA9IG1hdGgubWluLFxuICAgICAgICBtbWF4ID0gbWF0aC5tYXgsXG4gICAgICAgIHBvdyA9IG1hdGgucG93LFxuICAgICAgICBhYnMgPSBtYXRoLmFicztcblxuICAgIGZ1bmN0aW9uIHBhdGhzKHBzKSB7XG4gICAgICB2YXIgcCA9IHBhdGhzLnBzID0gcGF0aHMucHMgfHwge307XG5cbiAgICAgIGlmIChwW3BzXSkge1xuICAgICAgICBwW3BzXS5zbGVlcCA9IDEwMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBbcHNdID0ge1xuICAgICAgICAgIHNsZWVwOiAxMDBcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBwKSBpZiAocFtoYXNdKGtleSkgJiYga2V5ICE9IHBzKSB7XG4gICAgICAgICAgcFtrZXldLnNsZWVwLS07XG4gICAgICAgICAgIXBba2V5XS5zbGVlcCAmJiBkZWxldGUgcFtrZXldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwW3BzXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBib3goeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgaWYgKHggPT0gbnVsbCkge1xuICAgICAgICB4ID0geSA9IHdpZHRoID0gaGVpZ2h0ID0gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHkgPT0gbnVsbCkge1xuICAgICAgICB5ID0geC55O1xuICAgICAgICB3aWR0aCA9IHgud2lkdGg7XG4gICAgICAgIGhlaWdodCA9IHguaGVpZ2h0O1xuICAgICAgICB4ID0geC54O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5LFxuICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgIHc6IHdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgaDogaGVpZ2h0LFxuICAgICAgICB4MjogeCArIHdpZHRoLFxuICAgICAgICB5MjogeSArIGhlaWdodCxcbiAgICAgICAgY3g6IHggKyB3aWR0aCAvIDIsXG4gICAgICAgIGN5OiB5ICsgaGVpZ2h0IC8gMixcbiAgICAgICAgcjE6IG1hdGgubWluKHdpZHRoLCBoZWlnaHQpIC8gMixcbiAgICAgICAgcjI6IG1hdGgubWF4KHdpZHRoLCBoZWlnaHQpIC8gMixcbiAgICAgICAgcjA6IG1hdGguc3FydCh3aWR0aCAqIHdpZHRoICsgaGVpZ2h0ICogaGVpZ2h0KSAvIDIsXG4gICAgICAgIHBhdGg6IHJlY3RQYXRoKHgsIHksIHdpZHRoLCBoZWlnaHQpLFxuICAgICAgICB2YjogW3gsIHksIHdpZHRoLCBoZWlnaHRdLmpvaW4oXCIgXCIpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuIHRoaXMuam9pbihcIixcIikucmVwbGFjZShwMnMsIFwiJDFcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGF0aENsb25lKHBhdGhBcnJheSkge1xuICAgICAgdmFyIHJlcyA9IGNsb25lKHBhdGhBcnJheSk7XG4gICAgICByZXMudG9TdHJpbmcgPSB0b1N0cmluZztcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UG9pbnRBdFNlZ21lbnRMZW5ndGgocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIGxlbmd0aCkge1xuICAgICAgaWYgKGxlbmd0aCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBiZXpsZW4ocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZpbmREb3RzQXRTZWdtZW50KHAxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5LCBnZXRUb3RMZW4ocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnksIGxlbmd0aCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldExlbmd0aEZhY3RvcnkoaXN0b3RhbCwgc3VicGF0aCkge1xuICAgICAgZnVuY3Rpb24gTyh2YWwpIHtcbiAgICAgICAgcmV0dXJuICsoK3ZhbCkudG9GaXhlZCgzKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFNuYXAuXy5jYWNoZXIoZnVuY3Rpb24gKHBhdGgsIGxlbmd0aCwgb25seXN0YXJ0KSB7XG4gICAgICAgIGlmIChwYXRoIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgICAgICAgIHBhdGggPSBwYXRoLmF0dHIoXCJkXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcGF0aCA9IHBhdGgyY3VydmUocGF0aCk7XG4gICAgICAgIHZhciB4LFxuICAgICAgICAgICAgeSxcbiAgICAgICAgICAgIHAsXG4gICAgICAgICAgICBsLFxuICAgICAgICAgICAgc3AgPSBcIlwiLFxuICAgICAgICAgICAgc3VicGF0aHMgPSB7fSxcbiAgICAgICAgICAgIHBvaW50LFxuICAgICAgICAgICAgbGVuID0gMDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwYXRoLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICBwID0gcGF0aFtpXTtcblxuICAgICAgICAgIGlmIChwWzBdID09IFwiTVwiKSB7XG4gICAgICAgICAgICB4ID0gK3BbMV07XG4gICAgICAgICAgICB5ID0gK3BbMl07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGwgPSBnZXRQb2ludEF0U2VnbWVudExlbmd0aCh4LCB5LCBwWzFdLCBwWzJdLCBwWzNdLCBwWzRdLCBwWzVdLCBwWzZdKTtcblxuICAgICAgICAgICAgaWYgKGxlbiArIGwgPiBsZW5ndGgpIHtcbiAgICAgICAgICAgICAgaWYgKHN1YnBhdGggJiYgIXN1YnBhdGhzLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgcG9pbnQgPSBnZXRQb2ludEF0U2VnbWVudExlbmd0aCh4LCB5LCBwWzFdLCBwWzJdLCBwWzNdLCBwWzRdLCBwWzVdLCBwWzZdLCBsZW5ndGggLSBsZW4pO1xuICAgICAgICAgICAgICAgIHNwICs9IFtcIkNcIiArIE8ocG9pbnQuc3RhcnQueCksIE8ocG9pbnQuc3RhcnQueSksIE8ocG9pbnQubS54KSwgTyhwb2ludC5tLnkpLCBPKHBvaW50LngpLCBPKHBvaW50LnkpXTtcblxuICAgICAgICAgICAgICAgIGlmIChvbmx5c3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBzcDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzdWJwYXRocy5zdGFydCA9IHNwO1xuICAgICAgICAgICAgICAgIHNwID0gW1wiTVwiICsgTyhwb2ludC54KSwgTyhwb2ludC55KSArIFwiQ1wiICsgTyhwb2ludC5uLngpLCBPKHBvaW50Lm4ueSksIE8ocG9pbnQuZW5kLngpLCBPKHBvaW50LmVuZC55KSwgTyhwWzVdKSwgTyhwWzZdKV0uam9pbigpO1xuICAgICAgICAgICAgICAgIGxlbiArPSBsO1xuICAgICAgICAgICAgICAgIHggPSArcFs1XTtcbiAgICAgICAgICAgICAgICB5ID0gK3BbNl07XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIWlzdG90YWwgJiYgIXN1YnBhdGgpIHtcbiAgICAgICAgICAgICAgICBwb2ludCA9IGdldFBvaW50QXRTZWdtZW50TGVuZ3RoKHgsIHksIHBbMV0sIHBbMl0sIHBbM10sIHBbNF0sIHBbNV0sIHBbNl0sIGxlbmd0aCAtIGxlbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBvaW50O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxlbiArPSBsO1xuICAgICAgICAgICAgeCA9ICtwWzVdO1xuICAgICAgICAgICAgeSA9ICtwWzZdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNwICs9IHAuc2hpZnQoKSArIHA7XG4gICAgICAgIH1cblxuICAgICAgICBzdWJwYXRocy5lbmQgPSBzcDtcbiAgICAgICAgcG9pbnQgPSBpc3RvdGFsID8gbGVuIDogc3VicGF0aCA/IHN1YnBhdGhzIDogZmluZERvdHNBdFNlZ21lbnQoeCwgeSwgcFswXSwgcFsxXSwgcFsyXSwgcFszXSwgcFs0XSwgcFs1XSwgMSk7XG4gICAgICAgIHJldHVybiBwb2ludDtcbiAgICAgIH0sIG51bGwsIFNuYXAuXy5jbG9uZSk7XG4gICAgfVxuXG4gICAgdmFyIGdldFRvdGFsTGVuZ3RoID0gZ2V0TGVuZ3RoRmFjdG9yeSgxKSxcbiAgICAgICAgZ2V0UG9pbnRBdExlbmd0aCA9IGdldExlbmd0aEZhY3RvcnkoKSxcbiAgICAgICAgZ2V0U3VicGF0aHNBdExlbmd0aCA9IGdldExlbmd0aEZhY3RvcnkoMCwgMSk7XG5cbiAgICBmdW5jdGlvbiBmaW5kRG90c0F0U2VnbWVudChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgdCkge1xuICAgICAgdmFyIHQxID0gMSAtIHQsXG4gICAgICAgICAgdDEzID0gcG93KHQxLCAzKSxcbiAgICAgICAgICB0MTIgPSBwb3codDEsIDIpLFxuICAgICAgICAgIHQyID0gdCAqIHQsXG4gICAgICAgICAgdDMgPSB0MiAqIHQsXG4gICAgICAgICAgeCA9IHQxMyAqIHAxeCArIHQxMiAqIDMgKiB0ICogYzF4ICsgdDEgKiAzICogdCAqIHQgKiBjMnggKyB0MyAqIHAyeCxcbiAgICAgICAgICB5ID0gdDEzICogcDF5ICsgdDEyICogMyAqIHQgKiBjMXkgKyB0MSAqIDMgKiB0ICogdCAqIGMyeSArIHQzICogcDJ5LFxuICAgICAgICAgIG14ID0gcDF4ICsgMiAqIHQgKiAoYzF4IC0gcDF4KSArIHQyICogKGMyeCAtIDIgKiBjMXggKyBwMXgpLFxuICAgICAgICAgIG15ID0gcDF5ICsgMiAqIHQgKiAoYzF5IC0gcDF5KSArIHQyICogKGMyeSAtIDIgKiBjMXkgKyBwMXkpLFxuICAgICAgICAgIG54ID0gYzF4ICsgMiAqIHQgKiAoYzJ4IC0gYzF4KSArIHQyICogKHAyeCAtIDIgKiBjMnggKyBjMXgpLFxuICAgICAgICAgIG55ID0gYzF5ICsgMiAqIHQgKiAoYzJ5IC0gYzF5KSArIHQyICogKHAyeSAtIDIgKiBjMnkgKyBjMXkpLFxuICAgICAgICAgIGF4ID0gdDEgKiBwMXggKyB0ICogYzF4LFxuICAgICAgICAgIGF5ID0gdDEgKiBwMXkgKyB0ICogYzF5LFxuICAgICAgICAgIGN4ID0gdDEgKiBjMnggKyB0ICogcDJ4LFxuICAgICAgICAgIGN5ID0gdDEgKiBjMnkgKyB0ICogcDJ5LFxuICAgICAgICAgIGFscGhhID0gOTAgLSBtYXRoLmF0YW4yKG14IC0gbngsIG15IC0gbnkpICogMTgwIC8gUEk7IC8vIChteCA+IG54IHx8IG15IDwgbnkpICYmIChhbHBoYSArPSAxODApO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiB4LFxuICAgICAgICB5OiB5LFxuICAgICAgICBtOiB7XG4gICAgICAgICAgeDogbXgsXG4gICAgICAgICAgeTogbXlcbiAgICAgICAgfSxcbiAgICAgICAgbjoge1xuICAgICAgICAgIHg6IG54LFxuICAgICAgICAgIHk6IG55XG4gICAgICAgIH0sXG4gICAgICAgIHN0YXJ0OiB7XG4gICAgICAgICAgeDogYXgsXG4gICAgICAgICAgeTogYXlcbiAgICAgICAgfSxcbiAgICAgICAgZW5kOiB7XG4gICAgICAgICAgeDogY3gsXG4gICAgICAgICAgeTogY3lcbiAgICAgICAgfSxcbiAgICAgICAgYWxwaGE6IGFscGhhXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJlemllckJCb3gocDF4LCBwMXksIGMxeCwgYzF5LCBjMngsIGMyeSwgcDJ4LCBwMnkpIHtcbiAgICAgIGlmICghU25hcC5pcyhwMXgsIFwiYXJyYXlcIikpIHtcbiAgICAgICAgcDF4ID0gW3AxeCwgcDF5LCBjMXgsIGMxeSwgYzJ4LCBjMnksIHAyeCwgcDJ5XTtcbiAgICAgIH1cblxuICAgICAgdmFyIGJib3ggPSBjdXJ2ZURpbS5hcHBseShudWxsLCBwMXgpO1xuICAgICAgcmV0dXJuIGJveChiYm94Lm1pbi54LCBiYm94Lm1pbi55LCBiYm94Lm1heC54IC0gYmJveC5taW4ueCwgYmJveC5tYXgueSAtIGJib3gubWluLnkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzUG9pbnRJbnNpZGVCQm94KGJib3gsIHgsIHkpIHtcbiAgICAgIHJldHVybiB4ID49IGJib3gueCAmJiB4IDw9IGJib3gueCArIGJib3gud2lkdGggJiYgeSA+PSBiYm94LnkgJiYgeSA8PSBiYm94LnkgKyBiYm94LmhlaWdodDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0JCb3hJbnRlcnNlY3QoYmJveDEsIGJib3gyKSB7XG4gICAgICBiYm94MSA9IGJveChiYm94MSk7XG4gICAgICBiYm94MiA9IGJveChiYm94Mik7XG4gICAgICByZXR1cm4gaXNQb2ludEluc2lkZUJCb3goYmJveDIsIGJib3gxLngsIGJib3gxLnkpIHx8IGlzUG9pbnRJbnNpZGVCQm94KGJib3gyLCBiYm94MS54MiwgYmJveDEueSkgfHwgaXNQb2ludEluc2lkZUJCb3goYmJveDIsIGJib3gxLngsIGJib3gxLnkyKSB8fCBpc1BvaW50SW5zaWRlQkJveChiYm94MiwgYmJveDEueDIsIGJib3gxLnkyKSB8fCBpc1BvaW50SW5zaWRlQkJveChiYm94MSwgYmJveDIueCwgYmJveDIueSkgfHwgaXNQb2ludEluc2lkZUJCb3goYmJveDEsIGJib3gyLngyLCBiYm94Mi55KSB8fCBpc1BvaW50SW5zaWRlQkJveChiYm94MSwgYmJveDIueCwgYmJveDIueTIpIHx8IGlzUG9pbnRJbnNpZGVCQm94KGJib3gxLCBiYm94Mi54MiwgYmJveDIueTIpIHx8IChiYm94MS54IDwgYmJveDIueDIgJiYgYmJveDEueCA+IGJib3gyLnggfHwgYmJveDIueCA8IGJib3gxLngyICYmIGJib3gyLnggPiBiYm94MS54KSAmJiAoYmJveDEueSA8IGJib3gyLnkyICYmIGJib3gxLnkgPiBiYm94Mi55IHx8IGJib3gyLnkgPCBiYm94MS55MiAmJiBiYm94Mi55ID4gYmJveDEueSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYmFzZTModCwgcDEsIHAyLCBwMywgcDQpIHtcbiAgICAgIHZhciB0MSA9IC0zICogcDEgKyA5ICogcDIgLSA5ICogcDMgKyAzICogcDQsXG4gICAgICAgICAgdDIgPSB0ICogdDEgKyA2ICogcDEgLSAxMiAqIHAyICsgNiAqIHAzO1xuICAgICAgcmV0dXJuIHQgKiB0MiAtIDMgKiBwMSArIDMgKiBwMjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiZXpsZW4oeDEsIHkxLCB4MiwgeTIsIHgzLCB5MywgeDQsIHk0LCB6KSB7XG4gICAgICBpZiAoeiA9PSBudWxsKSB7XG4gICAgICAgIHogPSAxO1xuICAgICAgfVxuXG4gICAgICB6ID0geiA+IDEgPyAxIDogeiA8IDAgPyAwIDogejtcbiAgICAgIHZhciB6MiA9IHogLyAyLFxuICAgICAgICAgIG4gPSAxMixcbiAgICAgICAgICBUdmFsdWVzID0gWy0uMTI1MiwgLjEyNTIsIC0uMzY3OCwgLjM2NzgsIC0uNTg3MywgLjU4NzMsIC0uNzY5OSwgLjc2OTksIC0uOTA0MSwgLjkwNDEsIC0uOTgxNiwgLjk4MTZdLFxuICAgICAgICAgIEN2YWx1ZXMgPSBbMC4yNDkxLCAwLjI0OTEsIDAuMjMzNSwgMC4yMzM1LCAwLjIwMzIsIDAuMjAzMiwgMC4xNjAxLCAwLjE2MDEsIDAuMTA2OSwgMC4xMDY5LCAwLjA0NzIsIDAuMDQ3Ml0sXG4gICAgICAgICAgc3VtID0gMDtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgdmFyIGN0ID0gejIgKiBUdmFsdWVzW2ldICsgejIsXG4gICAgICAgICAgICB4YmFzZSA9IGJhc2UzKGN0LCB4MSwgeDIsIHgzLCB4NCksXG4gICAgICAgICAgICB5YmFzZSA9IGJhc2UzKGN0LCB5MSwgeTIsIHkzLCB5NCksXG4gICAgICAgICAgICBjb21iID0geGJhc2UgKiB4YmFzZSArIHliYXNlICogeWJhc2U7XG4gICAgICAgIHN1bSArPSBDdmFsdWVzW2ldICogbWF0aC5zcXJ0KGNvbWIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gejIgKiBzdW07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VG90TGVuKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCwgbGwpIHtcbiAgICAgIGlmIChsbCA8IDAgfHwgYmV6bGVuKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCkgPCBsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB0ID0gMSxcbiAgICAgICAgICBzdGVwID0gdCAvIDIsXG4gICAgICAgICAgdDIgPSB0IC0gc3RlcCxcbiAgICAgICAgICBsLFxuICAgICAgICAgIGUgPSAuMDE7XG4gICAgICBsID0gYmV6bGVuKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCwgdDIpO1xuXG4gICAgICB3aGlsZSAoYWJzKGwgLSBsbCkgPiBlKSB7XG4gICAgICAgIHN0ZXAgLz0gMjtcbiAgICAgICAgdDIgKz0gKGwgPCBsbCA/IDEgOiAtMSkgKiBzdGVwO1xuICAgICAgICBsID0gYmV6bGVuKHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCwgdDIpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdDI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW50ZXJzZWN0KHgxLCB5MSwgeDIsIHkyLCB4MywgeTMsIHg0LCB5NCkge1xuICAgICAgaWYgKG1tYXgoeDEsIHgyKSA8IG1taW4oeDMsIHg0KSB8fCBtbWluKHgxLCB4MikgPiBtbWF4KHgzLCB4NCkgfHwgbW1heCh5MSwgeTIpIDwgbW1pbih5MywgeTQpIHx8IG1taW4oeTEsIHkyKSA+IG1tYXgoeTMsIHk0KSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBueCA9ICh4MSAqIHkyIC0geTEgKiB4MikgKiAoeDMgLSB4NCkgLSAoeDEgLSB4MikgKiAoeDMgKiB5NCAtIHkzICogeDQpLFxuICAgICAgICAgIG55ID0gKHgxICogeTIgLSB5MSAqIHgyKSAqICh5MyAtIHk0KSAtICh5MSAtIHkyKSAqICh4MyAqIHk0IC0geTMgKiB4NCksXG4gICAgICAgICAgZGVub21pbmF0b3IgPSAoeDEgLSB4MikgKiAoeTMgLSB5NCkgLSAoeTEgLSB5MikgKiAoeDMgLSB4NCk7XG5cbiAgICAgIGlmICghZGVub21pbmF0b3IpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHggPSBueCAvIGRlbm9taW5hdG9yLFxuICAgICAgICAgIHB5ID0gbnkgLyBkZW5vbWluYXRvcixcbiAgICAgICAgICBweDIgPSArcHgudG9GaXhlZCgyKSxcbiAgICAgICAgICBweTIgPSArcHkudG9GaXhlZCgyKTtcblxuICAgICAgaWYgKHB4MiA8ICttbWluKHgxLCB4MikudG9GaXhlZCgyKSB8fCBweDIgPiArbW1heCh4MSwgeDIpLnRvRml4ZWQoMikgfHwgcHgyIDwgK21taW4oeDMsIHg0KS50b0ZpeGVkKDIpIHx8IHB4MiA+ICttbWF4KHgzLCB4NCkudG9GaXhlZCgyKSB8fCBweTIgPCArbW1pbih5MSwgeTIpLnRvRml4ZWQoMikgfHwgcHkyID4gK21tYXgoeTEsIHkyKS50b0ZpeGVkKDIpIHx8IHB5MiA8ICttbWluKHkzLCB5NCkudG9GaXhlZCgyKSB8fCBweTIgPiArbW1heCh5MywgeTQpLnRvRml4ZWQoMikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBweCxcbiAgICAgICAgeTogcHlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW50ZXIoYmV6MSwgYmV6Mikge1xuICAgICAgcmV0dXJuIGludGVySGVscGVyKGJlejEsIGJlejIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGludGVyQ291bnQoYmV6MSwgYmV6Mikge1xuICAgICAgcmV0dXJuIGludGVySGVscGVyKGJlejEsIGJlejIsIDEpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGludGVySGVscGVyKGJlejEsIGJlejIsIGp1c3RDb3VudCkge1xuICAgICAgdmFyIGJib3gxID0gYmV6aWVyQkJveChiZXoxKSxcbiAgICAgICAgICBiYm94MiA9IGJlemllckJCb3goYmV6Mik7XG5cbiAgICAgIGlmICghaXNCQm94SW50ZXJzZWN0KGJib3gxLCBiYm94MikpIHtcbiAgICAgICAgcmV0dXJuIGp1c3RDb3VudCA/IDAgOiBbXTtcbiAgICAgIH1cblxuICAgICAgdmFyIGwxID0gYmV6bGVuLmFwcGx5KDAsIGJlejEpLFxuICAgICAgICAgIGwyID0gYmV6bGVuLmFwcGx5KDAsIGJlejIpLFxuICAgICAgICAgIG4xID0gfn4obDEgLyA4KSxcbiAgICAgICAgICBuMiA9IH5+KGwyIC8gOCksXG4gICAgICAgICAgZG90czEgPSBbXSxcbiAgICAgICAgICBkb3RzMiA9IFtdLFxuICAgICAgICAgIHh5ID0ge30sXG4gICAgICAgICAgcmVzID0ganVzdENvdW50ID8gMCA6IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG4xICsgMTsgaSsrKSB7XG4gICAgICAgIHZhciBwID0gZmluZERvdHNBdFNlZ21lbnQuYXBwbHkoMCwgYmV6MS5jb25jYXQoaSAvIG4xKSk7XG4gICAgICAgIGRvdHMxLnB1c2goe1xuICAgICAgICAgIHg6IHAueCxcbiAgICAgICAgICB5OiBwLnksXG4gICAgICAgICAgdDogaSAvIG4xXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbjIgKyAxOyBpKyspIHtcbiAgICAgICAgcCA9IGZpbmREb3RzQXRTZWdtZW50LmFwcGx5KDAsIGJlejIuY29uY2F0KGkgLyBuMikpO1xuICAgICAgICBkb3RzMi5wdXNoKHtcbiAgICAgICAgICB4OiBwLngsXG4gICAgICAgICAgeTogcC55LFxuICAgICAgICAgIHQ6IGkgLyBuMlxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZm9yIChpID0gMDsgaSA8IG4xOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBuMjsgaisrKSB7XG4gICAgICAgICAgdmFyIGRpID0gZG90czFbaV0sXG4gICAgICAgICAgICAgIGRpMSA9IGRvdHMxW2kgKyAxXSxcbiAgICAgICAgICAgICAgZGogPSBkb3RzMltqXSxcbiAgICAgICAgICAgICAgZGoxID0gZG90czJbaiArIDFdLFxuICAgICAgICAgICAgICBjaSA9IGFicyhkaTEueCAtIGRpLngpIDwgLjAwMSA/IFwieVwiIDogXCJ4XCIsXG4gICAgICAgICAgICAgIGNqID0gYWJzKGRqMS54IC0gZGoueCkgPCAuMDAxID8gXCJ5XCIgOiBcInhcIixcbiAgICAgICAgICAgICAgaXMgPSBpbnRlcnNlY3QoZGkueCwgZGkueSwgZGkxLngsIGRpMS55LCBkai54LCBkai55LCBkajEueCwgZGoxLnkpO1xuXG4gICAgICAgICAgaWYgKGlzKSB7XG4gICAgICAgICAgICBpZiAoeHlbaXMueC50b0ZpeGVkKDQpXSA9PSBpcy55LnRvRml4ZWQoNCkpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHh5W2lzLngudG9GaXhlZCg0KV0gPSBpcy55LnRvRml4ZWQoNCk7XG4gICAgICAgICAgICB2YXIgdDEgPSBkaS50ICsgYWJzKChpc1tjaV0gLSBkaVtjaV0pIC8gKGRpMVtjaV0gLSBkaVtjaV0pKSAqIChkaTEudCAtIGRpLnQpLFxuICAgICAgICAgICAgICAgIHQyID0gZGoudCArIGFicygoaXNbY2pdIC0gZGpbY2pdKSAvIChkajFbY2pdIC0gZGpbY2pdKSkgKiAoZGoxLnQgLSBkai50KTtcblxuICAgICAgICAgICAgaWYgKHQxID49IDAgJiYgdDEgPD0gMSAmJiB0MiA+PSAwICYmIHQyIDw9IDEpIHtcbiAgICAgICAgICAgICAgaWYgKGp1c3RDb3VudCkge1xuICAgICAgICAgICAgICAgIHJlcysrO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIHg6IGlzLngsXG4gICAgICAgICAgICAgICAgICB5OiBpcy55LFxuICAgICAgICAgICAgICAgICAgdDE6IHQxLFxuICAgICAgICAgICAgICAgICAgdDI6IHQyXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXRoSW50ZXJzZWN0aW9uKHBhdGgxLCBwYXRoMikge1xuICAgICAgcmV0dXJuIGludGVyUGF0aEhlbHBlcihwYXRoMSwgcGF0aDIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhdGhJbnRlcnNlY3Rpb25OdW1iZXIocGF0aDEsIHBhdGgyKSB7XG4gICAgICByZXR1cm4gaW50ZXJQYXRoSGVscGVyKHBhdGgxLCBwYXRoMiwgMSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW50ZXJQYXRoSGVscGVyKHBhdGgxLCBwYXRoMiwganVzdENvdW50KSB7XG4gICAgICBwYXRoMSA9IHBhdGgyY3VydmUocGF0aDEpO1xuICAgICAgcGF0aDIgPSBwYXRoMmN1cnZlKHBhdGgyKTtcbiAgICAgIHZhciB4MSxcbiAgICAgICAgICB5MSxcbiAgICAgICAgICB4MixcbiAgICAgICAgICB5MixcbiAgICAgICAgICB4MW0sXG4gICAgICAgICAgeTFtLFxuICAgICAgICAgIHgybSxcbiAgICAgICAgICB5Mm0sXG4gICAgICAgICAgYmV6MSxcbiAgICAgICAgICBiZXoyLFxuICAgICAgICAgIHJlcyA9IGp1c3RDb3VudCA/IDAgOiBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcGF0aDEubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICB2YXIgcGkgPSBwYXRoMVtpXTtcblxuICAgICAgICBpZiAocGlbMF0gPT0gXCJNXCIpIHtcbiAgICAgICAgICB4MSA9IHgxbSA9IHBpWzFdO1xuICAgICAgICAgIHkxID0geTFtID0gcGlbMl07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHBpWzBdID09IFwiQ1wiKSB7XG4gICAgICAgICAgICBiZXoxID0gW3gxLCB5MV0uY29uY2F0KHBpLnNsaWNlKDEpKTtcbiAgICAgICAgICAgIHgxID0gYmV6MVs2XTtcbiAgICAgICAgICAgIHkxID0gYmV6MVs3XTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmV6MSA9IFt4MSwgeTEsIHgxLCB5MSwgeDFtLCB5MW0sIHgxbSwgeTFtXTtcbiAgICAgICAgICAgIHgxID0geDFtO1xuICAgICAgICAgICAgeTEgPSB5MW07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZm9yICh2YXIgaiA9IDAsIGpqID0gcGF0aDIubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgdmFyIHBqID0gcGF0aDJbal07XG5cbiAgICAgICAgICAgIGlmIChwalswXSA9PSBcIk1cIikge1xuICAgICAgICAgICAgICB4MiA9IHgybSA9IHBqWzFdO1xuICAgICAgICAgICAgICB5MiA9IHkybSA9IHBqWzJdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHBqWzBdID09IFwiQ1wiKSB7XG4gICAgICAgICAgICAgICAgYmV6MiA9IFt4MiwgeTJdLmNvbmNhdChwai5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgeDIgPSBiZXoyWzZdO1xuICAgICAgICAgICAgICAgIHkyID0gYmV6Mls3XTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiZXoyID0gW3gyLCB5MiwgeDIsIHkyLCB4Mm0sIHkybSwgeDJtLCB5Mm1dO1xuICAgICAgICAgICAgICAgIHgyID0geDJtO1xuICAgICAgICAgICAgICAgIHkyID0geTJtO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgdmFyIGludHIgPSBpbnRlckhlbHBlcihiZXoxLCBiZXoyLCBqdXN0Q291bnQpO1xuXG4gICAgICAgICAgICAgIGlmIChqdXN0Q291bnQpIHtcbiAgICAgICAgICAgICAgICByZXMgKz0gaW50cjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrID0gMCwga2sgPSBpbnRyLmxlbmd0aDsgayA8IGtrOyBrKyspIHtcbiAgICAgICAgICAgICAgICAgIGludHJba10uc2VnbWVudDEgPSBpO1xuICAgICAgICAgICAgICAgICAgaW50cltrXS5zZWdtZW50MiA9IGo7XG4gICAgICAgICAgICAgICAgICBpbnRyW2tdLmJlejEgPSBiZXoxO1xuICAgICAgICAgICAgICAgICAgaW50cltrXS5iZXoyID0gYmV6MjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXMgPSByZXMuY29uY2F0KGludHIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNQb2ludEluc2lkZVBhdGgocGF0aCwgeCwgeSkge1xuICAgICAgdmFyIGJib3ggPSBwYXRoQkJveChwYXRoKTtcbiAgICAgIHJldHVybiBpc1BvaW50SW5zaWRlQkJveChiYm94LCB4LCB5KSAmJiBpbnRlclBhdGhIZWxwZXIocGF0aCwgW1tcIk1cIiwgeCwgeV0sIFtcIkhcIiwgYmJveC54MiArIDEwXV0sIDEpICUgMiA9PSAxO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhdGhCQm94KHBhdGgpIHtcbiAgICAgIHZhciBwdGggPSBwYXRocyhwYXRoKTtcblxuICAgICAgaWYgKHB0aC5iYm94KSB7XG4gICAgICAgIHJldHVybiBjbG9uZShwdGguYmJveCk7XG4gICAgICB9XG5cbiAgICAgIGlmICghcGF0aCkge1xuICAgICAgICByZXR1cm4gYm94KCk7XG4gICAgICB9XG5cbiAgICAgIHBhdGggPSBwYXRoMmN1cnZlKHBhdGgpO1xuICAgICAgdmFyIHggPSAwLFxuICAgICAgICAgIHkgPSAwLFxuICAgICAgICAgIFggPSBbXSxcbiAgICAgICAgICBZID0gW10sXG4gICAgICAgICAgcDtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcGF0aC5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgIHAgPSBwYXRoW2ldO1xuXG4gICAgICAgIGlmIChwWzBdID09IFwiTVwiKSB7XG4gICAgICAgICAgeCA9IHBbMV07XG4gICAgICAgICAgeSA9IHBbMl07XG4gICAgICAgICAgWC5wdXNoKHgpO1xuICAgICAgICAgIFkucHVzaCh5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgZGltID0gY3VydmVEaW0oeCwgeSwgcFsxXSwgcFsyXSwgcFszXSwgcFs0XSwgcFs1XSwgcFs2XSk7XG4gICAgICAgICAgWCA9IFguY29uY2F0KGRpbS5taW4ueCwgZGltLm1heC54KTtcbiAgICAgICAgICBZID0gWS5jb25jYXQoZGltLm1pbi55LCBkaW0ubWF4LnkpO1xuICAgICAgICAgIHggPSBwWzVdO1xuICAgICAgICAgIHkgPSBwWzZdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciB4bWluID0gbW1pbi5hcHBseSgwLCBYKSxcbiAgICAgICAgICB5bWluID0gbW1pbi5hcHBseSgwLCBZKSxcbiAgICAgICAgICB4bWF4ID0gbW1heC5hcHBseSgwLCBYKSxcbiAgICAgICAgICB5bWF4ID0gbW1heC5hcHBseSgwLCBZKSxcbiAgICAgICAgICBiYiA9IGJveCh4bWluLCB5bWluLCB4bWF4IC0geG1pbiwgeW1heCAtIHltaW4pO1xuICAgICAgcHRoLmJib3ggPSBjbG9uZShiYik7XG4gICAgICByZXR1cm4gYmI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVjdFBhdGgoeCwgeSwgdywgaCwgcikge1xuICAgICAgaWYgKHIpIHtcbiAgICAgICAgcmV0dXJuIFtbXCJNXCIsICt4ICsgK3IsIHldLCBbXCJsXCIsIHcgLSByICogMiwgMF0sIFtcImFcIiwgciwgciwgMCwgMCwgMSwgciwgcl0sIFtcImxcIiwgMCwgaCAtIHIgKiAyXSwgW1wiYVwiLCByLCByLCAwLCAwLCAxLCAtciwgcl0sIFtcImxcIiwgciAqIDIgLSB3LCAwXSwgW1wiYVwiLCByLCByLCAwLCAwLCAxLCAtciwgLXJdLCBbXCJsXCIsIDAsIHIgKiAyIC0gaF0sIFtcImFcIiwgciwgciwgMCwgMCwgMSwgciwgLXJdLCBbXCJ6XCJdXTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcyA9IFtbXCJNXCIsIHgsIHldLCBbXCJsXCIsIHcsIDBdLCBbXCJsXCIsIDAsIGhdLCBbXCJsXCIsIC13LCAwXSwgW1wielwiXV07XG4gICAgICByZXMudG9TdHJpbmcgPSB0b1N0cmluZztcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZWxsaXBzZVBhdGgoeCwgeSwgcngsIHJ5LCBhKSB7XG4gICAgICBpZiAoYSA9PSBudWxsICYmIHJ5ID09IG51bGwpIHtcbiAgICAgICAgcnkgPSByeDtcbiAgICAgIH1cblxuICAgICAgeCA9ICt4O1xuICAgICAgeSA9ICt5O1xuICAgICAgcnggPSArcng7XG4gICAgICByeSA9ICtyeTtcblxuICAgICAgaWYgKGEgIT0gbnVsbCkge1xuICAgICAgICB2YXIgcmFkID0gTWF0aC5QSSAvIDE4MCxcbiAgICAgICAgICAgIHgxID0geCArIHJ4ICogTWF0aC5jb3MoLXJ5ICogcmFkKSxcbiAgICAgICAgICAgIHgyID0geCArIHJ4ICogTWF0aC5jb3MoLWEgKiByYWQpLFxuICAgICAgICAgICAgeTEgPSB5ICsgcnggKiBNYXRoLnNpbigtcnkgKiByYWQpLFxuICAgICAgICAgICAgeTIgPSB5ICsgcnggKiBNYXRoLnNpbigtYSAqIHJhZCksXG4gICAgICAgICAgICByZXMgPSBbW1wiTVwiLCB4MSwgeTFdLCBbXCJBXCIsIHJ4LCByeCwgMCwgKyhhIC0gcnkgPiAxODApLCAwLCB4MiwgeTJdXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcyA9IFtbXCJNXCIsIHgsIHldLCBbXCJtXCIsIDAsIC1yeV0sIFtcImFcIiwgcngsIHJ5LCAwLCAxLCAxLCAwLCAyICogcnldLCBbXCJhXCIsIHJ4LCByeSwgMCwgMSwgMSwgMCwgLTIgKiByeV0sIFtcInpcIl1dO1xuICAgICAgfVxuXG4gICAgICByZXMudG9TdHJpbmcgPSB0b1N0cmluZztcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgdmFyIHVuaXQycHggPSBTbmFwLl91bml0MnB4LFxuICAgICAgICBnZXRQYXRoID0ge1xuICAgICAgcGF0aDogZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHJldHVybiBlbC5hdHRyKFwicGF0aFwiKTtcbiAgICAgIH0sXG4gICAgICBjaXJjbGU6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICB2YXIgYXR0ciA9IHVuaXQycHgoZWwpO1xuICAgICAgICByZXR1cm4gZWxsaXBzZVBhdGgoYXR0ci5jeCwgYXR0ci5jeSwgYXR0ci5yKTtcbiAgICAgIH0sXG4gICAgICBlbGxpcHNlOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgdmFyIGF0dHIgPSB1bml0MnB4KGVsKTtcbiAgICAgICAgcmV0dXJuIGVsbGlwc2VQYXRoKGF0dHIuY3ggfHwgMCwgYXR0ci5jeSB8fCAwLCBhdHRyLnJ4LCBhdHRyLnJ5KTtcbiAgICAgIH0sXG4gICAgICByZWN0OiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgdmFyIGF0dHIgPSB1bml0MnB4KGVsKTtcbiAgICAgICAgcmV0dXJuIHJlY3RQYXRoKGF0dHIueCB8fCAwLCBhdHRyLnkgfHwgMCwgYXR0ci53aWR0aCwgYXR0ci5oZWlnaHQsIGF0dHIucngsIGF0dHIucnkpO1xuICAgICAgfSxcbiAgICAgIGltYWdlOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgdmFyIGF0dHIgPSB1bml0MnB4KGVsKTtcbiAgICAgICAgcmV0dXJuIHJlY3RQYXRoKGF0dHIueCB8fCAwLCBhdHRyLnkgfHwgMCwgYXR0ci53aWR0aCwgYXR0ci5oZWlnaHQpO1xuICAgICAgfSxcbiAgICAgIGxpbmU6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICByZXR1cm4gXCJNXCIgKyBbZWwuYXR0cihcIngxXCIpIHx8IDAsIGVsLmF0dHIoXCJ5MVwiKSB8fCAwLCBlbC5hdHRyKFwieDJcIiksIGVsLmF0dHIoXCJ5MlwiKV07XG4gICAgICB9LFxuICAgICAgcG9seWxpbmU6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICByZXR1cm4gXCJNXCIgKyBlbC5hdHRyKFwicG9pbnRzXCIpO1xuICAgICAgfSxcbiAgICAgIHBvbHlnb246IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICByZXR1cm4gXCJNXCIgKyBlbC5hdHRyKFwicG9pbnRzXCIpICsgXCJ6XCI7XG4gICAgICB9LFxuICAgICAgZGVmbHQ6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICB2YXIgYmJveCA9IGVsLm5vZGUuZ2V0QkJveCgpO1xuICAgICAgICByZXR1cm4gcmVjdFBhdGgoYmJveC54LCBiYm94LnksIGJib3gud2lkdGgsIGJib3guaGVpZ2h0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcGF0aFRvUmVsYXRpdmUocGF0aEFycmF5KSB7XG4gICAgICB2YXIgcHRoID0gcGF0aHMocGF0aEFycmF5KSxcbiAgICAgICAgICBsb3dlckNhc2UgPSBTdHJpbmcucHJvdG90eXBlLnRvTG93ZXJDYXNlO1xuXG4gICAgICBpZiAocHRoLnJlbCkge1xuICAgICAgICByZXR1cm4gcGF0aENsb25lKHB0aC5yZWwpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIVNuYXAuaXMocGF0aEFycmF5LCBcImFycmF5XCIpIHx8ICFTbmFwLmlzKHBhdGhBcnJheSAmJiBwYXRoQXJyYXlbMF0sIFwiYXJyYXlcIikpIHtcbiAgICAgICAgcGF0aEFycmF5ID0gU25hcC5wYXJzZVBhdGhTdHJpbmcocGF0aEFycmF5KTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcyA9IFtdLFxuICAgICAgICAgIHggPSAwLFxuICAgICAgICAgIHkgPSAwLFxuICAgICAgICAgIG14ID0gMCxcbiAgICAgICAgICBteSA9IDAsXG4gICAgICAgICAgc3RhcnQgPSAwO1xuXG4gICAgICBpZiAocGF0aEFycmF5WzBdWzBdID09IFwiTVwiKSB7XG4gICAgICAgIHggPSBwYXRoQXJyYXlbMF1bMV07XG4gICAgICAgIHkgPSBwYXRoQXJyYXlbMF1bMl07XG4gICAgICAgIG14ID0geDtcbiAgICAgICAgbXkgPSB5O1xuICAgICAgICBzdGFydCsrO1xuICAgICAgICByZXMucHVzaChbXCJNXCIsIHgsIHldKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0LCBpaSA9IHBhdGhBcnJheS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgIHZhciByID0gcmVzW2ldID0gW10sXG4gICAgICAgICAgICBwYSA9IHBhdGhBcnJheVtpXTtcblxuICAgICAgICBpZiAocGFbMF0gIT0gbG93ZXJDYXNlLmNhbGwocGFbMF0pKSB7XG4gICAgICAgICAgclswXSA9IGxvd2VyQ2FzZS5jYWxsKHBhWzBdKTtcblxuICAgICAgICAgIHN3aXRjaCAoclswXSkge1xuICAgICAgICAgICAgY2FzZSBcImFcIjpcbiAgICAgICAgICAgICAgclsxXSA9IHBhWzFdO1xuICAgICAgICAgICAgICByWzJdID0gcGFbMl07XG4gICAgICAgICAgICAgIHJbM10gPSBwYVszXTtcbiAgICAgICAgICAgICAgcls0XSA9IHBhWzRdO1xuICAgICAgICAgICAgICByWzVdID0gcGFbNV07XG4gICAgICAgICAgICAgIHJbNl0gPSArKHBhWzZdIC0geCkudG9GaXhlZCgzKTtcbiAgICAgICAgICAgICAgcls3XSA9ICsocGFbN10gLSB5KS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcInZcIjpcbiAgICAgICAgICAgICAgclsxXSA9ICsocGFbMV0gLSB5KS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcIm1cIjpcbiAgICAgICAgICAgICAgbXggPSBwYVsxXTtcbiAgICAgICAgICAgICAgbXkgPSBwYVsyXTtcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDEsIGpqID0gcGEubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgIHJbal0gPSArKHBhW2pdIC0gKGogJSAyID8geCA6IHkpKS50b0ZpeGVkKDMpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgciA9IHJlc1tpXSA9IFtdO1xuXG4gICAgICAgICAgaWYgKHBhWzBdID09IFwibVwiKSB7XG4gICAgICAgICAgICBteCA9IHBhWzFdICsgeDtcbiAgICAgICAgICAgIG15ID0gcGFbMl0gKyB5O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZvciAodmFyIGsgPSAwLCBrayA9IHBhLmxlbmd0aDsgayA8IGtrOyBrKyspIHtcbiAgICAgICAgICAgIHJlc1tpXVtrXSA9IHBhW2tdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW4gPSByZXNbaV0ubGVuZ3RoO1xuXG4gICAgICAgIHN3aXRjaCAocmVzW2ldWzBdKSB7XG4gICAgICAgICAgY2FzZSBcInpcIjpcbiAgICAgICAgICAgIHggPSBteDtcbiAgICAgICAgICAgIHkgPSBteTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBcImhcIjpcbiAgICAgICAgICAgIHggKz0gK3Jlc1tpXVtsZW4gLSAxXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBcInZcIjpcbiAgICAgICAgICAgIHkgKz0gK3Jlc1tpXVtsZW4gLSAxXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHggKz0gK3Jlc1tpXVtsZW4gLSAyXTtcbiAgICAgICAgICAgIHkgKz0gK3Jlc1tpXVtsZW4gLSAxXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXMudG9TdHJpbmcgPSB0b1N0cmluZztcbiAgICAgIHB0aC5yZWwgPSBwYXRoQ2xvbmUocmVzKTtcbiAgICAgIHJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGF0aFRvQWJzb2x1dGUocGF0aEFycmF5KSB7XG4gICAgICB2YXIgcHRoID0gcGF0aHMocGF0aEFycmF5KTtcblxuICAgICAgaWYgKHB0aC5hYnMpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhDbG9uZShwdGguYWJzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpcyhwYXRoQXJyYXksIFwiYXJyYXlcIikgfHwgIWlzKHBhdGhBcnJheSAmJiBwYXRoQXJyYXlbMF0sIFwiYXJyYXlcIikpIHtcbiAgICAgICAgLy8gcm91Z2ggYXNzdW1wdGlvblxuICAgICAgICBwYXRoQXJyYXkgPSBTbmFwLnBhcnNlUGF0aFN0cmluZyhwYXRoQXJyYXkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXBhdGhBcnJheSB8fCAhcGF0aEFycmF5Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gW1tcIk1cIiwgMCwgMF1dO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzID0gW10sXG4gICAgICAgICAgeCA9IDAsXG4gICAgICAgICAgeSA9IDAsXG4gICAgICAgICAgbXggPSAwLFxuICAgICAgICAgIG15ID0gMCxcbiAgICAgICAgICBzdGFydCA9IDAsXG4gICAgICAgICAgcGEwO1xuXG4gICAgICBpZiAocGF0aEFycmF5WzBdWzBdID09IFwiTVwiKSB7XG4gICAgICAgIHggPSArcGF0aEFycmF5WzBdWzFdO1xuICAgICAgICB5ID0gK3BhdGhBcnJheVswXVsyXTtcbiAgICAgICAgbXggPSB4O1xuICAgICAgICBteSA9IHk7XG4gICAgICAgIHN0YXJ0Kys7XG4gICAgICAgIHJlc1swXSA9IFtcIk1cIiwgeCwgeV07XG4gICAgICB9XG5cbiAgICAgIHZhciBjcnogPSBwYXRoQXJyYXkubGVuZ3RoID09IDMgJiYgcGF0aEFycmF5WzBdWzBdID09IFwiTVwiICYmIHBhdGhBcnJheVsxXVswXS50b1VwcGVyQ2FzZSgpID09IFwiUlwiICYmIHBhdGhBcnJheVsyXVswXS50b1VwcGVyQ2FzZSgpID09IFwiWlwiO1xuXG4gICAgICBmb3IgKHZhciByLCBwYSwgaSA9IHN0YXJ0LCBpaSA9IHBhdGhBcnJheS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgIHJlcy5wdXNoKHIgPSBbXSk7XG4gICAgICAgIHBhID0gcGF0aEFycmF5W2ldO1xuICAgICAgICBwYTAgPSBwYVswXTtcblxuICAgICAgICBpZiAocGEwICE9IHBhMC50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgICAgclswXSA9IHBhMC50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgICAgc3dpdGNoIChyWzBdKSB7XG4gICAgICAgICAgICBjYXNlIFwiQVwiOlxuICAgICAgICAgICAgICByWzFdID0gcGFbMV07XG4gICAgICAgICAgICAgIHJbMl0gPSBwYVsyXTtcbiAgICAgICAgICAgICAgclszXSA9IHBhWzNdO1xuICAgICAgICAgICAgICByWzRdID0gcGFbNF07XG4gICAgICAgICAgICAgIHJbNV0gPSBwYVs1XTtcbiAgICAgICAgICAgICAgcls2XSA9ICtwYVs2XSArIHg7XG4gICAgICAgICAgICAgIHJbN10gPSArcGFbN10gKyB5O1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcIlZcIjpcbiAgICAgICAgICAgICAgclsxXSA9ICtwYVsxXSArIHk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFwiSFwiOlxuICAgICAgICAgICAgICByWzFdID0gK3BhWzFdICsgeDtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJSXCI6XG4gICAgICAgICAgICAgIHZhciBkb3RzID0gW3gsIHldLmNvbmNhdChwYS5zbGljZSgxKSk7XG5cbiAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDIsIGpqID0gZG90cy5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgICAgICAgZG90c1tqXSA9ICtkb3RzW2pdICsgeDtcbiAgICAgICAgICAgICAgICBkb3RzWysral0gPSArZG90c1tqXSArIHk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICByZXMucG9wKCk7XG4gICAgICAgICAgICAgIHJlcyA9IHJlcy5jb25jYXQoY2F0bXVsbFJvbTJiZXppZXIoZG90cywgY3J6KSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFwiT1wiOlxuICAgICAgICAgICAgICByZXMucG9wKCk7XG4gICAgICAgICAgICAgIGRvdHMgPSBlbGxpcHNlUGF0aCh4LCB5LCBwYVsxXSwgcGFbMl0pO1xuICAgICAgICAgICAgICBkb3RzLnB1c2goZG90c1swXSk7XG4gICAgICAgICAgICAgIHJlcyA9IHJlcy5jb25jYXQoZG90cyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFwiVVwiOlxuICAgICAgICAgICAgICByZXMucG9wKCk7XG4gICAgICAgICAgICAgIHJlcyA9IHJlcy5jb25jYXQoZWxsaXBzZVBhdGgoeCwgeSwgcGFbMV0sIHBhWzJdLCBwYVszXSkpO1xuICAgICAgICAgICAgICByID0gW1wiVVwiXS5jb25jYXQocmVzW3Jlcy5sZW5ndGggLSAxXS5zbGljZSgtMikpO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcIk1cIjpcbiAgICAgICAgICAgICAgbXggPSArcGFbMV0gKyB4O1xuICAgICAgICAgICAgICBteSA9ICtwYVsyXSArIHk7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgIGZvciAoaiA9IDEsIGpqID0gcGEubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgICAgICAgIHJbal0gPSArcGFbal0gKyAoaiAlIDIgPyB4IDogeSk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYTAgPT0gXCJSXCIpIHtcbiAgICAgICAgICBkb3RzID0gW3gsIHldLmNvbmNhdChwYS5zbGljZSgxKSk7XG4gICAgICAgICAgcmVzLnBvcCgpO1xuICAgICAgICAgIHJlcyA9IHJlcy5jb25jYXQoY2F0bXVsbFJvbTJiZXppZXIoZG90cywgY3J6KSk7XG4gICAgICAgICAgciA9IFtcIlJcIl0uY29uY2F0KHBhLnNsaWNlKC0yKSk7XG4gICAgICAgIH0gZWxzZSBpZiAocGEwID09IFwiT1wiKSB7XG4gICAgICAgICAgcmVzLnBvcCgpO1xuICAgICAgICAgIGRvdHMgPSBlbGxpcHNlUGF0aCh4LCB5LCBwYVsxXSwgcGFbMl0pO1xuICAgICAgICAgIGRvdHMucHVzaChkb3RzWzBdKTtcbiAgICAgICAgICByZXMgPSByZXMuY29uY2F0KGRvdHMpO1xuICAgICAgICB9IGVsc2UgaWYgKHBhMCA9PSBcIlVcIikge1xuICAgICAgICAgIHJlcy5wb3AoKTtcbiAgICAgICAgICByZXMgPSByZXMuY29uY2F0KGVsbGlwc2VQYXRoKHgsIHksIHBhWzFdLCBwYVsyXSwgcGFbM10pKTtcbiAgICAgICAgICByID0gW1wiVVwiXS5jb25jYXQocmVzW3Jlcy5sZW5ndGggLSAxXS5zbGljZSgtMikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIGsgPSAwLCBrayA9IHBhLmxlbmd0aDsgayA8IGtrOyBrKyspIHtcbiAgICAgICAgICAgIHJba10gPSBwYVtrXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwYTAgPSBwYTAudG9VcHBlckNhc2UoKTtcblxuICAgICAgICBpZiAocGEwICE9IFwiT1wiKSB7XG4gICAgICAgICAgc3dpdGNoIChyWzBdKSB7XG4gICAgICAgICAgICBjYXNlIFwiWlwiOlxuICAgICAgICAgICAgICB4ID0gK214O1xuICAgICAgICAgICAgICB5ID0gK215O1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBcIkhcIjpcbiAgICAgICAgICAgICAgeCA9IHJbMV07XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIFwiVlwiOlxuICAgICAgICAgICAgICB5ID0gclsxXTtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgXCJNXCI6XG4gICAgICAgICAgICAgIG14ID0gcltyLmxlbmd0aCAtIDJdO1xuICAgICAgICAgICAgICBteSA9IHJbci5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgeCA9IHJbci5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgICAgeSA9IHJbci5sZW5ndGggLSAxXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVzLnRvU3RyaW5nID0gdG9TdHJpbmc7XG4gICAgICBwdGguYWJzID0gcGF0aENsb25lKHJlcyk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGwyYyh4MSwgeTEsIHgyLCB5Mikge1xuICAgICAgcmV0dXJuIFt4MSwgeTEsIHgyLCB5MiwgeDIsIHkyXTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBxMmMoeDEsIHkxLCBheCwgYXksIHgyLCB5Mikge1xuICAgICAgdmFyIF8xMyA9IDEgLyAzLFxuICAgICAgICAgIF8yMyA9IDIgLyAzO1xuXG4gICAgICByZXR1cm4gW18xMyAqIHgxICsgXzIzICogYXgsIF8xMyAqIHkxICsgXzIzICogYXksIF8xMyAqIHgyICsgXzIzICogYXgsIF8xMyAqIHkyICsgXzIzICogYXksIHgyLCB5Ml07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYTJjKHgxLCB5MSwgcngsIHJ5LCBhbmdsZSwgbGFyZ2VfYXJjX2ZsYWcsIHN3ZWVwX2ZsYWcsIHgyLCB5MiwgcmVjdXJzaXZlKSB7XG4gICAgICAvLyBmb3IgbW9yZSBpbmZvcm1hdGlvbiBvZiB3aGVyZSB0aGlzIG1hdGggY2FtZSBmcm9tIHZpc2l0OlxuICAgICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHMTEvaW1wbG5vdGUuaHRtbCNBcmNJbXBsZW1lbnRhdGlvbk5vdGVzXG4gICAgICB2YXIgXzEyMCA9IFBJICogMTIwIC8gMTgwLFxuICAgICAgICAgIHJhZCA9IFBJIC8gMTgwICogKCthbmdsZSB8fCAwKSxcbiAgICAgICAgICByZXMgPSBbXSxcbiAgICAgICAgICB4eSxcbiAgICAgICAgICByb3RhdGUgPSBTbmFwLl8uY2FjaGVyKGZ1bmN0aW9uICh4LCB5LCByYWQpIHtcbiAgICAgICAgdmFyIFggPSB4ICogbWF0aC5jb3MocmFkKSAtIHkgKiBtYXRoLnNpbihyYWQpLFxuICAgICAgICAgICAgWSA9IHggKiBtYXRoLnNpbihyYWQpICsgeSAqIG1hdGguY29zKHJhZCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogWCxcbiAgICAgICAgICB5OiBZXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgaWYgKCFyeCB8fCAhcnkpIHtcbiAgICAgICAgcmV0dXJuIFt4MSwgeTEsIHgyLCB5MiwgeDIsIHkyXTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZWN1cnNpdmUpIHtcbiAgICAgICAgeHkgPSByb3RhdGUoeDEsIHkxLCAtcmFkKTtcbiAgICAgICAgeDEgPSB4eS54O1xuICAgICAgICB5MSA9IHh5Lnk7XG4gICAgICAgIHh5ID0gcm90YXRlKHgyLCB5MiwgLXJhZCk7XG4gICAgICAgIHgyID0geHkueDtcbiAgICAgICAgeTIgPSB4eS55O1xuICAgICAgICB2YXIgY29zID0gbWF0aC5jb3MoUEkgLyAxODAgKiBhbmdsZSksXG4gICAgICAgICAgICBzaW4gPSBtYXRoLnNpbihQSSAvIDE4MCAqIGFuZ2xlKSxcbiAgICAgICAgICAgIHggPSAoeDEgLSB4MikgLyAyLFxuICAgICAgICAgICAgeSA9ICh5MSAtIHkyKSAvIDI7XG4gICAgICAgIHZhciBoID0geCAqIHggLyAocnggKiByeCkgKyB5ICogeSAvIChyeSAqIHJ5KTtcblxuICAgICAgICBpZiAoaCA+IDEpIHtcbiAgICAgICAgICBoID0gbWF0aC5zcXJ0KGgpO1xuICAgICAgICAgIHJ4ID0gaCAqIHJ4O1xuICAgICAgICAgIHJ5ID0gaCAqIHJ5O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJ4MiA9IHJ4ICogcngsXG4gICAgICAgICAgICByeTIgPSByeSAqIHJ5LFxuICAgICAgICAgICAgayA9IChsYXJnZV9hcmNfZmxhZyA9PSBzd2VlcF9mbGFnID8gLTEgOiAxKSAqIG1hdGguc3FydChhYnMoKHJ4MiAqIHJ5MiAtIHJ4MiAqIHkgKiB5IC0gcnkyICogeCAqIHgpIC8gKHJ4MiAqIHkgKiB5ICsgcnkyICogeCAqIHgpKSksXG4gICAgICAgICAgICBjeCA9IGsgKiByeCAqIHkgLyByeSArICh4MSArIHgyKSAvIDIsXG4gICAgICAgICAgICBjeSA9IGsgKiAtcnkgKiB4IC8gcnggKyAoeTEgKyB5MikgLyAyLFxuICAgICAgICAgICAgZjEgPSBtYXRoLmFzaW4oKCh5MSAtIGN5KSAvIHJ5KS50b0ZpeGVkKDkpKSxcbiAgICAgICAgICAgIGYyID0gbWF0aC5hc2luKCgoeTIgLSBjeSkgLyByeSkudG9GaXhlZCg5KSk7XG4gICAgICAgIGYxID0geDEgPCBjeCA/IFBJIC0gZjEgOiBmMTtcbiAgICAgICAgZjIgPSB4MiA8IGN4ID8gUEkgLSBmMiA6IGYyO1xuICAgICAgICBmMSA8IDAgJiYgKGYxID0gUEkgKiAyICsgZjEpO1xuICAgICAgICBmMiA8IDAgJiYgKGYyID0gUEkgKiAyICsgZjIpO1xuXG4gICAgICAgIGlmIChzd2VlcF9mbGFnICYmIGYxID4gZjIpIHtcbiAgICAgICAgICBmMSA9IGYxIC0gUEkgKiAyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzd2VlcF9mbGFnICYmIGYyID4gZjEpIHtcbiAgICAgICAgICBmMiA9IGYyIC0gUEkgKiAyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmMSA9IHJlY3Vyc2l2ZVswXTtcbiAgICAgICAgZjIgPSByZWN1cnNpdmVbMV07XG4gICAgICAgIGN4ID0gcmVjdXJzaXZlWzJdO1xuICAgICAgICBjeSA9IHJlY3Vyc2l2ZVszXTtcbiAgICAgIH1cblxuICAgICAgdmFyIGRmID0gZjIgLSBmMTtcblxuICAgICAgaWYgKGFicyhkZikgPiBfMTIwKSB7XG4gICAgICAgIHZhciBmMm9sZCA9IGYyLFxuICAgICAgICAgICAgeDJvbGQgPSB4MixcbiAgICAgICAgICAgIHkyb2xkID0geTI7XG4gICAgICAgIGYyID0gZjEgKyBfMTIwICogKHN3ZWVwX2ZsYWcgJiYgZjIgPiBmMSA/IDEgOiAtMSk7XG4gICAgICAgIHgyID0gY3ggKyByeCAqIG1hdGguY29zKGYyKTtcbiAgICAgICAgeTIgPSBjeSArIHJ5ICogbWF0aC5zaW4oZjIpO1xuICAgICAgICByZXMgPSBhMmMoeDIsIHkyLCByeCwgcnksIGFuZ2xlLCAwLCBzd2VlcF9mbGFnLCB4Mm9sZCwgeTJvbGQsIFtmMiwgZjJvbGQsIGN4LCBjeV0pO1xuICAgICAgfVxuXG4gICAgICBkZiA9IGYyIC0gZjE7XG4gICAgICB2YXIgYzEgPSBtYXRoLmNvcyhmMSksXG4gICAgICAgICAgczEgPSBtYXRoLnNpbihmMSksXG4gICAgICAgICAgYzIgPSBtYXRoLmNvcyhmMiksXG4gICAgICAgICAgczIgPSBtYXRoLnNpbihmMiksXG4gICAgICAgICAgdCA9IG1hdGgudGFuKGRmIC8gNCksXG4gICAgICAgICAgaHggPSA0IC8gMyAqIHJ4ICogdCxcbiAgICAgICAgICBoeSA9IDQgLyAzICogcnkgKiB0LFxuICAgICAgICAgIG0xID0gW3gxLCB5MV0sXG4gICAgICAgICAgbTIgPSBbeDEgKyBoeCAqIHMxLCB5MSAtIGh5ICogYzFdLFxuICAgICAgICAgIG0zID0gW3gyICsgaHggKiBzMiwgeTIgLSBoeSAqIGMyXSxcbiAgICAgICAgICBtNCA9IFt4MiwgeTJdO1xuICAgICAgbTJbMF0gPSAyICogbTFbMF0gLSBtMlswXTtcbiAgICAgIG0yWzFdID0gMiAqIG0xWzFdIC0gbTJbMV07XG5cbiAgICAgIGlmIChyZWN1cnNpdmUpIHtcbiAgICAgICAgcmV0dXJuIFttMiwgbTMsIG00XS5jb25jYXQocmVzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcyA9IFttMiwgbTMsIG00XS5jb25jYXQocmVzKS5qb2luKCkuc3BsaXQoXCIsXCIpO1xuICAgICAgICB2YXIgbmV3cmVzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gcmVzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgICBuZXdyZXNbaV0gPSBpICUgMiA/IHJvdGF0ZShyZXNbaSAtIDFdLCByZXNbaV0sIHJhZCkueSA6IHJvdGF0ZShyZXNbaV0sIHJlc1tpICsgMV0sIHJhZCkueDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXdyZXM7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZERvdEF0U2VnbWVudChwMXgsIHAxeSwgYzF4LCBjMXksIGMyeCwgYzJ5LCBwMngsIHAyeSwgdCkge1xuICAgICAgdmFyIHQxID0gMSAtIHQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiBwb3codDEsIDMpICogcDF4ICsgcG93KHQxLCAyKSAqIDMgKiB0ICogYzF4ICsgdDEgKiAzICogdCAqIHQgKiBjMnggKyBwb3codCwgMykgKiBwMngsXG4gICAgICAgIHk6IHBvdyh0MSwgMykgKiBwMXkgKyBwb3codDEsIDIpICogMyAqIHQgKiBjMXkgKyB0MSAqIDMgKiB0ICogdCAqIGMyeSArIHBvdyh0LCAzKSAqIHAyeVxuICAgICAgfTtcbiAgICB9IC8vIFJldHVybnMgYm91bmRpbmcgYm94IG9mIGN1YmljIGJlemllciBjdXJ2ZS5cbiAgICAvLyBTb3VyY2U6IGh0dHA6Ly9ibG9nLmhhY2tlcnMtY2FmZS5uZXQvMjAwOS8wNi9ob3ctdG8tY2FsY3VsYXRlLWJlemllci1jdXJ2ZXMtYm91bmRpbmcuaHRtbFxuICAgIC8vIE9yaWdpbmFsIHZlcnNpb246IE5JU0hJTyBIaXJva2F6dVxuICAgIC8vIE1vZGlmaWNhdGlvbnM6IGh0dHBzOi8vZ2l0aHViLmNvbS90aW1vMjIzNDVcblxuXG4gICAgZnVuY3Rpb24gY3VydmVEaW0oeDAsIHkwLCB4MSwgeTEsIHgyLCB5MiwgeDMsIHkzKSB7XG4gICAgICB2YXIgdHZhbHVlcyA9IFtdLFxuICAgICAgICAgIGJvdW5kcyA9IFtbXSwgW11dLFxuICAgICAgICAgIGEsXG4gICAgICAgICAgYixcbiAgICAgICAgICBjLFxuICAgICAgICAgIHQsXG4gICAgICAgICAgdDEsXG4gICAgICAgICAgdDIsXG4gICAgICAgICAgYjJhYyxcbiAgICAgICAgICBzcXJ0YjJhYztcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyOyArK2kpIHtcbiAgICAgICAgaWYgKGkgPT0gMCkge1xuICAgICAgICAgIGIgPSA2ICogeDAgLSAxMiAqIHgxICsgNiAqIHgyO1xuICAgICAgICAgIGEgPSAtMyAqIHgwICsgOSAqIHgxIC0gOSAqIHgyICsgMyAqIHgzO1xuICAgICAgICAgIGMgPSAzICogeDEgLSAzICogeDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYiA9IDYgKiB5MCAtIDEyICogeTEgKyA2ICogeTI7XG4gICAgICAgICAgYSA9IC0zICogeTAgKyA5ICogeTEgLSA5ICogeTIgKyAzICogeTM7XG4gICAgICAgICAgYyA9IDMgKiB5MSAtIDMgKiB5MDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhYnMoYSkgPCAxZS0xMikge1xuICAgICAgICAgIGlmIChhYnMoYikgPCAxZS0xMikge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdCA9IC1jIC8gYjtcblxuICAgICAgICAgIGlmICgwIDwgdCAmJiB0IDwgMSkge1xuICAgICAgICAgICAgdHZhbHVlcy5wdXNoKHQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgYjJhYyA9IGIgKiBiIC0gNCAqIGMgKiBhO1xuICAgICAgICBzcXJ0YjJhYyA9IG1hdGguc3FydChiMmFjKTtcblxuICAgICAgICBpZiAoYjJhYyA8IDApIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHQxID0gKC1iICsgc3FydGIyYWMpIC8gKDIgKiBhKTtcblxuICAgICAgICBpZiAoMCA8IHQxICYmIHQxIDwgMSkge1xuICAgICAgICAgIHR2YWx1ZXMucHVzaCh0MSk7XG4gICAgICAgIH1cblxuICAgICAgICB0MiA9ICgtYiAtIHNxcnRiMmFjKSAvICgyICogYSk7XG5cbiAgICAgICAgaWYgKDAgPCB0MiAmJiB0MiA8IDEpIHtcbiAgICAgICAgICB0dmFsdWVzLnB1c2godDIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciB4LFxuICAgICAgICAgIHksXG4gICAgICAgICAgaiA9IHR2YWx1ZXMubGVuZ3RoLFxuICAgICAgICAgIGpsZW4gPSBqLFxuICAgICAgICAgIG10O1xuXG4gICAgICB3aGlsZSAoai0tKSB7XG4gICAgICAgIHQgPSB0dmFsdWVzW2pdO1xuICAgICAgICBtdCA9IDEgLSB0O1xuICAgICAgICBib3VuZHNbMF1bal0gPSBtdCAqIG10ICogbXQgKiB4MCArIDMgKiBtdCAqIG10ICogdCAqIHgxICsgMyAqIG10ICogdCAqIHQgKiB4MiArIHQgKiB0ICogdCAqIHgzO1xuICAgICAgICBib3VuZHNbMV1bal0gPSBtdCAqIG10ICogbXQgKiB5MCArIDMgKiBtdCAqIG10ICogdCAqIHkxICsgMyAqIG10ICogdCAqIHQgKiB5MiArIHQgKiB0ICogdCAqIHkzO1xuICAgICAgfVxuXG4gICAgICBib3VuZHNbMF1bamxlbl0gPSB4MDtcbiAgICAgIGJvdW5kc1sxXVtqbGVuXSA9IHkwO1xuICAgICAgYm91bmRzWzBdW2psZW4gKyAxXSA9IHgzO1xuICAgICAgYm91bmRzWzFdW2psZW4gKyAxXSA9IHkzO1xuICAgICAgYm91bmRzWzBdLmxlbmd0aCA9IGJvdW5kc1sxXS5sZW5ndGggPSBqbGVuICsgMjtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1pbjoge1xuICAgICAgICAgIHg6IG1taW4uYXBwbHkoMCwgYm91bmRzWzBdKSxcbiAgICAgICAgICB5OiBtbWluLmFwcGx5KDAsIGJvdW5kc1sxXSlcbiAgICAgICAgfSxcbiAgICAgICAgbWF4OiB7XG4gICAgICAgICAgeDogbW1heC5hcHBseSgwLCBib3VuZHNbMF0pLFxuICAgICAgICAgIHk6IG1tYXguYXBwbHkoMCwgYm91bmRzWzFdKVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhdGgyY3VydmUocGF0aCwgcGF0aDIpIHtcbiAgICAgIHZhciBwdGggPSAhcGF0aDIgJiYgcGF0aHMocGF0aCk7XG5cbiAgICAgIGlmICghcGF0aDIgJiYgcHRoLmN1cnZlKSB7XG4gICAgICAgIHJldHVybiBwYXRoQ2xvbmUocHRoLmN1cnZlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHAgPSBwYXRoVG9BYnNvbHV0ZShwYXRoKSxcbiAgICAgICAgICBwMiA9IHBhdGgyICYmIHBhdGhUb0Fic29sdXRlKHBhdGgyKSxcbiAgICAgICAgICBhdHRycyA9IHtcbiAgICAgICAgeDogMCxcbiAgICAgICAgeTogMCxcbiAgICAgICAgYng6IDAsXG4gICAgICAgIGJ5OiAwLFxuICAgICAgICBYOiAwLFxuICAgICAgICBZOiAwLFxuICAgICAgICBxeDogbnVsbCxcbiAgICAgICAgcXk6IG51bGxcbiAgICAgIH0sXG4gICAgICAgICAgYXR0cnMyID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwLFxuICAgICAgICBieDogMCxcbiAgICAgICAgYnk6IDAsXG4gICAgICAgIFg6IDAsXG4gICAgICAgIFk6IDAsXG4gICAgICAgIHF4OiBudWxsLFxuICAgICAgICBxeTogbnVsbFxuICAgICAgfSxcbiAgICAgICAgICBwcm9jZXNzUGF0aCA9IGZ1bmN0aW9uIChwYXRoLCBkLCBwY29tKSB7XG4gICAgICAgIHZhciBueCwgbnk7XG5cbiAgICAgICAgaWYgKCFwYXRoKSB7XG4gICAgICAgICAgcmV0dXJuIFtcIkNcIiwgZC54LCBkLnksIGQueCwgZC55LCBkLngsIGQueV07XG4gICAgICAgIH1cblxuICAgICAgICAhKHBhdGhbMF0gaW4ge1xuICAgICAgICAgIFQ6IDEsXG4gICAgICAgICAgUTogMVxuICAgICAgICB9KSAmJiAoZC5xeCA9IGQucXkgPSBudWxsKTtcblxuICAgICAgICBzd2l0Y2ggKHBhdGhbMF0pIHtcbiAgICAgICAgICBjYXNlIFwiTVwiOlxuICAgICAgICAgICAgZC5YID0gcGF0aFsxXTtcbiAgICAgICAgICAgIGQuWSA9IHBhdGhbMl07XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJBXCI6XG4gICAgICAgICAgICBwYXRoID0gW1wiQ1wiXS5jb25jYXQoYTJjLmFwcGx5KDAsIFtkLngsIGQueV0uY29uY2F0KHBhdGguc2xpY2UoMSkpKSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJTXCI6XG4gICAgICAgICAgICBpZiAocGNvbSA9PSBcIkNcIiB8fCBwY29tID09IFwiU1wiKSB7XG4gICAgICAgICAgICAgIC8vIEluIFwiU1wiIGNhc2Ugd2UgaGF2ZSB0byB0YWtlIGludG8gYWNjb3VudCwgaWYgdGhlIHByZXZpb3VzIGNvbW1hbmQgaXMgQy9TLlxuICAgICAgICAgICAgICBueCA9IGQueCAqIDIgLSBkLmJ4OyAvLyBBbmQgcmVmbGVjdCB0aGUgcHJldmlvdXNcblxuICAgICAgICAgICAgICBueSA9IGQueSAqIDIgLSBkLmJ5OyAvLyBjb21tYW5kJ3MgY29udHJvbCBwb2ludCByZWxhdGl2ZSB0byB0aGUgY3VycmVudCBwb2ludC5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIG9yIHNvbWUgZWxzZSBvciBub3RoaW5nXG4gICAgICAgICAgICAgIG54ID0gZC54O1xuICAgICAgICAgICAgICBueSA9IGQueTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcGF0aCA9IFtcIkNcIiwgbngsIG55XS5jb25jYXQocGF0aC5zbGljZSgxKSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJUXCI6XG4gICAgICAgICAgICBpZiAocGNvbSA9PSBcIlFcIiB8fCBwY29tID09IFwiVFwiKSB7XG4gICAgICAgICAgICAgIC8vIEluIFwiVFwiIGNhc2Ugd2UgaGF2ZSB0byB0YWtlIGludG8gYWNjb3VudCwgaWYgdGhlIHByZXZpb3VzIGNvbW1hbmQgaXMgUS9ULlxuICAgICAgICAgICAgICBkLnF4ID0gZC54ICogMiAtIGQucXg7IC8vIEFuZCBtYWtlIGEgcmVmbGVjdGlvbiBzaW1pbGFyXG5cbiAgICAgICAgICAgICAgZC5xeSA9IGQueSAqIDIgLSBkLnF5OyAvLyB0byBjYXNlIFwiU1wiLlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gb3Igc29tZXRoaW5nIGVsc2Ugb3Igbm90aGluZ1xuICAgICAgICAgICAgICBkLnF4ID0gZC54O1xuICAgICAgICAgICAgICBkLnF5ID0gZC55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwYXRoID0gW1wiQ1wiXS5jb25jYXQocTJjKGQueCwgZC55LCBkLnF4LCBkLnF5LCBwYXRoWzFdLCBwYXRoWzJdKSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJRXCI6XG4gICAgICAgICAgICBkLnF4ID0gcGF0aFsxXTtcbiAgICAgICAgICAgIGQucXkgPSBwYXRoWzJdO1xuICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl0uY29uY2F0KHEyYyhkLngsIGQueSwgcGF0aFsxXSwgcGF0aFsyXSwgcGF0aFszXSwgcGF0aFs0XSkpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwiTFwiOlxuICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl0uY29uY2F0KGwyYyhkLngsIGQueSwgcGF0aFsxXSwgcGF0aFsyXSkpO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlIFwiSFwiOlxuICAgICAgICAgICAgcGF0aCA9IFtcIkNcIl0uY29uY2F0KGwyYyhkLngsIGQueSwgcGF0aFsxXSwgZC55KSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgIGNhc2UgXCJWXCI6XG4gICAgICAgICAgICBwYXRoID0gW1wiQ1wiXS5jb25jYXQobDJjKGQueCwgZC55LCBkLngsIHBhdGhbMV0pKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSBcIlpcIjpcbiAgICAgICAgICAgIHBhdGggPSBbXCJDXCJdLmNvbmNhdChsMmMoZC54LCBkLnksIGQuWCwgZC5ZKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgfSxcbiAgICAgICAgICBmaXhBcmMgPSBmdW5jdGlvbiAocHAsIGkpIHtcbiAgICAgICAgaWYgKHBwW2ldLmxlbmd0aCA+IDcpIHtcbiAgICAgICAgICBwcFtpXS5zaGlmdCgpO1xuICAgICAgICAgIHZhciBwaSA9IHBwW2ldO1xuXG4gICAgICAgICAgd2hpbGUgKHBpLmxlbmd0aCkge1xuICAgICAgICAgICAgcGNvbXMxW2ldID0gXCJBXCI7IC8vIGlmIGNyZWF0ZWQgbXVsdGlwbGUgQzpzLCB0aGVpciBvcmlnaW5hbCBzZWcgaXMgc2F2ZWRcblxuICAgICAgICAgICAgcDIgJiYgKHBjb21zMltpXSA9IFwiQVwiKTsgLy8gdGhlIHNhbWUgYXMgYWJvdmVcblxuICAgICAgICAgICAgcHAuc3BsaWNlKGkrKywgMCwgW1wiQ1wiXS5jb25jYXQocGkuc3BsaWNlKDAsIDYpKSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcHAuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGlpID0gbW1heChwLmxlbmd0aCwgcDIgJiYgcDIubGVuZ3RoIHx8IDApO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgICAgIGZpeE0gPSBmdW5jdGlvbiAocGF0aDEsIHBhdGgyLCBhMSwgYTIsIGkpIHtcbiAgICAgICAgaWYgKHBhdGgxICYmIHBhdGgyICYmIHBhdGgxW2ldWzBdID09IFwiTVwiICYmIHBhdGgyW2ldWzBdICE9IFwiTVwiKSB7XG4gICAgICAgICAgcGF0aDIuc3BsaWNlKGksIDAsIFtcIk1cIiwgYTIueCwgYTIueV0pO1xuICAgICAgICAgIGExLmJ4ID0gMDtcbiAgICAgICAgICBhMS5ieSA9IDA7XG4gICAgICAgICAgYTEueCA9IHBhdGgxW2ldWzFdO1xuICAgICAgICAgIGExLnkgPSBwYXRoMVtpXVsyXTtcbiAgICAgICAgICBpaSA9IG1tYXgocC5sZW5ndGgsIHAyICYmIHAyLmxlbmd0aCB8fCAwKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICAgICBwY29tczEgPSBbXSxcbiAgICAgICAgICAvLyBwYXRoIGNvbW1hbmRzIG9mIG9yaWdpbmFsIHBhdGggcFxuICAgICAgcGNvbXMyID0gW10sXG4gICAgICAgICAgLy8gcGF0aCBjb21tYW5kcyBvZiBvcmlnaW5hbCBwYXRoIHAyXG4gICAgICBwZmlyc3QgPSBcIlwiLFxuICAgICAgICAgIC8vIHRlbXBvcmFyeSBob2xkZXIgZm9yIG9yaWdpbmFsIHBhdGggY29tbWFuZFxuICAgICAgcGNvbSA9IFwiXCI7IC8vIGhvbGRlciBmb3IgcHJldmlvdXMgcGF0aCBjb21tYW5kIG9mIG9yaWdpbmFsIHBhdGhcblxuXG4gICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBtbWF4KHAubGVuZ3RoLCBwMiAmJiBwMi5sZW5ndGggfHwgMCk7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgIHBbaV0gJiYgKHBmaXJzdCA9IHBbaV1bMF0pOyAvLyBzYXZlIGN1cnJlbnQgcGF0aCBjb21tYW5kXG5cbiAgICAgICAgaWYgKHBmaXJzdCAhPSBcIkNcIikgLy8gQyBpcyBub3Qgc2F2ZWQgeWV0LCBiZWNhdXNlIGl0IG1heSBiZSByZXN1bHQgb2YgY29udmVyc2lvblxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHBjb21zMVtpXSA9IHBmaXJzdDsgLy8gU2F2ZSBjdXJyZW50IHBhdGggY29tbWFuZFxuXG4gICAgICAgICAgICBpICYmIChwY29tID0gcGNvbXMxW2kgLSAxXSk7IC8vIEdldCBwcmV2aW91cyBwYXRoIGNvbW1hbmQgcGNvbVxuICAgICAgICAgIH1cblxuICAgICAgICBwW2ldID0gcHJvY2Vzc1BhdGgocFtpXSwgYXR0cnMsIHBjb20pOyAvLyBQcmV2aW91cyBwYXRoIGNvbW1hbmQgaXMgaW5wdXR0ZWQgdG8gcHJvY2Vzc1BhdGhcblxuICAgICAgICBpZiAocGNvbXMxW2ldICE9IFwiQVwiICYmIHBmaXJzdCA9PSBcIkNcIikgcGNvbXMxW2ldID0gXCJDXCI7IC8vIEEgaXMgdGhlIG9ubHkgY29tbWFuZFxuICAgICAgICAvLyB3aGljaCBtYXkgcHJvZHVjZSBtdWx0aXBsZSBDOnNcbiAgICAgICAgLy8gc28gd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCBDIGlzIGFsc28gQyBpbiBvcmlnaW5hbCBwYXRoXG5cbiAgICAgICAgZml4QXJjKHAsIGkpOyAvLyBmaXhBcmMgYWRkcyBhbHNvIHRoZSByaWdodCBhbW91bnQgb2YgQTpzIHRvIHBjb21zMVxuXG4gICAgICAgIGlmIChwMikge1xuICAgICAgICAgIC8vIHRoZSBzYW1lIHByb2NlZHVyZXMgaXMgZG9uZSB0byBwMlxuICAgICAgICAgIHAyW2ldICYmIChwZmlyc3QgPSBwMltpXVswXSk7XG5cbiAgICAgICAgICBpZiAocGZpcnN0ICE9IFwiQ1wiKSB7XG4gICAgICAgICAgICBwY29tczJbaV0gPSBwZmlyc3Q7XG4gICAgICAgICAgICBpICYmIChwY29tID0gcGNvbXMyW2kgLSAxXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcDJbaV0gPSBwcm9jZXNzUGF0aChwMltpXSwgYXR0cnMyLCBwY29tKTtcblxuICAgICAgICAgIGlmIChwY29tczJbaV0gIT0gXCJBXCIgJiYgcGZpcnN0ID09IFwiQ1wiKSB7XG4gICAgICAgICAgICBwY29tczJbaV0gPSBcIkNcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmaXhBcmMocDIsIGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZml4TShwLCBwMiwgYXR0cnMsIGF0dHJzMiwgaSk7XG4gICAgICAgIGZpeE0ocDIsIHAsIGF0dHJzMiwgYXR0cnMsIGkpO1xuICAgICAgICB2YXIgc2VnID0gcFtpXSxcbiAgICAgICAgICAgIHNlZzIgPSBwMiAmJiBwMltpXSxcbiAgICAgICAgICAgIHNlZ2xlbiA9IHNlZy5sZW5ndGgsXG4gICAgICAgICAgICBzZWcybGVuID0gcDIgJiYgc2VnMi5sZW5ndGg7XG4gICAgICAgIGF0dHJzLnggPSBzZWdbc2VnbGVuIC0gMl07XG4gICAgICAgIGF0dHJzLnkgPSBzZWdbc2VnbGVuIC0gMV07XG4gICAgICAgIGF0dHJzLmJ4ID0gdG9GbG9hdChzZWdbc2VnbGVuIC0gNF0pIHx8IGF0dHJzLng7XG4gICAgICAgIGF0dHJzLmJ5ID0gdG9GbG9hdChzZWdbc2VnbGVuIC0gM10pIHx8IGF0dHJzLnk7XG4gICAgICAgIGF0dHJzMi5ieCA9IHAyICYmICh0b0Zsb2F0KHNlZzJbc2VnMmxlbiAtIDRdKSB8fCBhdHRyczIueCk7XG4gICAgICAgIGF0dHJzMi5ieSA9IHAyICYmICh0b0Zsb2F0KHNlZzJbc2VnMmxlbiAtIDNdKSB8fCBhdHRyczIueSk7XG4gICAgICAgIGF0dHJzMi54ID0gcDIgJiYgc2VnMltzZWcybGVuIC0gMl07XG4gICAgICAgIGF0dHJzMi55ID0gcDIgJiYgc2VnMltzZWcybGVuIC0gMV07XG4gICAgICB9XG5cbiAgICAgIGlmICghcDIpIHtcbiAgICAgICAgcHRoLmN1cnZlID0gcGF0aENsb25lKHApO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcDIgPyBbcCwgcDJdIDogcDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtYXBQYXRoKHBhdGgsIG1hdHJpeCkge1xuICAgICAgaWYgKCFtYXRyaXgpIHtcbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICB9XG5cbiAgICAgIHZhciB4LCB5LCBpLCBqLCBpaSwgamosIHBhdGhpO1xuICAgICAgcGF0aCA9IHBhdGgyY3VydmUocGF0aCk7XG5cbiAgICAgIGZvciAoaSA9IDAsIGlpID0gcGF0aC5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgIHBhdGhpID0gcGF0aFtpXTtcblxuICAgICAgICBmb3IgKGogPSAxLCBqaiA9IHBhdGhpLmxlbmd0aDsgaiA8IGpqOyBqICs9IDIpIHtcbiAgICAgICAgICB4ID0gbWF0cml4LngocGF0aGlbal0sIHBhdGhpW2ogKyAxXSk7XG4gICAgICAgICAgeSA9IG1hdHJpeC55KHBhdGhpW2pdLCBwYXRoaVtqICsgMV0pO1xuICAgICAgICAgIHBhdGhpW2pdID0geDtcbiAgICAgICAgICBwYXRoaVtqICsgMV0gPSB5O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwYXRoO1xuICAgIH0gLy8gaHR0cDovL3NjaGVwZXJzLmNjL2dldHRpbmctdG8tdGhlLXBvaW50XG5cblxuICAgIGZ1bmN0aW9uIGNhdG11bGxSb20yYmV6aWVyKGNycCwgeikge1xuICAgICAgdmFyIGQgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGlMZW4gPSBjcnAubGVuZ3RoOyBpTGVuIC0gMiAqICF6ID4gaTsgaSArPSAyKSB7XG4gICAgICAgIHZhciBwID0gW3tcbiAgICAgICAgICB4OiArY3JwW2kgLSAyXSxcbiAgICAgICAgICB5OiArY3JwW2kgLSAxXVxuICAgICAgICB9LCB7XG4gICAgICAgICAgeDogK2NycFtpXSxcbiAgICAgICAgICB5OiArY3JwW2kgKyAxXVxuICAgICAgICB9LCB7XG4gICAgICAgICAgeDogK2NycFtpICsgMl0sXG4gICAgICAgICAgeTogK2NycFtpICsgM11cbiAgICAgICAgfSwge1xuICAgICAgICAgIHg6ICtjcnBbaSArIDRdLFxuICAgICAgICAgIHk6ICtjcnBbaSArIDVdXG4gICAgICAgIH1dO1xuXG4gICAgICAgIGlmICh6KSB7XG4gICAgICAgICAgaWYgKCFpKSB7XG4gICAgICAgICAgICBwWzBdID0ge1xuICAgICAgICAgICAgICB4OiArY3JwW2lMZW4gLSAyXSxcbiAgICAgICAgICAgICAgeTogK2NycFtpTGVuIC0gMV1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIGlmIChpTGVuIC0gNCA9PSBpKSB7XG4gICAgICAgICAgICBwWzNdID0ge1xuICAgICAgICAgICAgICB4OiArY3JwWzBdLFxuICAgICAgICAgICAgICB5OiArY3JwWzFdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZWxzZSBpZiAoaUxlbiAtIDIgPT0gaSkge1xuICAgICAgICAgICAgcFsyXSA9IHtcbiAgICAgICAgICAgICAgeDogK2NycFswXSxcbiAgICAgICAgICAgICAgeTogK2NycFsxXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHBbM10gPSB7XG4gICAgICAgICAgICAgIHg6ICtjcnBbMl0sXG4gICAgICAgICAgICAgIHk6ICtjcnBbM11cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChpTGVuIC0gNCA9PSBpKSB7XG4gICAgICAgICAgICBwWzNdID0gcFsyXTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCFpKSB7XG4gICAgICAgICAgICBwWzBdID0ge1xuICAgICAgICAgICAgICB4OiArY3JwW2ldLFxuICAgICAgICAgICAgICB5OiArY3JwW2kgKyAxXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkLnB1c2goW1wiQ1wiLCAoLXBbMF0ueCArIDYgKiBwWzFdLnggKyBwWzJdLngpIC8gNiwgKC1wWzBdLnkgKyA2ICogcFsxXS55ICsgcFsyXS55KSAvIDYsIChwWzFdLnggKyA2ICogcFsyXS54IC0gcFszXS54KSAvIDYsIChwWzFdLnkgKyA2ICogcFsyXS55IC0gcFszXS55KSAvIDYsIHBbMl0ueCwgcFsyXS55XSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkO1xuICAgIH0gLy8gZXhwb3J0XG5cblxuICAgIFNuYXAucGF0aCA9IHBhdGhzO1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLnBhdGguZ2V0VG90YWxMZW5ndGhcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgZ2l2ZW4gcGF0aCBpbiBwaXhlbHNcbiAgICAgKipcbiAgICAgLSBwYXRoIChzdHJpbmcpIFNWRyBwYXRoIHN0cmluZ1xuICAgICAqKlxuICAgICA9IChudW1iZXIpIGxlbmd0aFxuICAgIFxcKi9cblxuICAgIFNuYXAucGF0aC5nZXRUb3RhbExlbmd0aCA9IGdldFRvdGFsTGVuZ3RoO1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLnBhdGguZ2V0UG9pbnRBdExlbmd0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyB0aGUgY29vcmRpbmF0ZXMgb2YgdGhlIHBvaW50IGxvY2F0ZWQgYXQgdGhlIGdpdmVuIGxlbmd0aCBhbG9uZyB0aGUgZ2l2ZW4gcGF0aFxuICAgICAqKlxuICAgICAtIHBhdGggKHN0cmluZykgU1ZHIHBhdGggc3RyaW5nXG4gICAgIC0gbGVuZ3RoIChudW1iZXIpIGxlbmd0aCwgaW4gcGl4ZWxzLCBmcm9tIHRoZSBzdGFydCBvZiB0aGUgcGF0aCwgZXhjbHVkaW5nIG5vbi1yZW5kZXJpbmcganVtcHNcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSByZXByZXNlbnRhdGlvbiBvZiB0aGUgcG9pbnQ6XG4gICAgIG8ge1xuICAgICBvICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUsXG4gICAgIG8gICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSxcbiAgICAgbyAgICAgYWxwaGE6IChudW1iZXIpIGFuZ2xlIG9mIGRlcml2YXRpdmVcbiAgICAgbyB9XG4gICAgXFwqL1xuXG4gICAgU25hcC5wYXRoLmdldFBvaW50QXRMZW5ndGggPSBnZXRQb2ludEF0TGVuZ3RoO1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLnBhdGguZ2V0U3VicGF0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyB0aGUgc3VicGF0aCBvZiBhIGdpdmVuIHBhdGggYmV0d2VlbiBnaXZlbiBzdGFydCBhbmQgZW5kIGxlbmd0aHNcbiAgICAgKipcbiAgICAgLSBwYXRoIChzdHJpbmcpIFNWRyBwYXRoIHN0cmluZ1xuICAgICAtIGZyb20gKG51bWJlcikgbGVuZ3RoLCBpbiBwaXhlbHMsIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBwYXRoIHRvIHRoZSBzdGFydCBvZiB0aGUgc2VnbWVudFxuICAgICAtIHRvIChudW1iZXIpIGxlbmd0aCwgaW4gcGl4ZWxzLCBmcm9tIHRoZSBzdGFydCBvZiB0aGUgcGF0aCB0byB0aGUgZW5kIG9mIHRoZSBzZWdtZW50XG4gICAgICoqXG4gICAgID0gKHN0cmluZykgcGF0aCBzdHJpbmcgZGVmaW5pdGlvbiBmb3IgdGhlIHNlZ21lbnRcbiAgICBcXCovXG5cbiAgICBTbmFwLnBhdGguZ2V0U3VicGF0aCA9IGZ1bmN0aW9uIChwYXRoLCBmcm9tLCB0bykge1xuICAgICAgaWYgKHRoaXMuZ2V0VG90YWxMZW5ndGgocGF0aCkgLSB0byA8IDFlLTYpIHtcbiAgICAgICAgcmV0dXJuIGdldFN1YnBhdGhzQXRMZW5ndGgocGF0aCwgZnJvbSkuZW5kO1xuICAgICAgfVxuXG4gICAgICB2YXIgYSA9IGdldFN1YnBhdGhzQXRMZW5ndGgocGF0aCwgdG8sIDEpO1xuICAgICAgcmV0dXJuIGZyb20gPyBnZXRTdWJwYXRoc0F0TGVuZ3RoKGEsIGZyb20pLmVuZCA6IGE7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5nZXRUb3RhbExlbmd0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBwYXRoIGluIHBpeGVscyAob25seSB3b3JrcyBmb3IgYHBhdGhgIGVsZW1lbnRzKVxuICAgICA9IChudW1iZXIpIGxlbmd0aFxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5nZXRUb3RhbExlbmd0aCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLm5vZGUuZ2V0VG90YWxMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZS5nZXRUb3RhbExlbmd0aCgpO1xuICAgICAgfVxuICAgIH07IC8vIFNJRVJSQSBFbGVtZW50LmdldFBvaW50QXRMZW5ndGgoKS9FbGVtZW50LmdldFRvdGFsTGVuZ3RoKCk6IElmIGEgPHBhdGg+IGlzIGJyb2tlbiBpbnRvIGRpZmZlcmVudCBzZWdtZW50cywgaXMgdGhlIGp1bXAgZGlzdGFuY2UgdG8gdGhlIG5ldyBjb29yZGluYXRlcyBzZXQgYnkgdGhlIF9NXyBvciBfbV8gY29tbWFuZHMgY2FsY3VsYXRlZCBhcyBwYXJ0IG9mIHRoZSBwYXRoJ3MgdG90YWwgbGVuZ3RoP1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQuZ2V0UG9pbnRBdExlbmd0aFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBjb29yZGluYXRlcyBvZiB0aGUgcG9pbnQgbG9jYXRlZCBhdCB0aGUgZ2l2ZW4gbGVuZ3RoIG9uIHRoZSBnaXZlbiBwYXRoIChvbmx5IHdvcmtzIGZvciBgcGF0aGAgZWxlbWVudHMpXG4gICAgICoqXG4gICAgIC0gbGVuZ3RoIChudW1iZXIpIGxlbmd0aCwgaW4gcGl4ZWxzLCBmcm9tIHRoZSBzdGFydCBvZiB0aGUgcGF0aCwgZXhjbHVkaW5nIG5vbi1yZW5kZXJpbmcganVtcHNcbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSByZXByZXNlbnRhdGlvbiBvZiB0aGUgcG9pbnQ6XG4gICAgIG8ge1xuICAgICBvICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUsXG4gICAgIG8gICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSxcbiAgICAgbyAgICAgYWxwaGE6IChudW1iZXIpIGFuZ2xlIG9mIGRlcml2YXRpdmVcbiAgICAgbyB9XG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLmdldFBvaW50QXRMZW5ndGggPSBmdW5jdGlvbiAobGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZ2V0UG9pbnRBdExlbmd0aCh0aGlzLmF0dHIoXCJkXCIpLCBsZW5ndGgpO1xuICAgIH07IC8vIFNJRVJSQSBFbGVtZW50LmdldFN1YnBhdGgoKTogU2ltaWxhciB0byB0aGUgcHJvYmxlbSBmb3IgRWxlbWVudC5nZXRQb2ludEF0TGVuZ3RoKCkuIFVuY2xlYXIgaG93IHRoaXMgd291bGQgd29yayBmb3IgYSBzZWdtZW50ZWQgcGF0aC4gT3ZlcmFsbCwgdGhlIGNvbmNlcHQgb2YgX3N1YnBhdGhfIGFuZCB3aGF0IEknbSBjYWxsaW5nIGEgX3NlZ21lbnRfIChzZXJpZXMgb2Ygbm9uLV9NXyBvciBfWl8gY29tbWFuZHMpIGlzIHVuY2xlYXIuXG5cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5nZXRTdWJwYXRoXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIHN1YnBhdGggb2YgYSBnaXZlbiBlbGVtZW50IGZyb20gZ2l2ZW4gc3RhcnQgYW5kIGVuZCBsZW5ndGhzIChvbmx5IHdvcmtzIGZvciBgcGF0aGAgZWxlbWVudHMpXG4gICAgICoqXG4gICAgIC0gZnJvbSAobnVtYmVyKSBsZW5ndGgsIGluIHBpeGVscywgZnJvbSB0aGUgc3RhcnQgb2YgdGhlIHBhdGggdG8gdGhlIHN0YXJ0IG9mIHRoZSBzZWdtZW50XG4gICAgIC0gdG8gKG51bWJlcikgbGVuZ3RoLCBpbiBwaXhlbHMsIGZyb20gdGhlIHN0YXJ0IG9mIHRoZSBwYXRoIHRvIHRoZSBlbmQgb2YgdGhlIHNlZ21lbnRcbiAgICAgKipcbiAgICAgPSAoc3RyaW5nKSBwYXRoIHN0cmluZyBkZWZpbml0aW9uIGZvciB0aGUgc2VnbWVudFxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by5nZXRTdWJwYXRoID0gZnVuY3Rpb24gKGZyb20sIHRvKSB7XG4gICAgICByZXR1cm4gU25hcC5wYXRoLmdldFN1YnBhdGgodGhpcy5hdHRyKFwiZFwiKSwgZnJvbSwgdG8pO1xuICAgIH07XG5cbiAgICBTbmFwLl8uYm94ID0gYm94O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLnBhdGguZmluZERvdHNBdFNlZ21lbnRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogRmluZHMgZG90IGNvb3JkaW5hdGVzIG9uIHRoZSBnaXZlbiBjdWJpYyBiZXppw6lyIGN1cnZlIGF0IHRoZSBnaXZlbiB0XG4gICAgIC0gcDF4IChudW1iZXIpIHggb2YgdGhlIGZpcnN0IHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAtIHAxeSAobnVtYmVyKSB5IG9mIHRoZSBmaXJzdCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSBjMXggKG51bWJlcikgeCBvZiB0aGUgZmlyc3QgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMxeSAobnVtYmVyKSB5IG9mIHRoZSBmaXJzdCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gYzJ4IChudW1iZXIpIHggb2YgdGhlIHNlY29uZCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gYzJ5IChudW1iZXIpIHkgb2YgdGhlIHNlY29uZCBhbmNob3Igb2YgdGhlIGN1cnZlXG4gICAgIC0gcDJ4IChudW1iZXIpIHggb2YgdGhlIHNlY29uZCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSBwMnkgKG51bWJlcikgeSBvZiB0aGUgc2Vjb25kIHBvaW50IG9mIHRoZSBjdXJ2ZVxuICAgICAtIHQgKG51bWJlcikgcG9zaXRpb24gb24gdGhlIGN1cnZlICgwLi4xKVxuICAgICA9IChvYmplY3QpIHBvaW50IGluZm9ybWF0aW9uIGluIGZvcm1hdDpcbiAgICAgbyB7XG4gICAgIG8gICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQsXG4gICAgIG8gICAgIHk6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQsXG4gICAgIG8gICAgIG06IHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCBhbmNob3IsXG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGxlZnQgYW5jaG9yXG4gICAgIG8gICAgIH0sXG4gICAgIG8gICAgIG46IHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcmlnaHQgYW5jaG9yLFxuICAgICBvICAgICAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSByaWdodCBhbmNob3JcbiAgICAgbyAgICAgfSxcbiAgICAgbyAgICAgc3RhcnQ6IHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgc3RhcnQgb2YgdGhlIGN1cnZlLFxuICAgICBvICAgICAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBzdGFydCBvZiB0aGUgY3VydmVcbiAgICAgbyAgICAgfSxcbiAgICAgbyAgICAgZW5kOiB7XG4gICAgIG8gICAgICAgICB4OiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIGVuZCBvZiB0aGUgY3VydmUsXG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGVuZCBvZiB0aGUgY3VydmVcbiAgICAgbyAgICAgfSxcbiAgICAgbyAgICAgYWxwaGE6IChudW1iZXIpIGFuZ2xlIG9mIHRoZSBjdXJ2ZSBkZXJpdmF0aXZlIGF0IHRoZSBwb2ludFxuICAgICBvIH1cbiAgICBcXCovXG5cbiAgICBTbmFwLnBhdGguZmluZERvdHNBdFNlZ21lbnQgPSBmaW5kRG90c0F0U2VnbWVudDtcbiAgICAvKlxcXG4gICAgICogU25hcC5wYXRoLmJlemllckJCb3hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogUmV0dXJucyB0aGUgYm91bmRpbmcgYm94IG9mIGEgZ2l2ZW4gY3ViaWMgYmV6acOpciBjdXJ2ZVxuICAgICAtIHAxeCAobnVtYmVyKSB4IG9mIHRoZSBmaXJzdCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgLSBwMXkgKG51bWJlcikgeSBvZiB0aGUgZmlyc3QgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgIC0gYzF4IChudW1iZXIpIHggb2YgdGhlIGZpcnN0IGFuY2hvciBvZiB0aGUgY3VydmVcbiAgICAgLSBjMXkgKG51bWJlcikgeSBvZiB0aGUgZmlyc3QgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMyeCAobnVtYmVyKSB4IG9mIHRoZSBzZWNvbmQgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIGMyeSAobnVtYmVyKSB5IG9mIHRoZSBzZWNvbmQgYW5jaG9yIG9mIHRoZSBjdXJ2ZVxuICAgICAtIHAyeCAobnVtYmVyKSB4IG9mIHRoZSBzZWNvbmQgcG9pbnQgb2YgdGhlIGN1cnZlXG4gICAgIC0gcDJ5IChudW1iZXIpIHkgb2YgdGhlIHNlY29uZCBwb2ludCBvZiB0aGUgY3VydmVcbiAgICAgKiBvclxuICAgICAtIGJleiAoYXJyYXkpIGFycmF5IG9mIHNpeCBwb2ludHMgZm9yIGJlemnDqXIgY3VydmVcbiAgICAgPSAob2JqZWN0KSBib3VuZGluZyBib3hcbiAgICAgbyB7XG4gICAgIG8gICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgbGVmdCB0b3AgcG9pbnQgb2YgdGhlIGJveCxcbiAgICAgbyAgICAgeTogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSBsZWZ0IHRvcCBwb2ludCBvZiB0aGUgYm94LFxuICAgICBvICAgICB4MjogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSByaWdodCBib3R0b20gcG9pbnQgb2YgdGhlIGJveCxcbiAgICAgbyAgICAgeTI6IChudW1iZXIpIHkgY29vcmRpbmF0ZSBvZiB0aGUgcmlnaHQgYm90dG9tIHBvaW50IG9mIHRoZSBib3gsXG4gICAgIG8gICAgIHdpZHRoOiAobnVtYmVyKSB3aWR0aCBvZiB0aGUgYm94LFxuICAgICBvICAgICBoZWlnaHQ6IChudW1iZXIpIGhlaWdodCBvZiB0aGUgYm94XG4gICAgIG8gfVxuICAgIFxcKi9cblxuICAgIFNuYXAucGF0aC5iZXppZXJCQm94ID0gYmV6aWVyQkJveDtcbiAgICAvKlxcXG4gICAgICogU25hcC5wYXRoLmlzUG9pbnRJbnNpZGVCQm94XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIFJldHVybnMgYHRydWVgIGlmIGdpdmVuIHBvaW50IGlzIGluc2lkZSBib3VuZGluZyBib3hcbiAgICAgLSBiYm94IChzdHJpbmcpIGJvdW5kaW5nIGJveFxuICAgICAtIHggKHN0cmluZykgeCBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICAtIHkgKHN0cmluZykgeSBjb29yZGluYXRlIG9mIHRoZSBwb2ludFxuICAgICA9IChib29sZWFuKSBgdHJ1ZWAgaWYgcG9pbnQgaXMgaW5zaWRlXG4gICAgXFwqL1xuXG4gICAgU25hcC5wYXRoLmlzUG9pbnRJbnNpZGVCQm94ID0gaXNQb2ludEluc2lkZUJCb3g7XG5cbiAgICBTbmFwLmNsb3Nlc3QgPSBmdW5jdGlvbiAoeCwgeSwgWCwgWSkge1xuICAgICAgdmFyIHIgPSAxMDAsXG4gICAgICAgICAgYiA9IGJveCh4IC0gciAvIDIsIHkgLSByIC8gMiwgciwgciksXG4gICAgICAgICAgaW5zaWRlID0gW10sXG4gICAgICAgICAgZ2V0dGVyID0gWFswXS5oYXNPd25Qcm9wZXJ0eShcInhcIikgPyBmdW5jdGlvbiAoaSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IFhbaV0ueCxcbiAgICAgICAgICB5OiBYW2ldLnlcbiAgICAgICAgfTtcbiAgICAgIH0gOiBmdW5jdGlvbiAoaSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IFhbaV0sXG4gICAgICAgICAgeTogWVtpXVxuICAgICAgICB9O1xuICAgICAgfSxcbiAgICAgICAgICBmb3VuZCA9IDA7XG5cbiAgICAgIHdoaWxlIChyIDw9IDFlNiAmJiAhZm91bmQpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gWC5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgdmFyIHh5ID0gZ2V0dGVyKGkpO1xuXG4gICAgICAgICAgaWYgKGlzUG9pbnRJbnNpZGVCQm94KGIsIHh5LngsIHh5LnkpKSB7XG4gICAgICAgICAgICBmb3VuZCsrO1xuICAgICAgICAgICAgaW5zaWRlLnB1c2goeHkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgIHIgKj0gMjtcbiAgICAgICAgICBiID0gYm94KHggLSByIC8gMiwgeSAtIHIgLyAyLCByLCByKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAociA9PSAxZTYpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuID0gSW5maW5pdHksXG4gICAgICAgICAgcmVzO1xuXG4gICAgICBmb3IgKGkgPSAwLCBpaSA9IGluc2lkZS5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgIHZhciBsID0gU25hcC5sZW4oeCwgeSwgaW5zaWRlW2ldLngsIGluc2lkZVtpXS55KTtcblxuICAgICAgICBpZiAobGVuID4gbCkge1xuICAgICAgICAgIGxlbiA9IGw7XG4gICAgICAgICAgaW5zaWRlW2ldLmxlbiA9IGw7XG4gICAgICAgICAgcmVzID0gaW5zaWRlW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5wYXRoLmlzQkJveEludGVyc2VjdFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0d28gYm91bmRpbmcgYm94ZXMgaW50ZXJzZWN0XG4gICAgIC0gYmJveDEgKHN0cmluZykgZmlyc3QgYm91bmRpbmcgYm94XG4gICAgIC0gYmJveDIgKHN0cmluZykgc2Vjb25kIGJvdW5kaW5nIGJveFxuICAgICA9IChib29sZWFuKSBgdHJ1ZWAgaWYgYm91bmRpbmcgYm94ZXMgaW50ZXJzZWN0XG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLnBhdGguaXNCQm94SW50ZXJzZWN0ID0gaXNCQm94SW50ZXJzZWN0O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLnBhdGguaW50ZXJzZWN0aW9uXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBVdGlsaXR5IG1ldGhvZFxuICAgICAqKlxuICAgICAqIEZpbmRzIGludGVyc2VjdGlvbnMgb2YgdHdvIHBhdGhzXG4gICAgIC0gcGF0aDEgKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgLSBwYXRoMiAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICA9IChhcnJheSkgZG90cyBvZiBpbnRlcnNlY3Rpb25cbiAgICAgbyBbXG4gICAgIG8gICAgIHtcbiAgICAgbyAgICAgICAgIHg6IChudW1iZXIpIHggY29vcmRpbmF0ZSBvZiB0aGUgcG9pbnQsXG4gICAgIG8gICAgICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIHBvaW50LFxuICAgICBvICAgICAgICAgdDE6IChudW1iZXIpIHQgdmFsdWUgZm9yIHNlZ21lbnQgb2YgcGF0aDEsXG4gICAgIG8gICAgICAgICB0MjogKG51bWJlcikgdCB2YWx1ZSBmb3Igc2VnbWVudCBvZiBwYXRoMixcbiAgICAgbyAgICAgICAgIHNlZ21lbnQxOiAobnVtYmVyKSBvcmRlciBudW1iZXIgZm9yIHNlZ21lbnQgb2YgcGF0aDEsXG4gICAgIG8gICAgICAgICBzZWdtZW50MjogKG51bWJlcikgb3JkZXIgbnVtYmVyIGZvciBzZWdtZW50IG9mIHBhdGgyLFxuICAgICBvICAgICAgICAgYmV6MTogKGFycmF5KSBlaWdodCBjb29yZGluYXRlcyByZXByZXNlbnRpbmcgYmV6acOpciBjdXJ2ZSBmb3IgdGhlIHNlZ21lbnQgb2YgcGF0aDEsXG4gICAgIG8gICAgICAgICBiZXoyOiAoYXJyYXkpIGVpZ2h0IGNvb3JkaW5hdGVzIHJlcHJlc2VudGluZyBiZXppw6lyIGN1cnZlIGZvciB0aGUgc2VnbWVudCBvZiBwYXRoMlxuICAgICBvICAgICB9XG4gICAgIG8gXVxuICAgIFxcKi9cblxuICAgIFNuYXAucGF0aC5pbnRlcnNlY3Rpb24gPSBwYXRoSW50ZXJzZWN0aW9uO1xuICAgIFNuYXAucGF0aC5pbnRlcnNlY3Rpb25OdW1iZXIgPSBwYXRoSW50ZXJzZWN0aW9uTnVtYmVyO1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLnBhdGguaXNQb2ludEluc2lkZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBnaXZlbiBwb2ludCBpcyBpbnNpZGUgYSBnaXZlbiBjbG9zZWQgcGF0aC5cbiAgICAgKlxuICAgICAqIE5vdGU6IGZpbGwgbW9kZSBkb2VzbuKAmXQgYWZmZWN0IHRoZSByZXN1bHQgb2YgdGhpcyBtZXRob2QuXG4gICAgIC0gcGF0aCAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICAtIHggKG51bWJlcikgeCBvZiB0aGUgcG9pbnRcbiAgICAgLSB5IChudW1iZXIpIHkgb2YgdGhlIHBvaW50XG4gICAgID0gKGJvb2xlYW4pIGB0cnVlYCBpZiBwb2ludCBpcyBpbnNpZGUgdGhlIHBhdGhcbiAgICBcXCovXG5cbiAgICBTbmFwLnBhdGguaXNQb2ludEluc2lkZSA9IGlzUG9pbnRJbnNpZGVQYXRoO1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLnBhdGguZ2V0QkJveFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVXRpbGl0eSBtZXRob2RcbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIHRoZSBib3VuZGluZyBib3ggb2YgYSBnaXZlbiBwYXRoXG4gICAgIC0gcGF0aCAoc3RyaW5nKSBwYXRoIHN0cmluZ1xuICAgICA9IChvYmplY3QpIGJvdW5kaW5nIGJveFxuICAgICBvIHtcbiAgICAgbyAgICAgeDogKG51bWJlcikgeCBjb29yZGluYXRlIG9mIHRoZSBsZWZ0IHRvcCBwb2ludCBvZiB0aGUgYm94LFxuICAgICBvICAgICB5OiAobnVtYmVyKSB5IGNvb3JkaW5hdGUgb2YgdGhlIGxlZnQgdG9wIHBvaW50IG9mIHRoZSBib3gsXG4gICAgIG8gICAgIHgyOiAobnVtYmVyKSB4IGNvb3JkaW5hdGUgb2YgdGhlIHJpZ2h0IGJvdHRvbSBwb2ludCBvZiB0aGUgYm94LFxuICAgICBvICAgICB5MjogKG51bWJlcikgeSBjb29yZGluYXRlIG9mIHRoZSByaWdodCBib3R0b20gcG9pbnQgb2YgdGhlIGJveCxcbiAgICAgbyAgICAgd2lkdGg6IChudW1iZXIpIHdpZHRoIG9mIHRoZSBib3gsXG4gICAgIG8gICAgIGhlaWdodDogKG51bWJlcikgaGVpZ2h0IG9mIHRoZSBib3hcbiAgICAgbyB9XG4gICAgXFwqL1xuXG4gICAgU25hcC5wYXRoLmdldEJCb3ggPSBwYXRoQkJveDtcbiAgICBTbmFwLnBhdGguZ2V0ID0gZ2V0UGF0aDtcbiAgICAvKlxcXG4gICAgICogU25hcC5wYXRoLnRvUmVsYXRpdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogQ29udmVydHMgcGF0aCBjb29yZGluYXRlcyBpbnRvIHJlbGF0aXZlIHZhbHVlc1xuICAgICAtIHBhdGggKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgPSAoYXJyYXkpIHBhdGggc3RyaW5nXG4gICAgXFwqL1xuXG4gICAgU25hcC5wYXRoLnRvUmVsYXRpdmUgPSBwYXRoVG9SZWxhdGl2ZTtcbiAgICAvKlxcXG4gICAgICogU25hcC5wYXRoLnRvQWJzb2x1dGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogQ29udmVydHMgcGF0aCBjb29yZGluYXRlcyBpbnRvIGFic29sdXRlIHZhbHVlc1xuICAgICAtIHBhdGggKHN0cmluZykgcGF0aCBzdHJpbmdcbiAgICAgPSAoYXJyYXkpIHBhdGggc3RyaW5nXG4gICAgXFwqL1xuXG4gICAgU25hcC5wYXRoLnRvQWJzb2x1dGUgPSBwYXRoVG9BYnNvbHV0ZTtcbiAgICAvKlxcXG4gICAgICogU25hcC5wYXRoLnRvQ3ViaWNcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFV0aWxpdHkgbWV0aG9kXG4gICAgICoqXG4gICAgICogQ29udmVydHMgcGF0aCB0byBhIG5ldyBwYXRoIHdoZXJlIGFsbCBzZWdtZW50cyBhcmUgY3ViaWMgYmV6acOpciBjdXJ2ZXNcbiAgICAgLSBwYXRoU3RyaW5nIChzdHJpbmd8YXJyYXkpIHBhdGggc3RyaW5nIG9yIGFycmF5IG9mIHNlZ21lbnRzXG4gICAgID0gKGFycmF5KSBhcnJheSBvZiBzZWdtZW50c1xuICAgIFxcKi9cblxuICAgIFNuYXAucGF0aC50b0N1YmljID0gcGF0aDJjdXJ2ZTtcbiAgICAvKlxcXG4gICAgICogU25hcC5wYXRoLm1hcFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVHJhbnNmb3JtIHRoZSBwYXRoIHN0cmluZyB3aXRoIHRoZSBnaXZlbiBtYXRyaXhcbiAgICAgLSBwYXRoIChzdHJpbmcpIHBhdGggc3RyaW5nXG4gICAgIC0gbWF0cml4IChvYmplY3QpIHNlZSBATWF0cml4XG4gICAgID0gKHN0cmluZykgdHJhbnNmb3JtZWQgcGF0aCBzdHJpbmdcbiAgICBcXCovXG5cbiAgICBTbmFwLnBhdGgubWFwID0gbWFwUGF0aDtcbiAgICBTbmFwLnBhdGgudG9TdHJpbmcgPSB0b1N0cmluZztcbiAgICBTbmFwLnBhdGguY2xvbmUgPSBwYXRoQ2xvbmU7XG4gIH0pOyAvLyBDb3B5cmlnaHQgKGMpIDIwMTMgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gIC8vXG4gIC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIC8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gIC8vXG4gIC8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAvL1xuICAvLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIC8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIC8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiAgU25hcC5wbHVnaW4oZnVuY3Rpb24gKFNuYXAsIEVsZW1lbnQsIFBhcGVyLCBnbG9iKSB7XG4gICAgdmFyIG1tYXggPSBNYXRoLm1heCxcbiAgICAgICAgbW1pbiA9IE1hdGgubWluOyAvLyBTZXRcblxuICAgIHZhciBTZXQgPSBmdW5jdGlvbiAoaXRlbXMpIHtcbiAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICAgIHRoaXMuYmluZGluZ3MgPSB7fTtcbiAgICAgIHRoaXMubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMudHlwZSA9IFwic2V0XCI7XG5cbiAgICAgIGlmIChpdGVtcykge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBpdGVtcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgaWYgKGl0ZW1zW2ldKSB7XG4gICAgICAgICAgICB0aGlzW3RoaXMuaXRlbXMubGVuZ3RoXSA9IHRoaXMuaXRlbXNbdGhpcy5pdGVtcy5sZW5ndGhdID0gaXRlbXNbaV07XG4gICAgICAgICAgICB0aGlzLmxlbmd0aCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgICAgIHNldHByb3RvID0gU2V0LnByb3RvdHlwZTtcbiAgICAvKlxcXG4gICAgICogU2V0LnB1c2hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgZWFjaCBhcmd1bWVudCB0byB0aGUgY3VycmVudCBzZXRcbiAgICAgPSAob2JqZWN0KSBvcmlnaW5hbCBlbGVtZW50XG4gICAgXFwqL1xuXG5cbiAgICBzZXRwcm90by5wdXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGl0ZW0sIGxlbjtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgaXRlbSA9IGFyZ3VtZW50c1tpXTtcblxuICAgICAgICBpZiAoaXRlbSkge1xuICAgICAgICAgIGxlbiA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuICAgICAgICAgIHRoaXNbbGVuXSA9IHRoaXMuaXRlbXNbbGVuXSA9IGl0ZW07XG4gICAgICAgICAgdGhpcy5sZW5ndGgrKztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTZXQucG9wXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGxhc3QgZWxlbWVudCBhbmQgcmV0dXJucyBpdFxuICAgICA9IChvYmplY3QpIGVsZW1lbnRcbiAgICBcXCovXG5cblxuICAgIHNldHByb3RvLnBvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMubGVuZ3RoICYmIGRlbGV0ZSB0aGlzW3RoaXMubGVuZ3RoLS1dO1xuICAgICAgcmV0dXJuIHRoaXMuaXRlbXMucG9wKCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU2V0LmZvckVhY2hcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEV4ZWN1dGVzIGdpdmVuIGZ1bmN0aW9uIGZvciBlYWNoIGVsZW1lbnQgaW4gdGhlIHNldFxuICAgICAqXG4gICAgICogSWYgdGhlIGZ1bmN0aW9uIHJldHVybnMgYGZhbHNlYCwgdGhlIGxvb3Agc3RvcHMgcnVubmluZy5cbiAgICAgKipcbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pIGZ1bmN0aW9uIHRvIHJ1blxuICAgICAtIHRoaXNBcmcgKG9iamVjdCkgY29udGV4dCBvYmplY3QgZm9yIHRoZSBjYWxsYmFja1xuICAgICA9IChvYmplY3QpIFNldCBvYmplY3RcbiAgICBcXCovXG5cblxuICAgIHNldHByb3RvLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB0aGlzLml0ZW1zW2ldLCBpKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTZXQuYW5pbWF0ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQW5pbWF0ZXMgZWFjaCBlbGVtZW50IGluIHNldCBpbiBzeW5jLlxuICAgICAqXG4gICAgICoqXG4gICAgIC0gYXR0cnMgKG9iamVjdCkga2V5LXZhbHVlIHBhaXJzIG9mIGRlc3RpbmF0aW9uIGF0dHJpYnV0ZXNcbiAgICAgLSBkdXJhdGlvbiAobnVtYmVyKSBkdXJhdGlvbiBvZiB0aGUgYW5pbWF0aW9uIGluIG1pbGxpc2Vjb25kc1xuICAgICAtIGVhc2luZyAoZnVuY3Rpb24pICNvcHRpb25hbCBlYXNpbmcgZnVuY3Rpb24gZnJvbSBAbWluYSBvciBjdXN0b21cbiAgICAgLSBjYWxsYmFjayAoZnVuY3Rpb24pICNvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGV4ZWN1dGVzIHdoZW4gdGhlIGFuaW1hdGlvbiBlbmRzXG4gICAgICogb3JcbiAgICAgLSBhbmltYXRpb24gKGFycmF5KSBhcnJheSBvZiBhbmltYXRpb24gcGFyYW1ldGVyIGZvciBlYWNoIGVsZW1lbnQgaW4gc2V0IGluIGZvcm1hdCBgW2F0dHJzLCBkdXJhdGlvbiwgZWFzaW5nLCBjYWxsYmFja11gXG4gICAgID4gVXNhZ2VcbiAgICAgfCAvLyBhbmltYXRlIGFsbCBlbGVtZW50cyBpbiBzZXQgdG8gcmFkaXVzIDEwXG4gICAgIHwgc2V0LmFuaW1hdGUoe3I6IDEwfSwgNTAwLCBtaW5hLmVhc2Vpbik7XG4gICAgIHwgLy8gb3JcbiAgICAgfCAvLyBhbmltYXRlIGZpcnN0IGVsZW1lbnQgdG8gcmFkaXVzIDEwLCBidXQgc2Vjb25kIHRvIHJhZGl1cyAyMCBhbmQgaW4gZGlmZmVyZW50IHRpbWVcbiAgICAgfCBzZXQuYW5pbWF0ZShbe3I6IDEwfSwgNTAwLCBtaW5hLmVhc2Vpbl0sIFt7cjogMjB9LCAxNTAwLCBtaW5hLmVhc2Vpbl0pO1xuICAgICA9IChFbGVtZW50KSB0aGUgY3VycmVudCBlbGVtZW50XG4gICAgXFwqL1xuXG5cbiAgICBzZXRwcm90by5hbmltYXRlID0gZnVuY3Rpb24gKGF0dHJzLCBtcywgZWFzaW5nLCBjYWxsYmFjaykge1xuICAgICAgaWYgKHR5cGVvZiBlYXNpbmcgPT0gXCJmdW5jdGlvblwiICYmICFlYXNpbmcubGVuZ3RoKSB7XG4gICAgICAgIGNhbGxiYWNrID0gZWFzaW5nO1xuICAgICAgICBlYXNpbmcgPSBtaW5hLmxpbmVhcjtcbiAgICAgIH1cblxuICAgICAgaWYgKGF0dHJzIGluc3RhbmNlb2YgU25hcC5fLkFuaW1hdGlvbikge1xuICAgICAgICBjYWxsYmFjayA9IGF0dHJzLmNhbGxiYWNrO1xuICAgICAgICBlYXNpbmcgPSBhdHRycy5lYXNpbmc7XG4gICAgICAgIG1zID0gZWFzaW5nLmR1cjtcbiAgICAgICAgYXR0cnMgPSBhdHRycy5hdHRyO1xuICAgICAgfVxuXG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgaWYgKFNuYXAuaXMoYXR0cnMsIFwiYXJyYXlcIikgJiYgU25hcC5pcyhhcmdzW2FyZ3MubGVuZ3RoIC0gMV0sIFwiYXJyYXlcIikpIHtcbiAgICAgICAgdmFyIGVhY2ggPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgYmVnaW4sXG4gICAgICAgICAgaGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKGJlZ2luKSB7XG4gICAgICAgICAgdGhpcy5iID0gYmVnaW47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmVnaW4gPSB0aGlzLmI7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAgICAgY2IgPSAwLFxuICAgICAgICAgIHNldCA9IHRoaXMsXG4gICAgICAgICAgY2FsbGJhY2tlciA9IGNhbGxiYWNrICYmIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCsrY2IgPT0gc2V0Lmxlbmd0aCkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcyk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsLCBpKSB7XG4gICAgICAgIGV2ZS5vbmNlKFwic25hcC5hbmltY3JlYXRlZC5cIiArIGVsLmlkLCBoYW5kbGVyKTtcblxuICAgICAgICBpZiAoZWFjaCkge1xuICAgICAgICAgIGFyZ3NbaV0gJiYgZWwuYW5pbWF0ZS5hcHBseShlbCwgYXJnc1tpXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWwuYW5pbWF0ZShhdHRycywgbXMsIGVhc2luZywgY2FsbGJhY2tlcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNldC5yZW1vdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgYWxsIGNoaWxkcmVuIG9mIHRoZSBzZXQuXG4gICAgICpcbiAgICAgPSAob2JqZWN0KSBTZXQgb2JqZWN0XG4gICAgXFwqL1xuXG5cbiAgICBzZXRwcm90by5yZW1vdmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB3aGlsZSAodGhpcy5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy5wb3AoKS5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU2V0LmJpbmRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFNwZWNpZmllcyBob3cgdG8gaGFuZGxlIGEgc3BlY2lmaWMgYXR0cmlidXRlIHdoZW4gYXBwbGllZFxuICAgICAqIHRvIGEgc2V0LlxuICAgICAqXG4gICAgICoqXG4gICAgIC0gYXR0ciAoc3RyaW5nKSBhdHRyaWJ1dGUgbmFtZVxuICAgICAtIGNhbGxiYWNrIChmdW5jdGlvbikgZnVuY3Rpb24gdG8gcnVuXG4gICAgICogb3JcbiAgICAgLSBhdHRyIChzdHJpbmcpIGF0dHJpYnV0ZSBuYW1lXG4gICAgIC0gZWxlbWVudCAoRWxlbWVudCkgc3BlY2lmaWMgZWxlbWVudCBpbiB0aGUgc2V0IHRvIGFwcGx5IHRoZSBhdHRyaWJ1dGUgdG9cbiAgICAgKiBvclxuICAgICAtIGF0dHIgKHN0cmluZykgYXR0cmlidXRlIG5hbWVcbiAgICAgLSBlbGVtZW50IChFbGVtZW50KSBzcGVjaWZpYyBlbGVtZW50IGluIHRoZSBzZXQgdG8gYXBwbHkgdGhlIGF0dHJpYnV0ZSB0b1xuICAgICAtIGVhdHRyIChzdHJpbmcpIGF0dHJpYnV0ZSBvbiB0aGUgZWxlbWVudCB0byBiaW5kIHRoZSBhdHRyaWJ1dGUgdG9cbiAgICAgPSAob2JqZWN0KSBTZXQgb2JqZWN0XG4gICAgXFwqL1xuXG5cbiAgICBzZXRwcm90by5iaW5kID0gZnVuY3Rpb24gKGF0dHIsIGEsIGIpIHtcbiAgICAgIHZhciBkYXRhID0ge307XG5cbiAgICAgIGlmICh0eXBlb2YgYSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgdGhpcy5iaW5kaW5nc1thdHRyXSA9IGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYW5hbWUgPSBiIHx8IGF0dHI7XG5cbiAgICAgICAgdGhpcy5iaW5kaW5nc1thdHRyXSA9IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgZGF0YVthbmFtZV0gPSB2O1xuICAgICAgICAgIGEuYXR0cihkYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU2V0LmF0dHJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEVxdWl2YWxlbnQgb2YgQEVsZW1lbnQuYXR0ci5cbiAgICAgPSAob2JqZWN0KSBTZXQgb2JqZWN0XG4gICAgXFwqL1xuXG5cbiAgICBzZXRwcm90by5hdHRyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICB2YXIgdW5ib3VuZCA9IHt9O1xuXG4gICAgICBmb3IgKHZhciBrIGluIHZhbHVlKSB7XG4gICAgICAgIGlmICh0aGlzLmJpbmRpbmdzW2tdKSB7XG4gICAgICAgICAgdGhpcy5iaW5kaW5nc1trXSh2YWx1ZVtrXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdW5ib3VuZFtrXSA9IHZhbHVlW2tdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpIDwgaWk7IGkrKykge1xuICAgICAgICB0aGlzLml0ZW1zW2ldLmF0dHIodW5ib3VuZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNldC5jbGVhclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBhbGwgZWxlbWVudHMgZnJvbSB0aGUgc2V0XG4gICAgXFwqL1xuXG5cbiAgICBzZXRwcm90by5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHdoaWxlICh0aGlzLmxlbmd0aCkge1xuICAgICAgICB0aGlzLnBvcCgpO1xuICAgICAgfVxuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNldC5zcGxpY2VcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgcmFuZ2Ugb2YgZWxlbWVudHMgZnJvbSB0aGUgc2V0XG4gICAgICoqXG4gICAgIC0gaW5kZXggKG51bWJlcikgcG9zaXRpb24gb2YgdGhlIGRlbGV0aW9uXG4gICAgIC0gY291bnQgKG51bWJlcikgbnVtYmVyIG9mIGVsZW1lbnQgdG8gcmVtb3ZlXG4gICAgIC0gaW5zZXJ0aW9u4oCmIChvYmplY3QpICNvcHRpb25hbCBlbGVtZW50cyB0byBpbnNlcnRcbiAgICAgPSAob2JqZWN0KSBzZXQgZWxlbWVudHMgdGhhdCB3ZXJlIGRlbGV0ZWRcbiAgICBcXCovXG5cblxuICAgIHNldHByb3RvLnNwbGljZSA9IGZ1bmN0aW9uIChpbmRleCwgY291bnQsIGluc2VydGlvbikge1xuICAgICAgaW5kZXggPSBpbmRleCA8IDAgPyBtbWF4KHRoaXMubGVuZ3RoICsgaW5kZXgsIDApIDogaW5kZXg7XG4gICAgICBjb3VudCA9IG1tYXgoMCwgbW1pbih0aGlzLmxlbmd0aCAtIGluZGV4LCBjb3VudCkpO1xuICAgICAgdmFyIHRhaWwgPSBbXSxcbiAgICAgICAgICB0b2RlbCA9IFtdLFxuICAgICAgICAgIGFyZ3MgPSBbXSxcbiAgICAgICAgICBpO1xuXG4gICAgICBmb3IgKGkgPSAyOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICB0b2RlbC5wdXNoKHRoaXNbaW5kZXggKyBpXSk7XG4gICAgICB9XG5cbiAgICAgIGZvciAoOyBpIDwgdGhpcy5sZW5ndGggLSBpbmRleDsgaSsrKSB7XG4gICAgICAgIHRhaWwucHVzaCh0aGlzW2luZGV4ICsgaV0pO1xuICAgICAgfVxuXG4gICAgICB2YXIgYXJnbGVuID0gYXJncy5sZW5ndGg7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBhcmdsZW4gKyB0YWlsLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMuaXRlbXNbaW5kZXggKyBpXSA9IHRoaXNbaW5kZXggKyBpXSA9IGkgPCBhcmdsZW4gPyBhcmdzW2ldIDogdGFpbFtpIC0gYXJnbGVuXTtcbiAgICAgIH1cblxuICAgICAgaSA9IHRoaXMuaXRlbXMubGVuZ3RoID0gdGhpcy5sZW5ndGggLT0gY291bnQgLSBhcmdsZW47XG5cbiAgICAgIHdoaWxlICh0aGlzW2ldKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzW2krK107XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgU2V0KHRvZGVsKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTZXQuZXhjbHVkZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBnaXZlbiBlbGVtZW50IGZyb20gdGhlIHNldFxuICAgICAqKlxuICAgICAtIGVsZW1lbnQgKG9iamVjdCkgZWxlbWVudCB0byByZW1vdmVcbiAgICAgPSAoYm9vbGVhbikgYHRydWVgIGlmIG9iamVjdCB3YXMgZm91bmQgYW5kIHJlbW92ZWQgZnJvbSB0aGUgc2V0XG4gICAgXFwqL1xuXG5cbiAgICBzZXRwcm90by5leGNsdWRlID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB0aGlzLmxlbmd0aDsgaSA8IGlpOyBpKyspIGlmICh0aGlzW2ldID09IGVsKSB7XG4gICAgICAgIHRoaXMuc3BsaWNlKGksIDEpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNldC5pbnNlcnRBZnRlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogSW5zZXJ0cyBzZXQgZWxlbWVudHMgYWZ0ZXIgZ2l2ZW4gZWxlbWVudC5cbiAgICAgKipcbiAgICAgLSBlbGVtZW50IChvYmplY3QpIHNldCB3aWxsIGJlIGluc2VydGVkIGFmdGVyIHRoaXMgZWxlbWVudFxuICAgICA9IChvYmplY3QpIFNldCBvYmplY3RcbiAgICBcXCovXG5cblxuICAgIHNldHByb3RvLmluc2VydEFmdGVyID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICB2YXIgaSA9IHRoaXMuaXRlbXMubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHRoaXMuaXRlbXNbaV0uaW5zZXJ0QWZ0ZXIoZWwpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTZXQuZ2V0QkJveFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogVW5pb24gb2YgYWxsIGJib3hlcyBvZiB0aGUgc2V0LiBTZWUgQEVsZW1lbnQuZ2V0QkJveC5cbiAgICAgPSAob2JqZWN0KSBib3VuZGluZyBib3ggZGVzY3JpcHRvci4gU2VlIEBFbGVtZW50LmdldEJCb3guXG4gICAgXFwqL1xuXG5cbiAgICBzZXRwcm90by5nZXRCQm94ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHggPSBbXSxcbiAgICAgICAgICB5ID0gW10sXG4gICAgICAgICAgeDIgPSBbXSxcbiAgICAgICAgICB5MiA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gdGhpcy5pdGVtcy5sZW5ndGg7IGktLTspIGlmICghdGhpcy5pdGVtc1tpXS5yZW1vdmVkKSB7XG4gICAgICAgIHZhciBib3ggPSB0aGlzLml0ZW1zW2ldLmdldEJCb3goKTtcbiAgICAgICAgeC5wdXNoKGJveC54KTtcbiAgICAgICAgeS5wdXNoKGJveC55KTtcbiAgICAgICAgeDIucHVzaChib3gueCArIGJveC53aWR0aCk7XG4gICAgICAgIHkyLnB1c2goYm94LnkgKyBib3guaGVpZ2h0KTtcbiAgICAgIH1cblxuICAgICAgeCA9IG1taW4uYXBwbHkoMCwgeCk7XG4gICAgICB5ID0gbW1pbi5hcHBseSgwLCB5KTtcbiAgICAgIHgyID0gbW1heC5hcHBseSgwLCB4Mik7XG4gICAgICB5MiA9IG1tYXguYXBwbHkoMCwgeTIpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogeCxcbiAgICAgICAgeTogeSxcbiAgICAgICAgeDI6IHgyLFxuICAgICAgICB5MjogeTIsXG4gICAgICAgIHdpZHRoOiB4MiAtIHgsXG4gICAgICAgIGhlaWdodDogeTIgLSB5LFxuICAgICAgICBjeDogeCArICh4MiAtIHgpIC8gMixcbiAgICAgICAgY3k6IHkgKyAoeTIgLSB5KSAvIDJcbiAgICAgIH07XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU2V0Lmluc2VydEFmdGVyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGEgY2xvbmUgb2YgdGhlIHNldC5cbiAgICAgKipcbiAgICAgPSAob2JqZWN0KSBOZXcgU2V0IG9iamVjdFxuICAgIFxcKi9cblxuXG4gICAgc2V0cHJvdG8uY2xvbmUgPSBmdW5jdGlvbiAocykge1xuICAgICAgcyA9IG5ldyBTZXQoKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gdGhpcy5pdGVtcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgIHMucHVzaCh0aGlzLml0ZW1zW2ldLmNsb25lKCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcztcbiAgICB9O1xuXG4gICAgc2V0cHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gXCJTbmFwXFx1MjAxOHMgc2V0XCI7XG4gICAgfTtcblxuICAgIHNldHByb3RvLnR5cGUgPSBcInNldFwiOyAvLyBleHBvcnRcblxuICAgIC8qXFxcbiAgICAgKiBTbmFwLlNldFxuICAgICBbIHByb3BlcnR5IF1cbiAgICAgKipcbiAgICAgKiBTZXQgY29uc3RydWN0b3IuXG4gICAgXFwqL1xuXG4gICAgU25hcC5TZXQgPSBTZXQ7XG4gICAgLypcXFxuICAgICAqIFNuYXAuc2V0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBDcmVhdGVzIGEgc2V0IGFuZCBmaWxscyBpdCB3aXRoIGxpc3Qgb2YgYXJndW1lbnRzLlxuICAgICAqKlxuICAgICA9IChvYmplY3QpIE5ldyBTZXQgb2JqZWN0XG4gICAgIHwgdmFyIHIgPSBwYXBlci5yZWN0KDAsIDAsIDEwLCAxMCksXG4gICAgIHwgICAgIHMxID0gU25hcC5zZXQoKSwgLy8gZW1wdHkgc2V0XG4gICAgIHwgICAgIHMyID0gU25hcC5zZXQociwgcGFwZXIuY2lyY2xlKDEwMCwgMTAwLCAyMCkpOyAvLyBwcmVmaWxsZWQgc2V0XG4gICAgXFwqL1xuXG4gICAgU25hcC5zZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2V0ID0gbmV3IFNldCgpO1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBzZXQucHVzaC5hcHBseShzZXQsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2V0O1xuICAgIH07XG4gIH0pOyAvLyBDb3B5cmlnaHQgKGMpIDIwMTMgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gIC8vXG4gIC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIC8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gIC8vXG4gIC8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAvL1xuICAvLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIC8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIC8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiAgU25hcC5wbHVnaW4oZnVuY3Rpb24gKFNuYXAsIEVsZW1lbnQsIFBhcGVyLCBnbG9iKSB7XG4gICAgdmFyIG5hbWVzID0ge30sXG4gICAgICAgIHJlVW5pdCA9IC9bJWEtel0rJC9pLFxuICAgICAgICBTdHIgPSBTdHJpbmc7XG4gICAgbmFtZXMuc3Ryb2tlID0gbmFtZXMuZmlsbCA9IFwiY29sb3VyXCI7XG5cbiAgICBmdW5jdGlvbiBnZXRFbXB0eShpdGVtKSB7XG4gICAgICB2YXIgbCA9IGl0ZW1bMF07XG5cbiAgICAgIHN3aXRjaCAobC50b0xvd2VyQ2FzZSgpKSB7XG4gICAgICAgIGNhc2UgXCJ0XCI6XG4gICAgICAgICAgcmV0dXJuIFtsLCAwLCAwXTtcblxuICAgICAgICBjYXNlIFwibVwiOlxuICAgICAgICAgIHJldHVybiBbbCwgMSwgMCwgMCwgMSwgMCwgMF07XG5cbiAgICAgICAgY2FzZSBcInJcIjpcbiAgICAgICAgICBpZiAoaXRlbS5sZW5ndGggPT0gNCkge1xuICAgICAgICAgICAgcmV0dXJuIFtsLCAwLCBpdGVtWzJdLCBpdGVtWzNdXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFtsLCAwXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgY2FzZSBcInNcIjpcbiAgICAgICAgICBpZiAoaXRlbS5sZW5ndGggPT0gNSkge1xuICAgICAgICAgICAgcmV0dXJuIFtsLCAxLCAxLCBpdGVtWzNdLCBpdGVtWzRdXTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0ubGVuZ3RoID09IDMpIHtcbiAgICAgICAgICAgIHJldHVybiBbbCwgMSwgMV07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbbCwgMV07XG4gICAgICAgICAgfVxuXG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXF1YWxpc2VUcmFuc2Zvcm0odDEsIHQyLCBnZXRCQm94KSB7XG4gICAgICB0MSA9IHQxIHx8IG5ldyBTbmFwLk1hdHJpeCgpO1xuICAgICAgdDIgPSB0MiB8fCBuZXcgU25hcC5NYXRyaXgoKTtcbiAgICAgIHQxID0gU25hcC5wYXJzZVRyYW5zZm9ybVN0cmluZyh0MS50b1RyYW5zZm9ybVN0cmluZygpKSB8fCBbXTtcbiAgICAgIHQyID0gU25hcC5wYXJzZVRyYW5zZm9ybVN0cmluZyh0Mi50b1RyYW5zZm9ybVN0cmluZygpKSB8fCBbXTtcbiAgICAgIHZhciBtYXhsZW5ndGggPSBNYXRoLm1heCh0MS5sZW5ndGgsIHQyLmxlbmd0aCksXG4gICAgICAgICAgZnJvbSA9IFtdLFxuICAgICAgICAgIHRvID0gW10sXG4gICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgaixcbiAgICAgICAgICBqaixcbiAgICAgICAgICB0dDEsXG4gICAgICAgICAgdHQyO1xuXG4gICAgICBmb3IgKDsgaSA8IG1heGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHR0MSA9IHQxW2ldIHx8IGdldEVtcHR5KHQyW2ldKTtcbiAgICAgICAgdHQyID0gdDJbaV0gfHwgZ2V0RW1wdHkodHQxKTtcblxuICAgICAgICBpZiAodHQxWzBdICE9IHR0MlswXSB8fCB0dDFbMF0udG9Mb3dlckNhc2UoKSA9PSBcInJcIiAmJiAodHQxWzJdICE9IHR0MlsyXSB8fCB0dDFbM10gIT0gdHQyWzNdKSB8fCB0dDFbMF0udG9Mb3dlckNhc2UoKSA9PSBcInNcIiAmJiAodHQxWzNdICE9IHR0MlszXSB8fCB0dDFbNF0gIT0gdHQyWzRdKSkge1xuICAgICAgICAgIHQxID0gU25hcC5fLnRyYW5zZm9ybTJtYXRyaXgodDEsIGdldEJCb3goKSk7XG4gICAgICAgICAgdDIgPSBTbmFwLl8udHJhbnNmb3JtMm1hdHJpeCh0MiwgZ2V0QkJveCgpKTtcbiAgICAgICAgICBmcm9tID0gW1tcIm1cIiwgdDEuYSwgdDEuYiwgdDEuYywgdDEuZCwgdDEuZSwgdDEuZl1dO1xuICAgICAgICAgIHRvID0gW1tcIm1cIiwgdDIuYSwgdDIuYiwgdDIuYywgdDIuZCwgdDIuZSwgdDIuZl1dO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJvbVtpXSA9IFtdO1xuICAgICAgICB0b1tpXSA9IFtdO1xuXG4gICAgICAgIGZvciAoaiA9IDAsIGpqID0gTWF0aC5tYXgodHQxLmxlbmd0aCwgdHQyLmxlbmd0aCk7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgaiBpbiB0dDEgJiYgKGZyb21baV1bal0gPSB0dDFbal0pO1xuICAgICAgICAgIGogaW4gdHQyICYmICh0b1tpXVtqXSA9IHR0MltqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZnJvbTogcGF0aDJhcnJheShmcm9tKSxcbiAgICAgICAgdG86IHBhdGgyYXJyYXkodG8pLFxuICAgICAgICBmOiBnZXRQYXRoKGZyb20pXG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE51bWJlcih2YWwpIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VW5pdCh1bml0KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICByZXR1cm4gK3ZhbC50b0ZpeGVkKDMpICsgdW5pdDtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Vmlld0JveCh2YWwpIHtcbiAgICAgIHJldHVybiB2YWwuam9pbihcIiBcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0Q29sb3VyKGNscikge1xuICAgICAgcmV0dXJuIFNuYXAucmdiKGNsclswXSwgY2xyWzFdLCBjbHJbMl0sIGNsclszXSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UGF0aChwYXRoKSB7XG4gICAgICB2YXIgayA9IDAsXG4gICAgICAgICAgaSxcbiAgICAgICAgICBpaSxcbiAgICAgICAgICBqLFxuICAgICAgICAgIGpqLFxuICAgICAgICAgIG91dCxcbiAgICAgICAgICBhLFxuICAgICAgICAgIGIgPSBbXTtcblxuICAgICAgZm9yIChpID0gMCwgaWkgPSBwYXRoLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgb3V0ID0gXCJbXCI7XG4gICAgICAgIGEgPSBbJ1wiJyArIHBhdGhbaV1bMF0gKyAnXCInXTtcblxuICAgICAgICBmb3IgKGogPSAxLCBqaiA9IHBhdGhbaV0ubGVuZ3RoOyBqIDwgamo7IGorKykge1xuICAgICAgICAgIGFbal0gPSBcInZhbFtcIiArIGsrKyArIFwiXVwiO1xuICAgICAgICB9XG5cbiAgICAgICAgb3V0ICs9IGEgKyBcIl1cIjtcbiAgICAgICAgYltpXSA9IG91dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIEZ1bmN0aW9uKFwidmFsXCIsIFwicmV0dXJuIFNuYXAucGF0aC50b1N0cmluZy5jYWxsKFtcIiArIGIgKyBcIl0pXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhdGgyYXJyYXkocGF0aCkge1xuICAgICAgdmFyIG91dCA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSBwYXRoLmxlbmd0aDsgaSA8IGlpOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDEsIGpqID0gcGF0aFtpXS5sZW5ndGg7IGogPCBqajsgaisrKSB7XG4gICAgICAgICAgb3V0LnB1c2gocGF0aFtpXVtqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc051bWVyaWMob2JqKSB7XG4gICAgICByZXR1cm4gaXNGaW5pdGUob2JqKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheUVxdWFsKGFycjEsIGFycjIpIHtcbiAgICAgIGlmICghU25hcC5pcyhhcnIxLCBcImFycmF5XCIpIHx8ICFTbmFwLmlzKGFycjIsIFwiYXJyYXlcIikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYXJyMS50b1N0cmluZygpID09IGFycjIudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBFbGVtZW50LnByb3RvdHlwZS5lcXVhbCA9IGZ1bmN0aW9uIChuYW1lLCBiKSB7XG4gICAgICByZXR1cm4gZXZlKFwic25hcC51dGlsLmVxdWFsXCIsIHRoaXMsIG5hbWUsIGIpLmZpcnN0RGVmaW5lZCgpO1xuICAgIH07XG5cbiAgICBldmUub24oXCJzbmFwLnV0aWwuZXF1YWxcIiwgZnVuY3Rpb24gKG5hbWUsIGIpIHtcbiAgICAgIHZhciBBLFxuICAgICAgICAgIEIsXG4gICAgICAgICAgYSA9IFN0cih0aGlzLmF0dHIobmFtZSkgfHwgXCJcIiksXG4gICAgICAgICAgZWwgPSB0aGlzO1xuXG4gICAgICBpZiAobmFtZXNbbmFtZV0gPT0gXCJjb2xvdXJcIikge1xuICAgICAgICBBID0gU25hcC5jb2xvcihhKTtcbiAgICAgICAgQiA9IFNuYXAuY29sb3IoYik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZnJvbTogW0EuciwgQS5nLCBBLmIsIEEub3BhY2l0eV0sXG4gICAgICAgICAgdG86IFtCLnIsIEIuZywgQi5iLCBCLm9wYWNpdHldLFxuICAgICAgICAgIGY6IGdldENvbG91clxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZiAobmFtZSA9PSBcInZpZXdCb3hcIikge1xuICAgICAgICBBID0gdGhpcy5hdHRyKG5hbWUpLnZiLnNwbGl0KFwiIFwiKS5tYXAoTnVtYmVyKTtcbiAgICAgICAgQiA9IGIuc3BsaXQoXCIgXCIpLm1hcChOdW1iZXIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGZyb206IEEsXG4gICAgICAgICAgdG86IEIsXG4gICAgICAgICAgZjogZ2V0Vmlld0JveFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZiAobmFtZSA9PSBcInRyYW5zZm9ybVwiIHx8IG5hbWUgPT0gXCJncmFkaWVudFRyYW5zZm9ybVwiIHx8IG5hbWUgPT0gXCJwYXR0ZXJuVHJhbnNmb3JtXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBiID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICBiID0gU3RyKGIpLnJlcGxhY2UoL1xcLnszfXxcXHUyMDI2L2csIGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgYSA9IHRoaXMubWF0cml4O1xuXG4gICAgICAgIGlmICghU25hcC5fLnJnVHJhbnNmb3JtLnRlc3QoYikpIHtcbiAgICAgICAgICBiID0gU25hcC5fLnRyYW5zZm9ybTJtYXRyaXgoU25hcC5fLnN2Z1RyYW5zZm9ybTJzdHJpbmcoYiksIHRoaXMuZ2V0QkJveCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiID0gU25hcC5fLnRyYW5zZm9ybTJtYXRyaXgoYiwgdGhpcy5nZXRCQm94KCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVxdWFsaXNlVHJhbnNmb3JtKGEsIGIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gZWwuZ2V0QkJveCgxKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChuYW1lID09IFwiZFwiIHx8IG5hbWUgPT0gXCJwYXRoXCIpIHtcbiAgICAgICAgQSA9IFNuYXAucGF0aC50b0N1YmljKGEsIGIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGZyb206IHBhdGgyYXJyYXkoQVswXSksXG4gICAgICAgICAgdG86IHBhdGgyYXJyYXkoQVsxXSksXG4gICAgICAgICAgZjogZ2V0UGF0aChBWzBdKVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZiAobmFtZSA9PSBcInBvaW50c1wiKSB7XG4gICAgICAgIEEgPSBTdHIoYSkuc3BsaXQoU25hcC5fLnNlcGFyYXRvcik7XG4gICAgICAgIEIgPSBTdHIoYikuc3BsaXQoU25hcC5fLnNlcGFyYXRvcik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZnJvbTogQSxcbiAgICAgICAgICB0bzogQixcbiAgICAgICAgICBmOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzTnVtZXJpYyhhKSAmJiBpc051bWVyaWMoYikpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBmcm9tOiBwYXJzZUZsb2F0KGEpLFxuICAgICAgICAgIHRvOiBwYXJzZUZsb2F0KGIpLFxuICAgICAgICAgIGY6IGdldE51bWJlclxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICB2YXIgYVVuaXQgPSBhLm1hdGNoKHJlVW5pdCksXG4gICAgICAgICAgYlVuaXQgPSBTdHIoYikubWF0Y2gocmVVbml0KTtcblxuICAgICAgaWYgKGFVbml0ICYmIGFycmF5RXF1YWwoYVVuaXQsIGJVbml0KSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGZyb206IHBhcnNlRmxvYXQoYSksXG4gICAgICAgICAgdG86IHBhcnNlRmxvYXQoYiksXG4gICAgICAgICAgZjogZ2V0VW5pdChhVW5pdClcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZnJvbTogdGhpcy5hc1BYKG5hbWUpLFxuICAgICAgICAgIHRvOiB0aGlzLmFzUFgobmFtZSwgYiksXG4gICAgICAgICAgZjogZ2V0TnVtYmVyXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSk7XG4gIH0pOyAvLyBDb3B5cmlnaHQgKGMpIDIwMTMgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gIC8vIFxuICAvLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAvLyB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gIC8vIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAvLyBcbiAgLy8gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gIC8vIFxuICAvLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIC8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIC8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiAgU25hcC5wbHVnaW4oZnVuY3Rpb24gKFNuYXAsIEVsZW1lbnQsIFBhcGVyLCBnbG9iKSB7XG4gICAgdmFyIGVscHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZSxcbiAgICAgICAgaGFzID0gXCJoYXNPd25Qcm9wZXJ0eVwiLFxuICAgICAgICBzdXBwb3J0c1RvdWNoID0gXCJjcmVhdGVUb3VjaFwiIGluIGdsb2IuZG9jLFxuICAgICAgICBldmVudHMgPSBbXCJjbGlja1wiLCBcImRibGNsaWNrXCIsIFwibW91c2Vkb3duXCIsIFwibW91c2Vtb3ZlXCIsIFwibW91c2VvdXRcIiwgXCJtb3VzZW92ZXJcIiwgXCJtb3VzZXVwXCIsIFwidG91Y2hzdGFydFwiLCBcInRvdWNobW92ZVwiLCBcInRvdWNoZW5kXCIsIFwidG91Y2hjYW5jZWxcIl0sXG4gICAgICAgIHRvdWNoTWFwID0ge1xuICAgICAgbW91c2Vkb3duOiBcInRvdWNoc3RhcnRcIixcbiAgICAgIG1vdXNlbW92ZTogXCJ0b3VjaG1vdmVcIixcbiAgICAgIG1vdXNldXA6IFwidG91Y2hlbmRcIlxuICAgIH0sXG4gICAgICAgIGdldFNjcm9sbCA9IGZ1bmN0aW9uICh4eSwgZWwpIHtcbiAgICAgIHZhciBuYW1lID0geHkgPT0gXCJ5XCIgPyBcInNjcm9sbFRvcFwiIDogXCJzY3JvbGxMZWZ0XCIsXG4gICAgICAgICAgZG9jID0gZWwgJiYgZWwubm9kZSA/IGVsLm5vZGUub3duZXJEb2N1bWVudCA6IGdsb2IuZG9jO1xuICAgICAgcmV0dXJuIGRvY1tuYW1lIGluIGRvYy5kb2N1bWVudEVsZW1lbnQgPyBcImRvY3VtZW50RWxlbWVudFwiIDogXCJib2R5XCJdW25hbWVdO1xuICAgIH0sXG4gICAgICAgIHByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgICAgIHByZXZlbnRUb3VjaCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9LFxuICAgICAgICBzdG9wUHJvcGFnYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNhbmNlbEJ1YmJsZSA9IHRydWU7XG4gICAgfSxcbiAgICAgICAgc3RvcFRvdWNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMub3JpZ2luYWxFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9LFxuICAgICAgICBhZGRFdmVudCA9IGZ1bmN0aW9uIChvYmosIHR5cGUsIGZuLCBlbGVtZW50KSB7XG4gICAgICB2YXIgcmVhbE5hbWUgPSBzdXBwb3J0c1RvdWNoICYmIHRvdWNoTWFwW3R5cGVdID8gdG91Y2hNYXBbdHlwZV0gOiB0eXBlLFxuICAgICAgICAgIGYgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgc2Nyb2xsWSA9IGdldFNjcm9sbChcInlcIiwgZWxlbWVudCksXG4gICAgICAgICAgICBzY3JvbGxYID0gZ2V0U2Nyb2xsKFwieFwiLCBlbGVtZW50KTtcblxuICAgICAgICBpZiAoc3VwcG9ydHNUb3VjaCAmJiB0b3VjaE1hcFtoYXNdKHR5cGUpKSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlpID0gZS50YXJnZXRUb3VjaGVzICYmIGUudGFyZ2V0VG91Y2hlcy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZS50YXJnZXRUb3VjaGVzW2ldLnRhcmdldCA9PSBvYmogfHwgb2JqLmNvbnRhaW5zKGUudGFyZ2V0VG91Y2hlc1tpXS50YXJnZXQpKSB7XG4gICAgICAgICAgICAgIHZhciBvbGRlID0gZTtcbiAgICAgICAgICAgICAgZSA9IGUudGFyZ2V0VG91Y2hlc1tpXTtcbiAgICAgICAgICAgICAgZS5vcmlnaW5hbEV2ZW50ID0gb2xkZTtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IHByZXZlbnRUb3VjaDtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24gPSBzdG9wVG91Y2g7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB4ID0gZS5jbGllbnRYICsgc2Nyb2xsWCxcbiAgICAgICAgICAgIHkgPSBlLmNsaWVudFkgKyBzY3JvbGxZO1xuICAgICAgICByZXR1cm4gZm4uY2FsbChlbGVtZW50LCBlLCB4LCB5KTtcbiAgICAgIH07XG5cbiAgICAgIGlmICh0eXBlICE9PSByZWFsTmFtZSkge1xuICAgICAgICBvYmouYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyKHJlYWxOYW1lLCBmLCBmYWxzZSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZSAhPT0gcmVhbE5hbWUpIHtcbiAgICAgICAgICBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBmLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBvYmoucmVtb3ZlRXZlbnRMaXN0ZW5lcihyZWFsTmFtZSwgZiwgZmFsc2UpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSxcbiAgICAgICAgZHJhZyA9IFtdLFxuICAgICAgICBkcmFnTW92ZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgeCA9IGUuY2xpZW50WCxcbiAgICAgICAgICB5ID0gZS5jbGllbnRZLFxuICAgICAgICAgIHNjcm9sbFkgPSBnZXRTY3JvbGwoXCJ5XCIpLFxuICAgICAgICAgIHNjcm9sbFggPSBnZXRTY3JvbGwoXCJ4XCIpLFxuICAgICAgICAgIGRyYWdpLFxuICAgICAgICAgIGogPSBkcmFnLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICBkcmFnaSA9IGRyYWdbal07XG5cbiAgICAgICAgaWYgKHN1cHBvcnRzVG91Y2gpIHtcbiAgICAgICAgICB2YXIgaSA9IGUudG91Y2hlcyAmJiBlLnRvdWNoZXMubGVuZ3RoLFxuICAgICAgICAgICAgICB0b3VjaDtcblxuICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIHRvdWNoID0gZS50b3VjaGVzW2ldO1xuXG4gICAgICAgICAgICBpZiAodG91Y2guaWRlbnRpZmllciA9PSBkcmFnaS5lbC5fZHJhZy5pZCB8fCBkcmFnaS5lbC5ub2RlLmNvbnRhaW5zKHRvdWNoLnRhcmdldCkpIHtcbiAgICAgICAgICAgICAgeCA9IHRvdWNoLmNsaWVudFg7XG4gICAgICAgICAgICAgIHkgPSB0b3VjaC5jbGllbnRZO1xuICAgICAgICAgICAgICAoZS5vcmlnaW5hbEV2ZW50ID8gZS5vcmlnaW5hbEV2ZW50IDogZSkucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBub2RlID0gZHJhZ2kuZWwubm9kZSxcbiAgICAgICAgICAgIG8sXG4gICAgICAgICAgICBuZXh0ID0gbm9kZS5uZXh0U2libGluZyxcbiAgICAgICAgICAgIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZSxcbiAgICAgICAgICAgIGRpc3BsYXkgPSBub2RlLnN0eWxlLmRpc3BsYXk7IC8vIGdsb2Iud2luLm9wZXJhICYmIHBhcmVudC5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgLy8gbm9kZS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIC8vIG8gPSBkcmFnaS5lbC5wYXBlci5nZXRFbGVtZW50QnlQb2ludCh4LCB5KTtcbiAgICAgICAgLy8gbm9kZS5zdHlsZS5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICAgICAgLy8gZ2xvYi53aW4ub3BlcmEgJiYgKG5leHQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKG5vZGUsIG5leHQpIDogcGFyZW50LmFwcGVuZENoaWxkKG5vZGUpKTtcbiAgICAgICAgLy8gbyAmJiBldmUoXCJzbmFwLmRyYWcub3Zlci5cIiArIGRyYWdpLmVsLmlkLCBkcmFnaS5lbCwgbyk7XG5cbiAgICAgICAgeCArPSBzY3JvbGxYO1xuICAgICAgICB5ICs9IHNjcm9sbFk7XG4gICAgICAgIGV2ZShcInNuYXAuZHJhZy5tb3ZlLlwiICsgZHJhZ2kuZWwuaWQsIGRyYWdpLm1vdmVfc2NvcGUgfHwgZHJhZ2kuZWwsIHggLSBkcmFnaS5lbC5fZHJhZy54LCB5IC0gZHJhZ2kuZWwuX2RyYWcueSwgeCwgeSwgZSk7XG4gICAgICB9XG4gICAgfSxcbiAgICAgICAgZHJhZ1VwID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgIFNuYXAudW5tb3VzZW1vdmUoZHJhZ01vdmUpLnVubW91c2V1cChkcmFnVXApO1xuICAgICAgdmFyIGkgPSBkcmFnLmxlbmd0aCxcbiAgICAgICAgICBkcmFnaTtcblxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBkcmFnaSA9IGRyYWdbaV07XG4gICAgICAgIGRyYWdpLmVsLl9kcmFnID0ge307XG4gICAgICAgIGV2ZShcInNuYXAuZHJhZy5lbmQuXCIgKyBkcmFnaS5lbC5pZCwgZHJhZ2kuZW5kX3Njb3BlIHx8IGRyYWdpLnN0YXJ0X3Njb3BlIHx8IGRyYWdpLm1vdmVfc2NvcGUgfHwgZHJhZ2kuZWwsIGUpO1xuICAgICAgICBldmUub2ZmKFwic25hcC5kcmFnLiouXCIgKyBkcmFnaS5lbC5pZCk7XG4gICAgICB9XG5cbiAgICAgIGRyYWcgPSBbXTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmNsaWNrXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGEgY2xpY2sgZXZlbnQgaGFuZGxlciB0byB0aGUgZWxlbWVudFxuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cblxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVuY2xpY2tcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgYSBjbGljayBldmVudCBoYW5kbGVyIGZyb20gdGhlIGVsZW1lbnRcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG5cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5kYmxjbGlja1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBhIGRvdWJsZSBjbGljayBldmVudCBoYW5kbGVyIHRvIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5kYmxjbGlja1xuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBhIGRvdWJsZSBjbGljayBldmVudCBoYW5kbGVyIGZyb20gdGhlIGVsZW1lbnRcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG5cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5tb3VzZWRvd25cbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgYSBtb3VzZWRvd24gZXZlbnQgaGFuZGxlciB0byB0aGUgZWxlbWVudFxuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cblxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVubW91c2Vkb3duXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGEgbW91c2Vkb3duIGV2ZW50IGhhbmRsZXIgZnJvbSB0aGUgZWxlbWVudFxuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cblxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lm1vdXNlbW92ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBhIG1vdXNlbW92ZSBldmVudCBoYW5kbGVyIHRvIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5tb3VzZW1vdmVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgYSBtb3VzZW1vdmUgZXZlbnQgaGFuZGxlciBmcm9tIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQubW91c2VvdXRcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgYSBtb3VzZW91dCBldmVudCBoYW5kbGVyIHRvIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5tb3VzZW91dFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBhIG1vdXNlb3V0IGV2ZW50IGhhbmRsZXIgZnJvbSB0aGUgZWxlbWVudFxuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cblxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50Lm1vdXNlb3ZlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBhIG1vdXNlb3ZlciBldmVudCBoYW5kbGVyIHRvIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5tb3VzZW92ZXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJlbW92ZXMgYSBtb3VzZW92ZXIgZXZlbnQgaGFuZGxlciBmcm9tIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQubW91c2V1cFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBhIG1vdXNldXAgZXZlbnQgaGFuZGxlciB0byB0aGUgZWxlbWVudFxuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cblxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVubW91c2V1cFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBhIG1vdXNldXAgZXZlbnQgaGFuZGxlciBmcm9tIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudG91Y2hzdGFydFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBhIHRvdWNoc3RhcnQgZXZlbnQgaGFuZGxlciB0byB0aGUgZWxlbWVudFxuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cblxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LnVudG91Y2hzdGFydFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBhIHRvdWNoc3RhcnQgZXZlbnQgaGFuZGxlciBmcm9tIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudG91Y2htb3ZlXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGEgdG91Y2htb3ZlIGV2ZW50IGhhbmRsZXIgdG8gdGhlIGVsZW1lbnRcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG5cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bnRvdWNobW92ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBhIHRvdWNobW92ZSBldmVudCBoYW5kbGVyIGZyb20gdGhlIGVsZW1lbnRcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG5cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC50b3VjaGVuZFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWRkcyBhIHRvdWNoZW5kIGV2ZW50IGhhbmRsZXIgdG8gdGhlIGVsZW1lbnRcbiAgICAgLSBoYW5kbGVyIChmdW5jdGlvbikgaGFuZGxlciBmb3IgdGhlIGV2ZW50XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG5cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC51bnRvdWNoZW5kXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGEgdG91Y2hlbmQgZXZlbnQgaGFuZGxlciBmcm9tIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudG91Y2hjYW5jZWxcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEFkZHMgYSB0b3VjaGNhbmNlbCBldmVudCBoYW5kbGVyIHRvIHRoZSBlbGVtZW50XG4gICAgIC0gaGFuZGxlciAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIHRoZSBldmVudFxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW50b3VjaGNhbmNlbFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBhIHRvdWNoY2FuY2VsIGV2ZW50IGhhbmRsZXIgZnJvbSB0aGUgZWxlbWVudFxuICAgICAtIGhhbmRsZXIgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciB0aGUgZXZlbnRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cblxuXG4gICAgZm9yICh2YXIgaSA9IGV2ZW50cy5sZW5ndGg7IGktLTspIHtcbiAgICAgIChmdW5jdGlvbiAoZXZlbnROYW1lKSB7XG4gICAgICAgIFNuYXBbZXZlbnROYW1lXSA9IGVscHJvdG9bZXZlbnROYW1lXSA9IGZ1bmN0aW9uIChmbiwgc2NvcGUpIHtcbiAgICAgICAgICBpZiAoU25hcC5pcyhmbiwgXCJmdW5jdGlvblwiKSkge1xuICAgICAgICAgICAgdGhpcy5ldmVudHMgPSB0aGlzLmV2ZW50cyB8fCBbXTtcbiAgICAgICAgICAgIHRoaXMuZXZlbnRzLnB1c2goe1xuICAgICAgICAgICAgICBuYW1lOiBldmVudE5hbWUsXG4gICAgICAgICAgICAgIGY6IGZuLFxuICAgICAgICAgICAgICB1bmJpbmQ6IGFkZEV2ZW50KHRoaXMubm9kZSB8fCBkb2N1bWVudCwgZXZlbnROYW1lLCBmbiwgc2NvcGUgfHwgdGhpcylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgaWkgPSB0aGlzLmV2ZW50cy5sZW5ndGg7IGkgPCBpaTsgaSsrKSBpZiAodGhpcy5ldmVudHNbaV0ubmFtZSA9PSBldmVudE5hbWUpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmV2ZW50c1tpXS5mLmNhbGwodGhpcyk7XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH07XG5cbiAgICAgICAgU25hcFtcInVuXCIgKyBldmVudE5hbWVdID0gZWxwcm90b1tcInVuXCIgKyBldmVudE5hbWVdID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgdmFyIGV2ZW50cyA9IHRoaXMuZXZlbnRzIHx8IFtdLFxuICAgICAgICAgICAgICBsID0gZXZlbnRzLmxlbmd0aDtcblxuICAgICAgICAgIHdoaWxlIChsLS0pIGlmIChldmVudHNbbF0ubmFtZSA9PSBldmVudE5hbWUgJiYgKGV2ZW50c1tsXS5mID09IGZuIHx8ICFmbikpIHtcbiAgICAgICAgICAgIGV2ZW50c1tsXS51bmJpbmQoKTtcbiAgICAgICAgICAgIGV2ZW50cy5zcGxpY2UobCwgMSk7XG4gICAgICAgICAgICAhZXZlbnRzLmxlbmd0aCAmJiBkZWxldGUgdGhpcy5ldmVudHM7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfTtcbiAgICAgIH0pKGV2ZW50c1tpXSk7XG4gICAgfVxuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmhvdmVyXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGhvdmVyIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBlbGVtZW50XG4gICAgIC0gZl9pbiAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGhvdmVyIGluXG4gICAgIC0gZl9vdXQgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBob3ZlciBvdXRcbiAgICAgLSBpY29udGV4dCAob2JqZWN0KSAjb3B0aW9uYWwgY29udGV4dCBmb3IgaG92ZXIgaW4gaGFuZGxlclxuICAgICAtIG9jb250ZXh0IChvYmplY3QpICNvcHRpb25hbCBjb250ZXh0IGZvciBob3ZlciBvdXQgaGFuZGxlclxuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgXFwqL1xuXG5cbiAgICBlbHByb3RvLmhvdmVyID0gZnVuY3Rpb24gKGZfaW4sIGZfb3V0LCBzY29wZV9pbiwgc2NvcGVfb3V0KSB7XG4gICAgICByZXR1cm4gdGhpcy5tb3VzZW92ZXIoZl9pbiwgc2NvcGVfaW4pLm1vdXNlb3V0KGZfb3V0LCBzY29wZV9vdXQgfHwgc2NvcGVfaW4pO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5ob3ZlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmVtb3ZlcyBob3ZlciBldmVudCBoYW5kbGVycyBmcm9tIHRoZSBlbGVtZW50XG4gICAgIC0gZl9pbiAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGhvdmVyIGluXG4gICAgIC0gZl9vdXQgKGZ1bmN0aW9uKSBoYW5kbGVyIGZvciBob3ZlciBvdXRcbiAgICAgPSAob2JqZWN0KSBARWxlbWVudFxuICAgIFxcKi9cblxuXG4gICAgZWxwcm90by51bmhvdmVyID0gZnVuY3Rpb24gKGZfaW4sIGZfb3V0KSB7XG4gICAgICByZXR1cm4gdGhpcy51bm1vdXNlb3ZlcihmX2luKS51bm1vdXNlb3V0KGZfb3V0KTtcbiAgICB9O1xuXG4gICAgdmFyIGRyYWdnYWJsZSA9IFtdOyAvLyBTSUVSUkEgdW5jbGVhciB3aGF0IF9jb250ZXh0XyByZWZlcnMgdG8gZm9yIHN0YXJ0aW5nLCBlbmRpbmcsIG1vdmluZyB0aGUgZHJhZyBnZXN0dXJlLlxuICAgIC8vIFNJRVJSQSBFbGVtZW50LmRyYWcoKTogX3ggcG9zaXRpb24gb2YgdGhlIG1vdXNlXzogV2hlcmUgYXJlIHRoZSB4L3kgdmFsdWVzIG9mZnNldCBmcm9tP1xuICAgIC8vIFNJRVJSQSBFbGVtZW50LmRyYWcoKTogbXVjaCBvZiB0aGlzIG1lbWJlcidzIGRvYyBhcHBlYXJzIHRvIGJlIGR1cGxpY2F0ZWQgZm9yIHNvbWUgcmVhc29uLlxuICAgIC8vIFNJRVJSQSBVbmNsZWFyIGFib3V0IHRoaXMgc2VudGVuY2U6IF9BZGRpdGlvbmFsbHkgZm9sbG93aW5nIGRyYWcgZXZlbnRzIHdpbGwgYmUgdHJpZ2dlcmVkOiBkcmFnLnN0YXJ0LjxpZD4gb24gc3RhcnQsIGRyYWcuZW5kLjxpZD4gb24gZW5kIGFuZCBkcmFnLm1vdmUuPGlkPiBvbiBldmVyeSBtb3ZlLl8gSXMgdGhlcmUgYSBnbG9iYWwgX2RyYWdfIG9iamVjdCB0byB3aGljaCB5b3UgY2FuIGFzc2lnbiBoYW5kbGVycyBrZXllZCBieSBhbiBlbGVtZW50J3MgSUQ/XG5cbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5kcmFnXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBhbiBlbGVtZW50J3MgZHJhZyBnZXN0dXJlXG4gICAgICoqXG4gICAgIC0gb25tb3ZlIChmdW5jdGlvbikgaGFuZGxlciBmb3IgbW92aW5nXG4gICAgIC0gb25zdGFydCAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGRyYWcgc3RhcnRcbiAgICAgLSBvbmVuZCAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGRyYWcgZW5kXG4gICAgIC0gbWNvbnRleHQgKG9iamVjdCkgI29wdGlvbmFsIGNvbnRleHQgZm9yIG1vdmluZyBoYW5kbGVyXG4gICAgIC0gc2NvbnRleHQgKG9iamVjdCkgI29wdGlvbmFsIGNvbnRleHQgZm9yIGRyYWcgc3RhcnQgaGFuZGxlclxuICAgICAtIGVjb250ZXh0IChvYmplY3QpICNvcHRpb25hbCBjb250ZXh0IGZvciBkcmFnIGVuZCBoYW5kbGVyXG4gICAgICogQWRkaXRpb25hbHkgZm9sbG93aW5nIGBkcmFnYCBldmVudHMgYXJlIHRyaWdnZXJlZDogYGRyYWcuc3RhcnQuPGlkPmAgb24gc3RhcnQsIFxuICAgICAqIGBkcmFnLmVuZC48aWQ+YCBvbiBlbmQgYW5kIGBkcmFnLm1vdmUuPGlkPmAgb24gZXZlcnkgbW92ZS4gV2hlbiBlbGVtZW50IGlzIGRyYWdnZWQgb3ZlciBhbm90aGVyIGVsZW1lbnQgXG4gICAgICogYGRyYWcub3Zlci48aWQ+YCBmaXJlcyBhcyB3ZWxsLlxuICAgICAqXG4gICAgICogU3RhcnQgZXZlbnQgYW5kIHN0YXJ0IGhhbmRsZXIgYXJlIGNhbGxlZCBpbiBzcGVjaWZpZWQgY29udGV4dCBvciBpbiBjb250ZXh0IG9mIHRoZSBlbGVtZW50IHdpdGggZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gICAgIG8geCAobnVtYmVyKSB4IHBvc2l0aW9uIG9mIHRoZSBtb3VzZVxuICAgICBvIHkgKG51bWJlcikgeSBwb3NpdGlvbiBvZiB0aGUgbW91c2VcbiAgICAgbyBldmVudCAob2JqZWN0KSBET00gZXZlbnQgb2JqZWN0XG4gICAgICogTW92ZSBldmVudCBhbmQgbW92ZSBoYW5kbGVyIGFyZSBjYWxsZWQgaW4gc3BlY2lmaWVkIGNvbnRleHQgb3IgaW4gY29udGV4dCBvZiB0aGUgZWxlbWVudCB3aXRoIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICAgICBvIGR4IChudW1iZXIpIHNoaWZ0IGJ5IHggZnJvbSB0aGUgc3RhcnQgcG9pbnRcbiAgICAgbyBkeSAobnVtYmVyKSBzaGlmdCBieSB5IGZyb20gdGhlIHN0YXJ0IHBvaW50XG4gICAgIG8geCAobnVtYmVyKSB4IHBvc2l0aW9uIG9mIHRoZSBtb3VzZVxuICAgICBvIHkgKG51bWJlcikgeSBwb3NpdGlvbiBvZiB0aGUgbW91c2VcbiAgICAgbyBldmVudCAob2JqZWN0KSBET00gZXZlbnQgb2JqZWN0XG4gICAgICogRW5kIGV2ZW50IGFuZCBlbmQgaGFuZGxlciBhcmUgY2FsbGVkIGluIHNwZWNpZmllZCBjb250ZXh0IG9yIGluIGNvbnRleHQgb2YgdGhlIGVsZW1lbnQgd2l0aCBmb2xsb3dpbmcgcGFyYW1ldGVyczpcbiAgICAgbyBldmVudCAob2JqZWN0KSBET00gZXZlbnQgb2JqZWN0XG4gICAgID0gKG9iamVjdCkgQEVsZW1lbnRcbiAgICBcXCovXG5cbiAgICBlbHByb3RvLmRyYWcgPSBmdW5jdGlvbiAob25tb3ZlLCBvbnN0YXJ0LCBvbmVuZCwgbW92ZV9zY29wZSwgc3RhcnRfc2NvcGUsIGVuZF9zY29wZSkge1xuICAgICAgdmFyIGVsID0gdGhpcztcblxuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBvcmlnVHJhbnNmb3JtO1xuICAgICAgICByZXR1cm4gZWwuZHJhZyhmdW5jdGlvbiAoZHgsIGR5KSB7XG4gICAgICAgICAgdGhpcy5hdHRyKHtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogb3JpZ1RyYW5zZm9ybSArIChvcmlnVHJhbnNmb3JtID8gXCJUXCIgOiBcInRcIikgKyBbZHgsIGR5XVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgb3JpZ1RyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3JtKCkubG9jYWw7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzdGFydChlLCB4LCB5KSB7XG4gICAgICAgIChlLm9yaWdpbmFsRXZlbnQgfHwgZSkucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZWwuX2RyYWcueCA9IHg7XG4gICAgICAgIGVsLl9kcmFnLnkgPSB5O1xuICAgICAgICBlbC5fZHJhZy5pZCA9IGUuaWRlbnRpZmllcjtcbiAgICAgICAgIWRyYWcubGVuZ3RoICYmIFNuYXAubW91c2Vtb3ZlKGRyYWdNb3ZlKS5tb3VzZXVwKGRyYWdVcCk7XG4gICAgICAgIGRyYWcucHVzaCh7XG4gICAgICAgICAgZWw6IGVsLFxuICAgICAgICAgIG1vdmVfc2NvcGU6IG1vdmVfc2NvcGUsXG4gICAgICAgICAgc3RhcnRfc2NvcGU6IHN0YXJ0X3Njb3BlLFxuICAgICAgICAgIGVuZF9zY29wZTogZW5kX3Njb3BlXG4gICAgICAgIH0pO1xuICAgICAgICBvbnN0YXJ0ICYmIGV2ZS5vbihcInNuYXAuZHJhZy5zdGFydC5cIiArIGVsLmlkLCBvbnN0YXJ0KTtcbiAgICAgICAgb25tb3ZlICYmIGV2ZS5vbihcInNuYXAuZHJhZy5tb3ZlLlwiICsgZWwuaWQsIG9ubW92ZSk7XG4gICAgICAgIG9uZW5kICYmIGV2ZS5vbihcInNuYXAuZHJhZy5lbmQuXCIgKyBlbC5pZCwgb25lbmQpO1xuICAgICAgICBldmUoXCJzbmFwLmRyYWcuc3RhcnQuXCIgKyBlbC5pZCwgc3RhcnRfc2NvcGUgfHwgbW92ZV9zY29wZSB8fCBlbCwgeCwgeSwgZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGluaXQoZSwgeCwgeSkge1xuICAgICAgICBldmUoXCJzbmFwLmRyYWdpbml0LlwiICsgZWwuaWQsIGVsLCBlLCB4LCB5KTtcbiAgICAgIH1cblxuICAgICAgZXZlLm9uKFwic25hcC5kcmFnaW5pdC5cIiArIGVsLmlkLCBzdGFydCk7XG4gICAgICBlbC5fZHJhZyA9IHt9O1xuICAgICAgZHJhZ2dhYmxlLnB1c2goe1xuICAgICAgICBlbDogZWwsXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgaW5pdDogaW5pdFxuICAgICAgfSk7XG4gICAgICBlbC5tb3VzZWRvd24oaW5pdCk7XG4gICAgICByZXR1cm4gZWw7XG4gICAgfTtcbiAgICAvKlxuICAgICAqIEVsZW1lbnQub25EcmFnT3ZlclxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogU2hvcnRjdXQgdG8gYXNzaWduIGV2ZW50IGhhbmRsZXIgZm9yIGBkcmFnLm92ZXIuPGlkPmAgZXZlbnQsIHdoZXJlIGBpZGAgaXMgdGhlIGVsZW1lbnQncyBgaWRgIChzZWUgQEVsZW1lbnQuaWQpXG4gICAgIC0gZiAoZnVuY3Rpb24pIGhhbmRsZXIgZm9yIGV2ZW50LCBmaXJzdCBhcmd1bWVudCB3b3VsZCBiZSB0aGUgZWxlbWVudCB5b3UgYXJlIGRyYWdnaW5nIG92ZXJcbiAgICBcXCovXG4gICAgLy8gZWxwcm90by5vbkRyYWdPdmVyID0gZnVuY3Rpb24gKGYpIHtcbiAgICAvLyAgICAgZiA/IGV2ZS5vbihcInNuYXAuZHJhZy5vdmVyLlwiICsgdGhpcy5pZCwgZikgOiBldmUudW5iaW5kKFwic25hcC5kcmFnLm92ZXIuXCIgKyB0aGlzLmlkKTtcbiAgICAvLyB9O1xuXG4gICAgLypcXFxuICAgICAqIEVsZW1lbnQudW5kcmFnXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZW1vdmVzIGFsbCBkcmFnIGV2ZW50IGhhbmRsZXJzIGZyb20gdGhlIGdpdmVuIGVsZW1lbnRcbiAgICBcXCovXG5cblxuICAgIGVscHJvdG8udW5kcmFnID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGkgPSBkcmFnZ2FibGUubGVuZ3RoO1xuXG4gICAgICB3aGlsZSAoaS0tKSBpZiAoZHJhZ2dhYmxlW2ldLmVsID09IHRoaXMpIHtcbiAgICAgICAgdGhpcy51bm1vdXNlZG93bihkcmFnZ2FibGVbaV0uaW5pdCk7XG4gICAgICAgIGRyYWdnYWJsZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGV2ZS51bmJpbmQoXCJzbmFwLmRyYWcuKi5cIiArIHRoaXMuaWQpO1xuICAgICAgICBldmUudW5iaW5kKFwic25hcC5kcmFnaW5pdC5cIiArIHRoaXMuaWQpO1xuICAgICAgfVxuXG4gICAgICAhZHJhZ2dhYmxlLmxlbmd0aCAmJiBTbmFwLnVubW91c2Vtb3ZlKGRyYWdNb3ZlKS51bm1vdXNldXAoZHJhZ1VwKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gIH0pOyAvLyBDb3B5cmlnaHQgKGMpIDIwMTMgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gIC8vXG4gIC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIC8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gIC8vXG4gIC8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAvL1xuICAvLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIC8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIC8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiAgU25hcC5wbHVnaW4oZnVuY3Rpb24gKFNuYXAsIEVsZW1lbnQsIFBhcGVyLCBnbG9iKSB7XG4gICAgdmFyIGVscHJvdG8gPSBFbGVtZW50LnByb3RvdHlwZSxcbiAgICAgICAgcHByb3RvID0gUGFwZXIucHJvdG90eXBlLFxuICAgICAgICByZ3VybCA9IC9eXFxzKnVybFxcKCguKylcXCkvLFxuICAgICAgICBTdHIgPSBTdHJpbmcsXG4gICAgICAgICQgPSBTbmFwLl8uJDtcbiAgICBTbmFwLmZpbHRlciA9IHt9O1xuICAgIC8qXFxcbiAgICAgKiBQYXBlci5maWx0ZXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIENyZWF0ZXMgYSBgPGZpbHRlcj5gIGVsZW1lbnRcbiAgICAgKipcbiAgICAgLSBmaWxzdHIgKHN0cmluZykgU1ZHIGZyYWdtZW50IG9mIGZpbHRlciBwcm92aWRlZCBhcyBhIHN0cmluZ1xuICAgICA9IChvYmplY3QpIEBFbGVtZW50XG4gICAgICogTm90ZTogSXQgaXMgcmVjb21tZW5kZWQgdG8gdXNlIGZpbHRlcnMgZW1iZWRkZWQgaW50byB0aGUgcGFnZSBpbnNpZGUgYW4gZW1wdHkgU1ZHIGVsZW1lbnQuXG4gICAgID4gVXNhZ2VcbiAgICAgfCB2YXIgZiA9IHBhcGVyLmZpbHRlcignPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj1cIjJcIi8+JyksXG4gICAgIHwgICAgIGMgPSBwYXBlci5jaXJjbGUoMTAsIDEwLCAxMCkuYXR0cih7XG4gICAgIHwgICAgICAgICBmaWx0ZXI6IGZcbiAgICAgfCAgICAgfSk7XG4gICAgXFwqL1xuXG4gICAgcHByb3RvLmZpbHRlciA9IGZ1bmN0aW9uIChmaWxzdHIpIHtcbiAgICAgIHZhciBwYXBlciA9IHRoaXM7XG5cbiAgICAgIGlmIChwYXBlci50eXBlICE9IFwic3ZnXCIpIHtcbiAgICAgICAgcGFwZXIgPSBwYXBlci5wYXBlcjtcbiAgICAgIH1cblxuICAgICAgdmFyIGYgPSBTbmFwLnBhcnNlKFN0cihmaWxzdHIpKSxcbiAgICAgICAgICBpZCA9IFNuYXAuXy5pZCgpLFxuICAgICAgICAgIHdpZHRoID0gcGFwZXIubm9kZS5vZmZzZXRXaWR0aCxcbiAgICAgICAgICBoZWlnaHQgPSBwYXBlci5ub2RlLm9mZnNldEhlaWdodCxcbiAgICAgICAgICBmaWx0ZXIgPSAkKFwiZmlsdGVyXCIpO1xuXG4gICAgICAkKGZpbHRlciwge1xuICAgICAgICBpZDogaWQsXG4gICAgICAgIGZpbHRlclVuaXRzOiBcInVzZXJTcGFjZU9uVXNlXCJcbiAgICAgIH0pO1xuICAgICAgZmlsdGVyLmFwcGVuZENoaWxkKGYubm9kZSk7XG4gICAgICBwYXBlci5kZWZzLmFwcGVuZENoaWxkKGZpbHRlcik7XG4gICAgICByZXR1cm4gbmV3IEVsZW1lbnQoZmlsdGVyKTtcbiAgICB9O1xuXG4gICAgZXZlLm9uKFwic25hcC51dGlsLmdldGF0dHIuZmlsdGVyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGV2ZS5zdG9wKCk7XG4gICAgICB2YXIgcCA9ICQodGhpcy5ub2RlLCBcImZpbHRlclwiKTtcblxuICAgICAgaWYgKHApIHtcbiAgICAgICAgdmFyIG1hdGNoID0gU3RyKHApLm1hdGNoKHJndXJsKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoICYmIFNuYXAuc2VsZWN0KG1hdGNoWzFdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBldmUub24oXCJzbmFwLnV0aWwuYXR0ci5maWx0ZXJcIiwgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBFbGVtZW50ICYmIHZhbHVlLnR5cGUgPT0gXCJmaWx0ZXJcIikge1xuICAgICAgICBldmUuc3RvcCgpO1xuICAgICAgICB2YXIgaWQgPSB2YWx1ZS5ub2RlLmlkO1xuXG4gICAgICAgIGlmICghaWQpIHtcbiAgICAgICAgICAkKHZhbHVlLm5vZGUsIHtcbiAgICAgICAgICAgIGlkOiB2YWx1ZS5pZFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlkID0gdmFsdWUuaWQ7XG4gICAgICAgIH1cblxuICAgICAgICAkKHRoaXMubm9kZSwge1xuICAgICAgICAgIGZpbHRlcjogU25hcC51cmwoaWQpXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXZhbHVlIHx8IHZhbHVlID09IFwibm9uZVwiKSB7XG4gICAgICAgIGV2ZS5zdG9wKCk7XG4gICAgICAgIHRoaXMubm9kZS5yZW1vdmVBdHRyaWJ1dGUoXCJmaWx0ZXJcIik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLypcXFxuICAgICAqIFNuYXAuZmlsdGVyLmJsdXJcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgYW4gU1ZHIG1hcmt1cCBzdHJpbmcgZm9yIHRoZSBibHVyIGZpbHRlclxuICAgICAqKlxuICAgICAtIHggKG51bWJlcikgYW1vdW50IG9mIGhvcml6b250YWwgYmx1ciwgaW4gcGl4ZWxzXG4gICAgIC0geSAobnVtYmVyKSAjb3B0aW9uYWwgYW1vdW50IG9mIHZlcnRpY2FsIGJsdXIsIGluIHBpeGVsc1xuICAgICA9IChzdHJpbmcpIGZpbHRlciByZXByZXNlbnRhdGlvblxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIGYgPSBwYXBlci5maWx0ZXIoU25hcC5maWx0ZXIuYmx1cig1LCAxMCkpLFxuICAgICB8ICAgICBjID0gcGFwZXIuY2lyY2xlKDEwLCAxMCwgMTApLmF0dHIoe1xuICAgICB8ICAgICAgICAgZmlsdGVyOiBmXG4gICAgIHwgICAgIH0pO1xuICAgIFxcKi9cblxuICAgIFNuYXAuZmlsdGVyLmJsdXIgPSBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgaWYgKHggPT0gbnVsbCkge1xuICAgICAgICB4ID0gMjtcbiAgICAgIH1cblxuICAgICAgdmFyIGRlZiA9IHkgPT0gbnVsbCA/IHggOiBbeCwgeV07XG4gICAgICByZXR1cm4gU25hcC5mb3JtYXQoJ1xcPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj1cIntkZWZ9XCIvPicsIHtcbiAgICAgICAgZGVmOiBkZWZcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBTbmFwLmZpbHRlci5ibHVyLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMoKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmZpbHRlci5zaGFkb3dcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgYW4gU1ZHIG1hcmt1cCBzdHJpbmcgZm9yIHRoZSBzaGFkb3cgZmlsdGVyXG4gICAgICoqXG4gICAgIC0gZHggKG51bWJlcikgI29wdGlvbmFsIGhvcml6b250YWwgc2hpZnQgb2YgdGhlIHNoYWRvdywgaW4gcGl4ZWxzXG4gICAgIC0gZHkgKG51bWJlcikgI29wdGlvbmFsIHZlcnRpY2FsIHNoaWZ0IG9mIHRoZSBzaGFkb3csIGluIHBpeGVsc1xuICAgICAtIGJsdXIgKG51bWJlcikgI29wdGlvbmFsIGFtb3VudCBvZiBibHVyXG4gICAgIC0gY29sb3IgKHN0cmluZykgI29wdGlvbmFsIGNvbG9yIG9mIHRoZSBzaGFkb3dcbiAgICAgLSBvcGFjaXR5IChudW1iZXIpICNvcHRpb25hbCBgMC4uMWAgb3BhY2l0eSBvZiB0aGUgc2hhZG93XG4gICAgICogb3JcbiAgICAgLSBkeCAobnVtYmVyKSAjb3B0aW9uYWwgaG9yaXpvbnRhbCBzaGlmdCBvZiB0aGUgc2hhZG93LCBpbiBwaXhlbHNcbiAgICAgLSBkeSAobnVtYmVyKSAjb3B0aW9uYWwgdmVydGljYWwgc2hpZnQgb2YgdGhlIHNoYWRvdywgaW4gcGl4ZWxzXG4gICAgIC0gY29sb3IgKHN0cmluZykgI29wdGlvbmFsIGNvbG9yIG9mIHRoZSBzaGFkb3dcbiAgICAgLSBvcGFjaXR5IChudW1iZXIpICNvcHRpb25hbCBgMC4uMWAgb3BhY2l0eSBvZiB0aGUgc2hhZG93XG4gICAgICogd2hpY2ggbWFrZXMgYmx1ciBkZWZhdWx0IHRvIGA0YC4gT3JcbiAgICAgLSBkeCAobnVtYmVyKSAjb3B0aW9uYWwgaG9yaXpvbnRhbCBzaGlmdCBvZiB0aGUgc2hhZG93LCBpbiBwaXhlbHNcbiAgICAgLSBkeSAobnVtYmVyKSAjb3B0aW9uYWwgdmVydGljYWwgc2hpZnQgb2YgdGhlIHNoYWRvdywgaW4gcGl4ZWxzXG4gICAgIC0gb3BhY2l0eSAobnVtYmVyKSAjb3B0aW9uYWwgYDAuLjFgIG9wYWNpdHkgb2YgdGhlIHNoYWRvd1xuICAgICA9IChzdHJpbmcpIGZpbHRlciByZXByZXNlbnRhdGlvblxuICAgICA+IFVzYWdlXG4gICAgIHwgdmFyIGYgPSBwYXBlci5maWx0ZXIoU25hcC5maWx0ZXIuc2hhZG93KDAsIDIsIC4zKSksXG4gICAgIHwgICAgIGMgPSBwYXBlci5jaXJjbGUoMTAsIDEwLCAxMCkuYXR0cih7XG4gICAgIHwgICAgICAgICBmaWx0ZXI6IGZcbiAgICAgfCAgICAgfSk7XG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmZpbHRlci5zaGFkb3cgPSBmdW5jdGlvbiAoZHgsIGR5LCBibHVyLCBjb2xvciwgb3BhY2l0eSkge1xuICAgICAgaWYgKG9wYWNpdHkgPT0gbnVsbCkge1xuICAgICAgICBpZiAoY29sb3IgPT0gbnVsbCkge1xuICAgICAgICAgIG9wYWNpdHkgPSBibHVyO1xuICAgICAgICAgIGJsdXIgPSA0O1xuICAgICAgICAgIGNvbG9yID0gXCIjMDAwXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3BhY2l0eSA9IGNvbG9yO1xuICAgICAgICAgIGNvbG9yID0gYmx1cjtcbiAgICAgICAgICBibHVyID0gNDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoYmx1ciA9PSBudWxsKSB7XG4gICAgICAgIGJsdXIgPSA0O1xuICAgICAgfVxuXG4gICAgICBpZiAob3BhY2l0eSA9PSBudWxsKSB7XG4gICAgICAgIG9wYWNpdHkgPSAxO1xuICAgICAgfVxuXG4gICAgICBpZiAoZHggPT0gbnVsbCkge1xuICAgICAgICBkeCA9IDA7XG4gICAgICAgIGR5ID0gMjtcbiAgICAgIH1cblxuICAgICAgaWYgKGR5ID09IG51bGwpIHtcbiAgICAgICAgZHkgPSBkeDtcbiAgICAgIH1cblxuICAgICAgY29sb3IgPSBTbmFwLmNvbG9yKGNvbG9yKTtcbiAgICAgIHJldHVybiBTbmFwLmZvcm1hdCgnPGZlR2F1c3NpYW5CbHVyIGluPVwiU291cmNlQWxwaGFcIiBzdGREZXZpYXRpb249XCJ7Ymx1cn1cIi8+PGZlT2Zmc2V0IGR4PVwie2R4fVwiIGR5PVwie2R5fVwiIHJlc3VsdD1cIm9mZnNldGJsdXJcIi8+PGZlRmxvb2QgZmxvb2QtY29sb3I9XCJ7Y29sb3J9XCIvPjxmZUNvbXBvc2l0ZSBpbjI9XCJvZmZzZXRibHVyXCIgb3BlcmF0b3I9XCJpblwiLz48ZmVDb21wb25lbnRUcmFuc2Zlcj48ZmVGdW5jQSB0eXBlPVwibGluZWFyXCIgc2xvcGU9XCJ7b3BhY2l0eX1cIi8+PC9mZUNvbXBvbmVudFRyYW5zZmVyPjxmZU1lcmdlPjxmZU1lcmdlTm9kZS8+PGZlTWVyZ2VOb2RlIGluPVwiU291cmNlR3JhcGhpY1wiLz48L2ZlTWVyZ2U+Jywge1xuICAgICAgICBjb2xvcjogY29sb3IsXG4gICAgICAgIGR4OiBkeCxcbiAgICAgICAgZHk6IGR5LFxuICAgICAgICBibHVyOiBibHVyLFxuICAgICAgICBvcGFjaXR5OiBvcGFjaXR5XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgU25hcC5maWx0ZXIuc2hhZG93LnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMoKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmZpbHRlci5ncmF5c2NhbGVcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgYW4gU1ZHIG1hcmt1cCBzdHJpbmcgZm9yIHRoZSBncmF5c2NhbGUgZmlsdGVyXG4gICAgICoqXG4gICAgIC0gYW1vdW50IChudW1iZXIpIGFtb3VudCBvZiBmaWx0ZXIgKGAwLi4xYClcbiAgICAgPSAoc3RyaW5nKSBmaWx0ZXIgcmVwcmVzZW50YXRpb25cbiAgICBcXCovXG5cblxuICAgIFNuYXAuZmlsdGVyLmdyYXlzY2FsZSA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgIGlmIChhbW91bnQgPT0gbnVsbCkge1xuICAgICAgICBhbW91bnQgPSAxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gU25hcC5mb3JtYXQoJzxmZUNvbG9yTWF0cml4IHR5cGU9XCJtYXRyaXhcIiB2YWx1ZXM9XCJ7YX0ge2J9IHtjfSAwIDAge2R9IHtlfSB7Zn0gMCAwIHtnfSB7Yn0ge2h9IDAgMCAwIDAgMCAxIDBcIi8+Jywge1xuICAgICAgICBhOiAwLjIxMjYgKyAwLjc4NzQgKiAoMSAtIGFtb3VudCksXG4gICAgICAgIGI6IDAuNzE1MiAtIDAuNzE1MiAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgYzogMC4wNzIyIC0gMC4wNzIyICogKDEgLSBhbW91bnQpLFxuICAgICAgICBkOiAwLjIxMjYgLSAwLjIxMjYgKiAoMSAtIGFtb3VudCksXG4gICAgICAgIGU6IDAuNzE1MiArIDAuMjg0OCAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgZjogMC4wNzIyIC0gMC4wNzIyICogKDEgLSBhbW91bnQpLFxuICAgICAgICBnOiAwLjIxMjYgLSAwLjIxMjYgKiAoMSAtIGFtb3VudCksXG4gICAgICAgIGg6IDAuMDcyMiArIDAuOTI3OCAqICgxIC0gYW1vdW50KVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNuYXAuZmlsdGVyLmdyYXlzY2FsZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzKCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5maWx0ZXIuc2VwaWFcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgYW4gU1ZHIG1hcmt1cCBzdHJpbmcgZm9yIHRoZSBzZXBpYSBmaWx0ZXJcbiAgICAgKipcbiAgICAgLSBhbW91bnQgKG51bWJlcikgYW1vdW50IG9mIGZpbHRlciAoYDAuLjFgKVxuICAgICA9IChzdHJpbmcpIGZpbHRlciByZXByZXNlbnRhdGlvblxuICAgIFxcKi9cblxuXG4gICAgU25hcC5maWx0ZXIuc2VwaWEgPSBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICBpZiAoYW1vdW50ID09IG51bGwpIHtcbiAgICAgICAgYW1vdW50ID0gMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIFNuYXAuZm9ybWF0KCc8ZmVDb2xvck1hdHJpeCB0eXBlPVwibWF0cml4XCIgdmFsdWVzPVwie2F9IHtifSB7Y30gMCAwIHtkfSB7ZX0ge2Z9IDAgMCB7Z30ge2h9IHtpfSAwIDAgMCAwIDAgMSAwXCIvPicsIHtcbiAgICAgICAgYTogMC4zOTMgKyAwLjYwNyAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgYjogMC43NjkgLSAwLjc2OSAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgYzogMC4xODkgLSAwLjE4OSAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgZDogMC4zNDkgLSAwLjM0OSAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgZTogMC42ODYgKyAwLjMxNCAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgZjogMC4xNjggLSAwLjE2OCAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgZzogMC4yNzIgLSAwLjI3MiAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgaDogMC41MzQgLSAwLjUzNCAqICgxIC0gYW1vdW50KSxcbiAgICAgICAgaTogMC4xMzEgKyAwLjg2OSAqICgxIC0gYW1vdW50KVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNuYXAuZmlsdGVyLnNlcGlhLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMoKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmZpbHRlci5zYXR1cmF0ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBhbiBTVkcgbWFya3VwIHN0cmluZyBmb3IgdGhlIHNhdHVyYXRlIGZpbHRlclxuICAgICAqKlxuICAgICAtIGFtb3VudCAobnVtYmVyKSBhbW91bnQgb2YgZmlsdGVyIChgMC4uMWApXG4gICAgID0gKHN0cmluZykgZmlsdGVyIHJlcHJlc2VudGF0aW9uXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmZpbHRlci5zYXR1cmF0ZSA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgIGlmIChhbW91bnQgPT0gbnVsbCkge1xuICAgICAgICBhbW91bnQgPSAxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gU25hcC5mb3JtYXQoJzxmZUNvbG9yTWF0cml4IHR5cGU9XCJzYXR1cmF0ZVwiIHZhbHVlcz1cInthbW91bnR9XCIvPicsIHtcbiAgICAgICAgYW1vdW50OiAxIC0gYW1vdW50XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgU25hcC5maWx0ZXIuc2F0dXJhdGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcygpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNuYXAuZmlsdGVyLmh1ZVJvdGF0ZVxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBhbiBTVkcgbWFya3VwIHN0cmluZyBmb3IgdGhlIGh1ZS1yb3RhdGUgZmlsdGVyXG4gICAgICoqXG4gICAgIC0gYW5nbGUgKG51bWJlcikgYW5nbGUgb2Ygcm90YXRpb25cbiAgICAgPSAoc3RyaW5nKSBmaWx0ZXIgcmVwcmVzZW50YXRpb25cbiAgICBcXCovXG5cblxuICAgIFNuYXAuZmlsdGVyLmh1ZVJvdGF0ZSA9IGZ1bmN0aW9uIChhbmdsZSkge1xuICAgICAgYW5nbGUgPSBhbmdsZSB8fCAwO1xuICAgICAgcmV0dXJuIFNuYXAuZm9ybWF0KCc8ZmVDb2xvck1hdHJpeCB0eXBlPVwiaHVlUm90YXRlXCIgdmFsdWVzPVwie2FuZ2xlfVwiLz4nLCB7XG4gICAgICAgIGFuZ2xlOiBhbmdsZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNuYXAuZmlsdGVyLmh1ZVJvdGF0ZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzKCk7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogU25hcC5maWx0ZXIuaW52ZXJ0XG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIGFuIFNWRyBtYXJrdXAgc3RyaW5nIGZvciB0aGUgaW52ZXJ0IGZpbHRlclxuICAgICAqKlxuICAgICAtIGFtb3VudCAobnVtYmVyKSBhbW91bnQgb2YgZmlsdGVyIChgMC4uMWApXG4gICAgID0gKHN0cmluZykgZmlsdGVyIHJlcHJlc2VudGF0aW9uXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmZpbHRlci5pbnZlcnQgPSBmdW5jdGlvbiAoYW1vdW50KSB7XG4gICAgICBpZiAoYW1vdW50ID09IG51bGwpIHtcbiAgICAgICAgYW1vdW50ID0gMTtcbiAgICAgIH0gLy8gICAgICAgIDxmZUNvbG9yTWF0cml4IHR5cGU9XCJtYXRyaXhcIiB2YWx1ZXM9XCItMSAwIDAgMCAxICAwIC0xIDAgMCAxICAwIDAgLTEgMCAxICAwIDAgMCAxIDBcIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9XCJzUkdCXCIvPlxuXG5cbiAgICAgIHJldHVybiBTbmFwLmZvcm1hdCgnPGZlQ29tcG9uZW50VHJhbnNmZXI+PGZlRnVuY1IgdHlwZT1cInRhYmxlXCIgdGFibGVWYWx1ZXM9XCJ7YW1vdW50fSB7YW1vdW50Mn1cIi8+PGZlRnVuY0cgdHlwZT1cInRhYmxlXCIgdGFibGVWYWx1ZXM9XCJ7YW1vdW50fSB7YW1vdW50Mn1cIi8+PGZlRnVuY0IgdHlwZT1cInRhYmxlXCIgdGFibGVWYWx1ZXM9XCJ7YW1vdW50fSB7YW1vdW50Mn1cIi8+PC9mZUNvbXBvbmVudFRyYW5zZmVyPicsIHtcbiAgICAgICAgYW1vdW50OiBhbW91bnQsXG4gICAgICAgIGFtb3VudDI6IDEgLSBhbW91bnRcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBTbmFwLmZpbHRlci5pbnZlcnQudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcygpO1xuICAgIH07XG4gICAgLypcXFxuICAgICAqIFNuYXAuZmlsdGVyLmJyaWdodG5lc3NcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIFJldHVybnMgYW4gU1ZHIG1hcmt1cCBzdHJpbmcgZm9yIHRoZSBicmlnaHRuZXNzIGZpbHRlclxuICAgICAqKlxuICAgICAtIGFtb3VudCAobnVtYmVyKSBhbW91bnQgb2YgZmlsdGVyIChgMC4uMWApXG4gICAgID0gKHN0cmluZykgZmlsdGVyIHJlcHJlc2VudGF0aW9uXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmZpbHRlci5icmlnaHRuZXNzID0gZnVuY3Rpb24gKGFtb3VudCkge1xuICAgICAgaWYgKGFtb3VudCA9PSBudWxsKSB7XG4gICAgICAgIGFtb3VudCA9IDE7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBTbmFwLmZvcm1hdCgnPGZlQ29tcG9uZW50VHJhbnNmZXI+PGZlRnVuY1IgdHlwZT1cImxpbmVhclwiIHNsb3BlPVwie2Ftb3VudH1cIi8+PGZlRnVuY0cgdHlwZT1cImxpbmVhclwiIHNsb3BlPVwie2Ftb3VudH1cIi8+PGZlRnVuY0IgdHlwZT1cImxpbmVhclwiIHNsb3BlPVwie2Ftb3VudH1cIi8+PC9mZUNvbXBvbmVudFRyYW5zZmVyPicsIHtcbiAgICAgICAgYW1vdW50OiBhbW91bnRcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBTbmFwLmZpbHRlci5icmlnaHRuZXNzLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHRoaXMoKTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmZpbHRlci5jb250cmFzdFxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogUmV0dXJucyBhbiBTVkcgbWFya3VwIHN0cmluZyBmb3IgdGhlIGNvbnRyYXN0IGZpbHRlclxuICAgICAqKlxuICAgICAtIGFtb3VudCAobnVtYmVyKSBhbW91bnQgb2YgZmlsdGVyIChgMC4uMWApXG4gICAgID0gKHN0cmluZykgZmlsdGVyIHJlcHJlc2VudGF0aW9uXG4gICAgXFwqL1xuXG5cbiAgICBTbmFwLmZpbHRlci5jb250cmFzdCA9IGZ1bmN0aW9uIChhbW91bnQpIHtcbiAgICAgIGlmIChhbW91bnQgPT0gbnVsbCkge1xuICAgICAgICBhbW91bnQgPSAxO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gU25hcC5mb3JtYXQoJzxmZUNvbXBvbmVudFRyYW5zZmVyPjxmZUZ1bmNSIHR5cGU9XCJsaW5lYXJcIiBzbG9wZT1cInthbW91bnR9XCIgaW50ZXJjZXB0PVwie2Ftb3VudDJ9XCIvPjxmZUZ1bmNHIHR5cGU9XCJsaW5lYXJcIiBzbG9wZT1cInthbW91bnR9XCIgaW50ZXJjZXB0PVwie2Ftb3VudDJ9XCIvPjxmZUZ1bmNCIHR5cGU9XCJsaW5lYXJcIiBzbG9wZT1cInthbW91bnR9XCIgaW50ZXJjZXB0PVwie2Ftb3VudDJ9XCIvPjwvZmVDb21wb25lbnRUcmFuc2Zlcj4nLCB7XG4gICAgICAgIGFtb3VudDogYW1vdW50LFxuICAgICAgICBhbW91bnQyOiAuNSAtIGFtb3VudCAvIDJcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBTbmFwLmZpbHRlci5jb250cmFzdC50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzKCk7XG4gICAgfTtcbiAgfSk7IC8vIENvcHlyaWdodCAoYykgMjAxNCBBZG9iZSBTeXN0ZW1zIEluY29ycG9yYXRlZC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAgLy9cbiAgLy8gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAvLyBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgLy9cbiAgLy8gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gIC8vXG4gIC8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgLy8gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICAvLyBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAvLyBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cblxuICBTbmFwLnBsdWdpbihmdW5jdGlvbiAoU25hcCwgRWxlbWVudCwgUGFwZXIsIGdsb2IsIEZyYWdtZW50KSB7XG4gICAgdmFyIGJveCA9IFNuYXAuXy5ib3gsXG4gICAgICAgIGlzID0gU25hcC5pcyxcbiAgICAgICAgZmlyc3RMZXR0ZXIgPSAvXlteYS16XSooW3RibWxyY10pL2ksXG4gICAgICAgIHRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIFwiVFwiICsgdGhpcy5keCArIFwiLFwiICsgdGhpcy5keTtcbiAgICB9O1xuICAgIC8qXFxcbiAgICAgKiBFbGVtZW50LmdldEFsaWduXG4gICAgIFsgbWV0aG9kIF1cbiAgICAgKipcbiAgICAgKiBSZXR1cm5zIHNoaWZ0IG5lZWRlZCB0byBhbGlnbiB0aGUgZWxlbWVudCByZWxhdGl2ZWx5IHRvIGdpdmVuIGVsZW1lbnQuXG4gICAgICogSWYgbm8gZWxlbWVudHMgc3BlY2lmaWVkLCBwYXJlbnQgYDxzdmc+YCBjb250YWluZXIgd2lsbCBiZSB1c2VkLlxuICAgICAtIGVsIChvYmplY3QpIEBvcHRpb25hbCBhbGlnbm1lbnQgZWxlbWVudFxuICAgICAtIHdheSAoc3RyaW5nKSBvbmUgb2Ygc2l4IHZhbHVlczogYFwidG9wXCJgLCBgXCJtaWRkbGVcImAsIGBcImJvdHRvbVwiYCwgYFwibGVmdFwiYCwgYFwiY2VudGVyXCJgLCBgXCJyaWdodFwiYFxuICAgICA9IChvYmplY3R8c3RyaW5nKSBPYmplY3QgaW4gZm9ybWF0IGB7ZHg6ICwgZHk6IH1gIGFsc28gaGFzIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGFzIGEgdHJhbnNmb3JtYXRpb24gc3RyaW5nXG4gICAgID4gVXNhZ2VcbiAgICAgfCBlbC50cmFuc2Zvcm0oZWwuZ2V0QWxpZ24oZWwyLCBcInRvcFwiKSk7XG4gICAgICogb3JcbiAgICAgfCB2YXIgZHkgPSBlbC5nZXRBbGlnbihlbDIsIFwidG9wXCIpLmR5O1xuICAgIFxcKi9cblxuXG4gICAgRWxlbWVudC5wcm90b3R5cGUuZ2V0QWxpZ24gPSBmdW5jdGlvbiAoZWwsIHdheSkge1xuICAgICAgaWYgKHdheSA9PSBudWxsICYmIGlzKGVsLCBcInN0cmluZ1wiKSkge1xuICAgICAgICB3YXkgPSBlbDtcbiAgICAgICAgZWwgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBlbCA9IGVsIHx8IHRoaXMucGFwZXI7XG4gICAgICB2YXIgYnggPSBlbC5nZXRCQm94ID8gZWwuZ2V0QkJveCgpIDogYm94KGVsKSxcbiAgICAgICAgICBiYiA9IHRoaXMuZ2V0QkJveCgpLFxuICAgICAgICAgIG91dCA9IHt9O1xuICAgICAgd2F5ID0gd2F5ICYmIHdheS5tYXRjaChmaXJzdExldHRlcik7XG4gICAgICB3YXkgPSB3YXkgPyB3YXlbMV0udG9Mb3dlckNhc2UoKSA6IFwiY1wiO1xuXG4gICAgICBzd2l0Y2ggKHdheSkge1xuICAgICAgICBjYXNlIFwidFwiOlxuICAgICAgICAgIG91dC5keCA9IDA7XG4gICAgICAgICAgb3V0LmR5ID0gYngueSAtIGJiLnk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImJcIjpcbiAgICAgICAgICBvdXQuZHggPSAwO1xuICAgICAgICAgIG91dC5keSA9IGJ4LnkyIC0gYmIueTI7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcIm1cIjpcbiAgICAgICAgICBvdXQuZHggPSAwO1xuICAgICAgICAgIG91dC5keSA9IGJ4LmN5IC0gYmIuY3k7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImxcIjpcbiAgICAgICAgICBvdXQuZHggPSBieC54IC0gYmIueDtcbiAgICAgICAgICBvdXQuZHkgPSAwO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJyXCI6XG4gICAgICAgICAgb3V0LmR4ID0gYngueDIgLSBiYi54MjtcbiAgICAgICAgICBvdXQuZHkgPSAwO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgb3V0LmR4ID0gYnguY3ggLSBiYi5jeDtcbiAgICAgICAgICBvdXQuZHkgPSAwO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBvdXQudG9TdHJpbmcgPSB0b1N0cmluZztcbiAgICAgIHJldHVybiBvdXQ7XG4gICAgfTtcbiAgICAvKlxcXG4gICAgICogRWxlbWVudC5hbGlnblxuICAgICBbIG1ldGhvZCBdXG4gICAgICoqXG4gICAgICogQWxpZ25zIHRoZSBlbGVtZW50IHJlbGF0aXZlbHkgdG8gZ2l2ZW4gb25lIHZpYSB0cmFuc2Zvcm1hdGlvbi5cbiAgICAgKiBJZiBubyBlbGVtZW50cyBzcGVjaWZpZWQsIHBhcmVudCBgPHN2Zz5gIGNvbnRhaW5lciB3aWxsIGJlIHVzZWQuXG4gICAgIC0gZWwgKG9iamVjdCkgQG9wdGlvbmFsIGFsaWdubWVudCBlbGVtZW50XG4gICAgIC0gd2F5IChzdHJpbmcpIG9uZSBvZiBzaXggdmFsdWVzOiBgXCJ0b3BcImAsIGBcIm1pZGRsZVwiYCwgYFwiYm90dG9tXCJgLCBgXCJsZWZ0XCJgLCBgXCJjZW50ZXJcImAsIGBcInJpZ2h0XCJgXG4gICAgID0gKG9iamVjdCkgdGhpcyBlbGVtZW50XG4gICAgID4gVXNhZ2VcbiAgICAgfCBlbC5hbGlnbihlbDIsIFwidG9wXCIpO1xuICAgICAqIG9yXG4gICAgIHwgZWwuYWxpZ24oXCJtaWRkbGVcIik7XG4gICAgXFwqL1xuXG5cbiAgICBFbGVtZW50LnByb3RvdHlwZS5hbGlnbiA9IGZ1bmN0aW9uIChlbCwgd2F5KSB7XG4gICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm0oXCIuLi5cIiArIHRoaXMuZ2V0QWxpZ24oZWwsIHdheSkpO1xuICAgIH07XG4gIH0pOyAvLyBDb3B5cmlnaHQgKGMpIDIwMTcgQWRvYmUgU3lzdGVtcyBJbmNvcnBvcmF0ZWQuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gIC8vXG4gIC8vIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gIC8vIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAgLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gIC8vXG4gIC8vIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAvL1xuICAvLyBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIC8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgLy8gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gIC8vIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiAgU25hcC5wbHVnaW4oZnVuY3Rpb24gKFNuYXAsIEVsZW1lbnQsIFBhcGVyLCBnbG9iKSB7XG4gICAgLy8gQ29sb3VycyBhcmUgZnJvbSBodHRwczovL3d3dy5tYXRlcmlhbHVpLmNvXG4gICAgdmFyIHJlZCA9IFwiI2ZmZWJlZSNmZmNkZDIjZWY5YTlhI2U1NzM3MyNlZjUzNTAjZjQ0MzM2I2U1MzkzNSNkMzJmMmYjYzYyODI4I2I3MWMxYyNmZjhhODAjZmY1MjUyI2ZmMTc0NCNkNTAwMDBcIixcbiAgICAgICAgcGluayA9IFwiI0ZDRTRFQyNGOEJCRDAjRjQ4RkIxI0YwNjI5MiNFQzQwN0EjRTkxRTYzI0Q4MUI2MCNDMjE4NUIjQUQxNDU3Izg4MEU0RiNGRjgwQUIjRkY0MDgxI0Y1MDA1NyNDNTExNjJcIixcbiAgICAgICAgcHVycGxlID0gXCIjRjNFNUY1I0UxQkVFNyNDRTkzRDgjQkE2OEM4I0FCNDdCQyM5QzI3QjAjOEUyNEFBIzdCMUZBMiM2QTFCOUEjNEExNDhDI0VBODBGQyNFMDQwRkIjRDUwMEY5I0FBMDBGRlwiLFxuICAgICAgICBkZWVwcHVycGxlID0gXCIjRURFN0Y2I0QxQzRFOSNCMzlEREIjOTU3NUNEIzdFNTdDMiM2NzNBQjcjNUUzNUIxIzUxMkRBOCM0NTI3QTAjMzExQjkyI0IzODhGRiM3QzRERkYjNjUxRkZGIzYyMDBFQVwiLFxuICAgICAgICBpbmRpZ28gPSBcIiNFOEVBRjYjQzVDQUU5IzlGQThEQSM3OTg2Q0IjNUM2QkMwIzNGNTFCNSMzOTQ5QUIjMzAzRjlGIzI4MzU5MyMxQTIzN0UjOEM5RUZGIzUzNkRGRSMzRDVBRkUjMzA0RkZFXCIsXG4gICAgICAgIGJsdWUgPSBcIiNFM0YyRkQjQkJERUZCIzkwQ0FGOSM2NEI1RjYjNjRCNUY2IzIxOTZGMyMxRTg4RTUjMTk3NkQyIzE1NjVDMCMwRDQ3QTEjODJCMUZGIzQ0OEFGRiMyOTc5RkYjMjk2MkZGXCIsXG4gICAgICAgIGxpZ2h0Ymx1ZSA9IFwiI0UxRjVGRSNCM0U1RkMjODFENEZBIzRGQzNGNyMyOUI2RjYjMDNBOUY0IzAzOUJFNSMwMjg4RDEjMDI3N0JEIzAxNTc5QiM4MEQ4RkYjNDBDNEZGIzAwQjBGRiMwMDkxRUFcIixcbiAgICAgICAgY3lhbiA9IFwiI0UwRjdGQSNCMkVCRjIjODBERUVBIzRERDBFMSMyNkM2REEjMDBCQ0Q0IzAwQUNDMSMwMDk3QTcjMDA4MzhGIzAwNjA2NCM4NEZGRkYjMThGRkZGIzAwRTVGRiMwMEI4RDRcIixcbiAgICAgICAgdGVhbCA9IFwiI0UwRjJGMSNCMkRGREIjODBDQkM0IzREQjZBQyMyNkE2OUEjMDA5Njg4IzAwODk3QiMwMDc5NkIjMDA2OTVDIzAwNEQ0MCNBN0ZGRUIjNjRGRkRBIzFERTlCNiMwMEJGQTVcIixcbiAgICAgICAgZ3JlZW4gPSBcIiNFOEY1RTkjQzhFNkM5I0E1RDZBNyM4MUM3ODQjNjZCQjZBIzRDQUY1MCM0M0EwNDcjMzg4RTNDIzJFN0QzMiMxQjVFMjAjQjlGNkNBIzY5RjBBRSMwMEU2NzYjMDBDODUzXCIsXG4gICAgICAgIGxpZ2h0Z3JlZW4gPSBcIiNGMUY4RTkjRENFREM4I0M1RTFBNSNBRUQ1ODEjOUNDQzY1IzhCQzM0QSM3Q0IzNDIjNjg5RjM4IzU1OEIyRiMzMzY5MUUjQ0NGRjkwI0IyRkY1OSM3NkZGMDMjNjRERDE3XCIsXG4gICAgICAgIGxpbWUgPSBcIiNGOUZCRTcjRjBGNEMzI0U2RUU5QyNEQ0U3NzUjRDRFMTU3I0NEREMzOSNDMENBMzMjQUZCNDJCIzlFOUQyNCM4Mjc3MTcjRjRGRjgxI0VFRkY0MSNDNkZGMDAjQUVFQTAwXCIsXG4gICAgICAgIHllbGxvdyA9IFwiI0ZGRkRFNyNGRkY5QzQjRkZGNTlEI0ZGRjE3NiNGRkVFNTgjRkZFQjNCI0ZERDgzNSNGQkMwMkQjRjlBODI1I0Y1N0YxNyNGRkZGOEQjRkZGRjAwI0ZGRUEwMCNGRkQ2MDBcIixcbiAgICAgICAgYW1iZXIgPSBcIiNGRkY4RTEjRkZFQ0IzI0ZGRTA4MiNGRkQ1NEYjRkZDQTI4I0ZGQzEwNyNGRkIzMDAjRkZBMDAwI0ZGOEYwMCNGRjZGMDAjRkZFNTdGI0ZGRDc0MCNGRkM0MDAjRkZBQjAwXCIsXG4gICAgICAgIG9yYW5nZSA9IFwiI0ZGRjNFMCNGRkUwQjIjRkZDQzgwI0ZGQjc0RCNGRkE3MjYjRkY5ODAwI0ZCOEMwMCNGNTdDMDAjRUY2QzAwI0U2NTEwMCNGRkQxODAjRkZBQjQwI0ZGOTEwMCNGRjZEMDBcIixcbiAgICAgICAgZGVlcG9yYW5nZSA9IFwiI0ZCRTlFNyNGRkNDQkMjRkZBQjkxI0ZGOEE2NSNGRjcwNDMjRkY1NzIyI0Y0NTExRSNFNjRBMTkjRDg0MzE1I0JGMzYwQyNGRjlFODAjRkY2RTQwI0ZGM0QwMCNERDJDMDBcIixcbiAgICAgICAgYnJvd24gPSBcIiNFRkVCRTkjRDdDQ0M4I0JDQUFBNCNBMTg4N0YjOEQ2RTYzIzc5NTU0OCM2RDRDNDEjNUQ0MDM3IzRFMzQyRSMzRTI3MjNcIixcbiAgICAgICAgZ3JleSA9IFwiI0ZBRkFGQSNGNUY1RjUjRUVFRUVFI0UwRTBFMCNCREJEQkQjOUU5RTlFIzc1NzU3NSM2MTYxNjEjNDI0MjQyIzIxMjEyMVwiLFxuICAgICAgICBibHVlZ3JleSA9IFwiI0VDRUZGMSNDRkQ4REMjQjBCRUM1IzkwQTRBRSM3ODkwOUMjNjA3RDhCIzU0NkU3QSM0NTVBNjQjMzc0NzRGIzI2MzIzOFwiO1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLm11aVxuICAgICBbIHByb3BlcnR5IF1cbiAgICAgKipcbiAgICAgKiBDb250YWluIE1hdGVyaWFsIFVJIGNvbG91cnMuXG4gICAgIHwgU25hcCgpLnJlY3QoMCwgMCwgMTAsIDEwKS5hdHRyKHtmaWxsOiBTbmFwLm11aS5kZWVwcHVycGxlLCBzdHJva2U6IFNuYXAubXVpLmFtYmVyWzYwMF19KTtcbiAgICAgIyBGb3IgY29sb3VyIHJlZmVyZW5jZTogPGEgaHJlZj1cImh0dHBzOi8vd3d3Lm1hdGVyaWFsdWkuY29cIj5odHRwczovL3d3dy5tYXRlcmlhbHVpLmNvPC9hPi5cbiAgICBcXCovXG5cbiAgICBTbmFwLm11aSA9IHt9O1xuICAgIC8qXFxcbiAgICAgKiBTbmFwLmZsYXRcbiAgICAgWyBwcm9wZXJ0eSBdXG4gICAgICoqXG4gICAgICogQ29udGFpbiBGbGF0IFVJIGNvbG91cnMuXG4gICAgIHwgU25hcCgpLnJlY3QoMCwgMCwgMTAsIDEwKS5hdHRyKHtmaWxsOiBTbmFwLmZsYXQuY2Fycm90LCBzdHJva2U6IFNuYXAuZmxhdC53ZXRhc3BoYWx0fSk7XG4gICAgICMgRm9yIGNvbG91ciByZWZlcmVuY2U6IDxhIGhyZWY9XCJodHRwczovL3d3dy5tYXRlcmlhbHVpLmNvXCI+aHR0cHM6Ly93d3cubWF0ZXJpYWx1aS5jbzwvYT4uXG4gICAgXFwqL1xuXG4gICAgU25hcC5mbGF0ID0ge307XG5cbiAgICBmdW5jdGlvbiBzYXZlQ29sb3IoY29sb3JzKSB7XG4gICAgICBjb2xvcnMgPSBjb2xvcnMuc3BsaXQoLyg/PSMpLyk7XG4gICAgICB2YXIgY29sb3IgPSBuZXcgU3RyaW5nKGNvbG9yc1s1XSk7XG4gICAgICBjb2xvcls1MF0gPSBjb2xvcnNbMF07XG4gICAgICBjb2xvclsxMDBdID0gY29sb3JzWzFdO1xuICAgICAgY29sb3JbMjAwXSA9IGNvbG9yc1syXTtcbiAgICAgIGNvbG9yWzMwMF0gPSBjb2xvcnNbM107XG4gICAgICBjb2xvcls0MDBdID0gY29sb3JzWzRdO1xuICAgICAgY29sb3JbNTAwXSA9IGNvbG9yc1s1XTtcbiAgICAgIGNvbG9yWzYwMF0gPSBjb2xvcnNbNl07XG4gICAgICBjb2xvcls3MDBdID0gY29sb3JzWzddO1xuICAgICAgY29sb3JbODAwXSA9IGNvbG9yc1s4XTtcbiAgICAgIGNvbG9yWzkwMF0gPSBjb2xvcnNbOV07XG5cbiAgICAgIGlmIChjb2xvcnNbMTBdKSB7XG4gICAgICAgIGNvbG9yLkExMDAgPSBjb2xvcnNbMTBdO1xuICAgICAgICBjb2xvci5BMjAwID0gY29sb3JzWzExXTtcbiAgICAgICAgY29sb3IuQTQwMCA9IGNvbG9yc1sxMl07XG4gICAgICAgIGNvbG9yLkE3MDAgPSBjb2xvcnNbMTNdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29sb3I7XG4gICAgfVxuXG4gICAgU25hcC5tdWkucmVkID0gc2F2ZUNvbG9yKHJlZCk7XG4gICAgU25hcC5tdWkucGluayA9IHNhdmVDb2xvcihwaW5rKTtcbiAgICBTbmFwLm11aS5wdXJwbGUgPSBzYXZlQ29sb3IocHVycGxlKTtcbiAgICBTbmFwLm11aS5kZWVwcHVycGxlID0gc2F2ZUNvbG9yKGRlZXBwdXJwbGUpO1xuICAgIFNuYXAubXVpLmluZGlnbyA9IHNhdmVDb2xvcihpbmRpZ28pO1xuICAgIFNuYXAubXVpLmJsdWUgPSBzYXZlQ29sb3IoYmx1ZSk7XG4gICAgU25hcC5tdWkubGlnaHRibHVlID0gc2F2ZUNvbG9yKGxpZ2h0Ymx1ZSk7XG4gICAgU25hcC5tdWkuY3lhbiA9IHNhdmVDb2xvcihjeWFuKTtcbiAgICBTbmFwLm11aS50ZWFsID0gc2F2ZUNvbG9yKHRlYWwpO1xuICAgIFNuYXAubXVpLmdyZWVuID0gc2F2ZUNvbG9yKGdyZWVuKTtcbiAgICBTbmFwLm11aS5saWdodGdyZWVuID0gc2F2ZUNvbG9yKGxpZ2h0Z3JlZW4pO1xuICAgIFNuYXAubXVpLmxpbWUgPSBzYXZlQ29sb3IobGltZSk7XG4gICAgU25hcC5tdWkueWVsbG93ID0gc2F2ZUNvbG9yKHllbGxvdyk7XG4gICAgU25hcC5tdWkuYW1iZXIgPSBzYXZlQ29sb3IoYW1iZXIpO1xuICAgIFNuYXAubXVpLm9yYW5nZSA9IHNhdmVDb2xvcihvcmFuZ2UpO1xuICAgIFNuYXAubXVpLmRlZXBvcmFuZ2UgPSBzYXZlQ29sb3IoZGVlcG9yYW5nZSk7XG4gICAgU25hcC5tdWkuYnJvd24gPSBzYXZlQ29sb3IoYnJvd24pO1xuICAgIFNuYXAubXVpLmdyZXkgPSBzYXZlQ29sb3IoZ3JleSk7XG4gICAgU25hcC5tdWkuYmx1ZWdyZXkgPSBzYXZlQ29sb3IoYmx1ZWdyZXkpO1xuICAgIFNuYXAuZmxhdC50dXJxdW9pc2UgPSBcIiMxYWJjOWNcIjtcbiAgICBTbmFwLmZsYXQuZ3JlZW5zZWEgPSBcIiMxNmEwODVcIjtcbiAgICBTbmFwLmZsYXQuc3VuZmxvd2VyID0gXCIjZjFjNDBmXCI7XG4gICAgU25hcC5mbGF0Lm9yYW5nZSA9IFwiI2YzOWMxMlwiO1xuICAgIFNuYXAuZmxhdC5lbWVybGFuZCA9IFwiIzJlY2M3MVwiO1xuICAgIFNuYXAuZmxhdC5uZXBocml0aXMgPSBcIiMyN2FlNjBcIjtcbiAgICBTbmFwLmZsYXQuY2Fycm90ID0gXCIjZTY3ZTIyXCI7XG4gICAgU25hcC5mbGF0LnB1bXBraW4gPSBcIiNkMzU0MDBcIjtcbiAgICBTbmFwLmZsYXQucGV0ZXJyaXZlciA9IFwiIzM0OThkYlwiO1xuICAgIFNuYXAuZmxhdC5iZWxpemVob2xlID0gXCIjMjk4MGI5XCI7XG4gICAgU25hcC5mbGF0LmFsaXphcmluID0gXCIjZTc0YzNjXCI7XG4gICAgU25hcC5mbGF0LnBvbWVncmFuYXRlID0gXCIjYzAzOTJiXCI7XG4gICAgU25hcC5mbGF0LmFtZXRoeXN0ID0gXCIjOWI1OWI2XCI7XG4gICAgU25hcC5mbGF0Lndpc3RlcmlhID0gXCIjOGU0NGFkXCI7XG4gICAgU25hcC5mbGF0LmNsb3VkcyA9IFwiI2VjZjBmMVwiO1xuICAgIFNuYXAuZmxhdC5zaWx2ZXIgPSBcIiNiZGMzYzdcIjtcbiAgICBTbmFwLmZsYXQud2V0YXNwaGFsdCA9IFwiIzM0NDk1ZVwiO1xuICAgIFNuYXAuZmxhdC5taWRuaWdodGJsdWUgPSBcIiMyYzNlNTBcIjtcbiAgICBTbmFwLmZsYXQuY29uY3JldGUgPSBcIiM5NWE1YTZcIjtcbiAgICBTbmFwLmZsYXQuYXNiZXN0b3MgPSBcIiM3ZjhjOGRcIjtcbiAgICAvKlxcXG4gICAgICogU25hcC5pbXBvcnRNVUlDb2xvcnNcbiAgICAgWyBtZXRob2QgXVxuICAgICAqKlxuICAgICAqIEltcG9ydHMgTWF0ZXJpYWwgVUkgY29sb3VycyBpbnRvIGdsb2JhbCBvYmplY3QuXG4gICAgIHwgU25hcC5pbXBvcnRNVUlDb2xvcnMoKTtcbiAgICAgfCBTbmFwKCkucmVjdCgwLCAwLCAxMCwgMTApLmF0dHIoe2ZpbGw6IGRlZXBwdXJwbGUsIHN0cm9rZTogYW1iZXJbNjAwXX0pO1xuICAgICAjIEZvciBjb2xvdXIgcmVmZXJlbmNlOiA8YSBocmVmPVwiaHR0cHM6Ly93d3cubWF0ZXJpYWx1aS5jb1wiPmh0dHBzOi8vd3d3Lm1hdGVyaWFsdWkuY288L2E+LlxuICAgIFxcKi9cblxuICAgIFNuYXAuaW1wb3J0TVVJQ29sb3JzID0gZnVuY3Rpb24gKCkge1xuICAgICAgZm9yICh2YXIgY29sb3IgaW4gU25hcC5tdWkpIHtcbiAgICAgICAgaWYgKFNuYXAubXVpLmhhc093blByb3BlcnR5KGNvbG9yKSkge1xuICAgICAgICAgIHdpbmRvd1tjb2xvcl0gPSBTbmFwLm11aVtjb2xvcl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9KTtcbiAgcmV0dXJuIFNuYXA7XG59KTsiXSwiZmlsZSI6InNuYXAuc3ZnLmpzIn0=
