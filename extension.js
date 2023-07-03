module.exports = {
    "name": "Helpdeck Tickets",
    "publisher": "PCC",
    "cards": [{
        "type": "Helpdesk Tickets",
        "source": "./src/cards/FreshService",
        "title": "Helpdesk Ticket",
        "displayCardType": "Custom Card",
        "description": "View your freshservice tickets",
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['#freshService_TicketLink', '#freshService_RequiredUserId','#freshService_RequiredAPIKey','#freshService_ContinueButton', '#freshService_RequiredFields']
        }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}