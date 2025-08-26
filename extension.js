module.exports = {
    name: "SLPA Process",
    publisher: "Huey Phan",
    cards: [{
        type: "SLPA",
        source: "./src/cards/SLPA",
        title: "SLPA Process",
        displayCardType: "API Card",
        description: "Process SLPA through API",
        queries: {
            'term-list': [
                {
                    resourceVersions: {
                        academicPeriods: { min: 16 }
                    },
                    query:
                        `query termList{
                            academicPeriods: {academicPeriods} (
                                filter: { code: { STARTS_WITH: "2" } }
                                sort: { startOn: DESC }
                            ) {
                                totalCount
                                edges {
                                node {
                                    id
                                    code
                                    title
                                }
                                }
                            }
                        }`
                }
            ]
        },

        configuration: {
            client: [
                {
                    key: 'microsoftPipelineAPI',
                    label: 'Microsoft Pipeline API',
                    type: 'text'
                },
                {
                    key: 'bannerPipelineAPI',
                    label: 'Banner Pipeline API',
                    type: 'text'
                },
                {
                    key: 'SLPAPipelineAPI',
                    label: 'SLPA Pipeline API',
                    type: 'text'
                },
                {
                    key: 'SLPACountPipelineAPI',
                    label: 'SLPA Count Pipeline API',
                    type: 'text'
                }
            ],
            server: [
                {
                    key: 'ethosApiKey',
                    label: 'Ethos API',
                    type: 'password',
                    required: true
                },
                {
                    key: 'clientId',
                    label: 'M$ client Id',
                    type: 'password',
                    required: true
                },
                {
                    key: 'clientSecret',
                    label: 'M$ client Secret',
                    type: 'password',
                    required: true
                },
                {
                    key: 'siteId',
                    label: 'M$ Site Id',
                    type: 'password',
                    required: true
                },
                {
                    key: 'listId',
                    label: 'M$ List Id',
                    type: 'password',
                    required: true
                },
                {
                    key: 'authUrl',
                    label: 'M$ Auth Url',
                    type: 'text',
                    required: true
                },
                {
                    key: 'pathAndName',
                    label: 'M$ Path and Name of File',
                    type: 'text',
                    required: true
                }
            ]
        }
    }],
    page: {
        source: "./src/page/Home.jsx"
    }
}