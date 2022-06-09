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
        "queries": {
            "section-list": [
                {
                    "resourceVersions": {
                        "sections": {min: 16},
                        "reportingAcademicPeriods" : {min: 16},
                        "courses": {min: 16},
                        "subjects": {min: 6},
                        "SectionStatuses" : {min: 11}
                    },
                    "query":
                        `query sectionList($sectionId: ID){
                            sections: {sections} (
                                    filter: {
                                        id: {EQ: $sectionId}
                                    }
                                )
                                {
                                    edges {
                                        node {
                                            id
                                            titles {
                                                value
                                            }
                                            code
                                            reportingAcademicPeriod: {reportingAcademicPeriods} {
                                                code
                                                title
                                                registration
                                            }
         
                                            maxEnrollment
                                            crossListed
                                            alternateIds {
                                                title
                                                value
                                            }
                                            course: {courses} {
                                                subject: {subjects} {
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
        "source": "./src/page/index.jsx"
    }
}