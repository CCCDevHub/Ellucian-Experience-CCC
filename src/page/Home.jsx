import {
    spacing40,
    spacing16,
    spacing24, // Added for larger internal box padding
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

    // Each box now features custom internal padding, shadow, and a light gray background
    placementBox: {
        borderRadius: 8,
        background: '#e1e7eb', // Clean light gray background
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)', // Soft, modern elevation shadow
        border: '1px solid rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-1px)',
        },
    },

    // Extra spacing applied inside the card container body
    cardContentSpacing: {
        padding: `${spacing24} !important`, // Overrides default design system card padding
    },

    headerRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center', 
        flexWrap: 'wrap',
        gap: spacing16,
        width: '100%',
    },

    codeBadge: {
        display: 'inline-block',
        backgroundColor: '#e3f2fd',
        color: '#0d47a1',
        padding: '6px 12px',
        borderRadius: 4,
        fontWeight: 700,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },

    description: {
        ...theme.typography.h4,
        flex: '1 1 300px',
        lineHeight: 1.6,
        
        // Switched from checkmark layout to bullet points
        display: 'list-item',               
        listStyleType: '"*""', // Standard circular bullet point             
        listStylePosition: 'inside',        

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
    },
}));

const HomePage = () => {
    const { classes } = useStyles(); 
    const { setPageTitle } = usePageControl();

    const [placements, setPlacements] = useState([]);

    useEffect(() => {
        setPageTitle('Student Test Score');

        const storedScore = JSON.parse(
            localStorage.getItem('testScore') || '{}'
        );

        const instfinalplacement = storedScore?.instfinalplacement || [];
        setPlacements(instfinalplacement);
    }, [setPageTitle]);

    return (
        <div className={classes.page}>
            <Typography variant="h2">
                Placement Results
            </Typography>

            {placements.length > 0 ? (
                placements.map((placement, index) => {
                    return (
                        <Card 
                            key={placement.test_code || index} 
                            className={classes.placementBox}
                        >
                            <CardContent className={classes.cardContentSpacing}>
                                <div className={classes.headerRow}>
                                    {/* Description rendering with disc bullet */}
                                    <div
                                        className={classes.description}
                                        dangerouslySetInnerHTML={{
                                            __html: placement.test_desc || 'No Description Provided',
                                        }}
                                    />
                                    
                                    {/* Code Badge Display */}
                                    {placement.test_code && (
                                        <span className={classes.codeBadge}>
                                            Code: {placement.test_code}
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            ) : (
                <Card className={classes.placementBox}>
                    <CardContent className={classes.cardContentSpacing}>
                        <Typography variant="body1">
                            No placement results found.
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default HomePage;