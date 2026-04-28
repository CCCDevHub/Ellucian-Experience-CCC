import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20, spacing40, spacing10 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextField,
    Button,
    CircularProgress,
    Backdrop,
    Dropdown,
    DropdownItem,
    Alert,
    PAGE_VARIANT
} from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import {
    useCardInfo,
    useData,
    usePageControl,
} from '@ellucian/experience-extension-utils';

const styles = () => ({
    card: {
        margin: `0 ${spacing20}`
    },
    header: {
        marginBottom: spacing20
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: `0 ${spacing40}`
    },
    field: {
        padding: `${spacing20} 0`,
        borderBottom: '1px solid rgba(0,0,0,0.12)'
    },
    label: {
        marginBottom: spacing10,
        color: 'rgba(0,0,0,0.54)',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
    },
    spacing: {
        marginBottom: spacing40
    },
    divider: {
        border: 'none',
        borderTop: '2px solid rgba(0,0,0,0.12)',
        margin: `${spacing40} 0`
    },
    sectionHeader: {
        marginBottom: spacing20
    },
    lookupRow: {
        display: 'flex',
        gap: spacing20,
        alignItems: 'center',
        marginBottom: spacing40
    },
    lookupInput: {
        flex: 1
    },
    dropdownGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: `${spacing40} ${spacing40}`,
        marginBottom: spacing40
    },
    backdrop: {
        zIndex: 9999,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing20
    }
});

const HomePage = (props) => {
    const { classes } = props;
    const customId = 'change-of-major';
    const { setPageTitle, setLoadingStatus } = usePageControl();
    const { authenticatedEthosFetch } = useData();
    const { cardConfiguration:
        {
            studentInfoAPI, majorInfoAPI, termListAPI, registrationTimeAPI, getRegistrationTimeAPI, updateMajorAPI, updateConcentrationAPI
        }, cardId
    } = useCardInfo();
    setPageTitle("Change of Major");

    const [lookupId, setLookupId] = useState(localStorage.getItem('studentId') || "");
    const [studentInfo, setStudentInfo] = useState(null);
    const [termList, setTermList] = useState([]);
    const [dropdownStateTerm, setDropdownStateTerm] = useState('');
    const [majorList, setMajorList] = useState([]);
    const [selectedDegree, setSelectedDegree] = useState('');
    const [selectedProgram, setSelectedProgram] = useState('');
    const [selectedConcentration, setSelectedConcentration] = useState('');
    const [selectedMajrCode, setSelectedMajrCode] = useState('');
    const [selectedDegcCode, setSelectedDegcCode] = useState('');
    const majorCache = useRef({});
    const allMajorRecordsRef = useRef([]);
    const [submitting, setSubmitting] = useState(false);
    const [progressText, setProgressText] = useState('');
    const [finaidAlertDismissed, setFinaidAlertDismissed] = useState(false);
    const [loadingStudent, setLoadingStudent] = useState(false);
    const [loadingMajors, setLoadingMajors] = useState(false);
    const [alertState, setAlertState] = useState(null);
    const [holdAlertDismissed, setHoldAlertDismissed] = useState(false); // { type: 'success'|'error', message: string }
    const zeroMins = "0";
    const fiveMins = "5";

    const fetchStudent = async (id) => {
        setLoadingStudent(true);
        setStudentInfo(null);
        setTermList([]);
        setDropdownStateTerm('');
        setMajorList([]);
        setSelectedDegree('');
        setSelectedProgram('');
        setSelectedConcentration('');
        setSelectedMajrCode('');
        setSelectedDegcCode('');
        setHoldAlertDismissed(false);
        try {
            const response = await authenticatedEthosFetch(`${studentInfoAPI}?cardId=${cardId}&studentId=${id}`);
            const studentResult = await response.json();
            if (Array.isArray(studentResult) && studentResult.length > 0) {
                setStudentInfo(studentResult[0]);
            }
            const termResponse = await authenticatedEthosFetch(`${termListAPI}?cardId=${cardId}`);
            const termResult = await termResponse.json();
            setTermList(termResult.filter(term => term.termDisplayControl == 'Y'));
        } catch (error) {
            console.log(error);
        }
        setLoadingStudent(false);
    };

    const refreshStudentInfo = async (id) => {
        try {
            const response = await authenticatedEthosFetch(`${studentInfoAPI}?cardId=${cardId}&studentId=${id}`);
            const studentResult = await response.json();
            if (Array.isArray(studentResult) && studentResult.length > 0) {
                setStudentInfo(studentResult[0]);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const hasHold = !!(studentInfo?.holds?.trim());
    const selectedProgramInfo = majorList.find(item => item.sobcurrProgram === selectedProgram);
    const finaidIneligible = selectedProgramInfo?.finaidElig === 'NO';

    // Derive unique degree options — deduplicate by label so same-named degrees don't repeat
    const degreeOptions = majorList.reduce((acc, item) => {
        if (!acc.find(d => d.label === item.degree)) {
            acc.push({ label: item.degree });
        }
        return acc;
    }, []);

    // Filter programs by selected degree label (covers all codes sharing the same degree name)
    const programOptions = majorList.reduce((acc, item) => {
        if (item.degree === selectedDegree && !acc.find(p => p.code === item.sobcurrProgram)) {
            acc.push({ code: item.sobcurrProgram, label: item.program, degcCode: item.sobcurrDegcCode });
        }
        return acc;
    }, []);

    // Filter concentrations by selected degree label + program
    const concentrationOptions = majorList.filter(
        item => item.degree === selectedDegree && item.sobcurrProgram === selectedProgram && item.concentration?.trim()
    );

    useEffect(() => {
        if (lookupId) {
            fetchStudent(lookupId);
        }
    }, []);

    const handleChangeTerm = (event) => {
        const { value } = event.target;
        setDropdownStateTerm(value);
        setMajorList([]);
        setSelectedDegree('');
        setSelectedProgram('');
        setSelectedConcentration('');
        setLoadingMajors(true);
        (async () => {
            try {
                // Return cached result if this term was already fetched
                if (majorCache.current[value]) {
                    setMajorList(majorCache.current[value]);
                    setLoadingMajors(false);
                    return;
                }

                let allRecords = allMajorRecordsRef.current;
                if (allRecords.length === 0) {
                    const pageSize = 1000;
                    let offset = 0;
                    let hasMore = true;

                    while (hasMore) {
                        const response = await authenticatedEthosFetch(`${majorInfoAPI}?cardId=${cardId}&pageSize=${pageSize}&offset=${offset}`);
                        const page = await response.json();
                        if (!Array.isArray(page) || page.length === 0) {
                            hasMore = false;
                        } else {
                            allRecords = allRecords.concat(page);
                            hasMore = page.length === pageSize;
                            offset += pageSize;
                        }
                    }
                    allMajorRecordsRef.current = allRecords;
                }

                // For each item, keep it only if it is the most recent record (active or inactive)
                // for its program+majorCode up to selectedTerm AND that most recent record is active.
                const filtered = allRecords.filter(item => {
                    if (item.sorcmjrRecInd !== 'Y' || item.sorcmjrAdmInd !== 'Y' || item.sorcmjrStuInd !== 'Y') return false;

                    const sameGroup = allRecords.filter(r =>
                        r.termEff <= value &&
                        r.sobcurrProgram === item.sobcurrProgram &&
                        r.sorcmjrMajrCode === item.sorcmjrMajrCode
                    );

                    const globalMax = sameGroup.reduce((max, r) => r.termEff > max ? r.termEff : max, '');

                    const activeMax = sameGroup
                        .filter(r => r.sorcmjrRecInd === 'Y' && r.sorcmjrAdmInd === 'Y' && r.sorcmjrStuInd === 'Y')
                        .reduce((max, r) => r.termEff > max ? r.termEff : max, '');

                    return item.termEff === activeMax && activeMax === globalMax;
                });

                majorCache.current[value] = filtered;
                setMajorList(filtered);
            } catch (error) {
                console.error(error);
            }
            setLoadingMajors(false);
        })();
    };

    const handleChangeDegree = (event) => {
        setSelectedDegree(event.target.value);
        setSelectedProgram('');
        setSelectedConcentration('');
        setSelectedMajrCode('');
        setSelectedDegcCode('');
        setFinaidAlertDismissed(false);
    };

    const handleChangeProgram = (event) => {
        const program = event.target.value;
        setSelectedProgram(program);
        setSelectedConcentration('');
        setFinaidAlertDismissed(false);
        const match = programOptions.find(p => p.code === program);
        setSelectedDegcCode(match?.degcCode || '');

        // If this program has no concentrations, set majrCode from the program record directly
        const hasConcentrations = majorList.some(
            item => item.degree === selectedDegree && item.sobcurrProgram === program && item.concentration?.trim()
        );
        if (!hasConcentrations) {
            const programRecord = majorList.find(
                item => item.degree === selectedDegree && item.sobcurrProgram === program
            );
            setSelectedMajrCode(programRecord?.sorcmjrMajrCode || '');
        } else {
            setSelectedMajrCode('');
        }
    };

    const handleChangeConcentration = (event) => {
        const concentration = event.target.value;
        setSelectedConcentration(concentration);
        const match = concentrationOptions.find(c => c.concentration === concentration);
        setSelectedMajrCode(match?.sorcmjrMajrCode || '');
    };

    const fields = studentInfo ? [
        // { label: 'Student ID', value: studentInfo.studentId },
        { label: 'First Name', value: studentInfo.studentFirstName },
        { label: 'Last Name', value: studentInfo.studentLastName },
        { label: 'Latest Program Term', value: studentInfo.latestTermDesc },
        { label: 'Degree', value: studentInfo.degreeDesc },
        { label: 'Program', value: studentInfo.programDesc },
        { label: 'Concentration', value: studentInfo.concentration },
        { label: 'Goals', value: studentInfo.goals },
        { label: 'Holds', value: studentInfo.holds },
    ] : [];

    const handleLookup = () => {
        if (lookupId.trim()) {
            localStorage.setItem('studentId', lookupId.trim());
            fetchStudent(lookupId.trim());
        }
    };

    const handleLookupKeyDown = (event) => {
        if (event.key === 'Enter') handleLookup();
    };

    const handleSubmitMajorChange = async () => {
        setAlertState(null);

        const sameDegreeAndProgram =
            studentInfo.degreeCode === selectedDegcCode &&
            studentInfo.programCode === selectedProgram;
        const sameConcentration = studentInfo.concentration === selectedConcentration;

        if (sameDegreeAndProgram && sameConcentration) {
            setAlertState({ type: 'warning', message: 'No changes detected. Please select a different degree, program, or concentration.' });
            return;
        }

        setSubmitting(true);
        let wasRestricted = false;
        try {
            const getWaitTime = await authenticatedEthosFetch(`${getRegistrationTimeAPI}?cardId=${cardId}`);
            const waitTimeResult = await getWaitTime.json();
            console.log('Current registration time restriction:', waitTimeResult[0]?.externalCode);
            wasRestricted = waitTimeResult[0]?.externalCode === '5';
            console.log('Current registration time restriction status:', wasRestricted);
            if (wasRestricted) {
                await authenticatedEthosFetch(`${registrationTimeAPI}?cardId=${cardId}&waitTime=${zeroMins}&previousTime=${fiveMins}`);
            }


            // Generate all terms from selectedTerm up to maxTermEff using the YYYYTT suffix pattern
            const termSuffixes = ['10', '30', '50', '70'];
            const termsToUpdate = [];
            let year = parseInt(dropdownStateTerm.slice(0, 4));
            let suffixIdx = termSuffixes.indexOf(dropdownStateTerm.slice(4));
            let currentTerm = dropdownStateTerm;
            console.log(currentTerm, studentInfo.latestProgramTerm);
            if (currentTerm < studentInfo.latestProgramTerm) {
                setAlertState({ type: 'error', message: `Selected term must be the same or later than the student's latest program term (${studentInfo.latestTermDesc}).` });
                setSubmitting(false);
                return;
            }
            while (currentTerm <= studentInfo.latestProgramTerm) {
                termsToUpdate.push(currentTerm);
                suffixIdx++;
                if (suffixIdx >= termSuffixes.length) {
                    suffixIdx = 0;
                    year++;
                }
                currentTerm = `${year}${termSuffixes[suffixIdx]}`;
            }

            console.log('Terms to update:', termsToUpdate);

            const termStartDates = { '10': '01-05', '30': '03-01', '50': '07-01', '70': '09-01' };
            const getEstsDate = (termCode) => {
                const y = termCode.slice(0, 4);
                const suffix = termCode.slice(4);
                return `${y}-${termStartDates[suffix]}`;
            };

            for (let i = 0; i < termsToUpdate.length; i++) {
                const term = termsToUpdate[i];
                setProgressText(`Updating term ${i + 1} of ${termsToUpdate.length} (${term})...`);
                const rstsEstsDate = getEstsDate(term);
                if (!sameDegreeAndProgram) {
                    const majorResponse = await authenticatedEthosFetch(`${updateMajorAPI}?cardId=${cardId}&program=${selectedProgram}&degcCode=${selectedDegcCode}&majrCode=${selectedMajrCode}&id=${studentInfo.studentId}&term=${term}&rstsEstsDate=${rstsEstsDate}`);
                    const majorUpdateResult = await majorResponse.json();
                    console.log(`Major Update [${term}]:`, majorUpdateResult);
                    if (majorResponse.status !== 200) {
                        setAlertState({ type: 'error', message: `Failed to update major for term ${term}. Please try again.` });
                        if (wasRestricted) await authenticatedEthosFetch(`${registrationTimeAPI}?cardId=${cardId}&waitTime=${fiveMins}&previousTime=${zeroMins}`);
                        setSubmitting(false);
                        return;
                    }
                }

                if (concentrationOptions.length > 0) {
                    const concentrationResponse = await authenticatedEthosFetch(`${updateConcentrationAPI}?cardId=${cardId}&majorCode=${selectedMajrCode}&concentrationCode=${selectedConcentration}&majrCode=${selectedMajrCode}&id=${studentInfo.studentId}&term=${term}&rstsEstsDate=${rstsEstsDate}`);
                    const concentrationUpdateResult = await concentrationResponse.json();
                    console.log(`Concentration Update [${term}]:`, concentrationUpdateResult);
                    if (concentrationResponse.status !== 200) {
                        setAlertState({ type: 'error', message: `Failed to update concentration for term ${term}. Please try again.` });
                        if (wasRestricted) await authenticatedEthosFetch(`${registrationTimeAPI}?cardId=${cardId}&waitTime=${fiveMins}&previousTime=${zeroMins}`);
                        setSubmitting(false);
                        return;
                    }
                }
            }

            const firstTerm = termsToUpdate[0];
            const lastTerm = termsToUpdate[termsToUpdate.length - 1];
            const termRange = termsToUpdate.length > 1 ? `${firstTerm} – ${lastTerm}` : firstTerm;
            const updateType = sameDegreeAndProgram
                ? 'Concentration'
                : concentrationOptions.length > 0
                    ? 'Major and Concentration'
                    : 'Major';
            const successMsg = `${updateType} updated successfully for ${termsToUpdate.length} term${termsToUpdate.length > 1 ? 's' : ''} (${termRange}).`;
            setProgressText('');
            setAlertState({ type: 'success', message: successMsg });
            await refreshStudentInfo(studentInfo.studentId);

            if (wasRestricted) {
                await authenticatedEthosFetch(`${registrationTimeAPI}?cardId=${cardId}&waitTime=${fiveMins}&previousTime=${zeroMins}`);
            }
        } catch (error) {
            console.error('Submit error:', error);
            setProgressText('');
            setAlertState({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
            if (wasRestricted) await authenticatedEthosFetch(`${registrationTimeAPI}?cardId=${cardId}&waitTime=${fiveMins}&previousTime=${zeroMins}`);
        }
        setSubmitting(false);
    };

    return (
        <div className={classes.card}>
            <div className={classes.lookupRow}>
                <TextField
                    id={`${customId}_StudentIdLookup`}
                    label="Student ID"
                    placeholder="Enter Student ID"
                    value={lookupId}
                    onChange={e => setLookupId(e.target.value)}
                    onKeyDown={handleLookupKeyDown}
                    className={classes.lookupInput}
                />
                <Button
                    id={`${customId}_LookupButton`}
                    color="primary"
                    variant="contained"
                    onClick={handleLookup}
                >
                    Look Up
                </Button>
            </div>

            <Typography variant={'h2'} className={classes.header}>
                Student Information
            </Typography>
            <div className={classes.grid}>
                {fields.map(({ label, value }) => (
                    <div key={label} className={classes.field}>
                        <Typography className={classes.label}>{label}</Typography>
                        <Typography variant={'body1'}>{value || '—'}</Typography>
                    </div>
                ))}
            </div>

            <hr className={classes.divider} />

            <Typography variant={'h3'} className={classes.sectionHeader}>
                Change of Major
            </Typography>

            <Alert
                alertType="warning"
                id={`${customId}_HoldAlert`}
                onClose={() => setHoldAlertDismissed(true)}
                open={hasHold && !holdAlertDismissed}
                text={`This student has an active hold (${studentInfo?.holds?.trim()}) and cannot change their major.`}
                variant={PAGE_VARIANT}
            />

            <div className={classes.dropdownGrid}>
                <Dropdown
                    id={`${customId}_DropdownTerm`}
                    label="Select Term"
                    onChange={handleChangeTerm}
                    value={dropdownStateTerm}
                    disabled={hasHold}
                    fullWidth
                    MenuProps={{ disablePortal: true, disableEnforceFocus: true }}
                >
                    {termList.map(term => (
                        <DropdownItem key={term.termCode} label={term.termName} value={term.termCode} />
                    ))}
                </Dropdown>

                <Dropdown
                    id={`${customId}_DropdownDegree`}
                    label="Select Degree"
                    onChange={handleChangeDegree}
                    value={selectedDegree}
                    disabled={hasHold || degreeOptions.length === 0}
                    fullWidth
                    MenuProps={{ disablePortal: true, disableEnforceFocus: true }}
                >
                    {degreeOptions.map(d => (
                        <DropdownItem key={d.label} label={d.label} value={d.label} />
                    ))}
                </Dropdown>

                <Dropdown
                    id={`${customId}_DropdownProgram`}
                    label="Select Program"
                    onChange={handleChangeProgram}
                    value={selectedProgram}
                    disabled={hasHold || programOptions.length === 0}
                    fullWidth
                    MenuProps={{ disablePortal: true, disableEnforceFocus: true }}
                >
                    {programOptions.map(p => (
                        <DropdownItem key={p.code} label={p.label} value={p.code} />
                    ))}
                </Dropdown>

                {concentrationOptions.length > 0 && (
                    <Dropdown
                        id={`${customId}_DropdownConcentration`}
                        label="Select Concentration"
                        onChange={handleChangeConcentration}
                        value={selectedConcentration}
                        disabled={hasHold}
                        fullWidth
                        MenuProps={{ disablePortal: true, disableEnforceFocus: true }}
                    >
                        {concentrationOptions.map(c => (
                            <DropdownItem key={c.sorcconCconRule} label={c.concentration} value={c.concentration} />
                        ))}
                    </Dropdown>
                )}
            </div>

            <Alert
                alertType="warning"
                id={`${customId}_FinaidAlert`}
                onClose={() => setFinaidAlertDismissed(true)}
                open={finaidIneligible && !finaidAlertDismissed}
                text={`The program "${selectedProgramInfo?.program}" is not eligible for financial aid.`}
                variant={PAGE_VARIANT}
            />

            <Alert
                alertType={alertState?.type}
                id={`${customId}_Alert`}
                onClose={() => setAlertState(null)}
                open={!!alertState}
                text={alertState?.message}
                variant={PAGE_VARIANT}
            />

            <Button
                id={`${customId}_SubmitButton`}
                color="primary"
                variant="contained"
                disabled={hasHold || !selectedDegree || !selectedProgram || (concentrationOptions.length > 0 && !selectedConcentration)}
                onClick={handleSubmitMajorChange}
                fluid
            >
                Submit Change of Major
            </Button>

            <Backdrop
                className={classes.backdrop}
                open={loadingStudent || loadingMajors || submitting}
            >
                <CircularProgress color="inherit" />
                {progressText && (
                    <Typography style={{ color: '#fff' }}>{progressText}</Typography>
                )}
            </Backdrop>
        </div>
    );
};

HomePage.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);