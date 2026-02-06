import { Button, Typography, Select, DatePicker, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { requestFilterData } from '../lib/services';
const { RangePicker } = DatePicker;
type DateRange = [Dayjs | null, Dayjs | null];

type SearchFilters = {
    assetClasses: string[];
    regions: string[];
    topics: string[];
    dateRange: DateRange;
    authors: string[];
};

type FilterConstants = {
    assets: string[];
    regions: string[];
    topics: string[];
    authors: string[];
};

export default function AdvancedSearchForm() {
    const [filterConstants, setFilterConstants] = useState<FilterConstants | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const [searchParams, setSearchParams] = useSearchParams();
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const [filters, setFilters] = useState<SearchFilters>({
        assetClasses: searchParams.getAll('assetClasses'),
        regions: searchParams.getAll('regions'),
        topics: searchParams.getAll('topics'),
        dateRange:
            startDateParam && endDateParam
                ? [dayjs(startDateParam), dayjs(endDateParam)]
                : [null, null],
        authors: searchParams.getAll('authors'),
    });

    // Call api to get constants
    useEffect(() => {
        const fetchFilterConstants = async () => {
            try {
                const filterData = await requestFilterData();
                setFilterConstants({
                    assets: filterData.data.assets,
                    regions: filterData.data.regions,
                    topics: filterData.data.topics,
                    authors: filterData.data.authors,
                });
            } catch (error: unknown) {
                const message = `An unknown error occurred ${error}`;
                messageApi.error(message);
            }
        };
        fetchFilterConstants();
    }, []);

    const filteredAssets = filterConstants
        ? filterConstants.assets.filter((o) => !filters.assetClasses.includes(o))
        : [];
    const filteredRegions = filterConstants
        ? filterConstants.regions.filter((o) => !filters.regions.includes(o))
        : [];
    const filteredTopics = filterConstants
        ? filterConstants.topics.filter((o) => !filters.topics.includes(o))
        : [];

    const filteredAuthors = filterConstants
        ? filterConstants.authors.filter((o) => !filters.authors.includes(o))
        : [];

    // Iterate over record and add params as it sees
    const multiValueParams: Record<Exclude<keyof SearchFilters, 'dateRange'>, string> = useMemo(
        () => ({
            assetClasses: 'assetClasses',
            regions: 'regions',
            topics: 'topics',
            authors: 'authors',
        }),
        []
    );

    const handleSearch = useCallback(() => {
        const params = new URLSearchParams();

        (Object.keys(multiValueParams) as Exclude<keyof SearchFilters, 'dateRange'>[]).forEach(
            (key) => {
                const paramName = multiValueParams[key];
                const values = filters[key];

                if (Array.isArray(values) && values.length > 0) {
                    values.forEach((value) => {
                        params.append(paramName, value);
                    });
                }
            }
        );
        if (filters.dateRange[0] && filters.dateRange[1]) {
            params.set('startDate', filters.dateRange[0].format('YYYY-MM-DD'));
            params.set('endDate', filters.dateRange[1].format('YYYY-MM-DD'));
        } else {
            params.delete('startDate');
            params.delete('endDate');
        }

        setSearchParams(params);
    }, [filters, multiValueParams, setSearchParams]);

    const handleReset = useCallback(() => {
        setFilters({
            assetClasses: [],
            regions: [],
            topics: [],
            dateRange: [null, null],
            authors: [],
        });

        setSearchParams(new URLSearchParams());
    }, [setSearchParams]);

    return (
        <div>
            <div>
                {contextHolder}
                <Typography.Title level={5}>Asset Classes</Typography.Title>
                <Select
                    mode="multiple"
                    value={filters.assetClasses}
                    onChange={(values) => setFilters((prev) => ({ ...prev, assetClasses: values }))}
                    style={{ width: '100%' }}
                    options={filteredAssets.map((item: string) => ({
                        value: item,
                        label: item,
                    }))}
                />
            </div>
            <div>
                <Typography.Title level={5}>Regions</Typography.Title>
                <Select
                    mode="multiple"
                    value={filters.regions}
                    onChange={(values) => setFilters((prev) => ({ ...prev, regions: values }))}
                    style={{ width: '100%' }}
                    options={filteredRegions.map((item: string) => ({
                        value: item,
                        label: item,
                    }))}
                />
            </div>
            <div>
                <Typography.Title level={5}>Topics</Typography.Title>
                <Select
                    mode="multiple"
                    value={filters.topics}
                    onChange={(values) => setFilters((prev) => ({ ...prev, topics: values }))}
                    style={{ width: '100%' }}
                    options={filteredTopics.map((item: string) => ({
                        value: item,
                        label: item,
                    }))}
                />
            </div>
            <div>
                <Typography.Title level={5}>Date Range</Typography.Title>
                <RangePicker
                    value={filters.dateRange}
                    onChange={(dates) =>
                        setFilters((prev) => ({
                            ...prev,
                            dateRange: dates ?? [null, null],
                        }))
                    }
                    style={{ width: '100%' }}
                    format="YYYY-MM-DD"
                />
            </div>
            <div>
                <Typography.Title level={5}>Authors</Typography.Title>
                <Select
                    mode="multiple"
                    value={filters.authors}
                    onChange={(values) => setFilters((prev) => ({ ...prev, authors: values }))}
                    style={{ width: '100%' }}
                    options={filteredAuthors.map((item: string) => ({
                        value: item,
                        label: item,
                    }))}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'end', paddingTop: 16 }}>
                <Button type="default" onClick={handleReset}>
                    Clear Filters
                </Button>
                <span style={{ padding: '10px' }} />
                <Button type="primary" onClick={handleSearch}>
                    Search
                </Button>
            </div>
        </div>
    );
}
