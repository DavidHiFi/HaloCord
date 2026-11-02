// HaloCord overlay window: voice, quick actions and friends' activity widgets plus notification toasts.
// Event driven, no timers while idle.
(function () {
    const $ = id => document.getElementById(id);
    const body = document.body, list = $("members"), toasts = $("toasts");
    const widgets = { voice: $("voice"), quick: $("quick"), activity: $("activity") };
    const rows = new Map();
    const TOAST_MS = 6000, MAX_TOASTS = 3;
    const api = window.hcOverlay;
    let state = { cfg: null, voice: null, activity: [], locked: true, pos: {} };

    function icon(id) {
        const s = document.createElementNS("http://www.w3.org/2000/svg", "svg"), u = document.createElementNS("http://www.w3.org/2000/svg", "use");
        u.setAttribute("href", "#" + id);
        s.appendChild(u);
        return s;
    }

    function setImg(im, src) {
        if (im.getAttribute("src") !== src) src ? im.setAttribute("src", src) : im.removeAttribute("src");
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
        setImg(r.im, m.avatar);
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
        for (const [w, el] of Object.entries(widgets)) {
            const p = state.pos && state.pos[w];
            if (!p) {
                el.style.left = el.style.top = "";
                continue;
            }
            el.style.left = Math.max(0, Math.min(p.x, innerWidth - 60)) + "px";
            el.style.top = Math.max(0, Math.min(p.y, innerHeight - 40)) + "px";
        }
    }

    // Where the overlay takes clicks while locked (clickable regions): the quick action buttons and link toasts.
    function regions() {
        if (!api) return;
        const c = state.cfg || {}, out = [];
        if (state.locked && c.clickable) {
            const els = [...(widgets.quick.hidden ? [] : widgets.quick.querySelectorAll("button")), ...toasts.querySelectorAll(".toast.link.in")];
            for (const el of els) {
                const r = el.getBoundingClientRect();
                if (r.width && r.height) out.push([Math.floor(r.left), Math.floor(r.top), Math.ceil(r.width), Math.ceil(r.height)]);
            }
        }
        const k = JSON.stringify(out);
        if (k !== regions.last) api.regions(out), regions.last = k;
    }

    function renderVoice(c) {
        const v = state.voice, members = (v && v.members) || [], w = c.widgets || {};
        const seen = new Set(), order = [];
        let shown = 0, extra = 0;
        for (const m of members) {
            const r = row(m), talking = m.speaking && !m.mute;
            seen.add(m.id);
            let hide = c.displayUsers === "speaking" && !talking;
            if (!hide && c.maxUsers > 0 && shown >= c.maxUsers) hide = true, extra++;
            if (!hide) shown++;
            r.li.hidden = hide;
            r.name.hidden = c.displayNames === "never" || (c.displayNames === "speaking" && !talking);
            order.push(r.li);
        }
        for (const [id, r] of rows) if (!seen.has(id)) { r.li.remove(); rows.delete(id); }
        order.forEach((li, i) => { if (list.children[i] !== li) list.insertBefore(li, list.children[i] || null); });
        $("more").hidden = !extra;
        $("more").textContent = "+" + extra + " more";
        $("channel").textContent = (v && v.channel) || "Voice";
        widgets.voice.classList.toggle("small", c.avatarSize === "small");
        widgets.voice.classList.toggle("none", members.length === 0);
        widgets.voice.hidden = w.voice === false || (!members.length && state.locked);

        widgets.quick.hidden = w.quick === false || (!v && state.locked);
        $("q-mute").classList.toggle("on", !!(v && v.self && v.self.mute));
        $("q-mute").title = v && v.self && v.self.mute ? "Unmute" : "Mute";
        $("q-deaf").classList.toggle("on", !!(v && v.self && v.self.deaf));
        $("q-deaf").title = v && v.self && v.self.deaf ? "Undeafen" : "Deafen";
    }

    function renderActivity(c) {
        const on = c.widgets && c.widgets.activity && !state.locked, ul = $("friends");
        widgets.activity.hidden = !on;
        if (!on) return;
        ul.replaceChildren(...(state.activity || []).map(a => {
            const li = document.createElement("li"), im = document.createElement("img"), txt = document.createElement("div");
            const b = document.createElement("b"), s = document.createElement("span");
            im.alt = "";
            setImg(im, a.avatar);
            b.textContent = a.name;
            s.textContent = a.game;
            li.className = a.same ? "same" : "";
            txt.append(b, s);
            li.append(im, txt);
            return li;
        }));
        $("nofriends").hidden = ul.children.length > 0;
    }

    function render() {
        const c = state.cfg || {};
        body.classList.toggle("unlocked", !state.locked);
        body.classList.toggle("locked", state.locked);
        body.classList.toggle("clickable", !!c.clickable);
        if (/^#[0-9a-f]{6}$/i.test(c.accent || "")) {
            const n = parseInt(c.accent.slice(1), 16);
            document.documentElement.style.setProperty("--accent", c.accent);
            document.documentElement.style.setProperty("--accent-rgb", `${n >> 16} ${n >> 8 & 255} ${n & 255}`);
        }
        $("key").textContent = c.keybind || "";
        const op = state.locked ? (c.opacity || 100) / 100 : 1;
        for (const el of [...Object.values(widgets), toasts]) el.style.opacity = op;
        toasts.className = c.notifPos || "bottomRight";
        toasts.hidden = c.widgets && c.widgets.notifications === false;
        renderVoice(c);
        renderActivity(c);
        place();
        regions();
    }

    function toast(t) {
        const el = document.createElement("div"), im = document.createElement("img"), txt = document.createElement("div");
        const b = document.createElement("b"), s = document.createElement("span");
        el.className = "toast" + (t.channelId ? " link" : "");
        im.alt = "";
        if (t.icon) im.src = t.icon;
        else im.hidden = true;
        b.textContent = t.title;
        s.textContent = t.body;
        txt.append(b, s);
        el.append(im, txt);
        if (t.channelId && api) el.addEventListener("click", () => api.action("open", t.channelId));
        toasts.appendChild(el);
        while (toasts.children.length > MAX_TOASTS) toasts.firstChild.remove();
        void el.offsetWidth;
        el.classList.add("in");
        regions();
        setTimeout(() => {
            el.classList.remove("in");
            regions();
            setTimeout(() => el.remove(), 300);
        }, TOAST_MS);
    }

    if (api) {
        $("q-mute").addEventListener("click", () => api.action("mute"));
        $("q-deaf").addEventListener("click", () => api.action("deaf"));
        $("q-end").addEventListener("click", () => api.action("disconnect"));
    }

    // Dragging any widget while unlocked; positions are saved per widget, relative to the display.
    for (const [w, el] of Object.entries(widgets)) {
        el.addEventListener("pointerdown", e => {
            if (state.locked || e.target.closest("button")) return;
            const r = el.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
            let p = null;
            el.setPointerCapture(e.pointerId);
            const move = ev => {
                p = { x: Math.round(ev.clientX - dx), y: Math.round(ev.clientY - dy) };
                state.pos = { ...state.pos, [w]: p };
                place();
            };
            const up = () => {
                el.removeEventListener("pointermove", move);
                el.removeEventListener("pointerup", up);
                el.removeEventListener("pointercancel", up);
                if (p && api) api.savePos(w, p.x, p.y);
            };
            el.addEventListener("pointermove", move);
            el.addEventListener("pointerup", up);
            el.addEventListener("pointercancel", up);
        });
    }
    addEventListener("resize", () => { place(); regions(); });

    if (api) {
        api.onState(s => { state = s; render(); });
        api.onToast(toast);
    } else if (location.hash.length > 1) {
        // Offline preview: hc-overlay.html#<url-encoded {"state":{...},"toasts":[...]}>
        const t = JSON.parse(decodeURIComponent(location.hash.slice(1)));
        state = t.state;
        render();
        (t.toasts || []).forEach(toast);
    }
})();
