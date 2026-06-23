import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, Typography, Button, Tooltip } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useData } from '@ellucian/experience-extension-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { Copy, Check, Info } from '@ellucian/ds-icons/lib';

const useStyles = makeStyles()({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },
    spacing: {
        marginBottom: spacing40
    },
    passBox: {
        padding: spacing40,
        textAlign: 'center'
    },
    codeLabel: {
        color: '#666',
        marginBottom: '4px'
    },
    codeText: {
        fontSize: '2.5rem',
        fontWeight: 700,
        letterSpacing: '0.25em',
        color: '#1a1a1a',
        marginBottom: '8px'
    },
    validDate: {
        color: '#555',
        fontSize: '0.875rem'
    },
    codeCard: {
        border: '2px solid #1976d2',
        borderRadius: '12px',
        padding: '24px 32px',
        display: 'inline-block',
        background: '#f0f7ff',
        marginTop: '8px',
        boxShadow: '0 4px 16px rgba(25, 118, 210, 0.15)'
    },
    iconWrap: {
        color: '#1976d2',
        marginBottom: '8px'
    },
    codeRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px'
    },
    copyBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#1976d2',
        padding: '4px',
        display: 'flex',
        alignItems: 'center'
    },
    badgeRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px'
    },
    infoIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#1976d2',
        marginLeft: '4px',
        verticalAlign: 'middle'
    },
    activateBtn: {
        marginTop: '16px'
    }
});


const GoPass = () => {
    const { classes } = useStyles();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { configuration: { getData, insertData }, cardId } = useCardInfo();
    const { authenticatedEthosFetch, getEthosQuery } = useData();

    const [personId, setPersonId] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [goPassData, setGoPassData] = useState(null);
    const [requesting, setRequesting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState('');
    const [registration, setRegistration] = useState(null);


    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(goPassData?.code || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [goPassData]);

    const fetchGoPass = useCallback(async (personId) => {
        const gopassResponse = await authenticatedEthosFetch(`${getData}?cardId=${cardId}&studentId=${personId}`);
        const gopassResult = await gopassResponse.json();
        setGoPassData(gopassResult);

        const termResponse = await authenticatedEthosFetch(`${getData}?cardId=${cardId}&studentId=${personId}&isNew=true`);
        const termResult = await termResponse.json();
        setSelectedTerm(termResult.term);

        const registrationResponse = await authenticatedEthosFetch(`${getData}?cardId=${cardId}&studentId=${personId}&term=${termResult.term}&isRegistration=true`);
        const registrationResult = await registrationResponse.json();
        setRegistration(registrationResult);

    }, [authenticatedEthosFetch, getData, cardId]);

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const personResult = await getEthosQuery({ queryId: 'person-info' });
                const _personData = personResult?.data?.persons?.edges?.map(edge => edge.node) || [];
                const personId = _personData[0]?.credentials?.find(cred => cred.type === 'bannerId')?.value;
                const firstName = _personData[0]?.names?.[0]?.firstName;
                const lastName = _personData[0]?.names?.[0]?.lastName;
                // const personId = '10845875';
                setPersonId(personId);
                setFirstName(firstName);
                setLastName(lastName);
                await fetchGoPass(personId);
            } catch (_error) {
                setErrorMessage('Failed to fetch GoPass data');
            } finally {
                setLoadingStatus(false);
            }
        })();
    }, [getEthosQuery, setLoadingStatus, setErrorMessage, fetchGoPass]);

    const handleGetPass = useCallback(async () => {
        setRequesting(true);
        try {
            await authenticatedEthosFetch(`${insertData}?cardId=${cardId}&studentId=${personId}&firstName=${firstName}&lastName=${lastName}&term=${encodeURIComponent(selectedTerm)}`);
            await fetchGoPass(personId);
        } catch (_error) {
            setErrorMessage('Failed to request GoPass');
        } finally {
            setRequesting(false);
        }
    }, [authenticatedEthosFetch, insertData, cardId, personId, fetchGoPass, setErrorMessage, firstName, lastName, selectedTerm]);

    return (
        <div className={classes.card}>
            {goPassData?.code ? (
                <div className={classes.passBox}>
                    <div className={classes.codeCard}>
                        <div className={classes.codeRow}>
                            <div className={classes.codeText}>{goPassData.code}</div>
                            <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                                <button className={classes.copyBtn} onClick={handleCopy} aria-label="Copy code">
                                    {copied ? <Check small /> : <Copy small />}
                                </button>
                            </Tooltip>
                        </div>
                        <div className={classes.badgeRow}>
                            <Typography variant="body2" className={classes.validDate}>
                                Valid: {goPassData.date_from} - {goPassData.date_to}
                            </Typography>
                            <Tooltip title="Learn more about U-Pass">
                                <a
                                    href="https://pasadena.edu/campus-life/student-life/u-pass.php"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={classes.infoIcon}
                                    aria-label="U-Pass information"
                                >
                                    <Info small />
                                </a>
                            </Tooltip>
                        </div>
                    </div>
                    <div className={classes.activateBtn}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => window.open('https://www.taptogo.net/gopass', '_blank')}
                        >
                            Activate
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={classes.passBox}>
                    <Typography variant="body1" className={classes.spacing}>
                        No GoPass found for {selectedTerm}.
                    </Typography>
                    {registration && (Array.isArray(registration) ? registration.length > 0 : Object.keys(registration).length > 0) ? (
                        <Button
                            color="primary"
                            onClick={handleGetPass}
                            disabled={requesting || !personId || !selectedTerm}
                        >
                            {requesting ? 'Requesting...' : 'Get GoPass'}
                        </Button>
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            You are not registered for {selectedTerm}.
                        </Typography>
                    )}
                </div>
            )}
        </div>
    );
}


export default GoPass;