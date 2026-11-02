# MicSpamGuard

Fork of Kurtzon Audio's plugin, maintained by DavidHiFi. Smoothly balances incoming voice levels and holds sustained extreme loudness at local volume zero. TestCord source uses the required GPL-3.0-or-later Vencord header; the original MIT grant remains in LICENSE; original author credit retained.

## Recovery

Fresh quiet readings, including zero, count toward the configured auto-unmute interval. If Discord stops providing levels, inactivity starts after the two-second sample grace and uses the same interval. Recovery ramps over 1.5 seconds to 100%. Fresh loud readings cancel the ramp and close the volume again. Off still requires manual restoration. Because missing readings do not prove silence, inactivity recovery is a bounded retry and new loud audio may immediately suppress the user again.

Manual volume changes during a hold remain yours. Manual restore and disabling the plugin restore the saved pre-action baseline. Automatic recovery from an extreme hold targets 100%. Ordinary balancing restores your manual baseline during silence.

## Hard limiter

A brickwall limiter on everything you hear from voice, set in the plugin window: a ceiling from -12 to 0 dBFS (default -1) and a release from 25 to 1000 ms (default 100). It runs as an AudioWorklet between HaloCord's voice bus and the output mix, so it only sees voice; Go Live audio skips the bus. Peaks are found on the 8x oversampled signal, the gain comes down over a 2 ms lookahead before a peak arrives, and a final clamp holds every sample at or below the ceiling. The audio is delayed by about 2.2 ms. The node exists only while the plugin and the limiter are both on; turning either off takes it out of the chain. It needs HaloCord's own voice playback (the audio guard in `desktop/base/userscript.js`).

## Notices

MicSpamGuard shows one live activity card instead of adding cards to the client's notification queue. It keeps at most three recent participants, replaces each person's previous action with their latest action, and expires each row after three seconds even while hovered. Leaving or switching calls, disabling notifications, changing detail mode and stopping the plugin clear the card immediately. Historical actions remain in the notification log without being replayed as popups.

Standard mode shows concise mute, protection recovery and manual restore actions. Verbose also shows balancing changes and explanations, with the same per-participant rate limiting. Client notification position settings still control the card's position. The activity card uses the existing notification component and does not emit native desktop notifications.

## Validation

Offline behavior checks cover zero readings, missing readings, recovery to 100%, returning blasts, manual overrides, identity conflicts, persistence, notice delivery and notice rate limiting. Synthetic tests do not prove every live voice connection. The detector requires consistent incoming participant identities before any volume write.

`node tests/mic-spam-guard-limiter.cjs` renders the limiter's own worklet source offline at ceilings of -12, -6, -1 and 0 dB with sines, intersample peaks, bursts, band limited noise, a square wave, clicks and a voice-like signal, and checks sample peak and 16x true peak against the ceiling (true peak within 0.1 dB), unchanged audio below the ceiling, release recovery and the stop message.
