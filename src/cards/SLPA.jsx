import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
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
    TableBody
} from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
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
    loading: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    spacing: {
        marginBottom: spacing40
    }
});

function SLPA({ classes }) {
    const customId = 'SPLA';
    const { configuration:
        {
            microsoftPipelineAPI,
            bannerPipelineAPI,
            SLPAPipelineAPI
        }, cardId
    } = useCardInfo();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const [manualStudentIds, setManualStudentIds] = useState([]);
    const [excelData, setExcelData] = useState([]);
    const [dropdownStateTerm, setDropdownStateTerm] = useState();
    const [dropdownStateTermReview, setDropdownStateTermReview] = useState();
    const [termList, setTermList] = useState([]);
    const [popoverState, setPopoverState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarDuration, setSnackbarDuration] = useState(4000);
    const [studentResults, setStudentResults] = useState([]);
    const [tabChange, setTabChange] = useState(0);
    const [studentData, setStudentData] = useState([]);
    const [dropdownTermMulti, setDropdownTermMulti] = useState([]);
    const [graphLabels, setGraphLabels] = useState([]);
    const [graphData, setGraphData] = useState({});
    const [popOverMsg, setPopOverMsg] = useState();

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const termResult = await getEthosQuery({
                    queryId: 'term-list'
                });
                const termData = (termResult?.data?.academicPeriods?.edges?.map(edge => edge.node));
                setTermList(() => termData);
                const excelResponse = await authenticatedEthosFetch(`${microsoftPipelineAPI}?cardId=${cardId}`);
                const excelResult = await excelResponse.json();
                setExcelData(() => excelResult);
                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

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
                const resonse = await authenticatedEthosFetch(`${SLPAPipelineAPI}?cardId=${cardId}&termCode=${event.target.value}`);
                const data = await resonse.json();
                setStudentData(data);
                setLoadingStatus(false);
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoadingStatus(false);
            }
        };
        fetchData();
    };
    const handleInputChange = (event) => {
        console.log(event)
    }
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
                    authenticatedEthosFetch(`${SLPAPipelineAPI}?cardId=${cardId}&termCode=${termCode}`)
                );
                const results = await Promise.all(promises);

                const counts = await Promise.all(results.map(res => res.json().then(data => data.length)));

                const backgroundColors = counts.map(() =>
                    `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.5)`
                );

                setGraphData(() => ({
                    labels: selectedTitles,
                    datasets: [
                        {
                            data: counts,
                            backgroundColor: backgroundColors
                        }
                    ]
                }));
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
    }

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
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Overrides by Term'
            }
        }
    };
    console.log(manualStudentIds);
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
                                    const newIds = e.target.value.split(',').map(id => id.trim());
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
                            <CircularProgress aria-valuetext="Inserting records..." />
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
                    {studentData.length > 0 && (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>First Name</TableCell>
                                    <TableCell>Last Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentData.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell>{s.id}</TableCell>
                                        <TableCell>{s.firstName}</TableCell>
                                        <TableCell>{s.lastName}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
                        <Bar options={options} data={graphData} />
                    ) : (
                        <Typography>Please select the terms.</Typography>
                    )}

                </div>
            );
        }
    };

    if (termList && excelData) {
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
                        <Tab id={`${customId} _Tab_Applys`} label="Apply" />
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

}

SLPA.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SLPA);