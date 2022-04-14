import React, {useState, useEffect, Fragment} from "react";
import PropTypes from "prop-types";
import {spacing10, spacing40} from '@ellucian/react-design-system/core/styles/tokens';
import {withStyles} from '@ellucian/react-design-system/core/styles';
import {
    Table,
    TableRow,
    TableCell,
    TableBody,
    Typography
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
    },
    table: {
        maxWidth: spacing10,
        maxHeight: spacing10,
        margin: spacing10
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

    const [persons, setPersons] = useState();
    const [personHolds, setPersonHolds] = useState();

    useEffect(() => {
        (async () => {
                setLoadingStatus(true);
                try {
                    const personResult = await getEthosQuery({
                        queryId: 'person-info'
                    });
                    const personData = (personResult?.data?.persons?.edges.map(edge => edge.node));

                    const personHoldResult = await getEthosQuery({
                        queryId: 'person-hold'
                    });
                    const personHoldData = (personHoldResult?.data?.personHolds?.edges.map(edge => edge.node));
                    setPersons(() => personData);
                    setPersonHolds(() => personHoldData);
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
    const person = destructPersonData(persons, personHolds);
    console.log(person)
    return (
        <Fragment>
            <div className={classes.card}>
                <Typography>
                <Table className={classes.table} size="small">
                    {person && (
                        <TableBody>
                            {person.map(n => {
                                return (
                                    <TableRow key={n.id}>
                                        <TableCell align="left">
                                            <h5>{n.name}</h5>
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
    )
};

function destructPersonData(persons, personHolds) {
    let id = 0;
    const holdList = [];

    function createData(name, value) {
        id += 1;
        return {id, name, value};
    }

    if (persons && personHolds) {
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

        for (const i in personHolds) {
            if (i) {
                const {type: {detail6: {title: holdType}}} = personHolds[i]
                holdList.push(holdType);
            }
        }

        const data = [
            createData("Name", names[0].fullName),
            createData("Id", studentId()),
            createData("Email", email()),
            createData("Hold", holdList.join('\n')),
            createData("Citizen Status", citizenStatus),
            createData("Role", roles[0].role)
        ]

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