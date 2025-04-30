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
const crackTemplate = document.createElement("img");
crackTemplate.src = "./assets/images/crack-screen-reduced.webp";
crackTemplate.classList.add("overlay");
const rect = screen.getBoundingClientRect();
const buttons = document.querySelectorAll(".buttons-container button");

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

      buttons.forEach((btn) => {
        btn.disabled = true;
        btn.classList.add("disable");
      });
    } else {
      document.querySelector(".screen-tooltip").innerHTML =
        "Stop it,<br>seriously!";

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const crack = crackTemplate.cloneNode();
      crack.style.left = `${x - 55}px`;
      crack.style.top = `${y - 40}px`;

      screen.appendChild(crack);
    }
    crackCount++;
  }
});

// Screen tooltip logic
screen.addEventListener("mouseenter", () => {
  screenTooltip.style.opacity = "1";
});

let lastMove = 0;

screen.addEventListener("mousemove", (e) => {
  const now = Date.now();

  if (now - lastMove < 30) return;
  lastMove = now;

  if (catFace.style.opacity === "1") {
    screenTooltip.innerHTML = "I dare you<br>to touch me...";
  } else {
    screenTooltip.innerHTML = "Please,<br>don't tap me twice!";
  }

  const screenMidpoint = rect.left + rect.width / 2;
  const tooltipX = e.clientX - rect.left + 22;
  const tooltipY = e.clientY - rect.top - 21;

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

const tooltipMessagesLength = tooltipMessages.length;
const calc = document.querySelector(".calculator-container");
let calcRect = calc.getBoundingClientRect();

window.addEventListener("resize", () => {
  calcRect = calc.getBoundingClientRect();
});

function showButtonTooltip(e) {
  const message =
    tooltipMessages[Math.floor(Math.random() * tooltipMessagesLength)];

  buttonTooltip.innerHTML = message;

  buttonTooltip.style.opacity = "0";
  buttonTooltip.style.display = "block";

  const rect = e.target.getBoundingClientRect();

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
  screenText.style.fontSize = "50px";

  const padding = 8;
  let currentSize = parseInt(screenText.style.fontSize, 10);
  while (
    screenText.scrollWidth > screen.clientWidth - padding * 2 &&
    currentSize > 1
  ) {
    currentSize -= 5;
    screenText.style.fontSize = currentSize + "px";
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
          const result = Function(
            '"use strict";return (' + safeExpression + ")"
          )();

          const displayResult = result.toString();

          if (!justEvaluated) {
            history.push(`${expression} = ${displayResult}`);
            updateHistoryUI();
          }

          if (displayResult === "404") {
            const oldExpression = displayResult;
            expression = "404: No Math Found...";
            adjustScreenFontSize();

            buttons.forEach((btn) => {
              btn.disabled = true;
              btn.classList.add("disable");
            });

            setTimeout(() => {
              adjustScreenFontSize();
              screenText.innerHTML =
                'Rebooting<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';

              setTimeout(() => {
                expression = oldExpression;
                adjustScreenFontSize();
                screenText.textContent = expression;

                buttons.forEach((btn) => {
                  btn.disabled = false;
                  btn.classList.remove("disable");
                });
              }, 3000);
            }, 2000);
          } else {
            expression = displayResult;
          }
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

  const newText = expression || "0";
  if (screenText.textContent !== newText && !catVisible) {
    screenText.textContent = newText;
    adjustScreenFontSize();
  }
}

// Buttons logic
let repeatInterval;
let repeatTimeout;

buttons.forEach((button) => {
  const value = button.textContent;

  const clearRepeatTimers = () => {
    clearInterval(repeatInterval);
    clearTimeout(repeatTimeout);
  };

  button.addEventListener("mousedown", (e) => {
    handleCalculatorInput(value);

    if (button.classList.contains("number-button")) {
      repeatInterval = setInterval(() => handleCalculatorInput(value), 200);
    }

    repeatTimeout = setTimeout(clearRepeatTimers, 2000);
  });

  ["mouseup", "mouseleave"].forEach((evt) =>
    button.addEventListener(evt, clearRepeatTimers)
  );
});

// Keys logic
let heldKeys = {};
let keyRepeatTimers = {};
let keyHoldTimeouts = {};
let stopRepeatingAfterHold = {};

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

document.addEventListener("keydown", (e) => {
  if (screenText.textContent === "ERROR") {
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
      return;
    }
    e.preventDefault();
    return;
  }

  const key = e.key;

  if (heldKeys[key]) return;
  heldKeys[key] = true;

  const buttonValue = keyMap[key] || key;
  const matchingButton = Array.from(buttons).find(
    (btn) => btn.textContent === buttonValue
  );

  if (!matchingButton) return;

  e.preventDefault();

  handleCalculatorInput(buttonValue);

  if (matchingButton.classList.contains("number-button")) {
    stopRepeatingAfterHold[key] = false;
    keyRepeatTimers[key] = setInterval(() => {
      if (!stopRepeatingAfterHold[key]) {
        handleCalculatorInput(buttonValue);
      }
    }, 200);
  }

  keyHoldTimeouts[key] = setTimeout(() => {
    const rect = matchingButton.getBoundingClientRect();
    const fakeEvent = {
      target: matchingButton,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
    };
    showButtonTooltip(fakeEvent);
    stopRepeatingAfterHold[key] = true;
    clearInterval(keyRepeatTimers[key]);
  }, 2000);
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
  const isActive = historyContainer.classList.contains("active");

  historyContainer.style.display = "block";
  requestAnimationFrame(() => {
    historyContainer.classList.toggle("active", !isActive);
  });

  historyButton.classList.add("fade-out");
  setTimeout(() => {
    if (!isActive) {
      historyButton.classList.add("close-mode");
      historyButton.innerHTML = "×";
    } else {
      historyButton.classList.remove("close-mode");
      historyButton.innerHTML = "";
    }
    historyButton.classList.remove("fade-out");

    if (isActive) {
      historyContainer.classList.remove("active");
      setTimeout(() => {
        if (!historyContainer.classList.contains("active")) {
          historyContainer.style.display = "none";
        }
      }, 400);
    }
  }, 200);
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
});

function updateHistoryUI(shouldSave = true) {
  historyList.innerHTML = "";

  if (history.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "There's no history yet.";
    emptyMessage.classList.add("empty-history");
    historyList.appendChild(emptyMessage);
  } else {
    const fragment = document.createDocumentFragment();
    history.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      fragment.appendChild(li);
    });
    historyList.appendChild(fragment);
  }

  if (shouldSave) {
    localStorage.setItem("history", JSON.stringify(history));
  }
}

// Inactivity logic
let inactivityTimer;
let lastExpression = "";
let catVisible = false;
const whiskersL = document.querySelector(".left-whiskers");
const whiskersR = document.querySelector(".right-whiskers");
const catFace = document.querySelector(".cat-face");
const audio = new Audio("./assets/audio/meow.mp3");
audio.preload = "auto";

function showCatFace() {
  if (catVisible) return;

  lastExpression = screenText.textContent;
  screenText.textContent = "";
  whiskersL.style.opacity = "1";
  whiskersR.style.opacity = "1";
  catFace.style.opacity = "1";
  catVisible = true;

  document.body.addEventListener("click", hideCatFaceWithSound, { once: true });
  document.addEventListener("keydown", hideCatFaceInstantly, { once: true });
  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("mouseenter", hideCatFaceInstantly, { once: true });
  });
}

function hideCatFaceWithSound() {
  if (!catVisible) return;

  audio.volume = 0.1;
  audio.currentTime = 0;
  audio.play();

  catFace.style.transition = "opacity 1s ease";
  whiskersL.style.transition = "opacity 1s ease";
  whiskersR.style.transition = "opacity 1s ease";

  setTimeout(() => {
    hideCatFaceInstantly();

    setTimeout(() => {
      catFace.style.transition = "opacity 0.6s ease";
      whiskersL.style.transition = "opacity 0.6s ease";
      whiskersR.style.transition = "opacity 0.6s ease";
    }, 2000);
  }, 500);
}

function hideCatFaceInstantly() {
  if (!catVisible) return;

  whiskersL.style.opacity = "0";
  whiskersR.style.opacity = "0";
  catFace.style.opacity = "0";
  catVisible = false;

  setTimeout(() => {
    screenText.textContent = lastExpression;
  }, 600);

  resetInactivityTimer();
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(showCatFace, 60000);
}

["click", "keydown", "touchstart"].forEach((evt) => {
  document.addEventListener(evt, resetInactivityTimer);
});

resetInactivityTimer();
