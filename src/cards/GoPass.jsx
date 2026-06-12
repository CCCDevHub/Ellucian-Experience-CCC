import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, Typography, Button, Tooltip, DropdownTypeahead, DropdownTypeaheadItem } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useData } from '@ellucian/experience-extension-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { Copy, Check } from '@ellucian/ds-icons/lib';

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
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [goPassData, setGoPassData] = useState([]);
    const [requesting, setRequesting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [termData, setTermData] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState('');

    useEffect(() => {
        if (termData.length > 0 && !selectedTerm) {
            setSelectedTerm(termData[0]);
        }
    }, [termData, selectedTerm]);

    const filteredPass = goPassData.find(pass => pass.term === selectedTerm) || null;

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(filteredPass?.code || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [filteredPass]);

    const fetchGoPass = useCallback(async (personId) => {
        const termList = [];
        const gopassResponse = await authenticatedEthosFetch(`${getData}?cardId=${cardId}&studentId=${personId}`);
        const gopassResult = await gopassResponse.json();

        const passes =
            typeof gopassResult.results === "string"
                ? JSON.parse(gopassResult.results)
                : gopassResult.results || [];
        passes.forEach(pass => { termList.push(pass.term); });

        setGoPassData(passes);

        const termResponse = await authenticatedEthosFetch(`${getData}?cardId=${cardId}&studentId=${personId}&isNew=true`);
        const termResult = await termResponse.json();
        if (termResult?.term && !termList.includes(termResult.term)) {
            termList.push(termResult.term);
        }
        setTermData(termList);

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
                // const personId = '111331';
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
            <div className={classes.spacing}>
                <DropdownTypeahead
                    id="gopass-term-dropdown"
                    label="Term"
                    value={selectedTerm}
                    onChange={(newValue) => { if (newValue) setSelectedTerm(newValue); }}
                    fullWidth
                >
                    {termData.map(term => (
                        <DropdownTypeaheadItem key={term} value={term} label={term}>
                            {term}
                        </DropdownTypeaheadItem>
                    ))}
                </DropdownTypeahead>
            </div>
            {filteredPass ? (
                <div className={classes.passBox}>
                    <div className={classes.codeCard}>
                        <div className={classes.codeRow}>
                            <div className={classes.codeText}>{filteredPass.code}</div>
                            <Tooltip title={copied ? 'Copied!' : 'Copy code'}>
                                <button className={classes.copyBtn} onClick={handleCopy} aria-label="Copy code">
                                    {copied ? <Check small /> : <Copy small />}
                                </button>
                            </Tooltip>
                        </div>
                        <div className={classes.badgeRow}>
                            <Typography variant="body2" className={classes.validDate}>
                                Valid: {filteredPass.date_from} - {filteredPass.date_to}
                            </Typography>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={classes.passBox}>
                    <Typography variant="body1" className={classes.spacing}>
                        No GoPass found for {selectedTerm}.
                    </Typography>
                    <Button
                        color="primary"
                        onClick={handleGetPass}
                        disabled={requesting || !personId || !selectedTerm}
                    >
                        {requesting ? 'Requesting...' : 'Get GoPass'}
                    </Button>
                </div>
            )}
        </div>
    );
}


export default GoPass;