module.exports = {
    "name": "Extension Name",
    "publisher": "Your Name",
    "cards": [{
        "type": "TestExtCard",
        "source": "./src/cards/CardName",
        "title": "Card Title",
        "displayCardType": "Card Type",
        "description": "This is an introductory card to the Ellucian Experience SDK",
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['a']
        }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}