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
    const [sections, setSections] = useState();
    // Create event
    const [event, setEvent] = useState({});

    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const sectionsEvents = [];
    const sectionIdList = ["0a116178-76a6-4e7a-8577-e03a285e9ea4", "27f2bae9-8249-437b-a908-64609591b96a", "ab0101a0-883d-43fd-a743-6be4f5628be4", "57944a38-6af5-42d2-82b3-60b36f9b4a24", "aae04d9c-2a54-43e3-9d1c-2993d19c236e"]
    // Create set event function to get event object
    const onSelectEvent = (e) => {
        setEvent(e);
    };
    useEffect(() => {
        (async () => {
            setLoadingStatus(true)
            try {
                // Get Etho Query from index.js
                // const sectionResult = await getEthosQuery({ queryId: 'section-list' });
                // const sectionEdges = (sectionResult?.data?.instructionalEvents?.edges || []);
                // const sectionData = sectionEdges.map((edge) => edge.node);
                //  setSections(() => sectionData);
                // const testSchedule = await getEthosQuery({ queryId: 'schedule-list', properties: { sectionIds: testingString } });
                // console.log(testSchedule);
                const schedulePromises = []
                const scheduleList = []
                for (const sectionId of sectionIdList) {
                    const promise = getEthosQuery({ queryId: 'schedule-list', properties: { sectionId: sectionId } });
                    schedulePromises.push(promise);
                }
                const scheduleResult = await Promise.all(schedulePromises);
                scheduleResult.forEach((result) => {
                    // Destruct to Edges
                    const scheduleEdges = (result?.data?.instructionalEvents?.edges || []);
                    // Destruct to node data
                    const scheduleData = scheduleEdges.map((edge) => edge.node);
                    scheduleList.push(scheduleData)
                })
                // Set to object
                setSchedule(() => scheduleList);
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
    console.log(event);

    // Loop through schedule
    getEvents(schedule, days, sectionsEvents);

    // Create Calendar
    const MyCalendar = (schedule) => {
        return (
            <div>
                <Calendar
                    defaultView={views.DAY}
                    views={[views.DAY, views.WORK_WEEK, views.AGENDA]}
                    timeslots={2}
                    step={60}
                    events={sectionsEvents}
                    style={{ height: 900 }}
                    min={moment('6:00am', 'h:mma').toDate()}
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

function destructClasses(schedule, sectionsEvents, days) {
    let counter = 0;

    for (const eachSchedule of schedule) {
        const { instructionalMethod: { title: classType }, recurrence: { repeatRule: { type: repeatType, daysOfWeek }, timePeriod: { startOn, endOn } }, section: { titles: classTitles }, locations } = eachSchedule;
        const { roomNum, buildingName } = destructBuildingRoom(locations);

        // Destruct location to get room and building
        // Get List of day in each class
        const dayList = [];

        for (const day in daysOfWeek) {
            if (day) {
                dayList.push(daysOfWeek[day].toUpperCase());
            }
        }

        // Set start/end Date
        const startDate = new Date('2022, 01, 01');
        const endDate = new Date('2022, 06, 01');
        // const startDate = startOn;
        // const endDate = endOn;
        // Set the loop as startDate
        let loop = new Date(startDate);

        // Loop through startDate to endDate and create Event if loop day is Monday or Tuestday, etc.
        while (loop <= endDate) {
            if (dayList.includes(days[loop.getDay()]) && repeatType === 'weekly') {
                const yr = loop.getFullYear();
                const month = loop.getMonth();
                const da = loop.getDate();
                const classEvent = {
                    id: counter,
                    title: classTitles[0].value + ' ' + classType.toUpperCase() + ' \n' + buildingName + ' ' + roomNum,
                    start: new Date(yr, month, da, new Date(startOn).getHours(), new Date(startOn).getMinutes(), new Date(startOn).getSeconds()),
                    end: new Date(yr, month, da, new Date(endOn).getHours(), new Date(endOn).getMinutes(), new Date(endOn).getSeconds())
                    //  room: building.title + ' ' + roomNum
                };
                sectionsEvents.push(classEvent);
                counter += 1;
            }
            // Create next date
            const newDate = loop.setDate(loop.getDate() + 1);
            loop = new Date(newDate);
        }
    }
}

function getEvents(schedule, days, sectionsEvents) {
    for (const item in schedule) {
        if (item) {
            if (schedule[item].length > 0) {
                destructClasses(schedule[item], sectionsEvents, days);
            }
        }
    }
}

function destructBuildingRoom(locations) {
    if (locations.length != 0) {
        const { room: { number: roomNum, building: { title: buildingName } }, site } = locations[0].location;
        return { roomNum, buildingName };
    }
    else {
        const roomNum = "";
        const buildingName = "ONLINE"
        return { roomNum, buildingName };
    }
}

ViewMySchedule.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired
}

export default withStyles(styles)(ViewMySchedule);

