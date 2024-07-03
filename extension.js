module.exports = {
    name: 'experienceWorkshopPaulaBaltazar',
    publisher: 'PaulaBaltazar',
    cards: [{
        type: 'Milestones',
        source: './src/cards/GetStartedWithPCC',
        title: 'Getting Started at PCC',
        displayCardType: 'GraphQL Query',
        description: 'Milestones',
        configuration: {
            client: [{
                key: 'pipelineAPI',
                label: 'Pipeline API',
                type: 'text'
            }],
            server: [{
                key: 'ethosApiKey',
                label: 'Ethos API Key',
                type: 'password',
                required: true
            }]
        }
    }]
};
