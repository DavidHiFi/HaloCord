/* eslint-disable simple-header/header*/

import { TestcordDevs } from "@utils/constants";
import definePlugin from "@utils/types";
import { findComponentByCodeLazy, findCssClassesLazy } from "@webpack";

const MemberSince = findComponentByCodeLazy("textClassName:", "tooltipDelay:", ".joinedAt");
const classes = findCssClassesLazy("interactiveNormal");

export default definePlugin({
    id: "BetterBios",
    name: "BetterBios",
    authors: [TestcordDevs.x2b],
    description: "Improves Discord's bio redesign",
    tags: ["Customisation", "Appearance"],
    patches: [],

    membersSince({ user, guild }) {
        return <>
            <MemberSince
                userId={user.id}
                guildId={guild?.id}
                tooltipDelay={300}
                textClassName={classes.interactiveNormal}
            />
        </>;
    }
});
