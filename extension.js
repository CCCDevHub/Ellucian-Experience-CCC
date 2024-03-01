module.exports = {
    "name": "Extension Name",
    "publisher": "Your Name",
    "cards": [{
        "type": "TestExtCard",
        "source": "./src/cards/TestExtCard",
        "title": "Card Title",
        "displayCardType": "Card Type",
        "description": "Card Description",
        "pageRoute": {
            "route": "/",
            "excludeClickSelectors": ['a']
        }
    }],
    "page": {
        "source": "./src/page/router.jsx"
    }
}