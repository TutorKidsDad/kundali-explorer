(() => {
  "use strict";
  const data = window.KUNDALI_DATA;
  const grid = document.getElementById("houseGrid");
  const panel = document.getElementById("detailsPanel");
  const search = document.getElementById("searchInput");
  const general = document.getElementById("generalContent");
  let selectedHouse = 1;

  function makeText(tag, text, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    return el;
  }

  function addLines(container, lines) {
    lines.forEach((line) => {
      const trimmed = String(line).trim();
      if (!trimmed) return;
      const isBullet = /^[•●▪\-]\s*/.test(trimmed);
      const p = makeText("p", trimmed.replace(/^[•●▪]\s*/, ""), "content-line" + (isBullet ? " bullet" : ""));
      container.appendChild(p);
    });
  }

  function renderHouseGrid(filterText = "") {
    grid.replaceChildren();
    const normalized = filterText.trim().toLocaleLowerCase();
    data.houses.forEach((house) => {
      const haystack = [house.number, house.hindi, house.names, house.subtitle, house.summary,
        ...house.sections.flatMap(section => [section.title, ...section.items])].join(" ").toLocaleLowerCase();
      const match = !normalized || haystack.includes(normalized);
      if (!match) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "house-button";
      button.setAttribute("aria-pressed", String(house.number === selectedHouse));
      button.setAttribute("aria-label", `House ${house.number}: ${house.hindi}`);
      button.append(
        makeText("span", String(house.number).padStart(2, "0"), "house-number"),
        makeText("span", house.hindi, "house-hindi"),
        makeText("span", house.subtitle, "house-short")
      );
      button.addEventListener("click", () => {
        selectedHouse = house.number;
        renderHouseGrid(search.value);
        renderHouse(house);
      });
      grid.appendChild(button);
    });
    if (!grid.children.length) {
      grid.appendChild(makeText("p", "No houses match that search. Try another word.", "no-results"));
    }
  }

  function renderHouse(house) {
    panel.replaceChildren();
    const header = document.createElement("div");
    header.className = "details-header";
    header.append(
      makeText("p", `HOUSE ${String(house.number).padStart(2, "0")} / 12`, "eyebrow"),
      makeText("h2", `${house.number}. ${house.subtitle}`),
      makeText("p", house.hindi, "house-alias")
    );
    panel.appendChild(header);
    const summary = makeText("div", house.summary, "summary");
    panel.appendChild(summary);
    house.sections.forEach((section, index) => {
      const details = document.createElement("details");
      details.className = "content-section";
      if (index === 0) details.open = true;
      const summaryEl = document.createElement("summary");
      summaryEl.textContent = section.title;
      const body = document.createElement("div");
      body.className = "section-body";
      addLines(body, section.items);
      details.append(summaryEl, body);
      panel.appendChild(details);
    });
  }

  function renderGeneral() {
    general.replaceChildren();
    data.general.forEach((section, index) => {
      const details = document.createElement("details");
      if (index === 0) details.open = true;
      const summaryEl = document.createElement("summary");
      summaryEl.textContent = section.title;
      const body = document.createElement("div");
      body.className = "section-body";
      addLines(body, section.items);
      details.append(summaryEl, body);
      general.appendChild(details);
    });
  }

  search.addEventListener("input", () => {
    renderHouseGrid(search.value);
    const normalized = search.value.trim().toLocaleLowerCase();
    if (normalized) {
      const first = data.houses.find((house) => {
        const haystack = [house.number, house.hindi, house.names, house.subtitle, house.summary,
          ...house.sections.flatMap(section => [section.title, ...section.items])].join(" ").toLocaleLowerCase();
        return haystack.includes(normalized);
      });
      if (first) {
        selectedHouse = first.number;
        renderHouseGrid(search.value);
        renderHouse(first);
      }
    } else {
      renderHouse(data.houses.find(h => h.number === selectedHouse));
    }
  });

  renderGeneral();
  renderHouseGrid();
  renderHouse(data.houses[0]);
})();