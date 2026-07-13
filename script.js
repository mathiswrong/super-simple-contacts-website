const contacts = [
  { name: "Ada Lovelace", detail: "Analytical Engines · ada@example.com", account: "Google", tags: "ada analytical engines example mathematician google work +16045550101" },
  { name: "Grace Hopper", detail: "US Navy · grace@example.com", account: "Microsoft", tags: "grace hopper navy compiler microsoft work" },
  { name: "Katherine Johnson", detail: "NASA · katherine@example.com", account: "Apple", tags: "katherine johnson nasa apple space favorites" },
  { name: "Margaret Hamilton", detail: "Apollo Software · margaret@example.com", account: "Google", tags: "margaret hamilton apollo software google engineering" },
  { name: "Alan Turing", detail: "Bletchley Park · alan@example.com", account: "Microsoft", tags: "alan turing bletchley park microsoft research" },
  { name: "Hedy Lamarr", detail: "Inventors · hedy@example.com", account: "Apple", tags: "hedy lamarr inventors apple wireless" },
  { name: "Radia Perlman", detail: "Network Engineering · radia@example.com", account: "Google", tags: "radia perlman network engineering google" },
  { name: "Evelyn Boyd Granville", detail: "IBM · evelyn@example.com", account: "Microsoft", tags: "evelyn boyd granville ibm microsoft mathematician" }
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const reveals = document.querySelectorAll(".reveal");
const parallaxItems = [...document.querySelectorAll("[data-parallax]")];

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -5%" });

reveals.forEach(item => revealObserver.observe(item));

let framePending = false;
function updateScrollEffects() {
  const scrollY = window.scrollY;
  header.classList.toggle("is-scrolled", scrollY > 30);
  if (!reduceMotion) {
    const viewMiddle = scrollY + window.innerHeight / 2;
    const verticalLimit = window.innerWidth < 650 ? 135 : Math.min(240, window.innerHeight * 0.3);
    const horizontalLimit = window.innerWidth < 650 ? 0 : 105;
    const rotationLimit = window.innerWidth < 650 ? 0 : 9;
    parallaxItems.forEach(item => {
      let itemTop = 0;
      let offsetNode = item;
      while (offsetNode) {
        itemTop += offsetNode.offsetTop;
        offsetNode = offsetNode.offsetParent;
      }
      const itemMiddle = itemTop + item.offsetHeight / 2;
      const speed = Number(item.dataset.parallax);
      const horizontalSpeed = Number(item.dataset.parallaxX || 0);
      const rotateSpeed = Number(item.dataset.parallaxRotate || 0);
      const distance = viewMiddle - itemMiddle;
      const offsetY = Math.max(-verticalLimit, Math.min(verticalLimit, distance * speed));
      const offsetX = Math.max(-horizontalLimit, Math.min(horizontalLimit, distance * horizontalSpeed));
      const rotation = Math.max(-rotationLimit, Math.min(rotationLimit, distance * rotateSpeed));
      item.style.setProperty("translate", `${offsetX}px ${offsetY}px`);
      item.style.setProperty("rotate", `${rotation}deg`);
    });
  }
  framePending = false;
}

window.addEventListener("scroll", () => {
  if (!framePending) {
    requestAnimationFrame(updateScrollEffects);
    framePending = true;
  }
}, { passive: true });

function initials(name) {
  return name.split(" ").map(part => part[0]).slice(0, 2).join("");
}

const demo = document.querySelector("[data-search-demo]");
const input = demo.querySelector("input");
const results = demo.querySelector(".results");
const time = demo.querySelector("[data-time]");

function renderResults() {
  const started = performance.now();
  const query = input.value.trim().toLowerCase();
  const found = contacts.filter(contact => `${contact.name} ${contact.detail} ${contact.account} ${contact.tags}`.toLowerCase().includes(query)).slice(0, 4);
  results.replaceChildren();

  if (!found.length) {
    const empty = document.createElement("div");
    empty.className = "no-results";
    empty.textContent = "No sample contacts found";
    results.append(empty);
  } else {
    found.forEach(contact => {
      const row = document.createElement("div");
      row.className = "result-row";
      const avatar = document.createElement("span");
      avatar.className = "result-avatar";
      avatar.textContent = initials(contact.name);
      const copy = document.createElement("span");
      copy.className = "result-copy";
      const name = document.createElement("strong");
      name.textContent = contact.name;
      const detail = document.createElement("span");
      detail.textContent = contact.detail;
      copy.append(name, detail);
      const account = document.createElement("span");
      account.className = "result-account";
      account.textContent = contact.account;
      row.append(avatar, copy, account);
      results.append(row);
    });
  }

  const elapsed = performance.now() - started;
  time.textContent = Math.max(0.1, elapsed).toFixed(1);
}

input.addEventListener("input", renderResults);
document.addEventListener("keydown", event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    input.focus();
    input.select();
  }
});

renderResults();
updateScrollEffects();

const launcherDemo = document.querySelector("[data-launcher-demo]");
const launcherInput = launcherDemo.querySelector("[data-launcher-input]");
const launcherResults = launcherDemo.querySelector("[data-launcher-results]");
const launcherTime = launcherDemo.querySelector("[data-launcher-time]");
const launcherIcon = launcherDemo.querySelector("[data-launcher-icon]");
const launcherName = launcherDemo.querySelector("[data-launcher-name]");
const launcherShortcut = launcherDemo.querySelector("[data-launcher-shortcut]");
const launcherWindow = launcherDemo.querySelector("[data-launcher-window]");
const launcherPrefix = launcherDemo.querySelector("[data-launcher-prefix]");
const launcherActions = [...launcherDemo.querySelectorAll("[data-launcher-action]")];
const launcherModes = document.querySelectorAll("[data-launcher-mode]");
const launcherQueries = ["grace", "nasa", "analytical", "microsoft"];
let launcherQueryIndex = 0;
let launcherTimer;
let launcherIsManual = false;
let launcherMode = "raycast";

function renderLauncherResults() {
  const started = performance.now();
  const query = launcherInput.value.trim().toLowerCase();
  const found = contacts.filter(contact => `${contact.name} ${contact.detail} ${contact.account} ${contact.tags}`.toLowerCase().includes(query)).slice(0, 4);
  launcherResults.replaceChildren();

  if (!found.length) {
    const empty = document.createElement("div");
    empty.className = "launcher-empty";
    empty.textContent = "No sample contacts found";
    launcherResults.append(empty);
  } else {
    found.forEach((contact, index) => {
      const row = document.createElement("div");
      row.className = `launcher-result${index === 0 ? " is-selected" : ""}`;
      const avatar = document.createElement(launcherMode === "alfred" ? "img" : "span");
      avatar.className = "launcher-result-avatar";
      if (launcherMode === "alfred") {
        avatar.src = "assets/app-icon.png";
        avatar.alt = "";
      } else {
        avatar.textContent = initials(contact.name);
      }
      const copy = document.createElement("span");
      copy.className = "launcher-result-copy";
      const name = document.createElement("strong");
      name.textContent = contact.name;
      const detail = document.createElement("span");
      detail.textContent = launcherMode === "alfred" ? contact.detail : contact.detail.split("·")[0].trim();
      copy.append(name, detail);
      const account = document.createElement("span");
      account.className = "launcher-result-account";
      account.textContent = launcherMode === "alfred" ? (index === 0 ? "↩" : String(index + 1)) : contact.detail.split("·").at(-1).trim();
      row.append(avatar, copy, account);
      launcherResults.append(row);
    });
  }

  launcherTime.textContent = Math.max(0.1, performance.now() - started).toFixed(1);
}

function scheduleLauncherPreview() {
  if (reduceMotion || launcherIsManual) return;
  window.clearTimeout(launcherTimer);
  const nextQuery = launcherQueries[launcherQueryIndex % launcherQueries.length];
  launcherQueryIndex += 1;
  let position = 0;
  launcherInput.value = "";
  renderLauncherResults();

  function typeNext() {
    if (launcherIsManual) return;
    if (position < nextQuery.length) {
      launcherInput.value += nextQuery[position];
      position += 1;
      renderLauncherResults();
      launcherTimer = window.setTimeout(typeNext, 72);
    } else {
      launcherTimer = window.setTimeout(scheduleLauncherPreview, 1750);
    }
  }

  launcherTimer = window.setTimeout(typeNext, 300);
}

launcherInput.addEventListener("input", () => {
  launcherIsManual = true;
  window.clearTimeout(launcherTimer);
  renderLauncherResults();
});

launcherModes.forEach(button => {
  button.addEventListener("click", () => {
    const isRaycast = button.dataset.launcherMode === "raycast";
    launcherMode = isRaycast ? "raycast" : "alfred";
    launcherModes.forEach(mode => mode.setAttribute("aria-pressed", String(mode === button)));
    launcherWindow.classList.toggle("mode-raycast", isRaycast);
    launcherWindow.classList.toggle("mode-alfred", !isRaycast);
    launcherPrefix.hidden = isRaycast;
    launcherIcon.src = isRaycast ? "assets/raycast-icon.png" : "assets/alfred-icon.png";
    launcherName.textContent = isRaycast ? "Search Super Simple Contacts · Raycast" : "cp · Super Simple Contacts workflow";
    launcherShortcut.textContent = "⌥ Space";
    const actionCopy = isRaycast
      ? ["↵|Open in Super Simple Contacts", "⌘ K|Actions", "⌘ C|Copy Email", "|Call"]
      : ["↩|Open contact", "⌘ ↩|Email", "⌥ ↩|Call", "⌘ C|Copy"];
    launcherActions.forEach((action, index) => {
      const [keys, label] = actionCopy[index].split("|");
      action.hidden = !keys;
      action.querySelector("kbd").textContent = keys;
      action.lastChild.textContent = ` ${label}`;
    });
    renderLauncherResults();
    launcherInput.focus();
  });
});

renderLauncherResults();
scheduleLauncherPreview();
