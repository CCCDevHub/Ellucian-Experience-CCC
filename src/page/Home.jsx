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
import { usePageControl } from '@ellucian/experience-extension/extension-utilities'

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
    const freshServiceAPIKey = getItem({key: CACHE_KEY_API, scope: cardId});
    const [ticketInfo, setTicketInfo] = useState([]);

    // Get the ticket Ids from cache
    const freshServiceTicketIds = getItem({key: CACHE_TICKET_IDS, scope: cardId});

    // Getting ticket info with conversations through API
    freshServiceTicketIds?.data.map( ticketId => {
        return (
        useEffect(async () => {
            await fetch(`${TICKET_URL}${ticketId}?include=conversations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(freshServiceAPIKey.data)
                }
            })
                .then(response => response.json())
                .then(response  => setTicketInfo(ticketInfo => [...ticketInfo, response]))
                .catch(err => console.error(err));
            }, []));
    });

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
                                        <ListItemText primary={`Type: ${TICKET_PRIORITIES[n?.ticket.type]}`} />
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