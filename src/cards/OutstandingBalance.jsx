import { withStyles } from '@ellucian/react-design-system/core/styles';
import classnames from 'classnames';
import { spacing40, spacing30 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextLink,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Dropdown,
    DropdownItem,
    Button
} from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@ellucian/ds-icons/lib';

const styles = () => ({
    root: {
        height: '100%',
        overflowY: 'auto',
        marginRight: spacing40,
        marginLeft: spacing40
    },
    content: {
        height: '100%',
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    transactionsTableRow: {
        height: 'auto'
    },
    balanceContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: spacing30,
        marginBottom: spacing30
    },

    balanceContainerSpan: {
        margin: '0'
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
    const [formatTransDate, setFormatTransDate] = useState();
    const payLink = 'https://test.secure.touchnet.net:8443/C21220test_tsa/web/caslogin.jsp';

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                setFormatTransDate(() => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }));
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
            setDropdownStateTerm(groupTransByTerm[groupTransByTerm.length - 1].termCode);
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

    function buttonClicked() {
        window.open(payLink, '_blank');
    }


    if (summarize && groupTransByTerm) {
        const [{ accountBalance, amountDue }] = summarize;
        return (
            <div className={classes.root}>
                <div className={classes.content}>
                    <div>
                        <Dropdown
                            id={`${customId}_DropdownTerm}`}
                            label={'Select Term'}
                            onChange={handleChangeTerm}
                            value={dropdownStateTerm}
                            fullWidth
                        >
                            {dropDownItems}
                        </Dropdown>
                    </div>
                    {accountBalance > 0 && (
                        <div className={classes.balanceContainer}>
                            <Typography variant={'h4'}>
                                Outstanding Balance: ${accountBalance}
                            </Typography>

                            <Button
                                color='secondary'
                                startIcon={<Icon name="cart" />}
                                onClick={buttonClicked}
                            >
                                <Typography variant={'h4'}>Pay Now</Typography>
                            </Button>
                        </div>


                    )}

                    <div>
                        {dropdownStateTerm && (
                            <Table>
                                <TableBody>
                                    <Typography variant={"h6"}>
                                        Transaction History
                                    </Typography>
                                    {groupTransByTerm[dropdownStateTerm].transactions
                                        // .filter(item => item.chargeAmount)
                                        .map((item, index) => {
                                            const transactionDate = formatTransDate.format(new Date(item.transDate));
                                            return (
                                                <TableRow TableRow key={`${item.termCode} - ${index}`} className={classes.transactionsTableRow}>
                                                    <TableCell align='left' padding='none'>
                                                        <Typography variant={'body3'}>
                                                            {transactionDate}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align='left' padding='none'>
                                                        <Typography variant={'body3'} component={'div'}>
                                                            {item.desc}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right" padding='none'>
                                                        <Typography variant={'body3'} component={'div'}>
                                                            ${item.chargeAmount || item.paymentAmount}
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow >
                                            )
                                        })}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </div >
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