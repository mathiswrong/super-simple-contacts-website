const contacts = [
  { name: "Arden Vale", detail: "Copper Kite Studio · arden.vale@example.com", account: "Google", tags: "arden vale copper kite studio creative director google work +16045550101" },
  { name: "Briar Calder", detail: "Orbit & Oak · briar.calder@example.com", account: "Microsoft", tags: "briar calder orbit oak product microsoft work" },
  { name: "Cleo Marlow", detail: "Paper Lantern Labs · cleo.marlow@example.com", account: "Apple", tags: "cleo marlow paper lantern labs apple design favorites" },
  { name: "Dax Everly", detail: "Cloudberry House · dax.everly@example.com", account: "Google", tags: "dax everly cloudberry house google founder" },
  { name: "Elara Finch", detail: "Blue Finch Research · elara.finch@example.com", account: "Microsoft", tags: "elara finch blue research microsoft" },
  { name: "Felix Rowan", detail: "Copper Kite Studio · felix.rowan@example.com", account: "Apple", tags: "felix rowan copper kite apple design systems" },
  { name: "Greta Hollis", detail: "Mossline Coffee · greta.hollis@example.com", account: "Google", tags: "greta hollis mossline coffee google owner" },
  { name: "Imani Sable", detail: "Bright Thread Co · imani.sable@example.com", account: "Microsoft", tags: "imani sable bright thread microsoft community" }
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const siteLoader = document.querySelector("[data-site-loader]");
const syncPulse = document.querySelector("[data-sync-pulse]");
let loaderFinished = false;

function finishSiteLoader() {
  if (loaderFinished || !siteLoader) return;
  loaderFinished = true;
  siteLoader.classList.add("is-complete");
  document.body.classList.remove("is-loading");
  window.setTimeout(() => siteLoader.remove(), 420);
}

function lottieStrokeColor(layer, fallback) {
  const stroke = layer?.shapes?.flatMap(shape => shape.it || []).find(shape => shape.ty === "st");
  const color = stroke?.c?.k;
  if (!Array.isArray(color)) return fallback;
  return `rgb(${color.slice(0, 3).map(channel => Math.round(channel * 255)).join(", ")})`;
}

async function playSyncPulse() {
  if (!siteLoader || !syncPulse || reduceMotion) {
    window.setTimeout(finishSiteLoader, reduceMotion ? 80 : 500);
    return;
  }

  try {
    const response = await fetch("assets/sync-pulse.json");
    if (!response.ok) throw new Error("Sync pulse unavailable");
    const animationData = await response.json();
    const duration = Math.min(1600, Math.max(900, (animationData.op - animationData.ip) / animationData.fr * 1000));
    const logoAsset = animationData.assets?.find(asset => asset.p);
    const pulseLayers = animationData.layers?.filter(layer => layer.nm?.startsWith("Sync Pulse")) || [];
    const logo = document.createElement("img");
    const firstRing = document.createElement("span");
    const secondRing = document.createElement("span");

    logo.className = "sync-pulse-logo";
    logo.src = `assets/${logoAsset?.u || ""}${logoAsset?.p || "app-icon.png"}`;
    logo.alt = "";
    firstRing.className = "sync-pulse-ring";
    secondRing.className = "sync-pulse-ring";
    firstRing.style.setProperty("--pulse-color", lottieStrokeColor(pulseLayers[0], "#4250ff"));
    secondRing.style.setProperty("--pulse-color", lottieStrokeColor(pulseLayers[1], "#ff5663"));
    syncPulse.replaceChildren(firstRing, secondRing, logo);

    const logoAnimation = logo.animate([
      { opacity: 0, transform: "translate(-50%, -50%) scale(.58)" },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1.05)", offset: .32 },
      { opacity: 1, transform: "translate(-50%, -50%) scale(.98)", offset: .54 },
      { opacity: 1, transform: "translate(-50%, -50%) scale(1)" }
    ], { duration, easing: "cubic-bezier(.22,.72,.2,1)", fill: "forwards" });
    const ringAnimations = [firstRing, secondRing].map((ring, index) => ring.animate([
      { opacity: 0, transform: "translate(-50%, -50%) scale(.55)" },
      { opacity: .54 - index * .1, offset: .16, transform: "translate(-50%, -50%) scale(.68)" },
      { opacity: 0, transform: "translate(-50%, -50%) scale(1.55)" }
    ], {
      delay: 100 + index * 330,
      duration: duration * .68,
      easing: "cubic-bezier(.2,.7,.2,1)",
      fill: "forwards"
    }));

    await Promise.all([logoAnimation.finished, ...ringAnimations.map(animation => animation.finished)]);
    window.setTimeout(finishSiteLoader, 80);
  } catch {
    finishSiteLoader();
  }
}

playSyncPulse();
window.setTimeout(finishSiteLoader, 2200);

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

document.querySelectorAll("[data-group-toggle]").forEach(button => {
  button.addEventListener("click", () => {
    const isMember = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!isMember));
    const status = button.closest("[data-inline-groups]")?.querySelector("[data-group-status]");
    if (status) {
      status.textContent = `${isMember ? "Removed from" : "Added to"} ${button.dataset.groupToggle}`;
    }
  });
});

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
const launcherQueries = ["arden", "design", "copper", "microsoft"];
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
