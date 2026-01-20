import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40, spacing20 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, Dropdown, DropdownItem } from '@ellucian/react-design-system/core';
import { useCardControl, useData, useCardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
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

function Attendance({ classes }) {
    const customId = 'Class-Roster';
    const { configuration:
        {
            pipelineAPI,
            termPipelineAPI
        }, cardId
    } = useCardInfo();
    const { setLoadingStatus, setErrorMessage, navigateToPage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const [sections, setSections] = useState([]);
    const [dropdownStateSection, setDropdownStateSection] = useState();
    const [terms, setTerms] = useState([]);
    const [dropdownStateTerm, setDropdownStateTerm] = useState();


    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const response = await authenticatedEthosFetch(`${termPipelineAPI}?cardId=${cardId}`);
                const termResult = await response.json();
                const termData = termResult.filter(term => term.termDisplayControl == 'Y');
                setTerms(termData);
                setLoadingStatus(false);

            } catch (error) {
                console.error('Failed to load sections:', error);
                setErrorMessage('Failed to load sections. Please try again.');
                setLoadingStatus(false);
            }
        })();
    }, []);

    const handleChangeSection = (event) => {
        const { value } = event.target;
        setDropdownStateSection(value);
        setLoadingStatus(true);

        localStorage.setItem('selectedSection', value);
        navigateToPage({
            route: `/class-roster`
        });
        setLoadingStatus(false);

    };

    const handleChangeTerm = (event) => {
        const { value } = event.target;
        console.log('Selected Term:', value);
        setDropdownStateTerm(value);
        setLoadingStatus(true);

        (async () => {
            try {
                // const sectionResult = await getEthosQuery({
                //     queryId: 'section-list', properties: { termCode: value }
                // });
                const sectionResult = await mock;
                const sectionData = (sectionResult?.data?.sectionInstructors?.edges?.map(edge => edge.node));
                setSections(sectionData);
                setLoadingStatus(false);
            } catch (error) {
                console.error('Failed to load sections:', error);
                setErrorMessage('Failed to load sections. Please try again.');
                setLoadingStatus(false);
            }

        })()
    };

    const dedupedSections = useMemo(() => {
        if (!sections || sections.length === 0) { return []; }
        const seen = new Set();
        const deduped = sections.filter(sec => {
            const key = sec?.section16?.alternateIds?.[0]?.value;
            if (!key || seen.has(key)) { return false }
            seen.add(key);
            return true;
        });
        localStorage.setItem('sectionData', JSON.stringify(deduped));
        return deduped;
    }, [sections]);

    return (
        <div className={classes.card}>

            <Typography style={{ marginBottom: spacing40, textAlign: 'center' }}>
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
            )}
        </div>
    );

}




Attendance.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Attendance);