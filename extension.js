module.exports = {
    "name": "Requester Helpdesk Tickets",
    "publisher": "PCC",
    "cards": [{
        "type": "Requester Helpdesk Tickets",
        "source": "./src/cards/FreshServiceRequester",
        "title": "Requested Helpdesk Tickets",
        "displayCardType": "Custom Card",
        "description": "View your requested freshservice tickets",
        "queries": {
            "person-email": [
                {
                    "resourceVersions": {
                        "persons": { min: 12 }
                    },
                    "query":
                        `query personEmail($personId: ID) {
                        persons: {persons}(
                            filter: {
                                id: { EQ: $personId }
                                emails: { type: { emailType: { IN: [school, hr] } } }
                            }
                        ) {
                            edges {
                                node {
                                    id
                                    emails {
                                        address
                                        type {
                                            emailType
                                        }
                                    }
                                }
                            }
                        }
                    }`
                }
            ]
        },
        "configuration": {
            server: [{
                key: 'fresh-service-key',
                label: 'key',
                type: 'password'
            }]
        },
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['#freshServiceRequested_TicketLink', '#freshServiceRequested_RequiredUserEmail', '#freshServiceRequested_RequiredAPIKey', '#freshServiceRequested_ContinueButton', '#freshServiceRequested_RequiredFields']
        }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}