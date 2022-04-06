import React, {useState, useEffect, Fragment} from "react";
import PropTypes from "prop-types";
import {spacing10, spacing40} from '@ellucian/react-design-system/core/styles/tokens';
import {withStyles} from '@ellucian/react-design-system/core/styles';
import {Dropdown, DropdownItem, List, ListItem, ListItemText, Typography} from '@ellucian/react-design-system/core';
import {
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@ellucian/react-design-system/core';

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

const MyInfo = (props) => {
    const {
        classes,
        cardInfo: {configuration},
        data: {getEthosQuery},
        cardControl: {
            setLoadingStatus,
            setErrorMessage
        }
    } = props;

    const [persons, setPerson] = useState();
    const tableData = [];

    useEffect(() => {
        (async () => {
                setLoadingStatus(true);
                try {
                    const personResult = await getEthosQuery({
                        queryId: 'person-info',
                        properties: {personId: "0000f558-20c1-4944-ac76-f5816ecaed73"}
                    });
                    const personEdges = (personResult?.data?.persons?.edges || []);
                    const personData = personEdges.map((edges) => edges.node);
                    setPerson(() => personData);
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
    const person = destructPersonData(persons);

    return (
        <Fragment>
            <div className={classes.card}>
                <Table>
                    {person && (
                        <TableBody>
                            <TableRow>
                                <TableCell align="left">
                                    <h5>Name</h5>
                                </TableCell>
                                <TableCell align="right">
                                    {person.name}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left">
                                    <h5>Email</h5>
                                </TableCell>
                                <TableCell align="right">
                                    {person.email}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left">
                                    <h5>ID</h5>
                                </TableCell>
                                <TableCell align="right">
                                    {person.studentId}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left">
                                    <h5>Role</h5>
                                </TableCell>
                                <TableCell align="right">
                                    {person.role}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="left">
                                    <h5>Citizenship Status</h5>

                                </TableCell>
                                <TableCell align="right">
                                    {person.citizenStatus}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    )}
                </Table>
            </div>
        </Fragment>
    )
};

function destructPersonData(persons) {
    if (persons) {
        const {
            citizenshipStatus: {category: citizenStatus},
            dateOfBirth,
            credentials,
            emails,
            names,
            roles,
            veteranStatus: {category: vetStatus}
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

        const email = () => {
            for (const email in emails) {
                if (email) {
                    if (emails[email].type.emailType === "school") {
                        return emails[email].address;
                    }
                }
            }
        }
        const data = {
            citizenStatus: citizenStatus,
            name: names[0].fullName,
            studentId: studentId(),
            role: roles[0].role,
            email: email()
        }
        return data;
    }
}

MyInfo.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired
}

export default withStyles(styles)(MyInfo);