/* Copyright (C) 2016  IRIDE Monad <iride.monad@gmail.com>
 * License: GNU GPLv3 http://www.gnu.org/licenses/gpl-3.0.html */
"use strict";

import _ from "lodash";
import $ from "jquery";
import { TextareaLinter } from "../../../app/scripts/lib/content/textarea-linter";
import DismissType from "../../../app/scripts/lib/content/dismiss-type";

describe("TextareaLinter", () => {
  const textareas = [];
  const textareaValue = "This is test";
  const correctedValue = "Corrected text";

  const generalLintResult = {
    messages: [
      { message: "Test error 1", ruleId: "rule-1", severity: "error", start: 0, end: 4 },
      { message: "Test warning 2", ruleId: "rule-2", severity: "warning", start: 8, end: 12 },
    ],
  };
  const emptyLintResult = {
    messages: [],
  };

  let textareaLinter;
  let spyLintText;
  let spyCorrectText;
  let spyOnMarksChanged;
  let options;

  beforeEach(() => {
    options = {
      lintText: spyLintText = sinon.spy(),
      correctText: spyCorrectText = sinon.spy(),
      onMarksChanged: spyOnMarksChanged = sinon.spy(),
    };
    textareaLinter = new TextareaLinter(options);
  });
  afterEach(() => {
    textareaLinter.deactivate();
    textareas.map(t => document.body.removeChild(t));
    textareas.length = 0;
  });

  function setupTextarea(value = textareaValue) {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    document.body.appendChild(textarea);
    textareas.push(textarea);
    return textarea;
  }
  function lintTextArea() {
    const textarea = setupTextarea();
    textareaLinter.activate();
    textareaLinter.lintTextArea(textarea);
    return textarea;
  }
  function setupTextareaWithLintResult(lintResult) {
    const textarea = lintTextArea();
    const lintId = spyLintText.lastCall.args[0];
    textareaLinter.receiveLintResult({
      lintId,
      lintResult: _.cloneDeep(lintResult),
    });
    return textarea;
  }
  function correctTextarea() {
    const textarea = lintTextArea();
    textareaLinter.correctTextarea(textarea);
    return textarea;
  }
  function receiveCorrectResult() {
    const correctId = spyCorrectText.lastCall.args[0];
    textareaLinter.receiveCorrectResult({
      correctId,
      correctResult: {
        output: correctedValue,
      },
    });
  }


  describe("#activate()", () => {
    beforeEach(() => {
      textareaLinter.activate();
    });

    it("becomes active", () => {
      assert(textareaLinter.active === true);
    });
  });

  describe("#deactivate()", () => {
    beforeEach(() => {
      textareaLinter.activate();
      textareaLinter.deactivate();
    });

    it("becomes inactive", () => {
      assert(textareaLinter.active === false);
    });
  });

  describe("#lintTextArea()", () => {
    it("calls lintText function", () => {
      lintTextArea();
      assert(spyLintText.calledOnce);

      const [aTextareaId, aText] = spyLintText.firstCall.args;
      assert(_.isString(aTextareaId));
      assert(aText === textareaValue);
    });
    it("hides lint result from previous textarea", () => {
      const spyTextareaMarker = sinonsb.spy($.fn, "textareaMarker");
      lintTextArea();
      assert(!spyTextareaMarker.called);
      lintTextArea();
      assert(spyTextareaMarker.calledOnce);
      assert(spyTextareaMarker.firstCall.args[0] === "destroy");
    });
  });

  describe("#receiveLintResult()", () => {
    context("with general lint results", () => {
      let spyTextareaMarker;
      let textarea;
      beforeEach(() => {
        spyTextareaMarker = sinonsb.spy($.fn, "textareaMarker");
        textarea = setupTextareaWithLintResult(generalLintResult);
      });

      it("sets several classes to textarea", () => {
        assert($(textarea).hasClass("ext-textlint-textarea"));
        assert($(textarea).hasClass("ext-textlint-textarea-error"));
        assert($(textarea).hasClass("ext-textlint-textarea-warning"));
        assert(!$(textarea).hasClass("ext-textlint-textarea-info"));
        assert(!$(textarea).hasClass("ext-textlint-textarea-none"));
        assert($(textarea).hasClass("ext-textlint-textarea-show-border"));
      });
      it("sets up textarea marker", () => {
        assert(spyTextareaMarker.called);

        const opts = spyTextareaMarker.secondCall.args[0];
        assert(_.isObject(opts));
        assert(_.isArray(opts.markers));
        assert(opts.markers.length === generalLintResult.messages.length);
      });
      it("shows textarea markers", () => {
        assert(spyTextareaMarker.called);
        assert(spyTextareaMarker.thirdCall.args[0] === "show");
      });
      it("calls onMarksChanged handler", () => {
        assert(spyOnMarksChanged.calledOnce);
      });
    });

    context("with empty lint results", () => {
      let textarea;
      beforeEach(() => {
        textarea = setupTextareaWithLintResult(emptyLintResult);
      });

      it("sets several classes to textarea", () => {
        assert($(textarea).hasClass("ext-textlint-textarea"));
        assert(!$(textarea).hasClass("ext-textlint-textarea-error"));
        assert(!$(textarea).hasClass("ext-textlint-textarea-warning"));
        assert(!$(textarea).hasClass("ext-textlint-textarea-info"));
        assert($(textarea).hasClass("ext-textlint-textarea-none"));
        assert($(textarea).hasClass("ext-textlint-textarea-show-border"));
      });
    });

    context("with show border off", () => {
      let textarea;
      beforeEach(() => {
        textareaLinter.options.showBorder = false;
        textarea = setupTextareaWithLintResult(emptyLintResult);
      });

      it("does not set show-border class", () => {
        assert(!$(textarea).hasClass("ext-textlint-textarea-show-border"));
      });
    });

    context("with show marks off", () => {
      let spyTextareaMarker;
      beforeEach(() => {
        textareaLinter.options.showMarks = false;
        spyTextareaMarker = sinonsb.spy($.fn, "textareaMarker");
        setupTextareaWithLintResult(emptyLintResult);
      });

      it("hides textarea markers", () => {
        assert(spyTextareaMarker.called);
        assert(spyTextareaMarker.thirdCall.args[0] === "hide");
      });
    });
  });

  describe("#getCurrentLintMarks()", () => {
    beforeEach(() => {
      setupTextareaWithLintResult(generalLintResult);
    });

    it("returns an array of marks", () => {
      const ret = textareaLinter.getCurrentLintMarks();
      assert(_.isArray(ret));
      assert(ret.length === generalLintResult.messages.length);

      _.each(_.zip(ret, generalLintResult.messages), ([mark, msg]) => {
        assert(_.isObject(mark));
        assert(mark.message === msg.message);
        assert(mark.ruleId === msg.ruleId);
        assert(mark.severity === msg.severity);
        assert(mark.start === msg.start);
        assert(mark.end === msg.end);
        assert(_.isString(mark.markId));
        assert(mark.text === textareaValue.slice(msg.start, msg.end));
        assert(mark.dismissed === false);
      });
    });
  });

  describe("#showMark()", () => {
    beforeEach(() => {
      setupTextareaWithLintResult(generalLintResult);
    });

    it("scrolls textarea to mark", () => {
      const spy = sinonsb.spy($.fn, "textareaMarker");
      textareaLinter.showMark("mark123");
      assert(spy.calledOnce);

      const [command, selector] = spy.firstCall.args;
      assert(command === "scrollToMark");
      assert(selector === ".ext-textlint-mark123");
    });
  });

  describe("#dismissMark()", () => {
    beforeEach(() => {
      setupTextareaWithLintResult({
        messages: [
          { message: "Test error", ruleId: "rule-1", severity: "error", start: 0, end: 4 },
          { message: "Test error", ruleId: "rule-1", severity: "error", start: 8, end: 12 },
          { message: "Test error2", ruleId: "rule-1", severity: "error", start: 16, end: 20 },
          { message: "Test error", ruleId: "rule-2", severity: "error", start: 24, end: 28 },
        ],
      });
    });

    context("with ONLY_THIS", () => {
      it("sets a single mark dismissed", () => {
        const marks = textareaLinter.getCurrentLintMarks();
        assert(marks[0].dismissed === false);
        assert(marks[1].dismissed === false);
        assert(marks[2].dismissed === false);
        assert(marks[3].dismissed === false);
        textareaLinter.dismissMark(marks[0].markId, DismissType.ONLY_THIS);

        const newMarks = textareaLinter.getCurrentLintMarks();
        assert(newMarks[0].dismissed === true);
        assert(newMarks[1].dismissed === false);
        assert(newMarks[2].dismissed === false);
        assert(newMarks[3].dismissed === false);
      });
    });

    context("with ALL_SAME", () => {
      it("sets all marks with same message dismissed", () => {
        const marks = textareaLinter.getCurrentLintMarks();
        textareaLinter.dismissMark(marks[0].markId, DismissType.ALL_SAME);

        const newMarks = textareaLinter.getCurrentLintMarks();
        assert(newMarks[0].dismissed === true);
        assert(newMarks[1].dismissed === true);
        assert(newMarks[2].dismissed === false);
        assert(newMarks[3].dismissed === false);
      });
    });

    context("with UNDISMISS", () => {
      it("reverts a mark dismissed with ONLY_THIS", () => {
        const marks = textareaLinter.getCurrentLintMarks();
        textareaLinter.dismissMark(marks[0].markId, DismissType.ONLY_THIS);
        textareaLinter.dismissMark(marks[0].markId, DismissType.UNDISMISS);

        const newMarks = textareaLinter.getCurrentLintMarks();
        assert(newMarks[0].dismissed === false);
      });

      it("reverts a mark dismissed with ALL_SAME", () => {
        const marks = textareaLinter.getCurrentLintMarks();
        textareaLinter.dismissMark(marks[0].markId, DismissType.ALL_SAME);
        textareaLinter.dismissMark(marks[0].markId, DismissType.UNDISMISS);

        const newMarks = textareaLinter.getCurrentLintMarks();
        assert(newMarks[0].dismissed === false);
        assert(newMarks[1].dismissed === false);
      });
    });
  });

  describe("#correctTextarea()", () => {
    it("calls correctText function", () => {
      correctTextarea();
      assert(spyCorrectText.calledOnce);

      const [aTextareaId, aText] = spyCorrectText.firstCall.args;
      assert(_.isString(aTextareaId));
      assert(aText === textareaValue);
    });
    it("disables textarea", () => {
      const textarea = correctTextarea();
      assert(textarea.disabled === true);
    });
  });

  describe("#receiveCorrectResult()", () => {
    it("increments undo count", () => {
      correctTextarea();
      assert(textareaLinter.getCurrentUndoCount() === 0);
      receiveCorrectResult();
      assert(textareaLinter.getCurrentUndoCount() === 1);
    });

    it("replaces textarea value with correct result", () => {
      const textarea = correctTextarea();
      assert(textarea.value === textareaValue);
      receiveCorrectResult();
      assert(textarea.value === correctedValue);
    });

    it("enables textarea", () => {
      const textarea = correctTextarea();
      assert(textarea.disabled === true);
      receiveCorrectResult();
      assert(textarea.disabled === false);
    });

    it("keeps textarea disabled if it was disabled before", () => {
      const textarea = lintTextArea();
      textarea.disabled = true;
      textareaLinter.correctTextarea(textarea);
      assert(textarea.disabled === true);
      receiveCorrectResult();
      assert(textarea.disabled === true);
    });
  });

  describe("#undoTextarea", () => {
    it("restores textarea value before corrected", () => {
      const textarea = correctTextarea();
      receiveCorrectResult();
      assert(textarea.value === correctedValue);
      textareaLinter.undoTextarea(textarea);
      assert(textarea.value === textareaValue);
    });

    it("decrements undo count", () => {
      const textarea = correctTextarea();
      receiveCorrectResult();
      assert(textareaLinter.getCurrentUndoCount() === 1);
      textareaLinter.undoTextarea(textarea);
      assert(textareaLinter.getCurrentUndoCount() === 0);
    });

    it("does nothing if there is no undo", () => {
      const textarea = lintTextArea();
      textareaLinter.undoTextarea(textarea);
      assert(textarea.value === textareaValue);
    });
  });

  describe("#clearUndos", () => {
    it("clears undo data", () => {
      const textarea = correctTextarea();
      receiveCorrectResult();
      assert(textarea.value === correctedValue);
      textareaLinter.clearUndos(textarea);
      textareaLinter.undoTextarea(textarea);
      assert(textarea.value === correctedValue);
    });

    it("sets undo count to zero", () => {
      const textarea = correctTextarea();
      receiveCorrectResult();
      textareaLinter.correctTextarea(textarea);
      receiveCorrectResult();
      assert(textareaLinter.getCurrentUndoCount() === 2);

      textareaLinter.clearUndos(textarea);
      assert(textareaLinter.getCurrentUndoCount() === 0);
    });
  });
});
