import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, TextField, Button, Switch, FormControlLabel } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useData } from '@ellucian/experience-extension-utils';
import React, { useState } from 'react';

const SETTINGS_KEY = 'degreeAuditSettings';
const STUDENT_NAME_PREFIX = 'degreeAuditStudentName_';

const useStyles = makeStyles()({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },
    spacing: {
        marginBottom: spacing40
    }
});

const DegreeAuditCard = () => {
    const { classes } = useStyles();
    const { setErrorMessage, navigateToPage } = useCardControl();
    const { authenticatedEthosFetch } = useData();
    const { configuration: {
        catalogYear, majorCodes, majorDisp, whatIfPipeline, tokenUrl, whatIfUrl, username, password, gpaPipeline, studentPipeline
    }, cardId } = useCardInfo();

    const [studentId, setStudentId] = useState('');
    const [inProgress, setInProgress] = useState(false);
    const [includeInProgress, setIncludeInProgress] = useState(false);

    const handleClick = async () => {
        setInProgress(true);

        try {
            const tokenRes = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: 'whatifapi' })
            });
            if (!tokenRes.ok) throw new Error(`Token error: ${tokenRes.statusText}`);
            const { token } = await tokenRes.json();

            // token is now a plain string from the API — safe to store
            window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({
                includeInProgress,
                token,
                whatIfUrl,
                catalogYear,
                majorCodes,
                majorDisp,
                whatIfPipeline
            }));

            const personResponse = await authenticatedEthosFetch(`${studentPipeline}?cardId=${cardId}&personId=${studentId}`);

            if (!personResponse.ok) throw new Error(`Person error: ${personResponse.statusText}`);
            const personResult = await personResponse.json();

            const fullName = personResult?.data?.persons12?.edges?.[0]?.node?.names?.[0]?.fullName;
            if (fullName) {
                window.localStorage.setItem(`${STUDENT_NAME_PREFIX}${studentId}`, fullName);
            }

            navigateToPage({ route: `/degree-audit/${studentId}` });
        } catch (error) {
            console.error('Token fetch failed:', error);
            setErrorMessage('Failed to authenticate with DegreeWorks. Please check your configuration.');
        } finally {
            setInProgress(false);
        }
    };

    return (
        <div className={classes.card}>
            <TextField
                label="Student ID"
                placeholder="Enter your student ID"
                size="default"
                value={studentId}
                className={classes.spacing}
                fullWidth
                onChange={(e) => setStudentId(e.target.value)}
            />
            <FormControlLabel
                label="Include In-Progress Classes"
                control={
                    <Switch
                        checked={includeInProgress}
                        onChange={(e) => setIncludeInProgress(e.target.checked)}
                    />
                }
            />
            <Button
                color="primary"
                size="default"
                fluid
                variant="contained"
                className={classes.spacing}
                disabled={inProgress || !/^\d{8}$/.test(studentId)}
                onClick={handleClick}
            >
                {inProgress ? 'Authenticating…' : 'Run Audit'}
            </Button>
        </div>
    );
};

export default DegreeAuditCard;
