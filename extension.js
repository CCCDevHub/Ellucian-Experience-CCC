module.exports = {
    "name": "HTMLTest",
    "publisher": "Huey Phan",
    "version": "1.0.0",
    "cards": [{
        "type": "HTML Test",
        "source": "./src/cards/HTMLTest",
        "title": "HTML Test",
        "displayCardType": "HTML Test",
        "description": "Render HTML with React",
        "configuration": {
            "client": [
                {
                    key: 'html',
                    label: 'HTML Code',
                    type: 'text'
                },
                {
                    key: 'htmlScript',
                    label: 'HTML Code with Script',
                    type: 'text'
                }
            ]
        }
    }],
    "page": {
        "source": "./src/page/index.jsx"
    }
}