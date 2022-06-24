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
                        "academicPeriods": { min: 16},
                        "sectionInstructors": {min: 10},
                        "persons": {min: 12}
                    },
                    "query":
                        `query sectionList($personId: ID, $todayDate: Date){
                            	sectionInstructors: {sectionInstructors} (
                                    filter: {
                                        {instructor@persons} : { id: { EQ: $personId } }
                                        {section@sections}: { startOn: { BEFORE: $todayDate } }
                                    }
                                    sort: {{section@sections}:{{reportingAcademicPeriod@academicPeriods}:{code:DESC}}}
                                ) {
                                    edges {
                                        node {
                                            id
                                            section16 {
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