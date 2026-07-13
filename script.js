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
    parallaxItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemMiddle = scrollY + rect.top + rect.height / 2;
      const speed = Number(item.dataset.parallax);
      const offset = Math.max(-90, Math.min(90, (viewMiddle - itemMiddle) * speed));
      item.style.setProperty("translate", `0 ${offset}px`);
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
