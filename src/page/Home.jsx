import { spacing40, spacing24, spacing16, spacing8 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, Typography } from '@ellucian/react-design-system/core';
import { usePageControl } from '@ellucian/experience-extension-utils';
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'degreeAuditResults';

const TIERS = [
    { label: '✓ Completed',       min: 100, max: 100, color: '#2e7d32', bg: '#f0faf0' },
    { label: '⬆ Nearly Complete', min: 70,  max: 99,  color: '#0066cc', bg: '#f0f5ff' },
    { label: '◌ In Progress',     min: 40,  max: 69,  color: '#ed6c02', bg: '#fff8f0' },
    { label: '✗ Starting',        min: 0,   max: 39,  color: '#d32f2f', bg: '#fff5f5' },
];

const useStyles = makeStyles()({
    page: {
        margin: `${spacing24} ${spacing40}`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing24,
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing8,
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing8,
        paddingBottom: spacing8,
        borderBottom: '2px solid currentColor',
    },
    count: {
        fontSize: '0.8rem',
        opacity: 0.7,
        marginLeft: spacing8,
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing16,
        padding: `${spacing8} ${spacing16}`,
        borderRadius: '8px',
        fontSize: '0.9rem',
    },
    rowLabel: {
        width: '220px',
        flexShrink: 0,
    },
    barTrack: {
        flex: 1,
        height: '6px',
        borderRadius: '3px',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.08)',
    },
    barFill: {
        height: '100%',
        borderRadius: '3px',
    },
    pct: {
        width: '40px',
        textAlign: 'right',
        fontWeight: 'bold',
        flexShrink: 0,
    },
});

const HomePage = () => {
    const { classes } = useStyles();
    const { setPageTitle, setLoadingStatus } = usePageControl();
    const [auditData, setAuditData] = useState(null);

    setPageTitle('Degree Audit Results');

    useEffect(() => {
        setLoadingStatus(true);
        const onUpdate = () => {
            const updated = window.localStorage.getItem(STORAGE_KEY);
            if (updated) {
                setAuditData(JSON.parse(updated));
                setLoadingStatus(false);
            }
        };
        onUpdate();
        window.addEventListener('degreeAuditUpdate', onUpdate);
        return () => window.removeEventListener('degreeAuditUpdate', onUpdate);
    }, [setLoadingStatus]);

    if (!auditData) return null;

    return (
        <div className={classes.page}>
            <Typography variant="h2">Degree Completion</Typography>
            {TIERS.map(tier => {
                const items = auditData.filter(item => {
                    const pct = parseFloat(Object.values(item)[0]);
                    return pct >= tier.min && pct <= tier.max;
                }).sort((a, b) => parseFloat(Object.values(b)[0]) - parseFloat(Object.values(a)[0]));

                if (items.length === 0) return null;

                return (
                    <div key={tier.label} className={classes.section}>
                        <div className={classes.sectionHeader} style={{ color: tier.color }}>
                            <Typography variant="h4" style={{ color: tier.color }}>
                                {tier.label}
                            </Typography>
                            <span className={classes.count}>({items.length})</span>
                        </div>
                        {items.map((item, i) => {
                            const label = Object.keys(item)[0];
                            const pct = Math.round(parseFloat(Object.values(item)[0]));
                            return (
                                <div key={i} className={classes.row} style={{ backgroundColor: tier.bg }}>
                                    <span className={classes.rowLabel}>{label}</span>
                                    <div className={classes.barTrack}>
                                        <div
                                            className={classes.barFill}
                                            style={{ width: `${pct}%`, backgroundColor: tier.color }}
                                        />
                                    </div>
                                    <span className={classes.pct} style={{ color: tier.color }}>
                                        {pct}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

export default HomePage;
