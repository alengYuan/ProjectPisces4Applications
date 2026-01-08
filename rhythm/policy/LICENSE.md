# Project License

*Copyright (c) 2026 Aleng Yuan @SlothIndie*

This project is licensed under different terms depending on the specific components, as detailed herein.

When using specific detachable utility libraries from this project, you are only required to retain the license files corresponding to the relevant code. However, when forking and developing based on this project, you must retain this license file and the entire "policy" directory in their entirety.

For the annexes of the standard external licenses used by this project's own files, as referenced in this license file, please consult the "annexes" directory (`rhythm/policy/annexes/`).

All files in this project (`rhythm/`) are licensed under the **Apache License 2.0**, with the exception of the following specific parts:

## Source Code

| Path                           | License                 |
| ------------------------------ | ----------------------- |
| rhythm/attachment/node-player/ | MIT License             |
| rhythm/attachment/node-smtc/   | MIT License             |
| rhythm/test/                   | BSD Zero Clause License |

> The module "rhythm-native-player" (`rhythm/attachment/node-player/`) utilizes "symphonia," which is protected under the **Mozilla Public License 2.0**. Its source code is available at https://github.com/pdeljanov/Symphonia.

## Assets

| Path                                                                 | License                                                                    |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| rhythm/package/Assets/                                               | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/screenshot/                                                   | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/image/theme-dark-default-cover.jpg               | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/image/theme-light-default-cover.jpg              | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/image/high-quality-indicator.png                 | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/image/theme-dark-tray-icon.png                   | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/image/theme-dark-window-icon.png                 | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/image/theme-light-tray-icon.png                  | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/image/theme-light-window-icon.png                | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/image/theme-dark-default-cover.webp              | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/image/theme-light-default-cover.webp             | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/asset/misc/slothindie-rings.ttf                        | SIL Open Font License 1.1                                                  |
| rhythm/source/renderer/main/reactApp/svg/IllustrationEmpty/index.jsx | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/renderer/main/reactApp/svg/IllustrationNull/index.jsx  | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |
| rhythm/source/icon.ico                                               | Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International |

> For "`.jsx`" files, the specific license mentioned pertains only to the SVG code contained therein; all other code segments remain licensed under the **Apache License 2.0**.

> The project as a whole is licensed under the **Apache License 2.0**. However, projects forked or developed based on this project are hereby granted permission to use the project’s Logo and name, provided that the following guidelines are observed:
>
> - The application brand icons of this project are licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International**.
> - The project Logo "Rhythm" is not stored as an image file; it is rendered purely based on the font "SlothIndieRings". The font file is licensed under the **SIL Open Font License 1.1**.
> - The project name "Rhythm" may be used freely in any non-commercial scenario; however, the use of the string "SlothIndie" within the full name of any derivative project is strictly prohibited.
> - Except for the authorizations explicitly mentioned above, this project does not grant, in any form or scope, any rights to use "SlothIndie" or "slothindie.org" to those who fork or develop based on this project.

## Third-Party Open Source Projects

The third-party open source projects used in this project are specifically listed below:

### cargo

| Project      | License                             |
| ------------ | ----------------------------------- |
| napi         | MIT License                         |
| napi-build   | MIT License                         |
| napi-derive  | MIT License                         |
| rubato       | MIT License                         |
| symphonia    | Mozilla Public License 2.0          |
| windows      | MIT License *OR* Apache License 2.0 |
| windows-core | MIT License *OR* Apache License 2.0 |

### npm

| Project                             | License            |
| ----------------------------------- | ------------------ |
| @emotion/react                      | MIT License        |
| @material/material-color-utilities  | Apache License 2.0 |
| @projectleo/tickerjs                | MIT License        |
| @react-aria/optimize-locales-plugin | Apache License 2.0 |
| @rollup/plugin-commonjs             | MIT License        |
| @rollup/plugin-json                 | MIT License        |
| @rollup/plugin-node-resolve         | MIT License        |
| @rollup/plugin-replace              | MIT License        |
| @rollup/plugin-swc                  | MIT License        |
| @rollup/plugin-terser               | MIT License        |
| @swc/core                           | Apache License 2.0 |
| decimal.js                          | MIT License        |
| electron                            | MIT License        |
| eslint                              | MIT License        |
| eslint-plugin-react                 | MIT License        |
| eslint-plugin-react-hooks           | MIT License        |
| express                             | MIT License        |
| immer                               | MIT License        |
| jotai                               | MIT License        |
| music-metadata                      | MIT License        |
| prettier-eslint                     | MIT License        |
| react                               | MIT License        |
| react-aria                          | Apache License 2.0 |
| react-aria-components               | Apache License 2.0 |
| react-dom                           | MIT License        |
| react-stately                       | Apache License 2.0 |
| rollup                              | MIT License        |
| typescript                          | Apache License 2.0 |
| use-immer                           | MIT License        |
| uuid                                | MIT License        |
| better-sqlite3                      | MIT License        |

### Other

| Project                | License                                      |
| ---------------------- | -------------------------------------------- |
| React Scan             | MIT License                                  |
| ps2exe                 | Microsoft Limited Public License version 1.1 |
| Fluent UI System Icons | MIT License                                  |

> The "ps2exe" PowerShell module is restricted to the packaging workflow of the installer and is not a component of the application itself. Derivative projects may readily exclude this module without affecting core functionality. This module is treated as an external PowerShell dependency during the build process. Since this project does not bundle its source code, this mention serves only as a licensing reference.
