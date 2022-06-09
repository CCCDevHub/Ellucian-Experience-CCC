import React, {useState, useEffect, Fragment} from "react";
import PropTypes from "prop-types";
import {spacing10, spacing40} from '@ellucian/react-design-system/core/styles/tokens';
import {withStyles} from '@ellucian/react-design-system/core/styles';
import {Typography} from '@ellucian/react-design-system/core';

const styles = () => ({
    card: {
        marginLeft: spacing40,
        marginRight: spacing40,
        paddingTop: spacing10
    },
    text: {
        marginRight: spacing40,
        marginLeft: spacing40
    }
});

const CardName = (props) => {
    const {
        classes,
        data: {getEthosQuery},
        cardControl: {
            setLoadingStatus,
            setErrorMessage
        }
    } = props;

    const [ethoDatas, setEthoDatas] = useState();
    const sectionIdList = ["cb9475e2-69ee-437e-88ff-6e190f30d282",
        "581fee9e-5e7d-41c8-8205-3929a47f411e",
        "00531855-6397-441f-b876-8efd87ec8c65",
        "ef1b341b-6776-4834-8447-462eac7fd5ad",
        "0648f603-7196-48bb-9c45-c2f3863202a5",
        "e1b808f7-2ec7-4b31-88c0-08c10ba0433b",
        "3ec2dfc8-0147-418e-86b1-d4d1ad1aad3d",
        "2367fc5c-75b9-4b4e-9c43-59c6f7bbcf1a",
        "9df38eb1-846e-4d1b-95a3-996068c0f153"]
    // useEffect(() => {
    //     (async () => {
    //             setLoadingStatus(true);
    //             try {
    //                 const sectionPromises = [];
    //                 console.log('try to get data');
    //                 const promise = getEthosQuery({queryId: 'section-list', properties: {sectionId: "cb9475e2-69ee-437e-88ff-6e190f30d282"}});
    //                 console.log('you shall not pass');
    //                 sectionPromises.push(promise);
    //
    //                 const sectionResult = await Promise.all(sectionPromises);
    //                 console.log(sectionResult);
    //                 setLoadingStatus(false);
    //             } catch (error) {
    //                 console.log('ethosQuery failed', error);
    //                 setErrorMessage({
    //                     headerMessage: ({id: 'GraphQLQueryCard-fetchFailed'}),
    //                     textMessage: ({id: 'GraphQLQueryCard-classesFetchFailed'}),
    //                     iconName: 'error',
    //                     iconColor: '#D42828'
    //                 });
    //             }
    //         }
    //     )();
    // }, []);
    return (
        <Fragment>
            <div className={classes.card}>
                <Typography>
                    <h1>Test</h1>
                </Typography>
            </div>
        </Fragment>
    )
};

CardName.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired
}

export default withStyles(styles)(CardName);