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
            studentInfoAPI, majorInfoAPI, termListAPI, registrationTimeAPI, updateMajorAPI, updateConcentrationAPI
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
    const [submitting, setSubmitting] = useState(false);
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

                const pageSize = 1000;
                let allRecords = [];
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

                // For each item, find the MAX(termEff) <= selectedTerm for the same program + majorCode
                const filtered = allRecords.filter(item => {
                    if (item.sorcmjrRecInd !== 'Y' || item.sorcmjrAdmInd !== 'Y' || item.sorcmjrStuInd !== 'Y') return false;
                    const maxTermEff = allRecords
                        .filter(r =>
                            r.termEff <= value &&
                            r.sobcurrProgram === item.sobcurrProgram &&
                            r.sorcmjrMajrCode === item.sorcmjrMajrCode &&
                            r.sorcmjrRecInd === 'Y' &&
                            r.sorcmjrAdmInd === 'Y' &&
                            r.sorcmjrStuInd === 'Y'
                        )
                        .reduce((max, r) => r.termEff > max ? r.termEff : max, '');
                    return item.termEff === maxTermEff;
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
        setSelectedMajrCode('');
        setFinaidAlertDismissed(false);
        const match = programOptions.find(p => p.code === program);
        setSelectedDegcCode(match?.degcCode || '');
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
        setSubmitting(true);

        setAlertState(null);
        try {
            const initWaitTime = await authenticatedEthosFetch(`${registrationTimeAPI}?cardId=${cardId}&waitTime=${zeroMins}&previousTime=${fiveMins}`);
            const initWaitResult = await initWaitTime.json();
            console.log(initWaitResult);
            if (initWaitTime.status !== 200) {
                setAlertState({ type: 'error', message: 'Failed to initialize wait time. Please try again.' });
                setSubmitting(false);
                return;
            }

            const majorResponse = await authenticatedEthosFetch(`${updateMajorAPI}?cardId=${cardId}&program=${selectedProgram}&degcCode=${selectedDegcCode}&majrCode=${selectedMajrCode}&id=${studentInfo.studentId}&term=${dropdownStateTerm}`);
            const majorUpdateResult = await majorResponse.json();
            console.log('Major Update Result:', majorUpdateResult);
            if (majorResponse.status === 200) {
                const concentrationResponse = await authenticatedEthosFetch(`${updateConcentrationAPI}?cardId=${cardId}&majorCode=${selectedMajrCode}&concentrationCode=${selectedConcentration}&majrCode=${selectedMajrCode}&id=${studentInfo.studentId}&term=${dropdownStateTerm}`);
                const concentrationUpdateResult = await concentrationResponse.json();
                console.log('Concentration Update Result:', concentrationUpdateResult);
                if (concentrationResponse.status === 200) {
                    setAlertState({ type: 'success', message: 'Major and Concentration updated successfully!' });
                    await refreshStudentInfo(studentInfo.studentId);
                } else {
                    setAlertState({ type: 'error', message: 'Failed to update concentration. Please try again.' });
                }
            } else {
                setAlertState({ type: 'error', message: 'Failed to update major. Please try again.' });
            }

            const revertWaitTime = await authenticatedEthosFetch(`${registrationTimeAPI}?cardId=${cardId}&waitTime=${fiveMins}&previousTime=${zeroMins}`);
            console.log(await revertWaitTime.json());
        } catch (error) {
            console.error('Submit error:', error);
            setAlertState({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
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
            </Backdrop>
        </div>
    );
};

HomePage.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);