import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, TextField, Button, Switch, FormControlLabel } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo } from '@ellucian/experience-extension-utils';
import React, { useState } from 'react';

const SETTINGS_KEY = 'degreeAuditSettings';

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
    const { configuration: {
        catalogYear, majorCodes, majorDisp, whatIfPipeline, whatIfUrl, username, password
    } } = useCardInfo();

    const [studentId, setStudentId] = useState('');
    const [inProgress, setInProgress] = useState(false);
    const [includeInProgress, setIncludeInProgress] = useState(false);

    const handleClick = async () => {
        setInProgress(true);

        try {
            const tokenRes = await fetch('https://dwadmin-dev.ec.pasadena.edu/dwtest/transit/api/stateless-token', {
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
