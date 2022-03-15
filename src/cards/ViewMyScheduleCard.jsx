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
    const [event, setEvent] = useState({});

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const sectionsEvents = [];
    const dayList = [];

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


    for (const item in schedule) {
        if (item) {
            const { recurrence: { repeatRule: { type: repeatType, daysOfWeek }, timePeriod: { startOn, endOn } }, section: { titles: classTitle }, locations } = schedule[item];
            const { room: { number: roomNum, building }, site } = locations[0].location

            for (const day in daysOfWeek) {
                if (day) {
                    dayList.push(daysOfWeek[day].toUpperCase())
                }
            }

            const startDate = new Date('2022, 01, 01');
            const endDate = new Date('2022, 06, 01');

            let loop = new Date(startDate);

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

    const TestCalendar = (schedule) => {
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
                    onSelectEvent={onSelectEvent}
                    onKeyPressEvent={onSelectEvent}
                    popperContent={
                        <h1>TEST</h1>
                    }
                />
            </div >
        )
    }

    return (
        <Fragment>
            <TestCalendar />
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
