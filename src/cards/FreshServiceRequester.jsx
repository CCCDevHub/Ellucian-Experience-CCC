import {withStyles} from '@ellucian/react-design-system/core/styles';
import React, {useState, useEffect} from "react";
import {spacing30, spacing40, spacing50} from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextLink,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },
    textBox: {
        marginBottom: spacing50
    },
    popoverText: {
        margin: spacing30
    }
});

// Declaration for cache and ENUM

const CACHE_KEY_API = 'local-cache:api';
const CACHE_TICKET_IDS = 'local-cache:ticketIds';
const TICKET_FILTER_URL = 'https://pasadena.freshservice.com/api/v2/tickets/filter?';
const TICKET_STATUS = {
    2: 'Open',
    3: 'Pending'
};
const FRESH_SERVICE_AGENT_URL = 'https://pasadena.freshservice.com/api/v2/agents?';
function FreshServiceRequester({
                                   classes,
                                   cache: {
                                       storeItem
                                   },
                                   cardInfo: {
                                       cardId,
                                       configuration
                                   },
                                   data: { getEthosQuery },
                                   cardControl: {
                                       setLoadingStatus
                                   }
                               }) {
    const customId = 'freshServiceRequested';
    const freshServiceKey = configuration['fresh-service-key'];
    storeItem({key: CACHE_KEY_API, data: freshServiceKey, scope: cardId});

    // Declare useStates

    const [freshServiceTickets, setFreshServiceTickets] = useState([]);


    // clear({key:CACHE_KEY_USER});
    // clear({key:CACHE_KEY_API});

    useEffect( () => {
        setLoadingStatus(true);
        const fetchUserEmail = async () => {
            try {
                const personData = await getEthosQuery({queryId: 'person-email'});
                const personEmail = personData?.data?.persons?.edges[0]?.node?.emails[0]?.address;
                const fetchId = async () => {
                    try {
                        const response = await fetch(FRESH_SERVICE_AGENT_URL + new URLSearchParams( {
                            email: `${personEmail}`
                        }), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: 'Basic ' + btoa(freshServiceKey)
                            }
                        });
                        if (!response.ok) {
                            throw new Error('Request failed with status ' + response.status);
                        }
                        const data = await response.json();
                        // Using the freshService agent Id to filter all the requested tickets that are open and pending
                        if(data?.agents[0].id) {
                            const userId = data?.agents[0].id;
                            const fetchTickets = async () => {
                                try {
                                    const ticketsResponse = await fetch(TICKET_FILTER_URL + new URLSearchParams({
                                        query: `"requester_id:${userId} AND (status:2 OR status:3)"`
                                    }), {
                                        method: 'GET',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: 'Basic ' + btoa(freshServiceKey)
                                        }
                                    });

                                    if(!ticketsResponse.ok) {
                                        throw new Error(
                                            'Request failed with status ' + ticketsResponse.status
                                        );
                                    }
                                    const ticketsData = await ticketsResponse.json();
                                    setFreshServiceTickets(ticketsData);
                                } catch (error) {
                                    console.error('Error fetching tickets:', error);
                                }
                            };
                            fetchTickets();
                        }
                    } catch (error) {
                        console.error('Error fetching user Id:', error);
                    }
                };
                fetchId();
                setLoadingStatus(false);
            } catch (error) {
                console.error(error);
            }
        }
        fetchUserEmail();
        }, []);


        // Store the ticket Ids to cache
        storeItem({key: CACHE_TICKET_IDS, data: freshServiceTickets?.tickets?.map(x => x.id), scope: cardId});
        // Render the table with all the tickets
        return (
            <div className={classes.card}>
                <Typography>
                    You have {freshServiceTickets?.tickets?.filter(ticket => ticket.status === 2).length} Open
                    and {freshServiceTickets?.tickets?.filter(ticket => ticket.status === 3).length} Pending Tickets
                    <Table layout={{variant: 'card', breakpoint: 'sm'}}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ticket Number</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {freshServiceTickets?.tickets?.map(n => {
                                return (
                                    <TableRow key={n?.id}>
                                        <TableCell columnName={"Ticket Number"}>
                                            {n?.id}
                                        </TableCell>
                                        <TableCell columnName={"Subject"}>
                                            <TextLink id={`${customId}_TicketLink`}
                                                      href={`https://helpdesk.pasadena.edu/a/tickets/${n?.id}`}>
                                                {n?.subject}
                                            </TextLink>
                                        </TableCell>
                                        <TableCell columnName={"Type"}>
                                            {n?.type}
                                        </TableCell>
                                        <TableCell columnName={"Status"}>
                                            {TICKET_STATUS[n?.status]}
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

FreshServiceRequester.propTypes = {
    classes: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired
};

export default withStyles(styles)(FreshServiceRequester);