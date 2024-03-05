module.exports = {
    name: "Academic Standing",
    publisher: "Huey Phan",
    cards: [{
        type: "AcademicStandingCard",
        source: "./src/cards/AcademicStanding",
        title: "Academic Standing",
        displayCardType: "GraphQL Card",
        description: "Show student's academic standing",
        queries: {
            "academic-standing": [{
                resourceVersions: {
                    academicPeriods: {
                        min: 16
                    },
                    academicStandings: {
                        min: 8
                    },
                    persons: {
                        min: 12
                    },
                    studentAcademicStandings: {
                        min: 8
                    },
                    students: {
                        min: 12
                    }
                },
                query: `query academicStanding($personId: ID){
                    studentAcademicStandings: {studentAcademicStandings}(
                        filter: {
                            {student@persons}: { id: { EQ: $personId } }
                        }
                        sort: { {academicPeriod}: { code: ASC } }
                    ) {
                        edges {
                            node {
                                id
                                academicPeriod: {academicPeriod} {
                                    title
                                    code
                                    startOn
                                    endOn
                                }
                                student: {student@persons} {
                                    id
                                }
                                standing: {standing@academicStandings} {
                                    title
                                    code
                                    description
                                }
                            }
                        }
                    }
                }`
            }]
        }
    }]
}