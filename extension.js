module.exports = {
    "name": "experienceWorkshopPaulaBaltazar",
    "publisher": "PaulaBaltazar",
    "cards": [{
        "type": "Milestones",
        "source": "./src/cards/Milestones",
        "title": "Getting Started at PCC",
        "displayCardType": "GraphQL Query",
        "description": "Milestones",
        "queries": {
            "person-ext": [
                {
                    "resourceVersions": {
                        "persons": { min: 12 }
                    },
                    "query":
                        `query personInfo($personId: ID){
                            persons: {persons} (
                                    filter: {
                                        id: {EQ: $personId}
                                    }
                                )
                                {
                                    edges {
                                        node {
                                            id
                                            gender
                                            names {
                                                fullName
                                            }
                                            dateOfBirth
                                            veteranStatus {
                                                category
                                            }
                                            citizenshipStatus {
                                                category
                                            }
                                            roles {
                                                role
                                            }
                            
                                            credentials {
                                                value
                                                type
                                            }
                            
                                            emails {
                                                type {
                                                    emailType
                                                }
                                                address
                                            }
                                            extensions{
                                                milestonesRegpri
                                                milestonesEdplans
                                                milestonesAssessments
                                                milestonesOrientation
                                            }
                                        }
                                    }
                                }
                        }`
                }
            ]
            // "person-hold": [
            //     {
            //         "resourceVersions": {
            //             "persons": { min: 12 },
            //             "personHolds": { min: 6 }
            //         },
            //         "query":
            //             `query personHoldInfo($personId : ID, $today: Date) {
            //                 personHolds: {personHolds} (
            //                     filter:{
            //                         {person@persons}: { id: { EQ: $personId } }
            //                         endOn: {AFTER: $today} 
            //                         startOn: {BEFORE: $today}
            //                     }
            //                 ) {
            //                     edges {
            //                         node {
            //                             id
            //                             type {
            //                                 detail6 {
            //                                     title
            //                                     category
            //                                     description
            //                                 }
            //                             }
            //                             startOn
            //                             endOn
            //                         }
            //                     }
            //                 }
            //             }
            //             `
            //     }
            // ],
            // "student-tags": [
            //     {
            //         "resourceVersions": {
            //             "persons": { min: 12 },
            //             "studentTags": { min: 7 },
            //             "studentTagAssignments": { min: 1 }
            //         },
            //         "query":
            //             `query studentTagInfo($personId : ID, $today: Date) {
            //                 studentTagAssignments: {studentTagAssignments} (
            //                     filter:{
            //                         {person@persons}: {
            //                             id: {EQ: $personId}
            //                         }
            //                         {tag@studentTags}: { code: { IN: ["OUT", "NSV"] } }
            //                         startOn:{ AFTER: $today} endOn:{BEFORE: $today}
            //                     }
            //                 ) {
            //                    edges {
            //                         node {
            //                             id
            //                             tag7 {
            //                                 title
            //                                 description
            //                                 code
            //                             }
            //                             startOn
            //                             endOn
            //                             person12 {
            //                                 id
            //                             }
            //                         }
            //                     }
            //                 }
            //             }
            //             `
            //     }
            // ]
        }
    }]
};
