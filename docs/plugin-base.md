# Plugin base

MochaCord keeps KurtCord 2.8.3's own plugin set and adds David's plugins from the
local TestCord install. Both ship in the same Equicord bundle, so there is one
definition per plugin and no duplicates. This page records the state checked on
2026-10-29 and what the next MochaCord build needs to pick up.

## How plugins ship

MochaCord is a KurtCord 2.8.3 shell. Its renderer mod is the Equicord bundle
inside `resources/app.asar` (`equicord/browser.js`), compiled from the TestCord
plugin tree: Vencord core, Equicord plugins, and David's own plugins together.
Plugins are compiled in. Nothing is loaded from disk at runtime.

KurtCord 2.8.3 bundles 681 plugins. The local TestCord install runs 214 of them
enabled (`%APPDATA%\TestCord\settings\settings.json`).

## David's plugins inside KurtCord 2.8.3

18 of the 20 plugins from `DavidHiFi/Discord-Plugins` and the TestCord tree are
already compiled into the 2.8.3 bundle.

Up to date, matching the local checkout:

StaffTag, FakeVoice, CustomStreamQuality, RoundedVCPFP, MicSpamGuard,
PanelLayout, FullVCPFP, InviteDefaults, Questify, ToastNotifications,
MessageLoggerTestcord, TestcordHelper, TestcordToolbox, StreamEnhancer

Older than the local install:

| Plugin | What the local tree has that 2.8.3 does not |
| --- | --- |
| VoiceVUMeters | The self-meter fix (TestCord `a91fb1e94`, 2026-10-25): own bars follow speech when Discord's speaking flag stays off. The bundle predates it (published 2026-10-10) and none of the fix's constants appear in it. |
| LyricsStatus | Album covers on Dopamine's activity (the zero-setup LyricsStatus work of 2026-10-24). |
| StereoGuard | Reverb-tail silencing and the centered-mono guard (local text: "Centered mono voice is never touched"). |
| HasStrip | The 2026-10-24 rewrite with the measured 10x style-recalc cut and the simpler tradeoff wording. |

## Missing from the 2.8.3 bundle

Enabled in the local TestCord but absent from the 2.8.3 bundle:

PlatformEmulator, StereoLoader, FakeUserSwitcher, FollowMajority, VoiceCount,
VoiceFakeDetector, CopyMediaLink, FixDiscordCss, NSFWGateBypass, EquiTweaks

Present in the bundle but listed for the Discord desktop platform only:
FixSpotifyEmbeds, FixYoutubeEmbeds, NoSystemBadge, YoutubeAdblock,
NotificationTitle, SongLink. Whether those load depends on the platform string
the shell reports; check at runtime before relying on them.

## Rule for the next build

A true MochaCord build recompiles the Equicord injection from the current
TestCord tree, then:

1. keeps every plugin KurtCord 2.8.3 bundles;
2. takes David's plugins from the local TestCord checkout, never an older copy;
3. keeps one definition per plugin; where both sides have one, the local
   version wins.

KurtCord-specific plugins (KurtcordTheme, KurtcordVoicePanel, AudioCenter and
the rest of Kurtzon's own set) are not in the TestCord tree. Their sources need
to come from Kurtzon before a rebuild can reproduce them.

Full lists live in the Discord Configuration workspace at
`work/mochacord-fork-20261027/plugin-base.json` (bundled 681, enabled 214, gap
and stale lists included).
