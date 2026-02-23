import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40, spacing20 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, Dropdown, DropdownItem } from '@ellucian/react-design-system/core';
import { useCardControl, useData } from '@ellucian/experience-extension-utils';
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

function SectionAuthorizationCode({ classes }) {
    const customId = 'Section-Add-Authorization-Code';
    const { setLoadingStatus, setErrorMessage, navigateToPage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const [sections, setSections] = useState([]);
    const [dropdownStateSection, setDropdownStateSection] = useState();

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + 4);
                const sectionResult = await getEthosQuery({
                    queryId: 'section-list', properties: { todayDate: new Date().toJSON().slice(0, 10), futureDate: futureDate.toJSON().slice(0, 10) }
                });
                // const sectionResult = await mock;
                const sectionData = (sectionResult?.data?.sectionInstructors?.edges?.map(edge => edge.node));
                setSections(sectionData);
                setLoadingStatus(false);
            } catch (error) {
                console.error('Failed to load sections:', error);
                setErrorMessage('Failed to load sections. Please try again.');
                setLoadingStatus(false);
            }
        })();
    }, []);

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    const setWithExpiry = (key, value) => {
        localStorage.setItem(key, JSON.stringify({ value, expiry: Date.now() + ONE_WEEK_MS }));
    };

    const handleChangeSection = (event) => {
        const { value } = event.target;
        setDropdownStateSection(value);
        setLoadingStatus(true);

        setWithExpiry('sac_selectedSection', value);
        navigateToPage({
            route: `/section-authorization-code`
        });
        setLoadingStatus(false);

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
        setWithExpiry('sac_sectionData', deduped);
        return deduped;
    }, [sections]);

    return (
        <div className={classes.card}>
            <Typography variant="h4" style={{ marginBottom: spacing20, textAlign: 'center' }}>
                Section Authorization Code
            </Typography>
            <Typography style={{ marginBottom: spacing40, textAlign: 'center' }}>
                Select a course section from the dropdown to manage authorization codes.
            </Typography>
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
        </div>
    );

}



SectionAuthorizationCode.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SectionAuthorizationCode);