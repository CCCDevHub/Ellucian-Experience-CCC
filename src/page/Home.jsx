import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography, Tab, Tabs, Table, TableRow, TableCell, TableBody, TableHead, TextField, Button, Dropdown, DropdownItem
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
import SectionAuthorizationCode from '../cards/SectionAuthorizationCode';
import mock from '../data/mock.json';


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
    const customId = 'Section-Add-Authorization-Code';
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    const getWithExpiry = (key) => {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) { return null; }
            const { value, expiry } = JSON.parse(raw);
            if (Date.now() > expiry) {
                localStorage.removeItem(key);
                return null;
            }
            return value;
        } catch {
            return null;
        }
    };

    const setWithExpiry = (key, value) => {
        localStorage.setItem(key, JSON.stringify({ value, expiry: Date.now() + ONE_WEEK_MS }));
    };

    const [addCodes, setAddCodes] = useState([]);
    const [inputValues, setInputValues] = useState({});
    const [studentWithCodes, setStudentWithCodes] = useState([]);
    const [tabChange, setTabChange] = useState(0);

    const selected = getWithExpiry('sac_selectedSection');
    const [initialCrn, initialTermCode] = selected ? selected.split('.') : ['', ''];
    const [crn, setCrn] = useState(initialCrn);
    const [termCode, setTermCode] = useState(initialTermCode);

    const [sectionData, setSectionData] = useState(getWithExpiry('sac_sectionData') || []);
    const [dropdownStateSection, setDropdownStateSection] = useState(selected);
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
                    setWithExpiry('sac_sectionData', dedupedSections);

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
            const result = Array.isArray(rawResult)
                ? rawResult.filter(item => !('spridenId' in item))
                : [];
            setAddCodes(result);
            const studentHasCode = Array.isArray(rawResult)
                ? rawResult.filter(item => ('spridenId' in item))
                : [];
            setStudentWithCodes(studentHasCode);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => {
        setPageTitle("Authorization Code");
    }, []);

    useEffect(() => {
        fetchAuthorizationData(crn, termCode);
    }, [crn, termCode]);

    const handleTabChange = (event, value) => {
        setTabChange(value);
    }

    const handleChangeSection = useCallback((event) => {
        const { value } = event.target;
        setDropdownStateSection(value);
        setWithExpiry('sac_selectedSection', value);
        const [newCrn, newTermCode] = value.split('.');
        setCrn(newCrn);
        setTermCode(newTermCode);
    }, []);

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
                            <div style={{ display: 'flex', gap: '1rem', marginTop: spacing40 }}>
                                <Button
                                    onClick={async () => {
                                        setLoadingStatus(true);
                                        try {
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

                                            await fetchAuthorizationData(crn, termCode);
                                        } catch (error) {
                                            console.error('Failed to process codes:', error);
                                        } finally {
                                            setLoadingStatus(false);
                                        }
                                    }}
                                >
                                    Process
                                </Button>
                                <Button
                                    onClick={async () => {
                                        setLoadingStatus(true);
                                        try {
                                            const response = await authenticatedEthosFetch(`${postPipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}`, {
                                                method: 'POST'
                                            });
                                            const result = await response.json();
                                            await fetchAuthorizationData(crn, termCode);
                                        } catch (error) {
                                            console.error('Failed to generate codes:', error);
                                        } finally {
                                            setLoadingStatus(false);
                                        }
                                    }}
                                >
                                    Generate Codes
                                </Button>
                            </div>
                        </div>
                    )
                }
            } else {
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: spacing40 }}>
                        <Typography>No authorization codes found. Click Generate Codes to create them.</Typography>
                        <div>
                            <Button
                                onClick={async () => {
                                    setLoadingStatus(true);
                                    try {
                                        const response = await authenticatedEthosFetch(`${postPipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}`, {
                                            method: 'POST'
                                        });
                                        await response.json();
                                        await fetchAuthorizationData(crn, termCode);
                                    } catch (error) {
                                        console.error('Failed to generate codes:', error);
                                    } finally {
                                        setLoadingStatus(false);
                                    }
                                }}
                            >
                                Generate Codes
                            </Button>
                        </div>
                    </div>
                );
            }
        }
        if (tabChange === 1) {
            return (
                <div style={{ marginTop: spacing40, marginBottom: spacing40 }}>
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
            <Typography variant="h4" style={{ marginBottom: spacing20 }}>
                Add Authorization Codes
            </Typography>
            <Typography style={{ marginBottom: spacing40 }}>
                Select a course section from the dropdown to generate or assign authorization codes.
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