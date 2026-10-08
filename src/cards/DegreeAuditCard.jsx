import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, TextField, Button, Switch, FormControlLabel } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useData, useExtensionInfo } from '@ellucian/experience-extension-utils';
import React, { useState } from 'react';

const SETTINGS_KEY = 'degreeAuditSettings';
const STUDENT_NAME_PREFIX = 'degreeAuditStudentName_';
const STUDENT_EMAIL_PREFIX = 'degreeAuditStudentEmail_';
// Written by the page: the host only exposes pageInfo to pages, so the card can't discover on its own
// where this extension's page is mounted.
const PAGE_BASE_KEY = 'degreeAuditPageBasePath';
const PAGE_ROUTE_MARKER = '/degree-audit/';
// Path mounts an extension page under /{tenant}/page/{pageId}/{publisher}/{extension}/{cardType},
// which the card cannot read from its own context. Pinned here so the very first click can open a
// tab; a card config "Page Path" value or a path learned from a previous visit takes precedence.
// Update this if the extension is re-uploaded so the page id changes (e.g. the prod deployment).
const DEFAULT_PAGE_BASE = '/paccd/page/001G000000oSixuIAC/Huey%20Phan/DegreeAudit/DegreeAuditCard';

// Host-provided values are only trusted when they look like an extension page path, so a stray
// field can never send the card off to a dashboard or unrelated URL.
const normalizeHostPageBase = (raw) => {
    const base = normalizePageBase(raw);
    return /^\/(page|ext|extension|custom)\//i.test(base) || /^\/[^/]+\/(page|ext|extension|custom)\//i.test(base)
        ? base
        : '';
};

// Accepts "/page/1234", "page/1234" or a full pasted URL, and strips a student route if one was
// included. Same-origin only: a cross-origin link wouldn't carry the Path session or localStorage.
const normalizePageBase = (raw) => {
    const value = (raw ?? '').trim();
    if (!value) return '';
    let pathname = value;
    if (/^https?:\/\//i.test(value)) {
        try {
            const url = new window.URL(value);
            if (url.origin !== window.location.origin) return '';
            pathname = url.pathname;
        } catch {
            return '';
        }
    } else {
        pathname = value.startsWith('/') ? value : `/${value}`;
    }
    const markerIndex = pathname.indexOf(PAGE_ROUTE_MARKER);
    if (markerIndex >= 0) pathname = pathname.slice(0, markerIndex);
    // Path page URLs carry encoded segments (ex: "Huey%20Phan"); re-encode any raw space so the
    // href we hand to window.open matches what the host itself renders.
    return pathname.replace(/\/+$/, '').replace(/ /g, '%20');
};

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
    const cardInfo = useCardInfo();
    const { configuration: {
        catalogYear, majorCodes, majorDisp, whatIfPipeline, whatIfUrl, username, password, gpaPipeline, studentPipeline, currentClassesPipeline, pagePath
    }, cardId } = cardInfo;
    const extensionInfo = useExtensionInfo();

    const [studentId, setStudentId] = useState('');
    const [inProgress, setInProgress] = useState(false);
    const [includeInProgress, setIncludeInProgress] = useState(false);

    const handleClick = async () => {
        setInProgress(true);

        const route = `${PAGE_ROUTE_MARKER}${studentId.trim()}`;
        // Pinned config wins over the auto-learned value, so a freshly deployed card can open a tab
        // on the very first click instead of only the second.
        const basePath = normalizePageBase(pagePath)
            || normalizePageBase(window.localStorage.getItem(PAGE_BASE_KEY))
            || normalizeHostPageBase(cardInfo.pagePath || cardInfo.pageUrl || extensionInfo.pagePath || extensionInfo.pageUrl)
            || normalizeHostPageBase(DEFAULT_PAGE_BASE);
        // window.open must run inside the click gesture or popup blockers swallow it, so the tab is
        // opened blank here and only pointed at the student once token + settings are in localStorage.
        const newTab = basePath ? window.open('', '_blank') : null;

        try {
            const tokenRes = await fetch('https://dwadmin-prod.ec.pasadena.edu/transit/api/stateless-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password: 'WHATIFAPI' })
            });
            if (!tokenRes.ok) throw new Error(`Token error: ${tokenRes.statusText}`);
            const { token } = await tokenRes.json();

            // token is now a plain string from the API — safe to store
            // Cache everything the page needs so it still works on refresh / direct navigation.
            window.localStorage.setItem(SETTINGS_KEY, JSON.stringify({
                cardId,
                includeInProgress,
                token,
                whatIfUrl,
                catalogYear,
                majorCodes,
                majorDisp,
                whatIfPipeline,
                gpaPipeline,
                studentPipeline,
                currentClassesPipeline
            }));

            const personResponse = await authenticatedEthosFetch(`${studentPipeline}?cardId=${cardId}&personId=${studentId}`);

            if (!personResponse.ok) throw new Error(`Person error: ${personResponse.statusText}`);
            const personResult = await personResponse.json();

            const fullName = `${personResult?.data?.persons12?.edges?.[0]?.node?.names?.[0]?.lastName}, ${personResult?.data?.persons12?.edges?.[0]?.node?.names?.[0]?.firstName}`;
            if (fullName) {
                window.localStorage.setItem(`${STUDENT_NAME_PREFIX}${studentId}`, fullName);
            }

            const email = personResult?.data?.persons12?.edges?.[0]?.node?.emails?.find(e => e.type.emailType === 'school')?.address;

            if (email) {
                window.localStorage.setItem(`${STUDENT_EMAIL_PREFIX}${studentId}`, email);
            }

            if (newTab) {
                newTab.location.href = `${window.location.origin}${basePath}${route}`;
            } else {
                // No page URL known yet (or the popup was blocked) — fall back to same-tab navigation
                // and learn the prefix on the way, so the next click can open a tab.
                navigateToPage({ route });
                window.setTimeout(() => {
                    const markerIndex = window.location.pathname.indexOf(PAGE_ROUTE_MARKER);
                    if (markerIndex > 0) {
                        window.localStorage.setItem(PAGE_BASE_KEY, window.location.pathname.slice(0, markerIndex));
                    }
                }, 500);
            }
        } catch (error) {
            if (newTab) newTab.close();
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
                label="Include in-progress classes (audit default)"
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
                {inProgress ? 'Loading…' : 'View Student'}
            </Button>
        </div>
    );
};

export default DegreeAuditCard;
