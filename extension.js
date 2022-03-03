module.exports = {
    "name": "View My Schedule",
    "publisher": "Huey Phan",
    "version": "1.0.0",
    "cards": [{
        "type": "GraphQLQueryCard",
        "source": "./src/cards/ViewMyScheduleCard",
        "title": "View My Schedule",
        "displayCardType": "GraphQL Query View My Schedule",
        "description": "GraphQL Query View My Schedule",
        "queries": {
            "list-instructional-events": [
                {
                    "resourceVersions": {
                        "instructionalEvents": { min: 8 },
                        "instructionalMethods": { min: 6 },
                        "instructors": { min: 12 },
                        "sections": { min: 16 },
                        "sites": { min: 6 },
                        "rooms": { min: 10 },
                        "buildings": { min: 6 }
                    },
                    "query":
                        `{
                            query listInstructionalEvents($sectionId: ID) {
                                instructionalEvents {instrucitonalEvents}(
                                    filter: { {sections}: {
                                        id: { EQ: $sectionID } }
                                    }
                                    
                                ) {
                                    edges {
                                        node {
                                            id
                                            instructionalMethod: {instructionalMethod} {
                                                abbreviation
                                            }
                                            instructorRoster {
                                                instructor: {instructor} {
                                                    names {
                                                        fullName
                                                        title
                                                        pedigree
                                                    }
                                                }
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
                        }`
                }
            ],
            "list-classes": [
                {
                    "resourceVersions": {
                        "sectionRegistrations": { min: 16 },
                        "sections": { min: 16 },
                        "persons": { min: 12 }
                    },
                    "query":
                        `query listClasses($personId: ID, $yesterday: Date, $tomorrow: Date) {
                            sectionRegistrations(
                                filter: {
                                    {registrant@persons}: { id: { EQ: $personID } }
                                    {sections}: { startOn: { BEFORE: $tomorrow }, endOn: { AFTER: $yesterday } }
                                }
                            ) {
                                edges {
                                    node {
                                        id
                                        {sections}: sections {
                                            id
                                            startOn
                                            endOn
                                            titles {
                                                value
                                            }
                                        }
                                        {registrant@persons}: registrant {
                                            id
                                            names {
                                                fullName
                                            }
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