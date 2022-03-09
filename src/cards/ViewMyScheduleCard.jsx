import React, { useState, useEffect, Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing10, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, Button, List, ListItem, Calendar, CalendarLegend, CalendarLegendItem, views } from '@ellucian/react-design-system/core';
import moment from 'moment';


const styles = () => ({
    card: {
        marginLeft: spacing40,
        marginRight: spacing40,
        paddingTop: spacing10
    },
    image: {
        width: '100%',
        height: 'auto'
    }
});

const ViewMySchedule = (props) => {
    const {
        classes,
        cardInfo: { configuration },
        data: { getEthosQuery },
        cardControl: {
            setLoadingStatus,
            setErrorMessage
        }
    } = props;

    const textMessage = configuration.message;
    const [schedule, setSchedule] = useState();

    useEffect(() => {
        (async () => {
            setLoadingStatus(true)
            try {
                // Get Etho Query from index.js
                const result = await getEthosQuery({ queryId: 'list-schedule' });
                // Destruct to Edges
                const scheduleEdges = (result?.data?.instructionalEvents?.edges || []);

                // Destruct to node data
                const scheduleData = scheduleEdges.map((edge) => edge.node);

                // Set to object
                setSchedule(() => scheduleData);
                //
                setLoadingStatus(false);
            }
            catch (error) {
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
    const sections = [];
    return (
        <Fragment>
            {schedule && (
                <div className={classes.cards}>

                    {schedule.map((schedule) => {
                        const { recurrence: { repeatRule: { type, daysOfWeek }, timePeriod: { startOn, endOn } }, section: { titles: classTitle }, locations } = schedule;
                        const { room: { number: roomNum, building }, site } = locations[0].location

                        const listDay = daysOfWeek.map((day) =>
                            <ListItem key={day}>{day}</ListItem>
                        )
                        console.log(schedule.section)
                        return (
                            <Typography key={schedule.id}>
                                <List>
                                    <ListItem><b>Class Title:</b> {classTitle[0].value}</ListItem>
                                    <ListItem><b>Day of Week:</b> {listDay} </ListItem>
                                    <ListItem><b>Start:</b> {startOn} </ListItem>
                                    <ListItem><b>End:</b> {endOn} </ListItem>
                                    <ListItem><b>Repeat Type:</b> {type} </ListItem>
                                    <ListItem><b>Building:</b> {building.title} </ListItem>
                                    <ListItem><b>Room:</b> {roomNum} </ListItem>
                                    <ListItem><b>Campus:</b> {site} </ListItem>
                                </List>
                            </Typography>
                        )
                    })}
                </div>
            )}
        </Fragment >
    );
};
ViewMySchedule.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired
}

export default withStyles(styles)(ViewMySchedule);
