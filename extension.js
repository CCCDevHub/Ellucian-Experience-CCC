module.exports = {
    name: "Attendance Tracking",
    publisher: "Huey Phan",
    version: "1.0.1",
    cards: [
        {
            type: "GraphQlQueryCard",
            source: "./src/cards/Attendance",
            title: "Class Roster",
            displayCardType: "graphql-query-card",
            description: "Class Roster Card",
            configuration: {
                client: [
                    {
                        key: "pipelineAPI",
                        label: "Pipeline API",
                        type: "text"
                    },
                    {
                        key: "sectionPipelineAPI",
                        label: "Sections Pipeline API",
                        type: "text"
                    },
                    {
                        key: "termPipelineAPI",
                        label: "Terms Pipeline API",
                        type: "text"
                    },
                    {
                        key: "waitlistPipelineAPI",
                        label: "Waitlist Pipeline API",
                        type: "text"
                    },
                ],
                server: [
                    {
                        key: "ethosApiKey",
                        label: "Ethos API",
                        type: "password",
                        required: true
                    }
                ]
            },
            queries: {
                "section-list": [
                    {
                        resourceVersions: {
                            sections: { min: 16 },
                            courses: { min: 16 },
                            subjects: { min: 6 },
                            sectionStatuses: { min: 11 },
                            academicPeriods: { min: 16 },
                            sectionInstructors: { min: 10 },
                            persons: { min: 12 },
                            instructionalMethods: { min: 6 }
                        },
                        query: `
                            query sectionList($personId: ID, $termCode: String) {
                                sectionInstructors: {sectionInstructors} (
                                    filter: {
                                        {instructor@persons}: { id: { EQ: $personId } }
                                        {section@sections}: {
                                            reportingAcademicPeriod16: {
                                                code: { EQ: $termCode }
                                            }
                                        }
                                    }
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
                                                    subject6 {
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
                            }
                        `
                    }
                ]
            }
        }
    ],
    page: {
        source: "./src/page/Home.jsx"
    }
};