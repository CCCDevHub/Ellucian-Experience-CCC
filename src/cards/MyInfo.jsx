import React, {Fragment, useEffect, useState} from "react";
import PropTypes from "prop-types";
import {spacing10, spacing40} from '@ellucian/react-design-system/core/styles/tokens';
import {withStyles} from '@ellucian/react-design-system/core/styles';
import {Table, TableBody, TableCell, TableRow, Typography, IconButton, Tooltip, TextLink, List, ListItem, ListItemText} from '@ellucian/react-design-system/core';
import { Icon } from '@ellucian/ds-icons/lib';

const styles = () => ({
    card: {
        marginLeft: spacing40,
        marginRight: spacing40,
        paddingTop: spacing10
    },
    text: {
        marginRight: spacing40,
        marginLeft: spacing40
    }
});

const handleClick = () => {
    window.open("https://pasadena.edu/admissions-and-aid/admissions-and-records/fees-and-tuition/california-residency-requirements.php");
}

const MyInfo = (props) => {
    const {
        classes,
        cardInfo: { configuration },
        data: { getEthosQuery },
        cardControl: {
            setLoadingStatus,
            setErrorMessage,
            setPreventRemove
        }
    } = props;

    const [persons, setPersons] = useState();
    const [personHolds, setPersonHolds] = useState();
    const [personTags, setPersonTags] = useState();
    const [residency, setResidency] = useState();
    const todayDate = new Date().toJSON().slice(0, 10);

    setPreventRemove(true);

    useEffect(() => {
        (async () => {
                setLoadingStatus(true);
                try {

                    // Get person info
                    const personResult = await getEthosQuery({
                        queryId: 'person-info'
                    });
                    const personData = (personResult?.data?.persons?.edges.map(edge => edge.node));

                    // Get person info
                    const residencyResult = await getEthosQuery({
                        queryId: 'residency-info'
                    });
                    const residencyData = (residencyResult?.data?.students?.edges.map(edge => edge.node));

                    // Get person holds
                    const personHoldResult = await getEthosQuery({
                        queryId: 'person-hold', properties: { today: todayDate }
                    });
                    const personHoldData = (personHoldResult?.data?.personHolds?.edges.map(edge => edge.node));

                    // Get person tags
                    const personTagResult = await getEthosQuery({
                        queryId: 'student-tags', properties: { today: todayDate }
                    });
                    const personTagData = (personTagResult?.data?.studentTagAssignments?.edges.map(edge => edge.node));

                    setPersons(() => personData);
                    setPersonHolds(() => personHoldData);
                    setPersonTags(() => personTagData);
                    setResidency(() => residencyData);
                    setLoadingStatus(false);
                } catch (error) {
                    console.log('ethosQuery failed', error);
                    setErrorMessage({
                        headerMessage: ({ id: 'GraphQLQueryCard-fetchFailed' }),
                        textMessage: ({ id: 'GraphQLQueryCard-classesFetchFailed' }),
                        iconName: 'error',
                        iconColor: '#D42828'
                    });
                }
            }
        )();
    }, []);
    // Check if all the data is loaded
    if (persons && personHolds && personTags && residency) {
        const person = destructPersonData(persons, personHolds, personTags, residency);
        return (
            <Fragment>
                <div className={classes.card}>
                    <Typography>
                        <Table>
                            {person && (
                                <TableBody>
                                    {person.map(n => {
                                        return (
                                            <TableRow key={n.id}>
                                                <TableCell align="left">
                                                    <b>{n.name}</b>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {n.value}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            )}
                        </Table>
                    </Typography>
                </div>
            </Fragment>
        );
    }
    else {
        return (null);
    }
};

function destructPersonData(persons, personHolds, personTags, residency) {
    let id = 0;
    const holdList = [];

    function createData(name, value) {
        id += 1;
        return { id, name, value };
    }

    if (personHolds.length !== 0) {
        for (const i in personHolds) {
            if (i) {
                const { type: { detail6: { title: holdType } } } = personHolds[i];
                holdList.push(holdType);
            }
            else {
                holdList.push("No Hold");
            }
        }
    }
    else {
        holdList.push("No Hold");
    }

    if (persons || personTags) {
        const {
            citizenshipStatus: { category: citizenStatus },
            dateOfBirth,
            credentials,
            emails,
            names,
            roles,
            veteranStatus: { category: vetStatus }
        } = persons[0];
        const studentId = () => {
            for (const cred in credentials) {
                if (cred) {
                    if (credentials[cred].type === "bannerId") {
                        return credentials[cred].value;
                    }
                }
            }
        }

        const userName = () => {
            for (const cred in credentials) {
                if (cred) {
                    if (credentials[cred].type === "bannerUserName") {
                        return credentials[cred].value;
                    }
                }
            }
        }

        const email = () => {
            for (const email in emails) {
                if (email) {
                    if (emails[email].type.emailType === "school" || emails[email].type.emailType === "hr") {
                        return emails[email].address;
                    }
                }
            }
        }
        const outTitle = () => {
            if (residency.length !== 0) {
                const lastResidency = residency[0].residencies[residency[0].residencies.length - 1];
                const { residency: { code: residencyCode, title: residencyTitle } } = lastResidency;

                if (residencyCode === "O") {
                    return(
                        <Typography>
                            <Tooltip color="blue" title="Please contact Admission & Records for more info">
                                <IconButton onClick={handleClick}>
                                    <Icon name="info"/>
                                </IconButton>
                            </Tooltip>
                            <TextLink
                                href="https://pasadena.edu/admissions-and-aid/admissions-and-records/fees-and-tuition/california-residency-requirements.php">
                                {residencyTitle}
                            </TextLink>

                        </Typography>
                    );
                }
                else {
                    return residencyTitle;
                }
            }
            else {
                return "CA Resident";
            }
        }

        const vacTitle = () => {
            if (personTags.length !== 0) {
                for (const i in personTags) {
                    if (i) {
                        const { tag7: { code: tagCode, title: tagTitle } } = personTags[i];
                        if (tagCode === "NVS") {
                            return(
                                <Typography>
                                    <Tooltip color="blue" title="Please contact Covid Support Team for more info">
                                        <IconButton onClick={handleClick}>
                                            <Icon name="info"/>
                                        </IconButton>
                                    </Tooltip>
                                    <TextLink
                                        href="https://pasadena.edu/admissions-and-aid/admissions-and-records/fees-and-tuition/california-residency-requirements.php">
                                        {tagTitle}
                                    </TextLink>

                                </Typography>
                            );
                        }
                        else {
                            return "Vaccinated";
                        }
                    }
                }
            }
            else {
                return "Vaccinated";
            }
        }

        return [
            createData("Name", names[0].fullName),
            createData("School Id", studentId()),
            createData("User Name", userName()),
            createData("Email", email()),
            createData("Hold", holdList.join("; ")),
            createData("Residency Status", outTitle()),
            createData("Vaccination Status", vacTitle()),
            createData("Role", roles[0].role)
        ];
    }
}

MyInfo.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired
}

export default withStyles(styles)(MyInfo);