import React from "react";
import PropTypes from "prop-types";
import {spacing10, spacing40} from '@ellucian/react-design-system/core/styles/tokens';
import {withStyles} from '@ellucian/react-design-system/core/styles';

const styles = () => ({
    card: {
        marginLeft: spacing40,
        marginRight: spacing40,
        paddingTop: spacing10
    }
});

const MyInfo = (props) => {
    const {
        classes,
        cardInfo: {configuration},
        data: {getEthosQuery},
        cardControl: {
            setLoadingStatus,
            setErrorMessage
        }
    } = props;
    const configurationItems = [];

    const testt = () => configuration.html;

    console.log(configuration.html)
    return (
        <div className={classes.card}>
            <h1>Testing</h1>
            <div dangerouslySetInnerHTML={{__html: configuration.html}}/>

        </div>
    )
};

MyInfo.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired
}

export default withStyles(styles)(MyInfo);