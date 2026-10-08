import { spacing10, spacing20, spacing30, spacing40, spacing50, spacing60, borderRadiusMedium, borderRadiusSmall, colorCtaBlueBase, colorCtaBlueTint, colorCtaGreenBase, colorCtaGreenTint, colorFillAlertError, colorFillAlertWarning, colorTextNeutral200, colorTextNeutral250, colorTextNeutral500 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, Typography, Button, TextField, Checkbox, FormControlLabel } from '@ellucian/react-design-system/core';
import { usePageControl, useData } from '@ellucian/experience-extension-utils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Icon } from '@ellucian/ds-icons/lib';

const SETTINGS_KEY = 'degreeAuditSettings';
const STUDENT_NAME_PREFIX = 'degreeAuditStudentName_';
const STUDENT_EMAIL_PREFIX = 'degreeAuditStudentEmail_';
const CACHE_PREFIX = 'degreeAuditResults_';
const CACHE_PREFIX_TRANSCRIPT = 'transcriptResults_';
const CACHE_PREFIX_GPA = 'gpaResults_';
const CACHE_PREFIX_CUR_CLASSES = 'curClassesResults_';
// Where this page is mounted, shared with the card so it can open the page in a new tab.
const PAGE_BASE_KEY = 'degreeAuditPageBasePath';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const useStyles = makeStyles()({
    page: {
        margin: `0 ${spacing40} ${spacing60}`,
        display: 'flex',
        flexDirection: 'column',
        gap: spacing50,
        maxWidth: '1400px',
    },

    /* ---------- shared building blocks ---------- */
    surface: {
        backgroundColor: '#fff',
        border: '1px solid #e6e7e9',
        borderRadius: borderRadiusMedium,
        boxShadow: '0 1px 2px rgba(21, 22, 24, 0.06)',
    },
    section: {
        padding: spacing50,
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: spacing30,
        marginBottom: spacing40,
    },
    /* ---------- code legends (top right of a section) ---------- */
    legend: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: spacing20,
        maxWidth: '480px',
        fontSize: '0.75rem',
        color: colorTextNeutral500,
    },
    legendItem: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: borderRadiusSmall,
        backgroundColor: colorTextNeutral200,
        whiteSpace: 'nowrap',
    },
    legendCode: {
        fontWeight: 700,
        color: '#33363b',
    },

    sectionSubtitle: {
        fontSize: '0.8125rem',
        color: colorTextNeutral500,
    },
    label: {
        fontSize: '0.6875rem',
        color: colorTextNeutral500,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight: 700,
    },
    chip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing20,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#33363b',
        backgroundColor: colorTextNeutral200,
        border: '1px solid #e1e2e4',
        borderRadius: '999px',
        padding: '3px 12px',
    },
    chipPositive: {
        color: colorCtaGreenBase,
        backgroundColor: colorCtaGreenTint,
        borderColor: '#c9e6da',
    },
    chipAlert: {
        color: '#a11f1f',
        backgroundColor: '#fdf1f1',
        borderColor: '#f3d3d3',
    },
    chipCaution: {
        color: '#7a4d00',
        backgroundColor: colorFillAlertWarning,
        borderColor: '#efd9a8',
    },
    chipRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing20,
    },
    emptyState: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing30,
        padding: spacing40,
        border: '1px dashed #d8d9db',
        borderRadius: borderRadiusMedium,
        backgroundColor: colorTextNeutral200,
        color: colorTextNeutral500,
        fontSize: '0.8125rem',
    },

    /* ---------- student lookup ---------- */
    lookup: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        gap: spacing40,
        padding: spacing40,
    },
    lookupField: {
        flex: '1 1 280px',
        maxWidth: '340px',
    },
    lookupActions: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing30,
    },
    lookupHint: {
        margin: 0,
        flexBasis: '100%',
        fontSize: '0.75rem',
        color: colorTextNeutral500,
    },
    lookupHintError: {
        color: '#a11f1f',
    },

    /* ---------- student identity ---------- */
    identity: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing50,
        padding: spacing50,
        borderTop: `3px solid ${colorCtaBlueBase}`,
    },
    identityAvatar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        width: '3.5rem',
        height: '3.5rem',
        borderRadius: '50%',
        backgroundColor: colorCtaBlueTint,
        color: colorCtaBlueBase,
        fontSize: '1.125rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
    },
    identityMain: {
        flex: '1 1 260px',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing20,
    },
    identityMeta: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing30,
    },
    identityAside: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: spacing30,
        marginLeft: 'auto',
    },
    link: {
        color: colorCtaBlueBase,
        fontSize: '0.8125rem',
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
    },
    meta: {
        fontSize: '0.75rem',
        color: colorTextNeutral500,
    },

    /* ---------- status flags ---------- */
    flagRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing30,
    },
    flag: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing20,
        padding: '6px 14px',
        borderRadius: '999px',
        border: '1px solid #e1e2e4',
        backgroundColor: colorTextNeutral200,
        color: '#4a4d52',
        fontSize: '0.8125rem',
        fontWeight: 600,
    },
    flagMet: {
        backgroundColor: colorCtaGreenTint,
        borderColor: '#c9e6da',
        color: colorCtaGreenBase,
    },
    // Red = requirement not met yet. Neutral pill with a plain circle = not applicable for this student.
    flagMissing: {
        backgroundColor: '#fdf1f1',
        borderColor: '#f3d3d3',
        color: '#a11f1f',
    },
    flagIcon: {
        fontSize: '0.875rem',
    },

    /* ---------- at a glance ---------- */
    factGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: spacing40,
    },
    fact: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing20,
        padding: spacing40,
        backgroundColor: colorTextNeutral200,
        border: '1px solid #ececee',
        borderRadius: borderRadiusSmall,
    },
    factValue: {
        fontSize: '1rem',
        fontWeight: 600,
        color: '#151618',
        lineHeight: 1.35,
    },

    /* ---------- gpa ---------- */
    gpaGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: spacing40,
    },
    gpaCard: {
        padding: spacing50,
    },
    gpaStatRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
        gap: spacing40,
    },
    gpaStat: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing10,
    },
    gpaStatValue: {
        fontSize: '1.75rem',
        fontWeight: 700,
        color: colorCtaBlueBase,
        lineHeight: 1.1,
    },
    gpaStatValueMuted: {
        color: '#151618',
    },
    gpaStatSub: {
        fontSize: '0.75rem',
        color: colorTextNeutral500,
    },

    /* ---------- standing ---------- */
    // Blue marks "this is the most recent one"; the left stripe and pills carry the good/caution/alert colour.
    standingBanner: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: spacing50,
        padding: `${spacing30}px ${spacing40}px`,
        border: '1px solid #cfe0f5',
        borderLeft: `4px solid ${colorCtaGreenBase}`,
        borderRadius: borderRadiusMedium,
        backgroundColor: colorCtaBlueTint,
    },
    standingHeadline: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing10,
    },
    standingHeadlineTerm: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing20,
    },
    standingHeadlineValue: {
        fontSize: '1.375rem',
        fontWeight: 700,
        lineHeight: 1.2,
        color: colorCtaBlueBase,
    },
    chipLatest: {
        color: colorCtaBlueBase,
        backgroundColor: '#fff',
        borderColor: '#bcd4ef',
        fontSize: '0.6875rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
    },
    standingFlags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing40,
        marginLeft: 'auto',
    },
    standingFlag: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing10,
    },

    /* ---------- audit controls ---------- */
    auditActions: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: spacing30,
    },
    auditPending: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing20,
        paddingTop: spacing30,
        color: colorTextNeutral500,
    },
    auditNote: {
        margin: `${spacing20}px 0 0`,
        padding: `${spacing20}px ${spacing30}px`,
        backgroundColor: colorFillAlertWarning,
        borderRadius: borderRadiusSmall,
        color: '#7a4d00',
        fontSize: '0.8125rem',
    },
    auditHint: {
        fontSize: '0.75rem',
        color: colorTextNeutral500,
    },

    /* ---------- degrees ---------- */
    degreeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: spacing30,
    },
    degreeItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing20,
        padding: spacing40,
        backgroundColor: colorCtaGreenTint,
        border: '1px solid #dcece5',
        borderRadius: borderRadiusSmall,
    },
    degreeTopRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: spacing30,
    },
    degreeName: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#151618',
    },
    degreeStatus: {
        fontSize: '0.625rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '2px 8px',
        borderRadius: '999px',
        color: colorCtaGreenBase,
        backgroundColor: '#fff',
    },
    degreeTerm: {
        fontSize: '0.75rem',
        color: colorTextNeutral500,
    },

    /* ---------- major audit ---------- */
    results: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing40,
    },
    resultRow: {
        display: 'grid',
        gridTemplateColumns: 'minmax(140px, 220px) 1fr auto',
        alignItems: 'center',
        gap: spacing40,
    },
    resultLabel: {
        display: 'flex',
        flexDirection: 'column',
        gap: spacing10,
        fontSize: '0.875rem',
        fontWeight: 600,
        color: '#151618',
    },
    resultSub: {
        fontSize: '0.6875rem',
        fontWeight: 400,
        color: colorTextNeutral500,
    },
    progressTrack: {
        height: '8px',
        backgroundColor: colorTextNeutral250,
        borderRadius: '999px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: '999px',
        transition: 'width 0.4s ease',
    },
    resultPct: {
        minWidth: '44px',
        textAlign: 'right',
        fontSize: '0.875rem',
        fontWeight: 700,
        color: '#151618',
    },

    /* ---------- tables ---------- */
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    headerCell: {
        textAlign: 'left',
        fontSize: '0.6875rem',
        color: colorTextNeutral500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid #e1e2e4',
        padding: `${spacing20} ${spacing30}`,
    },
    cell: {
        fontSize: '0.8125rem',
        padding: `${spacing20} ${spacing30}`,
        borderBottom: `1px solid ${colorTextNeutral250}`,
        verticalAlign: 'top',
    },
    cellSub: {
        display: 'block',
        fontSize: '0.6875rem',
        color: colorTextNeutral500,
    },
    cellStrong: {
        fontWeight: 600,
    },
    cellNumeric: {
        fontVariantNumeric: 'tabular-nums',
    },
    gradeBadge: {
        display: 'inline-block',
        minWidth: '2.25rem',
        textAlign: 'center',
        padding: '1px 6px',
        borderRadius: borderRadiusSmall,
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: colorTextNeutral200,
        color: '#33363b',
    },
    gradePass: {
        backgroundColor: colorCtaGreenTint,
        color: colorCtaGreenBase,
    },
    gradeFail: {
        backgroundColor: '#fdf1f1',
        color: colorFillAlertError,
    },
    transcriptGrid: {
        // Wide enough for Course/Grade/Units/Code to sit side by side without wrapping.
        columnWidth: '380px',
        columnGap: spacing50,
    },
    termGroup: {
        breakInside: 'avoid',
        marginBottom: spacing50,
    },
    termHeader: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: spacing30,
        marginBottom: spacing20,
        paddingBottom: spacing20,
        borderBottom: `2px solid ${colorTextNeutral250}`,
    },
    termUnits: {
        fontSize: '0.6875rem',
        color: colorTextNeutral500,
        whiteSpace: 'nowrap',
    },
});

const DEGREE_STATUS_LABELS = {
    GR: 'Graduated',
    CA: 'Certificate of Achievement',
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

const splitList = (value) => (value ? String(value).split(',').map(v => v.trim()).filter(Boolean) : []);
const unique = (values) => [...new Set(values)];

const TERM_SESSIONS = { 10: 'Spring', 40: 'Summer', 70: 'Fall' };

// "202670" -> "Fall 2026"; unknown session codes fall back to the raw code.
const formatTerm = (code) => {
    const raw = String(code ?? '').trim();
    const match = raw.match(/^(\d{4})(\d{2})$/);
    if (!match) return raw;
    const [, year, session] = match;
    return TERM_SESSIONS[session] ? `${TERM_SESSIONS[session]} ${year}` : `Term ${raw}`;
};

const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(String(value).replace(' ', 'T'));
    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// Standing arrives as one packed string per term, e.g.
// "Term: 202570 | Academic Standing: Good Standing | Progress Standing: Good Progress | Combine Standing: Good Standing"
const parseStanding = (raw) => {
    if (!raw) return null;
    const standing = { term: '', academic: '', progress: '', combined: '' };
    for (const part of String(raw).split('|')) {
        const separator = part.indexOf(':');
        if (separator === -1) continue;
        const key = part.slice(0, separator).trim().toLowerCase().replace(/\s+/g, ' ');
        const value = part.slice(separator + 1).trim();
        if (!value) continue;
        if (key === 'term') standing.term = value;
        else if (key.includes('academic')) standing.academic = value;
        else if (key.includes('progress')) standing.progress = value;
        else if (key.includes('combine') || key.includes('overall')) standing.combined = value;
    }
    // Anything that isn't in "Label: value" form still gets shown rather than dropped.
    if (!standing.term && !standing.academic && !standing.progress && !standing.combined) {
        standing.combined = String(raw).trim();
    }
    if (!standing.combined) standing.combined = standing.academic;
    return standing;
};

// Order matters: "Not in Good Standing" has to match alert before it matches good.
const STANDING_TONES = [
    [/not in good|dismiss|suspend|terminat|unsatisfact|prohibit|denied/, 'alert'],
    [/warning|probation|alert|assist|notice|ineligib|insufficient|risk|deficien|hold/, 'caution'],
    [/good|satisfact|progress|clear|complete/, 'positive'],
];

const standingTone = (value) => {
    const text = (value ?? '').toLowerCase();
    if (!text) return '';
    const match = STANDING_TONES.find(([pattern]) => pattern.test(text));
    return match ? match[1] : '';
};

const STANDING_ACCENT = { positive: colorCtaGreenBase, caution: '#d9822b', alert: '#c32b2b' };

// Shared tone -> pill styling.
const toneClass = (classes, tone) => {
    if (tone === 'positive') return classes.chipPositive;
    if (tone === 'caution') return classes.chipCaution;
    if (tone === 'alert') return classes.chipAlert;
    return '';
};

const standingPillClass = (classes, value) => toneClass(classes, standingTone(value));

// Schedule rows are listed in this order, and the same table drives the pill colour.
// Real Banner statuses carry codes after the label ("Wait Listed-0.500000", "Drop 08 2026",
// "Withdrawal 08 2026"), so match on the leading words only — that also keeps "Not Enrolled"
// out of the Enrolled group.
const CLASS_STATUSES = [
    { prefix: 'enrolled', tone: 'positive' },
    { prefix: 'reinstated', tone: 'positive' },
    { prefix: 'wait list', tone: 'caution' },
    { prefix: 'waitlisted', tone: 'caution' },
    { prefix: 'drop', tone: 'alert' },
    { prefix: 'withdraw', tone: 'alert' },
    { prefix: 'deleted', tone: 'alert' },
    { prefix: 'nonattendance', tone: 'alert' },
    { prefix: 'non attendance', tone: 'alert' },
];

const matchClassStatus = (status) => {
    const text = (status ?? '').toLowerCase().trim();
    return CLASS_STATUSES.findIndex(({ prefix }) => text.includes(prefix));
};

const statusRank = (status) => {
    const index = matchClassStatus(status);
    return index === -1 ? CLASS_STATUSES.length : index;
};

const statusTone = (status) => {
    const index = matchClassStatus(status);
    return index === -1 ? '' : CLASS_STATUSES[index].tone;
};

const gradeTone = (grade) => {
    const g = (grade ?? '').trim().toUpperCase();
    if (!g) return 'neutral';
    // D technically earns credit, but it's a weak grade and a repeatability/redemption flag for
    // counselors, so it gets flagged with the failing marks instead of blending into the A-C pass band.
    if (/^(F|D|U|W|NP|X|FA|NW)/.test(g)) return 'fail';
    if (/^(A|B|C|P|S)/.test(g)) return 'pass';
    return 'neutral';
};

const initialsOf = (name, id) => {
    if (!name) return id ? id.slice(-2) : '—';
    return name.split(/[\s,]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
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

const Section = ({ classes, title, subtitle, action, children }) => (
    <section className={`${classes.surface} ${classes.section}`}>
        <div className={classes.sectionHeader}>
            <div>
                <Typography variant="h3">{title}</Typography>
                {subtitle && <span className={classes.sectionSubtitle}>{subtitle}</span>}
            </div>
            {action}
        </div>
        {children}
    </section>
);

// Explains SIS codes in the corner of the section they belong to, instead of a page-wide glossary.
const Legend = ({ classes, items }) => (
    <div className={classes.legend}>
        {items.map(([code, meaning]) => (
            <span key={code} className={classes.legendItem}>
                <span className={classes.legendCode}>{code}</span>
                <span>= {meaning}</span>
            </span>
        ))}
    </div>
);

const Pill = ({ classes, className, children, icon }) => (
    <span className={`${classes.chip} ${className ?? ''}`}>
        {icon && <Icon name={icon} className={classes.flagIcon} />}
        {children}
    </span>
);

const HomePage = (props = {}) => {
    const { classes } = useStyles();
    const { setPageTitle, setLoadingStatus, setErrorMessage } = usePageControl();
    const { authenticatedEthosFetch } = useData();

    // NOTE: the page deliberately does NOT call useCardInfo(). That hook is scoped to a card, and
    // asking the host for card context from a page has been seen to throw inside Path itself
    // (TypeError … reading 'split'). The Degree Audit card writes everything this page needs to
    // localStorage before it navigates here, so we read it from there instead.
    const { studentId } = useParams();
    const history = useHistory();

    const [auditData, setAuditData] = useState(null);
    const [cachedAt, setCachedAt] = useState(null);
    const [transcriptData, setTranscriptData] = useState(null);
    const [gpaData, setGPAData] = useState(null);
    const [curClasses, setCurClassesData] = useState(null);
    const [studentName, setStudentName] = useState(null);
    const [studentEmail, setStudentEmail] = useState(null);
    const [activeStudentId, setActiveStudentId] = useState(studentId ?? '');
    const [newStudentId, setNewStudentId] = useState(studentId ?? '');
    const [updatingStudent, setUpdatingStudent] = useState(false);

    // The audit is opt-in: it's the slow SIS-backed call, so it never runs just because a student loaded.
    const [auditLoading, setAuditLoading] = useState(false);
    const [auditAt, setAuditAt] = useState(null);
    const [auditError, setAuditError] = useState('');
    // Which in-progress setting produced the audit results currently on screen.
    const [auditVariant, setAuditVariant] = useState(null);
    const [includeInProgress, setIncludeInProgress] = useState(() => {
        try {
            return JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || '{}').includeInProgress ?? false;
        } catch {
            return false;
        }
    });

    useEffect(() => {
        setPageTitle(`Counselor's Audit`);
    }, [setPageTitle]);

    // The host only exposes pageInfo to pages, so the page publishes its own URL prefix; the card
    // reads it to build a full link and open the student in a new tab.
    useEffect(() => {
        const auditIndex = window.location.pathname.indexOf('/degree-audit/');
        const basePath = props.pageInfo?.basePath
            || (auditIndex > 0 ? window.location.pathname.slice(0, auditIndex) : '');
        if (!basePath) return;
        try {
            window.localStorage.setItem(PAGE_BASE_KEY, basePath);
        } catch {
            // Storage unavailable — the card just keeps navigating in the same tab.
        }
    }, [props.pageInfo?.basePath]);

    useEffect(() => {
        setActiveStudentId(studentId ?? '');
        setStudentName(studentId ? window.localStorage.getItem(`${STUDENT_NAME_PREFIX}${studentId}`) : null);
        setStudentEmail(studentId ? window.localStorage.getItem(`${STUDENT_EMAIL_PREFIX}${studentId}`) : null);
        // Never leave one student's audit on screen while another student loads.
        setAuditData(null);
        setAuditAt(null);
        setAuditVariant(null);
        setAuditError('');
    }, [studentId]);

    // Everything comes from the settings block the card saved when the audit was launched, so the
    // page keeps working on refresh, deep links, and student changes.
    const resolveConfig = useCallback(() => {
        let settings = {};
        try {
            settings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || '{}');
        } catch {
            settings = {};
        }
        return {
            cardId: settings.cardId || '',
            catalogYear: settings.catalogYear || '',
            majorCodes: settings.majorCodes || '',
            majorDisp: settings.majorDisp || '',
            whatIfUrl: settings.whatIfUrl || '',
            whatIfPipeline: settings.whatIfPipeline || '',
            gpaPipeline: settings.gpaPipeline || '',
            studentPipeline: settings.studentPipeline || '',
            currentClassesPipeline: settings.currentClassesPipeline || '',
            includeInProgress: settings.includeInProgress ?? false,
            token: settings.token || ''
        };
    }, []);

    // Records load on their own for every student: transcript, GPA/standing, current schedule.
    const loadStudentRecords = useCallback(async (force = false) => {
        if (!activeStudentId) return;

        if (!force) {
            const cachedTranscript = loadCache(CACHE_PREFIX_TRANSCRIPT, activeStudentId);
            const cachedGPA = loadCache(CACHE_PREFIX_GPA, activeStudentId);
            const cachedCurClasses = loadCache(CACHE_PREFIX_CUR_CLASSES, activeStudentId);
            if (cachedTranscript) {
                setTranscriptData(cachedTranscript.results);
                setGPAData(cachedGPA ? cachedGPA.results : null);
                setCurClassesData(cachedCurClasses ? cachedCurClasses.results : null);
                setCachedAt(new Date(cachedTranscript.timestamp));
                setLoadingStatus(false);
                return;
            }
        }

        setLoadingStatus(true);
        setTranscriptData(null);
        setGPAData(null);
        setCurClassesData(null);
        setCachedAt(null);

        const config = resolveConfig();
        const cardParam = config.cardId ? `cardId=${config.cardId}&` : '';

        if (!config.whatIfPipeline && !config.gpaPipeline && !config.currentClassesPipeline) {
            setLoadingStatus(false);
            setErrorMessage('No pipeline configuration found for this page. Open the Degree Audit card, fill in the pipeline URLs, then load a student.');
            return;
        }

        const fetchRecords = async (pipeline, cachePrefix, rootKey, label) => {
            if (!pipeline) return null;
            const response = await authenticatedEthosFetch(`${pipeline}?${cardParam}studentId=${activeStudentId}`);
            if (!response.ok) throw new Error(`${label} error: ${response.statusText}`);
            const result = await response.json();
            const raw = Array.isArray(result) ? result : (result?.[rootKey] ?? result);
            // A single-record pipeline response isn't an array — normalise, and treat "no row" as empty.
            const records = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? [raw] : []);
            saveCache(cachePrefix, activeStudentId, records);
            return records;
        };

        // Each source is fetched independently so one bad pipeline doesn't blank out the whole page.
        const failures = [];

        try {
            const transcriptRecords = await fetchRecords(config.whatIfPipeline, CACHE_PREFIX_TRANSCRIPT, 'transcript', 'Transcript');
            if (transcriptRecords) setTranscriptData(transcriptRecords);
            else failures.push('transcript (pipeline not configured)');
        } catch (error) {
            console.error('Transcript fetch failed:', error);
            failures.push(`transcript (${error.message})`);
        }

        try {
            const gpaRecords = await fetchRecords(config.gpaPipeline, CACHE_PREFIX_GPA, 'gpa', 'GPA');
            if (gpaRecords) setGPAData(gpaRecords);
            else failures.push('GPA summary (pipeline not configured)');
        } catch (error) {
            console.error('GPA fetch failed:', error);
            failures.push(`GPA summary (${error.message})`);
        }

        try {
            const curClassesRecords = await fetchRecords(config.currentClassesPipeline, CACHE_PREFIX_CUR_CLASSES, 'curClasses', 'Current Classes');
            if (curClassesRecords) setCurClassesData(curClassesRecords);
        } catch (error) {
            console.error('Current classes fetch failed:', error);
            failures.push(`current classes (${error.message})`);
        }

        if (failures.length > 0) {
            setErrorMessage(`Some student data could not be loaded: ${failures.join(', ')}.`);
        }
        setCachedAt(new Date());
        setLoadingStatus(false);
    }, [activeStudentId, setLoadingStatus, setErrorMessage, authenticatedEthosFetch, resolveConfig]);

    // In-progress and final audits answer different questions, so they can't share one cache slot.
    const buildAuditCacheId = (studentIdArg, inProgress) => `${studentIdArg}:${inProgress ? 'inprog' : 'final'}`;

    // Show a previously cached audit if we have one for the current in-progress setting; never fetch one.
    const hydrateCachedAudit = useCallback(() => {
        if (!activeStudentId) return;
        try {
            // Earlier builds cached one audit per student with no in-progress variant — it can't be
            // trusted for either setting, so clear it instead of showing the wrong numbers.
            window.localStorage.removeItem(`${CACHE_PREFIX}${activeStudentId}`);
        } catch {
            // Ignore storage errors; the page just keeps whatever is in memory.
        }
        const cached = loadCache(CACHE_PREFIX, buildAuditCacheId(activeStudentId, includeInProgress));
        if (!cached) return;
        setAuditData(cached.results);
        setAuditAt(new Date(cached.timestamp));
        setAuditVariant(includeInProgress);
        setAuditError('');
    }, [activeStudentId, includeInProgress]);

    // Runs the What-If audit on demand — one POST per configured major.
    const runMajorAudit = useCallback(async () => {
        if (!activeStudentId || auditLoading) return;

        const config = resolveConfig();
        const majorOptions = (config.majorCodes || '')
            .split(',')
            .filter(code => code.trim())
            .map((code, i) => ({
                value: code.trim(),
                label: (config.majorDisp || '').split(',')[i]?.trim() || code.trim()
            }));

        if (!config.whatIfUrl || !config.token || !config.catalogYear || majorOptions.length === 0) {
            setAuditError('Major audits need a What-If URL, an access token, a catalog year and at least one major — set those on the Degree Audit card first.');
            return;
        }

        setAuditLoading(true);
        setAuditError('');
        try {
            const results = [];
            for (const opt of majorOptions) {
                const [degree, major] = opt.value.split(' ');
                const res = await fetch(config.whatIfUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': config.token
                    },
                    body: JSON.stringify({
                        studentId: activeStudentId,
                        school: 'CR',
                        degree,
                        catalogYear: config.catalogYear,
                        keepCurriculum: false,
                        includeInprogress: includeInProgress,
                        includePreregistered: false,
                        includeInternalNotes: false,
                        refreshStudentData: false,
                        goals: [{ code: 'MAJOR', value: major, catalogYear: config.catalogYear }],
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

            saveCache(CACHE_PREFIX, buildAuditCacheId(activeStudentId, includeInProgress), results);
            setAuditData(results);
            setAuditAt(new Date());
            setAuditVariant(includeInProgress);
        } catch (error) {
            console.error('Major audit failed:', error);
            setAuditError(`Major audit failed: ${error.message}`);
        } finally {
            setAuditLoading(false);
        }
    }, [activeStudentId, auditLoading, includeInProgress, resolveConfig]);

    const handleToggleInProgress = useCallback((checked) => {
        setIncludeInProgress(checked);
        // Keep the card's toggle and the page in sync so a counselor only ever has one place to remember.
        try {
            const settings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || '{}');
            window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, includeInProgress: checked }));
        } catch {
            // Ignore storage failures; the in-memory value still applies to this session.
        }
    }, []);

    useEffect(() => {
        loadStudentRecords();
    }, [loadStudentRecords]);

    useEffect(() => {
        hydrateCachedAudit();
    }, [hydrateCachedAudit]);

    const handleUpdateStudent = async () => {
        const id = newStudentId.trim();
        const { studentPipeline: pipeline } = resolveConfig();
        if (updatingStudent || !pipeline || !/^\d{8}$/.test(id)) return;

        setUpdatingStudent(true);
        try {
            const personResponse = await authenticatedEthosFetch(`${pipeline}?cardId=${resolveConfig().cardId}&personId=${id}`);
            if (!personResponse.ok) throw new Error(`Person error: ${personResponse.statusText}`);
            const personResult = await personResponse.json();

            const fullName = `${personResult?.data?.persons12?.edges?.[0]?.node?.names?.[0]?.lastName}, ${personResult?.data?.persons12?.edges?.[0]?.node?.names?.[0]?.firstName}`;
            if (fullName) {
                window.localStorage.setItem(`${STUDENT_NAME_PREFIX}${id}`, fullName);
                setStudentName(fullName);
            }

            const email = personResult?.data?.persons12?.edges?.[0]?.node?.emails?.find(e => e.type.emailType === 'school')?.address;

            if (email) {
                window.localStorage.setItem(`${STUDENT_EMAIL_PREFIX}${id}`, email);
                setStudentEmail(email);
            }

            if (id !== activeStudentId) {
                setActiveStudentId(id);
                history.replace(`/degree-audit/${id}`);
            }
        } catch (error) {
            console.error('Student lookup failed:', error);
            setErrorMessage('Failed to fetch student info. Please check your configuration and try again.');
        } finally {
            setUpdatingStudent(false);
        }
    };

    const auditRows = useMemo(() => (auditData ?? [])
        .map(item => ({ label: Object.keys(item)[0], pct: parseFloat(Object.values(item)[0]) || 0 }))
        .sort((a, b) => b.pct - a.pct), [auditData]);

    const gpaRow = gpaData?.[0];

    const flags = useMemo(() => {
        const rows = gpaData ?? [];
        const hasASEP = rows.some(r => r.types_ed_plan === 'Abbreviated');
        const hasCSEP = rows.some(r => r.types_ed_plan === 'Comprehensive');
        return [
            { label: 'Orientation', met: rows.some(r => r.orientation) },
            { label: 'Placement Testing', met: rows.some(r => r.testing) },
            // A CSEP takes the place of an ASEP, so a missing ASEP isn't a gap once CSEP is on file.
            { label: 'ASEP', met: hasASEP, na: hasCSEP && !hasASEP },
            { label: 'CSEP', met: hasCSEP },
        ];
    }, [gpaData]);

    const holds = useMemo(() => unique(splitList(gpaRow?.holds)), [gpaRow]);
    const geCertifications = useMemo(() => unique(splitList(gpaRow?.ge_posting)), [gpaRow]);
    const priorColleges = useMemo(() => unique(splitList(gpaRow?.prior_colleges)), [gpaRow]);

    // Standing is packed into one string per term on the GPA record; keep the pipeline's own order.
    const standings = useMemo(() => {
        const rows = [];
        const seen = new Set();
        for (const record of gpaData ?? []) {
            const parsed = parseStanding(record?.student_standing);
            if (!parsed) continue;
            const key = [parsed.term, parsed.academic, parsed.progress, parsed.combined].join('|');
            if (seen.has(key)) continue;
            seen.add(key);
            rows.push(parsed);
        }
        return rows;
    }, [gpaData]);

    const degrees = useMemo(() => (gpaData ?? [])
        .flatMap(row => splitList(row.degrees_earned_or_pending).map(parseDegreeEntry)), [gpaData]);

    // Group by term WITHOUT re-ordering: the pipeline already returns terms in the order we want.
    // A plain object can't be used here because numeric term codes ("202610") are integer-like keys,
    // which JS always iterates in ascending numeric order. A Map keeps first-seen order.
    const transcriptByTerm = useMemo(() => {
        if (!transcriptData) return null;
        const groups = new Map();
        for (const record of transcriptData) {
            const term = record.term ?? 'Unknown Term';
            if (!groups.has(term)) groups.set(term, []);
            groups.get(term).push(record);
        }
        return Array.from(groups, ([term, courses]) => ({ term, courses }));
    }, [transcriptData]);

    // Drop empty rows so the section disappears entirely when the student isn't enrolled in anything.
    const currentClassRows = useMemo(() => (curClasses ?? [])
        .map(record => {
            const crn = record.sfrstcr_crn ?? '';
            const course = record.course ?? '';
            return {
                course: course || (crn ? `CRN ${crn}` : ''),
                crn,
                status: record.status ?? '',
                term: record.sfrstcr_term_code ?? '',
                session: record.class_duration ?? '',
                refundDate: formatDate(record.refund_date),
                dropDate: formatDate(record.drop_date),
                addedDate: formatDate(record.add_date)
            };
        })
        .filter(row => row.course || row.crn || row.term || row.status || row.session)
        // Enrolled first, then reinstated / wait listed / dropped / withdrawn, newest term first inside each group.
        .sort((a, b) => statusRank(a.status) - statusRank(b.status)
            || String(b.term).localeCompare(String(a.term))
            || a.course.localeCompare(b.course)), [curClasses]);

    const newStudentIdValid = /^\d{8}$/.test(newStudentId.trim());
    const { studentPipeline: lookupPipeline } = resolveConfig();

    // Whether this environment can run a What-If audit at all — drives the Run audit button state.
    const auditSettings = resolveConfig();
    const auditReady = Boolean(auditSettings.whatIfUrl && auditSettings.token && auditSettings.catalogYear && auditSettings.majorCodes.trim());
    const majorsLabel = unique((auditSettings.majorDisp || auditSettings.majorCodes || '').split(',').map(item => item.trim()).filter(Boolean)).join(', ');
    // "An audit has been run for this student" — independent of whether it returned any rows.
    const auditRan = auditVariant !== null;

    return (
        <div className={classes.page}>

            {/* ---------- student lookup ---------- */}
            <div className={`${classes.surface} ${classes.lookup}`}>
                <TextField
                    label="Student ID"
                    placeholder="Enter student ID"
                    size="small"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateStudent();
                    }}
                    className={classes.lookupField}
                />
                <div className={classes.lookupActions}>
                    <Button
                        color="primary"
                        size="small"
                        variant="contained"
                        disabled={updatingStudent || !lookupPipeline || !newStudentIdValid}
                        onClick={handleUpdateStudent}
                    >
                        {updatingStudent ? 'Loading…' : 'Load Student'}
                    </Button>
                    {activeStudentId && (
                        <Button
                            color="primary"
                            size="small"
                            variant="text"
                            disabled={updatingStudent}
                            onClick={() => loadStudentRecords(true)}
                        >
                            Refresh records
                        </Button>
                    )}
                </div>
                <p className={`${classes.lookupHint} ${newStudentId && !newStudentIdValid ? classes.lookupHintError : ''}`}>
                    {!lookupPipeline
                        ? 'Student lookup is not configured — add the Student Pipeline URL to the Degree Audit card.'
                        : newStudentId && !newStudentIdValid
                            ? 'Student ID must be 8 digits.'
                            : 'Enter an 8-digit student ID to pull their standing, GPA, schedule and transcript.'}
                </p>
            </div>

            {/* ---------- student identity ---------- */}
            {activeStudentId && (
                <div className={`${classes.surface} ${classes.identity}`}>
                    <div className={classes.identityAvatar} aria-hidden="true">
                        {initialsOf(studentName, activeStudentId)}
                    </div>
                    <div className={classes.identityMain}>
                        <Typography variant="h2">{studentName ?? 'Student'}</Typography>
                        <div className={classes.identityMeta}>
                            <Pill classes={classes} icon="id">ID {activeStudentId}</Pill>
                            {studentEmail && (
                                <a className={classes.link} href={`mailto:${studentEmail}`}>{studentEmail}</a>
                            )}
                            {!studentName && (
                                <span className={classes.meta}>Name not cached — use Load Student to refresh.</span>
                            )}
                        </div>
                    </div>
                    <div className={classes.identityAside}>
                        {cachedAt && (
                            <span className={classes.meta}>Updated {cachedAt.toLocaleString()}</span>
                        )}
                        {gpaData?.length > 0 && (() => {
                            return (
                                <>
                                    <div className={classes.flagRow}>
                                        {flags.map(flag => {
                                            const isNa = !flag.met && Boolean(flag.na);
                                            return (
                                                <span
                                                    key={flag.label}
                                                    className={`${classes.flag} ${flag.met ? classes.flagMet : ''} ${!flag.met && !isNa ? classes.flagMissing : ''}`}
                                                >
                                                    <Icon
                                                        name={flag.met ? 'check-circle' : isNa ? 'circle' : 'times-circle-solid'}
                                                        className={classes.flagIcon}
                                                    />
                                                    {flag.label}
                                                </span>
                                            );
                                        })}
                                    </div >
                                </>
                            );
                        })()}
                    </div>
                </div>
            )
            }

            {/* ---------- at a glance ---------- */}
            {
                gpaRow && (
                    <Section
                        classes={classes}
                        title="At a Glance"
                        subtitle="Advisor notes and program status"
                    >
                        <div className={classes.factGrid}>
                            <div className={classes.fact}>
                                <span className={classes.label}>Declared Major</span>
                                <span className={classes.factValue}>{gpaRow.declared_major || 'Undeclared'}</span>
                            </div>
                            <div className={classes.fact}>
                                <span className={classes.label}>Declared General Education</span>
                                <span className={classes.factValue}>{gpaRow.ge || 'Not posted'}</span>
                            </div>
                            <div className={classes.fact}>
                                <span className={classes.label}>Holds</span>
                                {holds.length
                                    ? (
                                        <div className={classes.chipRow}>
                                            {holds.map(hold => <Pill key={hold} classes={classes} className={classes.chipAlert}>{hold}</Pill>)}
                                        </div>
                                    )
                                    : <span className={classes.factValue}>None</span>}
                            </div>
                            <div className={classes.fact}>
                                <span className={classes.label}>GE Certifications</span>
                                {geCertifications.length
                                    ? (
                                        <div className={classes.chipRow}>
                                            {geCertifications.map(ge => <Pill key={ge} classes={classes} className={classes.chipPositive}>{ge}</Pill>)}
                                        </div>
                                    )
                                    : <span className={classes.factValue}>None posted</span>}
                            </div>
                            <div className={classes.fact}>
                                <span className={classes.label}>Prior Colleges</span>
                                {priorColleges.length
                                    ? (
                                        <div className={classes.chipRow}>
                                            {priorColleges.map(college => <Pill key={college} classes={classes}>{college}</Pill>)}
                                        </div>
                                    )
                                    : <span className={classes.factValue}>None</span>}
                            </div>
                        </div>
                    </Section>
                )
            }

            {/* ---------- standing ---------- */}
            {
                standings.length > 0 && (() => {
                    // Pick the newest term by term code for the headline, but leave the table in pipeline order.
                    const latest = standings.reduce((acc, s) => (Number(s.term) > Number(acc.term) ? s : acc), standings[0]);
                    const history = standings.filter((_, i) => i !== standings.indexOf(latest));
                    // Show all three even when Combined repeats Academic — counselors read Combined as the
                    // official answer, so hiding it when it matches makes it look like data is missing.
                    const latestFlags = [
                        ['Academic', latest.academic],
                        ['Progress', latest.progress],
                        ['Combined', latest.combined]
                    ].filter(([, value]) => value);
                    return (
                        <Section
                            classes={classes}
                            title="Student Standing"
                            subtitle={latest.term ? `Most recent term ${formatTerm(latest.term)}` : 'Academic and progress standing'}
                        >
                            <div
                                className={classes.standingBanner}
                                style={{ borderLeftColor: STANDING_ACCENT[standingTone(latest.combined)] || colorTextNeutral250 }}
                            >
                                <div className={classes.standingHeadline}>
                                    <div className={classes.standingHeadlineTerm}>
                                        <span className={classes.label}>{latest.term ? formatTerm(latest.term) : 'Overall'}</span>
                                        <Pill classes={classes} className={classes.chipLatest}>Latest</Pill>
                                    </div>
                                    <span className={classes.standingHeadlineValue}>{latest.combined || latest.academic || '—'}</span>
                                </div>
                                <div className={classes.standingFlags}>
                                    {latestFlags.map(([label, value]) => (
                                        <div key={label} className={classes.standingFlag}>
                                            <span className={classes.label}>{label}</span>
                                            <Pill classes={classes} className={standingPillClass(classes, value)}>{value}</Pill>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {history.length > 0 && (
                                <table className={classes.table} style={{ marginTop: spacing40 }}>
                                    <thead>
                                        <tr>
                                            <th className={classes.headerCell} style={{ width: '25%' }}>Term</th>
                                            <th className={classes.headerCell}>Academic</th>
                                            <th className={classes.headerCell}>Progress</th>
                                            <th className={classes.headerCell}>Combined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((standing, i) => (
                                            <tr key={standing.term || i}>
                                                <td className={classes.cell}>
                                                    {formatTerm(standing.term) || '—'}
                                                    {standing.term && <span className={classes.cellSub}>{standing.term}</span>}
                                                </td>
                                                <td className={classes.cell}>
                                                    <Pill classes={classes} className={standingPillClass(classes, standing.academic)}>{standing.academic || '—'}</Pill>
                                                </td>
                                                <td className={classes.cell}>
                                                    <Pill classes={classes} className={standingPillClass(classes, standing.progress)}>{standing.progress || '—'}</Pill>
                                                </td>
                                                <td className={classes.cell}>
                                                    <Pill classes={classes} className={standingPillClass(classes, standing.combined)}>{standing.combined || '—'}</Pill>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </Section>
                    );
                })()
            }

            {/* ---------- gpa summary ---------- */}
            {
                gpaData && gpaData.length > 0 && (
                    <Section
                        classes={classes}
                        title="GPA Summary"
                        subtitle="Cumulative GPA by unit range"
                    >
                        <div className={classes.gpaGrid}>
                            {gpaData.map((row, i) => (
                                <div key={i} className={`${classes.surface} ${classes.gpaCard}`}>
                                    <div className={classes.gpaStatRow}>
                                        <div className={classes.gpaStat}>
                                            <span className={classes.label}>GPA (1–99)</span>
                                            <span className={classes.gpaStatValue}>{row.gpa_1to99}</span>
                                            <span className={classes.gpaStatSub}>{row.units_1to99} units earned</span>
                                        </div>
                                        <div className={classes.gpaStat}>
                                            <span className={classes.label}>GPA (1–399)</span>
                                            <span className={classes.gpaStatValue}>{row.gpa_1to399}</span>
                                            <span className={classes.gpaStatSub}>{row.units_1to399} units earned</span>
                                        </div>
                                        <div className={classes.gpaStat}>
                                            <span className={classes.label}>Cumulative GPA</span>
                                            <span className={classes.gpaStatValue}>{row.cumgpa}</span>
                                            <span className={classes.gpaStatSub}>{row.allunits} units earned</span>
                                        </div>
                                        <div className={classes.gpaStat}>
                                            <span className={classes.label}>Attempted</span>
                                            <span className={`${classes.gpaStatValue} ${classes.gpaStatValueMuted}`}>{row.units_1to399attm}</span>
                                            <span className={classes.gpaStatSub}>units attempted</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Section>
                )
            }

            {/* ---------- degrees ---------- */}
            {
                degrees.length > 0 && (
                    <Section
                        classes={classes}
                        title="Degrees Earned & Pending"
                        subtitle={`${degrees.length} ${degrees.length === 1 ? 'record' : 'records'} posted`}
                        action={
                            <Legend
                                classes={classes}
                                items={[
                                    ['GR', 'Graduated'],
                                    ['CA', 'Certificate of Achievement'],
                                    ['PN', 'Pending'],
                                ]}
                            />
                        }
                    >
                        <div className={classes.degreeGrid}>
                            {degrees.map((item, i) => (
                                <div key={i} className={classes.degreeItem}>
                                    <div className={classes.degreeTopRow}>
                                        <span className={classes.degreeName}>{item.label}</span>
                                        {item.status && <span className={classes.degreeStatus}>{item.status}</span>}
                                    </div>
                                    {item.term && <span className={classes.degreeTerm}>Term {item.term}</span>}
                                </div>
                            ))}
                        </div>
                    </Section>
                )
            }

            {/* ---------- major audit (opt-in: it's the slow SIS-backed call) ---------- */}
            {
                activeStudentId && (
                    <Section
                        classes={classes}
                        title="Major Audit"
                        subtitle={auditRan
                            ? `${auditVariant ? 'Includes' : 'Excludes'} in-progress coursework${auditAt ? ` · updated ${auditAt.toLocaleDateString()}` : ''}`
                            : 'Percent complete by major requirement'}
                        action={
                            <div className={classes.auditActions}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={includeInProgress}
                                            onChange={(e) => handleToggleInProgress(e.target.checked)}
                                            disabled={auditLoading || !auditReady}
                                        />
                                    }
                                    label="Include in-progress"
                                />
                                <Button
                                    color="primary"
                                    size="small"
                                    variant="contained"
                                    disabled={auditLoading || !auditReady}
                                    onClick={runMajorAudit}
                                >
                                    {auditLoading ? 'Running…' : auditRan ? 'Re-run audit' : 'Run audit'}
                                </Button>
                            </div>
                        }
                    >
                        {auditLoading && (
                            <div className={classes.auditPending}>
                                Running the What-If audit{majorsLabel ? ` for ${majorsLabel}` : ''}…
                            </div>
                        )}

                        {!auditLoading && auditRan && (
                            <>
                                {auditVariant !== includeInProgress && (
                                    <p className={classes.auditNote}>
                                        These numbers were audited {auditVariant ? 'with' : 'without'} in-progress coursework.
                                        Re-run the audit to refresh them for the current setting.
                                    </p>
                                )}
                                {auditRows.length === 0 && (
                                    <div className={classes.auditPending}>
                                        The audit completed, but returned no major requirement results for this student.
                                    </div>
                                )}
                                <div className={classes.results}>
                                    {auditRows.map(({ label, pct }) => {
                                        const fill = pct >= 100 ? colorCtaGreenBase : pct >= 50 ? colorCtaBlueBase : colorFillAlertWarning;
                                        return (
                                            <div key={label} className={classes.resultRow}>
                                                <span className={classes.resultLabel}>
                                                    {label}
                                                    {pct >= 100 && <span className={classes.resultSub}>Requirement complete</span>}
                                                </span>
                                                <div className={classes.progressTrack}>
                                                    <div className={classes.progressFill} style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: fill }} />
                                                </div>
                                                <span className={classes.resultPct}>{Math.round(pct)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {!auditLoading && !auditRan && (
                            <div className={classes.auditPending}>
                                <span>
                                    {auditError
                                        || `No audit run for this student yet. Click Run audit to calculate percent complete${majorsLabel ? ` for ${majorsLabel}` : ''}.`}
                                </span>
                                {!auditReady && (
                                    <span className={classes.auditHint}>
                                        Major audits need the What-If URL, access token, catalog year and majors from the Degree Audit card.
                                    </span>
                                )}
                            </div>
                        )}
                    </Section>
                )
            }

            {/* ---------- current classes ---------- */}
            {
                currentClassRows.length > 0 && (
                    <Section
                        classes={classes}
                        title="Currently Enrolled"
                        subtitle={`${currentClassRows.length} ${currentClassRows.length === 1 ? 'class' : 'classes'} · refund deadline shown per class`}
                    >
                        <table className={classes.table}>
                            <thead>
                                <tr>
                                    <th className={classes.headerCell} style={{ width: '30%' }}>Course</th>
                                    <th className={classes.headerCell} style={{ width: '18%' }}>Status</th>
                                    <th className={classes.headerCell} style={{ width: '32%' }}>Session</th>
                                    <th className={classes.headerCell}>Added Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentClassRows.map((row, i) => {
                                    const tone = statusTone(row.status);
                                    return (
                                        <tr key={row.crn || i}>
                                            <td className={classes.cell}>
                                                <span className={classes.cellStrong}>{row.course}</span>
                                                {row.crn && <span className={classes.cellSub}>CRN {row.crn}</span>}
                                            </td>
                                            <td className={classes.cell}>
                                                {row.status && (
                                                    <Pill
                                                        classes={classes}
                                                        className={toneClass(classes, tone)}
                                                    >
                                                        {row.status}
                                                    </Pill>
                                                )}
                                            </td>
                                            <td className={classes.cell}>
                                                {row.session || '—'}
                                                {row.refundDate && <span className={classes.cellSub}>Refund deadline {row.refundDate}</span>}
                                                {row.dropDate && <span className={classes.cellSub}>Drop deadline {row.dropDate}</span>}
                                            </td>
                                            <td className={classes.cell}>
                                                {row.addedDate && <span className={classes.cellSub}>{row.addedDate}</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Section>
                )
            }

            {/* ---------- transcript ---------- */}
            {
                transcriptByTerm?.length > 0 && (
                    <Section
                        classes={classes}
                        title="Transcript"
                        subtitle="Completed coursework by term"
                        action={
                            <Legend
                                classes={classes}
                                items={[
                                    ['E', 'Exclude'],
                                    ['I', 'Include'],
                                    ['A / 06 / 06A', 'Excluded from earned units & included in GPA'],
                                ]}
                            />
                        }
                    >
                        <div className={classes.transcriptGrid}>
                            {transcriptByTerm.map(({ term, courses }) => {
                                const termUnits = courses.reduce((sum, c) => sum + (parseFloat(c.units) || 0), 0);
                                return (
                                    <div key={term} className={classes.termGroup}>
                                        <div className={classes.termHeader}>
                                            <Typography variant="h4">{formatTerm(term)}</Typography>
                                            <span className={classes.termUnits}>{termUnits} units · {courses.length} courses · {term}</span>
                                        </div>
                                        <table className={classes.table}>
                                            <thead>
                                                <tr>
                                                    <th className={classes.headerCell} style={{ width: '44%' }}>Course</th>
                                                    <th className={classes.headerCell} style={{ width: '18%' }}>Grade</th>
                                                    <th className={classes.headerCell} style={{ width: '18%' }}>Units</th>
                                                    <th className={classes.headerCell} style={{ width: '20%' }}>Code</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {courses.map((course, i) => {
                                                    const tone = gradeTone(course.grade);
                                                    return (
                                                        <tr key={i}>
                                                            <td className={classes.cell}>
                                                                {course.course}
                                                            </td>
                                                            <td className={classes.cell}>
                                                                <span
                                                                    className={`${classes.gradeBadge} ${tone === 'pass' ? classes.gradePass : ''} ${tone === 'fail' ? classes.gradeFail : ''}`}
                                                                >
                                                                    {course.grade}
                                                                </span>
                                                            </td>
                                                            <td className={`${classes.cell} ${classes.cellNumeric}`}>{course.units}</td>
                                                            <td className={`${classes.cell} ${classes.cellNumeric}`}>{course.code}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                )
            }

            {
                !activeStudentId && (
                    <div className={classes.emptyState}>
                        <Icon name="search" />
                        No student selected. Enter a student ID above to view their degree audit.
                    </div>
                )
            }
        </div >
    );
};

export default HomePage;
