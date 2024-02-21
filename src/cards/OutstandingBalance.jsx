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
    const { configuration: {
        pipelineAPI
    }, cardId } = useCardInfo();
    const { roles } = useUserInfo();
    const seasonMap = {
        '70': 'Fall',
        '30': 'Spring',
        '50': 'Summer',
        '20': 'Winter'
    };
    // const personId = roles.pop();
    const personId = 'bbde9273-eacc-40d4-ab54-41b1ff3d8e35';
    const [summarize, setSumarize] = useState()
    const [balanceDetails, setBalanceDetails] = useState();
    const [groupByTerm, setGroupByTerm] = useState();
    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const response = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&testPersonId=${personId}`);
                const balanceResult = await response.json();
                const [{ TBRACCD_CTRL, TBRACCD }] = balanceResult;
                setSumarize(() => TBRACCD_CTRL);
                setBalanceDetails(() => TBRACCD);

                setLoadingStatus(false);
            } catch (error) {
                console.error(error)
            }
        })();
    }, []);
    if (balanceDetails) {
        const groupByTermCode = balanceDetails.reduce((acc, item) => {
            const key = item.termCode;
            const lastTwo = key.slice(-2);
            if (seasonMap[lastTwo]) {
                item.termDesc = seasonMap[lastTwo] + ' ' + key.slice(0, 4);
            }
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});
    }

    if (summarize) {
        const [{ accountBalance, amountDue }] = summarize;
        return (
            <div className={classes.card}>
                <Typography variant="h2">
                    Hello TestExt World
                </Typography>
            </div>
        );
    } else {
        return (
            <div className={classes.card}>
                <Typography className={classes.message} variant="body1" component="div">
                    {`You don't have any outstanding Balance`}
                </Typography>
            </div>
        );
    }

}

OutstandingBalance.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OutstandingBalance);