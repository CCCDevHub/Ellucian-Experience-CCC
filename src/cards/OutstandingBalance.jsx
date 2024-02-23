import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextLink,
    Dropdown,
    DropdownItem
} from '@ellucian/react-design-system/core';
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
    const customId = 'OutstandingBalance';
    const [summarize, setSumarize] = useState()
    const [balanceDetails, setBalanceDetails] = useState();
    const [groupTransByTerm, setGroupTransByTerm] = useState();
    const [dropdownStateTerm, setDropdownStateTerm] = useState({
        term: '',
        initialValue: '',
        open: false
    });


    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const response = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&testPersonId=${personId}`);
                const balanceResult = await response.json();
                const [{ TBRACCD_CTRL, TBRACCD }] = balanceResult;
                const groupByTermCode = TBRACCD.reduce((acc, item) => {
                    const key = item.termCode;
                    const lastTwo = key.slice(-2);
                    let termDesc = '';
                    if (seasonMap[lastTwo]) {
                        termDesc = seasonMap[lastTwo] + ' ' + key.slice(0, 4);
                    }
                    const existingTerm = acc.find(term => term.termCode === key);
                    if (!existingTerm) {
                        acc.push({
                            termDesc: termDesc,
                            termCode: key,
                            transactions: [item]
                        });
                    } else {
                        existingTerm.transactions.push(item);
                    }
                    return acc;
                }, []);

                setSumarize(() => TBRACCD_CTRL);
                setGroupTransByTerm(() => Object.values(groupByTermCode));
                setLoadingStatus(false);

            } catch (error) {
                console.error(error)
            }
        })();
    }, []);

    const handleChangeTerm = event => {
        const valueIsNone = event.target.value === 'None';
        console.log(event.target)
        setDropdownStateTerm(prevState => ({
            ...prevState,
            term: valueIsNone ? prevState.initialValue : event.target.value
        }));
    };

    if (summarize && groupTransByTerm) {
        const [{ accountBalance, amountDue }] = summarize;

        return (
            <div className={classes.card}>
                <Dropdown
                    id={`${customId}_DropdownTerm}`}
                    label={'Select Term'}
                    onChange={handleChangeTerm}
                    value={dropdownStateTerm.term}
                    open={dropdownStateTerm.open}
                    onOpen={(event) => {
                        setDropdownStateTerm({ open: true });
                    }
                    }
                    onClose={(event) => {
                        setDropdownStateTerm({ open: false });
                    }
                    }
                >
                    {groupTransByTerm.map(item => {
                        return (
                            <DropdownItem key={item.termCode}
                                label={item.termDesc}
                                value={item.termCode}
                            />
                        )
                    })}
                </Dropdown>
                {groupTransByTerm.map(item => {
                    if (dropdownStateTerm.term == item.termCode) {
                        console.log(item);
                        return (
                            null
                        );
                    } else {
                        return (null);
                    }
                })}
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