/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Heading } from "@components/Heading";
import { TestcordDevs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { User } from "@vencord/discord-types";
import { findByCodeLazy, findByPropsLazy } from "@webpack";
import { TextArea, useState } from "@webpack/common";

const useNote = findByCodeLazy("USER_NOTE_LOAD_START");
const NoteApi = findByPropsLazy("updateNote");

const settings = definePluginSettings({
    hideWhenEmpty: {
        description: "Hide the note box when no note is set for a user",
        type: OptionType.BOOLEAN,
        default: false,
    }
});

function NotesSection({ user }: { user: User; }) {
    const { note, loading } = useNote(user.id) as { note?: string | null; loading?: boolean; };
    const [draft, setDraft] = useState<string | null>(null);
    if (settings.store.hideWhenEmpty && !loading && !note && draft == null) return null;

    const value = draft ?? note ?? "";
    return (
        <div className="vc-simplified-notes" style={{ padding: "8px 12px" }}>
            <Heading tag="h3">Note</Heading>
            <TextArea
                value={value}
                disabled={loading}
                maxLength={256}
                rows={2}
                placeholder="Click to add a note"
                onChange={(v: string) => setDraft(v)}
                onBlur={() => {
                    if (draft != null && draft !== (note ?? "")) NoteApi.updateNote(user.id, draft);
                    setDraft(null);
                }}
            />
        </div>
    );
}

export default definePlugin({
    id: "SimplifiedProfileNotes",
    name: "SimplifiedProfileNotes",
    description: "Show the notes text box in the new simplified profile popouts",
    tags: ["Utility", "Organisation"],
    authors: [TestcordDevs.x2b],
    settings,
    patches: [
        {
            // Profile popout
            find: "\"UserProfilePopout\"",
            replacement: {
                match: /(\(0,\i\.jsx\)\(\i\.A,\{user:(\i),currentUser:\i,guildId:\i\?\.id,onOpenUserProfileModal:\i,onClose:\i\}\),)/,
                replace: "$1$self.renderNotes($2),"
            }
        },
        {
            // DM sidebar
            find: /\(0,\i\.jsx\)\(\i\.A,\{user:\i,currentUser:\i,onOpenUserProfileModal:\i\}\),\i\?\(0,\i\.jsxs\)\(\i\.Fragment/,
            replacement: {
                match: /(\(0,\i\.jsx\)\(\i\.A,\{user:(\i),currentUser:\i,onOpenUserProfileModal:\i\}\),)(?=\i\?\(0,\i\.jsxs\)\(\i\.Fragment)/,
                replace: "$1$self.renderNotes($2),"
            }
        }
    ],
    renderNotes: (user: User) => <NotesSection user={user} />,
    NotesSection
});
