module.exports = {
    "name": "Extension Name",
    "publisher": "Your Name",
    "version": "1.0.0",
    "cards": [{
        "type": "GraphQLQueryCard",
        "source": "./src/cards/JSXName",
        "title": "Card Name",
        "displayCardType": "GraphQL Query Card",
        "description": "Card Description",
        "queries": {
            // Graph QL Query here
        },
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['a']
        }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}
