import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Typography,
    TextLink,
    TextField,
    Button,
    Dropdown,
    DropdownItem,
    Popover,
    CircularProgress,
    Snackbar,
    Tab,
    Tabs,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Checkbox
} from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
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
import { Icon } from '@ellucian/ds-icons/lib';
import { Chip, IconButton } from '@ellucian/react-design-system/core';
import { Cancel } from '@ellucian/ds-icons/lib';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

const styles = () => ({
    card: {
        height: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column'
    },
    content: {
        height: '100%',
        margin: 0,
        padding: spacing20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        overflow: 'hidden'
    },
    spacing: {
        marginBottom: spacing40
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing20,
        marginBottom: spacing20,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.1)'
    },
    loadingText: {
        marginTop: spacing20,
        color: '#666',
        fontSize: '14px'
    }
});
const HomePage = (props) => {
    const { classes } = props;
    const { setPageTitle, setLoadingStatus, setErrorMessage } = usePageControl();
    const customId = 'SPLA';
    const { cardConfiguration:
        {
            bannerPipelineAPI,
            SLPAPipelineAPI,
            SLPACountPipelineAPI
        }, cardId
    } = useCardInfo();
    console.log(bannerPipelineAPI, SLPAPipelineAPI, SLPACountPipelineAPI, cardId);

    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const [manualStudentIds, setManualStudentIds] = useState([]);
    const [dropdownStateTerm, setDropdownStateTerm] = useState(localStorage.getItem('selectedTerm'));
    const [dropdownStateTermReview, setDropdownStateTermReview] = useState();
    const [dropdownStateTermRemove, setDropdownStateTermRemove] = useState();
    const [popoverState, setPopoverState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarDuration, setSnackbarDuration] = useState(4000);
    const [studentResults, setStudentResults] = useState([]);
    const [tabChange, setTabChange] = useState(0);
    const [studentData, setStudentData] = useState([]);
    const [studentDataRemove, setStudentDataRemove] = useState([]);
    const [selectedStudentsForRemoval, setSelectedStudentsForRemoval] = useState([]);
    const [loadingRemove, setLoadingRemove] = useState(false);
    const [dropdownTermMulti, setDropdownTermMulti] = useState([]);
    const [graphLabels, setGraphLabels] = useState([]);
    const [graphData, setGraphData] = useState({});
    const [popOverMsg, setPopOverMsg] = useState();
    const termList = JSON.parse(localStorage.getItem('termList') || '[]');

    useEffect(() => {
        setPageTitle("Student Registration Permit Override");
    }, [setPageTitle]);

    const handleClick = async (event) => {
        if (!dropdownStateTerm) {
            setPopoverState(event.currentTarget);
            return;
        }

        if (manualStudentIds.length === 0) {
            setPopoverState(event.currentTarget);
            setPopOverMsg('Please enter at least one Student ID.');
            return;
        }

        setLoading(true);
        setSnackbarDuration(4000);

        try {
            const results = await Promise.allSettled(
                manualStudentIds.map(stuId =>
                    authenticatedEthosFetch(`${bannerPipelineAPI}?cardId=${cardId}&termCode=${dropdownStateTerm}&studentId=${stuId}`)
                        .then(() => ({ id: stuId, status: 'success' }))
                        .catch(() => ({ id: stuId, status: 'failure' }))
                )
            );

            const statusArray = results.map(result => (
                result.status === 'fulfilled' ? result.value : { id: '', status: 'failure' }
            ));
            setStudentResults(statusArray);
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error fetching data: ', error);
            setErrorMessage('Failed to apply overrides for one or more students.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangeTerm = (event) => {
        setDropdownStateTerm(() => event.target.value);
    };

    const handleChangeTermReview = (event) => {
        setDropdownStateTermReview(() => event.target.value);
        const fetchData = async () => {
            try {
                setLoadingStatus(true);
                const response = await authenticatedEthosFetch(`${SLPAPipelineAPI}?cardId=${cardId}&termCode=${event.target.value}`);
                const data = await response.json();
                setStudentData(data);
                setLoadingStatus(false);
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoadingStatus(false);
            }
        };
        fetchData();
    };

    const handleChangeTermRemove = (event) => {
        setDropdownStateTermRemove(() => event.target.value);
        const fetchData = async () => {
            try {
                setLoadingStatus(true);
                const response = await authenticatedEthosFetch(`${SLPAPipelineAPI}?cardId=${cardId}&termCode=${event.target.value}`);
                const data = await response.json();
                setStudentDataRemove(data);
                setSelectedStudentsForRemoval([]);
                setLoadingStatus(false);
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoadingStatus(false);
            }
        };
        fetchData();
    };

    const handleChangeTermMulti = (event) => {
        const selectedValues = event.target.value;
        setDropdownTermMulti(() => selectedValues);

        const selectedTitles = termList
            .filter(term => selectedValues.includes(term.code))
            .map(term => term.title);


        const fetchData = async () => {
            try {
                setLoadingStatus(true);
                const promises = selectedValues.map(termCode =>
                    authenticatedEthosFetch(`${SLPACountPipelineAPI}?cardId=${cardId}&termCode=${termCode}`)
                        .then(response => response.json())
                );

                const results = await Promise.all(promises);

                const allCourses = new Set();
                results.forEach(termData => {
                    termData.forEach(record => allCourses.add(record.course));
                });

                const labels = Array.from(allCourses);
                const datasets = results.map((termData, index) => {
                    const termCode = selectedValues[index];
                    const termTitle = termList.find(t => t.code === termCode)?.title || termCode;

                    const dataMap = {};
                    termData.forEach(({ course, total }) => {
                        dataMap[course] = parseInt(total, 10);
                    });

                    const data = labels.map(course => dataMap[course] || 0);

                    const backgroundColor = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`;

                    return {
                        label: termTitle,
                        data,
                        backgroundColor
                    };
                });

                setGraphData({
                    labels,
                    datasets
                });

                setLoadingStatus(false);
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoadingStatus(false);
            }
        };

        fetchData();
    };
    const popoverHandleClose = () => {
        setPopoverState(null);
    };
    const snackbarClose = () => {
        setSnackbarOpen(false);
    };
    const handleTabChange = (event, value) => {
        setTabChange(() => value);
    };

    const handleSelectStudent = (studentId) => {
        setSelectedStudentsForRemoval(prev => {
            if (prev.includes(studentId)) {
                return prev.filter(id => id !== studentId);
            } else {
                return [...prev, studentId];
            }
        });
    };

    const handleSelectAllStudents = (checked) => {
        if (checked) {
            setSelectedStudentsForRemoval(studentDataRemove.map(s => s.id));
        } else {
            setSelectedStudentsForRemoval([]);
        }
    };

    const handleRemoveSelected = async () => {
        if (selectedStudentsForRemoval.length === 0) { return; }

        setLoadingRemove(true);
        try {
            const results = await Promise.allSettled(
                selectedStudentsForRemoval.map(stuId =>
                    authenticatedEthosFetch(`${bannerPipelineAPI}/remove?cardId=${cardId}&termCode=${dropdownStateTermRemove}&studentId=${stuId}`, {
                        method: 'DELETE'
                    })
                        .then(() => ({ id: stuId, status: 'success' }))
                        .catch(() => ({ id: stuId, status: 'failure' }))
                )
            );

            const statusArray = results.map(result => (
                result.status === 'fulfilled' ? result.value : { id: '', status: 'failure' }
            ));

            setStudentResults(statusArray);
            setSnackbarOpen(true);

            // Refresh the data after removal
            if (dropdownStateTermRemove) {
                const response = await authenticatedEthosFetch(`${SLPAPipelineAPI}?cardId=${cardId}&termCode=${dropdownStateTermRemove}`);
                const data = await response.json();
                setStudentDataRemove(data);
            }

            setSelectedStudentsForRemoval([]);
        } catch (error) {
            console.error('Error removing overrides: ', error);
            setErrorMessage('Failed to remove overrides for one or more students.');
        } finally {
            setLoadingRemove(false);
        }
    };

    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
    );
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            title: {
                display: true,
                text: 'Overrides by Term'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0
                }
            }
        }
    };

    const renderTabContent = () => {
        if (tabChange === 0) {
            return (
                <div>
                    <div>
                        <Dropdown
                            id={`${customId} _DropdownTerm`}
                            label={'Select Term'}
                            onChange={handleChangeTerm}
                            value={dropdownStateTerm}
                            fullWidth
                            className={classes.spacing}
                        >
                            {termList.map(term => (
                                <DropdownItem
                                    key={term.code}
                                    label={term.title}
                                    value={term.code}
                                />
                            ))}
                        </Dropdown>
                    </div>
                    <div>
                        <TextField
                            id={`${customId}_StudentIds`}
                            label="Enter Student IDs"
                            placeholder="Enter student ID and press Enter"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const newIds = e.target.value.split(' ').map(id => id.trim());
                                    const validNewIds = newIds.filter(id => (/^\d{8}$/).test(id) && !manualStudentIds.includes(id));
                                    if (validNewIds.length > 0) {
                                        setManualStudentIds([...manualStudentIds, ...validNewIds]);
                                    }
                                    e.target.value = '';
                                }
                            }}
                            fullWidth
                            className={classes.spacing}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: spacing40 }}>
                            {manualStudentIds.map((id) => (
                                <Chip
                                    key={id}
                                    label={id}
                                    onDelete={() => setManualStudentIds(manualStudentIds.filter(item => item !== id))}
                                />
                            ))}
                        </div>
                    </div>

                    {loading && (
                        <div className={classes.loading}>
                            <CircularProgress aria-valuetext="Inserting records..." size={40} />
                            <Typography className={classes.loadingText}>
                                Applying overrides...
                            </Typography>
                        </div>
                    )}

                    <div>
                        <Button
                            id={`${customId} _Button`}
                            color="primary"
                            fluid
                            size="default"
                            onClick={(event) => handleClick(event)}
                            variant="contained"
                            disabled={loading}
                        >
                            Apply
                        </Button>
                        <Popover
                            id={`${customId} _Popover`}
                            open={Boolean(popoverState)}
                            anchorEl={popoverState}
                            onClose={popoverHandleClose}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                            PaperProps={{
                                style: {
                                    padding: '12px 16px',
                                    backgroundColor: '#fef3c7',
                                    border: '1px solid #fcd34d',
                                    borderRadius: '4px',
                                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            <Typography id={`${customId} _PopoverText`} variant="body2" color="textPrimary">
                                {popOverMsg || 'Please select term.'}
                            </Typography>
                        </Popover>
                        {studentResults.length > 0 && (
                            <Snackbar
                                open={snackbarOpen}
                                variant={studentResults.some(r => r.status === 'failure') ? 'error' : 'success'}
                                message={
                                    studentResults.some(r => r.status === 'failure')
                                        ? `Failed to override for: ${studentResults.filter(r => r.status === 'failure').map(r => r.id).join(', ')}`
                                        : `Successfully overridden for: ${studentResults.map(r => r.id).join(', ')}`
                                }
                                autoHideDuration={snackbarDuration}
                                onClose={snackbarClose}
                            />
                        )}
                    </div>
                </div>
            );
            // } else if (tabChange === 1) {
            //     return (
            //         <div>
            //             <Dropdown
            //                 id={`${customId} _DropdownTermRemove`}
            //                 label={'Select Term'}
            //                 onChange={handleChangeTermRemove}
            //                 value={dropdownStateTermRemove}
            //                 fullWidth
            //                 className={classes.spacing}
            //             >
            //                 {termList.map(term => (
            //                     <DropdownItem
            //                         key={term.code}
            //                         label={term.title}
            //                         value={term.code}
            //                     />
            //                 ))}
            //             </Dropdown>
            //             {studentDataRemove.length === 0 && dropdownStateTermRemove !== undefined ? (
            //                 <Typography>No override found for this term.</Typography>
            //             ) : (
            //                 <div style={{
            //                     overflowY: 'auto',
            //                     flex: 1,
            //                     paddingTop: '8px',
            //                     width: '100%',
            //                     maxHeight: 'calc(100vh - 200px)',
            //                     border: '1px solid #e0e0e0',
            //                     borderRadius: '4px'
            //                 }}>
            //                     <Table style={{ width: '100%' }}>
            //                         <TableHead>
            //                             <TableRow>
            //                                 <TableCell style={{ width: '10%', minWidth: '60px' }}>
            //                                     <Checkbox
            //                                         checked={selectedStudentsForRemoval.length === studentDataRemove.length && studentDataRemove.length > 0}
            //                                         indeterminate={selectedStudentsForRemoval.length > 0 && selectedStudentsForRemoval.length < studentDataRemove.length}
            //                                         onChange={(e) => handleSelectAllStudents(e.target.checked)}
            //                                     />
            //                                 </TableCell>
            //                                 <TableCell style={{ width: '20%', minWidth: '100px' }}>ID</TableCell>
            //                                 <TableCell style={{ width: '35%', minWidth: '150px' }}>First Name</TableCell>
            //                                 <TableCell style={{ width: '35%', minWidth: '150px' }}>Last Name</TableCell>
            //                             </TableRow>
            //                         </TableHead>
            //                         <TableBody>
            //                             {studentDataRemove.map(s => (
            //                                 <TableRow key={s.id}>
            //                                     <TableCell style={{ width: '10%' }}>
            //                                         <Checkbox
            //                                             checked={selectedStudentsForRemoval.includes(s.id)}
            //                                             onChange={() => handleSelectStudent(s.id)}
            //                                         />
            //                                     </TableCell>
            //                                     <TableCell style={{ width: '20%', wordBreak: 'break-word' }}>{s.id}</TableCell>
            //                                     <TableCell style={{ width: '35%', wordBreak: 'break-word' }}>{s.firstName}</TableCell>
            //                                     <TableCell style={{ width: '35%', wordBreak: 'break-word' }}>{s.lastName}</TableCell>
            //                                 </TableRow>
            //                             ))}
            //                         </TableBody>
            //                     </Table>
            //                 </div>
            //             )}

            //             {studentDataRemove.length > 0 && (
            //                 <div style={{ marginTop: spacing20, display: 'flex', flexDirection: 'column', gap: spacing20 }}>
            //                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            //                         <Typography variant="body2" color="textSecondary">
            //                             {selectedStudentsForRemoval.length} of {studentDataRemove.length} students selected
            //                         </Typography>
            //                         <Button
            //                             color="secondary"
            //                             variant="contained"
            //                             onClick={handleRemoveSelected}
            //                             disabled={selectedStudentsForRemoval.length === 0 || loadingRemove}
            //                             size="medium"
            //                         >
            //                             Remove Selected ({selectedStudentsForRemoval.length})
            //                         </Button>
            //                     </div>

            //                     {loadingRemove && (
            //                         <div className={classes.loading}>
            //                             <CircularProgress size={40} />
            //                             <Typography className={classes.loadingText}>
            //                                 Removing overrides...
            //                             </Typography>
            //                         </div>
            //                     )}
            //                 </div>
            //             )}
            //         </div>
            //     );
        } else if (tabChange === 1) {
            return (
                <div>
                    <Dropdown
                        id={`${customId} _DropdownTermReview`}
                        label={'Select Term'}
                        onChange={handleChangeTermReview}
                        value={dropdownStateTermReview}
                        fullWidth
                        className={classes.spacing}
                    >
                        {termList.map(term => (
                            <DropdownItem
                                key={term.code}
                                label={term.title}
                                value={term.code}
                            />
                        ))}
                    </Dropdown>
                    {studentData.length === 0 && dropdownStateTermReview !== undefined ? (
                        <Typography>No override history found for this term.</Typography>
                    ) : (
                        <div style={{
                            overflowY: 'auto',
                            flex: 1,
                            paddingTop: '8px',
                            width: '100%',
                            maxHeight: 'calc(100vh - 200px)',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px'
                        }}>
                            <Table style={{ width: '100%' }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ width: '20%', minWidth: '100px' }}>ID</TableCell>
                                        <TableCell style={{ width: '40%', minWidth: '150px' }}>First Name</TableCell>
                                        <TableCell style={{ width: '40%', minWidth: '150px' }}>Last Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studentData.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell style={{ width: '20%', wordBreak: 'break-word' }}>{s.id}</TableCell>
                                            <TableCell style={{ width: '40%', wordBreak: 'break-word' }}>{s.firstName}</TableCell>
                                            <TableCell style={{ width: '40%', wordBreak: 'break-word' }}>{s.lastName}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div>
                    <Dropdown
                        id={`${customId} _DropdownTermMulti`}
                        label={'Select Terms'}
                        onChange={handleChangeTermMulti}
                        value={dropdownTermMulti}
                        fullWidth
                        className={classes.spacing}
                        multiple
                    >
                        {termList.map(term => (
                            <DropdownItem
                                key={term.code}
                                label={term.title}
                                value={term.code}
                                name={term.title}
                            />
                        ))}
                    </Dropdown>
                    {graphData?.labels && graphData?.datasets ? (
                        <div style={{
                            width: '100%',
                            height: 'calc(100vh - 300px)',
                            maxHeight: '500px',
                            minHeight: '300px',
                            padding: spacing20,
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            backgroundColor: '#fafafa'
                        }}>
                            <Bar options={options} data={graphData} />
                        </div>
                    ) : (
                        <Typography>Please select the terms.</Typography>
                    )}

                </div>
            );
        }
    };

    if (termList) {
        return (
            <div className={classes.card}>
                <div className={classes.content}>
                    <Tabs
                        id={`${customId} _Tabs`}
                        onChange={handleTabChange}
                        value={tabChange}
                        variant={"card"}
                        className={classes.spacing}
                    >
                        <Tab id={`${customId} _Tab_Apply`} label="Apply Override" />
                        {/* <Tab id={`${customId} _Tab_Remove`} label="Remove Override" /> */}
                        <Tab id={`${customId} _Tab_History`} label="History" />
                        <Tab id={`${customId} _Tab_Summary`} label="Summary" />
                    </Tabs>
                    {renderTabContent()}
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <Typography className={classes.message} variant="body1" component="div">
                    {`Something wrong`}
                </Typography>
            </div>
        );
    }
};

HomePage.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);