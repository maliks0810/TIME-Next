import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { AutoComplete, Input, Spin } from 'antd';
import type { InputRef } from 'antd';
import { getAladdinIdRecommendations } from './lib/services';
import '../../lib/styles.scss';
import { MessageInstance } from 'antd/es/message/interface';

const { Search } = Input;

type LensSearchBarProps = {
    onSearch: (aladdinId: string) => void;
    value: string;
    onValueChange: (value: string) => void;
    messageApi: MessageInstance;
};

const MAX_RECOMMENDATIONS = 5;
const DEBOUNCE_MS = 400;

export const SearchBar = ({
    onSearch,
    value,
    onValueChange,
    messageApi,
}: LensSearchBarProps) => {
    const [focused, setFocused] = useState(false);
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [recommendationLoading, setRecommendationLoading] = useState(false);
    const [ghostStyle, setGhostStyle] = useState<CSSProperties>({
        display: 'none',
    });

    const requestCounterRef = useRef(0);
    const searchInputRef = useRef<InputRef>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const tabCompletedRef = useRef(false);

    const topSuggestion = value.length > 0 ? recommendations[0] : undefined;

    const ghostRemainder = topSuggestion
        ? topSuggestion.slice(value.length)
        : '';

    // ------------ API calls ------------
    const fetchRecommendations = (query: string) => {
        const requestId = ++requestCounterRef.current;
        setRecommendationLoading(true);

        (async () => {
            try {
                const response =
                    await getAladdinIdRecommendations(query);

                if (requestId !== requestCounterRef.current) return;

                const nextRecommendations = (
                    Array.isArray(response.data)
                        ? response.data
                        : []
                )
                    .slice(0, MAX_RECOMMENDATIONS);

                    setRecommendations(nextRecommendations);
                    setRecommendationLoading(false);

            } catch (err) {
                console.error(
                    'Failed to load recommendations:',
                    err
                );
                messageApi.error('Failed to load search recommendations');
                if (requestId === requestCounterRef.current) {
                    setRecommendationLoading(false);
                    setRecommendations([]);
                }
            }
        })();
    };

    useEffect(() => {
        const trimmed = value.trim();

        if (!trimmed) {
            return;
        }

        const timer = window.setTimeout(() => {
            void fetchRecommendations(trimmed);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [value]);


    // ------------ Ghost overlay positioning ------------
    // Match the ghost overlay to the real <input> box so that the
    // typed text and the greyed remainder line up visually.
    useLayoutEffect(() => {
        const inputEl = searchInputRef.current?.input;
        const wrapperEl = wrapperRef.current;
        if (!inputEl || !wrapperEl) return;

        const update = () => {
            const inputRect = inputEl.getBoundingClientRect();
            const wrapperRect = wrapperEl.getBoundingClientRect();
            const styles = window.getComputedStyle(inputEl);

            setGhostStyle({
                position: 'absolute',
                left: inputRect.left - wrapperRect.left,
                top: inputRect.top - wrapperRect.top,
                width: inputRect.width,
                height: inputRect.height,
                paddingLeft: styles.paddingLeft,
                paddingRight: styles.paddingRight,
                paddingTop: styles.paddingTop,
                paddingBottom: styles.paddingBottom,
                fontFamily: styles.fontFamily,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                fontStyle: styles.fontStyle,
                letterSpacing: styles.letterSpacing,
                lineHeight: styles.lineHeight,
                boxSizing: 'border-box',
                pointerEvents: 'none',
                whiteSpace: 'pre',
                overflow: 'hidden',
                color: 'transparent',
                display: 'flex',
                alignItems: 'center',
            });
        };

        update();
        const observer = new ResizeObserver(update);
        observer.observe(inputEl);
        observer.observe(wrapperEl);
        window.addEventListener('resize', update);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);

    // ------------ Handlers ------------
    const handleValueChange = (nextValue: string) => {
        tabCompletedRef.current = false;
        onValueChange(nextValue);

        const trimmed = nextValue.trim();

        if (!trimmed) {
            // Invalidate any in-flight recommendation requests.
            requestCounterRef.current++;

            setRecommendationLoading(false);
            return;
        }

        setFocused(true);
    };

    const handleSearch = (searchValue?: string) => {
        const targetValue = (searchValue ?? value).trim();
        if (!targetValue) return;

        requestCounterRef.current++;

        setRecommendationLoading(false);

        setFocused(false);

        // remove actual browser focus
        searchInputRef.current?.input?.blur();

        onSearch(targetValue);
    };

    const handleKeyDown = (
        e: KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key !== 'Tab') {
            tabCompletedRef.current = false;
            return;
        }

        // Second Tab => Search
        if (
            tabCompletedRef.current &&
            value.trim()
        ) {
            e.preventDefault();

            tabCompletedRef.current = false;
            handleSearch();
            return;
        }

        // First Tab => Autocomplete
        if (
            !e.shiftKey &&
            topSuggestion &&
            ghostRemainder.length > 0
        ) {
            e.preventDefault();

            tabCompletedRef.current = true;

            onValueChange(topSuggestion);

            requestAnimationFrame(() => {
                const el = searchInputRef.current?.input;
                if (!el) return;

                el.focus({ preventScroll: true });

                const end = topSuggestion.length;
                try {
                    el.setSelectionRange(end, end);
                } catch {
                    // ignore
                }
            });
        } else {
            tabCompletedRef.current = false;
        }
    };

    const options = recommendations
        .slice(0, MAX_RECOMMENDATIONS)
        .map((item) => ({
            value: item,
            label: item,
        }));

    // Stable-width suffix so toggling the spinner never rebuilds the input.
    const suffix = (
        <span
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', }}
        >
            {recommendationLoading ? <Spin size="small" /> : null}
        </span>
    );

    return (
        <div
            ref={wrapperRef}
            style={{ position: 'relative', width: '100%', minWidth: 300 }}
        >
            <AutoComplete
                value={value}
                options={options}
                popupClassName="lens-search-dropdown"
                className={`lens-search-autocomplete ${focused ? 'lens-search-autocomplete-focused' : ''}`}
                notFoundContent={
                    recommendationLoading ? (
                        <Spin size="small" />
                    ) : (
                        'No matches'
                    )
                }
                onSelect={(selectedValue) => {
                    onValueChange(selectedValue);
                    handleSearch(selectedValue);
                }}
            >
                <Search
                    onFocus={() => {
                        setFocused(true);
                    }}
                    onBlur={() => {
                        setFocused(false);
                    }}
                    ref={searchInputRef}
                    placeholder="Enter Aladdin ID"
                    value={value}
                    enterButton="Search"
                    onSearch={handleSearch}
                    onChange={e => {
                        handleValueChange(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    suffix={suffix}
                />
            </AutoComplete>

            {ghostRemainder && (
                <div style={ghostStyle} aria-hidden="true">
                    <span>{value}</span>
                    <span
                        style={{
                            color: 'rgba(0, 0, 0, 0.35)',
                        }}
                    >
                        {ghostRemainder}
                    </span>
                    <span
                        style={{
                            color: 'rgba(0, 0, 0, 0.3)',
                            fontStyle: 'italic',
                            marginLeft: 8,
                        }}
                    >
                        {'\u21E5'} Tab to autocomplete
                    </span>
                </div>
            )}
        </div>
    );
};