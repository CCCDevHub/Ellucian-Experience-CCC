import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography, Tab, Tabs, Table, TableRow, TableCell, TableBody, TableHead, TextField, Button
} from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
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
import SectionAuthorizationCode from '../cards/SectionAuthorizationCode';


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
            pipelineAPI, postPipelineAPI, putPipelineAPI
        }, cardId
    } = useCardInfo();
    const customId = 'Section-Add-Authorization-Code';

    const [addCodes, setAddCodes] = useState([]);
    const [inputValues, setInputValues] = useState({});
    const [studentWithCodes, setStudentWithCodes] = useState([]);
    const [tabChange, setTabChange] = useState(0);

    const selected = localStorage.getItem('selectedSection');
    const [crn, termCode] = selected ? selected.split('.') : [];
    useEffect(() => {
        setPageTitle("Authorization Code");
    }, []);

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const response = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}`);
                const rawResult = await response.json();
                const result = Array.isArray(rawResult)
                    ? rawResult.filter(item => !('spridenId' in item))
                    : [];
                setAddCodes(() => result);
                const studentHasCode = Array.isArray(rawResult)
                    ? rawResult.filter(item => ('spridenId' in item))
                    : [];
                setStudentWithCodes(() => studentHasCode);
                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    const handleTabChange = (event, value) => {
        setTabChange(() => value);
    }

    const renderContent = () => {
        if (tabChange === 0) {
            if (addCodes.length !== 0) {
                const activeItems = addCodes?.filter(item => item.activeInd === 'Y');
                if (activeItems.length === 0) {
                    return <p>No active authorization codes available.</p>;
                }
                else {


                    return (
                        <div style={{ marginTop: '1rem' }}>
                            <Typography variant="h5">Authorization Codes Available {activeItems.length}</Typography>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell colSpan={4}>
                                            <Typography variant="h6">Authorization Codes</Typography>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Array.from({ length: Math.ceil(activeItems.length / 2) }).map((_, rowIndex) => (
                                        <TableRow key={`row-${rowIndex}`}>
                                            {activeItems.slice(rowIndex * 2, rowIndex * 2 + 2).map((item, colIndex) => (
                                                <React.Fragment key={`col-${colIndex}`}>
                                                    <TableCell>{item.authCde}</TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            id={`${customId}_StudentID_${item.authCde}`}
                                                            label="Student Id"
                                                            name="studentId"
                                                            value={inputValues[item.authCde] || ''}
                                                            onChange={(e) =>
                                                                setInputValues({
                                                                    ...inputValues,
                                                                    [item.authCde]: e.target.value
                                                                })
                                                            }
                                                        />
                                                    </TableCell>
                                                </React.Fragment>
                                            ))}
                                            {Array.from({ length: 2 - activeItems.slice(rowIndex * 2, rowIndex * 2 + 2).length }).flatMap((_, idx) => [
                                                <TableCell key={`empty-code-${idx}`} />,
                                                <TableCell key={`empty-input-${idx}`} />
                                            ])}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <Button
                                style={{ marginTop: '1rem', marginRight: '1rem' }}
                                onClick={async () => {
                                    setLoadingStatus(true);
                                    const entries = Object.entries(inputValues).filter(([_, v]) => v?.trim());

                                    await Promise.all(entries.map(async ([authCde, studentId]) => {
                                        try {
                                            const response = await authenticatedEthosFetch(`${putPipelineAPI}?cardId=${cardId}`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                    "keyTermCode": termCode,
                                                    "criteria.authCde": authCde,
                                                    "keyCrn": crn,
                                                    "activeInd": "Y",
                                                    "spridenId": studentId
                                                })
                                            });
                                            const result = await response.json();
                                        } catch (error) {
                                            console.error('Failed to process:', authCde, error);
                                        }
                                    }));

                                    const refreshed = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}`);
                                    const refreshedResult = await refreshed.json();
                                    const filtered = Array.isArray(refreshedResult)
                                        ? refreshedResult.filter(item => !('spridenId' in item))
                                        : [];
                                    setAddCodes(() => filtered);
                                    const refreshedStudents = Array.isArray(refreshedResult)
                                        ? refreshedResult.filter(item => ('spridenId' in item))
                                        : [];
                                    setStudentWithCodes(() => refreshedStudents);
                                    setLoadingStatus(false);
                                }}
                            >
                                Process
                            </Button>
                            <Button
                                style={{ marginTop: '1rem' }}
                                onClick={async () => {
                                    setLoadingStatus(true);
                                    try {
                                        const response = await authenticatedEthosFetch(`${postPipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}`, {
                                            method: 'POST'
                                        });
                                        const result = await response.json();
                                        const refreshed = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}`);
                                        const refreshedResult = await refreshed.json();
                                        const filtered = Array.isArray(refreshedResult)
                                            ? refreshedResult.filter(item => !('spridenId' in item))
                                            : [];
                                        setAddCodes(() => filtered);
                                        setLoadingStatus(false);
                                    } catch (error) {
                                        console.error('Failed to process:', error);
                                    }
                                }}
                            >
                                Generate Code
                            </Button>
                        </div>
                    )
                }
            } else {
                <div>
                    <h2>Testing</h2>
                </div>
            }
        }
        if (tabChange === 1) {
            return (
                <div style={{ marginTop: '1rem' }}>
                    <Typography variant="h5">Students With Authorization Codes</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><Typography variant="h6">Auth Code</Typography></TableCell>
                                <TableCell><Typography variant="h6">Student ID</Typography></TableCell>
                                <TableCell><Typography variant="h6">Student Name</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {studentWithCodes.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.authCde}</TableCell>
                                    <TableCell>{item.spridenId}</TableCell>
                                    <TableCell>{item.spridenName}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            );
        }
    }



    return (
        <div className={classes.card}>
            <Tabs
                id={`${customId}_Tabs`}
                onChange={handleTabChange}
                value={tabChange}
                variant={"card"}
                className={classes.spacing}
            >
                <Tab id={`${customId}_Tab_Apply`} label="Apply" />
                <Tab id={`${customId}_Tab_History`} label="History" />
            </Tabs>
            {renderContent()}
        </div>
    );


}

HomePage.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);