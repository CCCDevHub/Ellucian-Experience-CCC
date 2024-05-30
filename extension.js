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
            },
            {
                key: 'pipelineAPIStudentInfo',
                label: 'Pipeline API Student Info',
                type: 'text'
            },
            {
                key: 'paymentDate',
                label: 'Payment Deadline Date',
                type: 'date'
            }
            ],
            server: [{
                key: 'ethosApiKey',
                label: 'Ethos API',
                type: 'password',
                required: true
            }]
        },
        queries: {
            'residency-info': [
                {
                    resourceVersions: {
                        students: { min: 16 },
                        persons: { min: 12 },
                        residencyTypes: { min: 7 }
                    },
                    query:
                        `query studentInfo($personId: ID){
                            students: {students} (
                                    filter: {
                                       {person@persons}: { id: {EQ: $personId} }
                                    }
                                    sort: { residencies: { startOn: DESC } }
                                )
                                {
                                    edges {
                                        node {
                                            id
                                            residencies {
                                                  startOn
                                                  residency: {residency@residencyTypes} {
                                                    title
                                                    code
                                                    description
                                                  }
                                            }
                                        }
                                    }
                                }
                        }`
                }
            ]
        }
    }],
    page: {
        source: './src/page/router.jsx'
    }
}