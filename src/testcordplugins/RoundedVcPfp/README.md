# RoundedVCPFP

Adds full-resolution avatars with configurable rounded corners to HaloCord call tiles. Disable FullVCPFP before enabling RoundedVCPFP in the plugin settings.

Only call tile components receive the avatar background. Avatar lookup uses the guild avatar, global avatar and default avatar fallbacks when needed.

Settings, topmost first:

- Profile picture corner rounding shapes the avatar itself. 0 is a flat square like FullVCPFP; 50 and higher is a full circle. The rounding scales with the picture.
- Tile corner rounding shapes the whole tile box, in pixels, snapping to whole even values from 0 to 52.
- Avatar zoom scales the picture inside the tile; 100 keeps the full fill, lower values zoom out around the tile center down to 25.
- Turn off the tile background removes the background box behind profile pictures so only the picture shows. Focus and speaking highlights on the tile are hidden with it. Stream tiles keep their video.
- Hide user backgrounds removes the backgrounds other users set with plugins like USRBG. Left off, those stay visible even when the tile background switch is on.
- Show user banners fills the tile background with the user's profile banner when they have no USRBG background. Users without a banner keep the default look, and the hide switch above still wins.
- Prefer banners shows the profile banner even when a USRBG background exists, painting over it in the same spot.
- Speaking indicator chooses where the speaking glow lives: Box border keeps Discord's native ring around the tile, Profile picture moves the green glow onto the picture edge instead (the tile's own ring stands down for picture tiles; camera tiles keep the native tile ring). Screen-share and activity tiles never show it, like Discord's own ring. The glow follows the picture whether or not the tile background shows.
- Override Glow replaces Discord's green speaking ring around voice avatars (call tiles, the voice channel list and the plugin's own rings) with the glow color.
- Glow color takes the hex code for that ring, for example #3b82f6 for blue.

Changes apply when affected tiles re-render (layout changes, speaking state, participants joining or leaving) rather than the same frame.

Adapted from Equicord FullVCPFP by mochienya, maintained by DavidHiFi. GPL-3.0-or-later. See LICENSE.
