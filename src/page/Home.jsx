import { spacing40, spacing16, spacing8 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, Typography, Button } from '@ellucian/react-design-system/core';
import { usePageControl, useData, useCardInfo } from '@ellucian/experience-extension-utils';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const SETTINGS_KEY = 'degreeAuditSettings';
const STUDENT_NAME_PREFIX = 'degreeAuditStudentName_';
const CACHE_PREFIX = 'degreeAuditResults_';
const CACHE_PREFIX_TRANSCRIPT = 'transcriptResults_';
const CACHE_PREFIX_GPA = 'gpaResults_';
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
        columnWidth: '260px',
        columnGap: spacing40,
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
        breakInside: 'avoid',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        marginBottom: spacing40,
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
    gpaSection: {
        marginTop: spacing16,
    },
    gpaHeroGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: spacing16,
    },
    gpaHero: {
        backgroundColor: '#f8f9fa',
        border: '1px solid #e8eaed',
        borderRadius: '10px',
        padding: spacing16,
    },
    gpaStatRow: {
        display: 'flex',
        alignItems: 'stretch',
    },
    gpaStat: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        padding: `0 ${spacing16}`,
    },
    gpaStatFirst: {
        paddingLeft: 0,
    },
    gpaStatDivider: {
        width: '1px',
        backgroundColor: '#e0e0e0',
        margin: `2px 0`,
    },
    gpaStatLabel: {
        fontSize: '0.6875rem',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 600,
    },
    gpaStatValue: {
        fontSize: '2rem',
        fontWeight: 700,
        color: '#0066cc',
        lineHeight: 1.1,
    },
    gpaStatSub: {
        fontSize: '0.75rem',
        color: '#666',
    },
    gpaMetaGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: spacing16,
        marginTop: spacing16,
    },
    gpaMetaBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing8,
    },
    chipRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing8,
    },
    chip: {
        fontSize: '0.75rem',
        color: '#333',
        backgroundColor: '#eef1f4',
        border: '1px solid #dde1e6',
        borderRadius: '999px',
        padding: '3px 12px',
    },
    chipGE: {
        color: '#0b5b3f',
        backgroundColor: '#e5f4ee',
        borderColor: '#c7e7d9',
    },
    degreesGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing8,
        marginTop: spacing16,
    },
    degreeItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        padding: `${spacing8} ${spacing16}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: '160px',
    },
    degreeTopRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing8,
    },
    degreeName: {
        fontSize: '0.8125rem',
        fontWeight: '600',
        color: '#333',
    },
    degreeStatus: {
        fontSize: '0.625rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        padding: '2px 8px',
        borderRadius: '999px',
        color: '#0b5b3f',
        backgroundColor: '#e5f4ee',
    },
    degreeTerm: {
        fontSize: '0.6875rem',
        color: '#888',
    },
});

const DEGREE_STATUS_LABELS = {
    GR: 'Granted',
    PN: 'Pending',
    PD: 'Pending',
    IP: 'In Progress',
};

const parseDegreeEntry = (entry) => {
    const raw = entry.trim();
    const match = raw.match(/^([A-Z]+)=([A-Z-]+)\s+([A-Z]+)\s+(\d+)$/);
    if (!match) return { label: raw, status: null, term: null };
    const [, statusCode, degreeType, major, term] = match;
    return {
        label: `${degreeType} – ${major}`,
        status: DEGREE_STATUS_LABELS[statusCode] ?? statusCode,
        term,
    };
};

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
    const { authenticatedEthosFetch } = useData();
    const { cardConfiguration: {
        catalogYear, majorCodes, majorDisp, whatIfPipeline, whatIfUrl, username, password, gpaPipeline
    }, cardId } = useCardInfo();

    const { studentId } = useParams();

    const [auditData, setAuditData] = useState(null);
    const [cachedAt, setCachedAt] = useState(null);
    const [transcriptData, setTranscriptData] = useState(null);
    const [gpaData, setGPAData] = useState(null);

    const studentName = studentId ? window.localStorage.getItem(`${STUDENT_NAME_PREFIX}${studentId}`) : null;
    setPageTitle(`Major Audit for ${studentName ? `${studentName} - ${studentId}` : (studentId ?? '')}`);

    const runAudit = useCallback(async (force = false) => {
        if (!studentId) return;

        if (!force) {
            const cachedAudit = loadCache(CACHE_PREFIX, studentId);
            const cachedTranscript = loadCache(CACHE_PREFIX_TRANSCRIPT, studentId);
            const cachedGPA = loadCache(CACHE_PREFIX_GPA, studentId);
            if (cachedAudit && cachedTranscript) {
                setAuditData(cachedAudit.results);
                setTranscriptData(cachedTranscript.results);
                setGPAData(cachedGPA.results);
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

            const gpaResponse = await authenticatedEthosFetch(`${gpaPipeline}?cardId=${cardId}&studentId=${studentId}`);
            if (!gpaResponse.ok) throw new Error(`Transcript error: ${gpaResponse.statusText}`);
            const gpaResult = await gpaResponse.json();
            const gpaRecords = Array.isArray(gpaResult) ? gpaResult : (gpaResult?.gpa ?? []);
            saveCache(CACHE_PREFIX_GPA, studentId, gpaRecords);
            setGPAData(gpaRecords);

        } catch (error) {
            console.error('Audit failed:', error);
            setErrorMessage('Failed to fetch degree audit data. Please check your configuration and try again.');
        } finally {
            setLoadingStatus(false);
        }
    }, [studentId, setLoadingStatus, setErrorMessage, cardId, catalogYear, majorCodes, majorDisp, whatIfPipeline, whatIfUrl, authenticatedEthosFetch, gpaPipeline]);

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
            {gpaData && gpaData.length > 0 && (
                <div className={classes.gpaSection}>
                    <Typography variant="h3">GPA Summary</Typography>
                    <div className={classes.gpaHeroGrid}>
                        {gpaData.map((row, i) => (
                            <div key={i} className={classes.gpaHero}>
                                <div className={classes.gpaStatRow}>
                                    <div className={`${classes.gpaStat} ${classes.gpaStatFirst}`}>
                                        <span className={classes.gpaStatLabel}>GPA (1–99)</span>
                                        <span className={classes.gpaStatValue}>{row.gpa_1to99}</span>
                                        <span className={classes.gpaStatSub}>{row.units_1to99} units</span>
                                    </div>
                                    <div className={classes.gpaStatDivider} />
                                    <div className={classes.gpaStat}>
                                        <span className={classes.gpaStatLabel}>GPA (1–399)</span>
                                        <span className={classes.gpaStatValue}>{row.gpa_1to399}</span>
                                        <span className={classes.gpaStatSub}>{row.units_1to399} units</span>
                                    </div>
                                </div>
                                {(row.prior_colleges || row.ge_posting) && (
                                    <div className={classes.gpaMetaGrid}>
                                        {row.prior_colleges && (
                                            <div className={classes.gpaMetaBlock}>
                                                <span className={classes.gpaStatLabel}>Prior Colleges</span>
                                                <div className={classes.chipRow}>
                                                    {[...new Set(row.prior_colleges.split(',').map(c => c.trim()).filter(Boolean))]
                                                        .map((college, ci) => (
                                                            <span key={ci} className={classes.chip}>{college}</span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                        {row.ge_posting && (
                                            <div className={classes.gpaMetaBlock}>
                                                <span className={classes.gpaStatLabel}>GE Certifications</span>
                                                <div className={classes.chipRow}>
                                                    {[...new Set(row.ge_posting.split(',').map(g => g.trim()).filter(Boolean))]
                                                        .map((ge, gi) => (
                                                            <span key={gi} className={`${classes.chip} ${classes.chipGE}`}>{ge}</span>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {gpaData.some(r => r.degrees_earned_or_pending) && (
                        <>
                            <Typography variant="h4" style={{ marginTop: spacing16, marginBottom: spacing8 }}>Degrees Earned</Typography>
                            <div className={classes.degreesGrid}>
                                {gpaData.flatMap(r => r.degrees_earned_or_pending.split(',').map(d => parseDegreeEntry(d)))
                                    .map((item, i) => (
                                        <div key={i} className={classes.degreeItem}>
                                            <div className={classes.degreeTopRow}>
                                                <span className={classes.degreeName}>{item.label}</span>
                                                {item.status && <span className={classes.degreeStatus}>{item.status}</span>}
                                            </div>
                                            {item.term && <span className={classes.degreeTerm}>Term {item.term}</span>}
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {sortedResults && (
                <>
                    <div className={classes.header}>
                        <Typography variant="h3">Major Audit</Typography>
                    </div>
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
                </>
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
