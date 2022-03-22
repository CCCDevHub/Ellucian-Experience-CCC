module.exports = {
    "name": "ViewMySchedule",
    "publisher": "Huey Phan",
    "version": "1.0.1",
    "configuration": {
    },
    "cards": [{
        "type": "ViewMySchedule",
        "source": "./src/cards/ViewMyScheduleCard",
        "title": "View My Schedule",
        "displayCardType": "GraphQL Query",
        "description": "View My Schedule GraphQL Query",
        "configuration": {
            client: [
                {
                    key: 'message',
                    label: 'Your Message',
                    type: 'text'
                }
            ]
        },
        "queries": {
            "schedule-list": [
                {
                    "resourceVersions": {
                        "instructionalEvents": { min: 8 },
                        "instructionalMethods": { min: 6 },
                        "sections": { min: 16 },
                        "sites": { min: 6 },
                        "rooms": { min: 10 },
                        "buildings": { min: 6 }
                    },
                    "query":
                        `query instructionalEventsBySections($sectionId: ID){
                            instructionalEvents: {instructionalEvents}(
                                filter: { 
                                    {section}: {
                                        id: {
                                            EQ: $sectionId                                           
                                        }
                                    }
                                }
                            ) {
                                edges {
                                    node {
                                        id
                                        instructionalMethod: {instructionalMethod} {
                                            title
                                        }
                                        instructorRoster {
                                            instructorRole
                                        }
                                        recurrence {
                                            timePeriod {
                                                startOn
                                                endOn
                                            }
                                            repeatRule {
                                                type
                                                interval
                                                ends {
                                                    repetitions
                                                    date
                                                }
                                                daysOfWeek
                                                repeatBy {
                                                    dayOfWeek {
                                                        day
                                                    }
                                                }
                                            }
                                        }
                                        section: {section} {
                                            titles {
                                                value
                                            }
                                        }
                                        locations {
                                            location {
                                                site: {site} {
                                                    title
                                                    code
                                                }
                                                room: {room} {
                                                    number
                                                    floor
                                                    title
                                                    building: {building} {
                                                        title
                                                    }
                                                    floor
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        `
                }
            ],
            "section-registration-list": [
                {
                    "resourceVersions": {
                        "sectionRegistrations": { min: 16 },
                        "sections": { min: 16 }
                    },
                    "query":
                        `query sectionRegistrationsByPerson($personId: ID, $startDate: Date, $endDate: Date){
                            sectionRegistrations: {sectionRegistrations}(
                                		limit: 10
                                        sort: { id: DESC }
                            ){
                                edges {
                                    node {
                                        section: {section} {
                                            id
                                        }
                                    }
                                }
                            }
                        }`
                }
            ]
        }
    }],
    "page": {
        "source": "./src/page/index.jsx"
    }
}