/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Patch } from "@utils/types";

type StockPatch = Omit<Patch, "plugin">;

interface ConfigurablePatchDefinition {
    /** Description of your patch, shown as the settings description */
    description: string;
    /** Default enable state of the patch. Defaults to true */
    default?: boolean;
    /** Patch or patches. Same as any patch defined within the `patches` array of a plugin definition */
    patches: StockPatch | StockPatch[];
}

// Record key is the setting name for the patch
const Patches: Record<string, ConfigurablePatchDefinition> = {
    removeChatboxGiftButton: {
        description: "Remove the nitro gifting button in the chatbox",
        patches: {
            find: '"sticker")',
            replacement: {
                match: /\i\.gifts\?\.button!=null/,
                replace: "false"
            }
        }
    },
    removeChatboxGifsButton: {
        description: "Remove the GIFs button in the chatbox",
        patches: {
            find: '"sticker")',
            replacement: {
                match: /\i\.gifs\?\.button!=null/g,
                replace: "false"
            }
        },
        default: false
    },
    removeChatboxStickerButton: {
        description: "Remove the sticker button in the chatbox",
        patches: {
            find: '"sticker")',
            replacement: {
                match: /\i\.stickers\?\.button!=null/g,
                replace: "false"
            }
        },
        default: false
    },

    nitroAndShopPages: {
        description: "Hide the Nitro and Shop pages in DMs",
        patches: [
            {
                find: "hasLibraryApplication()&&",
                replacement: [
                    {
                        match: /\i\.\i\.APPLICATION_STORE,/,
                        replace: "null,"
                    },
                    {
                        match: /\i\.\i\.COLLECTIBLES_SHOP,/,
                        replace: "null,"
                    }
                ]
            },
            {
                find: "#{intl::PRIVATE_CHANNELS_A11Y_LABEL}",
                // Declutter patches the same code first, so the reporter sees this as a no-op
                noWarn: true,
                replacement: [
                    {
                        match: /\(0,\i\.\i\)\(.{0,250}?\},"discord-shop"\),/,
                        replace: ""
                    },
                ]
            }
        ]
    },

    profileEditorShopUpsell: {
        description: "Hide the collectibles upsell banner in the Profiles settings",
        patches: {
            find: "COLLECTIBLES_PROFILE_SETTINGS_UPSELL,",
            replacement: {
                match: /(let \i=function\(\)\{)(?=[^;]{0,100}COLLECTIBLES_PROFILE_SETTINGS_UPSELL)/,
                replace: "$1return null;"
            }
        }
    },

    updateReadyButton: {
        description: "Hide the Update Ready! button",
        patches: {
            find: '"UPDATE_DOWNLOADED"===this.props.mode',
            replacement: {
                match: /(?<=render\(\)\{)(?=let \i="UPDATE_AVAILABLE"===this\.props\.mode)/,
                replace: "return null;"
            }
        },
        default: false
    },

    familyCenterInSettings: {
        description: "Hide the Family Center page in settings. Does not hide the tab in DMs",
        patches: [
            {
                find: ".USER_SETTINGS_MERCH_LINK_CONFIRMED)",
                // Discord removed this settings entry; nothing left to hide
                noWarn: true,
                all: true,
                replacement: {
                    match: /\[\i\.\i\.PRIVACY_FAMILY_CENTER\]:\{/,
                    replace: "$&predicate:()=>false,"
                }
            }
        ]
    },
    merchandiseLink: {
        description: "Hide the Merch button inside settings",
        patches: {
            find: ".USER_SETTINGS_MERCH_LINK_CONFIRMED)",
            // Discord removed the merch entry
            noWarn: true,
            all: true,
            replacement: {
                match: /\[\i\.\i\.MERCHANDISE\]:\{/,
                replace: "$&predicate:()=>false,"
            }
        }
    },
    socialLinks: {
        description: "Hide the links to Discord's Social Media profiles",
        patches: {
            find: ".USER_SETTINGS_MERCH_LINK_CONFIRMED)",
            // Discord removed the social links entry
            noWarn: true,
            all: true,
            replacement: {
                match: /\[\i\.\i\.SOCIAL_LINKS\]:\{/,
                replace: "$&predicate:()=>false,"
            }
        }
    },
    paymentSettings: {
        description: "Hide the Payment Settings section. May cause side effects.",
        patches: [
            {
                find: "#{intl::BILLING_SETTINGS}",
                // Billing header string now exists only in locale files; the section is gone
                noWarn: true,
                all: true,
                replacement: {
                    match: /\{header:.{0,30}?#{intl::BILLING_SETTINGS}.?,.+?\},/,
                    replace: ""
                }
            }
        ],
        default: false
    },

    downloadApps: {
        description: "Hide the Download Apps button in the sidebar",
        patches: {
            find: "app-download-button",
            replacement: {
                match: /(function\s\i\(\){)(?=.{0,100}?id:"app-download-button")/,
                replace: "$1return null;"
            }
        }
    },

    contentInventory: {
        description: "Hide the Activity Feed in the members list",
        patches: {
            find: "ACTIVITY_FEED_DISABLED_BY_USER);return",
            replacement: {
                match: /\i\|\|\i\?\i:null!=\i&&\i<1e4/,
                replace: "false"
            }
        },
        default: false
    },

    activeNow: {
        description: "Hide the Active Now sidebar in the Friends page",
        patches: {
            find: ".ADD_FRIEND?(0,",
            replacement: {
                match: /(?<=let \i=null,\i=)\(0,\i\.jsx\)\("div",{className:\i\.\i,children:\(0,\i\.jsx\)\(\i,{}\)}\)(?=;return \i=\i===\i\.\i\.ADD_FRIEND)/,
                replace: "null"
            }
        },
        default: false
    },

    transferToConsole: {
        description: "Hide the transfer to console button",
        patches: {
            find: '"Console Transfer Item"',
            replacement: {
                match: /(?<=function \i\(\i\)\{)(?=let.{0,2500}?"Console Transfer Item")/,
                replace: "return null;"
            }
        }
    },

    textChannelActivityNameHeader: {
        description: "Hide the activity name above expanded activities in text channels",
        patches: {
            find: /"embedded-activity",applicationId:\i\.id\}\),\(0,\i\.jsxs\)\("div",\{className:\i\.\i,children:\[\i\?null:/,
            replacement: {
                match: /\i\?null:\(0,\i\.jsx\)\("div",{className:\i\.\i,children:\(0,\i\.jsx\)\(\i\.\i,{color:"text-strong",variant:"body-md\/semibold",className:\i\.\i,children:\i\?\.name}\)}\),/,
                replace: ""
            }
        }
    },

    inviteToServer: {
        description: "Hide the Invite to Server context menu option",
        patches: {
            find: 'id:"invite-to-server"',
            replacement: {
                match: /let{user:/,
                replace: "return null;$&"
            }
        }
    },

    clippingEnabledToast: {
        description: "Hide the clipping enabled; your voice may be recorded warning when joining a voice channel, without disabling your voice from being clipped",
        patches: {
            find: '"CLIPS_SHOW_CALL_WARNING"',
            replacement: {
                match: /maybeShowClipsWarning\(\i\){/,
                replace: "$&return;"
            }
        }
    },

    createInviteButtonOnChannels: {
        description: "Hide the Create Invite button on channels in the sidebar",
        patches: {
            find: 'tutorialId:"instant-invite",',
            replacement: {
                match: /(?<=return)(?=.{0,50}?"instant-invite")/,
                replace: ";"
            }
        }
    },
    editChannelButton: {
        description: "Hide the Edit Channel button on channels in the sidebar",
        patches: {
            find: 'tutorialId:"instant-invite",',
            replacement: {
                match: /(?<=disableManageChannels:\i,.{0,80}\}=\i;return)/,
                replace: ";"
            }
        },
        default: false
    },

    boostProgressBar: {
        description: "Hide the Server Boost progress bar in all servers",
        patches: {
            find: ".premiumProgressBarEnabled&&",
            replacement: {
                match: /\i\.push(?=\(\i\.\i\.(GUILD_PREMIUM_PROGRESS_BAR|GUILD_NEW_MEMBER_ACTIONS_PROGRESS_BAR)\))/g,
                replace: ""
            }
        }
    },

    newMemberBadge: {
        description: "Hide the new member badge",
        patches: {
            find: "NEW_MEMBER_MENTION_CTA_CLICKED,{target_user_id",
            replacement: {
                match: /(?<=return)\(0,\i\.\i\)\(\i\.id,\i\.author\.id\)\?/,
                replace: " false?"
            }
        },
        default: false
    },

    questsBar: {
        description: "Hide the Quest promotions in the sidebar",
        patches: {
            find: "Not rendered due to asset error",
            replacement: {
                match: /return!\i&&\(.{0,100}?"Not rendered due to asset error".{0,100}?\),/,
                replace: "return null;"
            }
        }
    },

    questsActiveNow: {
        description: "Hide the Quest promotions in the Active Now sidebar",
        patches: {
            find: '"QuestActivityPanelItem"',
            replacement: {
                match: /(let\{party:\i,onUserContextMenu:\i,onChannelContextMenu:\i,quest:)(\i)(,hasStaffQuestActivityPanelOverride:\i\}=\i,)/,
                replace: "$1_unusedQuest$3$2=null,"
            }
        }
    },

    supportLink: {
        description: "Hide the link to Discord support in the top right",
        patches: {
            find: "HELP_CLICKED,{highlighted",
            replacement: {
                match: /(?<=function \i\(\i\){)(?=let\{className)/,
                replace: "return null;"
            }
        },
        default: false
    },

    quickSwitcherButton: {
        description: "Hide the Find or start a new conversation button",
        patches: {
            find: 'tutorialId:"direct-messages",',
            // SearchUtility applies the same patch first
            noWarn: true,
            replacement: {
                match: /\(0,\i\.jsx\)\(\i\.\i,{.{0,50}?tutorialId:"direct-messages",.{0,600}?\}\)\}\)\}\),/,
                replace: ""
            }
        },
        default: false
    },

    alsoKnownAs: {
        description: "Hide the AKA nicknames in DMs",
        patches: {
            find: "this.generateNicknameGuildPairs(this.user)",
            // Discord removed the AKA nicknames feature
            noWarn: true,
            all: true,
            replacement: {
                match: /this\.generateNicknameGuildPairs\(this\.user\)/,
                replace: "[];$&"
            }
        },
        default: false
    },

    voiceGradientBackground: {
        description: "Hide the gradient backgrounds in voice channels",
        patches: {
            find: ".gradientBackground,children:[(0",
            all: true,
            replacement: {
                match: /\i\.\i\.getEnableHardwareAcceleration\(\)/,
                replace: "true?()=>null:$&"
            }
        },
    }

};

export default Patches;
