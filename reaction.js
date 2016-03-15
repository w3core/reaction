/**
 * ReactionJS
 * 
 * Reaction for the any changes of the document.
 * 
 * What should be done:
 * 1. Handle DOM changes via Mutation events (except for attributes because
 *    Webkit browsers does not support it)
 * 2. Proxy all methods, that responsible for the changes of attributes.
 * 3. Define setter for all properties of prototypes of elements of form that
 *    responsible for data changes, to handle direct changes of them
 *    (unfortunately it's not available on Safari browser).
 * 4. Create event handlers when element just inserted to the document
 * 5. The logic to avoid collisions.
 * 
 * Element creation ways
 *   MutationEvent "DOMNodeInserted"
 *   document.createElement(name)
 * 
 * Attribute modification methods:
 *   Element.setAttribute(name, value)
 *   Element.attributes.setNamedItem(AttrNode) (?) document.createAttribute("class")
 *   Element.removeAttribute(name)
 *   Element.attributes.removeNamedItem(AttrNodeName) (?) element.attributes.removeNamedItem("type")
 *
 * The properties of element that should be handled
 *   Element.attributes
 *   (ro) Element.attributes[n].name
 *   (ro) Element.attributes[n].nodeName
 *   (ro) Element.attributes[n].localName
 *   Element.attributes[n].value
 *   Element.attributes[n].nodeValue
 *   Element.attributes[n].textContent
 *   Elements of form:
 *     Element.name
 *     Element.value
 *     Element.checked
 *     Element.disabled
 *     Element.files
 *     Element.multiple
 *     Element.selected (?) option
 *     Element.innerHTML | innerText | textContent | text (?) option | textarea
 *   Basic element properties:
 *     Element.src
 *     Element.href
 *     Element.title
 *     Element.innerHTML
 *     Element.innerText
 *     Element.textContent
 *     Element.style.*
 * 
 * Event that should be handled for the elements of form
 *   change
 *   input
 *   keypress
 * 
 */
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

  /****************************************************************************/

  function __construct () {
    
  }

  function Origin (name, fn) {
    this.name = name;
    this.fn = fn;
  }

  function ReactionRecord ($this, $originName, $originFunction, $name, $value, $prev) {
    this.$this = $this;
    this.$name = $name;
    this.$prev = $prev;
    this.$value = $value;
    this.$origin = new Origin($originName, $originFunction);
  }
  // (this, new OriginExecutor("set", set), property, value, prev)

  function PrototypeReactor (constructor) {
    // Prepare element prototype
    var that = this;
    that.constructor = constructor;
  }

  function NodeReactor (node) {
    // Prepare just created node
    var that = this;
    that.node = node;
  }

  function handleMutationEvents (node, handler) {
    // DOMAttrModified not handling under Chrome
    var events = {"DOMNodeInserted":"insert", "DOMNodeRemoved":"remove", "DOMAttrModified":"setAttribute"};
    for (var i in events) node.addEventListener(i, function(e){
      var args = [new OriginExecutor(events[e.type])];
      if (e.attrName) args.push(e.attrName, e.newValue, e.prevValue);
      handler.apply(e.target, args);
    }, false);
  }

  __construct();
}(window, document, Object));