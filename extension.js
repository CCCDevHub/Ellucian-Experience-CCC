module.exports = {
    name: "View Unofficial Transcript",
    publisher: "Huey Phan",
    version: "1.0.1",
    cards: [
        {
            type: "GraphQlQueryCard",
            source: "./src/cards/Transcript",
            title: "View Unofficial Transcript",
            displayCardType: "graphql-query-card",
            description: "View Unofficial Transcript Card",
            queries: {
                "current-term": [
                    {
                        resourceVersions: {
                            academicPeriods: { min: 16 }
                        },
                        query: `
                            query termList($todayDate: Date) {
                                academicPeriods: {academicPeriods} (
                                    filter: {
                                        code: {STARTS_WITH: "2"},
                                        startOn: { BEFORE: $todayDate },
                                        endOn: { AFTER: $todayDate }
                                    }
                                    sort: {startOn: DESC}
                                ) {
                                    edges {
                                        node {
                                            id
                                            code
                                            title
                                            startOn
                                            endOn
                                            censusDates
                                            registration
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