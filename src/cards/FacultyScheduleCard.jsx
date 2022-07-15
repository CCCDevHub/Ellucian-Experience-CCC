import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing10, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, Calendar, views, Tabs, Tab, TextLink } from '@ellucian/react-design-system/core';
import moment from 'moment';

// eslint-disable-next-line no-warning-comments
// TODO: Filter out classes that are not in semester time frame, change URL TextLink to direct to Faculty class

const styles = () => ({
    card: {
        marginLeft: spacing40,
        marginRight: spacing40,
        paddingTop: spacing10
    },
    image: {
        width: '100%',
        height: 'auto'
    },
    list: {
        display: 'flex',
        gap: spacing40
    }

});

const ViewMySchedule = (props) => {
    const {
        classes,
        data: { getEthosQuery },
        cardControl: {
            setLoadingStatus,
            setErrorMessage
        }
    } = props;

    const [schedule, setSchedule] = useState();
    // Create event
    const [event, setEvent] = useState({});
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const onlineSections = [];
    const sectionsEvents = [];
    const todayDate = new Date().toJSON().slice(0, 10);

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
                const promise = getEthosQuery({ queryId: 'schedule-list', properties: {todayDate: todayDate } });
                schedulePromises.push(promise);

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
    // Loop through schedule
    getEvents(schedule, days, sectionsEvents, onlineSections);
    const unAssignedClasses = ( () => {
        if (onlineSections.length !== 0) {
            return (
                <Typography paragraph className={classes.card}>
                    Unassigned Meeting Times:
                    <Typography paragraph className={classes.list}>
                        {onlineSections.map(n => {
                            return (
                                <TextLink key={n.id} target="_blank"
                                    href={`https://ssb-prod.ec.pasadena.edu/ssomanager/saml/login?relayState=/c/auth/SSB?pkg=bwlkifac.P_FacSched?term_in=${n.termCode}`}>
                                    {n.dept} - {n.csn}
                                </TextLink>
                            )
                        })}
                    </Typography>
                </Typography>
            )
        } else {
            return (null)
        }
    });
    // Render Calendar
    return (
        <div>
            <div>
                {unAssignedClasses()}
                <Calendar className={classes.card}
                    defaultView={views.AGENDA}
                    views={[views.DAY, views.WEEK, views.AGENDA]}
                    step={60}
                    events={sectionsEvents}
                    style={{ height: 550 }}
                    min={moment('6:00am', 'h:mma').toDate()}
                    max={moment('9:00pm', 'h:mma').toDate()}
                    // set Event to event select function
                    onSelectEvent={onSelectEvent}
                    onKeyPressEvent={onSelectEvent}
                    popperContent={
                        // Sample popper content here
                        <div className={classes.card}>
                            <Typography variant="h4">
                                <b>{event.title}</b>
                            </Typography>
                            <br />
                            <Typography variant="h5">
                                {event.type}
                            </Typography>
                            <br />
                            <Typography color="textSecondary">
                                {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
                            </Typography>
                            <Typography color="textSecondary">Room: {event.room}</Typography>
                        </div>
                    }
                />
            </div>
        </div >
    );
};

function destructClasses(schedule, sectionsEvents, days, onlineSections) {
    let counter = 0;
    const sectionIdSet = new Set();

    for (const eachSchedule of schedule) {
        const { instructionalMethod: { title: classType }, recurrence: { repeatRule: { type: repeatType, daysOfWeek }, timePeriod: { startOn, endOn } }, section: { id: sectionId, code: crn, titles: classTitles, site, reportingAcademicPeriod16: { code: termCode }, course }, locations } = eachSchedule;
        const location = destructBuildingRoom(locations);
        const { subject, number: csn } = course || {};
        const { abbreviation: dept } = subject || {};
        // Destruct location to get room and building
        // Get List of online Classes
        if (site.code === 'DE') {
            if (!sectionIdSet.has(sectionId)) {
                onlineSections.push(createOnlineClassesData(dept, csn, crn, termCode));
            }
        }
        sectionIdSet.add(sectionId);

        // Get List of day in each class
        const dayList = [];
        for (const day in daysOfWeek) {
            if (day) {
                dayList.push(daysOfWeek[day].toUpperCase());
            }
        }

        // Set start/end Date
        // const startDate = new Date('2022, 01, 01');
        // const endDate = new Date('2022, 06, 01');
        const startDate = new Date(startOn);
        const endDate = new Date(endOn);

        // Add online classes to the calendar

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
                    title: `${classTitles[1].value}`,
                    type: ` ${classType.toUpperCase()}`,
                    start: new Date(yr, month, da, new Date(startOn).getHours(), new Date(startOn).getMinutes(), new Date(startOn).getSeconds()),
                    end: new Date(yr, month, da, new Date(endOn).getHours(), new Date(endOn).getMinutes(), new Date(endOn).getSeconds()),
                    room: `${location}`
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

function createOnlineClassesData(dept, csn, crn, termCode) {
    return { dept, csn, crn, termCode };
}


function getEvents(schedule, days, sectionsEvents, onlineSections) {
    for (const item in schedule) {
        if (item) {
            if (schedule[item].length > 0) {
                destructClasses(schedule[item], sectionsEvents, days, onlineSections);
            }
        }
    }
}

function destructBuildingRoom(locations) {
    if (locations.length !== 0) {
        const { room: { number: roomNum, building: { title: buildingName } } } = locations[0].location;
        return `${buildingName}-${roomNum}`;
    }
    else {
        return "ONLINE";
    }
}

ViewMySchedule.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired
}

export default withStyles(styles)(ViewMySchedule);

