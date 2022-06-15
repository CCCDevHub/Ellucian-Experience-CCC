import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing10, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, Calendar,  views, Tabs, Tab, TextLink } from '@ellucian/react-design-system/core';
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
    const onlineSections = [];
    const sectionsEvents = [];
    const sectionIdList = ["cb9475e2-69ee-437e-88ff-6e190f30d282",
        "581fee9e-5e7d-41c8-8205-3929a47f411e",
        "00531855-6397-441f-b876-8efd87ec8c65",
        "ef1b341b-6776-4834-8447-462eac7fd5ad",
        "0648f603-7196-48bb-9c45-c2f3863202a5",
        "e1b808f7-2ec7-4b31-88c0-08c10ba0433b",
        "3ec2dfc8-0147-418e-86b1-d4d1ad1aad3d",
        "2367fc5c-75b9-4b4e-9c43-59c6f7bbcf1a"]
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
                const promise = getEthosQuery({ queryId: 'schedule-list', properties: { sectionIds: sectionIdList } });
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

    // Render Calendar
    return (
        <div>
            <Typography paragraph className={classes.card}>
                Online Classes:
                <Typography paragraph className={classes.list}>
                    {onlineSections.map(n => {
                        return (
                        <TextLink key={n.id} target="_blank"
                                  // href={`https://ssb-prod.ec.pasadena.edu/PROD/bwlkifac.P_FacSched?term_in=${n.termCode}`}>
                                  href={`https://ssb-dev.ec.pasadena.edu:9003/TEST/bwlkifac.P_FacSched?term_in=${n.termCode}`}>
                            {n.dept} - {n.csn}
                        </TextLink>
                        )
                    })}
                </Typography>
            </Typography>
            <div>
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

    for (const eachSchedule of schedule) {
        const { instructionalMethod: { title: classType }, recurrence: { repeatRule: { type: repeatType, daysOfWeek }, timePeriod: { startOn, endOn } }, section: { code: crn, titles: classTitles, site, reportingAcademicPeriod16: { code: termCode}, course: { subject: { abbreviation: dept }, number: csn } }, locations } = eachSchedule;
        const location = destructBuildingRoom(locations);
        // Destruct location to get room and building

        // Get List of online Classes
        if (site.code === 'DE') {
            onlineSections.push(createOnlineClassesData(dept, csn, crn, termCode));
        }
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
    return {dept, csn, crn, termCode};
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

