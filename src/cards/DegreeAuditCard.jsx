import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, TextField, Button, Switch, FormControlLabel } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo } from '@ellucian/experience-extension-utils';
import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'degreeAuditResults';

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
    const { setLoadingStatus, setErrorMessage, navigateToPage } = useCardControl();
    const { configuration: {
        catalogYear, majorCodes, majorDisp, tokenUrl, whatIfUrl, username, password
    } } = useCardInfo();

    const codes = majorCodes.split(',');
    const disps = majorDisp.split(',');
    const majorOptions = codes.map((code, i) => ({
        value: code.trim(),
        label: disps[i]?.trim() ?? code.trim()
    }));

    const [token, setToken] = useState(null);
    const [studentId, setStudentId] = useState('');
    const [inProgress, setInProgress] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [includeInProgress, setIncludeInProgress] = useState(false);

    useEffect(() => {
        setLoadingStatus(true);
        const fetchToken = async () => {
            try {
                const response = await fetch('https://dwadmin-dev.ec.pasadena.edu/dwtest/transit/api/stateless-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password: 'whatifapi' })
                });
                if (!response.ok) throw new Error(`Error: ${response.statusText}`);
                const data = await response.json();
                setToken(data.token);
            } catch (error) {
                console.error('Error fetching token:', error);
                setErrorMessage('Failed to fetch token. Please check your configuration and try again.');
            } finally {
                setLoadingStatus(false);
            }
        };
        fetchToken();
    }, [tokenUrl, username, password, setLoadingStatus, setErrorMessage]);

    const runAudit = async () => {
        setInProgress(true);
        const results = [];
        try {
            for (const opt of majorOptions) {
                const [degree, major] = opt.value.split(' ');
                const response = await fetch(whatIfUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': token
                    },
                    body: JSON.stringify({
                        studentId,
                        school: 'CR',
                        degree,
                        catalogYear,
                        keepCurriculum: false,
                        includeInprogress: includeInProgress,
                        includePreregistered: false,
                        includeInternalNotes: false,
                        refreshStudentData: false,
                        goals: [{ code: 'MAJOR', value: major, catalogYear }],
                        classes: [],
                        saveAudit: { saveAudit: false, freeze: false }
                    })
                });
                if (!response.ok) throw new Error(`Error: ${response.statusText}`);
                const data = await response.json();
                results.push({ [opt.label]: data?.blockArray?.[0]?.ruleArray?.[0]?.percentComplete });
            }
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
            window.dispatchEvent(new window.CustomEvent('degreeAuditUpdate'));
        } catch (error) {
            console.error('Error fetching degree audit data:', error);
            setErrorMessage('Failed to fetch degree audit data. Please check your configuration and try again.');
        } finally {
            setInProgress(false);
        }
    };

    const handleClick = () => {
        navigateToPage({ route: `/degree-audit/${studentId}` });
        runAudit();
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
                disabled={disabled || !/^\d{8}$/.test(studentId)}
                onClick={handleClick}
            >
                Run Audit
            </Button>
        </div>
    );
};

export default DegreeAuditCard;
