import { useMemo } from 'react'
import { t } from '../../index'

/**
 * @type {()=>{
 * applicationFullName:string,
 * copyright:string,
 * ariaLabel:string,
 * version:string,
 * }}
 */
export const useItemAbout = () => {
    const applicationFullName = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `${process.env.META_ORGANIZATION} Rhythm`,
                zh: `${process.env.META_ORGANIZATION} Rhythm (聆声)`,
                ja: `${process.env.META_ORGANIZATION} Rhythm (リズム)`,
            }),
        [],
    )

    const copyright = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `© 2026 Aleng Yuan @SlothIndie. ${
                    process.env.META_PUBLISHER_DISPLAY_NAME_EN !==
                    'Aleng Yuan @SlothIndie'
                        ? `© (Portions) ${process.env.META_YEAR} ${process.env.META_PUBLISHER_DISPLAY_NAME_EN}. `
                        : ''
                }Licensed under the Apache License 2.0.`,
                zh: `© 2026 袁慠棱 @SlothIndie. ${
                    process.env.META_PUBLISHER_DISPLAY_NAME_ZH !==
                    '袁慠棱 @SlothIndie'
                        ? `© (部分版权所有) ${process.env.META_YEAR} ${process.env.META_PUBLISHER_DISPLAY_NAME_ZH}. `
                        : ''
                }根据 Apache License 2.0 许可证授权使用.`,
                ja: `© 2026 五月七日アイレン @SlothIndie. ${
                    process.env.META_PUBLISHER_DISPLAY_NAME_JA !==
                    '五月七日アイレン @SlothIndie'
                        ? `© (一部の著作権) ${process.env.META_YEAR} ${process.env.META_PUBLISHER_DISPLAY_NAME_JA}. `
                        : ''
                }Apache License 2.0 に基づいてライセンスされています.`,
            }),
        [],
    )

    const version = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            t({
                en: `Version ${process.env.META_VERSION}.0`,
                zh: `版本 ${process.env.META_VERSION}.0`,
                ja: `バージョン ${process.env.META_VERSION}.0`,
            }),
        [],
    )

    const ariaLabel = useMemo(
        /**
         * @type {()=>string}
         */
        () =>
            `${applicationFullName}; ${version}; ${copyright}`,
        [applicationFullName, copyright, version],
    )

    return {
        applicationFullName,
        copyright,
        ariaLabel,
        version,
    }
}