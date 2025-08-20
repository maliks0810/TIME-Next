var pi = Object.defineProperty;
var mi = (e, t, n) => t in e ? pi(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var $t = (e, t, n) => mi(e, typeof t != "symbol" ? t + "" : t, n);
import * as N from "react";
import tt, { forwardRef as hi, useContext as gi, useState as Ut, useEffect as yi } from "react";
import * as bi from "react-dom";
import It from "react-dom";
function vi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Mt = { exports: {} }, dt = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var ur;
function Ei() {
  if (ur) return dt;
  ur = 1;
  var e = Symbol.for("react.transitional.element"), t = Symbol.for("react.fragment");
  function n(r, o, i) {
    var s = null;
    if (i !== void 0 && (s = "" + i), o.key !== void 0 && (s = "" + o.key), "key" in o) {
      i = {};
      for (var a in o)
        a !== "key" && (i[a] = o[a]);
    } else i = o;
    return o = i.ref, {
      $$typeof: e,
      type: r,
      key: s,
      ref: o !== void 0 ? o : null,
      props: i
    };
  }
  return dt.Fragment = t, dt.jsx = n, dt.jsxs = n, dt;
}
var pt = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var fr;
function Ti() {
  return fr || (fr = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(p) {
      if (p == null) return null;
      if (typeof p == "function")
        return p.$$typeof === J ? null : p.displayName || p.name || null;
      if (typeof p == "string") return p;
      switch (p) {
        case f:
          return "Fragment";
        case w:
          return "Profiler";
        case y:
          return "StrictMode";
        case E:
          return "Suspense";
        case O:
          return "SuspenseList";
        case W:
          return "Activity";
      }
      if (typeof p == "object")
        switch (typeof p.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), p.$$typeof) {
          case g:
            return "Portal";
          case S:
            return (p.displayName || "Context") + ".Provider";
          case P:
            return (p._context.displayName || "Context") + ".Consumer";
          case T:
            var R = p.render;
            return p = p.displayName, p || (p = R.displayName || R.name || "", p = p !== "" ? "ForwardRef(" + p + ")" : "ForwardRef"), p;
          case _:
            return R = p.displayName || null, R !== null ? R : e(p.type) || "Memo";
          case j:
            R = p._payload, p = p._init;
            try {
              return e(p(R));
            } catch {
            }
        }
      return null;
    }
    function t(p) {
      return "" + p;
    }
    function n(p) {
      try {
        t(p);
        var R = !1;
      } catch {
        R = !0;
      }
      if (R) {
        R = console;
        var D = R.error, L = typeof Symbol == "function" && Symbol.toStringTag && p[Symbol.toStringTag] || p.constructor.name || "Object";
        return D.call(
          R,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          L
        ), t(p);
      }
    }
    function r(p) {
      if (p === f) return "<>";
      if (typeof p == "object" && p !== null && p.$$typeof === j)
        return "<...>";
      try {
        var R = e(p);
        return R ? "<" + R + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function o() {
      var p = V.A;
      return p === null ? null : p.getOwner();
    }
    function i() {
      return Error("react-stack-top-frame");
    }
    function s(p) {
      if (l.call(p, "key")) {
        var R = Object.getOwnPropertyDescriptor(p, "key").get;
        if (R && R.isReactWarning) return !1;
      }
      return p.key !== void 0;
    }
    function a(p, R) {
      function D() {
        k || (k = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          R
        ));
      }
      D.isReactWarning = !0, Object.defineProperty(p, "key", {
        get: D,
        configurable: !0
      });
    }
    function u() {
      var p = e(this.type);
      return A[p] || (A[p] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), p = this.props.ref, p !== void 0 ? p : null;
    }
    function d(p, R, D, L, F, Y, H, G) {
      return D = Y.ref, p = {
        $$typeof: b,
        type: p,
        key: R,
        props: Y,
        _owner: F
      }, (D !== void 0 ? D : null) !== null ? Object.defineProperty(p, "ref", {
        enumerable: !1,
        get: u
      }) : Object.defineProperty(p, "ref", { enumerable: !1, value: null }), p._store = {}, Object.defineProperty(p._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(p, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(p, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: H
      }), Object.defineProperty(p, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: G
      }), Object.freeze && (Object.freeze(p.props), Object.freeze(p)), p;
    }
    function m(p, R, D, L, F, Y, H, G) {
      var U = R.children;
      if (U !== void 0)
        if (L)
          if (I(U)) {
            for (L = 0; L < U.length; L++)
              h(U[L]);
            Object.freeze && Object.freeze(U);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else h(U);
      if (l.call(R, "key")) {
        U = e(p);
        var X = Object.keys(R).filter(function(K) {
          return K !== "key";
        });
        L = 0 < X.length ? "{key: someKey, " + X.join(": ..., ") + ": ...}" : "{key: someKey}", q[U + L] || (X = 0 < X.length ? "{" + X.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          L,
          U,
          X,
          U
        ), q[U + L] = !0);
      }
      if (U = null, D !== void 0 && (n(D), U = "" + D), s(R) && (n(R.key), U = "" + R.key), "key" in R) {
        D = {};
        for (var M in R)
          M !== "key" && (D[M] = R[M]);
      } else D = R;
      return U && a(
        D,
        typeof p == "function" ? p.displayName || p.name || "Unknown" : p
      ), d(
        p,
        U,
        Y,
        F,
        o(),
        D,
        H,
        G
      );
    }
    function h(p) {
      typeof p == "object" && p !== null && p.$$typeof === b && p._store && (p._store.validated = 1);
    }
    var v = tt, b = Symbol.for("react.transitional.element"), g = Symbol.for("react.portal"), f = Symbol.for("react.fragment"), y = Symbol.for("react.strict_mode"), w = Symbol.for("react.profiler"), P = Symbol.for("react.consumer"), S = Symbol.for("react.context"), T = Symbol.for("react.forward_ref"), E = Symbol.for("react.suspense"), O = Symbol.for("react.suspense_list"), _ = Symbol.for("react.memo"), j = Symbol.for("react.lazy"), W = Symbol.for("react.activity"), J = Symbol.for("react.client.reference"), V = v.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, l = Object.prototype.hasOwnProperty, I = Array.isArray, C = console.createTask ? console.createTask : function() {
      return null;
    };
    v = {
      react_stack_bottom_frame: function(p) {
        return p();
      }
    };
    var k, A = {}, z = v.react_stack_bottom_frame.bind(
      v,
      i
    )(), Q = C(r(i)), q = {};
    pt.Fragment = f, pt.jsx = function(p, R, D, L, F) {
      var Y = 1e4 > V.recentlyCreatedOwnerStacks++;
      return m(
        p,
        R,
        D,
        !1,
        L,
        F,
        Y ? Error("react-stack-top-frame") : z,
        Y ? C(r(p)) : Q
      );
    }, pt.jsxs = function(p, R, D, L, F) {
      var Y = 1e4 > V.recentlyCreatedOwnerStacks++;
      return m(
        p,
        R,
        D,
        !0,
        L,
        F,
        Y ? Error("react-stack-top-frame") : z,
        Y ? C(r(p)) : Q
      );
    };
  })()), pt;
}
var dr;
function xi() {
  return dr || (dr = 1, process.env.NODE_ENV === "production" ? Mt.exports = Ei() : Mt.exports = Ti()), Mt.exports;
}
var B = xi();
const St = {
  black: "#000",
  white: "#fff"
}, qe = {
  300: "#e57373",
  400: "#ef5350",
  500: "#f44336",
  700: "#d32f2f",
  800: "#c62828"
}, Ge = {
  50: "#f3e5f5",
  200: "#ce93d8",
  300: "#ba68c8",
  400: "#ab47bc",
  500: "#9c27b0",
  700: "#7b1fa2"
}, Ke = {
  50: "#e3f2fd",
  200: "#90caf9",
  400: "#42a5f5",
  700: "#1976d2",
  800: "#1565c0"
}, Xe = {
  300: "#4fc3f7",
  400: "#29b6f6",
  500: "#03a9f4",
  700: "#0288d1",
  900: "#01579b"
}, Je = {
  300: "#81c784",
  400: "#66bb6a",
  500: "#4caf50",
  700: "#388e3c",
  800: "#2e7d32",
  900: "#1b5e20"
}, mt = {
  300: "#ffb74d",
  400: "#ffa726",
  500: "#ff9800",
  700: "#f57c00",
  900: "#e65100"
}, Si = {
  50: "#fafafa",
  100: "#f5f5f5",
  200: "#eeeeee",
  300: "#e0e0e0",
  400: "#bdbdbd",
  500: "#9e9e9e",
  600: "#757575",
  700: "#616161",
  800: "#424242",
  900: "#212121",
  A100: "#f5f5f5",
  A200: "#eeeeee",
  A400: "#bdbdbd",
  A700: "#616161"
};
function De(e, ...t) {
  const n = new URL(`https://mui.com/production-error/?code=${e}`);
  return t.forEach((r) => n.searchParams.append("args[]", r)), `Minified MUI error #${e}; visit ${n} for the full message.`;
}
const uo = "$$material";
function In() {
  return In = Object.assign ? Object.assign.bind() : function(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = arguments[t];
      for (var r in n) ({}).hasOwnProperty.call(n, r) && (e[r] = n[r]);
    }
    return e;
  }, In.apply(null, arguments);
}
function wi(e) {
  if (e.sheet)
    return e.sheet;
  for (var t = 0; t < document.styleSheets.length; t++)
    if (document.styleSheets[t].ownerNode === e)
      return document.styleSheets[t];
}
function Ci(e) {
  var t = document.createElement("style");
  return t.setAttribute("data-emotion", e.key), e.nonce !== void 0 && t.setAttribute("nonce", e.nonce), t.appendChild(document.createTextNode("")), t.setAttribute("data-s", ""), t;
}
var Ri = /* @__PURE__ */ (function() {
  function e(n) {
    var r = this;
    this._insertTag = function(o) {
      var i;
      r.tags.length === 0 ? r.insertionPoint ? i = r.insertionPoint.nextSibling : r.prepend ? i = r.container.firstChild : i = r.before : i = r.tags[r.tags.length - 1].nextSibling, r.container.insertBefore(o, i), r.tags.push(o);
    }, this.isSpeedy = n.speedy === void 0 ? !0 : n.speedy, this.tags = [], this.ctr = 0, this.nonce = n.nonce, this.key = n.key, this.container = n.container, this.prepend = n.prepend, this.insertionPoint = n.insertionPoint, this.before = null;
  }
  var t = e.prototype;
  return t.hydrate = function(r) {
    r.forEach(this._insertTag);
  }, t.insert = function(r) {
    this.ctr % (this.isSpeedy ? 65e3 : 1) === 0 && this._insertTag(Ci(this));
    var o = this.tags[this.tags.length - 1];
    if (this.isSpeedy) {
      var i = wi(o);
      try {
        i.insertRule(r, i.cssRules.length);
      } catch {
      }
    } else
      o.appendChild(document.createTextNode(r));
    this.ctr++;
  }, t.flush = function() {
    this.tags.forEach(function(r) {
      var o;
      return (o = r.parentNode) == null ? void 0 : o.removeChild(r);
    }), this.tags = [], this.ctr = 0;
  }, e;
})(), me = "-ms-", qt = "-moz-", Z = "-webkit-", fo = "comm", qn = "rule", Gn = "decl", Oi = "@import", po = "@keyframes", ki = "@layer", Pi = Math.abs, tn = String.fromCharCode, _i = Object.assign;
function Ai(e, t) {
  return pe(e, 0) ^ 45 ? (((t << 2 ^ pe(e, 0)) << 2 ^ pe(e, 1)) << 2 ^ pe(e, 2)) << 2 ^ pe(e, 3) : 0;
}
function mo(e) {
  return e.trim();
}
function Ni(e, t) {
  return (e = t.exec(e)) ? e[0] : e;
}
function ee(e, t, n) {
  return e.replace(t, n);
}
function Mn(e, t) {
  return e.indexOf(t);
}
function pe(e, t) {
  return e.charCodeAt(t) | 0;
}
function wt(e, t, n) {
  return e.slice(t, n);
}
function Ce(e) {
  return e.length;
}
function Kn(e) {
  return e.length;
}
function Dt(e, t) {
  return t.push(e), e;
}
function $i(e, t) {
  return e.map(t).join("");
}
var nn = 1, ot = 1, ho = 0, he = 0, de = 0, at = "";
function rn(e, t, n, r, o, i, s) {
  return { value: e, root: t, parent: n, type: r, props: o, children: i, line: nn, column: ot, length: s, return: "" };
}
function ht(e, t) {
  return _i(rn("", null, null, "", null, null, 0), e, { length: -e.length }, t);
}
function Ii() {
  return de;
}
function Mi() {
  return de = he > 0 ? pe(at, --he) : 0, ot--, de === 10 && (ot = 1, nn--), de;
}
function ye() {
  return de = he < ho ? pe(at, he++) : 0, ot++, de === 10 && (ot = 1, nn++), de;
}
function Oe() {
  return pe(at, he);
}
function Wt() {
  return he;
}
function kt(e, t) {
  return wt(at, e, t);
}
function Ct(e) {
  switch (e) {
    // \0 \t \n \r \s whitespace token
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    // ! + , / > @ ~ isolate token
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    // ; { } breakpoint token
    case 59:
    case 123:
    case 125:
      return 4;
    // : accompanied token
    case 58:
      return 3;
    // " ' ( [ opening delimit token
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    // ) ] closing delimit token
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function go(e) {
  return nn = ot = 1, ho = Ce(at = e), he = 0, [];
}
function yo(e) {
  return at = "", e;
}
function zt(e) {
  return mo(kt(he - 1, Dn(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function Di(e) {
  for (; (de = Oe()) && de < 33; )
    ye();
  return Ct(e) > 2 || Ct(de) > 3 ? "" : " ";
}
function ji(e, t) {
  for (; --t && ye() && !(de < 48 || de > 102 || de > 57 && de < 65 || de > 70 && de < 97); )
    ;
  return kt(e, Wt() + (t < 6 && Oe() == 32 && ye() == 32));
}
function Dn(e) {
  for (; ye(); )
    switch (de) {
      // ] ) " '
      case e:
        return he;
      // " '
      case 34:
      case 39:
        e !== 34 && e !== 39 && Dn(de);
        break;
      // (
      case 40:
        e === 41 && Dn(e);
        break;
      // \
      case 92:
        ye();
        break;
    }
  return he;
}
function Li(e, t) {
  for (; ye() && e + de !== 57; )
    if (e + de === 84 && Oe() === 47)
      break;
  return "/*" + kt(t, he - 1) + "*" + tn(e === 47 ? e : ye());
}
function Fi(e) {
  for (; !Ct(Oe()); )
    ye();
  return kt(e, he);
}
function Bi(e) {
  return yo(Yt("", null, null, null, [""], e = go(e), 0, [0], e));
}
function Yt(e, t, n, r, o, i, s, a, u) {
  for (var d = 0, m = 0, h = s, v = 0, b = 0, g = 0, f = 1, y = 1, w = 1, P = 0, S = "", T = o, E = i, O = r, _ = S; y; )
    switch (g = P, P = ye()) {
      // (
      case 40:
        if (g != 108 && pe(_, h - 1) == 58) {
          Mn(_ += ee(zt(P), "&", "&\f"), "&\f") != -1 && (w = -1);
          break;
        }
      // " ' [
      case 34:
      case 39:
      case 91:
        _ += zt(P);
        break;
      // \t \n \r \s
      case 9:
      case 10:
      case 13:
      case 32:
        _ += Di(g);
        break;
      // \
      case 92:
        _ += ji(Wt() - 1, 7);
        continue;
      // /
      case 47:
        switch (Oe()) {
          case 42:
          case 47:
            Dt(Vi(Li(ye(), Wt()), t, n), u);
            break;
          default:
            _ += "/";
        }
        break;
      // {
      case 123 * f:
        a[d++] = Ce(_) * w;
      // } ; \0
      case 125 * f:
      case 59:
      case 0:
        switch (P) {
          // \0 }
          case 0:
          case 125:
            y = 0;
          // ;
          case 59 + m:
            w == -1 && (_ = ee(_, /\f/g, "")), b > 0 && Ce(_) - h && Dt(b > 32 ? mr(_ + ";", r, n, h - 1) : mr(ee(_, " ", "") + ";", r, n, h - 2), u);
            break;
          // @ ;
          case 59:
            _ += ";";
          // { rule/at-rule
          default:
            if (Dt(O = pr(_, t, n, d, m, o, a, S, T = [], E = [], h), i), P === 123)
              if (m === 0)
                Yt(_, t, O, O, T, i, h, a, E);
              else
                switch (v === 99 && pe(_, 3) === 110 ? 100 : v) {
                  // d l m s
                  case 100:
                  case 108:
                  case 109:
                  case 115:
                    Yt(e, O, O, r && Dt(pr(e, O, O, 0, 0, o, a, S, o, T = [], h), E), o, E, h, a, r ? T : E);
                    break;
                  default:
                    Yt(_, O, O, O, [""], E, 0, a, E);
                }
        }
        d = m = b = 0, f = w = 1, S = _ = "", h = s;
        break;
      // :
      case 58:
        h = 1 + Ce(_), b = g;
      default:
        if (f < 1) {
          if (P == 123)
            --f;
          else if (P == 125 && f++ == 0 && Mi() == 125)
            continue;
        }
        switch (_ += tn(P), P * f) {
          // &
          case 38:
            w = m > 0 ? 1 : (_ += "\f", -1);
            break;
          // ,
          case 44:
            a[d++] = (Ce(_) - 1) * w, w = 1;
            break;
          // @
          case 64:
            Oe() === 45 && (_ += zt(ye())), v = Oe(), m = h = Ce(S = _ += Fi(Wt())), P++;
            break;
          // -
          case 45:
            g === 45 && Ce(_) == 2 && (f = 0);
        }
    }
  return i;
}
function pr(e, t, n, r, o, i, s, a, u, d, m) {
  for (var h = o - 1, v = o === 0 ? i : [""], b = Kn(v), g = 0, f = 0, y = 0; g < r; ++g)
    for (var w = 0, P = wt(e, h + 1, h = Pi(f = s[g])), S = e; w < b; ++w)
      (S = mo(f > 0 ? v[w] + " " + P : ee(P, /&\f/g, v[w]))) && (u[y++] = S);
  return rn(e, t, n, o === 0 ? qn : a, u, d, m);
}
function Vi(e, t, n) {
  return rn(e, t, n, fo, tn(Ii()), wt(e, 2, -2), 0);
}
function mr(e, t, n, r) {
  return rn(e, t, n, Gn, wt(e, 0, r), wt(e, r + 1, -1), r);
}
function nt(e, t) {
  for (var n = "", r = Kn(e), o = 0; o < r; o++)
    n += t(e[o], o, e, t) || "";
  return n;
}
function Ui(e, t, n, r) {
  switch (e.type) {
    case ki:
      if (e.children.length) break;
    case Oi:
    case Gn:
      return e.return = e.return || e.value;
    case fo:
      return "";
    case po:
      return e.return = e.value + "{" + nt(e.children, r) + "}";
    case qn:
      e.value = e.props.join(",");
  }
  return Ce(n = nt(e.children, r)) ? e.return = e.value + "{" + n + "}" : "";
}
function Wi(e) {
  var t = Kn(e);
  return function(n, r, o, i) {
    for (var s = "", a = 0; a < t; a++)
      s += e[a](n, r, o, i) || "";
    return s;
  };
}
function zi(e) {
  return function(t) {
    t.root || (t = t.return) && e(t);
  };
}
function bo(e) {
  var t = /* @__PURE__ */ Object.create(null);
  return function(n) {
    return t[n] === void 0 && (t[n] = e(n)), t[n];
  };
}
var Yi = function(t, n, r) {
  for (var o = 0, i = 0; o = i, i = Oe(), o === 38 && i === 12 && (n[r] = 1), !Ct(i); )
    ye();
  return kt(t, he);
}, Hi = function(t, n) {
  var r = -1, o = 44;
  do
    switch (Ct(o)) {
      case 0:
        o === 38 && Oe() === 12 && (n[r] = 1), t[r] += Yi(he - 1, n, r);
        break;
      case 2:
        t[r] += zt(o);
        break;
      case 4:
        if (o === 44) {
          t[++r] = Oe() === 58 ? "&\f" : "", n[r] = t[r].length;
          break;
        }
      // fallthrough
      default:
        t[r] += tn(o);
    }
  while (o = ye());
  return t;
}, qi = function(t, n) {
  return yo(Hi(go(t), n));
}, hr = /* @__PURE__ */ new WeakMap(), Gi = function(t) {
  if (!(t.type !== "rule" || !t.parent || // positive .length indicates that this rule contains pseudo
  // negative .length indicates that this rule has been already prefixed
  t.length < 1)) {
    for (var n = t.value, r = t.parent, o = t.column === r.column && t.line === r.line; r.type !== "rule"; )
      if (r = r.parent, !r) return;
    if (!(t.props.length === 1 && n.charCodeAt(0) !== 58 && !hr.get(r)) && !o) {
      hr.set(t, !0);
      for (var i = [], s = qi(n, i), a = r.props, u = 0, d = 0; u < s.length; u++)
        for (var m = 0; m < a.length; m++, d++)
          t.props[d] = i[u] ? s[u].replace(/&\f/g, a[m]) : a[m] + " " + s[u];
    }
  }
}, Ki = function(t) {
  if (t.type === "decl") {
    var n = t.value;
    // charcode for l
    n.charCodeAt(0) === 108 && // charcode for b
    n.charCodeAt(2) === 98 && (t.return = "", t.value = "");
  }
};
function vo(e, t) {
  switch (Ai(e, t)) {
    // color-adjust
    case 5103:
      return Z + "print-" + e + e;
    // animation, animation-(delay|direction|duration|fill-mode|iteration-count|name|play-state|timing-function)
    case 5737:
    case 4201:
    case 3177:
    case 3433:
    case 1641:
    case 4457:
    case 2921:
    // text-decoration, filter, clip-path, backface-visibility, column, box-decoration-break
    case 5572:
    case 6356:
    case 5844:
    case 3191:
    case 6645:
    case 3005:
    // mask, mask-image, mask-(mode|clip|size), mask-(repeat|origin), mask-position, mask-composite,
    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
    case 4855:
    // background-clip, columns, column-(count|fill|gap|rule|rule-color|rule-style|rule-width|span|width)
    case 4215:
    case 6389:
    case 5109:
    case 5365:
    case 5621:
    case 3829:
      return Z + e + e;
    // appearance, user-select, transform, hyphens, text-size-adjust
    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return Z + e + qt + e + me + e + e;
    // flex, flex-direction
    case 6828:
    case 4268:
      return Z + e + me + e + e;
    // order
    case 6165:
      return Z + e + me + "flex-" + e + e;
    // align-items
    case 5187:
      return Z + e + ee(e, /(\w+).+(:[^]+)/, Z + "box-$1$2" + me + "flex-$1$2") + e;
    // align-self
    case 5443:
      return Z + e + me + "flex-item-" + ee(e, /flex-|-self/, "") + e;
    // align-content
    case 4675:
      return Z + e + me + "flex-line-pack" + ee(e, /align-content|flex-|-self/, "") + e;
    // flex-shrink
    case 5548:
      return Z + e + me + ee(e, "shrink", "negative") + e;
    // flex-basis
    case 5292:
      return Z + e + me + ee(e, "basis", "preferred-size") + e;
    // flex-grow
    case 6060:
      return Z + "box-" + ee(e, "-grow", "") + Z + e + me + ee(e, "grow", "positive") + e;
    // transition
    case 4554:
      return Z + ee(e, /([^-])(transform)/g, "$1" + Z + "$2") + e;
    // cursor
    case 6187:
      return ee(ee(ee(e, /(zoom-|grab)/, Z + "$1"), /(image-set)/, Z + "$1"), e, "") + e;
    // background, background-image
    case 5495:
    case 3959:
      return ee(e, /(image-set\([^]*)/, Z + "$1$`$1");
    // justify-content
    case 4968:
      return ee(ee(e, /(.+:)(flex-)?(.*)/, Z + "box-pack:$3" + me + "flex-pack:$3"), /s.+-b[^;]+/, "justify") + Z + e + e;
    // (margin|padding)-inline-(start|end)
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return ee(e, /(.+)-inline(.+)/, Z + "$1$2") + e;
    // (min|max)?(width|height|inline-size|block-size)
    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      if (Ce(e) - 1 - t > 6) switch (pe(e, t + 1)) {
        // (m)ax-content, (m)in-content
        case 109:
          if (pe(e, t + 4) !== 45) break;
        // (f)ill-available, (f)it-content
        case 102:
          return ee(e, /(.+:)(.+)-([^]+)/, "$1" + Z + "$2-$3$1" + qt + (pe(e, t + 3) == 108 ? "$3" : "$2-$3")) + e;
        // (s)tretch
        case 115:
          return ~Mn(e, "stretch") ? vo(ee(e, "stretch", "fill-available"), t) + e : e;
      }
      break;
    // position: sticky
    case 4949:
      if (pe(e, t + 1) !== 115) break;
    // display: (flex|inline-flex)
    case 6444:
      switch (pe(e, Ce(e) - 3 - (~Mn(e, "!important") && 10))) {
        // stic(k)y
        case 107:
          return ee(e, ":", ":" + Z) + e;
        // (inline-)?fl(e)x
        case 101:
          return ee(e, /(.+:)([^;!]+)(;|!.+)?/, "$1" + Z + (pe(e, 14) === 45 ? "inline-" : "") + "box$3$1" + Z + "$2$3$1" + me + "$2box$3") + e;
      }
      break;
    // writing-mode
    case 5936:
      switch (pe(e, t + 11)) {
        // vertical-l(r)
        case 114:
          return Z + e + me + ee(e, /[svh]\w+-[tblr]{2}/, "tb") + e;
        // vertical-r(l)
        case 108:
          return Z + e + me + ee(e, /[svh]\w+-[tblr]{2}/, "tb-rl") + e;
        // horizontal(-)tb
        case 45:
          return Z + e + me + ee(e, /[svh]\w+-[tblr]{2}/, "lr") + e;
      }
      return Z + e + me + e + e;
  }
  return e;
}
var Xi = function(t, n, r, o) {
  if (t.length > -1 && !t.return) switch (t.type) {
    case Gn:
      t.return = vo(t.value, t.length);
      break;
    case po:
      return nt([ht(t, {
        value: ee(t.value, "@", "@" + Z)
      })], o);
    case qn:
      if (t.length) return $i(t.props, function(i) {
        switch (Ni(i, /(::plac\w+|:read-\w+)/)) {
          // :read-(only|write)
          case ":read-only":
          case ":read-write":
            return nt([ht(t, {
              props: [ee(i, /:(read-\w+)/, ":" + qt + "$1")]
            })], o);
          // :placeholder
          case "::placeholder":
            return nt([ht(t, {
              props: [ee(i, /:(plac\w+)/, ":" + Z + "input-$1")]
            }), ht(t, {
              props: [ee(i, /:(plac\w+)/, ":" + qt + "$1")]
            }), ht(t, {
              props: [ee(i, /:(plac\w+)/, me + "input-$1")]
            })], o);
        }
        return "";
      });
  }
}, Ji = [Xi], Qi = function(t) {
  var n = t.key;
  if (n === "css") {
    var r = document.querySelectorAll("style[data-emotion]:not([data-s])");
    Array.prototype.forEach.call(r, function(f) {
      var y = f.getAttribute("data-emotion");
      y.indexOf(" ") !== -1 && (document.head.appendChild(f), f.setAttribute("data-s", ""));
    });
  }
  var o = t.stylisPlugins || Ji, i = {}, s, a = [];
  s = t.container || document.head, Array.prototype.forEach.call(
    // this means we will ignore elements which don't have a space in them which
    // means that the style elements we're looking at are only Emotion 11 server-rendered style elements
    document.querySelectorAll('style[data-emotion^="' + n + ' "]'),
    function(f) {
      for (var y = f.getAttribute("data-emotion").split(" "), w = 1; w < y.length; w++)
        i[y[w]] = !0;
      a.push(f);
    }
  );
  var u, d = [Gi, Ki];
  {
    var m, h = [Ui, zi(function(f) {
      m.insert(f);
    })], v = Wi(d.concat(o, h)), b = function(y) {
      return nt(Bi(y), v);
    };
    u = function(y, w, P, S) {
      m = P, b(y ? y + "{" + w.styles + "}" : w.styles), S && (g.inserted[w.name] = !0);
    };
  }
  var g = {
    key: n,
    sheet: new Ri({
      key: n,
      container: s,
      nonce: t.nonce,
      speedy: t.speedy,
      prepend: t.prepend,
      insertionPoint: t.insertionPoint
    }),
    nonce: t.nonce,
    inserted: i,
    registered: {},
    insert: u
  };
  return g.sheet.hydrate(a), g;
}, Zi = !0;
function es(e, t, n) {
  var r = "";
  return n.split(" ").forEach(function(o) {
    e[o] !== void 0 ? t.push(e[o] + ";") : o && (r += o + " ");
  }), r;
}
var Eo = function(t, n, r) {
  var o = t.key + "-" + n.name;
  // we only need to add the styles to the registered cache if the
  // class name could be used further down
  // the tree but if it's a string tag, we know it won't
  // so we don't have to add it to registered cache.
  // this improves memory usage since we can avoid storing the whole style string
  (r === !1 || // we need to always store it if we're in compat mode and
  // in node since emotion-server relies on whether a style is in
  // the registered cache to know whether a style is global or not
  // also, note that this check will be dead code eliminated in the browser
  Zi === !1) && t.registered[o] === void 0 && (t.registered[o] = n.styles);
}, ts = function(t, n, r) {
  Eo(t, n, r);
  var o = t.key + "-" + n.name;
  if (t.inserted[n.name] === void 0) {
    var i = n;
    do
      t.insert(n === i ? "." + o : "", i, t.sheet, !0), i = i.next;
    while (i !== void 0);
  }
};
function ns(e) {
  for (var t = 0, n, r = 0, o = e.length; o >= 4; ++r, o -= 4)
    n = e.charCodeAt(r) & 255 | (e.charCodeAt(++r) & 255) << 8 | (e.charCodeAt(++r) & 255) << 16 | (e.charCodeAt(++r) & 255) << 24, n = /* Math.imul(k, m): */
    (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16), n ^= /* k >>> r: */
    n >>> 24, t = /* Math.imul(k, m): */
    (n & 65535) * 1540483477 + ((n >>> 16) * 59797 << 16) ^ /* Math.imul(h, m): */
    (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
  switch (o) {
    case 3:
      t ^= (e.charCodeAt(r + 2) & 255) << 16;
    case 2:
      t ^= (e.charCodeAt(r + 1) & 255) << 8;
    case 1:
      t ^= e.charCodeAt(r) & 255, t = /* Math.imul(h, m): */
      (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16);
  }
  return t ^= t >>> 13, t = /* Math.imul(h, m): */
  (t & 65535) * 1540483477 + ((t >>> 16) * 59797 << 16), ((t ^ t >>> 15) >>> 0).toString(36);
}
var rs = {
  animationIterationCount: 1,
  aspectRatio: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  scale: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
}, os = /[A-Z]|^ms/g, is = /_EMO_([^_]+?)_([^]*?)_EMO_/g, To = function(t) {
  return t.charCodeAt(1) === 45;
}, gr = function(t) {
  return t != null && typeof t != "boolean";
}, vn = /* @__PURE__ */ bo(function(e) {
  return To(e) ? e : e.replace(os, "-$&").toLowerCase();
}), yr = function(t, n) {
  switch (t) {
    case "animation":
    case "animationName":
      if (typeof n == "string")
        return n.replace(is, function(r, o, i) {
          return Re = {
            name: o,
            styles: i,
            next: Re
          }, o;
        });
  }
  return rs[t] !== 1 && !To(t) && typeof n == "number" && n !== 0 ? n + "px" : n;
};
function Rt(e, t, n) {
  if (n == null)
    return "";
  var r = n;
  if (r.__emotion_styles !== void 0)
    return r;
  switch (typeof n) {
    case "boolean":
      return "";
    case "object": {
      var o = n;
      if (o.anim === 1)
        return Re = {
          name: o.name,
          styles: o.styles,
          next: Re
        }, o.name;
      var i = n;
      if (i.styles !== void 0) {
        var s = i.next;
        if (s !== void 0)
          for (; s !== void 0; )
            Re = {
              name: s.name,
              styles: s.styles,
              next: Re
            }, s = s.next;
        var a = i.styles + ";";
        return a;
      }
      return ss(e, t, n);
    }
    case "function": {
      if (e !== void 0) {
        var u = Re, d = n(e);
        return Re = u, Rt(e, t, d);
      }
      break;
    }
  }
  var m = n;
  if (t == null)
    return m;
  var h = t[m];
  return h !== void 0 ? h : m;
}
function ss(e, t, n) {
  var r = "";
  if (Array.isArray(n))
    for (var o = 0; o < n.length; o++)
      r += Rt(e, t, n[o]) + ";";
  else
    for (var i in n) {
      var s = n[i];
      if (typeof s != "object") {
        var a = s;
        t != null && t[a] !== void 0 ? r += i + "{" + t[a] + "}" : gr(a) && (r += vn(i) + ":" + yr(i, a) + ";");
      } else if (Array.isArray(s) && typeof s[0] == "string" && (t == null || t[s[0]] === void 0))
        for (var u = 0; u < s.length; u++)
          gr(s[u]) && (r += vn(i) + ":" + yr(i, s[u]) + ";");
      else {
        var d = Rt(e, t, s);
        switch (i) {
          case "animation":
          case "animationName": {
            r += vn(i) + ":" + d + ";";
            break;
          }
          default:
            r += i + "{" + d + "}";
        }
      }
    }
  return r;
}
var br = /label:\s*([^\s;{]+)\s*(;|$)/g, Re;
function xo(e, t, n) {
  if (e.length === 1 && typeof e[0] == "object" && e[0] !== null && e[0].styles !== void 0)
    return e[0];
  var r = !0, o = "";
  Re = void 0;
  var i = e[0];
  if (i == null || i.raw === void 0)
    r = !1, o += Rt(n, t, i);
  else {
    var s = i;
    o += s[0];
  }
  for (var a = 1; a < e.length; a++)
    if (o += Rt(n, t, e[a]), r) {
      var u = i;
      o += u[a];
    }
  br.lastIndex = 0;
  for (var d = "", m; (m = br.exec(o)) !== null; )
    d += "-" + m[1];
  var h = ns(o) + d;
  return {
    name: h,
    styles: o,
    next: Re
  };
}
var as = function(t) {
  return t();
}, cs = N.useInsertionEffect ? N.useInsertionEffect : !1, ls = cs || as, So = /* @__PURE__ */ N.createContext(
  // we're doing this to avoid preconstruct's dead code elimination in this one case
  // because this module is primarily intended for the browser and node
  // but it's also required in react native and similar environments sometimes
  // and we could have a special build just for that
  // but this is much easier and the native packages
  // might use a different theme context in the future anyway
  typeof HTMLElement < "u" ? /* @__PURE__ */ Qi({
    key: "css"
  }) : null
);
So.Provider;
var us = function(t) {
  return /* @__PURE__ */ hi(function(n, r) {
    var o = gi(So);
    return t(n, o, r);
  });
}, wo = /* @__PURE__ */ N.createContext({}), fs = /^((children|dangerouslySetInnerHTML|key|ref|autoFocus|defaultValue|defaultChecked|innerHTML|suppressContentEditableWarning|suppressHydrationWarning|valueLink|abbr|accept|acceptCharset|accessKey|action|allow|allowUserMedia|allowPaymentRequest|allowFullScreen|allowTransparency|alt|async|autoComplete|autoPlay|capture|cellPadding|cellSpacing|challenge|charSet|checked|cite|classID|className|cols|colSpan|content|contentEditable|contextMenu|controls|controlsList|coords|crossOrigin|data|dateTime|decoding|default|defer|dir|disabled|disablePictureInPicture|disableRemotePlayback|download|draggable|encType|enterKeyHint|fetchpriority|fetchPriority|form|formAction|formEncType|formMethod|formNoValidate|formTarget|frameBorder|headers|height|hidden|high|href|hrefLang|htmlFor|httpEquiv|id|inputMode|integrity|is|keyParams|keyType|kind|label|lang|list|loading|loop|low|marginHeight|marginWidth|max|maxLength|media|mediaGroup|method|min|minLength|multiple|muted|name|nonce|noValidate|open|optimum|pattern|placeholder|playsInline|poster|preload|profile|radioGroup|readOnly|referrerPolicy|rel|required|reversed|role|rows|rowSpan|sandbox|scope|scoped|scrolling|seamless|selected|shape|size|sizes|slot|span|spellCheck|src|srcDoc|srcLang|srcSet|start|step|style|summary|tabIndex|target|title|translate|type|useMap|value|width|wmode|wrap|about|datatype|inlist|prefix|property|resource|typeof|vocab|autoCapitalize|autoCorrect|autoSave|color|incremental|fallback|inert|itemProp|itemScope|itemType|itemID|itemRef|on|option|results|security|unselectable|accentHeight|accumulate|additive|alignmentBaseline|allowReorder|alphabetic|amplitude|arabicForm|ascent|attributeName|attributeType|autoReverse|azimuth|baseFrequency|baselineShift|baseProfile|bbox|begin|bias|by|calcMode|capHeight|clip|clipPathUnits|clipPath|clipRule|colorInterpolation|colorInterpolationFilters|colorProfile|colorRendering|contentScriptType|contentStyleType|cursor|cx|cy|d|decelerate|descent|diffuseConstant|direction|display|divisor|dominantBaseline|dur|dx|dy|edgeMode|elevation|enableBackground|end|exponent|externalResourcesRequired|fill|fillOpacity|fillRule|filter|filterRes|filterUnits|floodColor|floodOpacity|focusable|fontFamily|fontSize|fontSizeAdjust|fontStretch|fontStyle|fontVariant|fontWeight|format|from|fr|fx|fy|g1|g2|glyphName|glyphOrientationHorizontal|glyphOrientationVertical|glyphRef|gradientTransform|gradientUnits|hanging|horizAdvX|horizOriginX|ideographic|imageRendering|in|in2|intercept|k|k1|k2|k3|k4|kernelMatrix|kernelUnitLength|kerning|keyPoints|keySplines|keyTimes|lengthAdjust|letterSpacing|lightingColor|limitingConeAngle|local|markerEnd|markerMid|markerStart|markerHeight|markerUnits|markerWidth|mask|maskContentUnits|maskUnits|mathematical|mode|numOctaves|offset|opacity|operator|order|orient|orientation|origin|overflow|overlinePosition|overlineThickness|panose1|paintOrder|pathLength|patternContentUnits|patternTransform|patternUnits|pointerEvents|points|pointsAtX|pointsAtY|pointsAtZ|preserveAlpha|preserveAspectRatio|primitiveUnits|r|radius|refX|refY|renderingIntent|repeatCount|repeatDur|requiredExtensions|requiredFeatures|restart|result|rotate|rx|ry|scale|seed|shapeRendering|slope|spacing|specularConstant|specularExponent|speed|spreadMethod|startOffset|stdDeviation|stemh|stemv|stitchTiles|stopColor|stopOpacity|strikethroughPosition|strikethroughThickness|string|stroke|strokeDasharray|strokeDashoffset|strokeLinecap|strokeLinejoin|strokeMiterlimit|strokeOpacity|strokeWidth|surfaceScale|systemLanguage|tableValues|targetX|targetY|textAnchor|textDecoration|textRendering|textLength|to|transform|u1|u2|underlinePosition|underlineThickness|unicode|unicodeBidi|unicodeRange|unitsPerEm|vAlphabetic|vHanging|vIdeographic|vMathematical|values|vectorEffect|version|vertAdvY|vertOriginX|vertOriginY|viewBox|viewTarget|visibility|widths|wordSpacing|writingMode|x|xHeight|x1|x2|xChannelSelector|xlinkActuate|xlinkArcrole|xlinkHref|xlinkRole|xlinkShow|xlinkTitle|xlinkType|xmlBase|xmlns|xmlnsXlink|xmlLang|xmlSpace|y|y1|y2|yChannelSelector|z|zoomAndPan|for|class|autofocus)|(([Dd][Aa][Tt][Aa]|[Aa][Rr][Ii][Aa]|x)-.*))$/, ds = /* @__PURE__ */ bo(
  function(e) {
    return fs.test(e) || e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) < 91;
  }
  /* Z+1 */
), ps = ds, ms = function(t) {
  return t !== "theme";
}, vr = function(t) {
  return typeof t == "string" && // 96 is one less than the char code
  // for "a" so this is checking that
  // it's a lowercase character
  t.charCodeAt(0) > 96 ? ps : ms;
}, Er = function(t, n, r) {
  var o;
  if (n) {
    var i = n.shouldForwardProp;
    o = t.__emotion_forwardProp && i ? function(s) {
      return t.__emotion_forwardProp(s) && i(s);
    } : i;
  }
  return typeof o != "function" && r && (o = t.__emotion_forwardProp), o;
}, hs = function(t) {
  var n = t.cache, r = t.serialized, o = t.isStringTag;
  return Eo(n, r, o), ls(function() {
    return ts(n, r, o);
  }), null;
}, gs = function e(t, n) {
  var r = t.__emotion_real === t, o = r && t.__emotion_base || t, i, s;
  n !== void 0 && (i = n.label, s = n.target);
  var a = Er(t, n, r), u = a || vr(o), d = !u("as");
  return function() {
    var m = arguments, h = r && t.__emotion_styles !== void 0 ? t.__emotion_styles.slice(0) : [];
    if (i !== void 0 && h.push("label:" + i + ";"), m[0] == null || m[0].raw === void 0)
      h.push.apply(h, m);
    else {
      var v = m[0];
      h.push(v[0]);
      for (var b = m.length, g = 1; g < b; g++)
        h.push(m[g], v[g]);
    }
    var f = us(function(y, w, P) {
      var S = d && y.as || o, T = "", E = [], O = y;
      if (y.theme == null) {
        O = {};
        for (var _ in y)
          O[_] = y[_];
        O.theme = N.useContext(wo);
      }
      typeof y.className == "string" ? T = es(w.registered, E, y.className) : y.className != null && (T = y.className + " ");
      var j = xo(h.concat(E), w.registered, O);
      T += w.key + "-" + j.name, s !== void 0 && (T += " " + s);
      var W = d && a === void 0 ? vr(S) : u, J = {};
      for (var V in y)
        d && V === "as" || W(V) && (J[V] = y[V]);
      return J.className = T, P && (J.ref = P), /* @__PURE__ */ N.createElement(N.Fragment, null, /* @__PURE__ */ N.createElement(hs, {
        cache: w,
        serialized: j,
        isStringTag: typeof S == "string"
      }), /* @__PURE__ */ N.createElement(S, J));
    });
    return f.displayName = i !== void 0 ? i : "Styled(" + (typeof o == "string" ? o : o.displayName || o.name || "Component") + ")", f.defaultProps = t.defaultProps, f.__emotion_real = f, f.__emotion_base = o, f.__emotion_styles = h, f.__emotion_forwardProp = a, Object.defineProperty(f, "toString", {
      value: function() {
        return "." + s;
      }
    }), f.withComponent = function(y, w) {
      var P = e(y, In({}, n, w, {
        shouldForwardProp: Er(f, w, !0)
      }));
      return P.apply(void 0, h);
    }, f;
  };
}, ys = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  // SVG
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "svg",
  "text",
  "tspan"
], jn = gs.bind(null);
ys.forEach(function(e) {
  jn[e] = jn(e);
});
var jt = { exports: {} }, Lt = { exports: {} }, te = {};
/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Tr;
function bs() {
  if (Tr) return te;
  Tr = 1;
  var e = typeof Symbol == "function" && Symbol.for, t = e ? Symbol.for("react.element") : 60103, n = e ? Symbol.for("react.portal") : 60106, r = e ? Symbol.for("react.fragment") : 60107, o = e ? Symbol.for("react.strict_mode") : 60108, i = e ? Symbol.for("react.profiler") : 60114, s = e ? Symbol.for("react.provider") : 60109, a = e ? Symbol.for("react.context") : 60110, u = e ? Symbol.for("react.async_mode") : 60111, d = e ? Symbol.for("react.concurrent_mode") : 60111, m = e ? Symbol.for("react.forward_ref") : 60112, h = e ? Symbol.for("react.suspense") : 60113, v = e ? Symbol.for("react.suspense_list") : 60120, b = e ? Symbol.for("react.memo") : 60115, g = e ? Symbol.for("react.lazy") : 60116, f = e ? Symbol.for("react.block") : 60121, y = e ? Symbol.for("react.fundamental") : 60117, w = e ? Symbol.for("react.responder") : 60118, P = e ? Symbol.for("react.scope") : 60119;
  function S(E) {
    if (typeof E == "object" && E !== null) {
      var O = E.$$typeof;
      switch (O) {
        case t:
          switch (E = E.type, E) {
            case u:
            case d:
            case r:
            case i:
            case o:
            case h:
              return E;
            default:
              switch (E = E && E.$$typeof, E) {
                case a:
                case m:
                case g:
                case b:
                case s:
                  return E;
                default:
                  return O;
              }
          }
        case n:
          return O;
      }
    }
  }
  function T(E) {
    return S(E) === d;
  }
  return te.AsyncMode = u, te.ConcurrentMode = d, te.ContextConsumer = a, te.ContextProvider = s, te.Element = t, te.ForwardRef = m, te.Fragment = r, te.Lazy = g, te.Memo = b, te.Portal = n, te.Profiler = i, te.StrictMode = o, te.Suspense = h, te.isAsyncMode = function(E) {
    return T(E) || S(E) === u;
  }, te.isConcurrentMode = T, te.isContextConsumer = function(E) {
    return S(E) === a;
  }, te.isContextProvider = function(E) {
    return S(E) === s;
  }, te.isElement = function(E) {
    return typeof E == "object" && E !== null && E.$$typeof === t;
  }, te.isForwardRef = function(E) {
    return S(E) === m;
  }, te.isFragment = function(E) {
    return S(E) === r;
  }, te.isLazy = function(E) {
    return S(E) === g;
  }, te.isMemo = function(E) {
    return S(E) === b;
  }, te.isPortal = function(E) {
    return S(E) === n;
  }, te.isProfiler = function(E) {
    return S(E) === i;
  }, te.isStrictMode = function(E) {
    return S(E) === o;
  }, te.isSuspense = function(E) {
    return S(E) === h;
  }, te.isValidElementType = function(E) {
    return typeof E == "string" || typeof E == "function" || E === r || E === d || E === i || E === o || E === h || E === v || typeof E == "object" && E !== null && (E.$$typeof === g || E.$$typeof === b || E.$$typeof === s || E.$$typeof === a || E.$$typeof === m || E.$$typeof === y || E.$$typeof === w || E.$$typeof === P || E.$$typeof === f);
  }, te.typeOf = S, te;
}
var ne = {};
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var xr;
function vs() {
  return xr || (xr = 1, process.env.NODE_ENV !== "production" && (function() {
    var e = typeof Symbol == "function" && Symbol.for, t = e ? Symbol.for("react.element") : 60103, n = e ? Symbol.for("react.portal") : 60106, r = e ? Symbol.for("react.fragment") : 60107, o = e ? Symbol.for("react.strict_mode") : 60108, i = e ? Symbol.for("react.profiler") : 60114, s = e ? Symbol.for("react.provider") : 60109, a = e ? Symbol.for("react.context") : 60110, u = e ? Symbol.for("react.async_mode") : 60111, d = e ? Symbol.for("react.concurrent_mode") : 60111, m = e ? Symbol.for("react.forward_ref") : 60112, h = e ? Symbol.for("react.suspense") : 60113, v = e ? Symbol.for("react.suspense_list") : 60120, b = e ? Symbol.for("react.memo") : 60115, g = e ? Symbol.for("react.lazy") : 60116, f = e ? Symbol.for("react.block") : 60121, y = e ? Symbol.for("react.fundamental") : 60117, w = e ? Symbol.for("react.responder") : 60118, P = e ? Symbol.for("react.scope") : 60119;
    function S($) {
      return typeof $ == "string" || typeof $ == "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      $ === r || $ === d || $ === i || $ === o || $ === h || $ === v || typeof $ == "object" && $ !== null && ($.$$typeof === g || $.$$typeof === b || $.$$typeof === s || $.$$typeof === a || $.$$typeof === m || $.$$typeof === y || $.$$typeof === w || $.$$typeof === P || $.$$typeof === f);
    }
    function T($) {
      if (typeof $ == "object" && $ !== null) {
        var ue = $.$$typeof;
        switch (ue) {
          case t:
            var xe = $.type;
            switch (xe) {
              case u:
              case d:
              case r:
              case i:
              case o:
              case h:
                return xe;
              default:
                var Ae = xe && xe.$$typeof;
                switch (Ae) {
                  case a:
                  case m:
                  case g:
                  case b:
                  case s:
                    return Ae;
                  default:
                    return ue;
                }
            }
          case n:
            return ue;
        }
      }
    }
    var E = u, O = d, _ = a, j = s, W = t, J = m, V = r, l = g, I = b, C = n, k = i, A = o, z = h, Q = !1;
    function q($) {
      return Q || (Q = !0, console.warn("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.")), p($) || T($) === u;
    }
    function p($) {
      return T($) === d;
    }
    function R($) {
      return T($) === a;
    }
    function D($) {
      return T($) === s;
    }
    function L($) {
      return typeof $ == "object" && $ !== null && $.$$typeof === t;
    }
    function F($) {
      return T($) === m;
    }
    function Y($) {
      return T($) === r;
    }
    function H($) {
      return T($) === g;
    }
    function G($) {
      return T($) === b;
    }
    function U($) {
      return T($) === n;
    }
    function X($) {
      return T($) === i;
    }
    function M($) {
      return T($) === o;
    }
    function K($) {
      return T($) === h;
    }
    ne.AsyncMode = E, ne.ConcurrentMode = O, ne.ContextConsumer = _, ne.ContextProvider = j, ne.Element = W, ne.ForwardRef = J, ne.Fragment = V, ne.Lazy = l, ne.Memo = I, ne.Portal = C, ne.Profiler = k, ne.StrictMode = A, ne.Suspense = z, ne.isAsyncMode = q, ne.isConcurrentMode = p, ne.isContextConsumer = R, ne.isContextProvider = D, ne.isElement = L, ne.isForwardRef = F, ne.isFragment = Y, ne.isLazy = H, ne.isMemo = G, ne.isPortal = U, ne.isProfiler = X, ne.isStrictMode = M, ne.isSuspense = K, ne.isValidElementType = S, ne.typeOf = T;
  })()), ne;
}
var Sr;
function Co() {
  return Sr || (Sr = 1, process.env.NODE_ENV === "production" ? Lt.exports = bs() : Lt.exports = vs()), Lt.exports;
}
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var En, wr;
function Es() {
  if (wr) return En;
  wr = 1;
  var e = Object.getOwnPropertySymbols, t = Object.prototype.hasOwnProperty, n = Object.prototype.propertyIsEnumerable;
  function r(i) {
    if (i == null)
      throw new TypeError("Object.assign cannot be called with null or undefined");
    return Object(i);
  }
  function o() {
    try {
      if (!Object.assign)
        return !1;
      var i = new String("abc");
      if (i[5] = "de", Object.getOwnPropertyNames(i)[0] === "5")
        return !1;
      for (var s = {}, a = 0; a < 10; a++)
        s["_" + String.fromCharCode(a)] = a;
      var u = Object.getOwnPropertyNames(s).map(function(m) {
        return s[m];
      });
      if (u.join("") !== "0123456789")
        return !1;
      var d = {};
      return "abcdefghijklmnopqrst".split("").forEach(function(m) {
        d[m] = m;
      }), Object.keys(Object.assign({}, d)).join("") === "abcdefghijklmnopqrst";
    } catch {
      return !1;
    }
  }
  return En = o() ? Object.assign : function(i, s) {
    for (var a, u = r(i), d, m = 1; m < arguments.length; m++) {
      a = Object(arguments[m]);
      for (var h in a)
        t.call(a, h) && (u[h] = a[h]);
      if (e) {
        d = e(a);
        for (var v = 0; v < d.length; v++)
          n.call(a, d[v]) && (u[d[v]] = a[d[v]]);
      }
    }
    return u;
  }, En;
}
var Tn, Cr;
function Xn() {
  if (Cr) return Tn;
  Cr = 1;
  var e = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return Tn = e, Tn;
}
var xn, Rr;
function Ro() {
  return Rr || (Rr = 1, xn = Function.call.bind(Object.prototype.hasOwnProperty)), xn;
}
var Sn, Or;
function Ts() {
  if (Or) return Sn;
  Or = 1;
  var e = function() {
  };
  if (process.env.NODE_ENV !== "production") {
    var t = /* @__PURE__ */ Xn(), n = {}, r = /* @__PURE__ */ Ro();
    e = function(i) {
      var s = "Warning: " + i;
      typeof console < "u" && console.error(s);
      try {
        throw new Error(s);
      } catch {
      }
    };
  }
  function o(i, s, a, u, d) {
    if (process.env.NODE_ENV !== "production") {
      for (var m in i)
        if (r(i, m)) {
          var h;
          try {
            if (typeof i[m] != "function") {
              var v = Error(
                (u || "React class") + ": " + a + " type `" + m + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof i[m] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
              );
              throw v.name = "Invariant Violation", v;
            }
            h = i[m](s, m, u, a, null, t);
          } catch (g) {
            h = g;
          }
          if (h && !(h instanceof Error) && e(
            (u || "React class") + ": type specification of " + a + " `" + m + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof h + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
          ), h instanceof Error && !(h.message in n)) {
            n[h.message] = !0;
            var b = d ? d() : "";
            e(
              "Failed " + a + " type: " + h.message + (b ?? "")
            );
          }
        }
    }
  }
  return o.resetWarningCache = function() {
    process.env.NODE_ENV !== "production" && (n = {});
  }, Sn = o, Sn;
}
var wn, kr;
function xs() {
  if (kr) return wn;
  kr = 1;
  var e = Co(), t = Es(), n = /* @__PURE__ */ Xn(), r = /* @__PURE__ */ Ro(), o = /* @__PURE__ */ Ts(), i = function() {
  };
  process.env.NODE_ENV !== "production" && (i = function(a) {
    var u = "Warning: " + a;
    typeof console < "u" && console.error(u);
    try {
      throw new Error(u);
    } catch {
    }
  });
  function s() {
    return null;
  }
  return wn = function(a, u) {
    var d = typeof Symbol == "function" && Symbol.iterator, m = "@@iterator";
    function h(p) {
      var R = p && (d && p[d] || p[m]);
      if (typeof R == "function")
        return R;
    }
    var v = "<<anonymous>>", b = {
      array: w("array"),
      bigint: w("bigint"),
      bool: w("boolean"),
      func: w("function"),
      number: w("number"),
      object: w("object"),
      string: w("string"),
      symbol: w("symbol"),
      any: P(),
      arrayOf: S,
      element: T(),
      elementType: E(),
      instanceOf: O,
      node: J(),
      objectOf: j,
      oneOf: _,
      oneOfType: W,
      shape: l,
      exact: I
    };
    function g(p, R) {
      return p === R ? p !== 0 || 1 / p === 1 / R : p !== p && R !== R;
    }
    function f(p, R) {
      this.message = p, this.data = R && typeof R == "object" ? R : {}, this.stack = "";
    }
    f.prototype = Error.prototype;
    function y(p) {
      if (process.env.NODE_ENV !== "production")
        var R = {}, D = 0;
      function L(Y, H, G, U, X, M, K) {
        if (U = U || v, M = M || G, K !== n) {
          if (u) {
            var $ = new Error(
              "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
            );
            throw $.name = "Invariant Violation", $;
          } else if (process.env.NODE_ENV !== "production" && typeof console < "u") {
            var ue = U + ":" + G;
            !R[ue] && // Avoid spamming the console because they are often not actionable except for lib authors
            D < 3 && (i(
              "You are manually calling a React.PropTypes validation function for the `" + M + "` prop on `" + U + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
            ), R[ue] = !0, D++);
          }
        }
        return H[G] == null ? Y ? H[G] === null ? new f("The " + X + " `" + M + "` is marked as required " + ("in `" + U + "`, but its value is `null`.")) : new f("The " + X + " `" + M + "` is marked as required in " + ("`" + U + "`, but its value is `undefined`.")) : null : p(H, G, U, X, M);
      }
      var F = L.bind(null, !1);
      return F.isRequired = L.bind(null, !0), F;
    }
    function w(p) {
      function R(D, L, F, Y, H, G) {
        var U = D[L], X = A(U);
        if (X !== p) {
          var M = z(U);
          return new f(
            "Invalid " + Y + " `" + H + "` of type " + ("`" + M + "` supplied to `" + F + "`, expected ") + ("`" + p + "`."),
            { expectedType: p }
          );
        }
        return null;
      }
      return y(R);
    }
    function P() {
      return y(s);
    }
    function S(p) {
      function R(D, L, F, Y, H) {
        if (typeof p != "function")
          return new f("Property `" + H + "` of component `" + F + "` has invalid PropType notation inside arrayOf.");
        var G = D[L];
        if (!Array.isArray(G)) {
          var U = A(G);
          return new f("Invalid " + Y + " `" + H + "` of type " + ("`" + U + "` supplied to `" + F + "`, expected an array."));
        }
        for (var X = 0; X < G.length; X++) {
          var M = p(G, X, F, Y, H + "[" + X + "]", n);
          if (M instanceof Error)
            return M;
        }
        return null;
      }
      return y(R);
    }
    function T() {
      function p(R, D, L, F, Y) {
        var H = R[D];
        if (!a(H)) {
          var G = A(H);
          return new f("Invalid " + F + " `" + Y + "` of type " + ("`" + G + "` supplied to `" + L + "`, expected a single ReactElement."));
        }
        return null;
      }
      return y(p);
    }
    function E() {
      function p(R, D, L, F, Y) {
        var H = R[D];
        if (!e.isValidElementType(H)) {
          var G = A(H);
          return new f("Invalid " + F + " `" + Y + "` of type " + ("`" + G + "` supplied to `" + L + "`, expected a single ReactElement type."));
        }
        return null;
      }
      return y(p);
    }
    function O(p) {
      function R(D, L, F, Y, H) {
        if (!(D[L] instanceof p)) {
          var G = p.name || v, U = q(D[L]);
          return new f("Invalid " + Y + " `" + H + "` of type " + ("`" + U + "` supplied to `" + F + "`, expected ") + ("instance of `" + G + "`."));
        }
        return null;
      }
      return y(R);
    }
    function _(p) {
      if (!Array.isArray(p))
        return process.env.NODE_ENV !== "production" && (arguments.length > 1 ? i(
          "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
        ) : i("Invalid argument supplied to oneOf, expected an array.")), s;
      function R(D, L, F, Y, H) {
        for (var G = D[L], U = 0; U < p.length; U++)
          if (g(G, p[U]))
            return null;
        var X = JSON.stringify(p, function(K, $) {
          var ue = z($);
          return ue === "symbol" ? String($) : $;
        });
        return new f("Invalid " + Y + " `" + H + "` of value `" + String(G) + "` " + ("supplied to `" + F + "`, expected one of " + X + "."));
      }
      return y(R);
    }
    function j(p) {
      function R(D, L, F, Y, H) {
        if (typeof p != "function")
          return new f("Property `" + H + "` of component `" + F + "` has invalid PropType notation inside objectOf.");
        var G = D[L], U = A(G);
        if (U !== "object")
          return new f("Invalid " + Y + " `" + H + "` of type " + ("`" + U + "` supplied to `" + F + "`, expected an object."));
        for (var X in G)
          if (r(G, X)) {
            var M = p(G, X, F, Y, H + "." + X, n);
            if (M instanceof Error)
              return M;
          }
        return null;
      }
      return y(R);
    }
    function W(p) {
      if (!Array.isArray(p))
        return process.env.NODE_ENV !== "production" && i("Invalid argument supplied to oneOfType, expected an instance of array."), s;
      for (var R = 0; R < p.length; R++) {
        var D = p[R];
        if (typeof D != "function")
          return i(
            "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + Q(D) + " at index " + R + "."
          ), s;
      }
      function L(F, Y, H, G, U) {
        for (var X = [], M = 0; M < p.length; M++) {
          var K = p[M], $ = K(F, Y, H, G, U, n);
          if ($ == null)
            return null;
          $.data && r($.data, "expectedType") && X.push($.data.expectedType);
        }
        var ue = X.length > 0 ? ", expected one of type [" + X.join(", ") + "]" : "";
        return new f("Invalid " + G + " `" + U + "` supplied to " + ("`" + H + "`" + ue + "."));
      }
      return y(L);
    }
    function J() {
      function p(R, D, L, F, Y) {
        return C(R[D]) ? null : new f("Invalid " + F + " `" + Y + "` supplied to " + ("`" + L + "`, expected a ReactNode."));
      }
      return y(p);
    }
    function V(p, R, D, L, F) {
      return new f(
        (p || "React class") + ": " + R + " type `" + D + "." + L + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + F + "`."
      );
    }
    function l(p) {
      function R(D, L, F, Y, H) {
        var G = D[L], U = A(G);
        if (U !== "object")
          return new f("Invalid " + Y + " `" + H + "` of type `" + U + "` " + ("supplied to `" + F + "`, expected `object`."));
        for (var X in p) {
          var M = p[X];
          if (typeof M != "function")
            return V(F, Y, H, X, z(M));
          var K = M(G, X, F, Y, H + "." + X, n);
          if (K)
            return K;
        }
        return null;
      }
      return y(R);
    }
    function I(p) {
      function R(D, L, F, Y, H) {
        var G = D[L], U = A(G);
        if (U !== "object")
          return new f("Invalid " + Y + " `" + H + "` of type `" + U + "` " + ("supplied to `" + F + "`, expected `object`."));
        var X = t({}, D[L], p);
        for (var M in X) {
          var K = p[M];
          if (r(p, M) && typeof K != "function")
            return V(F, Y, H, M, z(K));
          if (!K)
            return new f(
              "Invalid " + Y + " `" + H + "` key `" + M + "` supplied to `" + F + "`.\nBad object: " + JSON.stringify(D[L], null, "  ") + `
Valid keys: ` + JSON.stringify(Object.keys(p), null, "  ")
            );
          var $ = K(G, M, F, Y, H + "." + M, n);
          if ($)
            return $;
        }
        return null;
      }
      return y(R);
    }
    function C(p) {
      switch (typeof p) {
        case "number":
        case "string":
        case "undefined":
          return !0;
        case "boolean":
          return !p;
        case "object":
          if (Array.isArray(p))
            return p.every(C);
          if (p === null || a(p))
            return !0;
          var R = h(p);
          if (R) {
            var D = R.call(p), L;
            if (R !== p.entries) {
              for (; !(L = D.next()).done; )
                if (!C(L.value))
                  return !1;
            } else
              for (; !(L = D.next()).done; ) {
                var F = L.value;
                if (F && !C(F[1]))
                  return !1;
              }
          } else
            return !1;
          return !0;
        default:
          return !1;
      }
    }
    function k(p, R) {
      return p === "symbol" ? !0 : R ? R["@@toStringTag"] === "Symbol" || typeof Symbol == "function" && R instanceof Symbol : !1;
    }
    function A(p) {
      var R = typeof p;
      return Array.isArray(p) ? "array" : p instanceof RegExp ? "object" : k(R, p) ? "symbol" : R;
    }
    function z(p) {
      if (typeof p > "u" || p === null)
        return "" + p;
      var R = A(p);
      if (R === "object") {
        if (p instanceof Date)
          return "date";
        if (p instanceof RegExp)
          return "regexp";
      }
      return R;
    }
    function Q(p) {
      var R = z(p);
      switch (R) {
        case "array":
        case "object":
          return "an " + R;
        case "boolean":
        case "date":
        case "regexp":
          return "a " + R;
        default:
          return R;
      }
    }
    function q(p) {
      return !p.constructor || !p.constructor.name ? v : p.constructor.name;
    }
    return b.checkPropTypes = o, b.resetWarningCache = o.resetWarningCache, b.PropTypes = b, b;
  }, wn;
}
var Cn, Pr;
function Ss() {
  if (Pr) return Cn;
  Pr = 1;
  var e = /* @__PURE__ */ Xn();
  function t() {
  }
  function n() {
  }
  return n.resetWarningCache = t, Cn = function() {
    function r(s, a, u, d, m, h) {
      if (h !== e) {
        var v = new Error(
          "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
        );
        throw v.name = "Invariant Violation", v;
      }
    }
    r.isRequired = r;
    function o() {
      return r;
    }
    var i = {
      array: r,
      bigint: r,
      bool: r,
      func: r,
      number: r,
      object: r,
      string: r,
      symbol: r,
      any: r,
      arrayOf: o,
      element: r,
      elementType: r,
      instanceOf: o,
      node: r,
      objectOf: o,
      oneOf: o,
      oneOfType: o,
      shape: o,
      exact: o,
      checkPropTypes: n,
      resetWarningCache: t
    };
    return i.PropTypes = i, i;
  }, Cn;
}
var _r;
function ws() {
  if (_r) return jt.exports;
  if (_r = 1, process.env.NODE_ENV !== "production") {
    var e = Co(), t = !0;
    jt.exports = /* @__PURE__ */ xs()(e.isElement, t);
  } else
    jt.exports = /* @__PURE__ */ Ss()();
  return jt.exports;
}
var Cs = /* @__PURE__ */ ws();
const c = /* @__PURE__ */ vi(Cs);
/**
 * @mui/styled-engine v7.3.1
 *
 * @license MIT
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function Rs(e, t) {
  const n = jn(e, t);
  return process.env.NODE_ENV !== "production" ? (...r) => {
    const o = typeof e == "string" ? `"${e}"` : "component";
    return r.length === 0 ? console.error([`MUI: Seems like you called \`styled(${o})()\` without a \`style\` argument.`, 'You must provide a `styles` argument: `styled("div")(styleYouForgotToPass)`.'].join(`
`)) : r.some((i) => i === void 0) && console.error(`MUI: the styled(${o})(...args) API requires all its args to be defined.`), n(...r);
  } : n;
}
function Os(e, t) {
  Array.isArray(e.__emotion_styles) && (e.__emotion_styles = t(e.__emotion_styles));
}
const Ar = [];
function Ye(e) {
  return Ar[0] = e, xo(Ar);
}
var Ft = { exports: {} }, ie = {};
/**
 * @license React
 * react-is.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Nr;
function ks() {
  if (Nr) return ie;
  Nr = 1;
  var e = Symbol.for("react.transitional.element"), t = Symbol.for("react.portal"), n = Symbol.for("react.fragment"), r = Symbol.for("react.strict_mode"), o = Symbol.for("react.profiler"), i = Symbol.for("react.consumer"), s = Symbol.for("react.context"), a = Symbol.for("react.forward_ref"), u = Symbol.for("react.suspense"), d = Symbol.for("react.suspense_list"), m = Symbol.for("react.memo"), h = Symbol.for("react.lazy"), v = Symbol.for("react.view_transition"), b = Symbol.for("react.client.reference");
  function g(f) {
    if (typeof f == "object" && f !== null) {
      var y = f.$$typeof;
      switch (y) {
        case e:
          switch (f = f.type, f) {
            case n:
            case o:
            case r:
            case u:
            case d:
            case v:
              return f;
            default:
              switch (f = f && f.$$typeof, f) {
                case s:
                case a:
                case h:
                case m:
                  return f;
                case i:
                  return f;
                default:
                  return y;
              }
          }
        case t:
          return y;
      }
    }
  }
  return ie.ContextConsumer = i, ie.ContextProvider = s, ie.Element = e, ie.ForwardRef = a, ie.Fragment = n, ie.Lazy = h, ie.Memo = m, ie.Portal = t, ie.Profiler = o, ie.StrictMode = r, ie.Suspense = u, ie.SuspenseList = d, ie.isContextConsumer = function(f) {
    return g(f) === i;
  }, ie.isContextProvider = function(f) {
    return g(f) === s;
  }, ie.isElement = function(f) {
    return typeof f == "object" && f !== null && f.$$typeof === e;
  }, ie.isForwardRef = function(f) {
    return g(f) === a;
  }, ie.isFragment = function(f) {
    return g(f) === n;
  }, ie.isLazy = function(f) {
    return g(f) === h;
  }, ie.isMemo = function(f) {
    return g(f) === m;
  }, ie.isPortal = function(f) {
    return g(f) === t;
  }, ie.isProfiler = function(f) {
    return g(f) === o;
  }, ie.isStrictMode = function(f) {
    return g(f) === r;
  }, ie.isSuspense = function(f) {
    return g(f) === u;
  }, ie.isSuspenseList = function(f) {
    return g(f) === d;
  }, ie.isValidElementType = function(f) {
    return typeof f == "string" || typeof f == "function" || f === n || f === o || f === r || f === u || f === d || typeof f == "object" && f !== null && (f.$$typeof === h || f.$$typeof === m || f.$$typeof === s || f.$$typeof === i || f.$$typeof === a || f.$$typeof === b || f.getModuleId !== void 0);
  }, ie.typeOf = g, ie;
}
var se = {};
/**
 * @license React
 * react-is.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var $r;
function Ps() {
  return $r || ($r = 1, process.env.NODE_ENV !== "production" && (function() {
    function e(f) {
      if (typeof f == "object" && f !== null) {
        var y = f.$$typeof;
        switch (y) {
          case t:
            switch (f = f.type, f) {
              case r:
              case i:
              case o:
              case d:
              case m:
              case b:
                return f;
              default:
                switch (f = f && f.$$typeof, f) {
                  case a:
                  case u:
                  case v:
                  case h:
                    return f;
                  case s:
                    return f;
                  default:
                    return y;
                }
            }
          case n:
            return y;
        }
      }
    }
    var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), o = Symbol.for("react.strict_mode"), i = Symbol.for("react.profiler"), s = Symbol.for("react.consumer"), a = Symbol.for("react.context"), u = Symbol.for("react.forward_ref"), d = Symbol.for("react.suspense"), m = Symbol.for("react.suspense_list"), h = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), b = Symbol.for("react.view_transition"), g = Symbol.for("react.client.reference");
    se.ContextConsumer = s, se.ContextProvider = a, se.Element = t, se.ForwardRef = u, se.Fragment = r, se.Lazy = v, se.Memo = h, se.Portal = n, se.Profiler = i, se.StrictMode = o, se.Suspense = d, se.SuspenseList = m, se.isContextConsumer = function(f) {
      return e(f) === s;
    }, se.isContextProvider = function(f) {
      return e(f) === a;
    }, se.isElement = function(f) {
      return typeof f == "object" && f !== null && f.$$typeof === t;
    }, se.isForwardRef = function(f) {
      return e(f) === u;
    }, se.isFragment = function(f) {
      return e(f) === r;
    }, se.isLazy = function(f) {
      return e(f) === v;
    }, se.isMemo = function(f) {
      return e(f) === h;
    }, se.isPortal = function(f) {
      return e(f) === n;
    }, se.isProfiler = function(f) {
      return e(f) === i;
    }, se.isStrictMode = function(f) {
      return e(f) === o;
    }, se.isSuspense = function(f) {
      return e(f) === d;
    }, se.isSuspenseList = function(f) {
      return e(f) === m;
    }, se.isValidElementType = function(f) {
      return typeof f == "string" || typeof f == "function" || f === r || f === i || f === o || f === d || f === m || typeof f == "object" && f !== null && (f.$$typeof === v || f.$$typeof === h || f.$$typeof === a || f.$$typeof === s || f.$$typeof === u || f.$$typeof === g || f.getModuleId !== void 0);
    }, se.typeOf = e;
  })()), se;
}
var Ir;
function _s() {
  return Ir || (Ir = 1, process.env.NODE_ENV === "production" ? Ft.exports = /* @__PURE__ */ ks() : Ft.exports = /* @__PURE__ */ Ps()), Ft.exports;
}
var it = /* @__PURE__ */ _s();
function $e(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function Oo(e) {
  if (/* @__PURE__ */ N.isValidElement(e) || it.isValidElementType(e) || !$e(e))
    return e;
  const t = {};
  return Object.keys(e).forEach((n) => {
    t[n] = Oo(e[n]);
  }), t;
}
function be(e, t, n = {
  clone: !0
}) {
  const r = n.clone ? {
    ...e
  } : e;
  return $e(e) && $e(t) && Object.keys(t).forEach((o) => {
    /* @__PURE__ */ N.isValidElement(t[o]) || it.isValidElementType(t[o]) ? r[o] = t[o] : $e(t[o]) && // Avoid prototype pollution
    Object.prototype.hasOwnProperty.call(e, o) && $e(e[o]) ? r[o] = be(e[o], t[o], n) : n.clone ? r[o] = $e(t[o]) ? Oo(t[o]) : t[o] : r[o] = t[o];
  }), r;
}
const As = (e) => {
  const t = Object.keys(e).map((n) => ({
    key: n,
    val: e[n]
  })) || [];
  return t.sort((n, r) => n.val - r.val), t.reduce((n, r) => ({
    ...n,
    [r.key]: r.val
  }), {});
};
function Ns(e) {
  const {
    // The breakpoint **start** at this value.
    // For instance with the first breakpoint xs: [xs, sm).
    values: t = {
      xs: 0,
      // phone
      sm: 600,
      // tablet
      md: 900,
      // small laptop
      lg: 1200,
      // desktop
      xl: 1536
      // large screen
    },
    unit: n = "px",
    step: r = 5,
    ...o
  } = e, i = As(t), s = Object.keys(i);
  function a(v) {
    return `@media (min-width:${typeof t[v] == "number" ? t[v] : v}${n})`;
  }
  function u(v) {
    return `@media (max-width:${(typeof t[v] == "number" ? t[v] : v) - r / 100}${n})`;
  }
  function d(v, b) {
    const g = s.indexOf(b);
    return `@media (min-width:${typeof t[v] == "number" ? t[v] : v}${n}) and (max-width:${(g !== -1 && typeof t[s[g]] == "number" ? t[s[g]] : b) - r / 100}${n})`;
  }
  function m(v) {
    return s.indexOf(v) + 1 < s.length ? d(v, s[s.indexOf(v) + 1]) : a(v);
  }
  function h(v) {
    const b = s.indexOf(v);
    return b === 0 ? a(s[1]) : b === s.length - 1 ? u(s[b]) : d(v, s[s.indexOf(v) + 1]).replace("@media", "@media not all and");
  }
  return {
    keys: s,
    values: i,
    up: a,
    down: u,
    between: d,
    only: m,
    not: h,
    unit: n,
    ...o
  };
}
function Mr(e, t) {
  if (!e.containerQueries)
    return t;
  const n = Object.keys(t).filter((r) => r.startsWith("@container")).sort((r, o) => {
    var s, a;
    const i = /min-width:\s*([0-9.]+)/;
    return +(((s = r.match(i)) == null ? void 0 : s[1]) || 0) - +(((a = o.match(i)) == null ? void 0 : a[1]) || 0);
  });
  return n.length ? n.reduce((r, o) => {
    const i = t[o];
    return delete r[o], r[o] = i, r;
  }, {
    ...t
  }) : t;
}
function $s(e, t) {
  return t === "@" || t.startsWith("@") && (e.some((n) => t.startsWith(`@${n}`)) || !!t.match(/^@\d/));
}
function Is(e, t) {
  const n = t.match(/^@([^/]+)?\/?(.+)?$/);
  if (!n) {
    if (process.env.NODE_ENV !== "production")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The provided shorthand ${`(${t})`} is invalid. The format should be \`@<breakpoint | number>\` or \`@<breakpoint | number>/<container>\`.
For example, \`@sm\` or \`@600\` or \`@40rem/sidebar\`.` : De(18, `(${t})`));
    return null;
  }
  const [, r, o] = n, i = Number.isNaN(+r) ? r || 0 : +r;
  return e.containerQueries(o).up(i);
}
function Ms(e) {
  const t = (i, s) => i.replace("@media", s ? `@container ${s}` : "@container");
  function n(i, s) {
    i.up = (...a) => t(e.breakpoints.up(...a), s), i.down = (...a) => t(e.breakpoints.down(...a), s), i.between = (...a) => t(e.breakpoints.between(...a), s), i.only = (...a) => t(e.breakpoints.only(...a), s), i.not = (...a) => {
      const u = t(e.breakpoints.not(...a), s);
      return u.includes("not all and") ? u.replace("not all and ", "").replace("min-width:", "width<").replace("max-width:", "width>").replace("and", "or") : u;
    };
  }
  const r = {}, o = (i) => (n(r, i), r);
  return n(o), {
    ...e,
    containerQueries: o
  };
}
const Ds = {
  borderRadius: 4
}, Le = process.env.NODE_ENV !== "production" ? c.oneOfType([c.number, c.string, c.object, c.array]) : {};
function Tt(e, t) {
  return t ? be(e, t, {
    clone: !1
    // No need to clone deep, it's way faster.
  }) : e;
}
const on = {
  xs: 0,
  // phone
  sm: 600,
  // tablet
  md: 900,
  // small laptop
  lg: 1200,
  // desktop
  xl: 1536
  // large screen
}, Dr = {
  // Sorted ASC by size. That's important.
  // It can't be configured as it's used statically for propTypes.
  keys: ["xs", "sm", "md", "lg", "xl"],
  up: (e) => `@media (min-width:${on[e]}px)`
}, js = {
  containerQueries: (e) => ({
    up: (t) => {
      let n = typeof t == "number" ? t : on[t] || t;
      return typeof n == "number" && (n = `${n}px`), e ? `@container ${e} (min-width:${n})` : `@container (min-width:${n})`;
    }
  })
};
function Me(e, t, n) {
  const r = e.theme || {};
  if (Array.isArray(t)) {
    const i = r.breakpoints || Dr;
    return t.reduce((s, a, u) => (s[i.up(i.keys[u])] = n(t[u]), s), {});
  }
  if (typeof t == "object") {
    const i = r.breakpoints || Dr;
    return Object.keys(t).reduce((s, a) => {
      if ($s(i.keys, a)) {
        const u = Is(r.containerQueries ? r : js, a);
        u && (s[u] = n(t[a], a));
      } else if (Object.keys(i.values || on).includes(a)) {
        const u = i.up(a);
        s[u] = n(t[a], a);
      } else {
        const u = a;
        s[u] = t[u];
      }
      return s;
    }, {});
  }
  return n(t);
}
function Ls(e = {}) {
  var n;
  return ((n = e.keys) == null ? void 0 : n.reduce((r, o) => {
    const i = e.up(o);
    return r[i] = {}, r;
  }, {})) || {};
}
function jr(e, t) {
  return e.reduce((n, r) => {
    const o = n[r];
    return (!o || Object.keys(o).length === 0) && delete n[r], n;
  }, t);
}
function Jn(e) {
  if (typeof e != "string")
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `capitalize(string)` expects a string argument." : De(7));
  return e.charAt(0).toUpperCase() + e.slice(1);
}
function sn(e, t, n = !0) {
  if (!t || typeof t != "string")
    return null;
  if (e && e.vars && n) {
    const r = `vars.${t}`.split(".").reduce((o, i) => o && o[i] ? o[i] : null, e);
    if (r != null)
      return r;
  }
  return t.split(".").reduce((r, o) => r && r[o] != null ? r[o] : null, e);
}
function Gt(e, t, n, r = n) {
  let o;
  return typeof e == "function" ? o = e(n) : Array.isArray(e) ? o = e[n] || r : o = sn(e, n) || r, t && (o = t(o, r, e)), o;
}
function fe(e) {
  const {
    prop: t,
    cssProperty: n = e.prop,
    themeKey: r,
    transform: o
  } = e, i = (s) => {
    if (s[t] == null)
      return null;
    const a = s[t], u = s.theme, d = sn(u, r) || {};
    return Me(s, a, (h) => {
      let v = Gt(d, o, h);
      return h === v && typeof h == "string" && (v = Gt(d, o, `${t}${h === "default" ? "" : Jn(h)}`, h)), n === !1 ? v : {
        [n]: v
      };
    });
  };
  return i.propTypes = process.env.NODE_ENV !== "production" ? {
    [t]: Le
  } : {}, i.filterProps = [t], i;
}
function Fs(e) {
  const t = {};
  return (n) => (t[n] === void 0 && (t[n] = e(n)), t[n]);
}
const Bs = {
  m: "margin",
  p: "padding"
}, Vs = {
  t: "Top",
  r: "Right",
  b: "Bottom",
  l: "Left",
  x: ["Left", "Right"],
  y: ["Top", "Bottom"]
}, Lr = {
  marginX: "mx",
  marginY: "my",
  paddingX: "px",
  paddingY: "py"
}, Us = Fs((e) => {
  if (e.length > 2)
    if (Lr[e])
      e = Lr[e];
    else
      return [e];
  const [t, n] = e.split(""), r = Bs[t], o = Vs[n] || "";
  return Array.isArray(o) ? o.map((i) => r + i) : [r + o];
}), an = ["m", "mt", "mr", "mb", "ml", "mx", "my", "margin", "marginTop", "marginRight", "marginBottom", "marginLeft", "marginX", "marginY", "marginInline", "marginInlineStart", "marginInlineEnd", "marginBlock", "marginBlockStart", "marginBlockEnd"], cn = ["p", "pt", "pr", "pb", "pl", "px", "py", "padding", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "paddingX", "paddingY", "paddingInline", "paddingInlineStart", "paddingInlineEnd", "paddingBlock", "paddingBlockStart", "paddingBlockEnd"], Ws = [...an, ...cn];
function Pt(e, t, n, r) {
  const o = sn(e, t, !0) ?? n;
  return typeof o == "number" || typeof o == "string" ? (i) => typeof i == "string" ? i : (process.env.NODE_ENV !== "production" && typeof i != "number" && console.error(`MUI: Expected ${r} argument to be a number or a string, got ${i}.`), typeof o == "string" ? o.startsWith("var(") && i === 0 ? 0 : o.startsWith("var(") && i === 1 ? o : `calc(${i} * ${o})` : o * i) : Array.isArray(o) ? (i) => {
    if (typeof i == "string")
      return i;
    const s = Math.abs(i);
    process.env.NODE_ENV !== "production" && (Number.isInteger(s) ? s > o.length - 1 && console.error([`MUI: The value provided (${s}) overflows.`, `The supported values are: ${JSON.stringify(o)}.`, `${s} > ${o.length - 1}, you need to add the missing values.`].join(`
`)) : console.error([`MUI: The \`theme.${t}\` array type cannot be combined with non integer values.You should either use an integer value that can be used as index, or define the \`theme.${t}\` as a number.`].join(`
`)));
    const a = o[s];
    return i >= 0 ? a : typeof a == "number" ? -a : typeof a == "string" && a.startsWith("var(") ? `calc(-1 * ${a})` : `-${a}`;
  } : typeof o == "function" ? o : (process.env.NODE_ENV !== "production" && console.error([`MUI: The \`theme.${t}\` value (${o}) is invalid.`, "It should be a number, an array or a function."].join(`
`)), () => {
  });
}
function Qn(e) {
  return Pt(e, "spacing", 8, "spacing");
}
function _t(e, t) {
  return typeof t == "string" || t == null ? t : e(t);
}
function zs(e, t) {
  return (n) => e.reduce((r, o) => (r[o] = _t(t, n), r), {});
}
function Ys(e, t, n, r) {
  if (!t.includes(n))
    return null;
  const o = Us(n), i = zs(o, r), s = e[n];
  return Me(e, s, i);
}
function ko(e, t) {
  const n = Qn(e.theme);
  return Object.keys(e).map((r) => Ys(e, t, r, n)).reduce(Tt, {});
}
function ce(e) {
  return ko(e, an);
}
ce.propTypes = process.env.NODE_ENV !== "production" ? an.reduce((e, t) => (e[t] = Le, e), {}) : {};
ce.filterProps = an;
function le(e) {
  return ko(e, cn);
}
le.propTypes = process.env.NODE_ENV !== "production" ? cn.reduce((e, t) => (e[t] = Le, e), {}) : {};
le.filterProps = cn;
process.env.NODE_ENV !== "production" && Ws.reduce((e, t) => (e[t] = Le, e), {});
function Po(e = 8, t = Qn({
  spacing: e
})) {
  if (e.mui)
    return e;
  const n = (...r) => (process.env.NODE_ENV !== "production" && (r.length <= 4 || console.error(`MUI: Too many arguments provided, expected between 0 and 4, got ${r.length}`)), (r.length === 0 ? [1] : r).map((i) => {
    const s = t(i);
    return typeof s == "number" ? `${s}px` : s;
  }).join(" "));
  return n.mui = !0, n;
}
function ln(...e) {
  const t = e.reduce((r, o) => (o.filterProps.forEach((i) => {
    r[i] = o;
  }), r), {}), n = (r) => Object.keys(r).reduce((o, i) => t[i] ? Tt(o, t[i](r)) : o, {});
  return n.propTypes = process.env.NODE_ENV !== "production" ? e.reduce((r, o) => Object.assign(r, o.propTypes), {}) : {}, n.filterProps = e.reduce((r, o) => r.concat(o.filterProps), []), n;
}
function ve(e) {
  return typeof e != "number" ? e : `${e}px solid`;
}
function Te(e, t) {
  return fe({
    prop: e,
    themeKey: "borders",
    transform: t
  });
}
const Hs = Te("border", ve), qs = Te("borderTop", ve), Gs = Te("borderRight", ve), Ks = Te("borderBottom", ve), Xs = Te("borderLeft", ve), Js = Te("borderColor"), Qs = Te("borderTopColor"), Zs = Te("borderRightColor"), ea = Te("borderBottomColor"), ta = Te("borderLeftColor"), na = Te("outline", ve), ra = Te("outlineColor"), un = (e) => {
  if (e.borderRadius !== void 0 && e.borderRadius !== null) {
    const t = Pt(e.theme, "shape.borderRadius", 4, "borderRadius"), n = (r) => ({
      borderRadius: _t(t, r)
    });
    return Me(e, e.borderRadius, n);
  }
  return null;
};
un.propTypes = process.env.NODE_ENV !== "production" ? {
  borderRadius: Le
} : {};
un.filterProps = ["borderRadius"];
ln(Hs, qs, Gs, Ks, Xs, Js, Qs, Zs, ea, ta, un, na, ra);
const fn = (e) => {
  if (e.gap !== void 0 && e.gap !== null) {
    const t = Pt(e.theme, "spacing", 8, "gap"), n = (r) => ({
      gap: _t(t, r)
    });
    return Me(e, e.gap, n);
  }
  return null;
};
fn.propTypes = process.env.NODE_ENV !== "production" ? {
  gap: Le
} : {};
fn.filterProps = ["gap"];
const dn = (e) => {
  if (e.columnGap !== void 0 && e.columnGap !== null) {
    const t = Pt(e.theme, "spacing", 8, "columnGap"), n = (r) => ({
      columnGap: _t(t, r)
    });
    return Me(e, e.columnGap, n);
  }
  return null;
};
dn.propTypes = process.env.NODE_ENV !== "production" ? {
  columnGap: Le
} : {};
dn.filterProps = ["columnGap"];
const pn = (e) => {
  if (e.rowGap !== void 0 && e.rowGap !== null) {
    const t = Pt(e.theme, "spacing", 8, "rowGap"), n = (r) => ({
      rowGap: _t(t, r)
    });
    return Me(e, e.rowGap, n);
  }
  return null;
};
pn.propTypes = process.env.NODE_ENV !== "production" ? {
  rowGap: Le
} : {};
pn.filterProps = ["rowGap"];
const oa = fe({
  prop: "gridColumn"
}), ia = fe({
  prop: "gridRow"
}), sa = fe({
  prop: "gridAutoFlow"
}), aa = fe({
  prop: "gridAutoColumns"
}), ca = fe({
  prop: "gridAutoRows"
}), la = fe({
  prop: "gridTemplateColumns"
}), ua = fe({
  prop: "gridTemplateRows"
}), fa = fe({
  prop: "gridTemplateAreas"
}), da = fe({
  prop: "gridArea"
});
ln(fn, dn, pn, oa, ia, sa, aa, ca, la, ua, fa, da);
function rt(e, t) {
  return t === "grey" ? t : e;
}
const pa = fe({
  prop: "color",
  themeKey: "palette",
  transform: rt
}), ma = fe({
  prop: "bgcolor",
  cssProperty: "backgroundColor",
  themeKey: "palette",
  transform: rt
}), ha = fe({
  prop: "backgroundColor",
  themeKey: "palette",
  transform: rt
});
ln(pa, ma, ha);
function ge(e) {
  return e <= 1 && e !== 0 ? `${e * 100}%` : e;
}
const ga = fe({
  prop: "width",
  transform: ge
}), Zn = (e) => {
  if (e.maxWidth !== void 0 && e.maxWidth !== null) {
    const t = (n) => {
      var o, i, s, a, u;
      const r = ((s = (i = (o = e.theme) == null ? void 0 : o.breakpoints) == null ? void 0 : i.values) == null ? void 0 : s[n]) || on[n];
      return r ? ((u = (a = e.theme) == null ? void 0 : a.breakpoints) == null ? void 0 : u.unit) !== "px" ? {
        maxWidth: `${r}${e.theme.breakpoints.unit}`
      } : {
        maxWidth: r
      } : {
        maxWidth: ge(n)
      };
    };
    return Me(e, e.maxWidth, t);
  }
  return null;
};
Zn.filterProps = ["maxWidth"];
const ya = fe({
  prop: "minWidth",
  transform: ge
}), ba = fe({
  prop: "height",
  transform: ge
}), va = fe({
  prop: "maxHeight",
  transform: ge
}), Ea = fe({
  prop: "minHeight",
  transform: ge
});
fe({
  prop: "size",
  cssProperty: "width",
  transform: ge
});
fe({
  prop: "size",
  cssProperty: "height",
  transform: ge
});
const Ta = fe({
  prop: "boxSizing"
});
ln(ga, Zn, ya, ba, va, Ea, Ta);
const mn = {
  // borders
  border: {
    themeKey: "borders",
    transform: ve
  },
  borderTop: {
    themeKey: "borders",
    transform: ve
  },
  borderRight: {
    themeKey: "borders",
    transform: ve
  },
  borderBottom: {
    themeKey: "borders",
    transform: ve
  },
  borderLeft: {
    themeKey: "borders",
    transform: ve
  },
  borderColor: {
    themeKey: "palette"
  },
  borderTopColor: {
    themeKey: "palette"
  },
  borderRightColor: {
    themeKey: "palette"
  },
  borderBottomColor: {
    themeKey: "palette"
  },
  borderLeftColor: {
    themeKey: "palette"
  },
  outline: {
    themeKey: "borders",
    transform: ve
  },
  outlineColor: {
    themeKey: "palette"
  },
  borderRadius: {
    themeKey: "shape.borderRadius",
    style: un
  },
  // palette
  color: {
    themeKey: "palette",
    transform: rt
  },
  bgcolor: {
    themeKey: "palette",
    cssProperty: "backgroundColor",
    transform: rt
  },
  backgroundColor: {
    themeKey: "palette",
    transform: rt
  },
  // spacing
  p: {
    style: le
  },
  pt: {
    style: le
  },
  pr: {
    style: le
  },
  pb: {
    style: le
  },
  pl: {
    style: le
  },
  px: {
    style: le
  },
  py: {
    style: le
  },
  padding: {
    style: le
  },
  paddingTop: {
    style: le
  },
  paddingRight: {
    style: le
  },
  paddingBottom: {
    style: le
  },
  paddingLeft: {
    style: le
  },
  paddingX: {
    style: le
  },
  paddingY: {
    style: le
  },
  paddingInline: {
    style: le
  },
  paddingInlineStart: {
    style: le
  },
  paddingInlineEnd: {
    style: le
  },
  paddingBlock: {
    style: le
  },
  paddingBlockStart: {
    style: le
  },
  paddingBlockEnd: {
    style: le
  },
  m: {
    style: ce
  },
  mt: {
    style: ce
  },
  mr: {
    style: ce
  },
  mb: {
    style: ce
  },
  ml: {
    style: ce
  },
  mx: {
    style: ce
  },
  my: {
    style: ce
  },
  margin: {
    style: ce
  },
  marginTop: {
    style: ce
  },
  marginRight: {
    style: ce
  },
  marginBottom: {
    style: ce
  },
  marginLeft: {
    style: ce
  },
  marginX: {
    style: ce
  },
  marginY: {
    style: ce
  },
  marginInline: {
    style: ce
  },
  marginInlineStart: {
    style: ce
  },
  marginInlineEnd: {
    style: ce
  },
  marginBlock: {
    style: ce
  },
  marginBlockStart: {
    style: ce
  },
  marginBlockEnd: {
    style: ce
  },
  // display
  displayPrint: {
    cssProperty: !1,
    transform: (e) => ({
      "@media print": {
        display: e
      }
    })
  },
  display: {},
  overflow: {},
  textOverflow: {},
  visibility: {},
  whiteSpace: {},
  // flexbox
  flexBasis: {},
  flexDirection: {},
  flexWrap: {},
  justifyContent: {},
  alignItems: {},
  alignContent: {},
  order: {},
  flex: {},
  flexGrow: {},
  flexShrink: {},
  alignSelf: {},
  justifyItems: {},
  justifySelf: {},
  // grid
  gap: {
    style: fn
  },
  rowGap: {
    style: pn
  },
  columnGap: {
    style: dn
  },
  gridColumn: {},
  gridRow: {},
  gridAutoFlow: {},
  gridAutoColumns: {},
  gridAutoRows: {},
  gridTemplateColumns: {},
  gridTemplateRows: {},
  gridTemplateAreas: {},
  gridArea: {},
  // positions
  position: {},
  zIndex: {
    themeKey: "zIndex"
  },
  top: {},
  right: {},
  bottom: {},
  left: {},
  // shadows
  boxShadow: {
    themeKey: "shadows"
  },
  // sizing
  width: {
    transform: ge
  },
  maxWidth: {
    style: Zn
  },
  minWidth: {
    transform: ge
  },
  height: {
    transform: ge
  },
  maxHeight: {
    transform: ge
  },
  minHeight: {
    transform: ge
  },
  boxSizing: {},
  // typography
  font: {
    themeKey: "font"
  },
  fontFamily: {
    themeKey: "typography"
  },
  fontSize: {
    themeKey: "typography"
  },
  fontStyle: {
    themeKey: "typography"
  },
  fontWeight: {
    themeKey: "typography"
  },
  letterSpacing: {},
  textTransform: {},
  lineHeight: {},
  textAlign: {},
  typography: {
    cssProperty: !1,
    themeKey: "typography"
  }
};
function xa(...e) {
  const t = e.reduce((r, o) => r.concat(Object.keys(o)), []), n = new Set(t);
  return e.every((r) => n.size === Object.keys(r).length);
}
function Sa(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function wa() {
  function e(n, r, o, i) {
    const s = {
      [n]: r,
      theme: o
    }, a = i[n];
    if (!a)
      return {
        [n]: r
      };
    const {
      cssProperty: u = n,
      themeKey: d,
      transform: m,
      style: h
    } = a;
    if (r == null)
      return null;
    if (d === "typography" && r === "inherit")
      return {
        [n]: r
      };
    const v = sn(o, d) || {};
    return h ? h(s) : Me(s, r, (g) => {
      let f = Gt(v, m, g);
      return g === f && typeof g == "string" && (f = Gt(v, m, `${n}${g === "default" ? "" : Jn(g)}`, g)), u === !1 ? f : {
        [u]: f
      };
    });
  }
  function t(n) {
    const {
      sx: r,
      theme: o = {},
      nested: i
    } = n || {};
    if (!r)
      return null;
    const s = o.unstable_sxConfig ?? mn;
    function a(u) {
      let d = u;
      if (typeof u == "function")
        d = u(o);
      else if (typeof u != "object")
        return u;
      if (!d)
        return null;
      const m = Ls(o.breakpoints), h = Object.keys(m);
      let v = m;
      return Object.keys(d).forEach((b) => {
        const g = Sa(d[b], o);
        if (g != null)
          if (typeof g == "object")
            if (s[b])
              v = Tt(v, e(b, g, o, s));
            else {
              const f = Me({
                theme: o
              }, g, (y) => ({
                [b]: y
              }));
              xa(f, g) ? v[b] = t({
                sx: g,
                theme: o,
                nested: !0
              }) : v = Tt(v, f);
            }
          else
            v = Tt(v, e(b, g, o, s));
      }), !i && o.modularCssLayers ? {
        "@layer sx": Mr(o, jr(h, v))
      } : Mr(o, jr(h, v));
    }
    return Array.isArray(r) ? r.map(a) : a(r);
  }
  return t;
}
const st = wa();
st.filterProps = ["sx"];
function Ca(e, t) {
  var r;
  const n = this;
  if (n.vars) {
    if (!((r = n.colorSchemes) != null && r[e]) || typeof n.getColorSchemeSelector != "function")
      return {};
    let o = n.getColorSchemeSelector(e);
    return o === "&" ? t : ((o.includes("data-") || o.includes(".")) && (o = `*:where(${o.replace(/\s*&$/, "")}) &`), {
      [o]: t
    });
  }
  return n.palette.mode === e ? t : {};
}
function er(e = {}, ...t) {
  const {
    breakpoints: n = {},
    palette: r = {},
    spacing: o,
    shape: i = {},
    ...s
  } = e, a = Ns(n), u = Po(o);
  let d = be({
    breakpoints: a,
    direction: "ltr",
    components: {},
    // Inject component definitions.
    palette: {
      mode: "light",
      ...r
    },
    spacing: u,
    shape: {
      ...Ds,
      ...i
    }
  }, s);
  return d = Ms(d), d.applyStyles = Ca, d = t.reduce((m, h) => be(m, h), d), d.unstable_sxConfig = {
    ...mn,
    ...s == null ? void 0 : s.unstable_sxConfig
  }, d.unstable_sx = function(h) {
    return st({
      sx: h,
      theme: this
    });
  }, d;
}
function Ra(e) {
  return Object.keys(e).length === 0;
}
function Oa(e = null) {
  const t = N.useContext(wo);
  return !t || Ra(t) ? e : t;
}
const ka = er();
function Pa(e = ka) {
  return Oa(e);
}
const Fr = (e) => e, _a = () => {
  let e = Fr;
  return {
    configure(t) {
      e = t;
    },
    generate(t) {
      return e(t);
    },
    reset() {
      e = Fr;
    }
  };
}, Aa = _a();
function _o(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var o = e.length;
    for (t = 0; t < o; t++) e[t] && (n = _o(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Ee() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++) (e = arguments[n]) && (t = _o(e)) && (r && (r += " "), r += t);
  return r;
}
const Na = {
  active: "active",
  checked: "checked",
  completed: "completed",
  disabled: "disabled",
  error: "error",
  expanded: "expanded",
  focused: "focused",
  focusVisible: "focusVisible",
  open: "open",
  readOnly: "readOnly",
  required: "required",
  selected: "selected"
};
function Fe(e, t, n = "Mui") {
  const r = Na[t];
  return r ? `${n}-${r}` : `${Aa.generate(e)}-${t}`;
}
function ct(e, t, n = "Mui") {
  const r = {};
  return t.forEach((o) => {
    r[o] = Fe(e, o, n);
  }), r;
}
function Ao(e, t = "") {
  return e.displayName || e.name || t;
}
function Br(e, t, n) {
  const r = Ao(t);
  return e.displayName || (r !== "" ? `${n}(${r})` : n);
}
function $a(e) {
  if (e != null) {
    if (typeof e == "string")
      return e;
    if (typeof e == "function")
      return Ao(e, "Component");
    if (typeof e == "object")
      switch (e.$$typeof) {
        case it.ForwardRef:
          return Br(e, e.render, "ForwardRef");
        case it.Memo:
          return Br(e, e.type, "memo");
        default:
          return;
      }
  }
}
function No(e) {
  const {
    variants: t,
    ...n
  } = e, r = {
    variants: t,
    style: Ye(n),
    isProcessed: !0
  };
  return r.style === n || t && t.forEach((o) => {
    typeof o.style != "function" && (o.style = Ye(o.style));
  }), r;
}
const Ia = er();
function Rn(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
function ze(e, t) {
  return t && e && typeof e == "object" && e.styles && !e.styles.startsWith("@layer") && (e.styles = `@layer ${t}{${String(e.styles)}}`), e;
}
function Ma(e) {
  return e ? (t, n) => n[e] : null;
}
function Da(e, t, n) {
  e.theme = Ba(e.theme) ? n : e.theme[t] || e.theme;
}
function Ht(e, t, n) {
  const r = typeof t == "function" ? t(e) : t;
  if (Array.isArray(r))
    return r.flatMap((o) => Ht(e, o, n));
  if (Array.isArray(r == null ? void 0 : r.variants)) {
    let o;
    if (r.isProcessed)
      o = n ? ze(r.style, n) : r.style;
    else {
      const {
        variants: i,
        ...s
      } = r;
      o = n ? ze(Ye(s), n) : s;
    }
    return $o(e, r.variants, [o], n);
  }
  return r != null && r.isProcessed ? n ? ze(Ye(r.style), n) : r.style : n ? ze(Ye(r), n) : r;
}
function $o(e, t, n = [], r = void 0) {
  var i;
  let o;
  e: for (let s = 0; s < t.length; s += 1) {
    const a = t[s];
    if (typeof a.props == "function") {
      if (o ?? (o = {
        ...e,
        ...e.ownerState,
        ownerState: e.ownerState
      }), !a.props(o))
        continue;
    } else
      for (const u in a.props)
        if (e[u] !== a.props[u] && ((i = e.ownerState) == null ? void 0 : i[u]) !== a.props[u])
          continue e;
    typeof a.style == "function" ? (o ?? (o = {
      ...e,
      ...e.ownerState,
      ownerState: e.ownerState
    }), n.push(r ? ze(Ye(a.style(o)), r) : a.style(o))) : n.push(r ? ze(Ye(a.style), r) : a.style);
  }
  return n;
}
function ja(e = {}) {
  const {
    themeId: t,
    defaultTheme: n = Ia,
    rootShouldForwardProp: r = Rn,
    slotShouldForwardProp: o = Rn
  } = e;
  function i(a) {
    Da(a, t, n);
  }
  return (a, u = {}) => {
    Os(a, (O) => O.filter((_) => _ !== st));
    const {
      name: d,
      slot: m,
      skipVariantsResolver: h,
      skipSx: v,
      // TODO v6: remove `lowercaseFirstLetter()` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      overridesResolver: b = Ma(Io(m)),
      ...g
    } = u, f = d && d.startsWith("Mui") || m ? "components" : "custom", y = h !== void 0 ? h : (
      // TODO v6: remove `Root` in the next major release
      // For more details: https://github.com/mui/material-ui/pull/37908
      m && m !== "Root" && m !== "root" || !1
    ), w = v || !1;
    let P = Rn;
    m === "Root" || m === "root" ? P = r : m ? P = o : Va(a) && (P = void 0);
    const S = Rs(a, {
      shouldForwardProp: P,
      label: Fa(d, m),
      ...g
    }), T = (O) => {
      if (O.__emotion_real === O)
        return O;
      if (typeof O == "function")
        return function(j) {
          return Ht(j, O, j.theme.modularCssLayers ? f : void 0);
        };
      if ($e(O)) {
        const _ = No(O);
        return function(W) {
          return _.variants ? Ht(W, _, W.theme.modularCssLayers ? f : void 0) : W.theme.modularCssLayers ? ze(_.style, f) : _.style;
        };
      }
      return O;
    }, E = (...O) => {
      const _ = [], j = O.map(T), W = [];
      if (_.push(i), d && b && W.push(function(I) {
        var z, Q;
        const k = (Q = (z = I.theme.components) == null ? void 0 : z[d]) == null ? void 0 : Q.styleOverrides;
        if (!k)
          return null;
        const A = {};
        for (const q in k)
          A[q] = Ht(I, k[q], I.theme.modularCssLayers ? "theme" : void 0);
        return b(I, A);
      }), d && !y && W.push(function(I) {
        var A, z;
        const C = I.theme, k = (z = (A = C == null ? void 0 : C.components) == null ? void 0 : A[d]) == null ? void 0 : z.variants;
        return k ? $o(I, k, [], I.theme.modularCssLayers ? "theme" : void 0) : null;
      }), w || W.push(st), Array.isArray(j[0])) {
        const l = j.shift(), I = new Array(_.length).fill(""), C = new Array(W.length).fill("");
        let k;
        k = [...I, ...l, ...C], k.raw = [...I, ...l.raw, ...C], _.unshift(k);
      }
      const J = [..._, ...j, ...W], V = S(...J);
      return a.muiName && (V.muiName = a.muiName), process.env.NODE_ENV !== "production" && (V.displayName = La(d, m, a)), V;
    };
    return S.withConfig && (E.withConfig = S.withConfig), E;
  };
}
function La(e, t, n) {
  return e ? `${e}${Jn(t || "")}` : `Styled(${$a(n)})`;
}
function Fa(e, t) {
  let n;
  return process.env.NODE_ENV !== "production" && e && (n = `${e}-${Io(t || "Root")}`), n;
}
function Ba(e) {
  for (const t in e)
    return !1;
  return !0;
}
function Va(e) {
  return typeof e == "string" && // 96 is one less than the char code
  // for "a" so this is checking that
  // it's a lowercase character
  e.charCodeAt(0) > 96;
}
function Io(e) {
  return e && e.charAt(0).toLowerCase() + e.slice(1);
}
function Ln(e, t, n = !1) {
  const r = {
    ...t
  };
  for (const o in e)
    if (Object.prototype.hasOwnProperty.call(e, o)) {
      const i = o;
      if (i === "components" || i === "slots")
        r[i] = {
          ...e[i],
          ...r[i]
        };
      else if (i === "componentsProps" || i === "slotProps") {
        const s = e[i], a = t[i];
        if (!a)
          r[i] = s || {};
        else if (!s)
          r[i] = a;
        else {
          r[i] = {
            ...a
          };
          for (const u in s)
            if (Object.prototype.hasOwnProperty.call(s, u)) {
              const d = u;
              r[i][d] = Ln(s[d], a[d], n);
            }
        }
      } else i === "className" && n && t.className ? r.className = Ee(e == null ? void 0 : e.className, t == null ? void 0 : t.className) : i === "style" && n && t.style ? r.style = {
        ...e == null ? void 0 : e.style,
        ...t == null ? void 0 : t.style
      } : r[i] === void 0 && (r[i] = e[i]);
    }
  return r;
}
const Kt = typeof window < "u" ? N.useLayoutEffect : N.useEffect;
function Ua(e, t = Number.MIN_SAFE_INTEGER, n = Number.MAX_SAFE_INTEGER) {
  return Math.max(t, Math.min(e, n));
}
function tr(e, t = 0, n = 1) {
  return process.env.NODE_ENV !== "production" && (e < t || e > n) && console.error(`MUI: The value provided ${e} is out of range [${t}, ${n}].`), Ua(e, t, n);
}
function Wa(e) {
  e = e.slice(1);
  const t = new RegExp(`.{1,${e.length >= 6 ? 2 : 1}}`, "g");
  let n = e.match(t);
  return n && n[0].length === 1 && (n = n.map((r) => r + r)), process.env.NODE_ENV !== "production" && e.length !== e.trim().length && console.error(`MUI: The color: "${e}" is invalid. Make sure the color input doesn't contain leading/trailing space.`), n ? `rgb${n.length === 4 ? "a" : ""}(${n.map((r, o) => o < 3 ? parseInt(r, 16) : Math.round(parseInt(r, 16) / 255 * 1e3) / 1e3).join(", ")})` : "";
}
function je(e) {
  if (e.type)
    return e;
  if (e.charAt(0) === "#")
    return je(Wa(e));
  const t = e.indexOf("("), n = e.substring(0, t);
  if (!["rgb", "rgba", "hsl", "hsla", "color"].includes(n))
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: Unsupported \`${e}\` color.
The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().` : De(9, e));
  let r = e.substring(t + 1, e.length - 1), o;
  if (n === "color") {
    if (r = r.split(" "), o = r.shift(), r.length === 4 && r[3].charAt(0) === "/" && (r[3] = r[3].slice(1)), !["srgb", "display-p3", "a98-rgb", "prophoto-rgb", "rec-2020"].includes(o))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: unsupported \`${o}\` color space.
The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.` : De(10, o));
  } else
    r = r.split(",");
  return r = r.map((i) => parseFloat(i)), {
    type: n,
    values: r,
    colorSpace: o
  };
}
const za = (e) => {
  const t = je(e);
  return t.values.slice(0, 3).map((n, r) => t.type.includes("hsl") && r !== 0 ? `${n}%` : n).join(" ");
}, yt = (e, t) => {
  try {
    return za(e);
  } catch {
    return t && process.env.NODE_ENV !== "production" && console.warn(t), e;
  }
};
function hn(e) {
  const {
    type: t,
    colorSpace: n
  } = e;
  let {
    values: r
  } = e;
  return t.includes("rgb") ? r = r.map((o, i) => i < 3 ? parseInt(o, 10) : o) : t.includes("hsl") && (r[1] = `${r[1]}%`, r[2] = `${r[2]}%`), t.includes("color") ? r = `${n} ${r.join(" ")}` : r = `${r.join(", ")}`, `${t}(${r})`;
}
function Mo(e) {
  e = je(e);
  const {
    values: t
  } = e, n = t[0], r = t[1] / 100, o = t[2] / 100, i = r * Math.min(o, 1 - o), s = (d, m = (d + n / 30) % 12) => o - i * Math.max(Math.min(m - 3, 9 - m, 1), -1);
  let a = "rgb";
  const u = [Math.round(s(0) * 255), Math.round(s(8) * 255), Math.round(s(4) * 255)];
  return e.type === "hsla" && (a += "a", u.push(t[3])), hn({
    type: a,
    values: u
  });
}
function Fn(e) {
  e = je(e);
  let t = e.type === "hsl" || e.type === "hsla" ? je(Mo(e)).values : e.values;
  return t = t.map((n) => (e.type !== "color" && (n /= 255), n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)), Number((0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2]).toFixed(3));
}
function Vr(e, t) {
  const n = Fn(e), r = Fn(t);
  return (Math.max(n, r) + 0.05) / (Math.min(n, r) + 0.05);
}
function Xt(e, t) {
  return e = je(e), t = tr(t), (e.type === "rgb" || e.type === "hsl") && (e.type += "a"), e.type === "color" ? e.values[3] = `/${t}` : e.values[3] = t, hn(e);
}
function Ve(e, t, n) {
  try {
    return Xt(e, t);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function gn(e, t) {
  if (e = je(e), t = tr(t), e.type.includes("hsl"))
    e.values[2] *= 1 - t;
  else if (e.type.includes("rgb") || e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] *= 1 - t;
  return hn(e);
}
function re(e, t, n) {
  try {
    return gn(e, t);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function yn(e, t) {
  if (e = je(e), t = tr(t), e.type.includes("hsl"))
    e.values[2] += (100 - e.values[2]) * t;
  else if (e.type.includes("rgb"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (255 - e.values[n]) * t;
  else if (e.type.includes("color"))
    for (let n = 0; n < 3; n += 1)
      e.values[n] += (1 - e.values[n]) * t;
  return hn(e);
}
function oe(e, t, n) {
  try {
    return yn(e, t);
  } catch {
    return n && process.env.NODE_ENV !== "production" && console.warn(n), e;
  }
}
function Ya(e, t = 0.15) {
  return Fn(e) > 0.5 ? gn(e, t) : yn(e, t);
}
function Bt(e, t, n) {
  try {
    return Ya(e, t);
  } catch {
    return e;
  }
}
const Ha = "exact-prop: ​";
function Do(e) {
  return process.env.NODE_ENV === "production" ? e : {
    ...e,
    [Ha]: (t) => {
      const n = Object.keys(t).filter((r) => !e.hasOwnProperty(r));
      return n.length > 0 ? new Error(`The following props are not supported: ${n.map((r) => `\`${r}\``).join(", ")}. Please remove them.`) : null;
    }
  };
}
const qa = /* @__PURE__ */ N.createContext();
process.env.NODE_ENV !== "production" && (c.node, c.bool);
const Ga = () => N.useContext(qa) ?? !1, Ka = /* @__PURE__ */ N.createContext(void 0);
process.env.NODE_ENV !== "production" && (c.node, c.object);
function Xa(e) {
  const {
    theme: t,
    name: n,
    props: r
  } = e;
  if (!t || !t.components || !t.components[n])
    return r;
  const o = t.components[n];
  return o.defaultProps ? Ln(o.defaultProps, r, t.components.mergeClassNameAndStyle) : !o.styleOverrides && !o.variants ? Ln(o, r, t.components.mergeClassNameAndStyle) : r;
}
function Ja({
  props: e,
  name: t
}) {
  const n = N.useContext(Ka);
  return Xa({
    props: e,
    name: t,
    theme: {
      components: n
    }
  });
}
const Ur = {
  theme: void 0
};
function Qa(e) {
  let t, n;
  return function(o) {
    let i = t;
    return (i === void 0 || o.theme !== n) && (Ur.theme = o.theme, i = No(e(Ur)), t = i, n = o.theme), i;
  };
}
function Za(e = "") {
  function t(...r) {
    if (!r.length)
      return "";
    const o = r[0];
    return typeof o == "string" && !o.match(/(#|\(|\)|(-?(\d*\.)?\d+)(px|em|%|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc))|^(-?(\d*\.)?\d+)$|(\d+ \d+ \d+)/) ? `, var(--${e ? `${e}-` : ""}${o}${t(...r.slice(1))})` : `, ${o}`;
  }
  return (r, ...o) => `var(--${e ? `${e}-` : ""}${r}${t(...o)})`;
}
const Wr = (e, t, n, r = []) => {
  let o = e;
  t.forEach((i, s) => {
    s === t.length - 1 ? Array.isArray(o) ? o[Number(i)] = n : o && typeof o == "object" && (o[i] = n) : o && typeof o == "object" && (o[i] || (o[i] = r.includes(i) ? [] : {}), o = o[i]);
  });
}, ec = (e, t, n) => {
  function r(o, i = [], s = []) {
    Object.entries(o).forEach(([a, u]) => {
      (!n || n && !n([...i, a])) && u != null && (typeof u == "object" && Object.keys(u).length > 0 ? r(u, [...i, a], Array.isArray(u) ? [...s, a] : s) : t([...i, a], u, s));
    });
  }
  r(e);
}, tc = (e, t) => typeof t == "number" ? ["lineHeight", "fontWeight", "opacity", "zIndex"].some((r) => e.includes(r)) || e[e.length - 1].toLowerCase().includes("opacity") ? t : `${t}px` : t;
function On(e, t) {
  const {
    prefix: n,
    shouldSkipGeneratingVar: r
  } = t || {}, o = {}, i = {}, s = {};
  return ec(
    e,
    (a, u, d) => {
      if ((typeof u == "string" || typeof u == "number") && (!r || !r(a, u))) {
        const m = `--${n ? `${n}-` : ""}${a.join("-")}`, h = tc(a, u);
        Object.assign(o, {
          [m]: h
        }), Wr(i, a, `var(${m})`, d), Wr(s, a, `var(${m}, ${h})`, d);
      }
    },
    (a) => a[0] === "vars"
    // skip 'vars/*' paths
  ), {
    css: o,
    vars: i,
    varsWithDefaults: s
  };
}
function nc(e, t = {}) {
  const {
    getSelector: n = w,
    disableCssColorScheme: r,
    colorSchemeSelector: o,
    enableContrastVars: i
  } = t, {
    colorSchemes: s = {},
    components: a,
    defaultColorScheme: u = "light",
    ...d
  } = e, {
    vars: m,
    css: h,
    varsWithDefaults: v
  } = On(d, t);
  let b = v;
  const g = {}, {
    [u]: f,
    ...y
  } = s;
  if (Object.entries(y || {}).forEach(([T, E]) => {
    const {
      vars: O,
      css: _,
      varsWithDefaults: j
    } = On(E, t);
    b = be(b, j), g[T] = {
      css: _,
      vars: O
    };
  }), f) {
    const {
      css: T,
      vars: E,
      varsWithDefaults: O
    } = On(f, t);
    b = be(b, O), g[u] = {
      css: T,
      vars: E
    };
  }
  function w(T, E) {
    var _, j;
    let O = o;
    if (o === "class" && (O = ".%s"), o === "data" && (O = "[data-%s]"), o != null && o.startsWith("data-") && !o.includes("%s") && (O = `[${o}="%s"]`), T) {
      if (O === "media")
        return e.defaultColorScheme === T ? ":root" : {
          [`@media (prefers-color-scheme: ${((j = (_ = s[T]) == null ? void 0 : _.palette) == null ? void 0 : j.mode) || T})`]: {
            ":root": E
          }
        };
      if (O)
        return e.defaultColorScheme === T ? `:root, ${O.replace("%s", String(T))}` : O.replace("%s", String(T));
    }
    return ":root";
  }
  return {
    vars: b,
    generateThemeVars: () => {
      let T = {
        ...m
      };
      return Object.entries(g).forEach(([, {
        vars: E
      }]) => {
        T = be(T, E);
      }), T;
    },
    generateStyleSheets: () => {
      var W, J;
      const T = [], E = e.defaultColorScheme || "light";
      function O(V, l) {
        Object.keys(l).length && T.push(typeof V == "string" ? {
          [V]: {
            ...l
          }
        } : V);
      }
      O(n(void 0, {
        ...h
      }), h);
      const {
        [E]: _,
        ...j
      } = g;
      if (_) {
        const {
          css: V
        } = _, l = (J = (W = s[E]) == null ? void 0 : W.palette) == null ? void 0 : J.mode, I = !r && l ? {
          colorScheme: l,
          ...V
        } : {
          ...V
        };
        O(n(E, {
          ...I
        }), I);
      }
      return Object.entries(j).forEach(([V, {
        css: l
      }]) => {
        var k, A;
        const I = (A = (k = s[V]) == null ? void 0 : k.palette) == null ? void 0 : A.mode, C = !r && I ? {
          colorScheme: I,
          ...l
        } : {
          ...l
        };
        O(n(V, {
          ...C
        }), C);
      }), i && T.push({
        ":root": {
          // use double underscore to indicate that these are private variables
          "--__l-threshold": "0.7",
          "--__l": "clamp(0, (l / var(--__l-threshold) - 1) * -infinity, 1)",
          "--__a": "clamp(0.87, (l / var(--__l-threshold) - 1) * -infinity, 1)"
          // 0.87 is the default alpha value for black text.
        }
      }), T;
    }
  };
}
function rc(e) {
  return function(n) {
    return e === "media" ? (process.env.NODE_ENV !== "production" && n !== "light" && n !== "dark" && console.error(`MUI: @media (prefers-color-scheme) supports only 'light' or 'dark', but receive '${n}'.`), `@media (prefers-color-scheme: ${n})`) : e ? e.startsWith("data-") && !e.includes("%s") ? `[${e}="${n}"] &` : e === "class" ? `.${n} &` : e === "data" ? `[data-${n}] &` : `${e.replace("%s", n)} &` : "&";
  };
}
function lt(e, t, n = void 0) {
  const r = {};
  for (const o in e) {
    const i = e[o];
    let s = "", a = !0;
    for (let u = 0; u < i.length; u += 1) {
      const d = i[u];
      d && (s += (a === !0 ? "" : " ") + t(d), a = !1, n && n[d] && (s += " " + n[d]));
    }
    r[o] = s;
  }
  return r;
}
function jo() {
  return {
    // The colors used to style the text.
    text: {
      // The most important text.
      primary: "rgba(0, 0, 0, 0.87)",
      // Secondary text.
      secondary: "rgba(0, 0, 0, 0.6)",
      // Disabled text have even lower visual prominence.
      disabled: "rgba(0, 0, 0, 0.38)"
    },
    // The color used to divide different elements.
    divider: "rgba(0, 0, 0, 0.12)",
    // The background colors used to style the surfaces.
    // Consistency between these values is important.
    background: {
      paper: St.white,
      default: St.white
    },
    // The colors used to style the action elements.
    action: {
      // The color of an active action like an icon button.
      active: "rgba(0, 0, 0, 0.54)",
      // The color of an hovered action.
      hover: "rgba(0, 0, 0, 0.04)",
      hoverOpacity: 0.04,
      // The color of a selected action.
      selected: "rgba(0, 0, 0, 0.08)",
      selectedOpacity: 0.08,
      // The color of a disabled action.
      disabled: "rgba(0, 0, 0, 0.26)",
      // The background color of a disabled action.
      disabledBackground: "rgba(0, 0, 0, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(0, 0, 0, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.12
    }
  };
}
const Lo = jo();
function Fo() {
  return {
    text: {
      primary: St.white,
      secondary: "rgba(255, 255, 255, 0.7)",
      disabled: "rgba(255, 255, 255, 0.5)",
      icon: "rgba(255, 255, 255, 0.5)"
    },
    divider: "rgba(255, 255, 255, 0.12)",
    background: {
      paper: "#121212",
      default: "#121212"
    },
    action: {
      active: St.white,
      hover: "rgba(255, 255, 255, 0.08)",
      hoverOpacity: 0.08,
      selected: "rgba(255, 255, 255, 0.16)",
      selectedOpacity: 0.16,
      disabled: "rgba(255, 255, 255, 0.3)",
      disabledBackground: "rgba(255, 255, 255, 0.12)",
      disabledOpacity: 0.38,
      focus: "rgba(255, 255, 255, 0.12)",
      focusOpacity: 0.12,
      activatedOpacity: 0.24
    }
  };
}
const Bn = Fo();
function zr(e, t, n, r) {
  const o = r.light || r, i = r.dark || r * 1.5;
  e[t] || (e.hasOwnProperty(n) ? e[t] = e[n] : t === "light" ? e.light = yn(e.main, o) : t === "dark" && (e.dark = gn(e.main, i)));
}
function Yr(e, t, n, r, o) {
  const i = o.light || o, s = o.dark || o * 1.5;
  t[n] || (t.hasOwnProperty(r) ? t[n] = t[r] : n === "light" ? t.light = `color-mix(in ${e}, ${t.main}, #fff ${(i * 100).toFixed(0)}%)` : n === "dark" && (t.dark = `color-mix(in ${e}, ${t.main}, #000 ${(s * 100).toFixed(0)}%)`));
}
function oc(e = "light") {
  return e === "dark" ? {
    main: Ke[200],
    light: Ke[50],
    dark: Ke[400]
  } : {
    main: Ke[700],
    light: Ke[400],
    dark: Ke[800]
  };
}
function ic(e = "light") {
  return e === "dark" ? {
    main: Ge[200],
    light: Ge[50],
    dark: Ge[400]
  } : {
    main: Ge[500],
    light: Ge[300],
    dark: Ge[700]
  };
}
function sc(e = "light") {
  return e === "dark" ? {
    main: qe[500],
    light: qe[300],
    dark: qe[700]
  } : {
    main: qe[700],
    light: qe[400],
    dark: qe[800]
  };
}
function ac(e = "light") {
  return e === "dark" ? {
    main: Xe[400],
    light: Xe[300],
    dark: Xe[700]
  } : {
    main: Xe[700],
    light: Xe[500],
    dark: Xe[900]
  };
}
function cc(e = "light") {
  return e === "dark" ? {
    main: Je[400],
    light: Je[300],
    dark: Je[700]
  } : {
    main: Je[800],
    light: Je[500],
    dark: Je[900]
  };
}
function lc(e = "light") {
  return e === "dark" ? {
    main: mt[400],
    light: mt[300],
    dark: mt[700]
  } : {
    main: "#ed6c02",
    // closest to orange[800] that pass 3:1.
    light: mt[500],
    dark: mt[900]
  };
}
function uc(e) {
  return `oklch(from ${e} var(--__l) 0 h / var(--__a))`;
}
function nr(e) {
  const {
    mode: t = "light",
    contrastThreshold: n = 3,
    tonalOffset: r = 0.2,
    colorSpace: o,
    ...i
  } = e, s = e.primary || oc(t), a = e.secondary || ic(t), u = e.error || sc(t), d = e.info || ac(t), m = e.success || cc(t), h = e.warning || lc(t);
  function v(y) {
    if (o)
      return uc(y);
    const w = Vr(y, Bn.text.primary) >= n ? Bn.text.primary : Lo.text.primary;
    if (process.env.NODE_ENV !== "production") {
      const P = Vr(y, w);
      P < 3 && console.error([`MUI: The contrast ratio of ${P}:1 for ${w} on ${y}`, "falls below the WCAG recommended absolute minimum contrast ratio of 3:1.", "https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast"].join(`
`));
    }
    return w;
  }
  const b = ({
    color: y,
    name: w,
    mainShade: P = 500,
    lightShade: S = 300,
    darkShade: T = 700
  }) => {
    if (y = {
      ...y
    }, !y.main && y[P] && (y.main = y[P]), !y.hasOwnProperty("main"))
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${w ? ` (${w})` : ""} provided to augmentColor(color) is invalid.
The color object needs to have a \`main\` property or a \`${P}\` property.` : De(11, w ? ` (${w})` : "", P));
    if (typeof y.main != "string")
      throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The color${w ? ` (${w})` : ""} provided to augmentColor(color) is invalid.
\`color.main\` should be a string, but \`${JSON.stringify(y.main)}\` was provided instead.

Did you intend to use one of the following approaches?

import { green } from "@mui/material/colors";

const theme1 = createTheme({ palette: {
  primary: green,
} });

const theme2 = createTheme({ palette: {
  primary: { main: green[500] },
} });` : De(12, w ? ` (${w})` : "", JSON.stringify(y.main)));
    return o ? (Yr(o, y, "light", S, r), Yr(o, y, "dark", T, r)) : (zr(y, "light", S, r), zr(y, "dark", T, r)), y.contrastText || (y.contrastText = v(y.main)), y;
  };
  let g;
  return t === "light" ? g = jo() : t === "dark" && (g = Fo()), process.env.NODE_ENV !== "production" && (g || console.error(`MUI: The palette mode \`${t}\` is not supported.`)), be({
    // A collection of common colors.
    common: {
      ...St
    },
    // prevent mutable object.
    // The palette mode, can be light or dark.
    mode: t,
    // The colors used to represent primary interface elements for a user.
    primary: b({
      color: s,
      name: "primary"
    }),
    // The colors used to represent secondary interface elements for a user.
    secondary: b({
      color: a,
      name: "secondary",
      mainShade: "A400",
      lightShade: "A200",
      darkShade: "A700"
    }),
    // The colors used to represent interface elements that the user should be made aware of.
    error: b({
      color: u,
      name: "error"
    }),
    // The colors used to represent potentially dangerous actions or important messages.
    warning: b({
      color: h,
      name: "warning"
    }),
    // The colors used to present information to the user that is neutral and not necessarily important.
    info: b({
      color: d,
      name: "info"
    }),
    // The colors used to indicate the successful completion of an action that user triggered.
    success: b({
      color: m,
      name: "success"
    }),
    // The grey colors.
    grey: Si,
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: n,
    // Takes a background color and returns the text color that maximizes the contrast.
    getContrastText: v,
    // Generate a rich color object.
    augmentColor: b,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: r,
    // The light and dark mode object.
    ...g
  }, i);
}
function fc(e) {
  const t = {};
  return Object.entries(e).forEach((r) => {
    const [o, i] = r;
    typeof i == "object" && (t[o] = `${i.fontStyle ? `${i.fontStyle} ` : ""}${i.fontVariant ? `${i.fontVariant} ` : ""}${i.fontWeight ? `${i.fontWeight} ` : ""}${i.fontStretch ? `${i.fontStretch} ` : ""}${i.fontSize || ""}${i.lineHeight ? `/${i.lineHeight} ` : ""}${i.fontFamily || ""}`);
  }), t;
}
function dc(e, t) {
  return {
    toolbar: {
      minHeight: 56,
      [e.up("xs")]: {
        "@media (orientation: landscape)": {
          minHeight: 48
        }
      },
      [e.up("sm")]: {
        minHeight: 64
      }
    },
    ...t
  };
}
function pc(e) {
  return Math.round(e * 1e5) / 1e5;
}
const Hr = {
  textTransform: "uppercase"
}, qr = '"Roboto", "Helvetica", "Arial", sans-serif';
function mc(e, t) {
  const {
    fontFamily: n = qr,
    // The default font size of the Material Specification.
    fontSize: r = 14,
    // px
    fontWeightLight: o = 300,
    fontWeightRegular: i = 400,
    fontWeightMedium: s = 500,
    fontWeightBold: a = 700,
    // Tell MUI what's the font-size on the html element.
    // 16px is the default font-size used by browsers.
    htmlFontSize: u = 16,
    // Apply the CSS properties to all the variants.
    allVariants: d,
    pxToRem: m,
    ...h
  } = typeof t == "function" ? t(e) : t;
  process.env.NODE_ENV !== "production" && (typeof r != "number" && console.error("MUI: `fontSize` is required to be a number."), typeof u != "number" && console.error("MUI: `htmlFontSize` is required to be a number."));
  const v = r / 14, b = m || ((y) => `${y / u * v}rem`), g = (y, w, P, S, T) => ({
    fontFamily: n,
    fontWeight: y,
    fontSize: b(w),
    // Unitless following https://meyerweb.com/eric/thoughts/2006/02/08/unitless-line-heights/
    lineHeight: P,
    // The letter spacing was designed for the Roboto font-family. Using the same letter-spacing
    // across font-families can cause issues with the kerning.
    ...n === qr ? {
      letterSpacing: `${pc(S / w)}em`
    } : {},
    ...T,
    ...d
  }), f = {
    h1: g(o, 96, 1.167, -1.5),
    h2: g(o, 60, 1.2, -0.5),
    h3: g(i, 48, 1.167, 0),
    h4: g(i, 34, 1.235, 0.25),
    h5: g(i, 24, 1.334, 0),
    h6: g(s, 20, 1.6, 0.15),
    subtitle1: g(i, 16, 1.75, 0.15),
    subtitle2: g(s, 14, 1.57, 0.1),
    body1: g(i, 16, 1.5, 0.15),
    body2: g(i, 14, 1.43, 0.15),
    button: g(s, 14, 1.75, 0.4, Hr),
    caption: g(i, 12, 1.66, 0.4),
    overline: g(i, 12, 2.66, 1, Hr),
    // TODO v6: Remove handling of 'inherit' variant from the theme as it is already handled in Material UI's Typography component. Also, remember to remove the associated types.
    inherit: {
      fontFamily: "inherit",
      fontWeight: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit"
    }
  };
  return be({
    htmlFontSize: u,
    pxToRem: b,
    fontFamily: n,
    fontSize: r,
    fontWeightLight: o,
    fontWeightRegular: i,
    fontWeightMedium: s,
    fontWeightBold: a,
    ...f
  }, h, {
    clone: !1
    // No need to clone deep
  });
}
const hc = 0.2, gc = 0.14, yc = 0.12;
function ae(...e) {
  return [`${e[0]}px ${e[1]}px ${e[2]}px ${e[3]}px rgba(0,0,0,${hc})`, `${e[4]}px ${e[5]}px ${e[6]}px ${e[7]}px rgba(0,0,0,${gc})`, `${e[8]}px ${e[9]}px ${e[10]}px ${e[11]}px rgba(0,0,0,${yc})`].join(",");
}
const bc = ["none", ae(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0), ae(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0), ae(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0), ae(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0), ae(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0), ae(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0), ae(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1), ae(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2), ae(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2), ae(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3), ae(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3), ae(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4), ae(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4), ae(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4), ae(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5), ae(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5), ae(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5), ae(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6), ae(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6), ae(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7), ae(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7), ae(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7), ae(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8), ae(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8)], vc = {
  // This is the most common easing curve.
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  // Objects enter the screen at full velocity from off-screen and
  // slowly decelerate to a resting point.
  easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
  // Objects leave the screen at full velocity. They do not decelerate when off-screen.
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  // The sharp curve is used by objects that may return to the screen at any time.
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)"
}, Ec = {
  shortest: 150,
  shorter: 200,
  short: 250,
  // most basic recommended timing
  standard: 300,
  // this is to be used in complex animations
  complex: 375,
  // recommended when something is entering screen
  enteringScreen: 225,
  // recommended when something is leaving screen
  leavingScreen: 195
};
function Gr(e) {
  return `${Math.round(e)}ms`;
}
function Tc(e) {
  if (!e)
    return 0;
  const t = e / 36;
  return Math.min(Math.round((4 + 15 * t ** 0.25 + t / 5) * 10), 3e3);
}
function xc(e) {
  const t = {
    ...vc,
    ...e.easing
  }, n = {
    ...Ec,
    ...e.duration
  };
  return {
    getAutoHeightDuration: Tc,
    create: (o = ["all"], i = {}) => {
      const {
        duration: s = n.standard,
        easing: a = t.easeInOut,
        delay: u = 0,
        ...d
      } = i;
      if (process.env.NODE_ENV !== "production") {
        const m = (v) => typeof v == "string", h = (v) => !Number.isNaN(parseFloat(v));
        !m(o) && !Array.isArray(o) && console.error('MUI: Argument "props" must be a string or Array.'), !h(s) && !m(s) && console.error(`MUI: Argument "duration" must be a number or a string but found ${s}.`), m(a) || console.error('MUI: Argument "easing" must be a string.'), !h(u) && !m(u) && console.error('MUI: Argument "delay" must be a number or a string.'), typeof i != "object" && console.error(["MUI: Secong argument of transition.create must be an object.", "Arguments should be either `create('prop1', options)` or `create(['prop1', 'prop2'], options)`"].join(`
`)), Object.keys(d).length !== 0 && console.error(`MUI: Unrecognized argument(s) [${Object.keys(d).join(",")}].`);
      }
      return (Array.isArray(o) ? o : [o]).map((m) => `${m} ${typeof s == "string" ? s : Gr(s)} ${a} ${typeof u == "string" ? u : Gr(u)}`).join(",");
    },
    ...e,
    easing: t,
    duration: n
  };
}
const Sc = {
  mobileStepper: 1e3,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};
function wc(e) {
  return $e(e) || typeof e > "u" || typeof e == "string" || typeof e == "boolean" || typeof e == "number" || Array.isArray(e);
}
function Bo(e = {}) {
  const t = {
    ...e
  };
  function n(r) {
    const o = Object.entries(r);
    for (let i = 0; i < o.length; i++) {
      const [s, a] = o[i];
      !wc(a) || s.startsWith("unstable_") ? delete r[s] : $e(a) && (r[s] = {
        ...a
      }, n(r[s]));
    }
  }
  return n(t), `import { unstable_createBreakpoints as createBreakpoints, createTransitions } from '@mui/material/styles';

const theme = ${JSON.stringify(t, null, 2)};

theme.breakpoints = createBreakpoints(theme.breakpoints || {});
theme.transitions = createTransitions(theme.transitions || {});

export default theme;`;
}
function Kr(e) {
  return typeof e == "number" ? `${(e * 100).toFixed(0)}%` : `calc((${e}) * 100%)`;
}
const Cc = (e) => {
  if (!Number.isNaN(+e))
    return +e;
  const t = e.match(/\d*\.?\d+/g);
  if (!t)
    return 0;
  let n = 0;
  for (let r = 0; r < t.length; r += 1)
    n += +t[r];
  return n;
};
function Rc(e) {
  Object.assign(e, {
    alpha(t, n) {
      const r = this || e;
      return r.colorSpace ? `oklch(from ${t} l c h / ${typeof n == "string" ? `calc(${n})` : n})` : r.vars ? `rgba(${t.replace(/var\(--([^,\s)]+)(?:,[^)]+)?\)+/g, "var(--$1Channel)")} / ${typeof n == "string" ? `calc(${n})` : n})` : Xt(t, Cc(n));
    },
    lighten(t, n) {
      const r = this || e;
      return r.colorSpace ? `color-mix(in ${r.colorSpace}, ${t}, #fff ${Kr(n)})` : yn(t, n);
    },
    darken(t, n) {
      const r = this || e;
      return r.colorSpace ? `color-mix(in ${r.colorSpace}, ${t}, #000 ${Kr(n)})` : gn(t, n);
    }
  });
}
function Vn(e = {}, ...t) {
  const {
    breakpoints: n,
    mixins: r = {},
    spacing: o,
    palette: i = {},
    transitions: s = {},
    typography: a = {},
    shape: u,
    colorSpace: d,
    ...m
  } = e;
  if (e.vars && // The error should throw only for the root theme creation because user is not allowed to use a custom node `vars`.
  // `generateThemeVars` is the closest identifier for checking that the `options` is a result of `createTheme` with CSS variables so that user can create new theme for nested ThemeProvider.
  e.generateThemeVars === void 0)
    throw new Error(process.env.NODE_ENV !== "production" ? "MUI: `vars` is a private field used for CSS variables support.\nPlease use another name or follow the [docs](https://mui.com/material-ui/customization/css-theme-variables/usage/) to enable the feature." : De(20));
  const h = nr({
    ...i,
    colorSpace: d
  }), v = er(e);
  let b = be(v, {
    mixins: dc(v.breakpoints, r),
    palette: h,
    // Don't use [...shadows] until you've verified its transpiled code is not invoking the iterator protocol.
    shadows: bc.slice(),
    typography: mc(h, a),
    transitions: xc(s),
    zIndex: {
      ...Sc
    }
  });
  if (b = be(b, m), b = t.reduce((g, f) => be(g, f), b), process.env.NODE_ENV !== "production") {
    const g = ["active", "checked", "completed", "disabled", "error", "expanded", "focused", "focusVisible", "required", "selected"], f = (y, w) => {
      let P;
      for (P in y) {
        const S = y[P];
        if (g.includes(P) && Object.keys(S).length > 0) {
          if (process.env.NODE_ENV !== "production") {
            const T = Fe("", P);
            console.error([`MUI: The \`${w}\` component increases the CSS specificity of the \`${P}\` internal state.`, "You can not override it like this: ", JSON.stringify(y, null, 2), "", `Instead, you need to use the '&.${T}' syntax:`, JSON.stringify({
              root: {
                [`&.${T}`]: S
              }
            }, null, 2), "", "https://mui.com/r/state-classes-guide"].join(`
`));
          }
          y[P] = {};
        }
      }
    };
    Object.keys(b.components).forEach((y) => {
      const w = b.components[y].styleOverrides;
      w && y.startsWith("Mui") && f(w, y);
    });
  }
  return b.unstable_sxConfig = {
    ...mn,
    ...m == null ? void 0 : m.unstable_sxConfig
  }, b.unstable_sx = function(f) {
    return st({
      sx: f,
      theme: this
    });
  }, b.toRuntimeSource = Bo, Rc(b), b;
}
function Un(e) {
  let t;
  return e < 1 ? t = 5.11916 * e ** 2 : t = 4.5 * Math.log(e + 1) + 2, Math.round(t * 10) / 1e3;
}
const Oc = [...Array(25)].map((e, t) => {
  if (t === 0)
    return "none";
  const n = Un(t);
  return `linear-gradient(rgba(255 255 255 / ${n}), rgba(255 255 255 / ${n}))`;
});
function Vo(e) {
  return {
    inputPlaceholder: e === "dark" ? 0.5 : 0.42,
    inputUnderline: e === "dark" ? 0.7 : 0.42,
    switchTrackDisabled: e === "dark" ? 0.2 : 0.12,
    switchTrack: e === "dark" ? 0.3 : 0.38
  };
}
function Uo(e) {
  return e === "dark" ? Oc : [];
}
function kc(e) {
  const {
    palette: t = {
      mode: "light"
    },
    // need to cast to avoid module augmentation test
    opacity: n,
    overlays: r,
    colorSpace: o,
    ...i
  } = e, s = nr({
    ...t,
    colorSpace: o
  });
  return {
    palette: s,
    opacity: {
      ...Vo(s.mode),
      ...n
    },
    overlays: r || Uo(s.mode),
    ...i
  };
}
function Pc(e) {
  var t;
  return !!e[0].match(/(cssVarPrefix|colorSchemeSelector|modularCssLayers|rootSelector|typography|mixins|breakpoints|direction|transitions)/) || !!e[0].match(/sxConfig$/) || // ends with sxConfig
  e[0] === "palette" && !!((t = e[1]) != null && t.match(/(mode|contrastThreshold|tonalOffset)/));
}
const _c = (e) => [...[...Array(25)].map((t, n) => `--${e ? `${e}-` : ""}overlays-${n}`), `--${e ? `${e}-` : ""}palette-AppBar-darkBg`, `--${e ? `${e}-` : ""}palette-AppBar-darkColor`], Ac = (e) => (t, n) => {
  const r = e.rootSelector || ":root", o = e.colorSchemeSelector;
  let i = o;
  if (o === "class" && (i = ".%s"), o === "data" && (i = "[data-%s]"), o != null && o.startsWith("data-") && !o.includes("%s") && (i = `[${o}="%s"]`), e.defaultColorScheme === t) {
    if (t === "dark") {
      const s = {};
      return _c(e.cssVarPrefix).forEach((a) => {
        s[a] = n[a], delete n[a];
      }), i === "media" ? {
        [r]: n,
        "@media (prefers-color-scheme: dark)": {
          [r]: s
        }
      } : i ? {
        [i.replace("%s", t)]: s,
        [`${r}, ${i.replace("%s", t)}`]: n
      } : {
        [r]: {
          ...n,
          ...s
        }
      };
    }
    if (i && i !== "media")
      return `${r}, ${i.replace("%s", String(t))}`;
  } else if (t) {
    if (i === "media")
      return {
        [`@media (prefers-color-scheme: ${String(t)})`]: {
          [r]: n
        }
      };
    if (i)
      return i.replace("%s", String(t));
  }
  return r;
};
function Nc(e, t) {
  t.forEach((n) => {
    e[n] || (e[n] = {});
  });
}
function x(e, t, n) {
  !e[t] && n && (e[t] = n);
}
function bt(e) {
  return typeof e != "string" || !e.startsWith("hsl") ? e : Mo(e);
}
function Ne(e, t) {
  `${t}Channel` in e || (e[`${t}Channel`] = yt(bt(e[t]), `MUI: Can't create \`palette.${t}Channel\` because \`palette.${t}\` is not one of these formats: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color().
To suppress this warning, you need to explicitly provide the \`palette.${t}Channel\` as a string (in rgb format, for example "12 12 12") or undefined if you want to remove the channel token.`));
}
function $c(e) {
  return typeof e == "number" ? `${e}px` : typeof e == "string" || typeof e == "function" || Array.isArray(e) ? e : "8px";
}
const we = (e) => {
  try {
    return e();
  } catch {
  }
}, Ic = (e = "mui") => Za(e);
function kn(e, t, n, r, o) {
  if (!n)
    return;
  n = n === !0 ? {} : n;
  const i = o === "dark" ? "dark" : "light";
  if (!r) {
    t[o] = kc({
      ...n,
      palette: {
        mode: i,
        ...n == null ? void 0 : n.palette
      },
      colorSpace: e
    });
    return;
  }
  const {
    palette: s,
    ...a
  } = Vn({
    ...r,
    palette: {
      mode: i,
      ...n == null ? void 0 : n.palette
    },
    colorSpace: e
  });
  return t[o] = {
    ...n,
    palette: s,
    opacity: {
      ...Vo(i),
      ...n == null ? void 0 : n.opacity
    },
    overlays: (n == null ? void 0 : n.overlays) || Uo(i)
  }, a;
}
function Mc(e = {}, ...t) {
  const {
    colorSchemes: n = {
      light: !0
    },
    defaultColorScheme: r,
    disableCssColorScheme: o = !1,
    cssVarPrefix: i = "mui",
    nativeColor: s = !1,
    shouldSkipGeneratingVar: a = Pc,
    colorSchemeSelector: u = n.light && n.dark ? "media" : void 0,
    rootSelector: d = ":root",
    ...m
  } = e, h = Object.keys(n)[0], v = r || (n.light && h !== "light" ? "light" : h), b = Ic(i), {
    [v]: g,
    light: f,
    dark: y,
    ...w
  } = n, P = {
    ...w
  };
  let S = g;
  if ((v === "dark" && !("dark" in n) || v === "light" && !("light" in n)) && (S = !0), !S)
    throw new Error(process.env.NODE_ENV !== "production" ? `MUI: The \`colorSchemes.${v}\` option is either missing or invalid.` : De(21, v));
  let T;
  s && (T = "oklch");
  const E = kn(T, P, S, m, v);
  f && !P.light && kn(T, P, f, void 0, "light"), y && !P.dark && kn(T, P, y, void 0, "dark");
  let O = {
    defaultColorScheme: v,
    ...E,
    cssVarPrefix: i,
    colorSchemeSelector: u,
    rootSelector: d,
    getCssVar: b,
    colorSchemes: P,
    font: {
      ...fc(E.typography),
      ...E.font
    },
    spacing: $c(m.spacing)
  };
  Object.keys(O.colorSchemes).forEach((V) => {
    const l = O.colorSchemes[V].palette, I = (k) => {
      const A = k.split("-"), z = A[1], Q = A[2];
      return b(k, l[z][Q]);
    };
    l.mode === "light" && (x(l.common, "background", "#fff"), x(l.common, "onBackground", "#000")), l.mode === "dark" && (x(l.common, "background", "#000"), x(l.common, "onBackground", "#fff"));
    function C(k, A, z) {
      if (T) {
        let Q;
        return k === Ve && (Q = `transparent ${((1 - z) * 100).toFixed(0)}%`), k === re && (Q = `#000 ${(z * 100).toFixed(0)}%`), k === oe && (Q = `#fff ${(z * 100).toFixed(0)}%`), `color-mix(in ${T}, ${A}, ${Q})`;
      }
      return k(A, z);
    }
    if (Nc(l, ["Alert", "AppBar", "Avatar", "Button", "Chip", "FilledInput", "LinearProgress", "Skeleton", "Slider", "SnackbarContent", "SpeedDialAction", "StepConnector", "StepContent", "Switch", "TableCell", "Tooltip"]), l.mode === "light") {
      x(l.Alert, "errorColor", C(re, l.error.light, 0.6)), x(l.Alert, "infoColor", C(re, l.info.light, 0.6)), x(l.Alert, "successColor", C(re, l.success.light, 0.6)), x(l.Alert, "warningColor", C(re, l.warning.light, 0.6)), x(l.Alert, "errorFilledBg", I("palette-error-main")), x(l.Alert, "infoFilledBg", I("palette-info-main")), x(l.Alert, "successFilledBg", I("palette-success-main")), x(l.Alert, "warningFilledBg", I("palette-warning-main")), x(l.Alert, "errorFilledColor", we(() => l.getContrastText(l.error.main))), x(l.Alert, "infoFilledColor", we(() => l.getContrastText(l.info.main))), x(l.Alert, "successFilledColor", we(() => l.getContrastText(l.success.main))), x(l.Alert, "warningFilledColor", we(() => l.getContrastText(l.warning.main))), x(l.Alert, "errorStandardBg", C(oe, l.error.light, 0.9)), x(l.Alert, "infoStandardBg", C(oe, l.info.light, 0.9)), x(l.Alert, "successStandardBg", C(oe, l.success.light, 0.9)), x(l.Alert, "warningStandardBg", C(oe, l.warning.light, 0.9)), x(l.Alert, "errorIconColor", I("palette-error-main")), x(l.Alert, "infoIconColor", I("palette-info-main")), x(l.Alert, "successIconColor", I("palette-success-main")), x(l.Alert, "warningIconColor", I("palette-warning-main")), x(l.AppBar, "defaultBg", I("palette-grey-100")), x(l.Avatar, "defaultBg", I("palette-grey-400")), x(l.Button, "inheritContainedBg", I("palette-grey-300")), x(l.Button, "inheritContainedHoverBg", I("palette-grey-A100")), x(l.Chip, "defaultBorder", I("palette-grey-400")), x(l.Chip, "defaultAvatarColor", I("palette-grey-700")), x(l.Chip, "defaultIconColor", I("palette-grey-700")), x(l.FilledInput, "bg", "rgba(0, 0, 0, 0.06)"), x(l.FilledInput, "hoverBg", "rgba(0, 0, 0, 0.09)"), x(l.FilledInput, "disabledBg", "rgba(0, 0, 0, 0.12)"), x(l.LinearProgress, "primaryBg", C(oe, l.primary.main, 0.62)), x(l.LinearProgress, "secondaryBg", C(oe, l.secondary.main, 0.62)), x(l.LinearProgress, "errorBg", C(oe, l.error.main, 0.62)), x(l.LinearProgress, "infoBg", C(oe, l.info.main, 0.62)), x(l.LinearProgress, "successBg", C(oe, l.success.main, 0.62)), x(l.LinearProgress, "warningBg", C(oe, l.warning.main, 0.62)), x(l.Skeleton, "bg", T ? C(Ve, l.text.primary, 0.11) : `rgba(${I("palette-text-primaryChannel")} / 0.11)`), x(l.Slider, "primaryTrack", C(oe, l.primary.main, 0.62)), x(l.Slider, "secondaryTrack", C(oe, l.secondary.main, 0.62)), x(l.Slider, "errorTrack", C(oe, l.error.main, 0.62)), x(l.Slider, "infoTrack", C(oe, l.info.main, 0.62)), x(l.Slider, "successTrack", C(oe, l.success.main, 0.62)), x(l.Slider, "warningTrack", C(oe, l.warning.main, 0.62));
      const k = T ? C(re, l.background.default, 0.6825) : Bt(l.background.default, 0.8);
      x(l.SnackbarContent, "bg", k), x(l.SnackbarContent, "color", we(() => T ? Bn.text.primary : l.getContrastText(k))), x(l.SpeedDialAction, "fabHoverBg", Bt(l.background.paper, 0.15)), x(l.StepConnector, "border", I("palette-grey-400")), x(l.StepContent, "border", I("palette-grey-400")), x(l.Switch, "defaultColor", I("palette-common-white")), x(l.Switch, "defaultDisabledColor", I("palette-grey-100")), x(l.Switch, "primaryDisabledColor", C(oe, l.primary.main, 0.62)), x(l.Switch, "secondaryDisabledColor", C(oe, l.secondary.main, 0.62)), x(l.Switch, "errorDisabledColor", C(oe, l.error.main, 0.62)), x(l.Switch, "infoDisabledColor", C(oe, l.info.main, 0.62)), x(l.Switch, "successDisabledColor", C(oe, l.success.main, 0.62)), x(l.Switch, "warningDisabledColor", C(oe, l.warning.main, 0.62)), x(l.TableCell, "border", C(oe, C(Ve, l.divider, 1), 0.88)), x(l.Tooltip, "bg", C(Ve, l.grey[700], 0.92));
    }
    if (l.mode === "dark") {
      x(l.Alert, "errorColor", C(oe, l.error.light, 0.6)), x(l.Alert, "infoColor", C(oe, l.info.light, 0.6)), x(l.Alert, "successColor", C(oe, l.success.light, 0.6)), x(l.Alert, "warningColor", C(oe, l.warning.light, 0.6)), x(l.Alert, "errorFilledBg", I("palette-error-dark")), x(l.Alert, "infoFilledBg", I("palette-info-dark")), x(l.Alert, "successFilledBg", I("palette-success-dark")), x(l.Alert, "warningFilledBg", I("palette-warning-dark")), x(l.Alert, "errorFilledColor", we(() => l.getContrastText(l.error.dark))), x(l.Alert, "infoFilledColor", we(() => l.getContrastText(l.info.dark))), x(l.Alert, "successFilledColor", we(() => l.getContrastText(l.success.dark))), x(l.Alert, "warningFilledColor", we(() => l.getContrastText(l.warning.dark))), x(l.Alert, "errorStandardBg", C(re, l.error.light, 0.9)), x(l.Alert, "infoStandardBg", C(re, l.info.light, 0.9)), x(l.Alert, "successStandardBg", C(re, l.success.light, 0.9)), x(l.Alert, "warningStandardBg", C(re, l.warning.light, 0.9)), x(l.Alert, "errorIconColor", I("palette-error-main")), x(l.Alert, "infoIconColor", I("palette-info-main")), x(l.Alert, "successIconColor", I("palette-success-main")), x(l.Alert, "warningIconColor", I("palette-warning-main")), x(l.AppBar, "defaultBg", I("palette-grey-900")), x(l.AppBar, "darkBg", I("palette-background-paper")), x(l.AppBar, "darkColor", I("palette-text-primary")), x(l.Avatar, "defaultBg", I("palette-grey-600")), x(l.Button, "inheritContainedBg", I("palette-grey-800")), x(l.Button, "inheritContainedHoverBg", I("palette-grey-700")), x(l.Chip, "defaultBorder", I("palette-grey-700")), x(l.Chip, "defaultAvatarColor", I("palette-grey-300")), x(l.Chip, "defaultIconColor", I("palette-grey-300")), x(l.FilledInput, "bg", "rgba(255, 255, 255, 0.09)"), x(l.FilledInput, "hoverBg", "rgba(255, 255, 255, 0.13)"), x(l.FilledInput, "disabledBg", "rgba(255, 255, 255, 0.12)"), x(l.LinearProgress, "primaryBg", C(re, l.primary.main, 0.5)), x(l.LinearProgress, "secondaryBg", C(re, l.secondary.main, 0.5)), x(l.LinearProgress, "errorBg", C(re, l.error.main, 0.5)), x(l.LinearProgress, "infoBg", C(re, l.info.main, 0.5)), x(l.LinearProgress, "successBg", C(re, l.success.main, 0.5)), x(l.LinearProgress, "warningBg", C(re, l.warning.main, 0.5)), x(l.Skeleton, "bg", T ? C(Ve, l.text.primary, 0.13) : `rgba(${I("palette-text-primaryChannel")} / 0.13)`), x(l.Slider, "primaryTrack", C(re, l.primary.main, 0.5)), x(l.Slider, "secondaryTrack", C(re, l.secondary.main, 0.5)), x(l.Slider, "errorTrack", C(re, l.error.main, 0.5)), x(l.Slider, "infoTrack", C(re, l.info.main, 0.5)), x(l.Slider, "successTrack", C(re, l.success.main, 0.5)), x(l.Slider, "warningTrack", C(re, l.warning.main, 0.5));
      const k = T ? C(oe, l.background.default, 0.985) : Bt(l.background.default, 0.98);
      x(l.SnackbarContent, "bg", k), x(l.SnackbarContent, "color", we(() => T ? Lo.text.primary : l.getContrastText(k))), x(l.SpeedDialAction, "fabHoverBg", Bt(l.background.paper, 0.15)), x(l.StepConnector, "border", I("palette-grey-600")), x(l.StepContent, "border", I("palette-grey-600")), x(l.Switch, "defaultColor", I("palette-grey-300")), x(l.Switch, "defaultDisabledColor", I("palette-grey-600")), x(l.Switch, "primaryDisabledColor", C(re, l.primary.main, 0.55)), x(l.Switch, "secondaryDisabledColor", C(re, l.secondary.main, 0.55)), x(l.Switch, "errorDisabledColor", C(re, l.error.main, 0.55)), x(l.Switch, "infoDisabledColor", C(re, l.info.main, 0.55)), x(l.Switch, "successDisabledColor", C(re, l.success.main, 0.55)), x(l.Switch, "warningDisabledColor", C(re, l.warning.main, 0.55)), x(l.TableCell, "border", C(re, C(Ve, l.divider, 1), 0.68)), x(l.Tooltip, "bg", C(Ve, l.grey[700], 0.92));
    }
    Ne(l.background, "default"), Ne(l.background, "paper"), Ne(l.common, "background"), Ne(l.common, "onBackground"), Ne(l, "divider"), Object.keys(l).forEach((k) => {
      const A = l[k];
      k !== "tonalOffset" && A && typeof A == "object" && (A.main && x(l[k], "mainChannel", yt(bt(A.main))), A.light && x(l[k], "lightChannel", yt(bt(A.light))), A.dark && x(l[k], "darkChannel", yt(bt(A.dark))), A.contrastText && x(l[k], "contrastTextChannel", yt(bt(A.contrastText))), k === "text" && (Ne(l[k], "primary"), Ne(l[k], "secondary")), k === "action" && (A.active && Ne(l[k], "active"), A.selected && Ne(l[k], "selected")));
    });
  }), O = t.reduce((V, l) => be(V, l), O);
  const _ = {
    prefix: i,
    disableCssColorScheme: o,
    shouldSkipGeneratingVar: a,
    getSelector: Ac(O),
    enableContrastVars: s
  }, {
    vars: j,
    generateThemeVars: W,
    generateStyleSheets: J
  } = nc(O, _);
  return O.vars = j, Object.entries(O.colorSchemes[O.defaultColorScheme]).forEach(([V, l]) => {
    O[V] = l;
  }), O.generateThemeVars = W, O.generateStyleSheets = J, O.generateSpacing = function() {
    return Po(m.spacing, Qn(this));
  }, O.getColorSchemeSelector = rc(u), O.spacing = O.generateSpacing(), O.shouldSkipGeneratingVar = a, O.unstable_sxConfig = {
    ...mn,
    ...m == null ? void 0 : m.unstable_sxConfig
  }, O.unstable_sx = function(l) {
    return st({
      sx: l,
      theme: this
    });
  }, O.toRuntimeSource = Bo, O;
}
function Xr(e, t, n) {
  e.colorSchemes && n && (e.colorSchemes[t] = {
    ...n !== !0 && n,
    palette: nr({
      ...n === !0 ? {} : n.palette,
      mode: t
    })
    // cast type to skip module augmentation test
  });
}
function Dc(e = {}, ...t) {
  const {
    palette: n,
    cssVariables: r = !1,
    colorSchemes: o = n ? void 0 : {
      light: !0
    },
    defaultColorScheme: i = n == null ? void 0 : n.mode,
    ...s
  } = e, a = i || "light", u = o == null ? void 0 : o[a], d = {
    ...o,
    ...n ? {
      [a]: {
        ...typeof u != "boolean" && u,
        palette: n
      }
    } : void 0
  };
  if (r === !1) {
    if (!("colorSchemes" in e))
      return Vn(e, ...t);
    let m = n;
    "palette" in e || d[a] && (d[a] !== !0 ? m = d[a].palette : a === "dark" && (m = {
      mode: "dark"
    }));
    const h = Vn({
      ...e,
      palette: m
    }, ...t);
    return h.defaultColorScheme = a, h.colorSchemes = d, h.palette.mode === "light" && (h.colorSchemes.light = {
      ...d.light !== !0 && d.light,
      palette: h.palette
    }, Xr(h, "dark", d.dark)), h.palette.mode === "dark" && (h.colorSchemes.dark = {
      ...d.dark !== !0 && d.dark,
      palette: h.palette
    }, Xr(h, "light", d.light)), h;
  }
  return !n && !("light" in d) && a === "light" && (d.light = !0), Mc({
    ...s,
    colorSchemes: d,
    defaultColorScheme: a,
    ...typeof r != "boolean" && r
  }, ...t);
}
const Wo = Dc();
function rr() {
  const e = Pa(Wo);
  return process.env.NODE_ENV !== "production" && N.useDebugValue(e), e[uo] || e;
}
function jc(e) {
  return e !== "ownerState" && e !== "theme" && e !== "sx" && e !== "as";
}
const zo = (e) => jc(e) && e !== "classes", Pe = ja({
  themeId: uo,
  defaultTheme: Wo,
  rootShouldForwardProp: zo
});
function Jr(...e) {
  return e.reduce((t, n) => n == null ? t : function(...o) {
    t.apply(this, o), n.apply(this, o);
  }, () => {
  });
}
const Yo = Qa;
process.env.NODE_ENV !== "production" && (c.node, c.object.isRequired);
function ut(e) {
  return Ja(e);
}
function Lc(e, t = 166) {
  let n;
  function r(...o) {
    const i = () => {
      e.apply(this, o);
    };
    clearTimeout(n), n = setTimeout(i, t);
  }
  return r.clear = () => {
    clearTimeout(n);
  }, r;
}
function ke(e) {
  return e && e.ownerDocument || document;
}
function He(e) {
  return ke(e).defaultView || window;
}
function Qr(e, t) {
  typeof e == "function" ? e(t) : e && (e.current = t);
}
function Zr(e) {
  const t = N.useRef(e);
  return Kt(() => {
    t.current = e;
  }), N.useRef((...n) => (
    // @ts-expect-error hide `this`
    (0, t.current)(...n)
  )).current;
}
function Be(...e) {
  const t = N.useRef(void 0), n = N.useCallback((r) => {
    const o = e.map((i) => {
      if (i == null)
        return null;
      if (typeof i == "function") {
        const s = i, a = s(r);
        return typeof a == "function" ? a : () => {
          s(null);
        };
      }
      return i.current = r, () => {
        i.current = null;
      };
    });
    return () => {
      o.forEach((i) => i == null ? void 0 : i());
    };
  }, e);
  return N.useMemo(() => e.every((r) => r == null) ? null : (r) => {
    t.current && (t.current(), t.current = void 0), r != null && (t.current = n(r));
  }, e);
}
function Fc(e, t) {
  const n = e.charCodeAt(2);
  return e[0] === "o" && e[1] === "n" && n >= 65 && n <= 90 && typeof t == "function";
}
function Bc(e, t) {
  if (!e)
    return t;
  function n(s, a) {
    const u = {};
    return Object.keys(a).forEach((d) => {
      Fc(d, a[d]) && typeof s[d] == "function" && (u[d] = (...m) => {
        s[d](...m), a[d](...m);
      });
    }), u;
  }
  if (typeof e == "function" || typeof t == "function")
    return (s) => {
      const a = typeof t == "function" ? t(s) : t, u = typeof e == "function" ? e({
        ...s,
        ...a
      }) : e, d = Ee(s == null ? void 0 : s.className, a == null ? void 0 : a.className, u == null ? void 0 : u.className), m = n(u, a);
      return {
        ...a,
        ...u,
        ...m,
        ...!!d && {
          className: d
        },
        ...(a == null ? void 0 : a.style) && (u == null ? void 0 : u.style) && {
          style: {
            ...a.style,
            ...u.style
          }
        },
        ...(a == null ? void 0 : a.sx) && (u == null ? void 0 : u.sx) && {
          sx: [...Array.isArray(a.sx) ? a.sx : [a.sx], ...Array.isArray(u.sx) ? u.sx : [u.sx]]
        }
      };
    };
  const r = t, o = n(e, r), i = Ee(r == null ? void 0 : r.className, e == null ? void 0 : e.className);
  return {
    ...t,
    ...e,
    ...o,
    ...!!i && {
      className: i
    },
    ...(r == null ? void 0 : r.style) && (e == null ? void 0 : e.style) && {
      style: {
        ...r.style,
        ...e.style
      }
    },
    ...(r == null ? void 0 : r.sx) && (e == null ? void 0 : e.sx) && {
      sx: [...Array.isArray(r.sx) ? r.sx : [r.sx], ...Array.isArray(e.sx) ? e.sx : [e.sx]]
    }
  };
}
function At(e, t) {
  return process.env.NODE_ENV === "production" ? () => null : function(...r) {
    return e(...r) || t(...r);
  };
}
function Vc(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e) if ({}.hasOwnProperty.call(e, r)) {
    if (t.indexOf(r) !== -1) continue;
    n[r] = e[r];
  }
  return n;
}
function Wn(e, t) {
  return Wn = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(n, r) {
    return n.__proto__ = r, n;
  }, Wn(e, t);
}
function Uc(e, t) {
  e.prototype = Object.create(t.prototype), e.prototype.constructor = e, Wn(e, t);
}
const eo = {
  disabled: !1
};
var Wc = process.env.NODE_ENV !== "production" ? c.oneOfType([c.number, c.shape({
  enter: c.number,
  exit: c.number,
  appear: c.number
}).isRequired]) : null;
process.env.NODE_ENV !== "production" && c.oneOfType([c.string, c.shape({
  enter: c.string,
  exit: c.string,
  active: c.string
}), c.shape({
  enter: c.string,
  enterDone: c.string,
  enterActive: c.string,
  exit: c.string,
  exitDone: c.string,
  exitActive: c.string
})]);
const Ho = tt.createContext(null);
var zc = function(t) {
  return t.scrollTop;
}, vt = "unmounted", Ue = "exited", We = "entering", et = "entered", zn = "exiting", _e = /* @__PURE__ */ (function(e) {
  Uc(t, e);
  function t(r, o) {
    var i;
    i = e.call(this, r, o) || this;
    var s = o, a = s && !s.isMounting ? r.enter : r.appear, u;
    return i.appearStatus = null, r.in ? a ? (u = Ue, i.appearStatus = We) : u = et : r.unmountOnExit || r.mountOnEnter ? u = vt : u = Ue, i.state = {
      status: u
    }, i.nextCallback = null, i;
  }
  t.getDerivedStateFromProps = function(o, i) {
    var s = o.in;
    return s && i.status === vt ? {
      status: Ue
    } : null;
  };
  var n = t.prototype;
  return n.componentDidMount = function() {
    this.updateStatus(!0, this.appearStatus);
  }, n.componentDidUpdate = function(o) {
    var i = null;
    if (o !== this.props) {
      var s = this.state.status;
      this.props.in ? s !== We && s !== et && (i = We) : (s === We || s === et) && (i = zn);
    }
    this.updateStatus(!1, i);
  }, n.componentWillUnmount = function() {
    this.cancelNextCallback();
  }, n.getTimeouts = function() {
    var o = this.props.timeout, i, s, a;
    return i = s = a = o, o != null && typeof o != "number" && (i = o.exit, s = o.enter, a = o.appear !== void 0 ? o.appear : s), {
      exit: i,
      enter: s,
      appear: a
    };
  }, n.updateStatus = function(o, i) {
    if (o === void 0 && (o = !1), i !== null)
      if (this.cancelNextCallback(), i === We) {
        if (this.props.unmountOnExit || this.props.mountOnEnter) {
          var s = this.props.nodeRef ? this.props.nodeRef.current : It.findDOMNode(this);
          s && zc(s);
        }
        this.performEnter(o);
      } else
        this.performExit();
    else this.props.unmountOnExit && this.state.status === Ue && this.setState({
      status: vt
    });
  }, n.performEnter = function(o) {
    var i = this, s = this.props.enter, a = this.context ? this.context.isMounting : o, u = this.props.nodeRef ? [a] : [It.findDOMNode(this), a], d = u[0], m = u[1], h = this.getTimeouts(), v = a ? h.appear : h.enter;
    if (!o && !s || eo.disabled) {
      this.safeSetState({
        status: et
      }, function() {
        i.props.onEntered(d);
      });
      return;
    }
    this.props.onEnter(d, m), this.safeSetState({
      status: We
    }, function() {
      i.props.onEntering(d, m), i.onTransitionEnd(v, function() {
        i.safeSetState({
          status: et
        }, function() {
          i.props.onEntered(d, m);
        });
      });
    });
  }, n.performExit = function() {
    var o = this, i = this.props.exit, s = this.getTimeouts(), a = this.props.nodeRef ? void 0 : It.findDOMNode(this);
    if (!i || eo.disabled) {
      this.safeSetState({
        status: Ue
      }, function() {
        o.props.onExited(a);
      });
      return;
    }
    this.props.onExit(a), this.safeSetState({
      status: zn
    }, function() {
      o.props.onExiting(a), o.onTransitionEnd(s.exit, function() {
        o.safeSetState({
          status: Ue
        }, function() {
          o.props.onExited(a);
        });
      });
    });
  }, n.cancelNextCallback = function() {
    this.nextCallback !== null && (this.nextCallback.cancel(), this.nextCallback = null);
  }, n.safeSetState = function(o, i) {
    i = this.setNextCallback(i), this.setState(o, i);
  }, n.setNextCallback = function(o) {
    var i = this, s = !0;
    return this.nextCallback = function(a) {
      s && (s = !1, i.nextCallback = null, o(a));
    }, this.nextCallback.cancel = function() {
      s = !1;
    }, this.nextCallback;
  }, n.onTransitionEnd = function(o, i) {
    this.setNextCallback(i);
    var s = this.props.nodeRef ? this.props.nodeRef.current : It.findDOMNode(this), a = o == null && !this.props.addEndListener;
    if (!s || a) {
      setTimeout(this.nextCallback, 0);
      return;
    }
    if (this.props.addEndListener) {
      var u = this.props.nodeRef ? [this.nextCallback] : [s, this.nextCallback], d = u[0], m = u[1];
      this.props.addEndListener(d, m);
    }
    o != null && setTimeout(this.nextCallback, o);
  }, n.render = function() {
    var o = this.state.status;
    if (o === vt)
      return null;
    var i = this.props, s = i.children;
    i.in, i.mountOnEnter, i.unmountOnExit, i.appear, i.enter, i.exit, i.timeout, i.addEndListener, i.onEnter, i.onEntering, i.onEntered, i.onExit, i.onExiting, i.onExited, i.nodeRef;
    var a = Vc(i, ["children", "in", "mountOnEnter", "unmountOnExit", "appear", "enter", "exit", "timeout", "addEndListener", "onEnter", "onEntering", "onEntered", "onExit", "onExiting", "onExited", "nodeRef"]);
    return (
      // allows for nested Transitions
      /* @__PURE__ */ tt.createElement(Ho.Provider, {
        value: null
      }, typeof s == "function" ? s(o, a) : tt.cloneElement(tt.Children.only(s), a))
    );
  }, t;
})(tt.Component);
_e.contextType = Ho;
_e.propTypes = process.env.NODE_ENV !== "production" ? {
  /**
   * A React reference to DOM element that need to transition:
   * https://stackoverflow.com/a/51127130/4671932
   *
   *   - When `nodeRef` prop is used, `node` is not passed to callback functions
   *      (e.g. `onEnter`) because user already has direct access to the node.
   *   - When changing `key` prop of `Transition` in a `TransitionGroup` a new
   *     `nodeRef` need to be provided to `Transition` with changed `key` prop
   *     (see
   *     [test/CSSTransition-test.js](https://github.com/reactjs/react-transition-group/blob/13435f897b3ab71f6e19d724f145596f5910581c/test/CSSTransition-test.js#L362-L437)).
   */
  nodeRef: c.shape({
    current: typeof Element > "u" ? c.any : function(e, t, n, r, o, i) {
      var s = e[t];
      return c.instanceOf(s && "ownerDocument" in s ? s.ownerDocument.defaultView.Element : Element)(e, t, n, r, o, i);
    }
  }),
  /**
   * A `function` child can be used instead of a React element. This function is
   * called with the current transition status (`'entering'`, `'entered'`,
   * `'exiting'`, `'exited'`), which can be used to apply context
   * specific props to a component.
   *
   * ```jsx
   * <Transition in={this.state.in} timeout={150}>
   *   {state => (
   *     <MyComponent className={`fade fade-${state}`} />
   *   )}
   * </Transition>
   * ```
   */
  children: c.oneOfType([c.func.isRequired, c.element.isRequired]).isRequired,
  /**
   * Show the component; triggers the enter or exit states
   */
  in: c.bool,
  /**
   * By default the child component is mounted immediately along with
   * the parent `Transition` component. If you want to "lazy mount" the component on the
   * first `in={true}` you can set `mountOnEnter`. After the first enter transition the component will stay
   * mounted, even on "exited", unless you also specify `unmountOnExit`.
   */
  mountOnEnter: c.bool,
  /**
   * By default the child component stays mounted after it reaches the `'exited'` state.
   * Set `unmountOnExit` if you'd prefer to unmount the component after it finishes exiting.
   */
  unmountOnExit: c.bool,
  /**
   * By default the child component does not perform the enter transition when
   * it first mounts, regardless of the value of `in`. If you want this
   * behavior, set both `appear` and `in` to `true`.
   *
   * > **Note**: there are no special appear states like `appearing`/`appeared`, this prop
   * > only adds an additional enter transition. However, in the
   * > `<CSSTransition>` component that first enter transition does result in
   * > additional `.appear-*` classes, that way you can choose to style it
   * > differently.
   */
  appear: c.bool,
  /**
   * Enable or disable enter transitions.
   */
  enter: c.bool,
  /**
   * Enable or disable exit transitions.
   */
  exit: c.bool,
  /**
   * The duration of the transition, in milliseconds.
   * Required unless `addEndListener` is provided.
   *
   * You may specify a single timeout for all transitions:
   *
   * ```jsx
   * timeout={500}
   * ```
   *
   * or individually:
   *
   * ```jsx
   * timeout={{
   *  appear: 500,
   *  enter: 300,
   *  exit: 500,
   * }}
   * ```
   *
   * - `appear` defaults to the value of `enter`
   * - `enter` defaults to `0`
   * - `exit` defaults to `0`
   *
   * @type {number | { enter?: number, exit?: number, appear?: number }}
   */
  timeout: function(t) {
    var n = Wc;
    t.addEndListener || (n = n.isRequired);
    for (var r = arguments.length, o = new Array(r > 1 ? r - 1 : 0), i = 1; i < r; i++)
      o[i - 1] = arguments[i];
    return n.apply(void 0, [t].concat(o));
  },
  /**
   * Add a custom transition end trigger. Called with the transitioning
   * DOM node and a `done` callback. Allows for more fine grained transition end
   * logic. Timeouts are still used as a fallback if provided.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * ```jsx
   * addEndListener={(node, done) => {
   *   // use the css transitionend event to mark the finish of a transition
   *   node.addEventListener('transitionend', done, false);
   * }}
   * ```
   */
  addEndListener: c.func,
  /**
   * Callback fired before the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEnter: c.func,
  /**
   * Callback fired after the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: c.func,
  /**
   * Callback fired after the "entered" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEntered: c.func,
  /**
   * Callback fired before the "exiting" status is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExit: c.func,
  /**
   * Callback fired after the "exiting" status is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExiting: c.func,
  /**
   * Callback fired after the "exited" status is applied.
   *
   * **Note**: when `nodeRef` prop is passed, `node` is not passed
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExited: c.func
} : {};
function Qe() {
}
_e.defaultProps = {
  in: !1,
  mountOnEnter: !1,
  unmountOnExit: !1,
  appear: !1,
  enter: !0,
  exit: !0,
  onEnter: Qe,
  onEntering: Qe,
  onEntered: Qe,
  onExit: Qe,
  onExiting: Qe,
  onExited: Qe
};
_e.UNMOUNTED = vt;
_e.EXITED = Ue;
_e.ENTERING = We;
_e.ENTERED = et;
_e.EXITING = zn;
const to = {};
function Yc(e, t) {
  const n = N.useRef(to);
  return n.current === to && (n.current = e(t)), n;
}
const Hc = [];
function qc(e) {
  N.useEffect(e, Hc);
}
class or {
  constructor() {
    $t(this, "currentId", null);
    $t(this, "clear", () => {
      this.currentId !== null && (clearTimeout(this.currentId), this.currentId = null);
    });
    $t(this, "disposeEffect", () => this.clear);
  }
  static create() {
    return new or();
  }
  /**
   * Executes `fn` after `delay`, clearing any previously scheduled call.
   */
  start(t, n) {
    this.clear(), this.currentId = setTimeout(() => {
      this.currentId = null, n();
    }, t);
  }
}
function Gc() {
  const e = Yc(or.create).current;
  return qc(e.disposeEffect), e;
}
function Kc(e) {
  const {
    prototype: t = {}
  } = e;
  return !!t.isReactComponent;
}
function Xc(e, t, n, r, o) {
  const i = e[t], s = o || t;
  if (i == null || // When server-side rendering React doesn't warn either.
  // This is not an accurate check for SSR.
  // This is only in place for emotion compat.
  // TODO: Revisit once https://github.com/facebook/react/issues/20047 is resolved.
  typeof window > "u")
    return null;
  let a;
  return typeof i == "function" && !Kc(i) && (a = "Did you accidentally provide a plain function component instead?"), a !== void 0 ? new Error(`Invalid ${r} \`${s}\` supplied to \`${n}\`. Expected an element type that can hold a ref. ${a} For more information see https://mui.com/r/caveat-with-refs-guide`) : null;
}
const Jc = At(c.elementType, Xc), qo = (e) => e.scrollTop;
function Jt(e, t) {
  const {
    timeout: n,
    easing: r,
    style: o = {}
  } = e;
  return {
    duration: o.transitionDuration ?? (typeof n == "number" ? n : n[t.mode] || 0),
    easing: o.transitionTimingFunction ?? (typeof r == "object" ? r[t.mode] : r),
    delay: o.transitionDelay
  };
}
function Qc(e) {
  const t = typeof e;
  switch (t) {
    case "number":
      return Number.isNaN(e) ? "NaN" : Number.isFinite(e) ? e !== Math.floor(e) ? "float" : "number" : "Infinity";
    case "object":
      return e === null ? "null" : e.constructor.name;
    default:
      return t;
  }
}
function Go(e, t, n, r) {
  const o = e[t];
  if (o == null || !Number.isInteger(o)) {
    const i = Qc(o);
    return new RangeError(`Invalid ${r} \`${t}\` of type \`${i}\` supplied to \`${n}\`, expected \`integer\`.`);
  }
  return null;
}
function Ko(e, t, n, r) {
  return e[t] === void 0 ? null : Go(e, t, n, r);
}
function Yn() {
  return null;
}
Ko.isRequired = Go;
Yn.isRequired = Yn;
const Xo = process.env.NODE_ENV === "production" ? Yn : Ko;
function Zc(e) {
  return Fe("MuiPaper", e);
}
ct("MuiPaper", ["root", "rounded", "outlined", "elevation", "elevation0", "elevation1", "elevation2", "elevation3", "elevation4", "elevation5", "elevation6", "elevation7", "elevation8", "elevation9", "elevation10", "elevation11", "elevation12", "elevation13", "elevation14", "elevation15", "elevation16", "elevation17", "elevation18", "elevation19", "elevation20", "elevation21", "elevation22", "elevation23", "elevation24"]);
const el = (e) => {
  const {
    square: t,
    elevation: n,
    variant: r,
    classes: o
  } = e, i = {
    root: ["root", r, !t && "rounded", r === "elevation" && `elevation${n}`]
  };
  return lt(i, Zc, o);
}, tl = Pe("div", {
  name: "MuiPaper",
  slot: "Root",
  overridesResolver: (e, t) => {
    const {
      ownerState: n
    } = e;
    return [t.root, t[n.variant], !n.square && t.rounded, n.variant === "elevation" && t[`elevation${n.elevation}`]];
  }
})(Yo(({
  theme: e
}) => ({
  backgroundColor: (e.vars || e).palette.background.paper,
  color: (e.vars || e).palette.text.primary,
  transition: e.transitions.create("box-shadow"),
  variants: [{
    props: ({
      ownerState: t
    }) => !t.square,
    style: {
      borderRadius: e.shape.borderRadius
    }
  }, {
    props: {
      variant: "outlined"
    },
    style: {
      border: `1px solid ${(e.vars || e).palette.divider}`
    }
  }, {
    props: {
      variant: "elevation"
    },
    style: {
      boxShadow: "var(--Paper-shadow)",
      backgroundImage: "var(--Paper-overlay)"
    }
  }]
}))), Jo = /* @__PURE__ */ N.forwardRef(function(t, n) {
  var b;
  const r = ut({
    props: t,
    name: "MuiPaper"
  }), o = rr(), {
    className: i,
    component: s = "div",
    elevation: a = 1,
    square: u = !1,
    variant: d = "elevation",
    ...m
  } = r, h = {
    ...r,
    component: s,
    elevation: a,
    square: u,
    variant: d
  }, v = el(h);
  return process.env.NODE_ENV !== "production" && o.shadows[a] === void 0 && console.error([`MUI: The elevation provided <Paper elevation={${a}}> is not available in the theme.`, `Please make sure that \`theme.shadows[${a}]\` is defined.`].join(`
`)), /* @__PURE__ */ B.jsx(tl, {
    as: s,
    ownerState: h,
    className: Ee(v.root, i),
    ref: n,
    ...m,
    style: {
      ...d === "elevation" && {
        "--Paper-shadow": (o.vars || o).shadows[a],
        ...o.vars && {
          "--Paper-overlay": (b = o.vars.overlays) == null ? void 0 : b[a]
        },
        ...!o.vars && o.palette.mode === "dark" && {
          "--Paper-overlay": `linear-gradient(${Xt("#fff", Un(a))}, ${Xt("#fff", Un(a))})`
        }
      },
      ...m.style
    }
  });
});
process.env.NODE_ENV !== "production" && (Jo.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: c.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: c.object,
  /**
   * @ignore
   */
  className: c.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: c.elementType,
  /**
   * Shadow depth, corresponds to `dp` in the spec.
   * It accepts values between 0 and 24 inclusive.
   * @default 1
   */
  elevation: At(Xo, (e) => {
    const {
      elevation: t,
      variant: n
    } = e;
    return t > 0 && n === "outlined" ? new Error(`MUI: Combining \`elevation={${t}}\` with \`variant="${n}"\` has no effect. Either use \`elevation={0}\` or use a different \`variant\`.`) : null;
  }),
  /**
   * If `true`, rounded corners are disabled.
   * @default false
   */
  square: c.bool,
  /**
   * @ignore
   */
  style: c.object,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: c.oneOfType([c.arrayOf(c.oneOfType([c.func, c.object, c.bool])), c.func, c.object]),
  /**
   * The variant to use.
   * @default 'elevation'
   */
  variant: c.oneOfType([c.oneOf(["elevation", "outlined"]), c.string])
});
function nl(e) {
  return typeof e == "string";
}
function Qo(e, t, n) {
  return e === void 0 || nl(e) ? t : {
    ...t,
    ownerState: {
      ...t.ownerState,
      ...n
    }
  };
}
function Zo(e, t, n) {
  return typeof e == "function" ? e(t, n) : e;
}
function ei(e, t = []) {
  if (e === void 0)
    return {};
  const n = {};
  return Object.keys(e).filter((r) => r.match(/^on[A-Z]/) && typeof e[r] == "function" && !t.includes(r)).forEach((r) => {
    n[r] = e[r];
  }), n;
}
function no(e) {
  if (e === void 0)
    return {};
  const t = {};
  return Object.keys(e).filter((n) => !(n.match(/^on[A-Z]/) && typeof e[n] == "function")).forEach((n) => {
    t[n] = e[n];
  }), t;
}
function ti(e) {
  const {
    getSlotProps: t,
    additionalProps: n,
    externalSlotProps: r,
    externalForwardedProps: o,
    className: i
  } = e;
  if (!t) {
    const b = Ee(n == null ? void 0 : n.className, i, o == null ? void 0 : o.className, r == null ? void 0 : r.className), g = {
      ...n == null ? void 0 : n.style,
      ...o == null ? void 0 : o.style,
      ...r == null ? void 0 : r.style
    }, f = {
      ...n,
      ...o,
      ...r
    };
    return b.length > 0 && (f.className = b), Object.keys(g).length > 0 && (f.style = g), {
      props: f,
      internalRef: void 0
    };
  }
  const s = ei({
    ...o,
    ...r
  }), a = no(r), u = no(o), d = t(s), m = Ee(d == null ? void 0 : d.className, n == null ? void 0 : n.className, i, o == null ? void 0 : o.className, r == null ? void 0 : r.className), h = {
    ...d == null ? void 0 : d.style,
    ...n == null ? void 0 : n.style,
    ...o == null ? void 0 : o.style,
    ...r == null ? void 0 : r.style
  }, v = {
    ...d,
    ...n,
    ...u,
    ...a
  };
  return m.length > 0 && (v.className = m), Object.keys(h).length > 0 && (v.style = h), {
    props: v,
    internalRef: d.ref
  };
}
function Ie(e, t) {
  const {
    className: n,
    elementType: r,
    ownerState: o,
    externalForwardedProps: i,
    internalForwardedProps: s,
    shouldForwardComponentProp: a = !1,
    ...u
  } = t, {
    component: d,
    slots: m = {
      [e]: void 0
    },
    slotProps: h = {
      [e]: void 0
    },
    ...v
  } = i, b = m[e] || r, g = Zo(h[e], o), {
    props: {
      component: f,
      ...y
    },
    internalRef: w
  } = ti({
    className: n,
    ...u,
    externalForwardedProps: e === "root" ? v : void 0,
    externalSlotProps: g
  }), P = Be(w, g == null ? void 0 : g.ref, t.ref), S = e === "root" ? f || d : f, T = Qo(b, {
    ...e === "root" && !d && !m[e] && s,
    ...e !== "root" && !m[e] && s,
    ...y,
    ...S && !a && {
      as: S
    },
    ...S && a && {
      component: S
    },
    ref: P
  }, o);
  return [b, T];
}
const rl = c.oneOfType([c.func, c.object]);
function Ot(e, t, n, r, o) {
  if (process.env.NODE_ENV === "production")
    return null;
  const i = e[t], s = o || t;
  return i == null ? null : i && i.nodeType !== 1 ? new Error(`Invalid ${r} \`${s}\` supplied to \`${n}\`. Expected an HTMLElement.`) : null;
}
function ol(e) {
  var h;
  const {
    elementType: t,
    externalSlotProps: n,
    ownerState: r,
    skipResolvingSlotProps: o = !1,
    ...i
  } = e, s = o ? {} : Zo(n, r), {
    props: a,
    internalRef: u
  } = ti({
    ...i,
    externalSlotProps: s
  }), d = Be(u, s == null ? void 0 : s.ref, (h = e.additionalProps) == null ? void 0 : h.ref);
  return Qo(t, {
    ...a,
    ref: d
  }, r);
}
function bn(e) {
  var t;
  return parseInt(N.version, 10) >= 19 ? ((t = e == null ? void 0 : e.props) == null ? void 0 : t.ref) || null : (e == null ? void 0 : e.ref) || null;
}
function il(e) {
  return typeof e == "function" ? e() : e;
}
const Qt = /* @__PURE__ */ N.forwardRef(function(t, n) {
  const {
    children: r,
    container: o,
    disablePortal: i = !1
  } = t, [s, a] = N.useState(null), u = Be(/* @__PURE__ */ N.isValidElement(r) ? bn(r) : null, n);
  if (Kt(() => {
    i || a(il(o) || document.body);
  }, [o, i]), Kt(() => {
    if (s && !i)
      return Qr(n, s), () => {
        Qr(n, null);
      };
  }, [n, s, i]), i) {
    if (/* @__PURE__ */ N.isValidElement(r)) {
      const d = {
        ref: u
      };
      return /* @__PURE__ */ N.cloneElement(r, d);
    }
    return r;
  }
  return s && /* @__PURE__ */ bi.createPortal(r, s);
});
process.env.NODE_ENV !== "production" && (Qt.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The children to render into the `container`.
   */
  children: c.node,
  /**
   * An HTML element or function that returns one.
   * The `container` will have the portal children appended to it.
   *
   * You can also provide a callback, which is called in a React layout effect.
   * This lets you set the container from a ref, and also makes server-side rendering possible.
   *
   * By default, it uses the body of the top-level document object,
   * so it's simply `document.body` most of the time.
   */
  container: c.oneOfType([Ot, c.func]),
  /**
   * The `children` will be under the DOM hierarchy of the parent component.
   * @default false
   */
  disablePortal: c.bool
});
process.env.NODE_ENV !== "production" && (Qt.propTypes = Do(Qt.propTypes));
function sl(e) {
  return typeof e == "string";
}
function al(e) {
  const {
    prototype: t = {}
  } = e;
  return !!t.isReactComponent;
}
function ni(e, t, n, r, o) {
  const i = e[t], s = o || t;
  if (i == null || // When server-side rendering React doesn't warn either.
  // This is not an accurate check for SSR.
  // This is only in place for Emotion compat.
  // TODO: Revisit once https://github.com/facebook/react/issues/20047 is resolved.
  typeof window > "u")
    return null;
  let a;
  const u = i.type;
  return typeof u == "function" && !al(u) && (a = "Did you accidentally use a plain function component for an element instead?"), a !== void 0 ? new Error(`Invalid ${r} \`${s}\` supplied to \`${n}\`. Expected an element that can hold a ref. ${a} For more information see https://mui.com/r/caveat-with-refs-guide`) : null;
}
const Nt = At(c.element, ni);
Nt.isRequired = At(c.element.isRequired, ni);
const cl = {
  entering: {
    opacity: 1
  },
  entered: {
    opacity: 1
  }
}, ri = /* @__PURE__ */ N.forwardRef(function(t, n) {
  const r = rr(), o = {
    enter: r.transitions.duration.enteringScreen,
    exit: r.transitions.duration.leavingScreen
  }, {
    addEndListener: i,
    appear: s = !0,
    children: a,
    easing: u,
    in: d,
    onEnter: m,
    onEntered: h,
    onEntering: v,
    onExit: b,
    onExited: g,
    onExiting: f,
    style: y,
    timeout: w = o,
    // eslint-disable-next-line react/prop-types
    TransitionComponent: P = _e,
    ...S
  } = t, T = N.useRef(null), E = Be(T, bn(a), n), O = (C) => (k) => {
    if (C) {
      const A = T.current;
      k === void 0 ? C(A) : C(A, k);
    }
  }, _ = O(v), j = O((C, k) => {
    qo(C);
    const A = Jt({
      style: y,
      timeout: w,
      easing: u
    }, {
      mode: "enter"
    });
    C.style.webkitTransition = r.transitions.create("opacity", A), C.style.transition = r.transitions.create("opacity", A), m && m(C, k);
  }), W = O(h), J = O(f), V = O((C) => {
    const k = Jt({
      style: y,
      timeout: w,
      easing: u
    }, {
      mode: "exit"
    });
    C.style.webkitTransition = r.transitions.create("opacity", k), C.style.transition = r.transitions.create("opacity", k), b && b(C);
  }), l = O(g), I = (C) => {
    i && i(T.current, C);
  };
  return /* @__PURE__ */ B.jsx(P, {
    appear: s,
    in: d,
    nodeRef: T,
    onEnter: j,
    onEntered: W,
    onEntering: _,
    onExit: V,
    onExited: l,
    onExiting: J,
    addEndListener: I,
    timeout: w,
    ...S,
    children: (C, {
      ownerState: k,
      ...A
    }) => /* @__PURE__ */ N.cloneElement(a, {
      style: {
        opacity: 0,
        visibility: C === "exited" && !d ? "hidden" : void 0,
        ...cl[C],
        ...y,
        ...a.props.style
      },
      ref: E,
      ...A
    })
  });
});
process.env.NODE_ENV !== "production" && (ri.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Add a custom transition end trigger. Called with the transitioning DOM
   * node and a done callback. Allows for more fine grained transition end
   * logic. Note: Timeouts are still used as a fallback if provided.
   */
  addEndListener: c.func,
  /**
   * Perform the enter transition when it first mounts if `in` is also `true`.
   * Set this to `false` to disable this behavior.
   * @default true
   */
  appear: c.bool,
  /**
   * A single child content element.
   */
  children: Nt.isRequired,
  /**
   * The transition timing function.
   * You may specify a single easing or a object containing enter and exit values.
   */
  easing: c.oneOfType([c.shape({
    enter: c.string,
    exit: c.string
  }), c.string]),
  /**
   * If `true`, the component will transition in.
   */
  in: c.bool,
  /**
   * @ignore
   */
  onEnter: c.func,
  /**
   * @ignore
   */
  onEntered: c.func,
  /**
   * @ignore
   */
  onEntering: c.func,
  /**
   * @ignore
   */
  onExit: c.func,
  /**
   * @ignore
   */
  onExited: c.func,
  /**
   * @ignore
   */
  onExiting: c.func,
  /**
   * @ignore
   */
  style: c.object,
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   * @default {
   *   enter: theme.transitions.duration.enteringScreen,
   *   exit: theme.transitions.duration.leavingScreen,
   * }
   */
  timeout: c.oneOfType([c.number, c.shape({
    appear: c.number,
    enter: c.number,
    exit: c.number
  })])
});
function ll(e) {
  return Fe("MuiBackdrop", e);
}
ct("MuiBackdrop", ["root", "invisible"]);
const ul = (e) => {
  const {
    classes: t,
    invisible: n
  } = e;
  return lt({
    root: ["root", n && "invisible"]
  }, ll, t);
}, fl = Pe("div", {
  name: "MuiBackdrop",
  slot: "Root",
  overridesResolver: (e, t) => {
    const {
      ownerState: n
    } = e;
    return [t.root, n.invisible && t.invisible];
  }
})({
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  WebkitTapHighlightColor: "transparent",
  variants: [{
    props: {
      invisible: !0
    },
    style: {
      backgroundColor: "transparent"
    }
  }]
}), oi = /* @__PURE__ */ N.forwardRef(function(t, n) {
  const r = ut({
    props: t,
    name: "MuiBackdrop"
  }), {
    children: o,
    className: i,
    component: s = "div",
    invisible: a = !1,
    open: u,
    components: d = {},
    componentsProps: m = {},
    slotProps: h = {},
    slots: v = {},
    TransitionComponent: b,
    transitionDuration: g,
    ...f
  } = r, y = {
    ...r,
    component: s,
    invisible: a
  }, w = ul(y), P = {
    transition: b,
    root: d.Root,
    ...v
  }, S = {
    ...m,
    ...h
  }, T = {
    component: s,
    slots: P,
    slotProps: S
  }, [E, O] = Ie("root", {
    elementType: fl,
    externalForwardedProps: T,
    className: Ee(w.root, i),
    ownerState: y
  }), [_, j] = Ie("transition", {
    elementType: ri,
    externalForwardedProps: T,
    ownerState: y
  });
  return /* @__PURE__ */ B.jsx(_, {
    in: u,
    timeout: g,
    ...f,
    ...j,
    children: /* @__PURE__ */ B.jsx(E, {
      "aria-hidden": !0,
      ...O,
      classes: w,
      ref: n,
      children: o
    })
  });
});
process.env.NODE_ENV !== "production" && (oi.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: c.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: c.object,
  /**
   * @ignore
   */
  className: c.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: c.elementType,
  /**
   * The components used for each slot inside.
   *
   * @deprecated Use the `slots` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   *
   * @default {}
   */
  components: c.shape({
    Root: c.elementType
  }),
  /**
   * The extra props for the slot components.
   * You can override the existing props or add new ones.
   *
   * @deprecated Use the `slotProps` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   *
   * @default {}
   */
  componentsProps: c.shape({
    root: c.object
  }),
  /**
   * If `true`, the backdrop is invisible.
   * It can be used when rendering a popover or a custom select component.
   * @default false
   */
  invisible: c.bool,
  /**
   * If `true`, the component is shown.
   */
  open: c.bool.isRequired,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: c.shape({
    root: c.oneOfType([c.func, c.object]),
    transition: c.oneOfType([c.func, c.object])
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: c.shape({
    root: c.elementType,
    transition: c.elementType
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: c.oneOfType([c.arrayOf(c.oneOfType([c.func, c.object, c.bool])), c.func, c.object]),
  /**
   * The component used for the transition.
   * [Follow this guide](https://mui.com/material-ui/transitions/#transitioncomponent-prop) to learn more about the requirements for this component.
   * @default Fade
   * @deprecated Use `slots.transition` instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  TransitionComponent: c.elementType,
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   */
  transitionDuration: c.oneOfType([c.number, c.shape({
    appear: c.number,
    enter: c.number,
    exit: c.number
  })])
});
function ii(e = window) {
  const t = e.document.documentElement.clientWidth;
  return e.innerWidth - t;
}
function dl(e) {
  const t = ke(e);
  return t.body === e ? He(e).innerWidth > t.documentElement.clientWidth : e.scrollHeight > e.clientHeight;
}
function xt(e, t) {
  t ? e.setAttribute("aria-hidden", "true") : e.removeAttribute("aria-hidden");
}
function ro(e) {
  return parseInt(He(e).getComputedStyle(e).paddingRight, 10) || 0;
}
function pl(e) {
  const n = ["TEMPLATE", "SCRIPT", "STYLE", "LINK", "MAP", "META", "NOSCRIPT", "PICTURE", "COL", "COLGROUP", "PARAM", "SLOT", "SOURCE", "TRACK"].includes(e.tagName), r = e.tagName === "INPUT" && e.getAttribute("type") === "hidden";
  return n || r;
}
function oo(e, t, n, r, o) {
  const i = [t, n, ...r];
  [].forEach.call(e.children, (s) => {
    const a = !i.includes(s), u = !pl(s);
    a && u && xt(s, o);
  });
}
function Pn(e, t) {
  let n = -1;
  return e.some((r, o) => t(r) ? (n = o, !0) : !1), n;
}
function ml(e, t) {
  const n = [], r = e.container;
  if (!t.disableScrollLock) {
    if (dl(r)) {
      const s = ii(He(r));
      n.push({
        value: r.style.paddingRight,
        property: "padding-right",
        el: r
      }), r.style.paddingRight = `${ro(r) + s}px`;
      const a = ke(r).querySelectorAll(".mui-fixed");
      [].forEach.call(a, (u) => {
        n.push({
          value: u.style.paddingRight,
          property: "padding-right",
          el: u
        }), u.style.paddingRight = `${ro(u) + s}px`;
      });
    }
    let i;
    if (r.parentNode instanceof DocumentFragment)
      i = ke(r).body;
    else {
      const s = r.parentElement, a = He(r);
      i = (s == null ? void 0 : s.nodeName) === "HTML" && a.getComputedStyle(s).overflowY === "scroll" ? s : r;
    }
    n.push({
      value: i.style.overflow,
      property: "overflow",
      el: i
    }, {
      value: i.style.overflowX,
      property: "overflow-x",
      el: i
    }, {
      value: i.style.overflowY,
      property: "overflow-y",
      el: i
    }), i.style.overflow = "hidden";
  }
  return () => {
    n.forEach(({
      value: i,
      el: s,
      property: a
    }) => {
      i ? s.style.setProperty(a, i) : s.style.removeProperty(a);
    });
  };
}
function hl(e) {
  const t = [];
  return [].forEach.call(e.children, (n) => {
    n.getAttribute("aria-hidden") === "true" && t.push(n);
  }), t;
}
class gl {
  constructor() {
    this.modals = [], this.containers = [];
  }
  add(t, n) {
    let r = this.modals.indexOf(t);
    if (r !== -1)
      return r;
    r = this.modals.length, this.modals.push(t), t.modalRef && xt(t.modalRef, !1);
    const o = hl(n);
    oo(n, t.mount, t.modalRef, o, !0);
    const i = Pn(this.containers, (s) => s.container === n);
    return i !== -1 ? (this.containers[i].modals.push(t), r) : (this.containers.push({
      modals: [t],
      container: n,
      restore: null,
      hiddenSiblings: o
    }), r);
  }
  mount(t, n) {
    const r = Pn(this.containers, (i) => i.modals.includes(t)), o = this.containers[r];
    o.restore || (o.restore = ml(o, n));
  }
  remove(t, n = !0) {
    const r = this.modals.indexOf(t);
    if (r === -1)
      return r;
    const o = Pn(this.containers, (s) => s.modals.includes(t)), i = this.containers[o];
    if (i.modals.splice(i.modals.indexOf(t), 1), this.modals.splice(r, 1), i.modals.length === 0)
      i.restore && i.restore(), t.modalRef && xt(t.modalRef, n), oo(i.container, t.mount, t.modalRef, i.hiddenSiblings, !1), this.containers.splice(o, 1);
    else {
      const s = i.modals[i.modals.length - 1];
      s.modalRef && xt(s.modalRef, !1);
    }
    return r;
  }
  isTopModal(t) {
    return this.modals.length > 0 && this.modals[this.modals.length - 1] === t;
  }
}
const yl = ["input", "select", "textarea", "a[href]", "button", "[tabindex]", "audio[controls]", "video[controls]", '[contenteditable]:not([contenteditable="false"])'].join(",");
function bl(e) {
  const t = parseInt(e.getAttribute("tabindex") || "", 10);
  return Number.isNaN(t) ? e.contentEditable === "true" || (e.nodeName === "AUDIO" || e.nodeName === "VIDEO" || e.nodeName === "DETAILS") && e.getAttribute("tabindex") === null ? 0 : e.tabIndex : t;
}
function vl(e) {
  if (e.tagName !== "INPUT" || e.type !== "radio" || !e.name)
    return !1;
  const t = (r) => e.ownerDocument.querySelector(`input[type="radio"]${r}`);
  let n = t(`[name="${e.name}"]:checked`);
  return n || (n = t(`[name="${e.name}"]`)), n !== e;
}
function El(e) {
  return !(e.disabled || e.tagName === "INPUT" && e.type === "hidden" || vl(e));
}
function Tl(e) {
  const t = [], n = [];
  return Array.from(e.querySelectorAll(yl)).forEach((r, o) => {
    const i = bl(r);
    i === -1 || !El(r) || (i === 0 ? t.push(r) : n.push({
      documentOrder: o,
      tabIndex: i,
      node: r
    }));
  }), n.sort((r, o) => r.tabIndex === o.tabIndex ? r.documentOrder - o.documentOrder : r.tabIndex - o.tabIndex).map((r) => r.node).concat(t);
}
function xl() {
  return !0;
}
function Zt(e) {
  const {
    children: t,
    disableAutoFocus: n = !1,
    disableEnforceFocus: r = !1,
    disableRestoreFocus: o = !1,
    getTabbable: i = Tl,
    isEnabled: s = xl,
    open: a
  } = e, u = N.useRef(!1), d = N.useRef(null), m = N.useRef(null), h = N.useRef(null), v = N.useRef(null), b = N.useRef(!1), g = N.useRef(null), f = Be(bn(t), g), y = N.useRef(null);
  N.useEffect(() => {
    !a || !g.current || (b.current = !n);
  }, [n, a]), N.useEffect(() => {
    if (!a || !g.current)
      return;
    const S = ke(g.current);
    return g.current.contains(S.activeElement) || (g.current.hasAttribute("tabIndex") || (process.env.NODE_ENV !== "production" && console.error(["MUI: The modal content node does not accept focus.", 'For the benefit of assistive technologies, the tabIndex of the node is being set to "-1".'].join(`
`)), g.current.setAttribute("tabIndex", "-1")), b.current && g.current.focus()), () => {
      o || (h.current && h.current.focus && (u.current = !0, h.current.focus()), h.current = null);
    };
  }, [a]), N.useEffect(() => {
    if (!a || !g.current)
      return;
    const S = ke(g.current), T = (_) => {
      y.current = _, !(r || !s() || _.key !== "Tab") && S.activeElement === g.current && _.shiftKey && (u.current = !0, m.current && m.current.focus());
    }, E = () => {
      var W, J;
      const _ = g.current;
      if (_ === null)
        return;
      if (!S.hasFocus() || !s() || u.current) {
        u.current = !1;
        return;
      }
      if (_.contains(S.activeElement) || r && S.activeElement !== d.current && S.activeElement !== m.current)
        return;
      if (S.activeElement !== v.current)
        v.current = null;
      else if (v.current !== null)
        return;
      if (!b.current)
        return;
      let j = [];
      if ((S.activeElement === d.current || S.activeElement === m.current) && (j = i(g.current)), j.length > 0) {
        const V = !!((W = y.current) != null && W.shiftKey && ((J = y.current) == null ? void 0 : J.key) === "Tab"), l = j[0], I = j[j.length - 1];
        typeof l != "string" && typeof I != "string" && (V ? I.focus() : l.focus());
      } else
        _.focus();
    };
    S.addEventListener("focusin", E), S.addEventListener("keydown", T, !0);
    const O = setInterval(() => {
      S.activeElement && S.activeElement.tagName === "BODY" && E();
    }, 50);
    return () => {
      clearInterval(O), S.removeEventListener("focusin", E), S.removeEventListener("keydown", T, !0);
    };
  }, [n, r, o, s, a, i]);
  const w = (S) => {
    h.current === null && (h.current = S.relatedTarget), b.current = !0, v.current = S.target;
    const T = t.props.onFocus;
    T && T(S);
  }, P = (S) => {
    h.current === null && (h.current = S.relatedTarget), b.current = !0;
  };
  return /* @__PURE__ */ B.jsxs(N.Fragment, {
    children: [/* @__PURE__ */ B.jsx("div", {
      tabIndex: a ? 0 : -1,
      onFocus: P,
      ref: d,
      "data-testid": "sentinelStart"
    }), /* @__PURE__ */ N.cloneElement(t, {
      ref: f,
      onFocus: w
    }), /* @__PURE__ */ B.jsx("div", {
      tabIndex: a ? 0 : -1,
      onFocus: P,
      ref: m,
      "data-testid": "sentinelEnd"
    })]
  });
}
process.env.NODE_ENV !== "production" && (Zt.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │ To update them, edit the TypeScript types and run `pnpm proptypes`. │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * A single child content element.
   */
  children: Nt,
  /**
   * If `true`, the focus trap will not automatically shift focus to itself when it opens, and
   * replace it to the last focused element when it closes.
   * This also works correctly with any focus trap children that have the `disableAutoFocus` prop.
   *
   * Generally this should never be set to `true` as it makes the focus trap less
   * accessible to assistive technologies, like screen readers.
   * @default false
   */
  disableAutoFocus: c.bool,
  /**
   * If `true`, the focus trap will not prevent focus from leaving the focus trap while open.
   *
   * Generally this should never be set to `true` as it makes the focus trap less
   * accessible to assistive technologies, like screen readers.
   * @default false
   */
  disableEnforceFocus: c.bool,
  /**
   * If `true`, the focus trap will not restore focus to previously focused element once
   * focus trap is hidden or unmounted.
   * @default false
   */
  disableRestoreFocus: c.bool,
  /**
   * Returns an array of ordered tabbable nodes (i.e. in tab order) within the root.
   * For instance, you can provide the "tabbable" npm dependency.
   * @param {HTMLElement} root
   */
  getTabbable: c.func,
  /**
   * This prop extends the `open` prop.
   * It allows to toggle the open state without having to wait for a rerender when changing the `open` prop.
   * This prop should be memoized.
   * It can be used to support multiple focus trap mounted at the same time.
   * @default function defaultIsEnabled(): boolean {
   *   return true;
   * }
   */
  isEnabled: c.func,
  /**
   * If `true`, focus is locked.
   */
  open: c.bool.isRequired
});
process.env.NODE_ENV !== "production" && (Zt.propTypes = Do(Zt.propTypes));
function Sl(e) {
  return typeof e == "function" ? e() : e;
}
function wl(e) {
  return e ? e.props.hasOwnProperty("in") : !1;
}
const io = () => {
}, Vt = new gl();
function Cl(e) {
  const {
    container: t,
    disableEscapeKeyDown: n = !1,
    disableScrollLock: r = !1,
    closeAfterTransition: o = !1,
    onTransitionEnter: i,
    onTransitionExited: s,
    children: a,
    onClose: u,
    open: d,
    rootRef: m
  } = e, h = N.useRef({}), v = N.useRef(null), b = N.useRef(null), g = Be(b, m), [f, y] = N.useState(!d), w = wl(a);
  let P = !0;
  (e["aria-hidden"] === "false" || e["aria-hidden"] === !1) && (P = !1);
  const S = () => ke(v.current), T = () => (h.current.modalRef = b.current, h.current.mount = v.current, h.current), E = () => {
    Vt.mount(T(), {
      disableScrollLock: r
    }), b.current && (b.current.scrollTop = 0);
  }, O = Zr(() => {
    const k = Sl(t) || S().body;
    Vt.add(T(), k), b.current && E();
  }), _ = () => Vt.isTopModal(T()), j = Zr((k) => {
    v.current = k, k && (d && _() ? E() : b.current && xt(b.current, P));
  }), W = N.useCallback(() => {
    Vt.remove(T(), P);
  }, [P]);
  N.useEffect(() => () => {
    W();
  }, [W]), N.useEffect(() => {
    d ? O() : (!w || !o) && W();
  }, [d, W, w, o, O]);
  const J = (k) => (A) => {
    var z;
    (z = k.onKeyDown) == null || z.call(k, A), !(A.key !== "Escape" || A.which === 229 || // Wait until IME is settled.
    !_()) && (n || (A.stopPropagation(), u && u(A, "escapeKeyDown")));
  }, V = (k) => (A) => {
    var z;
    (z = k.onClick) == null || z.call(k, A), A.target === A.currentTarget && u && u(A, "backdropClick");
  };
  return {
    getRootProps: (k = {}) => {
      const A = ei(e);
      delete A.onTransitionEnter, delete A.onTransitionExited;
      const z = {
        ...A,
        ...k
      };
      return {
        /*
         * Marking an element with the role presentation indicates to assistive technology
         * that this element should be ignored; it exists to support the web application and
         * is not meant for humans to interact with directly.
         * https://github.com/evcohen/eslint-plugin-jsx-a11y/blob/master/docs/rules/no-static-element-interactions.md
         */
        role: "presentation",
        ...z,
        onKeyDown: J(z),
        ref: g
      };
    },
    getBackdropProps: (k = {}) => {
      const A = k;
      return {
        "aria-hidden": !0,
        ...A,
        onClick: V(A),
        open: d
      };
    },
    getTransitionProps: () => {
      const k = () => {
        y(!1), i && i();
      }, A = () => {
        y(!0), s && s(), o && W();
      };
      return {
        onEnter: Jr(k, (a == null ? void 0 : a.props.onEnter) ?? io),
        onExited: Jr(A, (a == null ? void 0 : a.props.onExited) ?? io)
      };
    },
    rootRef: g,
    portalRef: j,
    isTopModal: _,
    exited: f,
    hasTransition: w
  };
}
function Rl(e) {
  return Fe("MuiModal", e);
}
ct("MuiModal", ["root", "hidden", "backdrop"]);
const Ol = (e) => {
  const {
    open: t,
    exited: n,
    classes: r
  } = e;
  return lt({
    root: ["root", !t && n && "hidden"],
    backdrop: ["backdrop"]
  }, Rl, r);
}, kl = Pe("div", {
  name: "MuiModal",
  slot: "Root",
  overridesResolver: (e, t) => {
    const {
      ownerState: n
    } = e;
    return [t.root, !n.open && n.exited && t.hidden];
  }
})(Yo(({
  theme: e
}) => ({
  position: "fixed",
  zIndex: (e.vars || e).zIndex.modal,
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  variants: [{
    props: ({
      ownerState: t
    }) => !t.open && t.exited,
    style: {
      visibility: "hidden"
    }
  }]
}))), Pl = Pe(oi, {
  name: "MuiModal",
  slot: "Backdrop"
})({
  zIndex: -1
}), si = /* @__PURE__ */ N.forwardRef(function(t, n) {
  const r = ut({
    name: "MuiModal",
    props: t
  }), {
    BackdropComponent: o = Pl,
    BackdropProps: i,
    classes: s,
    className: a,
    closeAfterTransition: u = !1,
    children: d,
    container: m,
    component: h,
    components: v = {},
    componentsProps: b = {},
    disableAutoFocus: g = !1,
    disableEnforceFocus: f = !1,
    disableEscapeKeyDown: y = !1,
    disablePortal: w = !1,
    disableRestoreFocus: P = !1,
    disableScrollLock: S = !1,
    hideBackdrop: T = !1,
    keepMounted: E = !1,
    onClose: O,
    onTransitionEnter: _,
    onTransitionExited: j,
    open: W,
    slotProps: J = {},
    slots: V = {},
    // eslint-disable-next-line react/prop-types
    theme: l,
    ...I
  } = r, C = {
    ...r,
    closeAfterTransition: u,
    disableAutoFocus: g,
    disableEnforceFocus: f,
    disableEscapeKeyDown: y,
    disablePortal: w,
    disableRestoreFocus: P,
    disableScrollLock: S,
    hideBackdrop: T,
    keepMounted: E
  }, {
    getRootProps: k,
    getBackdropProps: A,
    getTransitionProps: z,
    portalRef: Q,
    isTopModal: q,
    exited: p,
    hasTransition: R
  } = Cl({
    ...C,
    rootRef: n
  }), D = {
    ...C,
    exited: p
  }, L = Ol(D), F = {};
  if (d.props.tabIndex === void 0 && (F.tabIndex = "-1"), R) {
    const {
      onEnter: M,
      onExited: K
    } = z();
    F.onEnter = M, F.onExited = K;
  }
  const Y = {
    slots: {
      root: v.Root,
      backdrop: v.Backdrop,
      ...V
    },
    slotProps: {
      ...b,
      ...J
    }
  }, [H, G] = Ie("root", {
    ref: n,
    elementType: kl,
    externalForwardedProps: {
      ...Y,
      ...I,
      component: h
    },
    getSlotProps: k,
    ownerState: D,
    className: Ee(a, L == null ? void 0 : L.root, !D.open && D.exited && (L == null ? void 0 : L.hidden))
  }), [U, X] = Ie("backdrop", {
    ref: i == null ? void 0 : i.ref,
    elementType: o,
    externalForwardedProps: Y,
    shouldForwardComponentProp: !0,
    additionalProps: i,
    getSlotProps: (M) => A({
      ...M,
      onClick: (K) => {
        M != null && M.onClick && M.onClick(K);
      }
    }),
    className: Ee(i == null ? void 0 : i.className, L == null ? void 0 : L.backdrop),
    ownerState: D
  });
  return !E && !W && (!R || p) ? null : /* @__PURE__ */ B.jsx(Qt, {
    ref: Q,
    container: m,
    disablePortal: w,
    children: /* @__PURE__ */ B.jsxs(H, {
      ...G,
      children: [!T && o ? /* @__PURE__ */ B.jsx(U, {
        ...X
      }) : null, /* @__PURE__ */ B.jsx(Zt, {
        disableEnforceFocus: f,
        disableAutoFocus: g,
        disableRestoreFocus: P,
        isEnabled: q,
        open: W,
        children: /* @__PURE__ */ N.cloneElement(d, F)
      })]
    })
  });
});
process.env.NODE_ENV !== "production" && (si.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * A backdrop component. This prop enables custom backdrop rendering.
   * @deprecated Use `slots.backdrop` instead. While this prop currently works, it will be removed in the next major version.
   * Use the `slots.backdrop` prop to make your application ready for the next version of Material UI.
   * @default styled(Backdrop, {
   *   name: 'MuiModal',
   *   slot: 'Backdrop',
   * })({
   *   zIndex: -1,
   * })
   */
  BackdropComponent: c.elementType,
  /**
   * Props applied to the [`Backdrop`](https://mui.com/material-ui/api/backdrop/) element.
   * @deprecated Use `slotProps.backdrop` instead.
   */
  BackdropProps: c.object,
  /**
   * A single child content element.
   */
  children: Nt.isRequired,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: c.object,
  /**
   * @ignore
   */
  className: c.string,
  /**
   * When set to true the Modal waits until a nested Transition is completed before closing.
   * @default false
   */
  closeAfterTransition: c.bool,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: c.elementType,
  /**
   * The components used for each slot inside.
   *
   * @deprecated Use the `slots` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   *
   * @default {}
   */
  components: c.shape({
    Backdrop: c.elementType,
    Root: c.elementType
  }),
  /**
   * The extra props for the slot components.
   * You can override the existing props or add new ones.
   *
   * @deprecated Use the `slotProps` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   *
   * @default {}
   */
  componentsProps: c.shape({
    backdrop: c.oneOfType([c.func, c.object]),
    root: c.oneOfType([c.func, c.object])
  }),
  /**
   * An HTML element or function that returns one.
   * The `container` will have the portal children appended to it.
   *
   * You can also provide a callback, which is called in a React layout effect.
   * This lets you set the container from a ref, and also makes server-side rendering possible.
   *
   * By default, it uses the body of the top-level document object,
   * so it's simply `document.body` most of the time.
   */
  container: c.oneOfType([Ot, c.func]),
  /**
   * If `true`, the modal will not automatically shift focus to itself when it opens, and
   * replace it to the last focused element when it closes.
   * This also works correctly with any modal children that have the `disableAutoFocus` prop.
   *
   * Generally this should never be set to `true` as it makes the modal less
   * accessible to assistive technologies, like screen readers.
   * @default false
   */
  disableAutoFocus: c.bool,
  /**
   * If `true`, the modal will not prevent focus from leaving the modal while open.
   *
   * Generally this should never be set to `true` as it makes the modal less
   * accessible to assistive technologies, like screen readers.
   * @default false
   */
  disableEnforceFocus: c.bool,
  /**
   * If `true`, hitting escape will not fire the `onClose` callback.
   * @default false
   */
  disableEscapeKeyDown: c.bool,
  /**
   * The `children` will be under the DOM hierarchy of the parent component.
   * @default false
   */
  disablePortal: c.bool,
  /**
   * If `true`, the modal will not restore focus to previously focused element once
   * modal is hidden or unmounted.
   * @default false
   */
  disableRestoreFocus: c.bool,
  /**
   * Disable the scroll lock behavior.
   * @default false
   */
  disableScrollLock: c.bool,
  /**
   * If `true`, the backdrop is not rendered.
   * @default false
   */
  hideBackdrop: c.bool,
  /**
   * Always keep the children in the DOM.
   * This prop can be useful in SEO situation or
   * when you want to maximize the responsiveness of the Modal.
   * @default false
   */
  keepMounted: c.bool,
  /**
   * Callback fired when the component requests to be closed.
   * The `reason` parameter can optionally be used to control the response to `onClose`.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`.
   */
  onClose: c.func,
  /**
   * A function called when a transition enters.
   */
  onTransitionEnter: c.func,
  /**
   * A function called when a transition has exited.
   */
  onTransitionExited: c.func,
  /**
   * If `true`, the component is shown.
   */
  open: c.bool.isRequired,
  /**
   * The props used for each slot inside the Modal.
   * @default {}
   */
  slotProps: c.shape({
    backdrop: c.oneOfType([c.func, c.object]),
    root: c.oneOfType([c.func, c.object])
  }),
  /**
   * The components used for each slot inside the Modal.
   * Either a string to use a HTML element or a component.
   * @default {}
   */
  slots: c.shape({
    backdrop: c.elementType,
    root: c.elementType
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: c.oneOfType([c.arrayOf(c.oneOfType([c.func, c.object, c.bool])), c.func, c.object])
});
function Hn(e) {
  return `scale(${e}, ${e ** 2})`;
}
const _l = {
  entering: {
    opacity: 1,
    transform: Hn(1)
  },
  entered: {
    opacity: 1,
    transform: "none"
  }
}, _n = typeof navigator < "u" && /^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent) && /(os |version\/)15(.|_)4/i.test(navigator.userAgent), en = /* @__PURE__ */ N.forwardRef(function(t, n) {
  const {
    addEndListener: r,
    appear: o = !0,
    children: i,
    easing: s,
    in: a,
    onEnter: u,
    onEntered: d,
    onEntering: m,
    onExit: h,
    onExited: v,
    onExiting: b,
    style: g,
    timeout: f = "auto",
    // eslint-disable-next-line react/prop-types
    TransitionComponent: y = _e,
    ...w
  } = t, P = Gc(), S = N.useRef(), T = rr(), E = N.useRef(null), O = Be(E, bn(i), n), _ = (k) => (A) => {
    if (k) {
      const z = E.current;
      A === void 0 ? k(z) : k(z, A);
    }
  }, j = _(m), W = _((k, A) => {
    qo(k);
    const {
      duration: z,
      delay: Q,
      easing: q
    } = Jt({
      style: g,
      timeout: f,
      easing: s
    }, {
      mode: "enter"
    });
    let p;
    f === "auto" ? (p = T.transitions.getAutoHeightDuration(k.clientHeight), S.current = p) : p = z, k.style.transition = [T.transitions.create("opacity", {
      duration: p,
      delay: Q
    }), T.transitions.create("transform", {
      duration: _n ? p : p * 0.666,
      delay: Q,
      easing: q
    })].join(","), u && u(k, A);
  }), J = _(d), V = _(b), l = _((k) => {
    const {
      duration: A,
      delay: z,
      easing: Q
    } = Jt({
      style: g,
      timeout: f,
      easing: s
    }, {
      mode: "exit"
    });
    let q;
    f === "auto" ? (q = T.transitions.getAutoHeightDuration(k.clientHeight), S.current = q) : q = A, k.style.transition = [T.transitions.create("opacity", {
      duration: q,
      delay: z
    }), T.transitions.create("transform", {
      duration: _n ? q : q * 0.666,
      delay: _n ? z : z || q * 0.333,
      easing: Q
    })].join(","), k.style.opacity = 0, k.style.transform = Hn(0.75), h && h(k);
  }), I = _(v), C = (k) => {
    f === "auto" && P.start(S.current || 0, k), r && r(E.current, k);
  };
  return /* @__PURE__ */ B.jsx(y, {
    appear: o,
    in: a,
    nodeRef: E,
    onEnter: W,
    onEntered: J,
    onEntering: j,
    onExit: l,
    onExited: I,
    onExiting: V,
    addEndListener: C,
    timeout: f === "auto" ? null : f,
    ...w,
    children: (k, {
      ownerState: A,
      ...z
    }) => /* @__PURE__ */ N.cloneElement(i, {
      style: {
        opacity: 0,
        transform: Hn(0.75),
        visibility: k === "exited" && !a ? "hidden" : void 0,
        ..._l[k],
        ...g,
        ...i.props.style
      },
      ref: O,
      ...z
    })
  });
});
process.env.NODE_ENV !== "production" && (en.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * Add a custom transition end trigger. Called with the transitioning DOM
   * node and a done callback. Allows for more fine grained transition end
   * logic. Note: Timeouts are still used as a fallback if provided.
   */
  addEndListener: c.func,
  /**
   * Perform the enter transition when it first mounts if `in` is also `true`.
   * Set this to `false` to disable this behavior.
   * @default true
   */
  appear: c.bool,
  /**
   * A single child content element.
   */
  children: Nt.isRequired,
  /**
   * The transition timing function.
   * You may specify a single easing or a object containing enter and exit values.
   */
  easing: c.oneOfType([c.shape({
    enter: c.string,
    exit: c.string
  }), c.string]),
  /**
   * If `true`, the component will transition in.
   */
  in: c.bool,
  /**
   * @ignore
   */
  onEnter: c.func,
  /**
   * @ignore
   */
  onEntered: c.func,
  /**
   * @ignore
   */
  onEntering: c.func,
  /**
   * @ignore
   */
  onExit: c.func,
  /**
   * @ignore
   */
  onExited: c.func,
  /**
   * @ignore
   */
  onExiting: c.func,
  /**
   * @ignore
   */
  style: c.object,
  /**
   * The duration for the transition, in milliseconds.
   * You may specify a single timeout for all transitions, or individually with an object.
   *
   * Set to 'auto' to automatically calculate transition time based on height.
   * @default 'auto'
   */
  timeout: c.oneOfType([c.oneOf(["auto"]), c.number, c.shape({
    appear: c.number,
    enter: c.number,
    exit: c.number
  })])
});
en && (en.muiSupportAuto = !0);
const ai = /* @__PURE__ */ N.createContext({});
process.env.NODE_ENV !== "production" && (ai.displayName = "ListContext");
function Al(e) {
  return Fe("MuiList", e);
}
ct("MuiList", ["root", "padding", "dense", "subheader"]);
const Nl = (e) => {
  const {
    classes: t,
    disablePadding: n,
    dense: r,
    subheader: o
  } = e;
  return lt({
    root: ["root", !n && "padding", r && "dense", o && "subheader"]
  }, Al, t);
}, $l = Pe("ul", {
  name: "MuiList",
  slot: "Root",
  overridesResolver: (e, t) => {
    const {
      ownerState: n
    } = e;
    return [t.root, !n.disablePadding && t.padding, n.dense && t.dense, n.subheader && t.subheader];
  }
})({
  listStyle: "none",
  margin: 0,
  padding: 0,
  position: "relative",
  variants: [{
    props: ({
      ownerState: e
    }) => !e.disablePadding,
    style: {
      paddingTop: 8,
      paddingBottom: 8
    }
  }, {
    props: ({
      ownerState: e
    }) => e.subheader,
    style: {
      paddingTop: 0
    }
  }]
}), ci = /* @__PURE__ */ N.forwardRef(function(t, n) {
  const r = ut({
    props: t,
    name: "MuiList"
  }), {
    children: o,
    className: i,
    component: s = "ul",
    dense: a = !1,
    disablePadding: u = !1,
    subheader: d,
    ...m
  } = r, h = N.useMemo(() => ({
    dense: a
  }), [a]), v = {
    ...r,
    component: s,
    dense: a,
    disablePadding: u
  }, b = Nl(v);
  return /* @__PURE__ */ B.jsx(ai.Provider, {
    value: h,
    children: /* @__PURE__ */ B.jsxs($l, {
      as: s,
      className: Ee(b.root, i),
      ref: n,
      ownerState: v,
      ...m,
      children: [d, o]
    })
  });
});
process.env.NODE_ENV !== "production" && (ci.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component.
   */
  children: c.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: c.object,
  /**
   * @ignore
   */
  className: c.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: c.elementType,
  /**
   * If `true`, compact vertical padding designed for keyboard and mouse input is used for
   * the list and list items.
   * The prop is available to descendant components as the `dense` context.
   * @default false
   */
  dense: c.bool,
  /**
   * If `true`, vertical padding is removed from the list.
   * @default false
   */
  disablePadding: c.bool,
  /**
   * The content of the subheader, normally `ListSubheader`.
   */
  subheader: c.node,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: c.oneOfType([c.arrayOf(c.oneOfType([c.func, c.object, c.bool])), c.func, c.object])
});
function An(e, t, n) {
  return e === t ? e.firstChild : t && t.nextElementSibling ? t.nextElementSibling : n ? null : e.firstChild;
}
function so(e, t, n) {
  return e === t ? n ? e.firstChild : e.lastChild : t && t.previousElementSibling ? t.previousElementSibling : n ? null : e.lastChild;
}
function li(e, t) {
  if (t === void 0)
    return !0;
  let n = e.innerText;
  return n === void 0 && (n = e.textContent), n = n.trim().toLowerCase(), n.length === 0 ? !1 : t.repeating ? n[0] === t.keys[0] : n.startsWith(t.keys.join(""));
}
function gt(e, t, n, r, o, i) {
  let s = !1, a = o(e, t, t ? n : !1);
  for (; a; ) {
    if (a === e.firstChild) {
      if (s)
        return !1;
      s = !0;
    }
    const u = r ? !1 : a.disabled || a.getAttribute("aria-disabled") === "true";
    if (!a.hasAttribute("tabindex") || !li(a, i) || u)
      a = o(e, a, n);
    else
      return a.focus(), !0;
  }
  return !1;
}
const ui = /* @__PURE__ */ N.forwardRef(function(t, n) {
  const {
    // private
    // eslint-disable-next-line react/prop-types
    actions: r,
    autoFocus: o = !1,
    autoFocusItem: i = !1,
    children: s,
    className: a,
    disabledItemsFocusable: u = !1,
    disableListWrap: d = !1,
    onKeyDown: m,
    variant: h = "selectedMenu",
    ...v
  } = t, b = N.useRef(null), g = N.useRef({
    keys: [],
    repeating: !0,
    previousKeyMatched: !0,
    lastTime: null
  });
  Kt(() => {
    o && b.current.focus();
  }, [o]), N.useImperativeHandle(r, () => ({
    adjustStyleForScrollbar: (S, {
      direction: T
    }) => {
      const E = !b.current.style.width;
      if (S.clientHeight < b.current.clientHeight && E) {
        const O = `${ii(He(S))}px`;
        b.current.style[T === "rtl" ? "paddingLeft" : "paddingRight"] = O, b.current.style.width = `calc(100% + ${O})`;
      }
      return b.current;
    }
  }), []);
  const f = (S) => {
    const T = b.current, E = S.key;
    if (S.ctrlKey || S.metaKey || S.altKey) {
      m && m(S);
      return;
    }
    const _ = ke(T).activeElement;
    if (E === "ArrowDown")
      S.preventDefault(), gt(T, _, d, u, An);
    else if (E === "ArrowUp")
      S.preventDefault(), gt(T, _, d, u, so);
    else if (E === "Home")
      S.preventDefault(), gt(T, null, d, u, An);
    else if (E === "End")
      S.preventDefault(), gt(T, null, d, u, so);
    else if (E.length === 1) {
      const j = g.current, W = E.toLowerCase(), J = performance.now();
      j.keys.length > 0 && (J - j.lastTime > 500 ? (j.keys = [], j.repeating = !0, j.previousKeyMatched = !0) : j.repeating && W !== j.keys[0] && (j.repeating = !1)), j.lastTime = J, j.keys.push(W);
      const V = _ && !j.repeating && li(_, j);
      j.previousKeyMatched && (V || gt(T, _, !1, u, An, j)) ? S.preventDefault() : j.previousKeyMatched = !1;
    }
    m && m(S);
  }, y = Be(b, n);
  let w = -1;
  N.Children.forEach(s, (S, T) => {
    if (!/* @__PURE__ */ N.isValidElement(S)) {
      w === T && (w += 1, w >= s.length && (w = -1));
      return;
    }
    process.env.NODE_ENV !== "production" && it.isFragment(S) && console.error(["MUI: The Menu component doesn't accept a Fragment as a child.", "Consider providing an array instead."].join(`
`)), S.props.disabled || (h === "selectedMenu" && S.props.selected || w === -1) && (w = T), w === T && (S.props.disabled || S.props.muiSkipListHighlight || S.type.muiSkipListHighlight) && (w += 1, w >= s.length && (w = -1));
  });
  const P = N.Children.map(s, (S, T) => {
    if (T === w) {
      const E = {};
      return i && (E.autoFocus = !0), S.props.tabIndex === void 0 && h === "selectedMenu" && (E.tabIndex = 0), /* @__PURE__ */ N.cloneElement(S, E);
    }
    return S;
  });
  return /* @__PURE__ */ B.jsx(ci, {
    role: "menu",
    ref: y,
    className: a,
    onKeyDown: f,
    tabIndex: o ? 0 : -1,
    ...v,
    children: P
  });
});
process.env.NODE_ENV !== "production" && (ui.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * If `true`, will focus the `[role="menu"]` container and move into tab order.
   * @default false
   */
  autoFocus: c.bool,
  /**
   * If `true`, will focus the first menuitem if `variant="menu"` or selected item
   * if `variant="selectedMenu"`.
   * @default false
   */
  autoFocusItem: c.bool,
  /**
   * MenuList contents, normally `MenuItem`s.
   */
  children: c.node,
  /**
   * @ignore
   */
  className: c.string,
  /**
   * If `true`, will allow focus on disabled items.
   * @default false
   */
  disabledItemsFocusable: c.bool,
  /**
   * If `true`, the menu items will not wrap focus.
   * @default false
   */
  disableListWrap: c.bool,
  /**
   * @ignore
   */
  onKeyDown: c.func,
  /**
   * The variant to use. Use `menu` to prevent selected items from impacting the initial focus
   * and the vertical alignment relative to the anchor element.
   * @default 'selectedMenu'
   */
  variant: c.oneOf(["menu", "selectedMenu"])
});
function Il(e) {
  return Fe("MuiPopover", e);
}
ct("MuiPopover", ["root", "paper"]);
function ao(e, t) {
  let n = 0;
  return typeof t == "number" ? n = t : t === "center" ? n = e.height / 2 : t === "bottom" && (n = e.height), n;
}
function co(e, t) {
  let n = 0;
  return typeof t == "number" ? n = t : t === "center" ? n = e.width / 2 : t === "right" && (n = e.width), n;
}
function lo(e) {
  return [e.horizontal, e.vertical].map((t) => typeof t == "number" ? `${t}px` : t).join(" ");
}
function Et(e) {
  return typeof e == "function" ? e() : e;
}
const Ml = (e) => {
  const {
    classes: t
  } = e;
  return lt({
    root: ["root"],
    paper: ["paper"]
  }, Il, t);
}, Dl = Pe(si, {
  name: "MuiPopover",
  slot: "Root"
})({}), fi = Pe(Jo, {
  name: "MuiPopover",
  slot: "Paper"
})({
  position: "absolute",
  overflowY: "auto",
  overflowX: "hidden",
  // So we see the popover when it's empty.
  // It's most likely on issue on userland.
  minWidth: 16,
  minHeight: 16,
  maxWidth: "calc(100% - 32px)",
  maxHeight: "calc(100% - 32px)",
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0
}), di = /* @__PURE__ */ N.forwardRef(function(t, n) {
  const r = ut({
    props: t,
    name: "MuiPopover"
  }), {
    action: o,
    anchorEl: i,
    anchorOrigin: s = {
      vertical: "top",
      horizontal: "left"
    },
    anchorPosition: a,
    anchorReference: u = "anchorEl",
    children: d,
    className: m,
    container: h,
    elevation: v = 8,
    marginThreshold: b = 16,
    open: g,
    PaperProps: f = {},
    // TODO: remove in v7
    slots: y = {},
    slotProps: w = {},
    transformOrigin: P = {
      vertical: "top",
      horizontal: "left"
    },
    TransitionComponent: S,
    // TODO: remove in v7
    transitionDuration: T = "auto",
    TransitionProps: E = {},
    // TODO: remove in v7
    disableScrollLock: O = !1,
    ..._
  } = r, j = N.useRef(), W = {
    ...r,
    anchorOrigin: s,
    anchorReference: u,
    elevation: v,
    marginThreshold: b,
    transformOrigin: P,
    TransitionComponent: S,
    transitionDuration: T,
    TransitionProps: E
  }, J = Ml(W), V = N.useCallback(() => {
    if (u === "anchorPosition")
      return process.env.NODE_ENV !== "production" && (a || console.error('MUI: You need to provide a `anchorPosition` prop when using <Popover anchorReference="anchorPosition" />.')), a;
    const M = Et(i), K = M && M.nodeType === 1 ? M : ke(j.current).body, $ = K.getBoundingClientRect();
    if (process.env.NODE_ENV !== "production") {
      const ue = K.getBoundingClientRect();
      process.env.NODE_ENV !== "test" && ue.top === 0 && ue.left === 0 && ue.right === 0 && ue.bottom === 0 && console.warn(["MUI: The `anchorEl` prop provided to the component is invalid.", "The anchor element should be part of the document layout.", "Make sure the element is present in the document or that it's not display none."].join(`
`));
    }
    return {
      top: $.top + ao($, s.vertical),
      left: $.left + co($, s.horizontal)
    };
  }, [i, s.horizontal, s.vertical, a, u]), l = N.useCallback((M) => ({
    vertical: ao(M, P.vertical),
    horizontal: co(M, P.horizontal)
  }), [P.horizontal, P.vertical]), I = N.useCallback((M) => {
    const K = {
      width: M.offsetWidth,
      height: M.offsetHeight
    }, $ = l(K);
    if (u === "none")
      return {
        top: null,
        left: null,
        transformOrigin: lo($)
      };
    const ue = V();
    let xe = ue.top - $.vertical, Ae = ue.left - $.horizontal;
    const sr = xe + K.height, ar = Ae + K.width, cr = He(Et(i)), ft = cr.innerHeight - b, lr = cr.innerWidth - b;
    if (b !== null && xe < b) {
      const Se = xe - b;
      xe -= Se, $.vertical += Se;
    } else if (b !== null && sr > ft) {
      const Se = sr - ft;
      xe -= Se, $.vertical += Se;
    }
    if (process.env.NODE_ENV !== "production" && K.height > ft && K.height && ft && console.error(["MUI: The popover component is too tall.", `Some part of it can not be seen on the screen (${K.height - ft}px).`, "Please consider adding a `max-height` to improve the user-experience."].join(`
`)), b !== null && Ae < b) {
      const Se = Ae - b;
      Ae -= Se, $.horizontal += Se;
    } else if (ar > lr) {
      const Se = ar - lr;
      Ae -= Se, $.horizontal += Se;
    }
    return {
      top: `${Math.round(xe)}px`,
      left: `${Math.round(Ae)}px`,
      transformOrigin: lo($)
    };
  }, [i, u, V, l, b]), [C, k] = N.useState(g), A = N.useCallback(() => {
    const M = j.current;
    if (!M)
      return;
    const K = I(M);
    K.top !== null && M.style.setProperty("top", K.top), K.left !== null && (M.style.left = K.left), M.style.transformOrigin = K.transformOrigin, k(!0);
  }, [I]);
  N.useEffect(() => (O && window.addEventListener("scroll", A), () => window.removeEventListener("scroll", A)), [i, O, A]);
  const z = () => {
    A();
  }, Q = () => {
    k(!1);
  };
  N.useEffect(() => {
    g && A();
  }), N.useImperativeHandle(o, () => g ? {
    updatePosition: () => {
      A();
    }
  } : null, [g, A]), N.useEffect(() => {
    if (!g)
      return;
    const M = Lc(() => {
      A();
    }), K = He(Et(i));
    return K.addEventListener("resize", M), () => {
      M.clear(), K.removeEventListener("resize", M);
    };
  }, [i, g, A]);
  let q = T;
  const p = {
    slots: {
      transition: S,
      ...y
    },
    slotProps: {
      transition: E,
      paper: f,
      ...w
    }
  }, [R, D] = Ie("transition", {
    elementType: en,
    externalForwardedProps: p,
    ownerState: W,
    getSlotProps: (M) => ({
      ...M,
      onEntering: (K, $) => {
        var ue;
        (ue = M.onEntering) == null || ue.call(M, K, $), z();
      },
      onExited: (K) => {
        var $;
        ($ = M.onExited) == null || $.call(M, K), Q();
      }
    }),
    additionalProps: {
      appear: !0,
      in: g
    }
  });
  T === "auto" && !R.muiSupportAuto && (q = void 0);
  const L = h || (i ? ke(Et(i)).body : void 0), [F, {
    slots: Y,
    slotProps: H,
    ...G
  }] = Ie("root", {
    ref: n,
    elementType: Dl,
    externalForwardedProps: {
      ...p,
      ..._
    },
    shouldForwardComponentProp: !0,
    additionalProps: {
      slots: {
        backdrop: y.backdrop
      },
      slotProps: {
        backdrop: Bc(typeof w.backdrop == "function" ? w.backdrop(W) : w.backdrop, {
          invisible: !0
        })
      },
      container: L,
      open: g
    },
    ownerState: W,
    className: Ee(J.root, m)
  }), [U, X] = Ie("paper", {
    ref: j,
    className: J.paper,
    elementType: fi,
    externalForwardedProps: p,
    shouldForwardComponentProp: !0,
    additionalProps: {
      elevation: v,
      style: C ? void 0 : {
        opacity: 0
      }
    },
    ownerState: W
  });
  return /* @__PURE__ */ B.jsx(F, {
    ...G,
    ...!sl(F) && {
      slots: Y,
      slotProps: H,
      disableScrollLock: O
    },
    children: /* @__PURE__ */ B.jsx(R, {
      ...D,
      timeout: q,
      children: /* @__PURE__ */ B.jsx(U, {
        ...X,
        children: d
      })
    })
  });
});
process.env.NODE_ENV !== "production" && (di.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * A ref for imperative actions.
   * It currently only supports updatePosition() action.
   */
  action: rl,
  /**
   * An HTML element, [PopoverVirtualElement](https://mui.com/material-ui/react-popover/#virtual-element),
   * or a function that returns either.
   * It's used to set the position of the popover.
   */
  anchorEl: At(c.oneOfType([Ot, c.func]), (e) => {
    if (e.open && (!e.anchorReference || e.anchorReference === "anchorEl")) {
      const t = Et(e.anchorEl);
      if (t && t.nodeType === 1) {
        const n = t.getBoundingClientRect();
        if (process.env.NODE_ENV !== "test" && n.top === 0 && n.left === 0 && n.right === 0 && n.bottom === 0)
          return new Error(["MUI: The `anchorEl` prop provided to the component is invalid.", "The anchor element should be part of the document layout.", "Make sure the element is present in the document or that it's not display none."].join(`
`));
      } else
        return new Error(["MUI: The `anchorEl` prop provided to the component is invalid.", `It should be an Element or PopoverVirtualElement instance but it's \`${t}\` instead.`].join(`
`));
    }
    return null;
  }),
  /**
   * This is the point on the anchor where the popover's
   * `anchorEl` will attach to. This is not used when the
   * anchorReference is 'anchorPosition'.
   *
   * Options:
   * vertical: [top, center, bottom];
   * horizontal: [left, center, right].
   * @default {
   *   vertical: 'top',
   *   horizontal: 'left',
   * }
   */
  anchorOrigin: c.shape({
    horizontal: c.oneOfType([c.oneOf(["center", "left", "right"]), c.number]).isRequired,
    vertical: c.oneOfType([c.oneOf(["bottom", "center", "top"]), c.number]).isRequired
  }),
  /**
   * This is the position that may be used to set the position of the popover.
   * The coordinates are relative to the application's client area.
   */
  anchorPosition: c.shape({
    left: c.number.isRequired,
    top: c.number.isRequired
  }),
  /**
   * This determines which anchor prop to refer to when setting
   * the position of the popover.
   * @default 'anchorEl'
   */
  anchorReference: c.oneOf(["anchorEl", "anchorPosition", "none"]),
  /**
   * A backdrop component. This prop enables custom backdrop rendering.
   * @deprecated Use `slots.backdrop` instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   * @default styled(Backdrop, {
   *   name: 'MuiModal',
   *   slot: 'Backdrop',
   *   overridesResolver: (props, styles) => {
   *     return styles.backdrop;
   *   },
   * })({
   *   zIndex: -1,
   * })
   */
  BackdropComponent: c.elementType,
  /**
   * Props applied to the [`Backdrop`](/material-ui/api/backdrop/) element.
   * @deprecated Use `slotProps.backdrop` instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  BackdropProps: c.object,
  /**
   * The content of the component.
   */
  children: c.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: c.object,
  /**
   * @ignore
   */
  className: c.string,
  /**
   * An HTML element, component instance, or function that returns either.
   * The `container` will passed to the Modal component.
   *
   * By default, it uses the body of the anchorEl's top-level document object,
   * so it's simply `document.body` most of the time.
   */
  container: c.oneOfType([Ot, c.func]),
  /**
   * Disable the scroll lock behavior.
   * @default false
   */
  disableScrollLock: c.bool,
  /**
   * The elevation of the popover.
   * @default 8
   */
  elevation: Xo,
  /**
   * Specifies how close to the edge of the window the popover can appear.
   * If null, the popover will not be constrained by the window.
   * @default 16
   */
  marginThreshold: c.number,
  /**
   * Callback fired when the component requests to be closed.
   * The `reason` parameter can optionally be used to control the response to `onClose`.
   */
  onClose: c.func,
  /**
   * If `true`, the component is shown.
   */
  open: c.bool.isRequired,
  /**
   * Props applied to the [`Paper`](https://mui.com/material-ui/api/paper/) element.
   *
   * This prop is an alias for `slotProps.paper` and will be overriden by it if both are used.
   * @deprecated Use `slotProps.paper` instead.
   *
   * @default {}
   */
  PaperProps: c.shape({
    component: Jc
  }),
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: c.shape({
    backdrop: c.oneOfType([c.func, c.object]),
    paper: c.oneOfType([c.func, c.object]),
    root: c.oneOfType([c.func, c.object]),
    transition: c.oneOfType([c.func, c.object])
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: c.shape({
    backdrop: c.elementType,
    paper: c.elementType,
    root: c.elementType,
    transition: c.elementType
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: c.oneOfType([c.arrayOf(c.oneOfType([c.func, c.object, c.bool])), c.func, c.object]),
  /**
   * This is the point on the popover which
   * will attach to the anchor's origin.
   *
   * Options:
   * vertical: [top, center, bottom, x(px)];
   * horizontal: [left, center, right, x(px)].
   * @default {
   *   vertical: 'top',
   *   horizontal: 'left',
   * }
   */
  transformOrigin: c.shape({
    horizontal: c.oneOfType([c.oneOf(["center", "left", "right"]), c.number]).isRequired,
    vertical: c.oneOfType([c.oneOf(["bottom", "center", "top"]), c.number]).isRequired
  }),
  /**
   * The component used for the transition.
   * [Follow this guide](https://mui.com/material-ui/transitions/#transitioncomponent-prop) to learn more about the requirements for this component.
   * @deprecated use the `slots.transition` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   * @default Grow
   */
  TransitionComponent: c.elementType,
  /**
   * Set to 'auto' to automatically calculate transition time based on height.
   * @default 'auto'
   */
  transitionDuration: c.oneOfType([c.oneOf(["auto"]), c.number, c.shape({
    appear: c.number,
    enter: c.number,
    exit: c.number
  })]),
  /**
   * Props applied to the transition element.
   * By default, the element is based on this [`Transition`](https://reactcommunity.org/react-transition-group/transition/) component.
   * @deprecated use the `slotProps.transition` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   * @default {}
   */
  TransitionProps: c.object
});
function jl(e) {
  return Fe("MuiMenu", e);
}
ct("MuiMenu", ["root", "paper", "list"]);
const Ll = {
  vertical: "top",
  horizontal: "right"
}, Fl = {
  vertical: "top",
  horizontal: "left"
}, Bl = (e) => {
  const {
    classes: t
  } = e;
  return lt({
    root: ["root"],
    paper: ["paper"],
    list: ["list"]
  }, jl, t);
}, Vl = Pe(di, {
  shouldForwardProp: (e) => zo(e) || e === "classes",
  name: "MuiMenu",
  slot: "Root"
})({}), Ul = Pe(fi, {
  name: "MuiMenu",
  slot: "Paper"
})({
  // specZ: The maximum height of a simple menu should be one or more rows less than the view
  // height. This ensures a tappable area outside of the simple menu with which to dismiss
  // the menu.
  maxHeight: "calc(100% - 96px)",
  // Add iOS momentum scrolling for iOS < 13.0
  WebkitOverflowScrolling: "touch"
}), Wl = Pe(ui, {
  name: "MuiMenu",
  slot: "List"
})({
  // We disable the focus ring for mouse, touch and keyboard users.
  outline: 0
}), ir = /* @__PURE__ */ N.forwardRef(function(t, n) {
  const r = ut({
    props: t,
    name: "MuiMenu"
  }), {
    autoFocus: o = !0,
    children: i,
    className: s,
    disableAutoFocusItem: a = !1,
    MenuListProps: u = {},
    onClose: d,
    open: m,
    PaperProps: h = {},
    PopoverClasses: v,
    transitionDuration: b = "auto",
    TransitionProps: {
      onEntering: g,
      ...f
    } = {},
    variant: y = "selectedMenu",
    slots: w = {},
    slotProps: P = {},
    ...S
  } = r, T = Ga(), E = {
    ...r,
    autoFocus: o,
    disableAutoFocusItem: a,
    MenuListProps: u,
    onEntering: g,
    PaperProps: h,
    transitionDuration: b,
    TransitionProps: f,
    variant: y
  }, O = Bl(E), _ = o && !a && m, j = N.useRef(null), W = (q, p) => {
    j.current && j.current.adjustStyleForScrollbar(q, {
      direction: T ? "rtl" : "ltr"
    }), g && g(q, p);
  }, J = (q) => {
    q.key === "Tab" && (q.preventDefault(), d && d(q, "tabKeyDown"));
  };
  let V = -1;
  N.Children.map(i, (q, p) => {
    /* @__PURE__ */ N.isValidElement(q) && (process.env.NODE_ENV !== "production" && it.isFragment(q) && console.error(["MUI: The Menu component doesn't accept a Fragment as a child.", "Consider providing an array instead."].join(`
`)), q.props.disabled || (y === "selectedMenu" && q.props.selected || V === -1) && (V = p));
  });
  const l = {
    slots: w,
    slotProps: {
      list: u,
      transition: f,
      paper: h,
      ...P
    }
  }, I = ol({
    elementType: w.root,
    externalSlotProps: P.root,
    ownerState: E,
    className: [O.root, s]
  }), [C, k] = Ie("paper", {
    className: O.paper,
    elementType: Ul,
    externalForwardedProps: l,
    shouldForwardComponentProp: !0,
    ownerState: E
  }), [A, z] = Ie("list", {
    className: Ee(O.list, u.className),
    elementType: Wl,
    shouldForwardComponentProp: !0,
    externalForwardedProps: l,
    getSlotProps: (q) => ({
      ...q,
      onKeyDown: (p) => {
        var R;
        J(p), (R = q.onKeyDown) == null || R.call(q, p);
      }
    }),
    ownerState: E
  }), Q = typeof l.slotProps.transition == "function" ? l.slotProps.transition(E) : l.slotProps.transition;
  return /* @__PURE__ */ B.jsx(Vl, {
    onClose: d,
    anchorOrigin: {
      vertical: "bottom",
      horizontal: T ? "right" : "left"
    },
    transformOrigin: T ? Ll : Fl,
    slots: {
      root: w.root,
      paper: C,
      backdrop: w.backdrop,
      ...w.transition && {
        // TODO: pass `slots.transition` directly once `TransitionComponent` is removed from Popover
        transition: w.transition
      }
    },
    slotProps: {
      root: I,
      paper: k,
      backdrop: typeof P.backdrop == "function" ? P.backdrop(E) : P.backdrop,
      transition: {
        ...Q,
        onEntering: (...q) => {
          var p;
          W(...q), (p = Q == null ? void 0 : Q.onEntering) == null || p.call(Q, ...q);
        }
      }
    },
    open: m,
    ref: n,
    transitionDuration: b,
    ownerState: E,
    ...S,
    classes: v,
    children: /* @__PURE__ */ B.jsx(A, {
      actions: j,
      autoFocus: o && (V === -1 || a),
      autoFocusItem: _,
      variant: y,
      ...z,
      children: i
    })
  });
});
process.env.NODE_ENV !== "production" && (ir.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * An HTML element, or a function that returns one.
   * It's used to set the position of the menu.
   */
  anchorEl: c.oneOfType([Ot, c.func]),
  /**
   * If `true` (Default) will focus the `[role="menu"]` if no focusable child is found. Disabled
   * children are not focusable. If you set this prop to `false` focus will be placed
   * on the parent modal container. This has severe accessibility implications
   * and should only be considered if you manage focus otherwise.
   * @default true
   */
  autoFocus: c.bool,
  /**
   * Menu contents, normally `MenuItem`s.
   */
  children: c.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: c.object,
  /**
   * @ignore
   */
  className: c.string,
  /**
   * When opening the menu will not focus the active item but the `[role="menu"]`
   * unless `autoFocus` is also set to `false`. Not using the default means not
   * following WAI-ARIA authoring practices. Please be considerate about possible
   * accessibility implications.
   * @default false
   */
  disableAutoFocusItem: c.bool,
  /**
   * Props applied to the [`MenuList`](https://mui.com/material-ui/api/menu-list/) element.
   * @deprecated use the `slotProps.list` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   * @default {}
   */
  MenuListProps: c.object,
  /**
   * Callback fired when the component requests to be closed.
   *
   * @param {object} event The event source of the callback.
   * @param {string} reason Can be: `"escapeKeyDown"`, `"backdropClick"`, `"tabKeyDown"`.
   */
  onClose: c.func,
  /**
   * If `true`, the component is shown.
   */
  open: c.bool.isRequired,
  /**
   * @ignore
   */
  PaperProps: c.object,
  /**
   * `classes` prop applied to the [`Popover`](https://mui.com/material-ui/api/popover/) element.
   */
  PopoverClasses: c.object,
  /**
   * The props used for each slot inside.
   * @default {}
   */
  slotProps: c.shape({
    backdrop: c.oneOfType([c.func, c.object]),
    list: c.oneOfType([c.func, c.object]),
    paper: c.oneOfType([c.func, c.object]),
    root: c.oneOfType([c.func, c.object]),
    transition: c.oneOfType([c.func, c.object])
  }),
  /**
   * The components used for each slot inside.
   * @default {}
   */
  slots: c.shape({
    backdrop: c.elementType,
    list: c.elementType,
    paper: c.elementType,
    root: c.elementType,
    transition: c.elementType
  }),
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: c.oneOfType([c.arrayOf(c.oneOfType([c.func, c.object, c.bool])), c.func, c.object]),
  /**
   * The length of the transition in `ms`, or 'auto'
   * @default 'auto'
   */
  transitionDuration: c.oneOfType([c.oneOf(["auto"]), c.number, c.shape({
    appear: c.number,
    enter: c.number,
    exit: c.number
  })]),
  /**
   * Props applied to the transition element.
   * By default, the element is based on this [`Transition`](https://reactcommunity.org/react-transition-group/transition/) component.
   * @deprecated use the `slotProps.transition` prop instead. This prop will be removed in a future major release. See [Migrating from deprecated APIs](https://mui.com/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   * @default {}
   */
  TransitionProps: c.object,
  /**
   * The variant to use. Use `menu` to prevent selected items from impacting the initial focus.
   * @default 'selectedMenu'
   */
  variant: c.oneOf(["menu", "selectedMenu"])
});
const Ze = {
  TOD: {
    title: "TOD",
    url: "https://tod-dev.np.tcw.com/",
    disabled: !1
  },
  TIP: {
    title: "TIP",
    url: "https://tipuat.corp.tcw.com/",
    disabled: !1
  }
}, zl = [
  {
    header: "Portfolio Management",
    subHeaders: [
      {
        title: "Aladdin Portfolio Management",
        links: [
          {
            title: Ze.TOD.title,
            url: Ze.TOD.url,
            newTab: !0,
            disabled: Ze.TOD.disabled
          }
        ]
      },
      {
        title: "Investment Management Solutions",
        links: [
          {
            title: "IM Target Viewer",
            url: "https://sector-summary-webapp.pd.tcw.com/credit/home",
            newTab: !0,
            disabled: !1
          },
          {
            title: "IM (Aladdin Integrated Tools)",
            url: "http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=aladdin",
            newTab: !1,
            disabled: !1
          },
          {
            title: "IM (Retired Tools)",
            url: "http://localhost:5406/tools/iralaunchpad/?tdenv=prod&mode=legacy",
            newTab: !1,
            disabled: !1
          }
        ]
      }
    ]
  },
  {
    header: "Research & Analysis",
    subHeaders: [
      {
        title: "Fundamental",
        links: [
          {
            title: "Security Analyzer",
            url: "http://localhost:5406/Tools/SecurityAnalyzer?tdenv=prod2&PARALLEL_ENV=SWITCH",
            newTab: !1,
            disabled: !1
          },
          {
            title: "ABS - SLB",
            url: "http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=14,SWITCH",
            newTab: !1,
            disabled: !1
          },
          {
            title: "CLO - SLB",
            url: "http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=16,SWITCH",
            newTab: !1,
            disabled: !1
          },
          {
            title: "CLO - iSLB",
            url: "http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=CLO,SWITCH",
            newTab: !1,
            disabled: !1
          },
          {
            title: "CMBS - SLB",
            url: "http://localhost:5406/Tools/SecurityListBrowser?tdenv=prod2&SLB_SECURITY_LIST_TYPE_ID=12,SWITCH",
            newTab: !1,
            disabled: !1
          },
          {
            title: "Agency MBS SLB",
            url: "http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Agency%20RMBS,SWITCH",
            newTab: !1,
            disabled: !1
          },
          {
            title: "Non-Agency RMBS SLB",
            url: "http://localhost:5406/Tools/iSecurityListBrowser?tdenv=prod2&SectorType=Non-Agency%20RMBS,SWITCH",
            newTab: !1,
            disabled: !1
          },
          {
            title: "CLO Analytics",
            url: "http://localhost:5406/Tools/CLOAnalytics?tdenv=prod2&PARALLEL_ENV=SWITCH",
            newTab: !1,
            disabled: !1
          },
          {
            title: "CMBS Deal Ranking",
            url: "http://localhost:5406/Tools/CMBSDealRanking?tdenv=prod2&PARALLEL_ENV=SWITCH",
            newTab: !1,
            disabled: !1
          },
          {
            title: "Holdings Surveillance",
            url: "http://localhost:5406/Tools/HoldingsSurveillance?tdenv=prod2&PARALLEL_ENV=SWITCH",
            newTab: !1,
            disabled: !1
          }
          // {
          //     title: "TRAP",
          //     url: "https://trap-parallel.pd.tcw.com/",
          //     newTab: true,
          //     disabled: false
          // },
        ]
      },
      {
        title: "ESG",
        links: [
          {
            title: "Securitized ESG Criteria Analyzer",
            url: "https://trap-parallel.pd.tcw.com/sustain/esg/analyze",
            newTab: !0,
            disabled: !1
          },
          {
            title: "Securitized Carbon Emissions Analyzer",
            url: "https://trap-parallel.pd.tcw.com/sustain/ce/clo",
            newTab: !0,
            disabled: !1
          }
        ]
      },
      {
        title: "Market",
        links: [
          {
            title: "Credit News",
            url: "https://trap-parallel.pd.tcw.com/leveredfinance/news",
            newTab: !0,
            disabled: !1
          }
        ]
      },
      {
        title: "Other",
        links: [
          {
            title: Ze.TIP.title,
            url: Ze.TIP.url,
            newTab: !0,
            disabled: Ze.TIP.disabled
          }
        ]
      }
    ]
  },
  {
    header: "Risk & Performance",
    subHeaders: [
      {
        title: "Performance",
        links: [
          {
            title: "Client Returns",
            url: "https://trap-parallel.pd.tcw.com/riskreturn/returns/client-return-portfolio",
            newTab: !0,
            disabled: !1
          },
          {
            title: "Attribution Analysis",
            url: "https://trap-parallel.pd.tcw.com/riskreturn/returns/attribution-analysis",
            newTab: !0,
            disabled: !1
          },
          {
            title: "Returns Overlay Upload",
            url: "https://trap-parallel.pd.tcw.com/riskreturn/returns/returns-overlay-upload",
            newTab: !0,
            disabled: !1
          }
        ]
      }
    ]
  },
  {
    header: "Compliance",
    subHeaders: [
      {
        title: "Research",
        links: [
          {
            title: "Under Construction",
            url: "",
            newTab: !0,
            disabled: !0
          }
        ]
      },
      {
        title: "Governance",
        links: [
          {
            title: "AI Usage Request Form",
            url: "https://workflow.corp.tcw.com/Runtime/Runtime/Form/TCW%20Workdesk?FormName=Form/AI.AiUsageRequest-wd.fm",
            newTab: !0,
            disabled: !1
          }
        ]
      },
      {
        title: "Regulations",
        links: [
          {
            title: "EU Securitization",
            url: "https://tipeu.corp.tcw.com/",
            newTab: !0,
            disabled: !1
          }
        ]
      }
    ]
  },
  {
    header: "Client Management",
    subHeaders: [
      {
        title: "Research",
        links: [
          // {
          //     title: 'RatingsGuard.ai',
          //     url: 'ratings-guard',
          //     newTab: false,
          //     disabled: false,
          //     resource: "ratings",
          //     action: "view",
          // },
        ]
      }
    ]
  },
  {
    header: "Support",
    subHeaders: [
      {
        title: "General",
        links: [
          {
            title: "GEM",
            url: "https://app.powerbi.com/groups/me/apps/3bc63f1b-3cb6-49d4-bf4f-24c8c0ea3a5e/reports/33271b9b-d03f-4bfc-b350-eb964d2cc850/ba46ae49a5fb77d0654b?experience=power-bi",
            newTab: !0,
            disabled: !1
          },
          {
            title: "Business Events",
            url: "https://app.powerbi.com/links/oHDAvEyDht?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare&bookmarkGuid=e0a09b46-58ca-4182-af2d-6cfec40e899a",
            newTab: !0,
            disabled: !1
          },
          {
            title: "Recon TODvsTDC",
            url: "https://app.powerbi.com/links/wPQ2LRhUp5?ctid=b730b432-2098-413f-bd4a-014acdf7c72e&pbi_source=linkShare",
            newTab: !0,
            disabled: !1
          },
          {
            title: "Test TOD",
            url: "feature-alpha",
            newTab: !1,
            disabled: !1
          },
          {
            title: "Test TOD - No Global Styling",
            url: "feature-beta",
            newTab: !1,
            disabled: !1
          }
          // {
          //     title: 'Request Access to Ratings Guard',
          //     url: 'ratings-access-request',
          //     newTab: false,
          //     disabled: false,
          // },
        ]
      }
    ]
  }
], Yl = (e) => {
  var b, g, f;
  const [t, n] = Ut(
    ((b = (e.menuData.subHeaders ?? [])[0]) == null ? void 0 : b.title) ?? ""
  ), [r, o] = Ut(), [i, s] = Ut(null), a = !!i, u = (y) => {
    s(y.currentTarget);
  }, d = () => {
    s(null);
  }, m = (y) => {
    y && n(y.currentTarget.title);
  }, h = (y) => {
    console.log("here", y), y.url === "feature-alpha" && navigate("/feature-tod"), y.url === "feature-beta" && navigate("/feature-tod-no-style"), d();
  };
  yi(() => {
    if (e.menuData) {
      const y = (e.menuData.subHeaders ?? []).find(
        (w) => w.title == t
      );
      o(y);
    }
  }, [e.menuData, t]);
  const v = (y) => !1;
  return /* @__PURE__ */ B.jsxs("div", { className: "header-menu-item", children: [
    /* @__PURE__ */ B.jsx("button", { onClick: u, children: /* @__PURE__ */ B.jsx("div", { className: "header-menu-item-container" + (a ? " current" : ""), children: e.menuData.header }) }),
    /* @__PURE__ */ B.jsx(
      ir,
      {
        id: "basic-menu",
        anchorEl: i,
        open: a,
        onClose: d,
        MenuListProps: {
          "aria-labelledby": "basic-button",
          disablePadding: !0
        },
        classes: { paper: "menu-paper" },
        slotProps: { paper: { square: !0 } },
        anchorOrigin: { vertical: 45, horizontal: 0 },
        children: /* @__PURE__ */ B.jsxs("div", { className: "sub-menu-items-dropdown-container", children: [
          /* @__PURE__ */ B.jsx("div", { className: "sub-menu-titles-container", children: (g = e.menuData.subHeaders) == null ? void 0 : g.map((y, w) => /* @__PURE__ */ B.jsx(
            "div",
            {
              className: t == y.title ? "sub-menu-title-container sub-menu-title-container-selected" : "sub-menu-title-container",
              children: /* @__PURE__ */ B.jsx(
                "button",
                {
                  onClick: m,
                  className: t == y.title ? "sub-menu-title sub-menu-title-selected" : "sub-menu-title",
                  title: y.title,
                  children: y.title
                }
              )
            },
            w
          )) }),
          /* @__PURE__ */ B.jsx("div", { className: "sub-menu-links-container", children: (f = r == null ? void 0 : r.links) == null ? void 0 : f.map((y, w) => /* @__PURE__ */ B.jsx(
            "button",
            {
              disabled: v(),
              className: "sub-menu-link",
              onClick: () => h(y),
              children: y.title
            },
            w
          )) })
        ] })
      }
    )
  ] });
}, Xl = () => {
  const [e, t] = Ut(null), n = () => {
    navigate("/");
  }, r = !!e, o = (s) => {
    t(s.currentTarget);
  }, i = () => {
    t(null);
  };
  return /* @__PURE__ */ B.jsxs("div", { className: "header-container", children: [
    /* @__PURE__ */ B.jsx("button", { onClick: n }),
    /* @__PURE__ */ B.jsx("div", { className: "menu-container", children: zl.map((s, a) => /* @__PURE__ */ B.jsx(Yl, { menuData: s }, a)) }),
    /* @__PURE__ */ B.jsx(
      "img",
      {
        alt: "title icon",
        className: "home-icon header-icon"
      }
    ),
    /* @__PURE__ */ B.jsx(
      "img",
      {
        alt: "title icon",
        className: "search-icon header-icon"
      }
    ),
    /* @__PURE__ */ B.jsxs("div", { className: "profile-menu", children: [
      /* @__PURE__ */ B.jsx("button", { className: "profile-menu-header-button", onClick: o, children: /* @__PURE__ */ B.jsx(
        "img",
        {
          alt: "title icon",
          className: "profile-icon header-icon"
        }
      ) }),
      /* @__PURE__ */ B.jsx(
        ir,
        {
          id: "basic-menu",
          anchorEl: e,
          open: r,
          onClose: i,
          MenuListProps: {
            "aria-labelledby": "basic-button",
            disablePadding: !0
          },
          classes: { paper: "menu-paper" },
          slotProps: { paper: { square: !0 } },
          anchorOrigin: { vertical: 50, horizontal: -125 },
          children: /* @__PURE__ */ B.jsxs("div", { className: "profile-dropdown-content", children: [
            /* @__PURE__ */ B.jsx("div", { className: "profile-menu-user-name", children: "Matthew Lee" }),
            /* @__PURE__ */ B.jsx("button", { className: "profile-menu-preferences", children: "Preferences" }),
            /* @__PURE__ */ B.jsx("button", { className: "profile-menu-preferences", children: "Usage Metrics" }),
            /* @__PURE__ */ B.jsx("div", { className: "profile-menu-log-off", children: "Log Off" })
          ] })
        }
      )
    ] })
  ] });
}, Nn = [
  {
    header: "Company",
    links: [
      {
        title: "About Us",
        url: "https://www.tcw.com/Our-Firm",
        isExternal: !0
      },
      {
        title: "Contact",
        url: "contact",
        isExternal: !1
      },
      {
        title: "Support",
        url: "https://tcwgroup.atlassian.net/servicedesk/customer/portals",
        isExternal: !0
      },
      {
        title: "Help Desk",
        url: "https://help.tcw.com/",
        isExternal: !0
      }
    ]
  },
  {
    header: "External Resources",
    links: [
      {
        title: "Aladdin",
        url: "https://tcw.okta.com/home/tcw_aladdin_1/0oa932gvwhngRnRm05d7/aln932mpheaFJ1v175d7",
        isExternal: !0
      },
      {
        title: "TRAP",
        url: "https://trap-parallel.pd.tcw.com/",
        isExternal: !0
      },
      {
        title: "K2",
        url: "https://workdesk/",
        isExternal: !0
      },
      {
        title: "Salesforce",
        url: "https://tcw.my.salesforce.com/",
        isExternal: !0
      }
    ]
  },
  {
    header: "Helpful Links",
    links: [
      {
        title: "ESG Policies",
        url: "https://mytcw.tcw.com/Policies-Procedures",
        isExternal: !0
      },
      {
        title: "Training & Glossary",
        url: "https://tcw.csod.com/samldefault.aspx",
        isExternal: !0
      },
      {
        title: "myTcw",
        url: "https://mytcw.tcw.com/",
        isExternal: !0
      },
      {
        title: "TCW Insights",
        url: "https://www.tcw.com/Insights#sort=%40publishedz32xdate%20descending",
        isExternal: !0
      }
    ]
  }
], $n = [
  {
    header: "Terms and Conditions",
    url: "terms"
  },
  {
    header: "Privacy Policy",
    url: "policy"
  },
  {
    header: "Regulatory Disclosures",
    url: "regulatory"
  },
  {
    header: "Compliance Guidelines",
    url: "compliance"
  }
], Hl = (e) => {
  var t;
  return /* @__PURE__ */ B.jsxs("div", { className: "links-container", children: [
    /* @__PURE__ */ B.jsx("div", { className: "links-header", children: e.linkData.header }),
    (t = e.linkData.links) == null ? void 0 : t.map((n, r) => /* @__PURE__ */ B.jsx("div", { className: "link-container", children: /* @__PURE__ */ B.jsx(
      "a",
      {
        href: n.url,
        className: "footer-link",
        target: n.isExternal ? "_blank" : "",
        rel: n.isExternal ? '"noopener noreferrer' : "",
        children: n.title
      }
    ) }, r))
  ] });
}, Jl = () => /* @__PURE__ */ B.jsx("div", { className: "footer-container", children: /* @__PURE__ */ B.jsxs("div", { className: "footer-all-links-container", children: [
  /* @__PURE__ */ B.jsx("div", { className: "footer-center", children: /* @__PURE__ */ B.jsx("div", { className: "footer-links-container", children: Nn == null ? void 0 : Nn.map((e, t) => /* @__PURE__ */ B.jsx(Hl, { linkData: e }, t)) }) }),
  /* @__PURE__ */ B.jsx("div", { className: "footer-bottom", children: $n == null ? void 0 : $n.map((e, t) => /* @__PURE__ */ B.jsx("a", { href: e.url, className: "bottom-link", children: e.header }, t)) })
] }) });
export {
  Jl as Footer,
  Xl as Navbar
};
