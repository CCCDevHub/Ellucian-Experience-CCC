import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, Typography, Button, Tooltip } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useData } from '@ellucian/experience-extension-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { Bus, Copy, Check } from '@ellucian/ds-icons/lib';

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
    }
});


const GoPass = () => {
    const { classes } = useStyles();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { configuration: { getData, insertData }, cardId } = useCardInfo();
    const { authenticatedEthosFetch, getEthosQuery } = useData();

    const [personId, setPersonId] = useState(null);
    const [goPassData, setGoPassData] = useState(undefined);
    const [requesting, setRequesting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(goPassData?.code || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [goPassData]);

    const fetchGoPass = useCallback(async (personId) => {
        const response = await authenticatedEthosFetch(`${getData}?cardId=${cardId}&studentId=${personId}`);
        const result = await response.json();
        setGoPassData(result);
    }, [authenticatedEthosFetch, getData, cardId]);

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const personResult = await getEthosQuery({ queryId: 'person-info' });
                const _personData = personResult?.data?.persons?.edges?.map(edge => edge.node) || [];
                const personId = _personData[0]?.credentials?.find(cred => cred.type === 'bannerId')?.value;
                // const personId = '11331';
                setPersonId(personId);
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
            await authenticatedEthosFetch(`${insertData}?cardId=${cardId}&studentId=${personId}`);
            await fetchGoPass(personId);
        } catch (_error) {
            setErrorMessage('Failed to request GoPass');
        } finally {
            setRequesting(false);
        }
    }, [authenticatedEthosFetch, insertData, cardId, personId, fetchGoPass, setErrorMessage]);

    const hasPass = goPassData && goPassData.code;

    return (
        <div className={classes.card}>
            {hasPass ? (
                <div className={classes.passBox}>
                    <div className={classes.iconWrap}>
                        <Bus large />
                    </div>
                    <Typography variant="body2" className={classes.codeLabel}>
                        Your GoPass Code
                    </Typography>
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
                                Valid: {goPassData.date_valid}
                            </Typography>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={classes.passBox}>
                    <Typography variant="body1" className={classes.spacing}>
                        No GoPass found.
                    </Typography>
                    <Button
                        color="primary"
                        onClick={handleGetPass}
                        disabled={requesting || !personId}
                    >
                        {requesting ? 'Requesting...' : 'Get GoPass'}
                    </Button>
                </div>
            )}
        </div>
    );
}


export default GoPass;