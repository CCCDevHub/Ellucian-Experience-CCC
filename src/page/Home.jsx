import { withStyles } from '@ellucian/react-design-system/core/styles';
import {spacing20, spacing40} from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextLink,
    Card,
    CardHeader,
    CardContent,
    List,
    ListItem,
    ListItemText,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails
} from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
import React, {useState, useEffect} from "react";
import { usePageControl } from '@ellucian/experience-extension-utils'

const styles = () => ({
    card: {
        width: '20rem',
        margin: spacing40
    },
    page: {
        margin: `0 ${spacing20}`
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    centerContent: {
        display: 'flex',
        flexFlow: 'column nowrap',
        textAlign: 'center',
        justifyContent: 'center'
    },
    sectionHeaders: {
        fontWeight: 'bold'
    },
    expansionPanel: {
        width: '100%',
        borderRadius: '0',
        boxShadow: 'none'
    },
    expansionItem: {
        padding: '0px'
    },
    panelSummary: {
        padding: `0rem ${spacing40}`
    }
});
const CACHE_KEY_API = 'local-cache:api';
const CACHE_TICKET_IDS = 'local-cache:ticketIds';
const TICKET_URL = 'https://pasadena.freshservice.com/api/v2/tickets/';
const AGENT_URL = 'https://pasadena.freshservice.com/api/v2/agents/';
const TICKET_STATUS = {
    2: 'Open',
    3: 'Pending'
};
const TICKET_PRIORITIES = {
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent'
};
const HomePage = (props) => {
    const {
        classes,
        cache: {
            getItem
        },
        cardInfo: {
            cardId
        }
    } = props;
    const { setPageTitle } = usePageControl();
    setPageTitle("Open and Pending Helpdesk Tickets");
    const customId = 'freshServiceCard';
    const [ticketInfo, setTicketInfo] = useState([]);
    const [agentInfo, setAgentInfo] = useState([]);

    // Get the ticket Ids and key from cache
    const freshServiceTicketIds = getItem({key: CACHE_TICKET_IDS, scope: cardId});
    const freshServiceAPIKey = getItem({key: CACHE_KEY_API, scope: cardId});

    // Getting ticket info with conversations
    useEffect(() => {
        const fetchTicketInfo = async (ticketId) => {
            try {
                const response = await fetch(
                    `${TICKET_URL}${ticketId}?include=conversations`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Basic ' + btoa(freshServiceAPIKey.data)
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Request failed with status ' + response.status);
                }

                const data = await response.json();
                setTicketInfo((ticketInfo) => [...ticketInfo, data]);
                const agentId = data?.ticket?.responder_id;

                if (agentId) {
                    try {
                        const agentResponse = await fetch(
                            `${AGENT_URL}${agentId}`,
                            {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: 'Basic ' + btoa(freshServiceAPIKey.data)
                                }
                            }
                        );

                        if (!agentResponse.ok) {
                            throw new Error(
                                'Request failed with status ' + agentResponse.status
                            );
                        }

                        const agentData = await agentResponse.json();
                        setAgentInfo((requesterInfo) => ({
                            ...requesterInfo,
                            [agentId]: agentData.agent
                        }));
                    } catch (error) {
                        console.error('Error while fetching requester: ', error);
                    }
                }
            } catch (error) {
                console.error('Error while fetching ticket info: ', error);
            }
        };

        if (freshServiceTicketIds?.data) {
            freshServiceTicketIds.data.forEach((ticketId) => {
                fetchTicketInfo(ticketId);
            });
        }
    }, []);

    // Sort the tickets by created date Desc
    ticketInfo.sort((a, b) => {
        return new Date(b.ticket.created_at) - new Date(a.ticket.created_at)
    });
    // Render each of the ticket as card
    return (
        <div className={classes.container} id={`${customId}_Container`}>
            {ticketInfo?.map(n => {
                return (
                    <Card className={classes.card} id={`${customId}_FreshServiceTicket`} key={n?.ticket.id} responsive={true}>
                        <CardHeader
                            title={<TextLink id={`${customId}_TicketLink`} href={`https://helpdesk.pasadena.edu/a/tickets/${n?.ticket.id}`}>
                                {n?.ticket.subject}
                            </TextLink>}
                            id={`${customId}_CardHeader`}
                        />
                        <CardContent>
                            <Typography variant="body2">
                                <List>
                                    <ListItem divider>
                                        <ListItemText primary={`Status: ${TICKET_STATUS[n?.ticket.status]}`} />
                                    </ListItem>
                                    <ListItem divider>
                                        <ListItemText primary={`Priority: ${TICKET_PRIORITIES[n?.ticket.priority]}`} />
                                    </ListItem>
                                    <ListItem divider>
                                        <ListItemText primary={`Type: ${n?.ticket.type}`} />
                                    </ListItem>
                                    <ListItem divider>
                                        <ListItemText primary={`Agent: ${agentInfo[n?.ticket.responder_id]?.first_name??'No'} ${agentInfo[n?.ticket.responder_id]?.last_name??'Agent'}`} />
                                    </ListItem>
                                    <ListItem divider>
                                        <ListItemText primary={`Created Date: ${new Date(n?.ticket.created_at).toDateString()}`} />
                                    </ListItem>
                                    <ListItem divider>
                                        <ListItemText primary={`Last Updated: ${new Date(n?.ticket.updated_at).toDateString()}`} />
                                    </ListItem>
                                    <ListItem divider className={classes.expansionItem}>
                                        <ExpansionPanel  className={classes.expansionPanel}>
                                            <ExpansionPanelSummary className={classes.panelSummary}>
                                               <Typography variant={'body1'}>Detail</Typography>
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails>
                                                <div dangerouslySetInnerHTML={{ __html: n?.ticket.description }} />
                                            </ExpansionPanelDetails>
                                        </ExpansionPanel>
                                    </ListItem>
                                    <ListItem divider className={classes.expansionItem}>
                                        <ExpansionPanel  className={classes.expansionPanel}>
                                            <ExpansionPanelSummary className={classes.panelSummary}>
                                                <Typography variant={'body1'}>Last Comment</Typography>
                                            </ExpansionPanelSummary>
                                            <ExpansionPanelDetails>
                                                <div dangerouslySetInnerHTML={{ __html: n?.ticket.conversations.slice(-1)[0]?.body}} />
                                            </ExpansionPanelDetails>
                                        </ExpansionPanel>
                                    </ListItem>
                                </List>
                            </Typography>
                        </CardContent>
                    </Card>
                )
            })}

        </div>
    );
};

HomePage.propTypes = {
    classes: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);