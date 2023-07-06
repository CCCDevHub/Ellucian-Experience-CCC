module.exports = {
    "name": "Requester Helpdeck Tickets",
    "publisher": "PCC",
    "cards": [{
        "type": "Requester Helpdesk Tickets",
        "source": "./src/cards/FreshServiceRequester",
        "title": "Requested Helpdesk Tickets",
        "displayCardType": "Custom Card",
        "description": "View your requested freshservice tickets",

        "configuration": {
            client: [{
                key: 'fresh-service-key',
                label: 'key',
                type: 'password'
            }]
        },
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['#freshServiceRequested_TicketLink', '#freshServiceRequested_RequiredUserEmail','#freshServiceRequested_RequiredAPIKey','#freshServiceRequested_ContinueButton', '#freshServiceRequested_RequiredFields']
        }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}