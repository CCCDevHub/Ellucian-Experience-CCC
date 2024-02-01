import React, { useState, useEffect, Fragment } from "react";
import { Icon } from "@ellucian/ds-icons/lib";
import PropTypes from "prop-types";
import { spacing10, spacing40, widthFluid, spacing80 } from '@ellucian/react-design-system/core/styles/tokens';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    TextLink,
    ListItemIcon,
    Dropdown,
    DropdownItem
} from '@ellucian/react-design-system/core';
import classNames from "classnames";
import { useCardInfo } from "@ellucian/experience-extension-utils";

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

const GradeAssignmentCard = (props) => {
    const {
        classes,
        data: { getEthosQuery },
        cardControl: {
            setLoadingStatus,
            setErrorMessage
        },
        cache: {
            storeItem
        }
    } = props;
    const { cardId } = useCardInfo();
    let id = 0;
    const [sectionData, setSectionData] = useState();
    const tableData = [];
    const terms = new Set();

    const todayDate = new Date().toJSON().slice(0, 10);

    const crnSet = new Set();

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const sectionResult = await getEthosQuery({ queryId: 'section-list' });

                const sections = sectionResult?.data?.sectionInstructors?.edges.map(edge => edge.node);
                // const sections = sectionResult?.data?.sectionInstructors10?.edges.map(edge => edge.node);

                setSectionData(() => sections);
                if (sections === undefined || sections.length === 0) {
                    setErrorMessage({
                        headerMessage: ('No Classes Available'),
                        textMessage: (`You don't have any available classes`),
                        iconName: 'warning',
                        iconColor: 'blue'
                    });
                }
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
    for (const i in sectionData) {
        if (i != null) {
            // const {section16: {code: crn}} = sectionData[i];
            // console.log(crn);
            // const {alternateIds, code: crn, course:{number:csn, subject:{abbreviation:dept}}, maxEnrollment, reportingAcademicPeriod16: {code: termCode, registration, title: termName}, status: {detail11:{category, title:statusTitle}}, titles} = sectionData[i];
            // const {section16:{code: crn, course16: {subject, number: csn}, maxEnrollment, }}
            const { section16: { code: crn, course16, maxEnrollment, reportingAcademicPeriod16, status, titles, gradeSubmitted } } = sectionData[i] || {};
            const { subject, number: csn } = course16 || {};
            const { code: termCode, title: termName } = reportingAcademicPeriod16 || {};
            const { detail11 } = status || {};
            const { title: statusTitle } = detail11 || {};
            const { abbreviation: dept } = subject || {};
            const { instructionalMethod6: { title: classType } } = sectionData[i] || {};
            if (!crnSet.has(crn)) {
                tableData.push(createData(statusTitle, titles[1].value, dept, csn, termName, crn, maxEnrollment, termCode, classType, gradeSubmitted));
            }
            crnSet.add(crn);
            terms.add(termName);
        }
    }
    // console.log(classType);
    if (tableData !== undefined || tableData.length !== 0) {
        storeItem({ key: cacheKey, data: tableData, scope: cardId });
    }

    function createData(status, title, dept, csn, term, crn, enrolled, termCode, classType, gradeSubmitted) {
        id += 1;
        return { id, status, title, dept, csn, term, crn, enrolled, termCode, classType, gradeSubmitted };
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
                                <TableCell>Dept</TableCell>
                                <TableCell>CSN</TableCell>
                                <TableCell>Term</TableCell>
                                <TableCell>CRN</TableCell>
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
                                                    color="gray"
                                                    className={classNames(classes.check, classes.icon)}
                                                />
                                            </ListItemIcon> : <ListItemIcon className={classes.itemText}>
                                                <Icon
                                                    name="times-circle"
                                                    color="gray"
                                                    className={classNames(classes.check, classes.icon)}
                                                />
                                            </ListItemIcon>
                                            }
                                        </TableCell>
                                        <TableCell columnName="Course Title">
                                            <TextLink id="link"
                                                href={`https://ssb-prod.ec.pasadena.edu/ssomanager/saml/login?relayState=/c/auth/SSB?pkg=bwlkffgd.P_FacFinGrd?TERM=${n.termCode}&CRN=${n.crn}`}>
                                                {n.title}
                                            </TextLink>
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
                                        <TableCell columnName="CRN">
                                            {n.crn}
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
};

GradeAssignmentCard.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired
}

export default withStyles(styles)(GradeAssignmentCard);