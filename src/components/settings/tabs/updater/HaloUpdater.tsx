/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { HaloPill, HaloRow, HaloSection, HaloSwitchRow, type HaloTone } from "@components/HaloUI";
import { Link } from "@components/Link";
import { SettingsTab } from "@components/settings/tabs/BaseTab";
import { relaunch } from "@utils/native";
import { changes, checkForUpdates, update, updateError, UpdateLogger } from "@utils/updater";
import { useEffect, useState } from "@webpack/common";
import type { ReactNode } from "react";

// The Updater page in HaloCord. The shell's hc-update.js answers the updater calls: it checks
// HaloCord's GitHub releases, downloads the installer, checks its SHA-256 and installs it on restart.
// Header card and status pill follow the layout of Sudocord's updater page.

interface UpdateInfo {
    version: string;
    commit: string;
    upstream: Partial<Record<"Equicord" | "TestCord", string>>;
    ready: string | null;
}

const native = () => window.HaloCordNative as undefined | { updateInfo?(): Promise<UpdateInfo>; };

type Status = "checking" | "current" | "available" | "downloading" | "ready" | "failed";

const STATUS: Record<Status, [HaloTone, string]> = {
    checking: ["muted", "Checking"],
    current: ["good", "Up to date"],
    available: ["info", "Update available"],
    downloading: ["info", "Downloading"],
    ready: ["good", "Ready to install"],
    failed: ["bad", "Check failed"]
};

const HALOCORD = "https://github.com/DavidHiFi/HaloCord";
const SOURCES = {
    Equicord: "https://github.com/Equicord/Equicord",
    TestCord: "https://codeberg.org/Testcord/TestCord"
};
const SHOWN_CHANGES = 30;

const isSha = (s: string) => /^[a-f0-9]{7,40}$/i.test(s);
const time = () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
const message = (e: unknown) => String((e as Error)?.message ?? updateError?.message ?? e ?? "Unknown error");

function Commit({ repo, hash }: { repo: string; hash?: string; }) {
    if (!hash) return <>Unknown</>;
    return <Link className="hc-ui-hash" href={`${repo}/commit/${hash}`}>{hash.slice(0, 7)}</Link>;
}

function Stat({ label, children }: { label: string; children: ReactNode; }) {
    return (
        <div className="hc-ui-stat">
            <div className="hc-ui-stat-label">{label}</div>
            <div className="hc-ui-stat-value">{children}</div>
        </div>
    );
}

export function HaloUpdater() {
    const settings = useSettings(["autoUpdate", "autoUpdateNotification"]);
    const [info, setInfo] = useState<UpdateInfo | null>(null);
    const [status, setStatus] = useState<Status>("checking");
    const [error, setError] = useState("");
    const [checkedAt, setCheckedAt] = useState("");

    const loadInfo = () => native()?.updateInfo?.().then(i => { setInfo(i); return i; });

    async function check() {
        setStatus("checking");
        setError("");
        try {
            const outdated = await checkForUpdates();
            // The check itself worked; missing version details must not turn it into a failure.
            const i = await loadInfo()?.catch(() => null);
            setStatus(i?.ready ? "ready" : outdated ? "available" : "current");
        } catch (e) {
            UpdateLogger.error("Update check failed", e);
            setError(message(e));
            setStatus("failed");
        }
        setCheckedAt(time());
    }

    async function updateAndRestart() {
        setStatus("downloading");
        setError("");
        try {
            if (!await update()) throw new Error("The update did not finish downloading");
            setStatus("ready");
            relaunch();
        } catch (e) {
            UpdateLogger.error("Update failed", e);
            setError(message(e));
            setStatus("failed");
        }
    }

    // Load the installed version first so the stats show even when the check fails.
    useEffect(() => { loadInfo()?.catch(() => { }); check(); }, []);

    const [tone, label] = STATUS[status];
    const busy = status === "checking" || status === "downloading";
    const list = status === "available" || status === "ready" || status === "downloading" ? changes ?? [] : [];
    const next = info?.ready ?? (list.length ? "a new version" : null);

    return (
        <SettingsTab>
            <div className="hc-ui-hero">
                <div className="hc-ui-hero-head">
                    <div>
                        <HaloPill tone={tone}>{label}</HaloPill>
                        <h2 className="hc-ui-hero-title">HaloCord {info?.version ?? ""}</h2>
                    </div>
                    <div className="hc-ui-actions">
                        <Button variant="secondary" size="small" className="hc-ui-btn-quiet" disabled={busy} aria-busy={status === "checking"} onClick={check}>
                            {status === "checking" ? "Checking..." : "Check for updates"}
                        </Button>
                        {status === "available" && (
                            <Button size="small" className="hc-ui-btn-accent" onClick={updateAndRestart}>Update and restart</Button>
                        )}
                        {status === "downloading" && (
                            <Button size="small" className="hc-ui-btn-accent" disabled aria-busy>Downloading...</Button>
                        )}
                        {status === "ready" && (
                            <Button size="small" className="hc-ui-btn-accent" onClick={relaunch}>Restart to install</Button>
                        )}
                    </div>
                </div>
                <p className="hc-ui-hero-text">
                    {status === "ready"
                        ? `HaloCord ${next} is downloaded and checked. It installs when you restart or close HaloCord, and your settings stay as they are.`
                        : status === "available"
                            ? "A new HaloCord is out. Update and restart downloads it, checks it and installs it in a few seconds. Your settings stay as they are."
                            : "Each HaloCord update carries the client's own changes and the latest plugins from Vencord, Equicord and TestCord."}
                    {checkedAt && status !== "checking" && ` Last checked at ${checkedAt}.`}
                </p>
                {error && <p className="hc-ui-hero-error">{error}</p>}
                <div className="hc-ui-stats">
                    <Stat label="Installed">{info?.version ?? "Unknown"}</Stat>
                    <Stat label="Build"><Commit repo={HALOCORD} hash={info?.commit} /></Stat>
                    <Stat label="Equicord"><Commit repo={SOURCES.Equicord} hash={info?.upstream.Equicord} /></Stat>
                    <Stat label="TestCord"><Commit repo={SOURCES.TestCord} hash={info?.upstream.TestCord} /></Stat>
                </div>
            </div>

            {list.length > 0 && (
                <HaloSection title="What's new">
                    {list.slice(0, SHOWN_CHANGES).map(({ hash, author, message }, i) => (
                        <HaloRow key={i} title={message} description={author}>
                            {isSha(hash) && <Commit repo={HALOCORD} hash={hash} />}
                        </HaloRow>
                    ))}
                    {list.length > SHOWN_CHANGES && (
                        <HaloRow title={`And ${list.length - SHOWN_CHANGES} more changes`} />
                    )}
                </HaloSection>
            )}

            <HaloSection title="Update preferences">
                <HaloSwitchRow
                    title="Update automatically"
                    description="Downloads updates in the background. They install the next time HaloCord restarts or closes."
                    value={settings.autoUpdate}
                    onChange={v => settings.autoUpdate = v}
                />
                <HaloSwitchRow
                    title="Tell me when an update is ready"
                    description="Shows a notice with a Restart button once an update has downloaded."
                    value={settings.autoUpdateNotification}
                    disabled={!settings.autoUpdate}
                    onChange={v => settings.autoUpdateNotification = v}
                />
            </HaloSection>
        </SettingsTab>
    );
}
