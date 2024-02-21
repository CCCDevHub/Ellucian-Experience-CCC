import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});

function OutstandingBalance({ classes }) {
    const { authenticatedEthosFetch } = useData();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { cardId } = useCardControl
    const [mydata, setMydata] = useState();
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        authenticatedEthosFetch(`Outstanding-Balance?cardId=${cardId}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error(error)
            });
    }
    return (
        <div className={classes.card}>
            <Typography variant="h2">
                Hello TestExt World
            </Typography>
            <Typography>
                <span>
                    For sample extensions, visit the Ellucian Developer
                </span>
                <TextLink href="https://github.com/ellucian-developer/experience-extension-sdk-samples" target="_blank">
                    GitHub
                </TextLink>
            </Typography>
        </div>
    );
}

OutstandingBalance.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OutstandingBalance);