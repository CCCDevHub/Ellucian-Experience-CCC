module.exports = {
    name: "Change of Major",
    publisher: "Huey Phan",
    version: "1.0.1",
    cards: [
        {
            type: "GraphQlQueryCard",
            source: "./src/cards/ChangeOfMajor",
            title: "Change of Major",
            displayCardType: "Change of Major",
            description: "Change of Major",
            configuration: {
                client: [
                    {
                        key: "studentInfoAPI",
                        label: "Student Info API",
                        type: "text"
                    },
                    {
                        key: "majorInfoAPI",
                        label: "Major Info API",
                        type: "text"
                    },
                    {
                        key: "termListAPI",
                        label: "Term List API",
                        type: "text"
                    },
                    {
                        key: "registrationTimeAPI",
                        label: "Registration Time API",
                        type: "text"
                    },
                    {
                        key: "getRegistrationTimeAPI",
                        label: "Get Registration Time API",
                        type: "text"
                    },
                    {
                        key: "updateMajorAPI",
                        label: "Update Major API",
                        type: "text"
                    },
                    {
                        key: "updateConcentrationAPI",
                        label: "Update Concentration API",
                        type: "text"
                    }
                ],
                server: [
                    {
                        key: "ethosApiKey",
                        label: "Ethos API",
                        type: "password",
                        required: true
                    }
                ]
            }
        }],
    page: {
        source: "./src/page/Home.jsx"
    }
}