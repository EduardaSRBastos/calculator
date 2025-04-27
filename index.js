// Dynamic year
document.addEventListener("DOMContentLoaded", function () {
  const currentYear = new Date().getFullYear();

  const yearElements = document.querySelectorAll(".year");
  yearElements.forEach((element) => {
    element.textContent = currentYear;
  });

  document.title = `The Cutest Calculator in ${currentYear}`;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  descriptionMeta.setAttribute(
    "content",
    `The cutest free calculator you'll ever click in ${currentYear} - does math, hides secrets, and yes… it actually works great too.`
  );
});

// Screen animations logic
const screen = document.querySelector(".screen");
const screenTooltip = document.querySelector(".screen-tooltip");
let clickCount = 0;
let crackCount = 0;
let clickTimer;

screen.addEventListener("click", function (e) {
  clickCount++;

  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 500);

  if (clickCount === 2) {
    clickCount = 0;

    if (crackCount >= 3) {
      document.querySelector(".screen-text").textContent = "ERROR";
      document.querySelector(".screen-text").classList.add("glitch");
      document.querySelector(".screen-tooltip").innerHTML =
        "I told you,<br>didn't I...";

      const brokenScreenImg = document.querySelector(".broken-screen-img");
      brokenScreenImg.style.display = "block";

      const buttons = document.querySelectorAll(".buttons-container button");

      buttons.forEach((btn) => {
        btn.disabled = true;
      });
    } else {
      document.querySelector(".screen-tooltip").innerHTML =
        "Stop it,<br>seriously!";

      const img = document.createElement("img");
      img.src = "./assets/images/crack-screen-reduced.webp";
      img.classList.add("overlay");

      const rect = screen.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      img.style.left = `${x - 55}px`;
      img.style.top = `${y - 35}px`;

      screen.appendChild(img);
    }
    crackCount++;
  }
});

// Screen tooltip logic
screen.addEventListener("mouseenter", () => {
  screenTooltip.style.opacity = "1";
});

screen.addEventListener("mousemove", (e) => {
  const screenRect = screen.getBoundingClientRect();
  const screenMidpoint = screenRect.left + screenRect.width / 2;
  const tooltipX = e.clientX - screenRect.left + 22;
  const tooltipY = e.clientY - screenRect.top - 21;

  if (e.clientX > screenMidpoint) {
    screenTooltip.style.left = `${tooltipX - screenTooltip.offsetWidth - 44}px`;
    screenTooltip.style.textAlign = "right";
    screenTooltip.style.setProperty(
      "--tooltip-arrow-clip",
      "polygon(0 0, 100% 50%, 0 100%)"
    );
    screenTooltip.style.setProperty("--tooltip-left", "calc(100%)");
  } else {
    screenTooltip.style.left = `${tooltipX}px`;
    screenTooltip.style.textAlign = "left";
    screenTooltip.style.setProperty(
      "--tooltip-arrow-clip",
      "polygon(100% 0, 0 50%, 100% 100%)"
    );
    screenTooltip.style.setProperty("--tooltip-left", "-12px");
  }

  screenTooltip.style.top = `${tooltipY}px`;
});

screen.addEventListener("mouseleave", () => {
  screenTooltip.style.opacity = "0";
});

// Buttons tooltip logic
const buttonTooltip = document.querySelector(".button-tooltip");
const buttons = document.querySelectorAll(".buttons-container button");
let holdTimer;

buttons.forEach((btn) => {
  btn.addEventListener("mousedown", (e) => {
    holdTimer = setTimeout(() => {
      showButtonTooltip(e);
    }, 2000);
  });

  btn.addEventListener("mouseup", () => {
    clearTimeout(holdTimer);
  });

  btn.addEventListener("mouseleave", () => {
    clearTimeout(holdTimer);
    buttonTooltip.style.opacity = "0";
  });
});

const tooltipMessages = [
  "That's a lot of pressing...",
  "You okay there?",
  "Uhm... everything okay?",
  "Whoa there, easy!",
  "Careful, you're gonna wear it out!",
  "Okay okay, we get it!",
];

function showButtonTooltip(e) {
  const message =
    tooltipMessages[Math.floor(Math.random() * tooltipMessages.length)];
  buttonTooltip.innerHTML = message;

  buttonTooltip.style.opacity = "0";
  buttonTooltip.style.display = "block";

  const rect = e.target.getBoundingClientRect();
  const calc = document.querySelector(".calculator-container");
  const calcRect = calc.getBoundingClientRect();

  const tooltipWidth = buttonTooltip.offsetWidth;
  const tooltipXBase =
    rect.left - calcRect.left + rect.width / 2 - tooltipWidth / 2;
  const tooltipY = rect.top - calcRect.top - 55;

  let tooltipX = tooltipXBase;
  const maxLeft = calc.offsetWidth - tooltipWidth - 10;
  if (tooltipX < 10) tooltipX = 10;
  if (tooltipX > maxLeft) tooltipX = maxLeft;

  buttonTooltip.style.left = `${tooltipX}px`;
  buttonTooltip.style.top = `${tooltipY}px`;
  buttonTooltip.style.opacity = "1";

  buttonTooltip.style.textAlign = "center";
  buttonTooltip.style.setProperty(
    "--tooltip-arrow-clip",
    "polygon(50% 100%, 100% 0, 0 0)"
  );

  const arrowOffset = rect.left - calcRect.left + rect.width / 2 - tooltipX;
  buttonTooltip.style.setProperty("--tooltip-left", `${arrowOffset - 6}px`);
}

// Screen text size logic
function adjustScreenFontSize() {
  const screenText = document.querySelector(".screen-text");
  const screen = document.querySelector(".screen");

  screenText.style.fontSize = "50px";

  const padding = 8;

  while (
    screenText.scrollWidth > screen.clientWidth - padding * 2 &&
    parseFloat(screenText.style.fontSize) > 1
  ) {
    screenText.style.fontSize =
      parseFloat(screenText.style.fontSize) - 5 + "px";
  }
}

// Calculator logic
const screenText = document.querySelector(".screen-text");
let expression = "0";
let justEvaluated = false;

function handleCalculatorInput(value) {
  if (expression === "ERROR" && value !== "C") return;

  const operators = ["+", "-", "×", "÷", "%"];

  switch (value) {
    case "C":
      expression = "0";
      break;
    case "=":
      try {
        const safeExpression = expression
          .replace(/×/g, "*")
          .replace(/÷/g, "/")
          .replace(/(\d+(\.\d+)?)%/g, "($1/100)");

        if (expression === "0" || expression === "00" || expression === "") {
          expression = "0";
        } else {
          const result = eval(safeExpression);
          const displayResult = result.toString();

          history.push(`${expression} = ${displayResult}`);
          updateHistoryUI();

          expression = displayResult;
        }
      } catch (err) {
        expression = "ERROR";
      }
      justEvaluated = true;
      break;
    case "⌫":
      if (justEvaluated) {
        expression = "0";
        justEvaluated = false;
      } else {
        expression = expression.slice(0, -1) || "0";
      }
      break;
    case "±":
      if (expression && expression !== "0") {
        if (expression.startsWith("-")) {
          expression = expression.substring(1);
        } else {
          expression = "-" + expression;
        }
      }
      justEvaluated = false;
      break;
    default:
      const lastChar = expression.slice(-1);

      if (operators.includes(value)) {
        if (operators.includes(lastChar)) {
          expression = expression.slice(0, -1) + value;
        } else {
          expression += value;
        }
        justEvaluated = false;
      } else {
        if (justEvaluated) {
          expression = value;
        } else if (expression === "0") {
          expression = value;
        } else {
          expression += value;
        }
        justEvaluated = false;
      }
      break;
  }

  screenText.textContent = expression || "0";
  adjustScreenFontSize();
}

// Buttons logic
let repeatInterval;

buttons.forEach((button) => {
  let isHeld = false;
  let repeatTimeout;

  button.addEventListener("mousedown", (e) => {
    const value = button.textContent;
    handleCalculatorInput(value);
    isHeld = true;

    if (button.classList.contains("number-button")) {
      repeatInterval = setInterval(() => {
        if (isHeld) {
          handleCalculatorInput(value);
        }
      }, 200);
    }

    repeatTimeout = setTimeout(() => {
      isHeld = false;
      clearInterval(repeatInterval);
    }, 2000);
  });

  button.addEventListener("mouseup", () => {
    isHeld = false;
    clearInterval(repeatInterval);
    clearTimeout(repeatTimeout);
  });

  button.addEventListener("mouseleave", () => {
    isHeld = false;
    clearInterval(repeatInterval);
    clearTimeout(repeatTimeout);
  });
});

// Keys logic
let heldKeys = {};
let keyRepeatTimers = {};
let keyHoldTimeouts = {};
let stopRepeatingAfterHold = {};

document.addEventListener("keydown", (e) => {
  if (screenText.textContent === "ERROR") {
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
      return;
    }
    e.preventDefault();
    return;
  }

  const keyMap = {
    "*": "×",
    "/": "÷",
    Enter: "=",
    Backspace: "⌫",
    Escape: "C",
    Delete: "C",
    "±": "±",
    F9: "±",
  };

  const key = e.key;
  const buttonValue = keyMap[key] || key;

  if (heldKeys[key]) return;
  heldKeys[key] = true;

  const matchingButton = Array.from(buttons).find(
    (btn) => btn.textContent === buttonValue
  );
  if (!matchingButton) return;

  e.preventDefault();

  handleCalculatorInput(buttonValue);

  keyHoldTimeouts[key] = setTimeout(() => {
    if (heldKeys[key]) {
      const rect = matchingButton.getBoundingClientRect();
      const fakeEvent = {
        target: matchingButton,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
      };
      showButtonTooltip(fakeEvent);
      stopRepeatingAfterHold[key] = true;
      clearInterval(keyRepeatTimers[key]);
    }
  }, 2000);

  if (matchingButton.classList.contains("number-button")) {
    stopRepeatingAfterHold[key] = false;
    keyRepeatTimers[key] = setInterval(() => {
      if (!stopRepeatingAfterHold[key]) {
        handleCalculatorInput(buttonValue);
      }
    }, 200);
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key;
  heldKeys[key] = false;

  clearTimeout(keyHoldTimeouts[key]);
  clearInterval(keyRepeatTimers[key]);

  delete keyRepeatTimers[key];
  delete keyHoldTimeouts[key];
  delete stopRepeatingAfterHold[key];
});

// Histoy logic
const historyButton = document.querySelector(".history-button");
const historyContainer = document.querySelector(".history-container");
const historyList = document.querySelector(".history-list");
const trashButton = document.querySelector(".trash-button");

let history = JSON.parse(localStorage.getItem("history")) || [];
updateHistoryUI();

historyButton.addEventListener("click", () => {
  if (historyContainer.classList.contains("active")) {
    historyContainer.classList.remove("active");

    historyButton.classList.add("fade-out");
    setTimeout(() => {
      historyButton.classList.remove("close-mode");
      historyButton.innerHTML = "";
      historyButton.classList.remove("fade-out");
    }, 200);
    setTimeout(() => {
      if (!historyContainer.classList.contains("active")) {
        historyContainer.style.display = "none";
      }
    }, 600);
  } else {
    historyContainer.style.display = "block";
    requestAnimationFrame(() => {
      historyContainer.classList.add("active");
    });

    historyButton.classList.add("fade-out");
    setTimeout(() => {
      historyButton.classList.add("close-mode");
      historyButton.innerHTML = "×";
      historyButton.classList.remove("fade-out");
    }, 200);
  }
});

document.addEventListener("click", (e) => {
  if (
    historyContainer.classList.contains("active") &&
    !historyContainer.contains(e.target) &&
    !historyButton.contains(e.target)
  ) {
    historyContainer.classList.remove("active");
    historyButton.classList.remove("close-mode");
    historyButton.innerHTML = "";
    setTimeout(() => {
      if (!historyContainer.classList.contains("active")) {
        historyContainer.style.display = "none";
      }
    }, 400);
  }
});

trashButton.addEventListener("click", () => {
  history = [];
  updateHistoryUI();
  localStorage.removeItem("history");
});

function updateHistoryUI() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "There's no history yet.";
    emptyMessage.classList.add("empty-history");
    historyList.appendChild(emptyMessage);
  } else {
    history.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      historyList.appendChild(li);
    });
  }

  localStorage.setItem("history", JSON.stringify(history));
}
