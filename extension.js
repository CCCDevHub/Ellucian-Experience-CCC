module.exports = {
    "name": "Identity Hold",
    "publisher": "Huey Phan",
    "configuration": {
        "client": [{
            "key": "pipelineAPI",
            "label": "Pipeline API",
            "type": "text"
        }],
        "server": [{
            "key": "ethosApiKey",
            "label": "Ethos API Key",
            "type": "password",
            "required": true
        }]
    },
    "cards": [{
        "type": "GraphQL Card",
        "source": "./src/cards/IdentityHold",
        "title": "Identity Hold",
        "displayCardType": "GraphQL Card",
        "description": "Identity Hold"
    }]
}