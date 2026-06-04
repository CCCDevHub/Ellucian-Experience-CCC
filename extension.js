module.exports = {
    name: "GoPass",
    publisher: "Huey Phan",
    cards: [{
        type: "API Card",
        source: "./src/cards/GoPass",
        title: "GoPass",
        displayCardType: "API Card",
        description: "GoPass Code",
        configuration: {
            client: [
                {
                    key: "getData",
                    label: "Get Data from Insight",
                    type: "text"
                },
                {
                    key: "insertData",
                    label: "Insert Data to Insight",
                    type: "text"
                }
            ]
        },
        queries: {
            "person-info": [
                {
                    "resourceVersions": {
                        "persons": { min: 12 }
                    },
                    "query":
                        `query personInfo($personId: ID){
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
                }
            ]
        }
    }]
}