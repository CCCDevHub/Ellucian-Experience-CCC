import React, { useState, useEffect, Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing10, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, Button, TextLink, List, ListItem, Calendar, CalendarLegend, CalendarLegendItem, views, momentLocalizer } from '@ellucian/react-design-system/core';
import moment from 'moment';
import { saffron600 } from '@ellucian/react-design-system/core/styles/tokens';

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

    // Create event
    const [event, setEvent] = useState({});

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const sectionsEvents = [];

    // Create set event function to get event object
    const onSelectEvent = (e) => {
        setEvent(e);
    };

    useEffect(() => {
        (async () => {
            setLoadingStatus(true)
            try {
                // Get Etho Query from index.js
                const result = await getEthosQuery({ queryId: 'schedule-list' });

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

    // Loop through schedule
    for (const item in schedule) {
        if (item) {
            // Destruct each item in schedule
            const { recurrence: { repeatRule: { type: repeatType, daysOfWeek }, timePeriod: { startOn, endOn } }, section: { titles: classTitle }, locations } = schedule[item];

            // Destruct location to get room and building
            const { room: { number: roomNum, building }, site } = locations[0].location


            // Get List of day in each class
            const dayList = [];

            for (const day in daysOfWeek) {
                if (day) {
                    dayList.push(daysOfWeek[day].toUpperCase())
                }
            }

            // Set start/end Date
            const startDate = new Date('2022, 01, 01');
            const endDate = new Date('2022, 06, 01');

            // Set the loop as startDate
            let loop = new Date(startDate);

            // Loop through startDate to endDate and create Event if loop day is Monday or Tuestday, etc.
            while (loop <= endDate) {
                if (dayList.includes(days[loop.getDay()]) && repeatType === 'weekly') {
                    const classEvent = {
                        title: classTitle[0].value,
                        start: new Date(loop),
                        end: new Date(loop),
                        room: building.title + ' ' + roomNum
                    }
                    sectionsEvents.push(classEvent);
                }
                // Create next date
                const newDate = loop.setDate(loop.getDate() + 1);
                loop = new Date(newDate);
            }

        }
    }

    const testEvent =
    {
        title: 'MIT200',
        allDay: true,
        start: new Date('2022, 03, 16'),
        end: new Date('2022, 03, 16')
    };

    // Craete Calendar
    const MyCalendar = (schedule) => {
        moment.locale('en')
        return (
            <div>
                <Calendar
                    defaultView={views.DAY}
                    views={[views.DAY, views.WORK_WEEK]}
                    timeslots={1}
                    step={60}
                    events={sectionsEvents}
                    style={{ height: 900 }}
                    min={moment('7:00am', 'h:mma').toDate()}
                    max={moment('9:00pm', 'h:mma').toDate()}
                    // set Event to event select function
                    onSelectEvent={onSelectEvent}
                    onKeyPressEvent={onSelectEvent}
                />
            </div >
        )
    }

    // Render Calendar

    return (
        <Fragment>
            <MyCalendar />
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
