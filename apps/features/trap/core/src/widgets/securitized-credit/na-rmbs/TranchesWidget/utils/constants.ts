export const ROW_HEIGHT_PX = 34;
export const VISIBLE_ROWS = 10;
export const TRANCHES_COLS = [
    { label: 'Tranche', width: 70, align: 'left' as const },
    { label: 'Tranche ID', width: 90, align: 'left' as const },
    { label: 'Coupon', width: 60, align: 'right' as const },
    { label: 'Type', width: 110, align: 'left' as const },
    { label: 'Curr', width: 40, align: 'center' as const },
    { label: 'Orig balance', width: 110, align: 'right' as const },
    { label: 'Curr balance', width: 110, align: 'right' as const },
    { label: 'Factor', width: 58, align: 'right' as const },
    {
        label: 'Orig ratings',
        width: 110,
        align: 'left' as const,
        render: ({ ratingAgency }: { ratingAgency: string }) => `Orig ratings  (${ratingAgency})`,
    },
    {
        label: 'Curr ratings',
        width: 110,
        align: 'left' as const,
        render: ({ ratingAgency }: { ratingAgency: string }) => `Curr ratings  (${ratingAgency})`,
    },
];
