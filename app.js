// ===== Helpers & constants =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const year = new Date().getFullYear();
const SEP = 8; // September

// ===== Reveal on scroll =====
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal-on-scroll").forEach((el) => io.observe(el));

const letterLines = [
  "Dạo này đầu tớ hơi rối… nhiều thứ kéo tớ đi theo những hướng khác nhau.",
  "Có lúc tớ thấy muốn bước tiếp cùng cậu, có lúc lại chùn bước.",
  "Tớ không chắc nếu nói ra, mọi thứ sẽ tốt hơn… hay tệ đi.",
  "Nhưng giữ mãi trong lòng thì cũng không phải điều tớ muốn.",
  "Nếu cậu đọc được những dòng này, mong cậu hiểu ý tớ: đó là sự chân thành.",
  "Chỉ là một lần nói thật lòng — về cậu, về chúng ta.",
  "Và nếu câu trả lời chưa rõ ràng… thì tối nào đó, cho tớ cơ hội được kể nhiều hơn nhé."
];
const typeEl = document.querySelector("#typewriter");
let typingTimer = null;

const textNode = document.createTextNode("");
const caret = document.createElement("span");
caret.className = "caret";
typeEl.innerHTML = ""; 
typeEl.append(textNode, caret); 

function nextDelay(ch) {
  if (ch === "." || ch === "!" || ch === "?" || ch === "…") return 420;
  if (ch === "," || ch === ";") return 240;
  return 42;
}

function typeLetter(lines) {
  clearTimeout(typingTimer);
  textNode.data = "";
  typeEl.classList.add("is-typing"); 
  typeEl.classList.remove("is-done"); 
  let L = 0, i = 0;
  let out = "";

  function step() {
    if (L >= lines.length) {
      typeEl.textContent = out;
      typeEl.classList.remove("is-typing"); 
      typeEl.classList.add("is-done"); 
      typeEl.style.removeProperty("--caret-blink");
      return;
    }
    const line = lines[L];
    const ch = line[i];
    out += ch ?? "";
    textNode.data = out;

    i++;
    let delay;
    if (i >= line.length) {
      out += L < lines.length - 1 ? "\n" : "";
      i = 0;
      L++;
      delay = 380;
    } else {
      delay = nextDelay(ch);
    }
    const blink = Math.max(0.38, Math.min(0.8, delay / 700));
    typeEl.style.setProperty("--caret-blink", `${blink}s`);

    typingTimer = setTimeout(step, delay);
  }
  step();
}
typeLetter(letterLines);


const svg = $("#constellationSVG");
const likesList = $("#likesList");

const romanticIcons = [
  "🌸",
  "🌙",
  "✨",
  "💖",
  "💫",
  "🌷",
  "🕊️",
  "💌",
  "🎐",
  "⭐",
  "🌿",
  "🍯",
  "💐",
  "🌻",
  "🫶",
];

const starsData = [
  [6, 20, "Ánh mắt khi nhìn tớ"],
  [20, 14, "Má lúm"],
  [34, 26, "Cách cậu lắng nghe"],
  [48, 18, "Sự tinh tế"],
  [62, 30, "Sự quan tâm dành cho tớ"],
  [76, 20, "Những điều tử tế"],
  [88, 34, "Sự chân thành"],
  [96, 18, "Sự bao dung và chờ đợi"],
];

let lit = new Set();
let lineEls = []; 
let lineActiveEls = []; 
let litLines = new Set(); 
const likeItems = new Map(); 

function trimLine(x1, y1, x2, y2, rStart = 1.5, rEnd = 1.5) {
  const dx = x2 - x1,
    dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len,
    uy = dy / len;
  return [x1 + ux * rStart, y1 + uy * rStart, x2 - ux * rEnd, y2 - uy * rEnd];
}

function drawSky() {
  for (let i = 0; i < starsData.length - 1; i++) {
    const [x1, y1] = starsData[i],
      [x2, y2] = starsData[i + 1];
    const [tx1, ty1, tx2, ty2] = trimLine(x1, y1, x2, y2, 1.5, 1.5);

    const base = document.createElementNS("http://www.w3.org/2000/svg", "line");
    base.setAttribute("x1", tx1);
    base.setAttribute("y1", ty1);
    base.setAttribute("x2", tx2);
    base.setAttribute("y2", ty2);
    base.setAttribute("class", "line");
    svg.appendChild(base);
    lineEls.push(base);

    const active = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    active.setAttribute("x1", tx1);
    active.setAttribute("y1", ty1);
    active.setAttribute("x2", tx2);
    active.setAttribute("y2", ty2);
    active.setAttribute("class", "line-active");
    svg.appendChild(active);
    lineActiveEls.push(active);

    const len = active.getTotalLength();
    active.style.setProperty("--len", len);
    active.style.strokeDasharray = String(len);
    active.style.strokeDashoffset = String(len);
  }

  starsData.forEach(([x, y, label], idx) => {
    const star = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    star.setAttribute("cx", x);
    star.setAttribute("cy", y);
    star.setAttribute("r", 1.3);
    star.setAttribute("class", "star");
    star.setAttribute("tabindex", "0");

    const onStar = () => {
      if (!lit.has(idx)) {
        lit.add(idx);
        star.classList.add("lit");
        addLike(idx, label);
      } else {
        lit.delete(idx);
        star.classList.remove("lit");
        removeLike(idx);
      }
      updateLines();
      progress();
    };

    star.addEventListener("click", onStar);
    star.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onStar();
    });
    svg.appendChild(star);
  });
}

function addLike(idx, text) {
  if (likeItems.has(idx)) return;
  const li = document.createElement("li");
  const icon = romanticIcons[Math.floor(Math.random() * romanticIcons.length)];
  li.textContent = `${icon} ${text}`;
  likesList.appendChild(li);
  likeItems.set(idx, li);
}

function removeLike(idx) {
  const li = likeItems.get(idx);
  if (li) {
    li.remove();
    likeItems.delete(idx);
  }
}

function updateLines() {
  litLines.clear();
  for (let i = 0; i < lineActiveEls.length; i++) {
    const active = lineActiveEls[i];
    const len =
      parseFloat(active.style.getPropertyValue("--len")) ||
      active.getTotalLength();
    const ready = lit.has(i) && lit.has(i + 1);
    if (ready) {
      void active.getBoundingClientRect();
      active.style.strokeDashoffset = "0";
      litLines.add(i);
    } else {
      active.style.strokeDashoffset = String(len);
    }
  }
}
function progress() {
  const pct = Math.round((lit.size / starsData.length) * 100);
  $("#starsProgress").style.width = pct + "%";

  const msg = $("#constellationReveal");
  if (lit.size === starsData.length) {
    msg.hidden = false;
    msg.classList.add("show");
    msg.classList.remove("sparkle");
    void msg.offsetWidth;
    msg.classList.add("sparkle");
  } else {
    msg.classList.remove("show", "sparkle");
    msg.hidden = true;
  }
}
drawSky();

const calGrid = $("#calGrid");
const chosenBanner = $("#chosenBanner");
const chosenText = $("#chosenText");

let selectedCell = null;
let selectedDate = null;

function fmtBanner(d) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}
function clearChosen() {
  selectedCell = null;
  selectedDate = null;
  localStorage.removeItem("chosenDate");
  chosenText.textContent = "Mình có một tối dành cho nhau…";
  chosenBanner.hidden = true;
  chosenText.classList.remove("banner-pop");
}
function applyChosen(d, animate) {
  selectedDate = d;
  chosenBanner.hidden = false;
  chosenText.textContent = `Giữ cho tớ tối ${fmtBanner(
    d
  )} nhé.`;
  if (animate) {
    chosenText.classList.remove("animate");
    void chosenText.offsetWidth;
    chosenText.classList.add("animate");
  }
}

function buildCalendar() {
  calGrid.innerHTML = "";
  const firstDay = new Date(year, SEP, 1);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = 0; i < startOffset; i++)
    calGrid.appendChild(document.createElement("div"));
  const lastDate = 30;
  for (let d = 1; d <= lastDate; d++) {
    const dateObj = new Date(year, SEP, d);
    const cell = document.createElement("div");
    cell.className = "day";
    const num = document.createElement("div");
    num.className = "num";
    num.textContent = d;
    cell.appendChild(num);

    if (d < 8 || d > 19) cell.classList.add("disabled");

    const wd = dateObj.getDay();
    if (d >= 8 && d <= 19 && (wd === 5 || wd === 6 || wd === 0)) {
      cell.classList.add("suggest");
      const ic = document.createElement("div");
      ic.className = "hint-ic";
      ic.textContent = wd === 5 ? "🌙" : wd === 6 ? "✨" : "❤️";
      ic.title = "Gợi ý ngày đẹp";
      cell.appendChild(ic);
    }

    if (d >= 8 && d <= 19) {
      cell.addEventListener("click", (e) => {
        const rect = cell.getBoundingClientRect();
        cell.style.setProperty(
          "--x",
          ((e.clientX - rect.left) / rect.width) * 100 + "%"
        );
        cell.style.setProperty(
          "--y",
          ((e.clientY - rect.top) / rect.height) * 100 + "%"
        );
        cell.classList.add("rippling");
        setTimeout(() => cell.classList.remove("rippling"), 500);

        if (selectedCell === cell) {
          cell.classList.remove("selected");
          clearChosen();
          return;
        }

        if (selectedCell) {
          selectedCell.classList.remove("selected");
        }
        cell.classList.add("selected");
        selectedCell = cell;
        localStorage.setItem("chosenDate", dateObj.toISOString());
        applyChosen(dateObj, true);
      });
    }
    calGrid.appendChild(cell);
  }
}
buildCalendar();

(function restoreFromStorage() {
  const stored = localStorage.getItem("chosenDate");
  if (!stored) return;
  const d = new Date(stored);
  if (d.getMonth() === SEP && d.getDate() >= 8 && d.getDate() <= 19) {
    const firstDay = new Date(year, SEP, 1);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const index = startOffset + d.getDate() - 1;
    const cell = calGrid.children[index];
    if (cell) {
      cell.classList.add("selected");
      selectedCell = cell;
      applyChosen(d, false);
    }
  } else {
    clearChosen();
  }
})();
