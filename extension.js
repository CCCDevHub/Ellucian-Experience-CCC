module.exports = {
    "name": "MyInfo",
    "publisher": "Huey Phan",
    "version": "1.0.0",
    "cards": [{
        "type": "GraphQLQueryCard",
        "source": "./src/cards/MyInfo",
        "title": "My Info",
        "displayCardType": "GraphQL Query View My Info",
        "description": "GraphQL Query View My Info",
        "queries": {
            "person-info": [
                {
                    "resourceVersions": {
                        "persons": {min: 12}
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
                                                fullName
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
            ],
            "person-hold": [
                {
                    "resourceVersions": {
                        "persons": {min: 12},
                        "personHolds": {min: 6}
                    },
                    "query":
                        `query personHoldInfo($personId : ID) {
                            personHolds: {personHolds} (
                                filter:{
                                    {person@persons}: {
                                        id: {EQ: $personId}
                                    }
                                }
                            ) {
                                edges {
                                    node {
                                        id
                                        type {
                                            detail6 {
                                                title
                                                category
                                                description
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
    }],
    "page": {
        "source": "./src/page/index.jsx"
    }
}