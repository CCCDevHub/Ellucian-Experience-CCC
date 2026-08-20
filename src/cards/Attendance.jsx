import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { makeStyles, Typography, Dropdown, DropdownItem } from '@ellucian/react-design-system/core';
import { useCardControl, useData, useCardInfo } from '@ellucian/experience-extension-utils';
import React, { useEffect, useMemo, useState } from 'react';
import mock from '../data/mock.json';

const useStyles = makeStyles()({
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

const Attendance = () => {
    const customId = 'Class-Roster';
    const { classes } = useStyles();
    const { configuration:
        {
            pipelineAPI,
            waitlistPipelineAPI,
            sectionPipelineAPI,
            termPipelineAPI,
            criticalDatesPipelineAPI
        }, cardId
    } = useCardInfo();

    useEffect(() => {
        window.localStorage.setItem('cardConfig', JSON.stringify({
            pipelineAPI, waitlistPipelineAPI, sectionPipelineAPI, termPipelineAPI, criticalDatesPipelineAPI, cardId
        }));
    }, [pipelineAPI, waitlistPipelineAPI, sectionPipelineAPI, termPipelineAPI, criticalDatesPipelineAPI, cardId]);
    const { setLoadingStatus, setErrorMessage, navigateToPage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const [sections, setSections] = useState([]);
    const [dropdownStateSection, setDropdownStateSection] = useState();
    const [terms, setTerms] = useState([]);
    const [dropdownStateTerm, setDropdownStateTerm] = useState();
    const [instructorId, setInstructorId] = useState('');

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
    }, [authenticatedEthosFetch, cardId, setErrorMessage, setLoadingStatus, termPipelineAPI]);

    const handleChangeSection = (event) => {
        const { value } = event.target;
        setDropdownStateSection(value);
        setLoadingStatus(true);

        window.localStorage.setItem('selectedSection', value);
        navigateToPage({
            route: `/class-roster/${value}`
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
                const sectionResult = await getEthosQuery({
                    queryId: 'section-list', properties: { termCode: value }
                });
                // const sectionResult = await mock;
                const sectionData = (sectionResult?.data?.sectionInstructors?.edges?.map(edge => edge.node));
                setSections(sectionData);
                window.localStorage.setItem('instructorId', sectionData[0]?.instructor12?.credentials.find(
                    crd => crd.type === 'bannerId')
                    ?.value);


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
        window.localStorage.setItem('sectionData', JSON.stringify(deduped));
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
export default Attendance;