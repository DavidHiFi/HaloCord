/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { Settings, type ThemeActivationMode, useSettings } from "@api/Settings";
import { Divider } from "@components/Divider";
import { Heading } from "@components/Heading";
import { Link } from "@components/Link";
import { Paragraph } from "@components/Paragraph";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { getThemeInfo, UserThemeHeader } from "@main/themes";
import { classNameFactory } from "@utils/css";
import { copyWithToast } from "@utils/discord";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { themeFileToId } from "@utils/themeIds";
import { getStylusWebStoreUrl } from "@utils/web";
import { openModal, React, Select, showToast, TextInput, Toasts, useEffect, useMemo, useRef, useState } from "@webpack/common";
import { SyntheticEvent } from "react";

import { CodeViewerModal } from "./CodeViewerModal";
import { HaloAppearanceSection } from "./HaloAppearanceSection";
import { OnlineThemesSection } from "./OnlineThemes";
import { QuickActionsSection } from "./QuickActions";
import { SnippetMarketplaceSection } from "./SnippetMarketplace";
import { ThemeCard, type ThemeCardProps } from "./ThemeCard";
import { ThemeMarketplaceSection } from "./ThemeMarketplace";

const cl = classNameFactory("vc-settings-theme-");

enum ThemeFilter {
    All = "all",
    Online = "online",
    Local = "local",
    Enabled = "enabled",
    Disabled = "disabled"
}

const filterOptions = [
    { label: "Show All", value: ThemeFilter.All },
    { label: "Online Themes", value: ThemeFilter.Online },
    { label: "Local Themes", value: ThemeFilter.Local },
    { label: "Enabled", value: ThemeFilter.Enabled },
    { label: "Disabled", value: ThemeFilter.Disabled }
];

const isHaloTheme = (t: UnifiedTheme) => t.header.id === "mochacord" || themeFileToId(t.header.fileName) === "mochacord" || t.name === "MochaCord";

function FilterRow({ search, setSearch, filter, setFilter, options }: { search: string; setSearch(v: string): void; filter: ThemeFilter; setFilter(v: ThemeFilter): void; options: typeof filterOptions; }) {
    return (
        <div className={cl("filter-row")}>
            <TextInput placeholder="Search for a theme..." value={search} onChange={setSearch} />
            <div>
                {Select ? (
                    <Select options={options} select={setFilter} isSelected={v => v === filter} serialize={v => v} />
                ) : (
                    <select
                        className="vc-settings-theme-filter-select"
                        value={filter}
                        onChange={e => setFilter(e.target.value as ThemeFilter)}
                        style={{
                            background: "var(--background-secondary, #1e1f22)",
                            color: "var(--text-normal, #dbdee1)",
                            border: "1px solid var(--background-modifier-accent, #35363c)",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "13px",
                            outline: "none"
                        }}
                    >
                        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                )}
            </div>
        </div>
    );
}

function filterThemes(themes: UnifiedTheme[], query: string, filter: ThemeFilter, pinned: string[]) {
    if (query.trim()) {
        const q = query.toLowerCase();
        themes = themes.filter(t => t.name.toLowerCase().includes(q));
    }

    switch (filter) {
        case ThemeFilter.Online:
            themes = themes.filter(t => t.type === "online");
            break;
        case ThemeFilter.Local:
            themes = themes.filter(t => t.type === "local");
            break;
        case ThemeFilter.Enabled:
            themes = themes.filter(t => t.enabled);
            break;
        case ThemeFilter.Disabled:
            themes = themes.filter(t => !t.enabled);
            break;
    }

    const getThemeId = (t: UnifiedTheme) => t.type === "online" ? t.link! : t.header.fileName;
    return [...themes].sort((a, b) => {
        const aPinIndex = pinned.indexOf(getThemeId(a));
        const bPinIndex = pinned.indexOf(getThemeId(b));
        const aIsPinned = aPinIndex !== -1;
        const bIsPinned = bPinIndex !== -1;

        if (aIsPinned && !bIsPinned) return -1;
        if (!aIsPinned && bIsPinned) return 1;
        if (aIsPinned && bIsPinned) return aPinIndex - bPinIndex;
        return 0;
    });
}

function inferThemeActivationMode(css: string) {
    let text = css.replace(/^\uFEFF/, "");

    while (true) {
        const trimmed = text.trimStart();
        if (trimmed !== text) text = trimmed;

        const comment = /^\/\*[\s\S]*?\*\/\s*/.exec(text);
        if (!comment) break;
        text = text.slice(comment[0].length);
    }

    const match = /^@(light|dark)\b/i.exec(text);
    return match?.[1].toLowerCase() as ThemeActivationMode | undefined;
}

function inferAndStoreThemeActivationMode(themeId: string, css: string) {
    const activationMode = Settings.themeActivationModes?.[themeId] ?? inferThemeActivationMode(css);
    if (!activationMode || themeId in (Settings.themeActivationModes ?? {})) return;

    Settings.themeActivationModes = {
        ...(Settings.themeActivationModes ?? {}),
        [themeId]: activationMode,
    };
}

interface UnifiedTheme {
    type: "local" | "online";
    name: string;
    enabled: boolean;
    header: UserThemeHeader;
    link?: string;
    activationMode: ThemeActivationMode;
}

function openCodeViewer(title: string, code: string, editable: boolean, onSave?: (newCode: string) => Promise<void> | void) {
    openModal(modalProps => (
        <CodeViewerModal
            modalProps={modalProps}
            title={`${title} - Code`}
            code={code}
            editable={editable}
            onSave={onSave}
        />
    ));
}

function ThemesTab() {
    const settings = useSettings(["themeLinks", "enabledThemeLinks", "enabledThemes", "enableOnlineThemes", "pinnedThemes", "themeActivationModes.*", "hideThemeMarketplace", "hideSnippetMarketplace"]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentThemeLink, setCurrentThemeLink] = useState("");
    const [themeLinkValid, setThemeLinkValid] = useState(false);
    const [userThemes, setUserThemes] = useState<UserThemeHeader[] | null>(null);
    const [onlineThemes, setOnlineThemes] = useState<(UserThemeHeader & { link: string; })[] | null>(null);
    const [themeNames, setThemeNames] = useState<Record<string, string>>(() => {
        return settings.themeNames ?? {};
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState(ThemeFilter.All);

    useEffect(() => {
        void updateThemes();
    }, []);

    useEffect(() => {
        void refreshOnlineThemes();
    }, [settings.themeLinks?.join(",")]);

    async function updateThemes() {
        await Promise.allSettled([refreshLocalThemes(), refreshOnlineThemes()]);
    }

    async function refreshLocalThemes() {
        const themes = await VencordNative.themes.getThemesList();
        setUserThemes(themes);
    }

    function onLocalThemeChange(fileNameOrHeader: string | UserThemeHeader, value: boolean) {
        const header = typeof fileNameOrHeader === "string"
            ? userThemes?.find(t => t.fileName === fileNameOrHeader)
            : fileNameOrHeader;
        const fileName = typeof fileNameOrHeader === "string" ? fileNameOrHeader : fileNameOrHeader.fileName;
        const id = header?.id ?? themeFileToId(fileName);

        if (value) {
            if (settings.enabledThemes.includes(id) || settings.enabledThemes.includes(fileName)) return;
            settings.enabledThemes = [...settings.enabledThemes, id];
        } else {
            settings.enabledThemes = settings.enabledThemes.filter(f => f !== id && f !== fileName);
        }
    }

    async function doUploadThemes(files: ArrayLike<File>) {
        const uploads = Array.from(files, file => {
            const { name } = file;
            if (!name.endsWith(".css")) return;

            return new Promise<void>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    VencordNative.themes.uploadTheme(name, reader.result as string)
                        .then(resolve)
                        .catch(reject);
                };
                reader.readAsText(file);
            });
        });

        await Promise.all(uploads);
        refreshLocalThemes();
    }

    async function onFileUpload(e: SyntheticEvent<HTMLInputElement>) {
        e.stopPropagation();
        e.preventDefault();

        if (!e.currentTarget?.files?.length) return;
        await doUploadThemes(e.currentTarget.files);
    }

    function useDropFile(refreshThemes: Function) {
        useEffect(() => {
            const onDragOver = (e: DragEvent) => {
                if (!e.dataTransfer?.items.length) return;
                if (!Array.from(e.dataTransfer.items).some(item => item.kind === "file" && item.getAsFile()?.name.endsWith(".css")))
                    return;

                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
            };

            const onDrop = async (e: DragEvent) => {
                e.preventDefault();

                if (!e.dataTransfer?.files.length) return;

                await doUploadThemes(
                    Array.from(e.dataTransfer.files).filter(file => file.name.endsWith(".css"))
                );

                refreshThemes();
            };

            window.addEventListener("dragover", onDragOver);
            window.addEventListener("drop", onDrop);

            return () => {
                window.removeEventListener("dragover", onDragOver);
                window.removeEventListener("drop", onDrop);
            };
        }, []);
    }

    function addThemeLink(link: string) {
        if (!themeLinkValid) return;
        if (settings.themeLinks.includes(link)) return;

        settings.themeLinks = [...settings.themeLinks, link];
        setCurrentThemeLink("");
        refreshOnlineThemes();
    }

    // This condition is compile time so conditional hook is okay
    if (IS_WEB) useDropFile(refreshLocalThemes);

    async function refreshOnlineThemes() {
        const themes = await Promise.all(
            settings.themeLinks.map(async link => {
                try {
                    const res = await fetch(link);
                    if (!res.ok) throw new Error(`Failed to fetch ${link}`);
                    const css = await res.text();
                    inferAndStoreThemeActivationMode(link, css);

                    return { ...getThemeInfo(css, link), link };
                } catch {
                    return null;
                }
            })
        );
        setOnlineThemes(themes.filter(theme => theme !== null));
    }

    function onThemeLinkEnabledChange(link: string, enabled: boolean) {
        if (enabled) {
            if (settings.enabledThemeLinks.includes(link)) return;
            settings.enabledThemeLinks = [...settings.enabledThemeLinks, link];
        } else {
            settings.enabledThemeLinks = settings.enabledThemeLinks.filter(f => f !== link);
        }
    }

    function clearThemeState(themeId: string) {
        settings.pinnedThemes = settings.pinnedThemes.filter(f => f !== themeId);
        settings.enabledThemes = settings.enabledThemes.filter(f => f !== themeId);
        settings.enabledThemeLinks = settings.enabledThemeLinks.filter(f => f !== themeId);
        settings.themeNames = Object.fromEntries(Object.entries(settings.themeNames).filter(([key]) => key !== themeId));

        const themeActivationModes = { ...(settings.themeActivationModes ?? {}) };
        delete themeActivationModes[themeId];
        settings.themeActivationModes = themeActivationModes;
    }

    function deleteThemeLink(link: string) {
        settings.themeLinks = settings.themeLinks.filter(f => f !== link);
        clearThemeState(link);
        refreshOnlineThemes();
    }

    function setThemeActivationMode(themeId: string, mode: ThemeActivationMode) {
        const themeActivationModes = { ...(settings.themeActivationModes ?? {}) };

        if (mode === "always") {
            delete themeActivationModes[themeId];
        } else {
            themeActivationModes[themeId] = mode;
        }

        settings.themeActivationModes = themeActivationModes;
    }

    function togglePinTheme(themeId: string) {
        if (settings.pinnedThemes.includes(themeId)) {
            settings.pinnedThemes = settings.pinnedThemes.filter(f => f !== themeId);
        } else {
            settings.pinnedThemes = [...settings.pinnedThemes, themeId];
        }
    }

    async function refreshOnlineTheme(link: string) {
        try {
            const res = await fetch(link);
            if (!res.ok) throw new Error(`Failed to fetch ${link}`);
            const css = await res.text();
            inferAndStoreThemeActivationMode(link, css);

            const updatedTheme = { ...getThemeInfo(css, link), link };

            setOnlineThemes(prev =>
                prev?.map(t => t.link === link ? updatedTheme : t) ?? null
            );
            showToast({ text: "Theme refreshed!", variant: "success" });
        } catch {
            showToast({ text: "Failed to refresh theme", variant: "critical" });
        }
    }

    async function downloadTheme(link: string, name: string) {
        try {
            const res = await fetch(link);
            if (!res.ok) throw new Error(`Failed to fetch ${link}`);
            const css = await res.text();
            const fileName = name.replace(/[^a-z0-9]/gi, "-") + ".css";

            if (IS_DISCORD_DESKTOP) {
                DiscordNative.fileManager.saveWithDialog(new TextEncoder().encode(css), fileName);
            } else {
                const blob = new Blob([css], { type: "text/css" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch {
            showToast({ text: "Failed to download theme", variant: "critical" });
        }
    }

    async function viewLocalThemeCode(fileName: string, displayName: string) {
        try {
            const content = await VencordNative.themes.getThemeData(fileName);
            openCodeViewer(displayName, content ?? "", true, async newCode => {
                await VencordNative.themes.uploadTheme(fileName, newCode);
                await refreshLocalThemes();
            });
        } catch {
            showToast("Failed to load theme code", Toasts.Type.FAILURE);
        }
    }

    async function viewOnlineThemeCode(link: string, displayName: string) {
        try {
            const res = await fetch(link);
            if (!res.ok) throw new Error(`Failed to fetch ${link}`);
            const css = await res.text();
            openCodeViewer(displayName, css, false);
        } catch {
            showToast("Failed to load theme code", Toasts.Type.FAILURE);
        }
    }

    const allThemes = useMemo((): UnifiedTheme[] => {
        const themes: UnifiedTheme[] = [];

        for (const theme of onlineThemes ?? []) {
            const customName = themeNames[theme.link] ?? null;
            themes.push({
                type: "online",
                name: customName ?? theme.name ?? theme.fileName,
                enabled: settings.enabledThemeLinks.includes(theme.link),
                header: { ...theme, customName },
                link: theme.link,
                activationMode: settings.themeActivationModes?.[theme.link] ?? "always",
            });
        }

        for (const header of userThemes ?? []) {
            const name = header.name ?? header.fileName;
            const id = header.id ?? themeFileToId(header.fileName);
            const isEnabled = settings.enabledThemes.includes(id) || settings.enabledThemes.includes(header.fileName);

            themes.push({
                type: "local",
                name,
                enabled: isEnabled,
                header,
                activationMode: settings.themeActivationModes?.[header.fileName] ?? settings.themeActivationModes?.[id] ?? "always",
            });
        }

        return themes;
    }, [onlineThemes, userThemes, themeNames, settings.enabledThemeLinks, settings.enabledThemes, settings.themeActivationModes]);

    const installedThemes = useMemo(() => allThemes.filter(t => !isHaloTheme(t)), [allThemes]);
    const filteredThemes = useMemo(() => filterThemes(installedThemes, searchQuery, filter, settings.pinnedThemes), [installedThemes, searchQuery, filter, settings.pinnedThemes]);

    const localCount = installedThemes.filter(t => t.type === "local").length;
    const onlineCount = installedThemes.filter(t => t.type === "online").length;
    const enabledCount = installedThemes.filter(t => t.enabled).length;

    function renderThemeCard(theme: UnifiedTheme) {
        let props: ThemeCardProps;
        if (theme.type === "online") {
            const onlineTheme = theme.header as UserThemeHeader & { link: string; };
            props = {
                theme: onlineTheme,
                enabled: theme.enabled,
                onChange: enabled => onThemeLinkEnabledChange(onlineTheme.link, enabled),
                onDelete: () => {
                    onThemeLinkEnabledChange(onlineTheme.link, false);
                    deleteThemeLink(onlineTheme.link);
                },
                showDeleteButton: true,
                disabled: !(settings.enableOnlineThemes ?? true),
                onPin: () => togglePinTheme(onlineTheme.link),
                isPinned: settings.pinnedThemes.includes(onlineTheme.link),
                themeLink: onlineTheme.link,
                onCopyUrl: () => copyWithToast(onlineTheme.link, "Theme URL copied!"),
                onRefresh: () => refreshOnlineTheme(onlineTheme.link),
                onDownload: () => downloadTheme(onlineTheme.link, onlineTheme.name ?? "theme"),
                onViewCode: () => viewOnlineThemeCode(onlineTheme.link, theme.name),
                isLocal: false,
                activationMode: theme.activationMode,
                onActivationModeChange: mode => setThemeActivationMode(onlineTheme.link, mode),
                onEditName: newName => {
                    const updatedNames = { ...themeNames, [onlineTheme.link]: newName };
                    setThemeNames(updatedNames);
                    settings.themeNames = {
                        ...settings.themeNames,
                        [onlineTheme.link]: newName,
                    };
                }
            };
        } else {
            const localTheme = theme.header;
            props = {
                enabled: theme.enabled,
                onChange: enabled => onLocalThemeChange(localTheme, enabled),
                onDelete: async () => {
                    onLocalThemeChange(localTheme, false);
                    clearThemeState(localTheme.fileName);
                    await VencordNative.themes.deleteTheme(localTheme.fileName);
                    refreshLocalThemes();
                },
                showDeleteButton: true,
                onPin: () => togglePinTheme(localTheme.fileName),
                isPinned: settings.pinnedThemes.includes(localTheme.fileName),
                onRefresh: refreshLocalThemes,
                onViewCode: () => viewLocalThemeCode(localTheme.fileName, theme.name),
                isLocal: true,
                theme: localTheme,
                activationMode: theme.activationMode,
                onActivationModeChange: mode => setThemeActivationMode(localTheme.fileName, mode)
            };
        }

        return <ThemeCard key={theme.link ?? theme.header.fileName} {...props} />;
    }

    return (
        <SettingsTab>
            <div className={Margins.top16}>
                <HaloAppearanceSection />
            </div>

            <Heading className={Margins.top20}>Theme Management</Heading>
            <Paragraph className={Margins.bottom16}>
                Customize Discord's appearance with themes. Add local .css files or load themes directly from URLs. Themes with a cog wheel icon have customizable settings you can modify.
            </Paragraph>

            <Heading>Quick Actions</Heading>
            <Paragraph className={Margins.bottom16}>
                Shortcuts for managing your themes. Open your themes folder to add new themes, use QuickCSS for quick style tweaks, or reload themes after making changes.
            </Paragraph>

            <QuickActionsSection
                fileInputRef={fileInputRef}
                onFileUpload={onFileUpload}
                refreshLocalThemes={refreshLocalThemes}
            />

            <Divider className={Margins.top20} />

            <OnlineThemesSection
                enableOnlineThemes={settings.enableOnlineThemes ?? true}
                setEnableOnlineThemes={value => {
                    settings.enableOnlineThemes = value;
                    if (!value) {
                        settings.enabledThemeLinks = [];
                    }
                }}
                currentThemeLink={currentThemeLink}
                setCurrentThemeLink={setCurrentThemeLink}
                themeLinkValid={themeLinkValid}
                setThemeLinkValid={setThemeLinkValid}
                addThemeLink={addThemeLink}
            />

            <Heading className={Margins.top20}>Installed Themes</Heading>
            <Paragraph className={Margins.bottom8}>
                Manage your themes here. Local themes load from your themes folder, online themes from URLs. Themes with a cog wheel icon have customizable settings.
            </Paragraph>
            <Paragraph color="text-subtle" className={Margins.bottom16}>
                {installedThemes.length} theme{installedThemes.length !== 1 ? "s" : ""} installed ({localCount} local, {onlineCount} online) · {enabledCount} enabled
            </Paragraph>

            <FilterRow search={searchQuery} setSearch={setSearchQuery} filter={filter} setFilter={setFilter} options={filterOptions} />

            {userThemes === null ? (
                <Paragraph color="text-muted" className={Margins.top16}>Loading themes...</Paragraph>
            ) : filteredThemes.length === 0 ? (
                <Paragraph color="text-muted" className={Margins.top16}>
                    {installedThemes.length === 0
                        ? "No themes installed yet. Add theme files to your themes folder or add an online theme above to get started."
                        : "No themes match your search or filter criteria."
                    }
                </Paragraph>
            ) : (
                <div className={classes(cl("grid"), Margins.top16)}>
                    {filteredThemes.map(renderThemeCard)}
                </div>
            )}

            <Divider className={Margins.top20} />

            <SnippetMarketplaceSection />

            <ThemeMarketplaceSection />
        </SettingsTab>
    );
}

function UserscriptThemesTab() {
    return (
        <SettingsTab>
            <Heading className={Margins.top16}>Themes Not Supported</Heading>
            <Paragraph className={Margins.bottom8}>
                Themes are not available on the Userscript version.
            </Paragraph>
            <Paragraph color="text-subtle">
                You can install themes using the <Link href={getStylusWebStoreUrl()}>Stylus extension</Link> instead.
            </Paragraph>
        </SettingsTab>
    );
}

export default IS_USERSCRIPT
    ? wrapTab(UserscriptThemesTab, "Themes")
    : wrapTab(ThemesTab, "Themes");
