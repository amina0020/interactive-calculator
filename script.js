const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

let expression = "";
let justCalculated = false;

function updateDisplay(value = expression) {
  display.textContent = value || "0";
}

function clearCalculator() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function addValue(value) {
  if (justCalculated) {
    if ("0123456789.(".includes(value)) {
      expression = "";
    }
    justCalculated = false;
  }

  expression += value;
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  justCalculated = false;
  updateDisplay();
}

// Parse arithmetic expressions without using eval().
function calculate(input) {
  const tokens = input.match(
    /(?:\d+\.?\d*|\.\d+)|[()+\-*/]/g
  );

  if (!tokens || tokens.join("") !== input.replace(/\s/g, "")) {
    throw new Error("Invalid expression");
  }

  let position = 0;

  function parseExpression() {
    let value = parseTerm();

    while (
      tokens[position] === "+" ||
      tokens[position] === "-"
    ) {
      const operator = tokens[position++];
      const right = parseTerm();

      value = operator === "+"
        ? value + right
        : value - right;
    }

    return value;
  }

  function parseTerm() {
    let value = parseUnary();

    while (
      tokens[position] === "*" ||
      tokens[position] === "/"
    ) {
      const operator = tokens[position++];
      const right = parseUnary();

      if (operator === "/" && right === 0) {
        throw new Error("Cannot divide by zero");
      }

      value = operator === "*"
        ? value * right
        : value / right;
    }

    return value;
  }

  function parseUnary() {
    if (tokens[position] === "-") {
      position++;
      return -parseUnary();
    }

    if (tokens[position] === "+") {
      position++;
      return parseUnary();
    }

    return parsePrimary();
  }

  function parsePrimary() {
    const token = tokens[position++];

    if (token === "(") {
      const value = parseExpression();

      if (tokens[position++] !== ")") {
        throw new Error("Missing closing parenthesis");
      }

      return value;
    }

    if (token === undefined || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
      throw new Error("Invalid number");
    }

    return Number(token);
  }

  const result = parseExpression();

  if (position !== tokens.length || !Number.isFinite(result)) {
    throw new Error("Invalid expression");
  }

  return Number(result.toPrecision(12));
}

function showResult() {
  if (!expression) return;

  try {
    const result = calculate(expression);
    expression = String(result);
    justCalculated = true;
    updateDisplay(expression);
  } catch (error) {
    display.textContent = error.message === "Cannot divide by zero"
      ? "Cannot divide by zero"
      : "Invalid expression";

    expression = "";
    justCalculated = false;
  }
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "clear") {
    clearCalculator();
  } else if (button.dataset.action === "delete") {
    deleteLast();
  } else if (button.dataset.action === "equals") {
    showResult();
  } else {
    addValue(button.dataset.value);
  }
});

document.addEventListener("keydown", (event) => {
  const key = event.key;

  if (/^[0-9.+\-*/()]$/.test(key)) {
    event.preventDefault();
    addValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    showResult();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (key === "Escape" || key === "Delete") {
    clearCalculator();
  }
});