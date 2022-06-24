import React, {useState, useEffect, Fragment} from "react";
import PropTypes from "prop-types";
import {spacing10, spacing40, widthFluid} from '@ellucian/react-design-system/core/styles/tokens';
import {withStyles} from '@ellucian/react-design-system/core/styles';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    TextLink
} from '@ellucian/react-design-system/core';
import {useCardInfo} from "@ellucian/experience-extension/extension-utilities";

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
    }
});

const GradeAssignmentCard = (props) => {
    const {
        classes,
        data: {getEthosQuery},
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
    // const sectionIdList = ["cb9475e2-69ee-437e-88ff-6e190f30d282",
    //     "581fee9e-5e7d-41c8-8205-3929a47f411e",
    //     "00531855-6397-441f-b876-8efd87ec8c65",
    //     "ef1b341b-6776-4834-8447-462eac7fd5ad",
    //     "0648f603-7196-48bb-9c45-c2f3863202a5",
    //     "e1b808f7-2ec7-4b31-88c0-08c10ba0433b",
    //     "3ec2dfc8-0147-418e-86b1-d4d1ad1aad3d",
    //     "2367fc5c-75b9-4b4e-9c43-59c6f7bbcf1a",
    //     "9df38eb1-846e-4d1b-95a3-996068c0f153"];

    const todayDate = new Date().toJSON().slice(0, 10);
    useEffect(() => {
        (async () => {
                setLoadingStatus(true);
                try {
                    const sectionResult = await getEthosQuery({ queryId: 'section-list', properties: { todayDate: todayDate } });
                    console.log(sectionResult);
                    const sections = sectionResult?.data?.sections?.edges.map(edge => edge.node);

                    setSectionData(() => sections);

                    setLoadingStatus(false);
                } catch (error) {
                    console.log('ethosQuery failed', error);
                    setErrorMessage({
                        headerMessage: ({id: 'GraphQLQueryCard-fetchFailed'}),
                        textMessage: ({id: 'GraphQLQueryCard-classesFetchFailed'}),
                        iconName: 'error',
                        iconColor: '#D42828'
                    });
                }
            }
        )();
    }, []);

    for (const i in sectionData) {
        if (i != null) {
            const {alternateIds, code: crn, course:{number:csn, subject:{abbreviation:dept}}, maxEnrollment, reportingAcademicPeriod16: {code: termCode, registration, title: termName}, status: {detail11:{category, title:statusTitle}}, titles} = sectionData[i];
            tableData.push(createData(statusTitle, titles[1].value, dept, csn, termName, crn, maxEnrollment, termCode));
        }
    }
    if (tableData !== undefined || tableData.length !== 0){
        storeItem({ key: cacheKey, data: tableData, scope: cardId });
    }

    function createData(status, title, dept, csn, term, crn, enrolled, termCode) {
        id += 1;
        return {id, status, title, dept, csn, term, crn, enrolled, termCode};
    }

    return (
            <div className={classes.root}>
                <Typography>
                <Table layout={{ variant: 'card', breakpoint: 'sm'}}>
                <TableHead>
                    <TableRow>
                        <TableCell>Status</TableCell>
                        <TableCell>Course Title</TableCell>
                        <TableCell>Dept</TableCell>
                        <TableCell>CSN</TableCell>
                        <TableCell>Term</TableCell>
                        <TableCell>CRN</TableCell>
                        <TableCell>Session</TableCell>
                        <TableCell>Enrolled</TableCell>
                    </TableRow>
                </TableHead>
                    <TableBody>
                        {tableData.map(n => {
                            return (
                                <TableRow key={n.id}>
                                    <TableCell columnName="Status">
                                        {n.status}
                                    </TableCell>
                                    <TableCell columnName="Course Title">
                                        <TextLink id="link"
                                                  href={`https://ssb-prod.ec.pasadena.edu/PROD/bwlkffgd.P_FacFinGrd?TERM=${n.termCode}&CRN=${n.crn}`}>
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
                                    <TableCell columnName="Session">
                                        -
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
    )
};

GradeAssignmentCard.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired
}

export default withStyles(styles)(GradeAssignmentCard);