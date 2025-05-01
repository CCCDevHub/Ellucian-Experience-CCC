module.exports = {
    name: "LancerPoint Registration",
    publisher: "Huey Phan",
    cards: [{
        type: "GraphQL Card",
        source: "./src/cards/LancerPointRegistration",
        title: "LancerPoint Registration",
        displayCardType: "GraphQL Card",
        description: "LancerPoint Registration",
        queries: {
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
            ],
            'getPerson': [
                {
                    resourceVersions: {
                        persons: { min: 12 }
                    },
                    query:
                        `query getPerson($personId: ID){
                            persons: {persons} (
                                    filter: {
                                        id: {EQ: $personId}
                                        credentials: { type: { EQ: bannerId}}
                                    }
                                )
                                {
                                    edges {
                                        node {
                                            id
                                            credentials {
                                                value
                                                type
                                            }
                                        }
                                    }
                                }
                        }`
                }
            ]
        },
        configuration: {
            client: [
                {
                    key: 'PCCVTEA',
                    label: 'PCCVTEA Pipeline API',
                    type: 'text',
                    required: true
                }
            ],
            server: [
                {
                    key: 'ethosApiKey',
                    label: 'Ethos API',
                    type: 'password',
                    required: true
                }
            ]
        }
    }]
}