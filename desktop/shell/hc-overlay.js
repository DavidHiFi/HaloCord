// HaloCord overlay window: voice widget and notification toasts. Event driven, no timers while idle.
(function () {
    const $ = id => document.getElementById(id);
    const voiceEl = $("voice"), list = $("members"), toasts = $("toasts");
    const rows = new Map();
    const TOAST_MS = 6000, MAX_TOASTS = 3;
    let state = { cfg: null, voice: null, locked: true, pos: null };

    function icon(id) {
        const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"), u = document.createElementNS("http://www.w3.org/2000/svg", "use");
        u.setAttribute("href", "#" + id);
        s.appendChild(u);
        return s;
    }

    function row(m) {
        let r = rows.get(m.id);
        if (!r) {
            const li = document.createElement("li"), av = document.createElement("div"), im = document.createElement("img");
            const name = document.createElement("div"), icons = document.createElement("div");
            av.className = "av";
            name.className = "name";
            icons.className = "icons";
            im.alt = "";
            av.appendChild(im);
            li.append(av, name, icons);
            r = { li, im, name, icons, key: "" };
            rows.set(m.id, r);
        }
        if (r.im.getAttribute("src") !== m.avatar) m.avatar ? r.im.setAttribute("src", m.avatar) : r.im.removeAttribute("src");
        if (r.name.textContent !== m.name) r.name.textContent = m.name;
        const k = (m.mute ? "m" : "") + (m.deaf ? "d" : "");
        if (r.key !== k) {
            r.key = k;
            r.icons.replaceChildren(...(m.mute ? [icon("i-mute")] : []), ...(m.deaf ? [icon("i-deaf")] : []));
        }
        r.li.classList.toggle("speaking", m.speaking && !m.mute);
        return r;
    }

    function place() {
        const p = state.pos;
        if (!p) return;
        voiceEl.style.left = Math.max(0, Math.min(p.x, innerWidth - 60)) + "px";
        voiceEl.style.top = Math.max(0, Math.min(p.y, innerHeight - 40)) + "px";
    }

    function render() {
        const c = state.cfg || {}, members = (state.voice && state.voice.members) || [];
        document.body.classList.toggle("unlocked", !state.locked);
        $("key").textContent = c.keybind || "";
        voiceEl.classList.toggle("small", c.avatarSize === "small");
        voiceEl.style.opacity = toasts.style.opacity = state.locked ? (c.opacity || 100) / 100 : 1;
        toasts.className = c.notifPos || "bottomRight";
        const seen = new Set(), order = [];
        for (const m of members) {
            const r = row(m), talking = m.speaking && !m.mute;
            seen.add(m.id);
            r.li.hidden = c.displayUsers === "speaking" && !talking;
            r.name.hidden = c.displayNames === "never" || (c.displayNames === "speaking" && !talking);
            order.push(r.li);
        }
        for (const [id, r] of rows) if (!seen.has(id)) { r.li.remove(); rows.delete(id); }
        order.forEach((li, i) => { if (list.children[i] !== li) list.insertBefore(li, list.children[i] || null); });
        voiceEl.classList.toggle("none", members.length === 0);
        place();
    }

    function toast(t) {
        const el = document.createElement("div"), im = document.createElement("img"), txt = document.createElement("div");
        const b = document.createElement("b"), s = document.createElement("span");
        el.className = "toast";
        im.alt = "";
        if (t.icon) im.src = t.icon;
        b.textContent = t.title;
        s.textContent = t.body;
        txt.append(b, s);
        el.append(im, txt);
        toasts.appendChild(el);
        while (toasts.children.length > MAX_TOASTS) toasts.firstChild.remove();
        void el.offsetWidth;
        el.classList.add("in");
        setTimeout(() => {
            el.classList.remove("in");
            setTimeout(() => el.remove(), 300);
        }, TOAST_MS);
    }

    // Dragging while unlocked; the position is saved relative to the display.
    voiceEl.addEventListener("pointerdown", e => {
        if (state.locked) return;
        const r = voiceEl.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
        voiceEl.setPointerCapture(e.pointerId);
        const move = ev => {
            state.pos = { x: ev.clientX - dx, y: ev.clientY - dy };
            place();
        };
        const up = () => {
            voiceEl.removeEventListener("pointermove", move);
            voiceEl.removeEventListener("pointerup", up);
            voiceEl.removeEventListener("pointercancel", up);
            if (state.pos && window.hcOverlay) window.hcOverlay.savePos(state.pos.x, state.pos.y);
        };
        voiceEl.addEventListener("pointermove", move);
        voiceEl.addEventListener("pointerup", up);
        voiceEl.addEventListener("pointercancel", up);
    });
    addEventListener("resize", place);

    if (window.hcOverlay) {
        window.hcOverlay.onState(s => { state = s; render(); });
        window.hcOverlay.onToast(toast);
    } else if (location.hash.length > 1) {
        // Offline preview: hc-overlay.html#<url-encoded {"state":{...},"toasts":[...]}>
        const t = JSON.parse(decodeURIComponent(location.hash.slice(1)));
        state = t.state;
        render();
        (t.toasts || []).forEach(toast);
    }
})();
