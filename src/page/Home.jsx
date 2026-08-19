import { spacing40, spacing16, spacing8 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, Typography, Button } from '@ellucian/react-design-system/core';
import { usePageControl, useData, useCardInfo } from '@ellucian/experience-extension-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SETTINGS_KEY = 'degreeAuditSettings';
const CACHE_PREFIX = 'degreeAuditResults_';
const CACHE_PREFIX_TRANSCRIPT = 'transcriptResults_';
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
    transcriptSection: {
        marginTop: spacing40,
        paddingTop: spacing16,
        borderTop: '1px solid #d0d0d0',
    },
    transcriptGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        columnGap: spacing40,
        rowGap: spacing40,
        alignItems: 'start',
        marginTop: spacing16,
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
    termGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    transcriptTable: {
        width: '100%',
        tableLayout: 'fixed',
        borderCollapse: 'collapse',
    },
    transcriptHeaderCell: {
        textAlign: 'left',
        fontSize: '0.6875rem',
        color: '#888',
        borderBottom: '1px solid #e0e0e0',
        padding: '2px 4px',
    },
    transcriptCell: {
        fontSize: '0.75rem',
        padding: '2px 4px',
        borderBottom: '1px solid #f0f0f0',
    },
});

const getCacheKey = (prefix, studentId) => `${prefix}${studentId}`;

const loadCache = (prefix, studentId) => {
    try {
        const raw = window.localStorage.getItem(getCacheKey(prefix, studentId));
        if (!raw) return null;
        const { timestamp, results } = JSON.parse(raw);
        if (Date.now() - timestamp > ONE_WEEK_MS) return null;
        return { results, timestamp };
    } catch {
        return null;
    }
};

const saveCache = (prefix, studentId, results) => {
    window.localStorage.setItem(getCacheKey(prefix, studentId), JSON.stringify({
        timestamp: Date.now(),
        results
    }));
};

const HomePage = () => {
    const { classes } = useStyles();
    const { setPageTitle, setLoadingStatus, setErrorMessage } = usePageControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const { cardConfiguration: {
        catalogYear, majorCodes, majorDisp, whatIfPipeline, whatIfUrl, username, password
    }, cardId } = useCardInfo();

    const { studentId } = useParams();

    const [auditData, setAuditData] = useState(null);
    const [cachedAt, setCachedAt] = useState(null);
    const [transcriptData, setTranscriptData] = useState(null);

    setPageTitle(`Major Audit for ${studentId ?? ''}`);

    const runAudit = useCallback(async (force = false) => {
        if (!studentId) return;

        if (!force) {
            const cachedAudit = loadCache(CACHE_PREFIX, studentId);
            const cachedTranscript = loadCache(CACHE_PREFIX_TRANSCRIPT, studentId);
            if (cachedAudit && cachedTranscript) {
                setAuditData(cachedAudit.results);
                setTranscriptData(cachedTranscript.results);
                setCachedAt(new Date(cachedAudit.timestamp));
                setLoadingStatus(false);
                return;
            }
        }

        setLoadingStatus(true);
        setAuditData(null);


        const { includeInProgress = false, token } = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || '{}');

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

            saveCache(CACHE_PREFIX, studentId, results);
            setAuditData(results);
            setCachedAt(new Date());

            const transcriptResponse = await authenticatedEthosFetch(`${whatIfPipeline}?cardId=${cardId}&studentId=${studentId}`);
            if (!transcriptResponse.ok) throw new Error(`Transcript error: ${transcriptResponse.statusText}`);
            const transcriptResult = await transcriptResponse.json();
            const transcriptRecords = Array.isArray(transcriptResult) ? transcriptResult : (transcriptResult?.transcript ?? []);
            saveCache(CACHE_PREFIX_TRANSCRIPT, studentId, transcriptRecords);
            setTranscriptData(transcriptRecords);

        } catch (error) {
            console.error('Audit failed:', error);
            setErrorMessage('Failed to fetch degree audit data. Please check your configuration and try again.');
        } finally {
            setLoadingStatus(false);
        }
    }, [studentId, setLoadingStatus, setErrorMessage, cardId, catalogYear, majorCodes, majorDisp, whatIfPipeline, whatIfUrl, authenticatedEthosFetch]);

    useEffect(() => {
        runAudit();
    }, [runAudit]);

    const sortedResults = auditData
        ? [...auditData].sort((a, b) => parseFloat(Object.values(b)[0]) - parseFloat(Object.values(a)[0]))
        : null;

    const transcriptByTerm = transcriptData
        ? transcriptData.reduce((groups, record) => {
            const term = record.term ?? 'Unknown Term';
            (groups[term] ??= []).push(record);
            return groups;
        }, {})
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
            {cachedAt && (
                <Typography className={classes.meta}>
                    Last updated {cachedAt.toLocaleString()}
                </Typography>
            )}
            {transcriptByTerm && (
                <div className={classes.transcriptSection}>
                    <Typography variant="h3">Transcript</Typography>
                    <div className={classes.transcriptGrid}>
                    {Object.entries(transcriptByTerm).map(([term, courses]) => (
                        <div key={term} className={classes.termGroup}>
                            <Typography variant="h4">{term}</Typography>
                            <table className={classes.transcriptTable}>
                                <thead>
                                    <tr>
                                        <th className={classes.transcriptHeaderCell} style={{ width: '50%' }}>Course</th>
                                        <th className={classes.transcriptHeaderCell} style={{ width: '25%' }}>Grade</th>
                                        <th className={classes.transcriptHeaderCell} style={{ width: '25%' }}>Units</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.map((course, i) => (
                                        <tr key={i}>
                                            <td className={classes.transcriptCell}>{course.course}</td>
                                            <td className={classes.transcriptCell}>{course.grade}</td>
                                            <td className={classes.transcriptCell}>{course.units}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
