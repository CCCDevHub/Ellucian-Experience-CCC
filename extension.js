module.exports = {
    name: 'Outstanding Balance',
    publisher: 'Huey Phan',
    version: '1.0.0',
    cards: [{
        type: 'OutstandingBalanceCard',
        source: './src/cards/OutstandingBalance',
        title: 'Outstanding Balance',
        displayCardType: 'GraphQL Card',
        description: 'Transaction Details and Outstanding Balance',
        configuration: {
            client: [{
                key: 'pipelineAPI',
                label: 'Pipeline API',
                type: 'text'
            }
            ],
            server: [{
                key: 'ethosApiKey',
                label: 'Ethos API',
                type: 'password',
                required: true
            }]
        }
    }],
    page: {
        source: './src/page/router.jsx'
    }
}