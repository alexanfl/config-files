// Generated by CoffeeScript 1.12.7
(function() {
  var findMode, handlers, setTextInInputElement;

  findMode = null;

  setTextInInputElement = function(inputElement, text) {
    var range, selection;
    inputElement.textContent = text;
    range = document.createRange();
    range.selectNodeContents(inputElement);
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    return selection.addRange(range);
  };

  document.addEventListener("DOMContentLoaded", function() {
    return DomUtils.injectUserCss();
  });

  document.addEventListener("keydown", function(event) {
    var inputElement, rawQuery;
    inputElement = document.getElementById("hud-find-input");
    if (inputElement == null) {
      return;
    }
    if ((KeyboardUtils.isBackspace(event) && inputElement.textContent.length === 0) || event.key === "Enter" || KeyboardUtils.isEscape(event)) {
      UIComponentServer.postMessage({
        name: "hideFindMode",
        exitEventIsEnter: event.key === "Enter",
        exitEventIsEscape: KeyboardUtils.isEscape(event)
      });
    } else if (event.key === "ArrowUp") {
      if (rawQuery = FindModeHistory.getQuery(findMode.historyIndex + 1)) {
        findMode.historyIndex += 1;
        if (findMode.historyIndex === 0) {
          findMode.partialQuery = findMode.rawQuery;
        }
        setTextInInputElement(inputElement, rawQuery);
        findMode.executeQuery();
      }
    } else if (event.key === "ArrowDown") {
      findMode.historyIndex = Math.max(-1, findMode.historyIndex - 1);
      rawQuery = 0 <= findMode.historyIndex ? FindModeHistory.getQuery(findMode.historyIndex) : findMode.partialQuery;
      setTextInInputElement(inputElement, rawQuery);
      findMode.executeQuery();
    } else {
      return;
    }
    DomUtils.suppressEvent(event);
    return false;
  });

  handlers = {
    show: function(data) {
      document.getElementById("hud").innerText = data.text;
      document.getElementById("hud").classList.add("vimiumUIComponentVisible");
      return document.getElementById("hud").classList.remove("vimiumUIComponentHidden");
    },
    hidden: function() {
      document.getElementById("hud").innerText = "";
      document.getElementById("hud").classList.add("vimiumUIComponentHidden");
      return document.getElementById("hud").classList.remove("vimiumUIComponentVisible");
    },
    showFindMode: function(data) {
      var countElement, executeQuery, hud, inputElement;
      hud = document.getElementById("hud");
      hud.innerText = "/\u200A";
      inputElement = document.createElement("span");
      try {
        inputElement.contentEditable = "plaintext-only";
      } catch (error) {
        inputElement.contentEditable = "true";
      }
      inputElement.id = "hud-find-input";
      hud.appendChild(inputElement);
      inputElement.addEventListener("input", executeQuery = function(event) {
        findMode.rawQuery = inputElement.textContent.replace("\u00A0", " ");
        return UIComponentServer.postMessage({
          name: "search",
          query: findMode.rawQuery
        });
      });
      countElement = document.createElement("span");
      countElement.id = "hud-match-count";
      countElement.style.float = "right";
      hud.appendChild(countElement);
      inputElement.focus();
      return findMode = {
        historyIndex: -1,
        partialQuery: "",
        rawQuery: "",
        executeQuery: executeQuery
      };
    },
    updateMatchesCount: function(arg) {
      var countElement, countText, matchCount, showMatchText;
      matchCount = arg.matchCount, showMatchText = arg.showMatchText;
      countElement = document.getElementById("hud-match-count");
      if (countElement == null) {
        return;
      }
      countText = matchCount > 0 ? " (" + matchCount + " Match" + (matchCount === 1 ? "" : "es") + ")" : " (No matches)";
      return countElement.textContent = showMatchText ? countText : "";
    },
    copyToClipboard: function(data) {
      var focusedElement;
      focusedElement = document.activeElement;
      Clipboard.copy(data);
      if (focusedElement != null) {
        focusedElement.focus();
      }
      window.parent.focus();
      return UIComponentServer.postMessage({
        name: "unfocusIfFocused"
      });
    },
    pasteFromClipboard: function() {
      var data, focusedElement;
      focusedElement = document.activeElement;
      data = Clipboard.paste();
      if (focusedElement != null) {
        focusedElement.focus();
      }
      window.parent.focus();
      return UIComponentServer.postMessage({
        name: "pasteResponse",
        data: data
      });
    }
  };

  UIComponentServer.registerHandler(function(arg) {
    var data, name, ref;
    data = arg.data;
    return typeof handlers[name = (ref = data.name) != null ? ref : data] === "function" ? handlers[name](data) : void 0;
  });

  FindModeHistory.init();

}).call(this);
