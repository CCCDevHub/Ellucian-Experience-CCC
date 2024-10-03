import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Icon } from '@ellucian/ds-icons/lib';
import { configuration } from '../../extension';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});

function IdentityHold({ classes }) {
    const { authenticatedEthosFetch } = useData();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { configuration: {
        pipelineAPI }, cardId } = useCardInfo();
    const { roles } = useUserInfo();

    const personId = roles.at(-1);
    const customId = 'IdentityHold';
    const [identityHold, setIdentityHold] = useState();

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const holdResponse = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&testPersonId=${personId}`);
                const holdResult = await holdResponse.json();
                setIdentityHold(holdResult?.hold.filter((el => el.type.detail.id == 'a6a22268-46f4-424b-8156-ca02c95b0d91')));
                setLoadingStatus(false);
            } catch (error) {
                console.log(error)
            }
        })();
    }, []);

    if (identityHold) {
        return (
            <div className={classes.card} style={{ textAlign: "center" }}>
                <Typography variant="h2">
                    <h2>Hold on Student Account</h2>
                    <p>You currently have an <strong>identity hold</strong> on your account. Please resolve this issue as soon as possible.</p>
                    <p>If this hold is not cleared by the deadline, you may be <strong>dropped from your enrolled courses</strong>.</p>
                    <p>Contact the Registrar&apos;s Office for assistance in resolving this hold.</p>
                </Typography>
            </div>
        );
    } else {
        return (
            <div className={classes.card} style={{ textAlign: "center" }}>
                <Typography variant="h2">
                    <h2>No Holds on Your Account</h2>
                    <p>Your account is currently in good standing. No holds have been detected.</p>
                    <p>You can proceed with your registration and other activities without any issues.</p>
                </Typography>
            </div>
        );
    }
}


IdentityHold.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(IdentityHold);