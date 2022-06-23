module.exports = {
    "name": "Grade Assignment",
    "publisher": "Huey Phan",
    "version": "1.0.0",
    "cards": [{
        "type": "GraphQLQueryCard",
        "source": "./src/cards/GradeAssignmentCard",
        "title": "Grade Assignment",
        "displayCardType": "GraphQL Grade Assignment",
        "description": "Grade Assignment",
        "pageRoute" : {
            "route": "/",
            "excludeClickSelectors": ['#link']
        },
        "queries": {
            "section-list": [
                {
                    "resourceVersions": {
                        "sections": {min: 16},
                        "courses": {min: 16},
                        "subjects": {min: 6},
                        "sectionStatuses" : {min: 11},
                        "academicPeriods": { min: 16}
                    },
                    "query":
                        `query sectionList($sectionIds: [ID], $todayDate: Date){
                            sections: {sections} (
                                    sort:{reportingAcademicPeriod16:{code:ASC}}
                                    filter: {
                                        id: {IN: $sectionIds}
                                        startOn:{BEFORE: $todayDate}
                                    }
                                )
                                {
                                    edges {
                                        node {
                                            id
                                            startOn
                                            endOn
                                            titles {
                                                value
                                            }
                                            code
                                            reportingAcademicPeriod16 {
                                                code
                                                title
                                                registration
                                            }
                                            status {
                                                category
                                                detail11 {
                                                    title
                                                    category
                                                    description
                                                }
                                            }
                                            maxEnrollment
                                            crossListed
                                            alternateIds {
                                                title
                                                value
                                            }
                                            course: {course} {
                                                subject: {subject} {
                                                    abbreviation
                                                }
                                                number
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
        "source": "./src/page/gradeAssignmentPage.jsx"
    }
}