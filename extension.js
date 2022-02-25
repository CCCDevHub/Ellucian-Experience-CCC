module.exports = {
    "name": "Ellucian-Experience",
    "publisher": "Sample",
    "cards": [{
        "type": "Ellucian-ExperienceCard",
        "source": "./src/cards/Ellucian-ExperienceCard",
        "title": "Ellucian-Experience Card",
        "displayCardType": "Ellucian-Experience Card",
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