import { spacing40, spacing16, spacing8 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, Typography, Button } from '@ellucian/react-design-system/core';
import { usePageControl } from '@ellucian/experience-extension-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SETTINGS_KEY = 'degreeAuditSettings';
const CACHE_PREFIX = 'degreeAuditResults_';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const useStyles = makeStyles()({
    page: {
        margin: `0 ${spacing40}`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing16,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    meta: {
        fontSize: '0.75rem',
        color: '#888',
    },
    results: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    resultRow: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing8,
    },
    resultLabel: {
        width: '180px',
        flexShrink: 0,
        fontSize: '0.75rem',
    },
    progressTrack: {
        flex: 1,
        height: '5px',
        backgroundColor: '#e0e0e0',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#0066cc',
        borderRadius: '3px',
        transition: 'width 0.4s ease',
    },
    resultPct: {
        width: '36px',
        textAlign: 'right',
        fontSize: '0.75rem',
        fontWeight: 'bold',
    },
});

const getCacheKey = (studentId) => `${CACHE_PREFIX}${studentId}`;

const loadCache = (studentId) => {
    try {
        const raw = window.localStorage.getItem(getCacheKey(studentId));
        if (!raw) return null;
        const { timestamp, results } = JSON.parse(raw);
        if (Date.now() - timestamp > ONE_WEEK_MS) return null;
        return results;
    } catch {
        return null;
    }
};

const saveCache = (studentId, results) => {
    window.localStorage.setItem(getCacheKey(studentId), JSON.stringify({
        timestamp: Date.now(),
        results
    }));
};

const HomePage = () => {
    const { classes } = useStyles();
    const { setPageTitle, setLoadingStatus, setErrorMessage } = usePageControl();
    const { studentId } = useParams();

    const [auditData, setAuditData] = useState(null);
    const [cachedAt, setCachedAt] = useState(null);

    setPageTitle(`Major Audit for ${studentId ?? ''}`);

    const runAudit = useCallback(async (force = false) => {
        if (!studentId) return;

        if (!force) {
            const cached = loadCache(studentId);
            if (cached) {
                setAuditData(cached);
                const raw = window.localStorage.getItem(getCacheKey(studentId));
                setCachedAt(new Date(JSON.parse(raw).timestamp));
                setLoadingStatus(false);
                return;
            }
        }

        setLoadingStatus(true);
        setAuditData(null);

        const { includeInProgress = false, token, whatIfUrl, catalogYear, majorCodes = '', majorDisp = '' } = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || '{}');
        const majorOptions = majorCodes.split(',').map((code, i) => ({
            value: code.trim(),
            label: majorDisp.split(',')[i]?.trim() ?? code.trim()
        }));

        try {
            const results = [];
            for (const opt of majorOptions) {
                const [degree, major] = opt.value.split(' ');
                const res = await fetch(whatIfUrl, {
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
                if (!res.ok) throw new Error(`Audit error: ${res.statusText}`);
                const data = await res.json();
                data?.blockArray?.[0]?.ruleArray
                    ?.filter(rule => rule?.requirement?.type === 'MAJOR')
                    .forEach(rule => results.push({ [opt.label]: rule.percentComplete }));
            }

            saveCache(studentId, results);
            setAuditData(results);
            setCachedAt(new Date());
        } catch (error) {
            console.error('Audit failed:', error);
            setErrorMessage('Failed to fetch degree audit data. Please check your configuration and try again.');
        } finally {
            setLoadingStatus(false);
        }
    }, [studentId, setLoadingStatus, setErrorMessage]);

    useEffect(() => {
        runAudit();
    }, [runAudit]);

    const sortedResults = auditData
        ? [...auditData].sort((a, b) => parseFloat(Object.values(b)[0]) - parseFloat(Object.values(a)[0]))
        : null;

    return (
        <div className={classes.page}>
            <div className={classes.header}>
                <Typography variant="h2">Major Audit Results</Typography>
            </div>
            {sortedResults && (
                <div className={classes.results}>
                    {sortedResults.map((item, i) => {
                        const label = Object.keys(item)[0];
                        const pct = parseFloat(Object.values(item)[0]);
                        return (
                            <div key={i} className={classes.resultRow}>
                                <span className={classes.resultLabel}>{label}</span>
                                <div className={classes.progressTrack}>
                                    <div className={classes.progressFill} style={{ width: `${pct}%` }} />
                                </div>
                                <span className={classes.resultPct}>{Math.round(pct)}%</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HomePage;
