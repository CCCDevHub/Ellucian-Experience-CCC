module.exports = {
    "name": "ViewMyInfo",
    "publisher": "Huey Phan",
    "version": "1.0.0",
    "cards": [{
        "type": "GraphQLQueryCard",
        "source": "./src/cards/MyInfo",
        "title": "View My Info",
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
                                            dateOfBirth
                                            names {
                                                fullName
                                            }
                                            credentials {
                                                value
                                                type
                                            }
                                            emails {
                                                address
                                                type {
                                                    emailType
                                                }
                                            }
                                            roles {
                                                role
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
        "source": "./src/page/index.jsx"
    }
}