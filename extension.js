module.exports = {
    name: 'DegreeAudit',
    publisher: 'Huey Phan',
    cards: [{
        type: 'DegreeAuditCard',
        source: './src/cards/DegreeAuditCard',
        title: 'Degree Audit',
        displayCardType: 'Degree Audit',
        description: 'Degree Audit Degreeworks What-If API',
        configuration: {
            client: [
                {
                    key: "catalogYear",
                    label: "Catalog Year",
                    type: "text"
                },
                {
                    key: "majorCodes",
                    label: "Code for Majors, Separate them by comma. Ex: ENG, MATH, ",
                    type: "text"
                },
                {
                    key: "majorDisp",
                    label: "Major Display, Separate them by comma and need to match with majorCodes",
                    type: "text"
                },
                {
                    key: "tokenUrl",
                    label: "Token URL",
                    type: "text"
                },
                {
                    key: "whatIfUrl",
                    label: "What-If URL",
                    type: "text"
                },
                {
                    key: "username",
                    label: "degreeworks username",
                    type: "password",
                    required: true
                },
                {
                    key: "password",
                    label: "degreeworks password",
                    type: "password",
                    required: true
                },
                {
                    key: "token",
                    label: "degreeworks token",
                    type: "password"
                }
            ]
        }

    }],
    page: {
        source: "./src/page/router.jsx"
    }
}