import {withStyles} from '@ellucian/react-design-system/core/styles';
import React, {useState, useEffect} from "react";
import {spacing30, spacing40, spacing50} from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextLink,
    Popover,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody
} from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
import {Icon} from '@ellucian/ds-icons/lib';

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
const CACHE_KEY_USER = 'local-cache:user'
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
                              getItem,
                              storeItem,
                              clear
                          },
                          cardInfo: {
                              cardId,
                              configuration
                          }
                      }) {
    const customId = 'freshServiceRequested';
    const freshServiceKey = configuration['fresh-service-key'];
    storeItem({key: CACHE_KEY_API, data: freshServiceKey, scope: cardId});

    // Declare useStates
    const [userEmailTextBox, setUserEmailTextBox] = useState('');
    const [errorUserEmailMessage, setUserEmailMessage] = useState('');
    const [freshServiceTickets, setFreshServiceTickets] = useState([]);
    const [popoverAnchorEl, setPopoverAnchorEl] = useState({
        anchorEl: null
    });
    // Popover click handler for when api key and id not fill out
    const handleClickPopover = event => {
        if (userEmailTextBox?.email) {
            storeItem({key: CACHE_KEY_USER, data: userEmailTextBox?.email, scope: cardId});
            window.location.reload();
        } else {
            setPopoverAnchorEl({
                anchorEl: event.currentTarget
            });
        }
    };
    const handleClickPopoverClose = () => {
        setPopoverAnchorEl({
            anchorEl: null
        });
    };


    // Handler for Email txtbox
    const handleChangeUserEmail = event => {
        const {name, value} = event.target;
        if (!value || value.length <= 0) {
            setUserEmailMessage({
                apiError: true,
                apiErrorMessage: 'Email is required'
            });
        } else if (value.length > 0) {
            setUserEmailMessage({
                apiError: false,
                apiErrorMessage: ''
            });
        }
        setUserEmailTextBox({
            [name]: value
        });
    };

    // Get userId and APIKey from textbox using cache
    const userEmail = getItem({key: CACHE_KEY_USER, scope: cardId});
    // clear({key:CACHE_KEY_USER});
    // clear({key:CACHE_KEY_API});

    if (userEmail.data) {
        // Get user freshService ID.
        console.log(userEmail.data);
        useEffect( () => {
            const fetchId = async () => {
                try {
                    const response = await fetch(FRESH_SERVICE_AGENT_URL + new URLSearchParams( {
                        email: `${userEmail.data}`
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
                    console.log(data)
                    // Using the freshService agent Id to filter all the requested tickets that are open and pending
                    if(data?.agents[0].id) {
                        console.log(data?.agents);
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

        // If the email txtbox not fill. Render the textbox again, until filled
    } else {
        return (
            <div className={classes.card} id={`${customId}_RequiredFields`}>
                <div className={classes.textBox}>
                    <TextField
                        id={`${customId}_RequiredUserEmail`}
                        label="Enter your Email"
                        name="email"
                        required={true}
                        onChange={handleChangeUserEmail}
                        error={errorUserEmailMessage?.apiError}
                        helperText={errorUserEmailMessage?.apiErrorMessage}
                        fullWidth={true}
                    />
                </div>


                <Button id={`${customId}_ContinueButton`} size="large" endIcon={<Icon name="chevron-right"/>}
                        onClick={handleClickPopover} aria-controls={"popoverContent"}
                        aria-expanded={popoverAnchorEl.anchorEl}>
                    Continue
                </Button>
                <Popover
                    id={"popoverContent"}
                    open={popoverAnchorEl.anchorEl}
                    anchorEl={popoverAnchorEl.anchorEl}
                    onClose={handleClickPopoverClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center'
                    }}
                >
                    <Typography id="SimplePopoverText" className={classes.popoverText}>Please fill out your Email.</Typography>
                </Popover>
            </div>
        );
    }

}

FreshServiceRequester.propTypes = {
    classes: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired
};

export default withStyles(styles)(FreshServiceRequester);