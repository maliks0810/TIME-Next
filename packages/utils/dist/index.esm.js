import * as ar from "react";
import { useCallback as vr } from "react";
const wr = (r) => ((typeof r != "number" || isNaN(r)) && console.error("Invalid Input"), r / 1e6);
var Y = { exports: {} }, D = { exports: {} }, J;
function ur() {
  return J || (J = 1, (function(r) {
    function n(a, e) {
      this.v = a, this.k = e;
    }
    r.exports = n, r.exports.__esModule = !0, r.exports.default = r.exports;
  })(D)), D.exports;
}
var E = { exports: {} }, C = { exports: {} }, L;
function ir() {
  return L || (L = 1, (function(r) {
    function n(a, e, t, s) {
      var u = Object.defineProperty;
      try {
        u({}, "", {});
      } catch {
        u = 0;
      }
      r.exports = n = function(x, y, g, v) {
        function f(O, c) {
          n(x, O, function(M) {
            return this._invoke(O, c, M);
          });
        }
        y ? u ? u(x, y, {
          value: g,
          enumerable: !v,
          configurable: !v,
          writable: !v
        }) : x[y] = g : (f("next", 0), f("throw", 1), f("return", 2));
      }, r.exports.__esModule = !0, r.exports.default = r.exports, n(a, e, t, s);
    }
    r.exports = n, r.exports.__esModule = !0, r.exports.default = r.exports;
  })(C)), C.exports;
}
var Q;
function sr() {
  return Q || (Q = 1, (function(r) {
    var n = ir();
    function a() {
      /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
      var e, t, s = typeof Symbol == "function" ? Symbol : {}, u = s.iterator || "@@iterator", l = s.toStringTag || "@@toStringTag";
      function x(o, h, i, w) {
        var _ = h && h.prototype instanceof g ? h : g, k = Object.create(_.prototype);
        return n(k, "_invoke", (function(T, pr, xr) {
          var S, p, b, I = 0, H = xr || [], j = !1, q = {
            p: 0,
            n: 0,
            v: e,
            a: N,
            f: N.bind(e, 4),
            d: function(R, G) {
              return S = R, p = 0, b = e, q.n = G, y;
            }
          };
          function N(A, R) {
            for (p = A, b = R, t = 0; !j && I && !G && t < H.length; t++) {
              var G, d = H[t], P = q.p, F = d[2];
              A > 3 ? (G = F === R) && (b = d[(p = d[4]) ? 5 : (p = 3, 3)], d[4] = d[5] = e) : d[0] <= P && ((G = A < 2 && P < d[1]) ? (p = 0, q.v = R, q.n = d[1]) : P < F && (G = A < 3 || d[0] > R || R > F) && (d[4] = A, d[5] = R, q.n = F, p = 0));
            }
            if (G || A > 1) return y;
            throw j = !0, R;
          }
          return function(A, R, G) {
            if (I > 1) throw TypeError("Generator is already running");
            for (j && R === 1 && N(R, G), p = R, b = G; (t = p < 2 ? e : b) || !j; ) {
              S || (p ? p < 3 ? (p > 1 && (q.n = -1), N(p, b)) : q.n = b : q.v = b);
              try {
                if (I = 2, S) {
                  if (p || (A = "next"), t = S[A]) {
                    if (!(t = t.call(S, b))) throw TypeError("iterator result is not an object");
                    if (!t.done) return t;
                    b = t.value, p < 2 && (p = 0);
                  } else p === 1 && (t = S.return) && t.call(S), p < 2 && (b = TypeError("The iterator does not provide a '" + A + "' method"), p = 1);
                  S = e;
                } else if ((t = (j = q.n < 0) ? b : T.call(pr, q)) !== y) break;
              } catch (d) {
                S = e, p = 1, b = d;
              } finally {
                I = 1;
              }
            }
            return {
              value: t,
              done: j
            };
          };
        })(o, i, w), !0), k;
      }
      var y = {};
      function g() {
      }
      function v() {
      }
      function f() {
      }
      t = Object.getPrototypeOf;
      var O = [][u] ? t(t([][u]())) : (n(t = {}, u, function() {
        return this;
      }), t), c = f.prototype = g.prototype = Object.create(O);
      function M(o) {
        return Object.setPrototypeOf ? Object.setPrototypeOf(o, f) : (o.__proto__ = f, n(o, l, "GeneratorFunction")), o.prototype = Object.create(c), o;
      }
      return v.prototype = f, n(c, "constructor", f), n(f, "constructor", v), v.displayName = "GeneratorFunction", n(f, l, "GeneratorFunction"), n(c), n(c, l, "Generator"), n(c, u, function() {
        return this;
      }), n(c, "toString", function() {
        return "[object Generator]";
      }), (r.exports = a = function() {
        return {
          w: x,
          m: M
        };
      }, r.exports.__esModule = !0, r.exports.default = r.exports)();
    }
    r.exports = a, r.exports.__esModule = !0, r.exports.default = r.exports;
  })(E)), E.exports;
}
var K = { exports: {} }, V = { exports: {} }, $ = { exports: {} }, X;
function cr() {
  return X || (X = 1, (function(r) {
    var n = ur(), a = ir();
    function e(t, s) {
      function u(x, y, g, v) {
        try {
          var f = t[x](y), O = f.value;
          return O instanceof n ? s.resolve(O.v).then(function(c) {
            u("next", c, g, v);
          }, function(c) {
            u("throw", c, g, v);
          }) : s.resolve(O).then(function(c) {
            f.value = c, g(f);
          }, function(c) {
            return u("throw", c, g, v);
          });
        } catch (c) {
          v(c);
        }
      }
      var l;
      this.next || (a(e.prototype), a(e.prototype, typeof Symbol == "function" && Symbol.asyncIterator || "@asyncIterator", function() {
        return this;
      })), a(this, "_invoke", function(x, y, g) {
        function v() {
          return new s(function(f, O) {
            u(x, g, f, O);
          });
        }
        return l = l ? l.then(v, v) : v();
      }, !0);
    }
    r.exports = e, r.exports.__esModule = !0, r.exports.default = r.exports;
  })($)), $.exports;
}
var Z;
function fr() {
  return Z || (Z = 1, (function(r) {
    var n = sr(), a = cr();
    function e(t, s, u, l, x) {
      return new a(n().w(t, s, u, l), x || Promise);
    }
    r.exports = e, r.exports.__esModule = !0, r.exports.default = r.exports;
  })(V)), V.exports;
}
var m;
function yr() {
  return m || (m = 1, (function(r) {
    var n = fr();
    function a(e, t, s, u, l) {
      var x = n(e, t, s, u, l);
      return x.next().then(function(y) {
        return y.done ? y.value : x.next();
      });
    }
    r.exports = a, r.exports.__esModule = !0, r.exports.default = r.exports;
  })(K)), K.exports;
}
var B = { exports: {} }, rr;
function lr() {
  return rr || (rr = 1, (function(r) {
    function n(a) {
      var e = Object(a), t = [];
      for (var s in e) t.unshift(s);
      return function u() {
        for (; t.length; ) if ((s = t.pop()) in e) return u.value = s, u.done = !1, u;
        return u.done = !0, u;
      };
    }
    r.exports = n, r.exports.__esModule = !0, r.exports.default = r.exports;
  })(B)), B.exports;
}
var U = { exports: {} }, W = { exports: {} }, er;
function gr() {
  return er || (er = 1, (function(r) {
    function n(a) {
      "@babel/helpers - typeof";
      return r.exports = n = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
        return typeof e;
      } : function(e) {
        return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
      }, r.exports.__esModule = !0, r.exports.default = r.exports, n(a);
    }
    r.exports = n, r.exports.__esModule = !0, r.exports.default = r.exports;
  })(W)), W.exports;
}
var tr;
function hr() {
  return tr || (tr = 1, (function(r) {
    var n = gr().default;
    function a(e) {
      if (e != null) {
        var t = e[typeof Symbol == "function" && Symbol.iterator || "@@iterator"], s = 0;
        if (t) return t.call(e);
        if (typeof e.next == "function") return e;
        if (!isNaN(e.length)) return {
          next: function() {
            return e && s >= e.length && (e = void 0), {
              value: e && e[s++],
              done: !e
            };
          }
        };
      }
      throw new TypeError(n(e) + " is not iterable");
    }
    r.exports = a, r.exports.__esModule = !0, r.exports.default = r.exports;
  })(U)), U.exports;
}
var nr;
function _r() {
  return nr || (nr = 1, (function(r) {
    var n = ur(), a = sr(), e = yr(), t = fr(), s = cr(), u = lr(), l = hr();
    function x() {
      var y = a(), g = y.m(x), v = (Object.getPrototypeOf ? Object.getPrototypeOf(g) : g.__proto__).constructor;
      function f(M) {
        var o = typeof M == "function" && M.constructor;
        return !!o && (o === v || (o.displayName || o.name) === "GeneratorFunction");
      }
      var O = {
        throw: 1,
        return: 2,
        break: 3,
        continue: 3
      };
      function c(M) {
        var o, h;
        return function(i) {
          o || (o = {
            stop: function() {
              return h(i.a, 2);
            },
            catch: function() {
              return i.v;
            },
            abrupt: function(_, k) {
              return h(i.a, O[_], k);
            },
            delegateYield: function(_, k, T) {
              return o.resultName = k, h(i.d, l(_), T);
            },
            finish: function(_) {
              return h(i.f, _);
            }
          }, h = function(_, k, T) {
            i.p = o.prev, i.n = o.next;
            try {
              return _(k, T);
            } finally {
              o.next = i.n;
            }
          }), o.resultName && (o[o.resultName] = i.v, o.resultName = void 0), o.sent = i.v, o.next = i.n;
          try {
            return M.call(this, o);
          } finally {
            i.p = o.prev, i.n = o.next;
          }
        };
      }
      return (r.exports = x = function() {
        return {
          wrap: function(h, i, w, _) {
            return y.w(c(h), i, w, _ && _.reverse());
          },
          isGeneratorFunction: f,
          mark: y.m,
          awrap: function(h, i) {
            return new n(h, i);
          },
          AsyncIterator: s,
          async: function(h, i, w, _, k) {
            return (f(i) ? t : e)(c(h), i, w, _, k);
          },
          keys: u,
          values: l
        };
      }, r.exports.__esModule = !0, r.exports.default = r.exports)();
    }
    r.exports = x, r.exports.__esModule = !0, r.exports.default = r.exports;
  })(Y)), Y.exports;
}
var z, or;
function br() {
  if (or) return z;
  or = 1;
  var r = _r()();
  z = r;
  try {
    regeneratorRuntime = r;
  } catch {
    typeof globalThis == "object" ? globalThis.regeneratorRuntime = r : Function("r", "regeneratorRuntime = r")(r);
  }
  return z;
}
br();
/*!
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
var Rr = /* @__PURE__ */ ar.createContext(null), dr = function() {
  return ar.useContext(Rr);
};
function Ar() {
  const r = dr();
  return vr(async (n) => {
    if (!r?.oktaAuth)
      throw new Error("Context for OktaAuth is not set or is unavailable.");
    const a = await r?.oktaAuth?.getOrRenewAccessToken();
    if (!a)
      throw new Error("Unable to retrieve Okta Access Token.");
    return a.startsWith("Bearer ") || n ? a : "Bearer " + a;
  }, [r?.oktaAuth]);
}
export {
  wr as convertToMillions,
  Ar as useBearerToken
};
