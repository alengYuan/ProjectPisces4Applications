import { memo } from 'react'
import { activeGroupBySwitchButton, inactiveGroupBySwitchButton } from './style'
import { useGroupBySwitchButton } from './model'
import { t } from '../../index'
import PlayingIndicatorForGroupBySwitchButton from '../PlayingIndicatorForGroupBySwitchButton/index.jsx'
import TabSwitchButton from '../TabSwitchButton/index.jsx'

/**
 * @type {React.FC<{}>}
 */
const GroupBySwitchButton = () => {
    const {
        currentPageGroupBy,
        currentPageType,
        albumListIsEmpty,
        currentTypeFirstAlbumGroupName,
        artistListIsEmpty,
        currentTypeFirstArtistGroupName,
        goToPage,
    } = useGroupBySwitchButton()

    return (
        <>
            <TabSwitchButton
                id="group-by-all"
                css={
                    currentPageGroupBy === 'all'
                        ? activeGroupBySwitchButton
                        : inactiveGroupBySwitchButton
                }
                tabIndex={currentPageGroupBy === 'all' ? 0 : -1}
                aria-selected={currentPageGroupBy === 'all'}
                aria-controls="library-page"
                data-type={currentPageType}
                data-group-by="all"
                data-group-name=""
                onPress={goToPage}
            >
                <PlayingIndicatorForGroupBySwitchButton />
                {t({
                    en: 'All',
                    zh: '全部',
                    ja: '全て',
                })}
            </TabSwitchButton>
            {!albumListIsEmpty &&
                <TabSwitchButton
                    id="group-by-album"
                    css={
                        currentPageGroupBy === 'album'
                            ? activeGroupBySwitchButton
                            : inactiveGroupBySwitchButton
                    }
                    tabIndex={currentPageGroupBy === 'album' ? 0 : -1}
                    aria-selected={currentPageGroupBy === 'album'}
                    aria-controls="library-page"
                    data-type={currentPageType}
                    data-group-by="album"
                    data-group-name={currentTypeFirstAlbumGroupName}
                    onPress={goToPage}
                >
                    {t({
                        en: 'Album',
                        zh: '专辑',
                        ja: 'アルバム',
                    })}
                </TabSwitchButton>
            }
            {!artistListIsEmpty &&
                <TabSwitchButton
                    id="group-by-artist"
                    css={
                        currentPageGroupBy === 'artist'
                            ? activeGroupBySwitchButton
                            : inactiveGroupBySwitchButton
                    }
                    tabIndex={currentPageGroupBy === 'artist' ? 0 : -1}
                    aria-selected={currentPageGroupBy === 'artist'}
                    aria-controls="library-page"
                    data-type={currentPageType}
                    data-group-by="artist"
                    data-group-name={currentTypeFirstArtistGroupName}
                    onPress={goToPage}
                >
                    {t({
                        en: 'Artist',
                        zh: '艺术家',
                        ja: 'アーティスト',
                    })}
                </TabSwitchButton>
            }
        </>
    )
}

export default memo(GroupBySwitchButton)