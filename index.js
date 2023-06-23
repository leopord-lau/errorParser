const STACK_FRAME_LIMIT = 50;

const UNKNOWN_FUNCTION = "?";

function createStackFrame(url, func, lineno, colno) {
  const frame = {
    url,
    function: func,
  };

  if (lineno !== undefined) {
    frame.lineno = lineno;
  }

  if (colno !== undefined) {
    frame.colno = colno;
  }

  return frame;
}

const chromeParser = (line) => {
  const chromeRegex =
    /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  const chromeEvalRegex = /\((\S*)(?::(\d+))(?::(\d+))\)/;
  const parts = chromeRegex.exec(line);
  if (parts) {
    const isEval = parts[2] && parts[2].indexOf("eval") === 0;

    if (isEval) {
      const subMatch = chromeEvalRegex.exec(parts[2]);
      console.log(subMatch);
      if (subMatch) {
        parts[2] = subMatch[1]; // url
        parts[3] = subMatch[2]; // line
        parts[4] = subMatch[3]; // column
      }
    }

    return createStackFrame(
      parts[2],
      parts[1] || UNKNOWN_FUNCTION,
      parts[3] ? +parts[3] : undefined,
      parts[4] ? +parts[4] : undefined
    );
  }
  return;
};

const geckoParser = (line) => {
  const geckoREgex =
    /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
  const geckoEvalRegex = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
  const parts = geckoREgex.exec(line);
  if (parts) {
    const isEval = parts[3] && parts[3].indexOf(" > eval") > -1;
    if (isEval) {
      const subMatch = geckoEvalRegex.exec(parts[3]);

      if (subMatch) {
        // throw out eval line/column and use top-most line number
        parts[1] = parts[1] || "eval";
        parts[3] = subMatch[1];
        parts[4] = subMatch[2];
        parts[5] = ""; // no column when eval
      }
    }

    return createStackFrame(
      parts[3],
      parts[1] || UNKNOWN_FUNCTION,
      parts[4] ? +parts[4] : undefined,
      parts[5] ? +parts[5] : undefined
    );
  }
  return;
};

function createStackParser(parsers) {
  const stackFrames = [];
  return (e) => {
    const lines = e.stack.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // unlikely to be an Error object
      if (line.length > 1024) {
        return;
      }
      for (let i = 0; i < parsers.length; i++) {
        const frame = parsers[i](line);
        if (frame) {
          stackFrames.push(frame);
          break;
        }
      }

      if (stackFrames.length >= STACK_FRAME_LIMIT) {
        break;
      }
    }
    return {
      name: e.name,
      message: e.message,
      stack: stackFrames,
    };
  };
}

const errorParser = createStackParser([chromeParser, geckoParser]);

export { errorParser };
