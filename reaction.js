(new function(window, document, Object){

  var TRUE = !0, FALSE = !1, NULL = null, UNDEFINED = undefined, NAN = NaN, INFINITY = Infinity, PINFINITY = +Infinity, NINFINITY = -Infinity;
  var _OBJECT_ = "object",
      _STRING_ = "string",
      _NUMBER_ = "number",
      _BOOLEAN_ = "boolean",
      _FUNCTION_ = "function",
      _UNDEFINED_ = "undefined",
      _NAN_ = "nan",
      _NULL_ = "null",
      _ENUM_ = "enum",
      _TRUE_ = "true",
      _FALSE_ = "false",
      _EMPTY_ = "empty",
      _EMAIL_ = "email",
      _URL_ = "url",
      _IP_ = "ip"
  ;

  function trim (s) {
    return typeof "".trim == _FUNCTION_ ? (s+"").trim() : (s+"").replace(/^\s+|\s+$/mg, "");
  }

  function pregQuote (s) {
    return (s+"").replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
  }

  function toArray (v) {
    return is(_ENUM_, v) ? [].slice.call(v) : [];
  }

  function toNormal (v) {
    if (!is(_STRING_, v)) return v;
    try {return JSON.parse(v);}
    catch(e) {
      var o = {"true":TRUE, "false":FALSE, "null":NULL, "undefined":UNDEFINED, "NaN":NAN, "Infinity":INFINITY, "+Infinity":PINFINITY, "-Infinity":NINFINITY};
      for(var i in o) if (i == v) return o[i];
      if(/^[\-\.0-9e]+$/mg.test(v) && !is(_NAN_, v*1) ) return v * 1;
    };
    return v;
  }

  function empty (v) {
    var _v = toNormal(v);
    if (is(_ENUM_, _v)) return !_v.length;
    if (is(_OBJECT_, _v)) {
      var o = !0;
      for (var i in _v) {o = !1; break;}
      return o;
    }
    if (is(_STRING_, v)) return !trim(v).length;
    return !_v;
  }

  function is (type, value) {
    var WINDOW = typeof window == _OBJECT_ && window != NULL ? window : NULL,
        type = trim(type).toLowerCase().replace(/\!\s+/g, "!"),
        few = type.split(/\s+/g);
    if (few.length > 1) {
      for (var i=0; i<few.length; i++) if (!is(few[i], value)) return !1;
      return !0;
    }
    if (type[0] == "!") return !is(type.substr(1), value);
    if (type == _NULL_) return value === NULL;
    if (type == _OBJECT_) return typeof value == _OBJECT_ && value != NULL;
    if (type == _ENUM_) return (is(_OBJECT_, value) && is(_NUMBER_, value.length) && (!WINDOW || value != WINDOW));
    if (type == _NAN_) return isNaN(value);
    if (type == _EMPTY_) return empty(value);
    if (type == _IP_) return is(_STRING_, value) && /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]$/g.test(value);
    if (type == _URL_) return is(_STRING_, value) && /^(https?:|ftp:)?\/{2}\w+/ig.test(value);
    if (type == _EMAIL_) return is(_STRING_, value) && /^[^@]+@[^@]+?[a-z0-9]$/ig.test(value);
    return typeof value == type;
  }

  function not (type, value) { return !is(type, value); }

  function each (obj, fn) {
    if (!is(_FUNCTION_, fn)) return;
    if (is(_ENUM_, obj)) {
      for (var i=0; i<obj.length; i++) {
        if (fn(obj[i], i, obj) === FALSE) break;
      }
    }
    else if (is(_OBJECT_, obj)) {
      for (var i in obj) {
        if (fn(obj[i], i, obj) === FALSE) break;
      }
    }
  }

  function extend (a, b) {
    if (is(_OBJECT_, b) && !is(_OBJECT_, a)) {
      a = (is(_ENUM_, b)) ? [] : {};
      if (is(_ENUM_, b)) var b = toArray(b);
    }
    each(b, function (v, i){
      try {
        if(is(_OBJECT_, v)) a[i] = extend(a[i], v);
        else a[i] = v;
      }
      catch(e) { a[i] = v; };
    });
    return a;
  }

}(window, document, Object));