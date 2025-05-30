module.exports = {
    name: "Section Add Authorization Code",
    publisher: "Huey Phan",
    cards: [{
        type: "GraphQlQueryCard",
        source: "./src/cards/Section-Authorization-Code",
        title: "Section Add Authorization Code",
        displayCardType: "Section Add Authorization Code",
        description: "Section Add Authorization Code",
        pageRoute: {
            route: "/",
            excludeClickSelectors: ['a']
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
        queries: {
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
            ],
            'term-list': [
                {
                    resourceVersions: {
                        academicPeriods: { min: 16 }
                    },
                    query:
                        `query termList{
                            academicPeriods: {academicPeriods} (
                                filter: { code: { STARTS_WITH: "2" } }
                                sort: { startOn: DESC }
                            ) {
                                totalCount
                                edges {
                                node {
                                    id
                                    code
                                    title
                                }
                                }
                            }
                        }`
                }
            ]
        }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}