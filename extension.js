module.exports = {
    "name": "Transcripts and Records",
    "publisher": "Huey Phan",
    "cards": [{
        "type": "GraphQL Card",
        "source": "./src/cards/TranscriptsAndRecords",
        "title": "Transcripts and Records",
        "displayCardType": "GraphQL Card",
        "description": "Transcripts and Records",
        configuration: {
            client: [
                {
                    key: "pipelineAPI",
                    label: "Pipeline API",
                    type: "text"
                }
            ],
            server: [
                {
                    key: "ethosApiKey",
                    label: "Ethos API",
                    type: "password",
                    required: true
                },
                {
                    key: "userId",
                    label: "User Id",
                    type: "password",
                    required: true
                },
                {
                    key: "password",
                    label: "password",
                    type: "password",
                    required: true
                }
            ]
        },
        "queries": {
            "person-info": [
                {
                    "resourceVersions": {
                        "persons": { min: 12 }
                    },
                    "query":
                        `query personInfo($personId: ID) {
                            persons: {persons} (
                                filter: {
                                    id: { EQ: $personId }
                                }
                            ) {
                                edges {
                                    node {
                                        id
                                        names {
                                            firstName
                                            lastName
                                        }
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
        }

    }]
}