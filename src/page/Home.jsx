import {
    spacing40,
    spacing16,
    spacing8,
} from '@ellucian/react-design-system/core/styles/tokens';
import {
    makeStyles,
    Typography,
    Card,
    CardContent,
} from '@ellucian/react-design-system/core';
import { usePageControl } from '@ellucian/experience-extension-utils';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles()((theme) => ({
    page: {
        margin: `0 ${spacing40}`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing16,
    },

    resultCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },

    banner: {
        background: '#f5f9ff',
        borderLeft: '6px solid #0066cc',
        padding: spacing16,
        marginBottom: spacing16,
    },

    scoreBadge: {
        display: 'inline-block',
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '4px 12px',
        borderRadius: 16,
        fontWeight: 600,
        fontSize: '0.875rem',
    },

    metaGrid: {
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        rowGap: spacing8,
        columnGap: spacing16,
        marginTop: spacing16,
    },

    label: {
        color: '#666',
        fontWeight: 600,
    },

    description: {
        '& a': {
            color: '#0066cc',
            fontWeight: 600,
            textDecoration: 'none',
        },

        '& a:hover': {
            textDecoration: 'underline',
        },

        '& b': {
            fontWeight: 700,
        },

        lineHeight: 1.7,
    },
}));

const HomePage = () => {
    const { classes } = useStyles();
    const { setPageTitle } = usePageControl();

    setPageTitle('Student Test Score');

   const [result, setResult] = useState({
        test_code: '',
        test_desc: '',
        last_updated_date: '',
    });

        useEffect(() => {
        setPageTitle('Student Test Score');

        //const testResult = localStorage.getItem('testResult');

        const insightsResult = JSON.parse(
            localStorage.getItem('testScore') || '{}'
        );

        setResult({
            test_desc: insightsResult?.test_desc || '',
            last_updated_date:
                insightsResult?.last_updated_date || '',
        });
    }, [setPageTitle]);

    return (
        <div className={classes.page}>
            <Typography variant="h2">
                Placement Results
            </Typography>

            <Card className={classes.resultCard}>
                <CardContent>
                    <div className={classes.banner}>
                        <Typography variant="h4" gutterBottom>
                            Placement Recommendation
                        </Typography>

                        <div
                            className={classes.description}
                            dangerouslySetInnerHTML={{
                                __html: result.test_desc,
                            }}
                        />
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default HomePage;