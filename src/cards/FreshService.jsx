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

const CACHE_KEY_API = 'local-cache:api';
const CACHE_KEY_USER = 'local-cache:user'
const CACHE_TICKET_IDS = 'local-cache:ticketIds';
const TICKET_FILTER_URL = 'https://pasadena.freshservice.com/api/v2/tickets/filter?';
const TICKET_STATUS = {
    2: 'Open',
    3: 'Pending'
};

function FreshService({
                          classes,
                          cache: {
                              getItem,
                              storeItem,
                              clear
                          },
                          cardInfo: {
                              cardId
                          },
                          cardControl: {
                              navigateToPage,
                              setLoadingStatus
                          }
                      }) {

    const customId = 'freshService';

    const [keyTextBox, setKeyTextBox] = useState();
    const [userTextBox, setUserTextBox] = useState();
    const [errorAPIKeyMessage, setAPIKeyMessage] = useState();
    const [errorUserIdMessage, setUserIdMessage] = useState();
    const [freshServiceTickets, setFreshServiceTickets] = useState();
    const [popoverAnchorEl, setPopoverAnchorEl] = useState({
        anchorEl: null
    });

    const handleClickPopover = event => {
        if (userTextBox?.userId && keyTextBox?.apiKey) {
            storeItem({key: CACHE_KEY_USER, data: userTextBox?.userId, scope: cardId});
            storeItem({key: CACHE_KEY_API, data: keyTextBox?.apiKey, scope: cardId});
            window.location.reload();
        }
        else {
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
    const handleChangeAPI = event => {
        const {name, value} = event.target;

        if (!value || value.length <= 0) {
            setAPIKeyMessage({
                apiError: true,
                apiErrorMessage: 'API Key is required'
            });
        } else if (value.length > 0) {
            setAPIKeyMessage({
                apiError: false,
                apiErrorMessage: ''
            });
            setKeyTextBox({
                [name]: value
            });
        }
    };

    const handleChangeUser = event => {
        const {name, value} = event.target;
        if (!value || value.length <= 0) {
            setUserIdMessage({
                apiError: true,
                apiErrorMessage: 'User Id is required'
            });
        } else if (value.length > 0) {
            setUserIdMessage({
                apiError: false,
                apiErrorMessage: ''
            });
        }
        setUserTextBox({
            [name]: value
        });
    };


    const userId = getItem({key: CACHE_KEY_USER, scope: cardId});
    const freshServiceAPIKey = getItem({key: CACHE_KEY_API, scope: cardId});
    // clear({key:CACHE_KEY_USER});
    // clear({key:CACHE_KEY_API});
    if (userId.data && freshServiceAPIKey.data) {
        // Get tickets that assigned to you and status Open or Pending
        useEffect(async () => {
            await fetch(TICKET_FILTER_URL + new URLSearchParams({
                query: `"agent_id:${userId.data} AND (status:2 OR status:3)"`
            }), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic ' + btoa(freshServiceAPIKey.data)
                }
            })
                .then(response => response.json())
                .then(response  => {
                    setFreshServiceTickets(() => response)
                })
                .catch(err => console.error(err));
        }, []);
        storeItem({key: CACHE_TICKET_IDS, data: freshServiceTickets?.tickets?.map(x => x.id), scope: cardId});

        return (
            <div className={classes.card}>
                <Typography>
                    You have {freshServiceTickets?.tickets?.filter(ticket => ticket.status === 2).length} Open and {freshServiceTickets?.tickets?.filter(ticket => ticket.status === 3).length} Pending Tickets
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

    } else {
        return (
            <div className={classes.card} id={`${customId}_RequiredFields`}>
                <div className={classes.textBox}>
                    <TextField
                        id={`${customId}_RequiredUserId`}
                        label="User Id"
                        name="userId"
                        required={true}
                        onChange={handleChangeUser}
                        error={errorUserIdMessage?.apiError}
                        helperText={errorUserIdMessage?.apiErrorMessage}
                        fullWidth={true}
                    />
                </div>
                <div className={classes.textBox}>
                    <TextField
                        id={`${customId}_RequiredAPIKey`}
                        label="API Key"
                        name="apiKey"
                        type="password"
                        required={true}
                        onChange={handleChangeAPI}
                        error={errorAPIKeyMessage?.apiError}
                        helperText={errorAPIKeyMessage?.apiErrorMessage}
                        fullWidth={true}
                    />
                </div>

                    <Button id={`${customId}_ContinueButton`} size="large" endIcon={<Icon name="chevron-right"/>}
                            onClick={handleClickPopover} aria-controls={"popoverContent"} aria-expanded={popoverAnchorEl.anchorEl}>
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
                        <Typography id="SimplePopoverText" className={classes.popoverText}>Please fill out User Id and API Key.</Typography>
                    </Popover>
            </div>
        );
    }

}

FreshService.propTypes = {
    classes: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired
};

export default withStyles(styles)(FreshService);