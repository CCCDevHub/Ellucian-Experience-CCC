import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography, Tab, Tabs, Table, TableRow, TableCell, TableBody, TableHead, TextField, Button, Dropdown, DropdownItem, Checkbox, Alert
} from '@ellucian/react-design-system/core';
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
            pipelineAPI, postPipelineAPI, putPipelineAPI, sectionPipelineAPI
        }, cardId
    } = useCardInfo();
    const customId = 'Attendance-Tracking';

    const [studentList, setStudentList] = useState([]);
    const [inputValues, setInputValues] = useState({});
    const [tabChange, setTabChange] = useState(0);

    const selected = localStorage.getItem('selectedSection');
    const [initialCrn, initialTermCode] = selected ? selected.split('.') : ['', ''];
    const [crn, setCrn] = useState(initialCrn);
    const [termCode, setTermCode] = useState(initialTermCode);
    const [courseName, setCourseName] = useState('');
    const [sectionData, setSectionData] = useState(JSON.parse(localStorage.getItem('sectionData') || '[]'));
    const [dropdownStateSection, setDropdownStateSection] = useState(selected);
    const [attendanceData, setAttendanceData] = useState({});
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [alertOpen, setAlertOpen] = useState(false);

    const todayDate = new Date().toLocaleDateString()


    useEffect(() => {
        if (!sectionData || sectionData.length === 0) {
            (async () => {
                setLoadingStatus(true);
                try {
                    const response = await authenticatedEthosFetch(`${sectionPipelineAPI}?cardId=${cardId}`);
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
        }
    }, []);
    const fetchAuthorizationData = async (crn, termCode) => {
        setLoadingStatus(true);
        try {
            const response = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}`);
            const rawResult = await response.json();
            const studentAvailable = Array.isArray(rawResult)
                ? rawResult.filter(item => ('spridenId' in item))
                : [];
            setStudentList(studentAvailable);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        setPageTitle("Attendance Tracking");
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
        fetchAuthorizationData(crn, termCode);
    }, [crn, termCode]);

    const handleTabChange = (event, value) => {
        setTabChange(value);
    }
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
    const printAttendanceHistory = () => {
        const printContent = document.getElementById('attendance-history-table');

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Attendance History</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; margin-bottom: 20px; }
                        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .present { color: green; font-weight: bold; }
                        .absent { color: red; font-weight: bold; }
                        @media print {
                            body { margin: 0; }
                            table { page-break-inside: auto; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Attendance History Report</h1>
                    <p><strong>Section:</strong> ${courseName}</p>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                    ${printContent.outerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    const printBlankSheet = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Blank Attendance Sheet</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; margin-bottom: 20px; }
                        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; min-height: 40px; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                        .empty-cell { height: 40px; }
                        @media print {
                            body { margin: 0; }
                            table { page-break-inside: auto; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Attendance Sheet</h1>
                    <p><strong>Section:</strong> ${courseName}</p>
                    <p><strong>Date:</strong> _______________</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Student Name</th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentList.map(student => `
                                <tr>
                                    <td>${student.spridenId}</td>
                                    <td>${student.spridenCurrName}</td>
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
            const course = selectedSection.section16?.course16;
            setCourseName(`${course?.subject6?.abbreviation} ${course?.number}`);
        }
    }, [sectionData]);

    const renderContent = () => {
        if (tabChange === 0) {
            return (
                <div style={{ marginTop: spacing40, marginBottom: spacing40 }}>
                    <Typography variant="h5">Students With Attendance Tracking</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><Typography variant="h6">Student ID</Typography></TableCell>
                                <TableCell><Typography variant="h6">Student Name</Typography></TableCell>
                                <TableCell><Typography variant="h6">{todayDate}</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {studentList.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.spridenId}</TableCell>
                                    <TableCell>{item.spridenCurrName}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={attendanceData[`${crn}-${termCode}-${todayDate}`]?.[item.spridenId] || false}
                                            onChange={(event) => checkboxChange(item.spridenId, event.target.checked)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div style={{ marginTop: spacing40 }}>
                        <Button onClick={saveAttendanceDataToDB} variant="contained" color="primary">
                            Save Attendance
                        </Button>
                    </div>
                </div>
            );
        }
        if (tabChange === 1) {
            const attendanceDates = Object.keys(attendanceData)
                .filter(key => key.startsWith(`${crn}-${termCode}-`))
                .map(key => key.split('-').slice(2).join('-'))
                .sort();

            return (
                <div style={{ marginTop: spacing40, marginBottom: spacing40 }}>
                    <Typography variant="h5">Attendance History</Typography>
                    {attendanceDates.length === 0 ? (
                        <div style={{ marginBottom: spacing20, display: 'flex', flexDirection: 'column', gap: spacing20, alignItems: 'flex-start' }}>
                            <Typography>No attendance records found.</Typography>
                            <Button onClick={printBlankSheet} variant="contained" color="primary">
                                Print Blank Sheet
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div style={{ marginBottom: spacing20, display: 'flex', gap: '16px' }}>
                                <Button onClick={printAttendanceHistory} variant="contained" color="primary">
                                    Print/Save as PDF
                                </Button>
                                <Button onClick={printBlankSheet} variant="contained" color="primary">
                                    Print Blank Sheet
                                </Button>
                            </div>
                            <Table id="attendance-history-table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><Typography variant="h6">Student ID</Typography></TableCell>
                                        <TableCell><Typography variant="h6">Student Name</Typography></TableCell>
                                        {attendanceDates.map(date => (
                                            <TableCell key={date}>
                                                <Typography variant="h6">{date}</Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studentList.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.spridenId}</TableCell>
                                            <TableCell>{item.spridenCurrName}</TableCell>
                                            {attendanceDates.map(date => {
                                                const key = `${crn}-${termCode}-${date}`;
                                                const isPresent = attendanceData[key]?.[item.spridenId];
                                                return (
                                                    <TableCell key={date}>
                                                        <Typography className={isPresent ? 'present' : 'absent'}>
                                                            {isPresent ? '✓' : '✗'}
                                                        </Typography>
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            );
        }
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
                Attendance Tracking
            </Typography>
            <Typography style={{ marginBottom: spacing40 }}>
                Select a course section from the dropdown to track students attendance.
            </Typography>
            <Dropdown
                id={`${customId}_DropdownSection`}
                label="Select Section"
                onChange={handleChangeSection}
                value={dropdownStateSection}
                fullWidth
                className={classes.spacing}
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
            <Tabs value={tabChange} onChange={handleTabChange} aria-label="Attendance Tracking Tabs">
                <Tab label="Students With Attendance Tracking" />
                <Tab label="Attendance History" />
            </Tabs>
            {renderContent()}
        </div>
    );


}

HomePage.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);