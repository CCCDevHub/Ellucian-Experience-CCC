import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextLink,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Dropdown,
    DropdownItem
} from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';

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
    const [dropdownStateTerm, setDropdownStateTerm] = useState();


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
                    let termDesc;
                    if (seasonMap[lastTwo]) {
                        termDesc = seasonMap[lastTwo] + ' ' + key.slice(0, 4);
                    }
                    if (!acc[key]) {
                        // If it doesn't exist, initialize it with termDesc and transactions array
                        acc[key] = {
                            termDesc: termDesc,
                            termCode: key,
                            transactions: [item]
                        };
                    } else {
                        // If it exists, just push the new item into the transactions array
                        acc[key].transactions.push(item);
                    }
                    return acc;
                }, []);

                setSumarize(() => TBRACCD_CTRL);
                setGroupTransByTerm(() => groupByTermCode);
                setLoadingStatus(false);

            } catch (error) {
                console.error(error)
            }
        })();
    }, []);
    const dropDownItems = useMemo(() => {
        if (groupTransByTerm) {
            // Convert groupTransByTerm object to an array of [termCode, item] pairs
            const entries = Object.entries(groupTransByTerm);

            // Sort the entries by termCode in descending order
            entries.sort(([termCodeA], [termCodeB]) => termCodeB.localeCompare(termCodeA));

            // Map over the sorted entries to generate the dropdown items
            return entries.map(([termCode, item]) => {
                return (
                    <DropdownItem key={termCode}
                        label={item.termDesc}
                        value={termCode}
                    />
                );
            });
        }
    }, [groupTransByTerm]);

    const handleChangeTerm = (event) => {
        setDropdownStateTerm(() => event.target.value);
    };

    if (summarize && groupTransByTerm) {
        const [{ accountBalance, amountDue }] = summarize;

        return (
            <div className={classes.card}>
                <Dropdown
                    id={`${customId}_DropdownTerm}`}
                    label={'Select Term'}
                    onChange={handleChangeTerm}
                    value={dropdownStateTerm}
                >
                    {dropDownItems}
                </Dropdown>
                {dropdownStateTerm && (
                    <Table>
                        <TableBody>
                            {groupTransByTerm[dropdownStateTerm].transactions
                                .filter(item => item.chargeAmount)
                                .map(item => {
                                    return (
                                        <TableRow TableRow key={item.termCode} >
                                            <TableCell>
                                                <Typography variant={'body3'}>
                                                    {item.transDate}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant={'body3'}>
                                                    {item.desc}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant={'body3'}>
                                                    {item.chargeAmount}
                                                </Typography>
                                            </TableCell>
                                        </TableRow >
                                    )
                                })}
                        </TableBody>
                    </Table>
                )}
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