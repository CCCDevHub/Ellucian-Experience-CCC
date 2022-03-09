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
            "list-schedule": [
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
                        `{
                            instructionalEvents: {instructionalEvents}(
                                filter: { 
                                    id: { 
                                        IN: [
                                            "006aa7bf-bc88-4afe-8aae-907d3d48d3c2",
                                            "007b4486-eb6b-4071-8f9b-48951414021a"
                                            "00923c44-4798-4d84-ab72-5392b29aedab"
                                            "00b49925-8661-4136-8913-2a58c994a0c9"
                                        ]
                                    } 
                                }
                            ) {
                                edges {
                                    node {
                                        id
                                        instructionalMethod: {instructionalMethod} {
                                            abbreviation
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
            ]
        }
    }],
    "page": {
        "source": "./src/page/index.jsx"
    }
}