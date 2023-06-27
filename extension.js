module.exports = {
    "name": "FreshService",
    "publisher": "Huey Phan",
    "cards": [{
        "type": "TestExtCard",
        "source": "./src/cards/FreshService",
        "title": "FreshService",
        "displayCardType": "Custom Card",
        "description": "View your freshservice tickets",
        // "pageRoute": {
        //     "route": "/",
        //     "excludeClickSelectors": ['#viewButton']
        // }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}