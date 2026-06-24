import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    makeStyles,
    Typography,
    TextLink,
    Button
} from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useData } from '@ellucian/experience-extension-utils';
import React, { useCallback, useEffect, useState } from 'react';

const useStyles = makeStyles()({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },
    section: {
        marginBottom: spacing40
    }
});

const TestScoresCard2 = () => {
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

                const personId = _personData[0]?.credentials?.find(cred => cred.type === 'bannerId')?.value;

                //const personId = '10001000';
                console.log(getTestScore);
                const response = await authenticatedEthosFetch(`${getTestScore}?cardId=${cardId}&studentId=${personId}`);
                const studentResult = await response.json();
                const testResult = studentResult[0]?.DISTEST[0].disTest;
                //const testResult = '0M38';
                console.log(testResult);
                console.log("testresult");
                const insightsResponse = await authenticatedEthosFetch(`${getData}?cardId=${cardId}&testCode=${testResult}`);
                const insightsResult = await insightsResponse.json();
                console.log(insightsResult);

                //grabs insights result for full page
                window.localStorage.setItem('testScore', JSON.stringify(insightsResult));



            } catch (_error) {
                setErrorMessage('Failed to fetch GoPass data');
            } finally {
                setLoadingStatus(false);
            }
        })();
    }, [getEthosQuery, setLoadingStatus, setErrorMessage]);

    //handles full page
    const handleClick = (event) => {
        navigateToPage({
            route: `/studentTestScore`
        });
    };

    return (
        <div className={classes.card}>
            <Typography
                className={classes.section}
                variant="body1"
            >
                Your placement results will determine which Math and English
                class you are eligible to register for.
            </Typography>

            <Button
                color="primary"
                onClick={handleClick}
                fullWidth
                className={classes.section}
            >
                View Placement Results
            </Button>

            <Typography variant="body1">
                <strong>Note:</strong> If you do not see your placements, you
                may request placement with your high school transcripts using
                our{' '}
                <TextLink
                    href="https://pasadena.edu/academics/support/counseling/academic-planning/prerequisite-clearance-request.php"
                    target="_blank"
                >
                    online prerequisite clearance form
                </TextLink>
                .
            </Typography>
        </div>
    );
};

export default TestScoresCard2;