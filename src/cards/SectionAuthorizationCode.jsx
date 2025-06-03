import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink, Dropdown, DropdownItem, Table, TableRow, TableCell, TableBody, TableHead } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Icon } from '@ellucian/ds-icons/lib';

const styles = () => ({
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

function SectionAuthorizationCode({ classes }) {
    const customId = 'Section-Add-Authorization-Code';
    const { configuration:
        {
            pipelineAPI
        }, cardId
    } = useCardInfo();

    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const [sections, setSections] = useState([]);
    const [dropdownSection, setDropdownSection] = useState();
    const [dropdownStateSection, setDropdownStateSection] = useState();
    const [addCodes, setAddCodes] = useState([]);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const todayDate = new Date().toJSON().slice(0, 10);
                // const sectionResult = await getEthosQuery({
                //     queryId: 'section-list', properties: { todayDate: todayDate }
                // });
                const sectionResult = await {
                    "data": {
                        "sectionInstructors": {
                            "edges": [
                                {
                                    "node": {
                                        "id": "667cd958-33bf-43eb-a28f-3873722b81b3",
                                        "instructionalMethod6": {
                                            "title": "Lecture",
                                            "abbreviation": "L"
                                        },
                                        "section16": {
                                            "id": "5b405dad-a431-425f-9982-37d4bdbd452d",
                                            "startOn": "2025-02-18",
                                            "endOn": "2025-04-13",
                                            "code": "34171",
                                            "reportingAcademicPeriod16": {
                                                "code": "202530",
                                                "title": "Spring 2025",
                                                "registration": "open"
                                            },
                                            "maxEnrollment": 25,
                                            "crossListed": "notCrossListed",
                                            "alternateIds": [
                                                {
                                                    "title": "Source Key",
                                                    "value": "34171.202530"
                                                }
                                            ],
                                            "course16": {
                                                "subject6": {
                                                    "abbreviation": "ABE",
                                                    "title": "ADULT BASIC EDUCATION"
                                                },
                                                "number": "3001"
                                            }
                                        },
                                        "instructor12": {
                                            "id": "7fb8ed27-bfb3-4906-83ff-5e2960795f10",
                                            "names": [
                                                {
                                                    "fullName": "Tae Yong Yang"
                                                }
                                            ]
                                        }
                                    }
                                },
                                {
                                    "node": {
                                        "id": "c8205853-ce91-4d22-b25c-911fc627e543",
                                        "instructionalMethod6": {
                                            "title": "DE Online Lecture",
                                            "abbreviation": "OLD"
                                        },
                                        "section16": {
                                            "id": "4cb14d5d-29ba-4f74-90f8-a64b2b007b45",
                                            "startOn": "2025-04-21",
                                            "endOn": "2025-06-15",
                                            "code": "38085",
                                            "reportingAcademicPeriod16": {
                                                "code": "202530",
                                                "title": "Spring 2025",
                                                "registration": "open"
                                            },
                                            "maxEnrollment": 25,
                                            "crossListed": "notCrossListed",
                                            "alternateIds": [
                                                {
                                                    "title": "Source Key",
                                                    "value": "38085.202530"
                                                }
                                            ],
                                            "course16": {
                                                "subject6": {
                                                    "abbreviation": "AHSD",
                                                    "title": "ADULT HIGH SCHOOL DIPLOMA"
                                                },
                                                "number": "6402"
                                            }
                                        },
                                        "instructor12": {
                                            "id": "7fb8ed27-bfb3-4906-83ff-5e2960795f10",
                                            "names": [
                                                {
                                                    "fullName": "Tae Yong Yang"
                                                }
                                            ]
                                        }
                                    }
                                },
                                {
                                    "node": {
                                        "id": "5520e14c-cd4c-49c2-8109-30a84443db52",
                                        "instructionalMethod6": {
                                            "title": "DE Online Lecture",
                                            "abbreviation": "OLD"
                                        },
                                        "section16": {
                                            "id": "4cb14d5d-29ba-4f74-90f8-a64b2b007b45",
                                            "startOn": "2025-04-21",
                                            "endOn": "2025-06-15",
                                            "code": "38085",
                                            "reportingAcademicPeriod16": {
                                                "code": "202530",
                                                "title": "Spring 2025",
                                                "registration": "open"
                                            },
                                            "maxEnrollment": 25,
                                            "crossListed": "notCrossListed",
                                            "alternateIds": [
                                                {
                                                    "title": "Source Key",
                                                    "value": "38085.202530"
                                                }
                                            ],
                                            "course16": {
                                                "subject6": {
                                                    "abbreviation": "AHSD",
                                                    "title": "ADULT HIGH SCHOOL DIPLOMA"
                                                },
                                                "number": "6402"
                                            }
                                        },
                                        "instructor12": {
                                            "id": "7fb8ed27-bfb3-4906-83ff-5e2960795f10",
                                            "names": [
                                                {
                                                    "fullName": "Tae Yong Yang"
                                                }
                                            ]
                                        }
                                    }
                                },
                                {
                                    "node": {
                                        "id": "d1a76677-dddf-4665-8597-d48c584e6c9a",
                                        "instructionalMethod6": {
                                            "title": "Lecture",
                                            "abbreviation": "L"
                                        },
                                        "section16": {
                                            "id": "e6288f67-babc-416c-9c27-7becdae85c91",
                                            "startOn": "2025-04-21",
                                            "endOn": "2025-06-15",
                                            "code": "39140",
                                            "reportingAcademicPeriod16": {
                                                "code": "202530",
                                                "title": "Spring 2025",
                                                "registration": "open"
                                            },
                                            "maxEnrollment": 25,
                                            "crossListed": "notCrossListed",
                                            "alternateIds": [
                                                {
                                                    "title": "Source Key",
                                                    "value": "39140.202530"
                                                }
                                            ],
                                            "course16": {
                                                "subject6": {
                                                    "abbreviation": "ABE",
                                                    "title": "ADULT BASIC EDUCATION"
                                                },
                                                "number": "3001"
                                            }
                                        },
                                        "instructor12": {
                                            "id": "7fb8ed27-bfb3-4906-83ff-5e2960795f10",
                                            "names": [
                                                {
                                                    "fullName": "Tae Yong Yang"
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
                const sectionData = (sectionResult?.data?.sectionInstructors?.edges?.map(edge => edge.node));
                setSections(() => sectionData);
                // const excelResponse = await authenticatedEthosFetch(`${microsoftPipelineAPI}?cardId=${cardId}`);
                // const excelResult = await excelResponse.json();
                // setExcelData(() => excelResult);
                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    const handleChangeSection = async (event) => {
        const { value } = event.target;
        setDropdownStateSection(value);
        setLoadingStatus(true);

        const [crn, termCode] = value?.split('.') ?? [];

        try {
            const response = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&crn=${crn}&termCode=${termCode}`);
            const result = await response.json();
            setAddCodes(() => result);
            setLoadingStatus(false);

        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    const codeList = () => {
        if (addCodes.length !== 0) {
            const activeItems = addCodes?.filter(item => item.activeInd === 'Y');

            if (activeItems.length === 0) {
                return <p>No active authorization codes available.</p>;
            }

            const rows = [];
            for (let i = 0; i < activeItems.length; i += 3) {
                rows.push(activeItems.slice(i, i + 3));
            }

            const handleCopy = (code) => {
                navigator.clipboard.writeText(code).then(() => {
                    setCopiedCode(code);
                    setTimeout(() => setCopiedCode(null), 1500);
                });
            };

            return (
                <div style={{ marginTop: '1rem' }}>
                    <Typography variant="h5">Authorization Codes ({activeItems.length})</Typography>
                    <Table>
                        <TableBody>
                            {rows.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {row.map((item, colIndex) => (
                                        <TableCell
                                            key={colIndex}
                                            onClick={() => handleCopy(item.authCde)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: copiedCode === item.authCde ? '#e0ffe0' : 'transparent',
                                                fontWeight: copiedCode === item.authCde ? 'bold' : 'normal',
                                                textAlign: 'center',
                                                transition: 'background-color 0.3s'
                                            }}
                                        >
                                            {copiedCode === item.authCde ? 'Copied!' : item.authCde}
                                        </TableCell>
                                    ))}
                                    {Array.from({ length: 3 - row.length }).map((_, fillerIndex) => (
                                        <TableCell key={`filler-${fillerIndex}`} />
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            );
        }

        return null;
    };



    if (sections) {
        const seen = new Set();
        const dedupedSections = sections.filter(sec => {
            const key = sec?.section16?.alternateIds?.[0]?.value;
            if (!key || seen.has(key)) { return false }
            seen.add(key);
            return true;
        });

        return (
            <div className={classes.card}>
                <Dropdown
                    id={`${customId}_DropdownSection`}
                    label="Select Section"
                    onChange={handleChangeSection}
                    value={dropdownStateSection}
                    fullWidth
                    className={classes.spacing}
                >
                    {dedupedSections.map(sec => {
                        const section = sec?.section16;
                        const course = section?.course16;
                        const subject = course?.subject6;

                        return (
                            <DropdownItem
                                key={section?.alternateIds?.[0]?.value}
                                label={`CRN: ${section?.code} (${subject?.abbreviation} ${course?.number})`}
                                value={section?.alternateIds?.[0]?.value}
                            />
                        );
                    })}
                </Dropdown>
                {codeList()}
            </div>
        );
    }

}



SectionAuthorizationCode.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SectionAuthorizationCode);