/* Copyright (C) 2016  IRIDE Monad <iride.monad@gmail.com>
 * License: GNU GPLv3 http://www.gnu.org/licenses/gpl-3.0.html */
"use strict";

// import _ from "lodash";
import $ from "jquery";
import TextareaMarker from "../../../app/scripts/lib/content/textarea-marker";

describe("TextareaMarker", () => {
  let $textarea;
  let textareaMarker;

  const textareaValue = [
    "ABCDEFGHIJKL",
    "MNOPQRSTUVWXYZ",
    "あいうえお",
  ].join("\n");
  const textareaBgColor = "rgb(1, 2, 3)";

  const generalOptions = {
    markers: [
      { class: "testmark", start: 3, end: 6, data: { a: 1 } },    // DEF
      { class: "testmark", start: 8, end: 12, data: { b: 2 } },   // IJKL
      { class: "testmark2", start: 2, end: 15, data: { c: 3 } },  // CDEFGHIJKL\nMN
      { class: "testmark2", start: 29, end: 32, data: { d: 4 } }, // いうえ
    ],
  };

  beforeEach(() => {
    const textarea = document.createElement("textarea");
    $textarea = $(textarea)
      .val(textareaValue)
      .css("background-color", textareaBgColor)
      .appendTo(document.body);
  });
  afterEach(() => {
    if (textareaMarker) textareaMarker.deactivate();
    $textarea.remove();
  });

  function setupTextareaMarker(options = generalOptions) {
    textareaMarker = new TextareaMarker($textarea, options);
    return textareaMarker;
  }

  describe("#active", () => {
    beforeEach(() => {
      setupTextareaMarker();
    });

    it("sets itself to textarea.data", () => {
      assert($textarea.data("textareaMarker") === textareaMarker);
    });
    it("attaches background container behind textarea", () => {
      assert($textarea.prev().hasClass("textarea-marker-background"));
    });
    it("transfers textarea background to background container", () => {
      assert($textarea.css("background-color") === "rgba(0, 0, 0, 0)");
      assert($textarea.prev().css("background-color") === textareaBgColor);
    });
  });
});
