import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink, Dropdown, DropdownItem, Table, TableRow, TableCell, TableBody, TableHead, TextField } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo, useCache } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Icon } from '@ellucian/ds-icons/lib';
import mock from '../data/mock.json';

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
    const { cardId } = useCardInfo();
    const { setLoadingStatus, setErrorMessage, navigateToPage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const { getItem, storeItem, removeItem } = useCache();

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
                const sectionResult = await mock;
                const sectionData = (sectionResult?.data?.sectionInstructors?.edges?.map(edge => edge.node));
                setSections(() => sectionData);

                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    const handleChangeSection = (event) => {
        const { value } = event.target;
        setDropdownStateSection(value);
        setLoadingStatus(true);

        localStorage.setItem('selectedSection', value);
        navigateToPage({
            route: `/section-authorization-code`
        });
        setLoadingStatus(false);

    };

    const codeList = () => {
        if (addCodes.length !== 0) {
            const activeItems = addCodes?.filter(item => item.activeInd === 'Y');
            if (activeItems.length === 0) {
                return <p>No active authorization codes available.</p>;
            }

            return (
                <div style={{ marginTop: '1rem' }}>
                    <Typography variant="h5">Authorization Codes ({activeItems.length})</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Add Code</TableCell>
                                <TableCell>Student ID</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {activeItems.map((item) => (
                                <TableRow key={item.authCde}>
                                    <TableCell>{item.authCde} </TableCell>
                                    <TableCell>
                                        <TextField
                                            id={`${customId}_StudentID`}
                                            label="Student Id"
                                            name="studentId"
                                        />
                                    </TableCell>
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
        localStorage.setItem('sectionData', JSON.stringify(dedupedSections));
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