import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Icon } from '@ellucian/ds-icons/lib';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});

function AcademicStanding({ classes }) {
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { getEthosQuery } = useData();
    const [standingStatus, setStandingStatus] = useState();

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const standingResult = await getEthosQuery({ queryId: 'academic-standing' });
                const standingData = (standingResult?.data?.studentAcademicStandings?.edges.map(edge => edge.node));
                setLoadingStatus(false);
                const lastTermStatus = standingData.pop();
                if (lastTermStatus) {
                    const { academicPeriod: { title: termName }, standing: { title: status } } = lastTermStatus;
                    setErrorMessage({
                        headerMessage: (`You are on Probation since ${termName}`),
                        textMessage: (`${status}`),
                        iconName: 'warning-solid',
                        iconColor: 'red'
                    });
                }

            } catch (error) {
                console.log('ethosQuery failed', error);
                setErrorMessage({
                    headerMessage: ('GraphQL Fetch Failed'),
                    textMessage: ('GraphQL Fetch Failed'),
                    iconName: 'error',
                    iconColor: '#D42828'
                });
            }

        })();
    }, []);
    if (standingStatus) {
        return (
            <div className={classes.card}>
                <Icon name="warning-solid" large="true" spin="true" color="red">
                </Icon>
            </div>
        );
    } else { return null; }

}

AcademicStanding.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(AcademicStanding);