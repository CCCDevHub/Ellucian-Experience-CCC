import React, { useEffect, useState } from 'react';
import { spacing40, spacing16, spacing8 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    makeStyles,
    Typography
} from '@ellucian/react-design-system/core';
import { usePageControl } from '@ellucian/experience-extension-utils';

const useStyles = makeStyles()({
    page: {
        margin: `0 ${spacing40}`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing16
    },
    card: {
        padding: spacing16,
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    },
    statusBadge: {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '999px',
        backgroundColor: '#E8F5E9',
        color: '#2E7D32',
        fontWeight: 600,
        fontSize: '0.875rem',
        marginTop: spacing8,
        marginBottom: spacing16
    },
    section: {
        marginTop: spacing16
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: spacing16,
        padding: `${spacing8} 0`,
        borderBottom: '1px solid #F0F0F0'
    },
    label: {
        fontWeight: 600,
        color: '#666'
    },
    value: {
        textAlign: 'right'
    },
    rankBox: {
        marginTop: spacing16,
        marginBottom: spacing16,
        padding: spacing16,
        borderRadius: '8px',
        backgroundColor: '#F5F9FF',
        border: '1px solid #D6E4FF',
        textAlign: 'center'
    },
    rankNumber: {
        fontSize: '2.5rem',
        fontWeight: 700,
        color: '#0054A6',
        lineHeight: 1
    }
});

const HomePage = () => {
    const { classes } = useStyles();
    const { setPageTitle } = usePageControl();

    const [placement, setPlacement] = useState(null);

    useEffect(() => {
        setPageTitle('Student Placement Results');

        try {
            const storedData = window.localStorage.getItem('testScore');

            if (storedData) {
                setPlacement(JSON.parse(storedData));
            }
        } catch (error) {
            console.error('Failed to load placement data:', error);
        }
    }, [setPageTitle]);

    if (!placement) {
        return (
            <div className={classes.page}>
                <Typography variant="h3">
                    No placement results found.
                </Typography>
            </div>
        );
    }

    return (
        <div className={classes.page}>
            <div className={classes.card}>
                <Typography variant="h2">
                    Placement Results
                </Typography>

                <div className={classes.statusBadge}>
                    {placement.test_score || 'N/A'}
                </div>

                <div className={classes.rankBox}>
                    <Typography variant="h4">
                        {placement.test_type || 'Placement'} Level
                    </Typography>

                    <div className={classes.rankNumber}>
                        {placement.mrank || placement.erank || '-'}
                    </div>
                </div>

                <div className={classes.section}>
                    <div className={classes.row}>
                        <span className={classes.label}>Test Type</span>
                        <span className={classes.value}>
                            {placement.test_type || 'N/A'}
                        </span>
                    </div>

                    <div className={classes.row}>
                        <span className={classes.label}>Test Code</span>
                        <span className={classes.value}>
                            {placement.test_code || 'N/A'}
                        </span>
                    </div>

                    <div className={classes.row}>
                        <span className={classes.label}>Description</span>
                        <span className={classes.value}>
                            {placement.test_desc || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;