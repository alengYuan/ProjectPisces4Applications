# Rhythm @ProjectPisces &middot; [![GitHub license](https://img.shields.io/badge/license-Apache%202.0%20%26%20Others-6e528b?style=flat-square&labelColor=484848)](https://github.com/alengYuan/ProjectPisces4Applications/blob/main/rhythm/policy/LICENSE.md)

A simple local music player for Windows 11 and later.

![Main window in light theme](screenshot/main_window,%20light_theme.png)

![Settings window in dark theme](screenshot/settings_window,%20dark_theme.png)

![SMTC and Core mode](screenshot/smtc,%20core_mode.png)

**When it's for you:**

-   You need a minimalist player that stays out of your way, keeping memory usage low while playing in the background.
-   You are tired of static shuffle lists or the frustration of "random" modes that repeat the same track too soon.
-   You want artist-based grouping to actually group by the artist, rather than creating messy "Artist A, Artist B" entries.
-   You have multiple audio output devices and want the player's internal volume to be bound to each device and switchable on the fly.
-   You prefer integration with Windows SMTC, or controlling basic playback via web APIs.
-   You love the Fluent Design 2 aesthetic blended with modern Material Design 3 elements.
-   You value accessibility and expect a solid experience with screen readers and keyboard navigation.

**When to use something else:**

-   You cannot accept that files of different types cannot be mixed in the same playlist.
-   Your music library is large, containing 1,000 or more tracks.
-   You enjoy spending time looking at the player UI rather than letting it play in the background.
-   You need any lyric-related features.
-   You require a built-in equalizer (EQ) or audio effects.
-   You want to create or manage custom playlists.
-   You wish to edit song metadata directly within the player.
-   You need professional-grade features, such as WASAPI Exclusive mode.
-   You need to play mono (1.0) or multi-channel (5.1 / 7.1) audio files.
-   Your audio files have sample rates below 44.1 kHz or above 192 kHz.
-   You are looking for a universal player that supports a vast range of formats and can be set as the system default.
-   You have a strong dislike for Electron-based software.

## Overview

### Key features

-   🗺️ **Localization**: Supports interface in English, 简体中文, and 日本語.
-   🎧 **Scene mode**: Remembers each audio output device with its corresponding player volume, allowing one-click switching anytime.
-   ⛓️ **Artist mapping rules**: Define unified field separator or set specific one-to-many / one-to-one mapping rules to easily organize all works by the same artist.
-   🔀 **Shuffling**: A slightly improved shuffle algorithm for a continuous, non-repeating playback experience.
-   🌿 **Core mode**: Discards the full UI in favor of a system tray icon and menu to minimize memory footprint. (Upon startup with a standard MP3 file, it uses around 30MB; under system scheduling during long sessions, it can drop below 15MB.) Built for true background playback.
-   📱 **Remote control**: Control play, pause, and track skipping (previous / next) via web APIs. (Port numbers: 26897 for development mode, 6897 for production mode.) Bring your own ideas, like using Siri from Apple Inc. to control music on your Windows PC.
-   😎 **Accessibility**: Full keyboard navigation support with optimization for Narrator (note: Scan mode may cause some interaction issues) and NVDA. Because great music should be accessible to everyone.
-   🪄 **Personalization**: The interface automatically synchronizes with the system accent and theme colors.

### Supported file types

-   FLAC
-   MP3

### Supported audio specifications

-   Channels: Stereo (2.0) only
-   Sample rates: 44.1 kHz to 192 kHz

### Supported platform

Windows 11, version 24H2 or later (x64)

## Building

### Prerequisites

> Unless specified otherwise, newer versions may also work.

-   Node.js v24 (with npm)
-   Rust 1.89 (stable-x86_64-pc-windows-msvc)
-   Visual Studio Build Tools 2022
    -   Desktop development with C++
        -   MSVC v143 - VS 2022 C++ x64/x86 build tools
        -   Windows 11 SDK (10.0.26100.7175)
-   napi 2.18 (CLI, **major version 3 (and higher) is not supported**)

> The tools listed above must be installed globally, while the following tools only need to be present locally.

-   rcedit v2 (by GitHub)

### Build instructions

Clone this repository and set `rhythm/` as your working directory. Run the following commands in cmd (PowerShell has not been tested) or other cmd-based environments:

#### Initialize dependencies

```cmd
batch\pre
```

Two configuration files would be generated in `rhythm/config/`. Complete these files before continuing.

`info.json` includes details used in the player's about page and metadata used for MSIX packaging.

Examples:

```json
{
    "name": "msix.package.name",
    "publisher": "XXXX",
    "organization": "BRAND",
    "publisherDisplayName.en": "XXXX",
    "publisherDisplayName.zh": "XXXX",
    "publisherDisplayName.ja": "XXXX",
    "pfxPassword": "******"
}
```

`path.json` specifies the executable paths for external tools needed for MSIX packaging.

Examples:

```json
{
    "MakeCert.exe": "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.26100.0\\x64\\MakeCert.exe",
    "pvk2pfx.exe": "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.26100.0\\x64\\pvk2pfx.exe",
    "rcedit.exe": "...",
    "makepri.exe": "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.26100.0\\x64\\makepri.exe",
    "makeappx.exe": "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.26100.0\\x64\\makeappx.exe",
    "signtool.exe": "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.26100.0\\x64\\signtool.exe"
}
```

#### Build and run

```cmd
batch\run
```

Before running the command above, please ensure you have run the following two commands at least once:

```cmd
batch\node\player.build
batch\node\smtc.build
```

The last two commands are used to build native modules; they will not be called automatically in the `batch\run` command.

#### Build and package

You can run this command to generate self-signed certificate files valid for 3 months, which will be saved in `rhythm/config/`:

```cmd
batch\pfx
```

Then, run this command to generate an unsigned MSIX package:

```cmd
batch\package
```

However, this is usually not very useful. If you want to generate a package that can be installed for testing, run the following command. This will produce an unsigned package, a package signed with your self-signed certificate, and an installer:

```cmd
batch\package sign
```

The generated installer is a self-contained package consisting of a PowerShell script and the necessary files. Running it will automatically import your self-signed certificate and either install or upgrade the player. It requires administrator privileges, and a bit of luck.

## FAQ

<details open>
<summary>
<h3 style="display: inline;">How to interact using the keyboard?</h3>
</summary>
You can switch between functional blocks or independent buttons using the Tab key. Use the Left and Right arrow keys, as well as the Home and End keys, to navigate focused items within lists or menus. To create a more visual and intuitive experience, some areas also support the Up and Down arrow keys for navigation. In pop-up menus, which are always vertically aligned, you must use the Up and Down arrow keys or the Home and End keys. Pressing Space or Enter generally produces the same effect as a left mouse click. In pop-up menus or dialogs, use the Esc key to exit or close. Some playback control buttons on the main interface also feature independent shortcut combinations. Note: Due to poor accessibility in Core mode, its toggle button cannot be interacted with via the keyboard and is invisible to screen readers.
</details>

<details open>
<summary>
<h3 style="display: inline;">The volume slider feels a bit strange, the adjustment steps sound different from other web or PC players?</h3>
</summary>
The volume control in this player does not directly change the amplitude by percentage; instead, it adjusts based on the dynamic range of decibels (dB), allowing for more flexible and effective control. You should trust your ears more than the volume number on the screen, give it a try and experience the benefits for yourself.
</details>

<details open>
<summary>
<h3 style="display: inline;">Why does the player sometimes start slowly or take a long time to display the main window?</h3>
</summary>
Upon startup, the player first checks for a specified media library location. If found, it performs a routine scan of the media files to ensure all recorded data is up to date; the main window only appears after this scan is complete. While routine scans are typically fast, the process may take longer if a large number of files have changed since your last session. Additionally, disk read / write speeds and CPU performance significantly impact scanning speed. Therefore, if you see a "Scanning" system notification immediately after launching from the Start menu, or if the player icon appears in the system tray (including the hidden tray) in Core mode, the player has started normally. Please wait patiently for the scan to finish.
</details>

<details open>
<summary>
<h3 style="display: inline;">Why do covers in the card list reload every time the player starts? Why does the CPU fan sometimes speed up when I browse the list?</h3>
</summary>
The color scheme and cover image for each card in the list are processed in real-time after every launch or reboot. These results are retained only during the current session. CPU and RAM are far more resilient to wear and tear than storage drives. This operation is lazy: a card only attempts to process and load its unique style when it is actually viewed. If you have a large number of tracks and scroll through the list slowly, viewing many cards in succession, it may lead to high CPU usage. In such cases, you might observe a significant and sustained increase in CPU fan speed. This is expected behavior and will typically return to normal shortly after all viewed cards have been processed.
</details>

<details open>
<summary>
<h3 style="display: inline;">Why is this player no longer recommended when my library exceeds 1,000 tracks?</h3>
</summary>
To ensure a consistent experience for screen reader users, the card list in Rhythm's main interface cannot utilize more aggressive or efficient optimization techniques. Furthermore, paginated lists are often ill-suited for the typical browsing experience of a local music player. As a result, Rhythm chooses to forgo further optimization. Much like the decisions made regarding its supported audio specifications, we believe that maintaining restraint, simplicity, and respect for accessibility is more important than trying to be everything to everyone. While Rhythm can handle heavier loads more easily in Core mode, this does not change the fact that performance bottlenecks exist in full mode, which is why it is stated as such in the introduction.
</details>

<details open>
<summary>
<h3 style="display: inline;">The player sometimes doesn't respond when I change the system accent color; when I use gray or grayscale colors, the results are always unexpected!</h3>
</summary>
When the OS accent color is modified, system-level issues can sometimes prevent third-party software, or even the system's own panels, from correctly detecting the change. You may try restarting the player, restarting the OS, or reapplying the color settings to overcome this. Regarding the "incorrect" response to gray tones: the player utilizes a color algorithm derived from Material Design 3. A key feature of this algorithm is its tendency to generate color schemes with good accessibility that are never entirely "hueless" or achromatic. Consequently, not all colors are suitable as a "color source," and certain colors (including grays) may produce results that differ from your expectations after processing.
</details>

## License

Rhythm is licensed under a hybrid agreement primarily based on the **Apache License 2.0**; for specific details, please consult the contents in `rhythm/policy/LICENSE.md`.
