module.exports = {
    "name": "Grade Assignment",
    "publisher": "Pasadena City College",
    "version": "1.4.0",
    "cards": [{
        "type": "GraphQLQueryCard",
        "source": "./src/cards/GradeAssignmentCard",
        "title": "Faculty Grade Assignment",
        "displayCardType": "GraphQL Grade Assignment",
        "description": "Grade Assignment",
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['#link']
        },
        configuration: {
            client: [{
                key: 'pipelineAPI',
                label: 'Pipeline API',
                type: 'text'
            },
            ],
            server: [{
                key: 'ethosApiKey',
                label: 'Ethos API',
                type: 'password',
                required: true
            }]
        },
        "queries": {
            "section-list": [
                {
                    "resourceVersions": {
                        "sections": { min: 16 },
                        "courses": { min: 16 },
                        "subjects": { min: 6 },
                        "sectionStatuses": { min: 11 },
                        "academicPeriods": { min: 16 },
                        "sectionInstructors": { min: 10 },
                        "persons": { min: 12 },
                        "instructionalMethods": { min: 6 }
                    },
                    "query":
                        `query sectionList($personId: ID){
                            	sectionInstructors: {sectionInstructors} (
                                    filter: {
                                        {instructor@persons} : { id: { EQ: $personId } }
                                    }
                                    sort: {{section@sections}:{{reportingAcademicPeriod@academicPeriods}:{code:DESC}}}
                                ) {
                                    edges {
                                        node {
                                            id
                                            instructionalMethod6 {
                                                title
                                                abbreviation
                                            }
                                            section16 {
                                                id
                                                startOn
                                                endOn
                                                gradeSubmitted
                                                titles {
                                                    value
                                                }
                                                code
                                                reportingAcademicPeriod16 {
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
                                                course16 {
                                                    subject: {subject} {
                                                        abbreviation
                                                    }
                                                    number
                                                }
                                            }
                                            instructor12 {
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
        "source": "./src/page/gradeAssignmentPage.jsx"
    }
}