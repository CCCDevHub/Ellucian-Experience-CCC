import React, { useState, useEffect } from "react";
import { Icon } from "@ellucian/ds-icons/lib";
import PropTypes from "prop-types";
import classnames from 'classnames';
import { spacing10, spacing40, widthFluid, spacing80 } from '@ellucian/react-design-system/core/styles/tokens';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    TextLink,
    ListItemIcon
} from '@ellucian/react-design-system/core';
import mock from '../data/mock.json';

const cacheKey = 'section-table-data';

const styles = () => ({
    card: {
        marginLeft: spacing40,
        marginRight: spacing40,
        paddingTop: spacing10
    },
    text: {
        marginRight: spacing40,
        marginLeft: spacing40
    },
    root: {
        width: widthFluid,
        paddingTop: spacing10,
        overflowX: 'auto'
    },
    message: {
        paddingTop: spacing80,
        marginLeft: spacing80,
        marginRight: spacing80,
        textAlign: 'center'
    }
});

function GradeAssignmentCard({ classes }) {
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { configuration: {
        pipelineAPI
    }, cardId } = useCardInfo();
    const { roles } = useUserInfo();

    let id = 0;
    const [sectionData, setSectionData] = useState();
    const [gradeSubmission, setGradeSubmission] = useState();
    const tableData = [];
    const terms = new Set();

    const personId = roles.at(-1);

    // const todayDate = new Date().toJSON().slice(0, 10);

    const crnSet = new Set();

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const sectionResult = await getEthosQuery({ queryId: 'section-list' });
                // const sectionResult = await mock;

                const sections = sectionResult?.data?.sectionInstructors?.edges.map(edge => edge.node);
                setSectionData(() => sections);
                if (sections === undefined || sections.length === 0) {
                    setErrorMessage({
                        headerMessage: ('No Classes Available'),
                        textMessage: (`You don't have any available classes`),
                        iconName: 'warning',
                        iconColor: 'blue'
                    });
                }
                const gradeSubmissionResponse = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&testPersonId=${personId}`);
                const gradeSubmissionResult = await gradeSubmissionResponse.json();
                setGradeSubmission(() => gradeSubmissionResult);
                setLoadingStatus(false);
            } catch (error) {
                console.log('ethosQuery failed', error);
                setErrorMessage({
                    headerMessage: ('GraphQL Fetch Failed'),
                    textMessage: ('GraphQL Fetch Failed'),
                    iconName: 'error',
                    iconColor: '#D42828'
                });
            }
        }
        )();
    }, []);


    const assignedGradeSubmitted = (guid) => {
        const found = gradeSubmission.find(item => item.guid === guid);
        return found ? found.gradeEntered : null;
    }

    for (const i in sectionData) {
        if (i != null && gradeSubmission) {

            // const {section16: {code: crn}} = sectionData[i];
            // console.log(crn);
            // const {alternateIds, code: crn, course:{number:csn, subject:{abbreviation:dept}}, maxEnrollment, reportingAcademicPeriod16: {code: termCode, registration, title: termName}, status: {detail11:{category, title:statusTitle}}, titles} = sectionData[i];
            // const {section16:{code: crn, course16: {subject, number: csn}, maxEnrollment, }}
            const { section16 } = sectionData[i] || {};
            if (section16) {
                const { id: sectionID, code: crn, alternateIds, course16, maxEnrollment, reportingAcademicPeriod16, titles } = section16;
                const { subject, number: csn } = course16 || {};
                const { code: termCode, title: termName } = reportingAcademicPeriod16 || {};
                const { abbreviation: dept } = subject || {};
                const gradeSubmitted = parseInt(assignedGradeSubmitted(sectionID), 10);
                const [{ value: crnTerm }] = alternateIds || {};

                if (!crnSet.has(crnTerm)) {
                    tableData.push(createData(titles[0]?.value, dept, csn, termName, crn, maxEnrollment, termCode, gradeSubmitted));
                }
                crnSet.add(crnTerm);
                terms.add(termName);
            }
        }
    }
    // console.log(classType);
    if (tableData !== undefined || tableData.length !== 0) {
        localStorage.setItem(cacheKey, JSON.stringify(tableData));
    }

    function createData(title, dept, csn, term, crn, enrolled, termCode, gradeSubmitted) {
        id += 1;
        return { id, title, dept, csn, term, crn, enrolled, termCode, gradeSubmitted };

    }

    if (tableData.length !== 0) {
        return (
            <div className={classes.root}>
                <Typography>
                    <Table layout={{ variant: 'card', breakpoint: 'sm' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell>Course Title</TableCell>
                                <TableCell>CRN</TableCell>
                                <TableCell>Dept</TableCell>
                                <TableCell>CSN</TableCell>
                                <TableCell>Term</TableCell>
                                <TableCell>Enrolled</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tableData.map(n => {
                                return (
                                    <TableRow key={n.id}>
                                        <TableCell columnName="Status">
                                            {n.gradeSubmitted === 1 ? <ListItemIcon className={classes.itemText}>
                                                <Icon
                                                    name="check-circle"
                                                    color="blue"
                                                    large="true"
                                                    className={(classes.check, classes.icon)}
                                                />
                                            </ListItemIcon> : <ListItemIcon className={classes.itemText}>
                                                <Icon
                                                    name="times-circle"
                                                    color="red"
                                                    large="true"
                                                    className={(classes.check, classes.icon)}
                                                />
                                            </ListItemIcon>
                                            }
                                        </TableCell>
                                        <TableCell columnName="Course Title">
                                            <TextLink id="link"
                                                href={`https://facultyssb-prod.ec.pasadena.edu/FacultySelfService/ssb/GradeEntry`}>
                                                {n.title}
                                            </TextLink>
                                        </TableCell>
                                        <TableCell columnName="CRN">
                                            {n.crn}
                                        </TableCell>
                                        <TableCell columnName="Dept">
                                            {n.dept}
                                        </TableCell>
                                        <TableCell columnName="CSN">
                                            {n.csn}
                                        </TableCell>
                                        <TableCell columnName="Term">
                                            {n.term}
                                        </TableCell>
                                        <TableCell columnName="Enrolled">
                                            {n.enrolled}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Typography>
            </div>
        );
    }
    else {
        return (
            <div className={classes.card}>
                <Typography className={classes.message} variant="body1" component="div">
                    {`You don't have any classes at the moment.`}
                </Typography>
            </div>
        );
    }
}

GradeAssignmentCard.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GradeAssignmentCard);