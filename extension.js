module.exports = {
    name: "Test Scores Card 2",
    publisher: "kawaters",
    cards: [{
        type: "TestScoresCard2",
        source: "./src/cards/TestScoresCard",
        title: "Test Scores",
        displayCardType: "Card Type",
        description: "Card Description",
        configuration: {
            client: [{
                    key: "getData",
                    label: "Get Data from Insight",
                    type: "text"
                },
                {
                    key: "getTestScore",
                    label: "get student Test Score",
                    type: "text"
                }
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
            "person-info": [{
                "resourceVersions": {
                    "persons": {
                        min: 12
                    }
                },
                "query": `query personInfo($personId: ID){
                            persons: {persons} (
                                    filter: {
                                        id: {EQ: $personId}
                                    }
                                )
                                {
                                    edges {
                                        node {
                                            id
                                            gender
                                            names {
                                                firstName
                                                lastName
                                            }
                                            dateOfBirth
                                            veteranStatus {
                                                category
                                            }
                                            citizenshipStatus {
                                                category
                                            }
                                            roles {
                                                role
                                            }

                                            credentials {
                                                value
                                                type
                                            }

                                            emails {
                                                type {
                                                    emailType
                                                }
                                                address
                                            }
                                        }
                                    }
                                }
                        }`
            }]
        }
    }],
    page: {
        source: "./src/page/home.jsx"
    }
}