// ZoomBA.org, copyright (c) by ZoomBA.org
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
      mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
      define(["../../lib/codemirror"], mod);
  else // Plain browser env
      mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  CodeMirror.defineMode("ZoomBA", function(config, parserConfig) {
      var indentUnit = config.indentUnit,
          statementIndentUnit = parserConfig.statementIndentUnit || indentUnit,
          keywords = parserConfig.keywords || {},
          builtin = parserConfig.builtin || {},
          blockKeywords = parserConfig.blockKeywords || {},
          atoms = parserConfig.atoms || {},
          hooks = parserConfig.hooks || {},
          multiLineStrings = parserConfig.multiLineStrings;
      var isOperatorChar = /[+\-*&%=<>!?|\/#@\^\~\:]/;

      var curPunc;

      function tokenBase(stream, state) {
          var ch = stream.next();
          if (hooks[ch]) {
              var result = hooks[ch](stream, state);
              if (result !== false) return result;
          }
          if (ch == '"' || ch == "'" || ch == "`") {
              state.tokenize = tokenString(ch);
              return state.tokenize(stream, state);
          }
          if (/[\[\]{}\(\),;\.]/.test(ch)) {
              curPunc = ch;
              return null;
          }
          if (/\d/.test(ch)) {
              stream.eatWhile(/[\w\.]/);
              return "number";
          }

          // special line comments
          if (ch == '#'){
              return "keyword" ;
          }
          if (ch == "/") {

              if (stream.eat("*")) {
                  state.tokenize = tokenComment;
                  return tokenComment(stream, state);
              }
              if (stream.eat("/")) {
                  stream.skipToEnd();
                  return "comment";
              }
          }
          if (isOperatorChar.test(ch)) {
              stream.eatWhile(isOperatorChar);
              return "operator";
          }
          stream.eatWhile(/[\w\$_\xa1-\uffff]/);
          var cur = stream.current();
          if (keywords.propertyIsEnumerable(cur)) {
              if (blockKeywords.propertyIsEnumerable(cur)) curPunc = "newstatement";
              return "keyword";
          }
          if (builtin.propertyIsEnumerable(cur)) {
              if (blockKeywords.propertyIsEnumerable(cur)) curPunc = "newstatement";
              return "builtin";
          }
          if (atoms.propertyIsEnumerable(cur)) return "atom";
          return "variable";
      }

      function tokenString(quote) {
          return function(stream, state) {
              var escaped = false, next, end = false;
              while ((next = stream.next()) != null) {
                  if (next == quote && !escaped) {end = true; break;}
                  escaped = !escaped && next == "\\";
              }
              if (end || !(escaped || multiLineStrings))
                  state.tokenize = null;
              return "string";
          };
      }

      function tokenComment(stream, state) {
          var maybeEnd = false, ch;
          while (ch = stream.next()) {
              if (ch == "/" && maybeEnd) {
                  state.tokenize = null;
                  break;
              }
              maybeEnd = (ch == "*");
          }
          return "comment";
      }


      function Context(indented, column, type, align, prev) {
          this.indented = indented;
          this.column = column;
          this.type = type;
          this.align = align;
          this.prev = prev;
      }
      function pushContext(state, col, type) {
          var indent = state.indented;
          if (state.context && state.context.type == "statement")
              indent = state.context.indented;
          return state.context = new Context(indent, col, type, null, state.context);
      }
      function popContext(state) {
          var t = state.context.type;
          if (t == ")" || t == "]" || t == "}")
              state.indented = state.context.indented;
          return state.context = state.context.prev;
      }

      // Interface

      return {
          startState: function(basecolumn) {
              return {
                  tokenize: null,
                  context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
                  indented: 0,
                  startOfLine: true
              };
          },

          token: function(stream, state) {
              var ctx = state.context;
              if (stream.sol()) {
                  if (ctx.align == null) ctx.align = false;
                  state.indented = stream.indentation();
                  state.startOfLine = true;
              }
              if (stream.eatSpace()) return null;
              curPunc = null;
              var style = (state.tokenize || tokenBase)(stream, state);
              if (style == "comment" || style == "meta") return style;
              if (ctx.align == null) ctx.align = true;

              if ((curPunc == ";" || curPunc == ":" || curPunc == ",") && ctx.type == "statement") popContext(state);
              else if (curPunc == "{") pushContext(state, stream.column(), "}");
              else if (curPunc == "[") pushContext(state, stream.column(), "]");
              else if (curPunc == "(") pushContext(state, stream.column(), ")");
              else if (curPunc == "}") {
                  while (ctx.type == "statement") ctx = popContext(state);
                  if (ctx.type == "}") ctx = popContext(state);
                  while (ctx.type == "statement") ctx = popContext(state);
              }
              else if (curPunc == ctx.type) popContext(state);
              else if (((ctx.type == "}" || ctx.type == "top") && curPunc != ';') || (ctx.type == "statement" && curPunc == "newstatement"))
                  pushContext(state, stream.column(), "statement");
              state.startOfLine = false;
              return style;
          },

          indent: function(state, textAfter) {
              if (state.tokenize != tokenBase && state.tokenize != null) return CodeMirror.Pass;
              var ctx = state.context, firstChar = textAfter && textAfter.charAt(0);
              if (ctx.type == "statement" && firstChar == "}") ctx = ctx.prev;
              var closing = firstChar == ctx.type;
              if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : statementIndentUnit);
              else if (ctx.align) return ctx.column + (closing ? 0 : 1);
              else return ctx.indented + (closing ? 0 : indentUnit);
          },

          electricChars: "{}"
      };
  });

  function words(str) {
      var obj = {}, words = str.split(" ");
      for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
      return obj;
  }


  CodeMirror.defineMIME("text/x-ZoomBA", {
      name: "ZoomBA",
      keywords: words("atomic as case clock def else for goto if import match return "+
          "where while $ "
      ),

      builtin: words("assert bool bye dict enum empty exists float open hash " +
          "int index json list file lfold mset minmax num " +
          "panic partition printf println random read rindex rfold " +
          "set select send selenium size sorta sortd sum shuffle str system " +
          "time test thread tokens write xml "),
      atoms: words("true false null"),
      hooks: {
          "@": function(stream, _state) {
              stream.eatWhile(/[\w\$_]/);
              return "meta";
          }
      }
  });

});
