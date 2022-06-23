module.exports = {
    "name": "Faculty Schedule",
    "publisher": "Huey Phan",
    "version": "1.0.1",
    "configuration": {
    },
    "cards": [{
        "type": "FacultySchedule",
        "source": "./src/cards/FacultyScheduleCard",
        "title": "Faculty Schedule",
        "displayCardType": "GraphQL Query",
        "description": "Faculty Schedule GraphQL Query",
        "queries": {
            "schedule-list": [
                {
                    "resourceVersions": {
                        "instructionalEvents": { min: 8 },
                        "instructionalMethods": { min: 6 },
                        "sections": { min: 16 },
                        "sites": { min: 6 },
                        "rooms": { min: 10 },
                        "buildings": { min: 6 },
                        "courses": {min: 16},
                        "subjects": {min: 6},
                        "academicPeriods": { min: 16}
                    },
                    "query":
                        `query instructionalEventsBySections($personId: ID, $todayDate: Date){
                            instructionalEvents: {instructionalEvents}(
                                filter: { 
                        			instructorRoster: {
                                        instructor12: { id: { EQ: $personId } }
                                    }
                                    {section}: {
                                        endOn:{AFTER: $todayDate} startOn:{BEFORE: $todayDate}
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
                                            instructor12 {
                                                id
                                                names {
                                                    fullName
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
                                            code
                                            startOn
                                            endOn
                                            titles {
                                                value
                                            }
                                            site: {site} {
                                                    title
                                                    code
                                            }
                                            course: {course} {
                                                subject: {subject} {
                                                    abbreviation
                                                    title
                                                }
                                                number
                                            }
                                            reportingAcademicPeriod16 {
                                                code
                                                title
                                                registration
                                                startOn
                                                endOn
                                                censusDates
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

            /* ,
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
             */
        }
    }],
    "page": {
        "source": "./src/page/index.jsx"
    }
}