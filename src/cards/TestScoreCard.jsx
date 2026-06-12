import { useCardControl, useCardInfo, useData } from '@ellucian/experience-extension-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';

import {
    makeStyles,
    Typography,
    Button,
    TextLink
} from '@ellucian/react-design-system/core';

const useStyles = makeStyles()({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },
    section: {
        marginTop: spacing40
    },
    button: {
        marginTop: spacing40,
        width: '100%'
    }
});

const TestScoreCard = () => {
    const { classes } = useStyles();
    const { setLoadingStatus, setErrorMessage, navigateToPage } = useCardControl();
    const { configuration: { getData, getTestScore }, cardId } = useCardInfo();
    const { authenticatedEthosFetch, getEthosQuery } = useData();


    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const personResult = await getEthosQuery({ queryId: 'person-info' });
                const _personData = personResult?.data?.persons?.edges?.map(edge => edge.node) || [];
                console.log(_personData);
                //const personId = _personData[0]?.credentials?.find(cred => cred.type === 'bannerId')?.value;
                const personId = '10001000';
                console.log(getTestScore);
                const response = await authenticatedEthosFetch(`${getTestScore}?cardId=${cardId}&studentID=${personId}`);
                const studentResult = await response.json();
                //const testResult = studentResult[0]?.DISTEST[0]?.disTest; 
                const testResult = 'STM4';
                const insightsResponse = await authenticatedEthosFetch(`${getData}?cardId=${cardId}&testCode=${testResult}`);
                const insightsResult = await insightsResponse.json();
                console.log(insightsResult);
                window.localStorage.setItem('testScore', JSON.stringify(insightsResult));


            } catch (_error) {
                setErrorMessage('Failed to fetch GoPass data');
            } finally {
                setLoadingStatus(false);
            }
        })();
    }, [getEthosQuery, setLoadingStatus, setErrorMessage]);

    const handleClick = (event) => {
        navigateToPage({
            route: `/studentTestScore`
        });
    };
    return (
        <div className={classes.card}>
            <Typography paragraph>
                Your placement results will determine which Math and English class you are eligible to register for.
            </Typography>

            <Button
                className={classes.button}
                color="primary"
                onClick={handleClick}
            >
                View Placement Results
            </Button>

            <div className={classes.section}>
                <Typography>
                    <strong>Note:</strong> If you do not see your placements, you may request placement with your high school transcripts using our{' '}
                    <TextLink
                        href="https://pasadena.edu/academics/support/counseling/academic-planning/prerequisite-clearance-request.php"
                        target="_blank"
                    >
                        online prerequisite clearance form
                    </TextLink>.
                </Typography>
            </div>
        </div>
    );
};

export default TestScoreCard;