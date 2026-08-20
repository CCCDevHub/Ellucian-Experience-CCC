import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    makeStyles,
    Typography,
    Tab,
    Tabs,
    Dropdown,
    DropdownItem,
    Alert
} from '@ellucian/react-design-system/core';
import React, { useEffect, useState, useCallback } from 'react';
import {
    useData,
    usePageControl,
    useCardInfo
} from '@ellucian/experience-extension-utils';

import { saveAttendanceData, loadAttendanceData } from '../utils/indexedDB';
import { fetchDedupedSections, extractCourseInfo } from '../utils/sections';
import { copyToClipboard } from '../utils/clipboard';
import { printBlankSheet } from '../utils/rosterPrint';
import { exportRosterToExcel } from '../utils/rosterExport';
import RosterContent from './RosterContent';


const useStyles = makeStyles()({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },
    content: {
        height: '100%',
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    spacing: {
        marginBottom: spacing40
    }
});

const HomePage = () => {
    const { classes } = useStyles();
    const { setPageTitle, setLoadingStatus } = usePageControl();
    const { cardConfiguration:
        {
            pipelineAPI,
            sectionPipelineAPI,
            termPipelineAPI
        }, cardId
    } = useCardInfo();
    const { authenticatedEthosFetch } = useData();
    const customId = 'Roster-Sheet';

    const selected = window.localStorage.getItem('selectedSection');
    const instructorId = window.localStorage.getItem('instructorId');
    const [initialCrn, initialTermCode] = selected ? selected.split('.') : ['', ''];
    const [crn, setCrn] = useState(initialCrn);
    const [termCode, setTermCode] = useState(initialTermCode);

    const [studentList, setStudentList] = useState([]);
    const [waitlistData, setWaitlistData] = useState([]);
    const [criticalDatesData, setCriticalDatesData] = useState([]);
    const [tabChange, setTabChange] = useState(0);

    const [courseName, setCourseName] = useState('');
    const [courseTitle, setCourseTitle] = useState('');
    const [courseSubject, setCourseSubject] = useState('');
    const [courseCredits, setCourseCredits] = useState('');
    const [courseInstructor, setCourseInstructor] = useState('');
    const [courseMeetingTimes, setCourseMeetingTimes] = useState('');
    const [courseBuilding, setCourseBuilding] = useState('');
    const [courseRoom, setCourseRoom] = useState('');
    const [courseMeetingDays, setCourseMeetingDays] = useState('');
    const [courseType, setCourseType] = useState('');
    const [sectionData, setSectionData] = useState([]);
    const [dropdownStateSection, setDropdownStateSection] = useState(selected || '');
    const [terms, setTerms] = useState([]);
    const [dropdownStateTerm, setDropdownStateTerm] = useState(initialTermCode || '');
    const [attendanceData, setAttendanceData] = useState({});
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [alertOpen, setAlertOpen] = useState(false);
    const [includeEmailInPrint, setIncludeEmailInPrint] = useState(false);
    const [showRoster, setShowRoster] = useState(true);
    const [showWaitlist, setShowWaitlist] = useState(true);

    const todayDate = new Date().toLocaleDateString()

    const showAlert = (type, message, durationMs = 3000) => {
        setAlertType(type);
        setAlertMessage(message);
        setAlertOpen(true);
        setTimeout(() => setAlertOpen(false), durationMs);
    };

    const applyCourseInfo = (selectedSection) => {
        const info = extractCourseInfo(selectedSection);
        setCourseName(info.courseName);
        setCourseTitle(info.courseTitle);
        setCourseSubject(info.courseSubject);
        setCourseCredits(info.courseCredits);
        setCourseInstructor(info.courseInstructor);
        setCourseType(info.courseType);
        setCourseMeetingDays(info.courseMeetingDays);
        setCourseMeetingTimes(info.courseMeetingTimes);
        setCourseBuilding(info.courseBuilding);
        setCourseRoom(info.courseRoom);
    };

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const response = await authenticatedEthosFetch(`${termPipelineAPI}?cardId=${cardId}`);
                const termResult = await response.json();
                const termData = termResult.filter(term => term.termDisplayControl == 'Y');
                setTerms(termData);

                const dedupedSections = await fetchDedupedSections(authenticatedEthosFetch, sectionPipelineAPI, cardId, termCode);
                setSectionData(dedupedSections);
                window.localStorage.setItem('sectionData', JSON.stringify(dedupedSections));

                setLoadingStatus(false);
            } catch (error) {
                console.error('Failed to load terms:', error);
                setLoadingStatus(false);
            }
        })();
    }, [authenticatedEthosFetch, cardId, sectionPipelineAPI, setLoadingStatus, termCode, termPipelineAPI]);

    const fetchAuthorizationData = useCallback(async (crn, termCode) => {
        setLoadingStatus(true);
        try {
            const response = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}&instructorId=${instructorId}`);
            const rawResult = await response.json();
            setStudentList(rawResult.attendanceList.filter(student => student.sfrstcr_rsts_code !== 'WL'));
            setWaitlistData(rawResult.attendanceList.filter(student => student.sfrstcr_rsts_code === 'WL'));

            const criticalDatesResponse = await fetch(`https://prod-apiweb.pasadena.edu/api/classSchedule/${termCode}`);
            const rawCriticalDatesResult = await criticalDatesResponse.json();
            rawCriticalDatesResult.filter(crnItem => crnItem.crn === crn).forEach(item => { setCriticalDatesData(item) });

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStatus(false);
        }
    }, [pipelineAPI, cardId, instructorId, authenticatedEthosFetch, setLoadingStatus]);

    const loadAttendanceDataFromDB = async () => {
        try {
            const data = await loadAttendanceData();
            setAttendanceData(data);
        } catch (error) {
            console.error('Failed to load attendance data:', error);
        }
    };

    useEffect(() => {
        setPageTitle("Roster Sheet");
        loadAttendanceDataFromDB();
    }, [setPageTitle]);

    useEffect(() => {
        if (crn && termCode) {
            fetchAuthorizationData(crn, termCode);
        }
    }, [crn, termCode, fetchAuthorizationData]);

    useEffect(() => {
        if (sectionData.length === 0 || !dropdownStateSection) { return; }
        const selectedSection = sectionData.find(sec => sec?.section16?.alternateIds?.[0]?.value === dropdownStateSection);
        if (selectedSection) {
            applyCourseInfo(selectedSection);
        }
    }, [sectionData, dropdownStateSection]);

    const handleTabChange = (event, value) => {
        setTabChange(value);
    }

    const handleChangeTerm = (event) => {
        const { value } = event.target;
        setDropdownStateTerm(value);
        setTermCode(value);
        setDropdownStateSection('');
        setSectionData([]);
        setCrn('');
        setCourseName('');
        setStudentList([]);
        setWaitlistData([]);
        window.localStorage.removeItem('selectedSection');
        setLoadingStatus(true);

        (async () => {
            try {
                const dedupedSections = await fetchDedupedSections(authenticatedEthosFetch, sectionPipelineAPI, cardId, value);
                setSectionData(dedupedSections);
                window.localStorage.setItem('sectionData', JSON.stringify(dedupedSections));
                setLoadingStatus(false);
            } catch (error) {
                console.error(error);
                setLoadingStatus(false);
            }
        })();
    };

    const handleChangeSection = useCallback((event) => {
        const { value } = event.target;
        setDropdownStateSection(value);
        window.localStorage.setItem('selectedSection', value);
        const [newCrn, newTermCode] = value.split('.');
        setCrn(newCrn);
        setTermCode(newTermCode);

        const selectedSection = sectionData.find(sec => sec?.section16?.alternateIds?.[0]?.value === value);
        if (selectedSection) {
            applyCourseInfo(selectedSection);
        }
    }, [sectionData]);

    const checkboxChange = (studentId, isChecked) => {
        const key = `${crn}-${termCode}-${todayDate}`;

        setAttendanceData(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [studentId]: isChecked
            }
        }));
    }

    const saveAttendanceDataToDB = async () => {
        try {
            await saveAttendanceData(attendanceData);
            showAlert('success', 'Attendance data saved successfully!');
        } catch (error) {
            console.error('Failed to save attendance data:', error);
            showAlert('error', 'Failed to save attendance data. Please try again.');
        }
    }

    const handleAlertClose = () => {
        setAlertOpen(false);
    }

    const handleCopyAllEmails = () => {
        const emails = studentList
            ?.map(item => item.student_email)
            .filter(Boolean)
            .join('; ');
        copyToClipboard(emails)
            .then(() => showAlert('success', `${studentList.length} emails copied to clipboard!`, 2000))
            .catch(() => showAlert('error', 'Failed to copy emails.', 2000));
    }

    const handleWaitlistCopyAllEmails = () => {
        const emails = waitlistData
            ?.map(item => item.student_email)
            .filter(Boolean)
            .join('; ');
        copyToClipboard(emails)
            .then(() => showAlert('success', `${waitlistData.length} emails copied to clipboard!`, 2000))
            .catch(() => showAlert('error', 'Failed to copy emails.', 2000));
    }

    const handlePrintBlankSheet = () => {
        printBlankSheet({
            courseName,
            crn,
            courseTitle,
            courseSubject,
            courseCredits,
            courseInstructor,
            courseType,
            courseMeetingDays,
            courseMeetingTimes,
            courseBuilding,
            courseRoom,
            criticalDatesData,
            studentList,
            waitlistData,
            includeEmailInPrint,
            showRoster,
            showWaitlist
        });
    }

    const handleExportToExcel = () => {
        exportRosterToExcel({
            courseName,
            crn,
            courseTitle,
            courseSubject,
            courseCredits,
            courseInstructor,
            courseType,
            courseMeetingDays,
            courseMeetingTimes,
            courseBuilding,
            courseRoom,
            criticalDatesData,
            studentList,
            waitlistData
        });
    }

    return (
        <div className={classes.card}>
            <Alert
                alertType={alertType}
                id={`${customId}_Alert`}
                onClose={handleAlertClose}
                open={alertOpen}
                text={alertMessage}
            />
            <Typography variant="h4" style={{ marginBottom: spacing20 }}>
                Roster Sheet
            </Typography>
            <Typography style={{ marginBottom: spacing40 }}>
                Select a term, then choose a course section to view the roster.
            </Typography>
            <Dropdown
                id={`${customId}_DropdownTerm`}
                label="Select Term"
                onChange={handleChangeTerm}
                value={dropdownStateTerm}
                fullWidth
                className={classes.spacing}
                MenuProps={{
                    disablePortal: true,
                    disableEnforceFocus: true
                }}
            >
                {terms.map(term => (
                    <DropdownItem
                        key={term.termCode}
                        label={term.termName}
                        value={term.termCode}
                    />
                ))}
            </Dropdown>
            {dropdownStateTerm && (
                <Dropdown
                    id={`${customId}_DropdownSection`}
                    label="Select Section"
                    onChange={handleChangeSection}
                    value={dropdownStateSection}
                    fullWidth
                    className={classes.spacing}
                    MenuProps={{
                        disablePortal: true,
                        disableEnforceFocus: true
                    }}
                >
                    {sectionData?.map(sec => {
                        const section = sec?.section16;
                        const course = section?.course16;

                        return (
                            <DropdownItem
                                key={section?.alternateIds?.[0]?.value}
                                label={`CRN: ${section?.code} (${course?.subject6?.abbreviation} ${course?.number})`}
                                value={section?.alternateIds?.[0]?.value}
                            />
                        );
                    })}
                </Dropdown>
            )}
            <Tabs value={tabChange} onChange={handleTabChange} aria-label="Roster Sheet Tabs">
                <Tab label="Student Roster" />
            </Tabs>
            {tabChange === 0 && (
                <RosterContent
                    studentList={studentList}
                    waitlistData={waitlistData}
                    includeEmailInPrint={includeEmailInPrint}
                    setIncludeEmailInPrint={setIncludeEmailInPrint}
                    showRoster={showRoster}
                    setShowRoster={setShowRoster}
                    showWaitlist={showWaitlist}
                    setShowWaitlist={setShowWaitlist}
                    onPrintBlankSheet={handlePrintBlankSheet}
                    onExportToExcel={handleExportToExcel}
                    onCopyAllEmails={handleCopyAllEmails}
                    onCopyWaitlistEmails={handleWaitlistCopyAllEmails}
                />
            )}
        </div>
    );
}

export default HomePage;
