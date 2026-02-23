import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography, Tab, Tabs, Table, TableRow, TableCell, TableBody, TableHead, TextField, Button, Dropdown, DropdownItem, Checkbox, Alert, IconButton, Tooltip, Switch
} from '@ellucian/react-design-system/core';
import { Icon } from '@ellucian/ds-icons/lib';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    useCache,
    useCardInfo,
    useData,
    useExperienceInfo,
    useExtensionControl,
    useExtensionInfo,
    useThemeInfo,
    useUserInfo,
    useDashboardInfo,
    useCardControl,
    usePageControl,
    usePageInfo
} from '@ellucian/experience-extension-utils';
import Attendance from '../cards/Attendance';
import mock from '../data/mock.json';
import { saveAttendanceData, loadAttendanceData } from '../utils/indexedDB';


const styles = () => ({
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

const HomePage = (props) => {
    const { classes } = props;
    const { setPageTitle, setLoadingStatus } = usePageControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const { cardConfiguration:
        {
            pipelineAPI, postPipelineAPI, putPipelineAPI, sectionPipelineAPI, termPipelineAPI
        }, cardId
    } = useCardInfo();
    const customId = 'Roster-Sheet';

    const selected = localStorage.getItem('selectedSection');
    const [initialCrn, initialTermCode] = selected ? selected.split('.') : ['', ''];
    const [crn, setCrn] = useState(initialCrn);
    const [termCode, setTermCode] = useState(initialTermCode);

    const [studentList, setStudentList] = useState([]);
    const [inputValues, setInputValues] = useState({});
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
    const allowedRsts = new Set(['RC', 'RE', 'RS', 'RW', 'AU']);

    const todayDate = new Date().toLocaleDateString()

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const response = await authenticatedEthosFetch(`${termPipelineAPI}?cardId=${cardId}`);
                const termResult = await response.json();
                const termData = termResult.filter(term => term.termDisplayControl == 'Y');
                setTerms(termData);
                const sectionResponse = await authenticatedEthosFetch(`${sectionPipelineAPI}?cardId=${cardId}&termCode=${termCode}`);
                const sectionResult = await sectionResponse.json();
                // console.log(sectionResult)
                // const sectionResult = await mock;
                const sectionDataResult = (sectionResult?.data?.sectionInstructors10?.edges?.map(edge => edge.node));
                const seen = new Set();
                // console.log(sectionDataResult);

                const dedupedSections = sectionDataResult.filter(sec => {
                    const key = sec?.section16?.alternateIds?.[0]?.value;
                    if (!key || seen.has(key)) { return false }
                    seen.add(key);
                    return true;
                });
                setSectionData(dedupedSections);
                localStorage.setItem('sectionData', JSON.stringify(dedupedSections));

                setLoadingStatus(false);
            } catch (error) {
                console.error('Failed to load terms:', error);
                setLoadingStatus(false);
            }
        })();
    }, []);

    // useEffect(() => {
    //     if (!sectionData || sectionData.length === 0) {
    //         (async () => {
    //             setLoadingStatus(true);
    //             try {
    //                 const response = await authenticatedEthosFetch(`${sectionPipelineAPI}?cardId=${cardId}`);
    //                 const sectionResult = await response.json();
    //                 // const sectionResult = await mock;
    //                 const sectionDataResult = (sectionResult?.data?.sectionInstructors10?.edges?.map(edge => edge.node));
    //                 const seen = new Set();
    //                 const dedupedSections = sectionDataResult.filter(sec => {
    //                     const key = sec?.section16?.alternateIds?.[0]?.value;
    //                     if (!key || seen.has(key)) { return false }
    //                     seen.add(key);
    //                     return true;
    //                 });
    //                 setSectionData(dedupedSections);
    //                 localStorage.setItem('sectionData', JSON.stringify(dedupedSections));

    //                 setLoadingStatus(false);
    //             } catch (error) {
    //                 console.log(error);
    //                 setLoadingStatus(false);
    //             }
    //         })();
    //     }
    // }, []);

    const fetchAuthorizationData = async (crn, termCode) => {
        setLoadingStatus(true);
        try {
            const response = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}`);
            const rawResult = await response.json();
            const studentDataResult = rawResult?.data?.sectionRegistrations16?.edges?.map(edge => edge.node);
            setStudentList(studentDataResult);
            // const studentAvailable = Array.isArray(studentDataResult)
            //     ? studentDataResult.filter(item =>
            //         'spridenId' in item && allowedRsts.has(item.rstsCode)
            //     )
            //         .sort((a, b) => a.spridenCurrName.localeCompare(b.spridenCurrName))
            //     : [];
            // setStudentList(studentAvailable);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        setPageTitle("Roster Sheet");
        loadAttendanceDataFromDB();
    }, []);

    const loadAttendanceDataFromDB = async () => {
        try {
            const data = await loadAttendanceData();
            setAttendanceData(data);
        } catch (error) {
            console.error('Failed to load attendance data:', error);
        }
    };

    useEffect(() => {
        if (crn && termCode) {
            fetchAuthorizationData(crn, termCode);
        }
    }, [crn, termCode]);

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
        localStorage.removeItem('selectedSection');
        setLoadingStatus(true);

        (async () => {
            setLoadingStatus(true);
            try {
                const response = await authenticatedEthosFetch(`${sectionPipelineAPI}?cardId=${cardId}&termCode=${value}`);
                const sectionResult = await response.json();
                // const sectionResult = await mock;
                const sectionDataResult = (sectionResult?.data?.sectionInstructors10?.edges?.map(edge => edge.node));
                const seen = new Set();
                const dedupedSections = sectionDataResult.filter(sec => {
                    const key = sec?.section16?.alternateIds?.[0]?.value;
                    if (!key || seen.has(key)) { return false }
                    seen.add(key);
                    return true;
                });
                setSectionData(dedupedSections);
                localStorage.setItem('sectionData', JSON.stringify(dedupedSections));

                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
                setLoadingStatus(false);
            }
        })();
    };

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
            setAlertType('success');
            setAlertMessage('Attendance data saved successfully!');
            setAlertOpen(true);
            setTimeout(() => setAlertOpen(false), 3000);
        } catch (error) {
            console.error('Failed to save attendance data:', error);
            setAlertType('error');
            setAlertMessage('Failed to save attendance data. Please try again.');
            setAlertOpen(true);
            setTimeout(() => setAlertOpen(false), 3000);
        }
    }

    const handleAlertClose = () => {
        setAlertOpen(false);
    }

    const handleCopyEmail = (email) => {
        navigator.clipboard.writeText(email).then(() => {
            setAlertType('success');
            setAlertMessage('Email copied to clipboard!');
            setAlertOpen(true);
            setTimeout(() => setAlertOpen(false), 2000);
        }).catch(() => {
            setAlertType('error');
            setAlertMessage('Failed to copy email.');
            setAlertOpen(true);
            setTimeout(() => setAlertOpen(false), 2000);
        });
    }

    const handleCopyAllEmails = () => {
        const emails = studentList
            .map(item => item.registrant12?.emails[0]?.address)
            .filter(Boolean)
            .join('; ');
        navigator.clipboard.writeText(emails).then(() => {
            setAlertType('success');
            setAlertMessage(`${studentList.length} emails copied to clipboard!`);
            setAlertOpen(true);
            setTimeout(() => setAlertOpen(false), 2000);
        }).catch(() => {
            setAlertType('error');
            setAlertMessage('Failed to copy emails.');
            setAlertOpen(true);
            setTimeout(() => setAlertOpen(false), 2000);
        });
    }
    // const printAttendanceHistory = () => {
    //     const printContent = document.getElementById('attendance-history-table');

    //     const printWindow = window.open('', '_blank');
    //     printWindow.document.write(`
    //         <html>
    //             <head>
    //                 <title>Attendance History</title>
    //                 <style>
    //                     body { font-family: Arial, sans-serif; margin: 20px; }
    //                     h1 { color: #333; margin-bottom: 20px; }
    //                     table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    //                     th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    //                     th { background-color: #f2f2f2; font-weight: bold; }
    //                     .present { color: green; font-weight: bold; }
    //                     .absent { color: red; font-weight: bold; }
    //                     @media print {
    //                         body { margin: 0; }
    //                         table { page-break-inside: auto; }
    //                         tr { page-break-inside: avoid; page-break-after: auto; }
    //                     }
    //                 </style>
    //             </head>
    //             <body>
    //                 <h1>Attendance History Report</h1>
    //                 <p><strong>Section:</strong> ${courseName}</p>
    //                 <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    //                 ${printContent.outerHTML}
    //             </body>
    //         </html>
    //     `);
    //     printWindow.document.close();
    //     printWindow.focus();
    //     printWindow.print();
    // }

    const printBlankSheet = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Blank Roster Sheet</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                        h1 { color: #333; margin-bottom: 10px; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
                        .course-info {
                            background: #f8f9fa;
                            border: 2px solid #dee2e6;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .info-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 12px 24px;
                            margin-bottom: 12px;
                        }
                        .info-item {
                            display: flex;
                            align-items: baseline;
                            padding: 4px 0;
                        }
                        .info-label {
                            font-weight: bold;
                            color: #495057;
                            min-width: 120px;
                            margin-right: 8px;
                        }
                        .info-value {
                            color: #212529;
                        }
                        .section-header {
                            grid-column: 1 / -1;
                            font-size: 1.1em;
                            font-weight: bold;
                            color: #0066cc;
                            margin-top: 8px;
                            padding-bottom: 4px;
                            border-bottom: 1px solid #dee2e6;
                        }
                        .date-field {
                            margin-top: 15px;
                            padding: 12px;
                            background: white;
                            border: 1px solid #dee2e6;
                            border-radius: 4px;
                        }
                        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; min-height: 40px; }
                        th { background-color: #0066cc; color: white; font-weight: bold; }
                        .empty-cell { height: 40px; }
                        @media print {
                            body { margin: 0; }
                            table { page-break-inside: auto; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                            .course-info { page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Roster Sheet</h1>
                    <div class="course-info">
                        <div class="info-grid">
                            <div class="section-header">Course Information</div>
                            <div class="info-item">
                                <span class="info-label">Section:</span>
                                <span class="info-value">${courseName}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">CRN:</span>
                                <span class="info-value">${crn}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Title:</span>
                                <span class="info-value">${courseTitle}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Subject:</span>
                                <span class="info-value">${courseSubject}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Credits:</span>
                                <span class="info-value">${courseCredits}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Instructor:</span>
                                <span class="info-value">${courseInstructor}</span>
                            </div>
                            <div class="section-header">Schedule & Location</div>
                            <div class="info-item">
                                <span class="info-label">Class Type:</span>
                                <span class="info-value">${courseType}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Meeting Days:</span>
                                <span class="info-value">${courseMeetingDays}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Meeting Times:</span>
                                <span class="info-value">${courseMeetingTimes}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Location:</span>
                                <span class="info-value">${courseBuilding} ${courseRoom}</span>
                            </div>
                        </div>
                        <div class="date-field">
                            <span class="info-label">Date:</span> _______________
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student ID</th>
                                <th>Student Name</th>
                                ${includeEmailInPrint ? '<th>Email</th>' : ''}
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentList.map((student, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${student.registrant12?.credentials[0]?.value}</td>
                                    <td>${student.registrant12?.names.at(-1)?.lastName}, ${student.registrant12?.names.at(-1)?.firstName}</td>
                                    ${includeEmailInPrint ? `<td>${student.registrant12?.emails[0]?.address || ''}</td>` : ''}
                                    <td class="empty-cell"></td>
                                    <td class="empty-cell"></td>
                                    <td class="empty-cell"></td>
                                    <td class="empty-cell"></td>
                                    <td class="empty-cell"></td>
                                    <td class="empty-cell"></td>
                                    <td class="empty-cell"></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }


    const handleChangeSection = useCallback((event) => {
        const { value } = event.target;
        setDropdownStateSection(value);
        localStorage.setItem('selectedSection', value);
        const [newCrn, newTermCode] = value.split('.');
        setCrn(newCrn);
        setTermCode(newTermCode);

        // Set course name for the selected section
        const selectedSection = sectionData.find(sec => sec?.section16?.alternateIds?.[0]?.value === value);
        if (selectedSection) {
            console.log(selectedSection);
            const course = selectedSection.section16?.course16;
            setCourseName(`${course?.subject6?.abbreviation} ${course?.number}`);
            setCourseTitle(selectedSection.section16?.titles?.[0]?.value || '');
            setCourseSubject(course?.subject6?.abbreviation || '');
            setCourseCredits(course?.credits[0]?.minimum || '');
            const instructor = selectedSection.instructor12;
            setCourseInstructor(instructor ? instructor.names[0]?.fullName : '');
            setCourseType(selectedSection?.instructionalMethod6?.title || '');
            setCourseMeetingDays(selectedSection?.instructionalEvents11?.[0]?.recurrence?.repeatRule?.daysOfWeek?.join(', ') || '');
            const startTime = selectedSection?.instructionalEvents11?.[0]?.recurrence?.timePeriod?.startOn || '';
            const endTime = selectedSection?.instructionalEvents11?.[0]?.recurrence?.timePeriod?.endOn || '';
            const meetingTimes = startTime && endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : '';
            const building = selectedSection?.instructionalEvents11?.[0]?.locations?.building?.code || '';
            const room = selectedSection?.instructionalEvents11?.[0]?.locations?.roomNumber || '';
            setCourseMeetingTimes(meetingTimes);
            setCourseBuilding(building);
            setCourseRoom(room);

        }
    }, [sectionData]);


    const formatTime = (isoString) => {
        if (!isoString) { return '' }
        const date = new Date(isoString);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderContent = () => {
        if (tabChange === 0) {
            return (
                <div style={{ marginTop: spacing40, marginBottom: spacing40 }}>
                    <div style={{ marginTop: spacing40, marginBottom: spacing40, display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Button onClick={printBlankSheet} variant="contained" color="primary">
                            Print Weekly Roster
                        </Button>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Switch
                                checked={includeEmailInPrint}
                                onChange={(e) => setIncludeEmailInPrint(e.target.checked)}
                            />
                            <Typography>Include Email</Typography>
                        </div>
                    </div>
                    <Typography variant="h5">Student Roster</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><Typography variant="h6">#</Typography></TableCell>
                                <TableCell><Typography variant="h6">Student ID</Typography></TableCell>
                                <TableCell><Typography variant="h6">Student Name</Typography></TableCell>
                                <TableCell>
                                    <Typography variant="h6" style={{ display: 'inline' }}>Email</Typography>
                                    <Tooltip title="Copy all emails">
                                        <IconButton
                                            size="small"
                                            color="default"
                                            onClick={handleCopyAllEmails}
                                            style={{ marginLeft: '4px', padding: '2px' }}
                                        >
                                            <Icon name="copy" style={{ fontSize: '14px', color: '#666' }} />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                {/* <TableCell><Typography variant="h6">{todayDate}</Typography></TableCell> */}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {studentList.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{item.registrant12?.credentials[0]?.value}</TableCell>
                                    <TableCell>{item.registrant12?.names[0]?.lastName}, {item.registrant12?.names[0]?.firstName}</TableCell>
                                    <TableCell>
                                        {item.registrant12?.emails[0]?.address}
                                        {item.registrant12?.emails[0]?.address && (
                                            <Tooltip title="Copy email">
                                                <IconButton
                                                    size="small"
                                                    color="default"
                                                    onClick={() => handleCopyEmail(item.registrant12?.emails[0]?.address)}
                                                    style={{ marginLeft: '4px', padding: '2px' }}
                                                >
                                                    <Icon name="copy" style={{ fontSize: '14px', color: '#666' }} />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    {/* <TableCell>
                                        <Checkbox
                                            checked={attendanceData[`${crn}-${termCode}-${todayDate}`]?.[item.spridenId] || false}
                                            onChange={(event) => checkboxChange(item.spridenId, event.target.checked)}
                                        />
                                    </TableCell> */}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {/* <div style={{ marginTop: spacing40 }}>
                        <Button onClick={saveAttendanceDataToDB} variant="contained" color="primary">
                            Save Attendance
                        </Button>
                    </div> */}
                </div>
            );
        }
        // if (tabChange === 1) {
        //     const attendanceDates = Object.keys(attendanceData)
        //         .filter(key => key.startsWith(`${crn}-${termCode}-`))
        //         .map(key => key.split('-').slice(2).join('-'))
        //         .sort();

        //     return (
        //         <div style={{ marginTop: spacing40, marginBottom: spacing40 }}>
        //             <Typography variant="h5">Attendance History</Typography>
        //             {attendanceDates.length === 0 ? (
        //                 <div style={{ marginBottom: spacing20, display: 'flex', flexDirection: 'column', gap: spacing20, alignItems: 'flex-start' }}>
        //                     <Typography>No attendance records found.</Typography>
        //                     <Button onClick={printBlankSheet} variant="contained" color="primary">
        //                         Print Blank Sheet
        //                     </Button>
        //                 </div>
        //             ) : (
        //                 <div>
        //                     <div style={{ marginBottom: spacing20, display: 'flex', gap: '16px' }}>
        //                         <Button onClick={printAttendanceHistory} variant="contained" color="primary">
        //                             Print/Save as PDF
        //                         </Button>
        //                         <Button onClick={printBlankSheet} variant="contained" color="primary">
        //                             Print Blank Sheet
        //                         </Button>
        //                     </div>
        //                     <Table id="attendance-history-table">
        //                         <TableHead>
        //                             <TableRow>
        //                                 <TableCell><Typography variant="h6">Student ID</Typography></TableCell>
        //                                 <TableCell><Typography variant="h6">Student Name</Typography></TableCell>
        //                                 {attendanceDates.map(date => (
        //                                     <TableCell key={date}>
        //                                         <Typography variant="h6">{date}</Typography>
        //                                     </TableCell>
        //                                 ))}
        //                             </TableRow>
        //                         </TableHead>
        //                         <TableBody>
        //                             {studentList.map((item, index) => (
        //                                 <TableRow key={index}>
        //                                     <TableCell>{item.spridenId}</TableCell>
        //                                     <TableCell>{item.spridenCurrName}</TableCell>
        //                                     {attendanceDates.map(date => {
        //                                         const key = `${crn}-${termCode}-${date}`;
        //                                         const isPresent = attendanceData[key]?.[item.spridenId];
        //                                         return (
        //                                             <TableCell key={date}>
        //                                                 <Typography className={isPresent ? 'present' : 'absent'}>
        //                                                     {isPresent ? '✓' : '✗'}
        //                                                 </Typography>
        //                                             </TableCell>
        //                                         );
        //                                     })}
        //                                 </TableRow>
        //                             ))}
        //                         </TableBody>
        //                     </Table>
        //                 </div>
        //             )}
        //         </div>
        //     );
        // }
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
                    {sectionData.map(sec => {
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
                {/* <Tab label="Attendance History" /> */}
            </Tabs>
            {renderContent()}
        </div>
    );


}

HomePage.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);