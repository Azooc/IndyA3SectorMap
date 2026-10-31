(function () {
  "use strict";

  const K = 1.25;            // source-map px -> design px (gives the blanks a little more room than the original text)
  const MAP_W = 833 * K;
  const MAP_H = 843 * K;
  const TEXT_NUDGE = 2;      // lifts each label so its capital letters start where the source text did

  const $ = (id) => document.getElementById(id);
  const svg = $("lines");
  const labels = $("labels");
  const map = $("map");
  const sizer = $("map-sizer");
  const scroller = $("map-scroll");
  const statusEl = $("status");
  const tip = $("tip");
  const retryBtn = $("btn-retry");

  const KINDS = [
    ["name", "Names"],
    ["num", "Sector #"],
    ["fl", "Altitudes"],
    ["freq", "Frequencies"],
  ];

  const items = [];   // one per thing to remember: { sector, kind, fields }
  const fields = [];  // one per blank: { el, answer, accept, item, digits, state, typed }
  let mode = "answers"; // "answers" | "quiz" | "checked"

  // ---------- boundaries ----------

  const NS = "http://www.w3.org/2000/svg";
  [["lo", BOUNDARIES.low], ["hi", BOUNDARIES.high]].forEach(([cls, polys]) => {
    polys.forEach((pts) => {
      const line = document.createElementNS(NS, "polyline");
      line.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
      line.setAttribute("class", cls);
      svg.appendChild(line);
    });
  });

  // ---------- sector labels ----------

  const norm = (v) => v.toUpperCase().replace(/\s+/g, "");

  function sep(text) {
    const s = document.createElement("span");
    s.className = "sep";
    s.textContent = text;
    return s;
  }

  function addField(row, item, answer, opts) {
    const el = document.createElement("input");
    el.className = "f";
    el.type = "text";
    el.placeholder = " ";
    el.autocomplete = "off";
    el.spellcheck = false;
    el.setAttribute("autocapitalize", "characters");
    el.setAttribute("autocorrect", "off");
    el.setAttribute("aria-label", item.sector.id + " " + opts.label);
    if (opts.digits) el.inputMode = "numeric";
    if (opts.max) el.maxLength = opts.max;
    el.style.setProperty("--w", opts.width);

    const f = {
      el,
      answer,
      accept: opts.accept || [norm(answer)],
      item,
      digits: !!opts.digits,
      state: null,
      typed: null,
    };
    el._field = f;
    item.fields.push(f);
    fields.push(f);
    row.appendChild(el);
  }

  SECTORS.forEach((s) => {
    const block = document.createElement("div");
    block.className = "sector " + (/\bLO$/.test(s.id) ? "lo" : "hi");
    block.style.left = s.x * K + "px";
    block.style.top = s.y * K - TEXT_NUDGE + "px";

    const sid = document.createElement("div");
    sid.className = "sid";
    sid.textContent = s.id;
    block.appendChild(sid);

    const newItem = (kind) => {
      const it = { sector: s, kind, fields: [] };
      items.push(it);
      return it;
    };
    const newRow = () => {
      const r = document.createElement("div");
      r.className = "row";
      block.appendChild(r);
      return r;
    };

    if (s.name) {
      addField(newRow(), newItem("name"), s.name, {
        label: "name",
        width: Math.max(s.name.length, 4) * 1.1 + 0.5,
      });
    }

    // "84 FL240-FL340" / "94 FL350+" / "21 FL230-"
    const alt = newRow();
    addField(alt, newItem("num"), s.num, {
      label: "sector number",
      width: s.num.length + (/[A-Z]/i.test(s.num) ? 0.6 : 0),
      max: s.num.length,
    });
    alt.appendChild(sep(" FL"));
    const fl = newItem("fl");
    const m = s.fl.match(/^(\d+)(?:-(\d+)|([+-]))$/);
    addField(alt, fl, m[1], { label: m[2] ? "bottom altitude" : "altitude", width: 3, max: 3, digits: true });
    if (m[2]) {
      alt.appendChild(sep("-FL"));
      addField(alt, fl, m[2], { label: "top altitude", width: 3, max: 3, digits: true });
    } else {
      alt.appendChild(sep(m[3]));
    }

    // "134.22" — "128.6" also accepts "128.60"
    const fq = newRow();
    const [whole, dec] = s.freq.split(".");
    const freq = newItem("freq");
    addField(fq, freq, whole, { label: "frequency", width: 3, max: 3, digits: true });
    fq.appendChild(sep("."));
    addField(fq, freq, dec, {
      label: "frequency decimals",
      width: 2,
      max: 2,
      digits: true,
      accept: dec.length === 1 ? [dec, dec + "0"] : [dec],
    });

    labels.appendChild(block);
  });

  // ---------- actions ----------

  function setState(f, state) {
    f.state = state;
    f.el.classList.toggle("ok", state === "ok");
    f.el.classList.toggle("bad", state === "bad");
  }

  function fillAll() {
    hideTip();
    fields.forEach((f) => {
      f.el.value = f.answer;
      f.typed = null;
      setState(f, null);
    });
    mode = "answers";
    render();
  }

  function clearAll() {
    hideTip();
    fields.forEach((f) => {
      f.el.value = "";
      f.typed = null;
      setState(f, null);
    });
    mode = "quiz";
    render();
  }

  function check() {
    hideTip();
    fields.forEach((f) => {
      if (f.state === "bad") return; // untouched since last check: still showing the revealed answer
      if (f.accept.includes(norm(f.el.value))) {
        setState(f, "ok");
      } else {
        f.typed = f.el.value.trim();
        f.el.value = f.answer;
        setState(f, "bad");
      }
    });
    mode = "checked";
    render();
  }

  function retryMissed() {
    hideTip();
    const missed = fields.filter((f) => f.state === "bad");
    missed.forEach((f) => {
      f.el.value = "";
      f.typed = null;
      setState(f, null);
    });
    mode = "quiz";
    render();
    if (missed.length) missed[0].el.focus();
  }

  function move(f, dir) {
    const next = fields[fields.indexOf(f) + dir];
    if (next) {
      next.el.focus();
      next.el.select();
    }
  }

  // ---------- status bar ----------

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function render() {
    document.body.dataset.mode = mode;
    retryBtn.hidden = !fields.some((f) => f.state === "bad");
    statusEl.replaceChildren();

    if (mode === "answers") {
      const msg = el("span", "msg");
      msg.append("Showing every answer. Study the map, then hit ", el("strong", null, "Clear"), " to quiz yourself.");
      statusEl.append(msg);
      return;
    }

    if (mode === "quiz") {
      const filled = fields.filter((f) => f.el.value.trim()).length;
      const bar = el("div", "progress");
      const fillBar = el("i");
      fillBar.style.width = (100 * filled) / fields.length + "%";
      bar.append(fillBar);
      const msg = el("span", "msg");
      msg.append(el("strong", null, filled + " / " + fields.length), " blanks filled");
      if (filled === fields.length) msg.append(" — hit ", el("strong", null, "Check answers"));
      statusEl.append(bar, msg);
      return;
    }

    const right = items.filter((it) => it.fields.every((f) => f.state === "ok")).length;
    const pct = Math.round((100 * right) / items.length);
    const perfect = right === items.length;
    const score = el("span", "score" + (perfect ? " perfect" : ""));
    score.append(el("b", null, perfect ? "Perfect!" : pct + "%"), right + " / " + items.length + " correct");

    const breakdown = el("div", "breakdown");
    KINDS.forEach(([kind, label]) => {
      const group = items.filter((it) => it.kind === kind);
      const ok = group.filter((it) => it.fields.every((f) => f.state === "ok")).length;
      breakdown.append(el("span", ok === group.length ? "all" : "miss", label + " " + ok + "/" + group.length));
    });
    statusEl.append(score, breakdown);
  }

  // ---------- tooltip (what you typed, for missed blanks) ----------

  function showTip(f) {
    if (f.state !== "bad") return hideTip();
    tip.replaceChildren();
    if (f.typed) tip.append("You entered ", el("b", null, f.typed.toUpperCase()));
    else tip.append("Left blank");
    const r = f.el.getBoundingClientRect();
    tip.style.left = r.left + r.width / 2 + "px";
    tip.style.top = r.top + "px";
    tip.hidden = false;
  }

  function hideTip() {
    tip.hidden = true;
  }

  // ---------- input handling ----------

  labels.addEventListener("input", (e) => {
    const f = e.target._field;
    if (!f) return;
    if (f.digits) {
      const v = f.el.value.replace(/\D/g, "");
      if (v !== f.el.value) f.el.value = v;
    }
    if (f.state) {
      f.typed = null;
      setState(f, null);
      hideTip();
    }
    mode = "quiz";
    render();
    const typing = !e.inputType || e.inputType.startsWith("insert");
    if (typing && f.el.maxLength > 0 && f.el.value.length >= f.el.maxLength) move(f, 1);
  });

  labels.addEventListener("keydown", (e) => {
    const f = e.target._field;
    if (!f) return;
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      move(f, e.shiftKey ? -1 : 1);
    } else if (e.key === "Backspace" && f.el.value === "") {
      e.preventDefault();
      move(f, -1);
    }
  });

  // Select the whole blank on focus so typing replaces it. A mouse click would
  // collapse that selection on mouseup, so swallow the first mouseup after a click-to-focus.
  let clickFocus = null;
  labels.addEventListener("mousedown", (e) => {
    const f = e.target._field;
    clickFocus = f && document.activeElement !== f.el ? f : null;
  });
  labels.addEventListener("mouseup", (e) => {
    if (clickFocus && e.target === clickFocus.el) {
      e.preventDefault();
      clickFocus.el.select();
    }
    clickFocus = null;
  });

  labels.addEventListener("focusin", (e) => {
    const f = e.target._field;
    if (!f) return;
    f.el.select();
    showTip(f);
  });
  labels.addEventListener("focusout", hideTip);

  labels.addEventListener("mouseover", (e) => {
    const f = e.target._field;
    if (f) showTip(f);
  });
  labels.addEventListener("mouseout", (e) => {
    if (!e.target._field) return;
    const active = document.activeElement && document.activeElement._field;
    if (active && active.state === "bad") showTip(active);
    else hideTip();
  });

  window.addEventListener("scroll", hideTip, { passive: true });
  scroller.addEventListener("scroll", hideTip, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      check();
    }
  });

  $("btn-clear").addEventListener("click", clearAll);
  $("btn-check").addEventListener("click", check);
  $("btn-fill").addEventListener("click", fillAll);
  retryBtn.addEventListener("click", retryMissed);

  // ---------- zoom ----------

  let zoom = null; // null = fit to width
  try {
    zoom = parseFloat(localStorage.getItem("a3-zoom")) || null;
  } catch (e) {}
  let lastScale = 0;

  function fitScale() {
    const cs = getComputedStyle(scroller);
    const avail = scroller.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    // On phones, stay big enough to read and let the map pan instead of shrinking to fit.
    return Math.min(Math.max(avail / MAP_W, 0.7), 1.4);
  }

  function applyZoom() {
    const s = zoom || fitScale();
    $("zoom-fit").setAttribute("aria-pressed", String(!zoom));
    if (Math.abs(s - lastScale) < 0.001) return;
    lastScale = s;
    map.style.transform = "scale(" + s + ")";
    sizer.style.width = MAP_W * s + "px";
    sizer.style.height = MAP_H * s + "px";
    hideTip();
  }

  function setZoom(z) {
    zoom = z;
    try {
      if (z) localStorage.setItem("a3-zoom", String(z));
      else localStorage.removeItem("a3-zoom");
    } catch (e) {}
    applyZoom();
  }

  $("zoom-in").addEventListener("click", () => setZoom(Math.min((zoom || fitScale()) * 1.15, 2.6)));
  $("zoom-out").addEventListener("click", () => setZoom(Math.max((zoom || fitScale()) / 1.15, 0.35)));
  $("zoom-fit").addEventListener("click", () => setZoom(null));
  new ResizeObserver(() => {
    if (!zoom) applyZoom();
  }).observe(scroller);

  // ---------- theme ----------

  $("theme-toggle").addEventListener("click", () => {
    const t = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = t;
    try {
      localStorage.setItem("a3-theme", t);
    } catch (e) {}
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    let saved = null;
    try {
      saved = localStorage.getItem("a3-theme");
    } catch (err) {}
    if (!saved) document.documentElement.dataset.theme = e.matches ? "dark" : "light";
  });

  // ---------- start ----------

  applyZoom();
  fillAll();
})();
