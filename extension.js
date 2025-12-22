module.exports = {
    name: 'Billing and Payments',
    publisher: 'Huey Phan',
    version: '1.0.0',
    cards: [{
        type: 'BillingPaymentsCard',
        source: './src/cards/BillingPayments',
        title: 'Billing and Payments',
        displayCardType: 'GraphQL Card',
        description: 'Billing and Payments',
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
                                            person12 {
                                                names {
                                                    fullName
                                                }
                                                    credentials {
                                                        value
                                                        type
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