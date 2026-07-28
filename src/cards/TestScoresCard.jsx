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
    },
    // Optional: If body2 isn't small enough, you can force custom styling here
    smallText: {
        fontSize: '0.875rem' // Adjust this value down as needed (e.g., '12px' or '0.8rem')
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

                console.log(getTestScore);
                const response = await authenticatedEthosFetch(`${getTestScore}?cardId=${cardId}&studentId=${personId}`);
                const studentResult = await response.json();

                console.log("studentResult:");
                console.log(studentResult);

                const testResultAll = studentResult[0]?.SORTEST?.map(test => ({
                    tescCode: test.tescCode,
                    testScore: test.testScore
                })) || [];

                console.log("testresultAll");
                console.log(testResultAll);

                const testResult = testResultAll
                    .filter(item => item.testScore === 'VALID')
                    .map(item => item.tescCode);

                console.log("testresult");
                console.log(testResult);

                const insightsResult = await Promise.all(
                    testResult.map(async (code) => {
                        const response = await authenticatedEthosFetch(
                            `${getData}?cardId=${cardId}&testCode=${encodeURIComponent(code)}`
                        );

                        return response.json();
                    })
                );

                console.log("insightsResult");
                console.log(insightsResult);

                const validResults = insightsResult.filter(
                    item => item.test_score === 'VALID'
                );

                console.log("validResults");
                console.log(validResults); 

                const instfinalplacement = Object.values(
                    validResults.reduce((acc, item) => {
                        const rawType = item.test_type;
                        const type = (rawType === 'ENGL' || rawType === 'ESL') ? 'ENGL_ESL' : rawType;

                        if (!acc[type]) {
                            acc[type] = item;
                            return acc;
                        }

                        if (type === 'MATH') {
                            const currentRank = Number(acc[type].mrank || Infinity);
                            const newRank = Number(item.mrank || Infinity);

                            if (newRank < currentRank) {
                                acc[type] = item;
                            }
                        } else if (type === 'ENGL_ESL') {
                            const currentRank = Number(acc[type].erank || Infinity);
                            const newRank = Number(item.erank || Infinity);

                            if (newRank < currentRank) {
                                acc[type] = item;
                            }
                        }

                        return acc;
                    }, {})
                );

                console.log("instfinalplacement:");
                console.log(instfinalplacement);
                                    
                window.localStorage.setItem(
                    'testScore', 
                    JSON.stringify({ instfinalplacement: instfinalplacement })
                );

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
            {/* Changed variant from "body1" to "body2" for a smaller design system font size */}
            <Typography
                className={classes.section}
                variant="body2"
            >
                Your placement results will determine which Math and English
                class you are eligible to register for.
            </Typography>

            <Button
                color="primary"
                onClick={handleClick}
                className={classes.section}
            >
                View Placement Results
            </Button>

            {/* Changed variant to "body2" and appended optional custom styling class */}
            <Typography variant="body2" className={classes.smallText}>
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