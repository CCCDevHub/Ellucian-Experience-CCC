import { withStyles } from '@ellucian/react-design-system/core/styles';
import classnames from 'classnames';
import { spacing40, spacing30, spacing20 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextLink,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Dropdown,
    DropdownItem,
    Tab,
    Tabs,
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
    balanceAmount: {
        display: 'flex'
    },
    accountBalance: {
        marginLeft: spacing30
    },
    balanceContainerSpan: {
        margin: '0'
    }
});

function OutstandingBalance({ classes }) {
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { configuration: {
        pipelineAPI, pipelineAPIStudentInfo, paymentDate
    }, cardId } = useCardInfo();
    const { roles } = useUserInfo();

    const todayDate = new Date();
    const deadlineDate = new Date(paymentDate);
    const residencyTypeCode = ['R', 'M', 'D', 'B']
    const seasonMap = {
        '70': 'Fall',
        '30': 'Spring',
        '50': 'Summer',
        '20': 'Winter'
    };
    const personId = roles.pop();
    const customId = 'OutstandingBalance';
    const [summarize, setSumarize] = useState()
    const [balanceDetails, setBalanceDetails] = useState();
    const [residency, setResidency] = useState();
    const [formatTransDate, setFormatTransDate] = useState();
    const [groupTransByTerm, setGroupTransByTerm] = useState();
    const [dropdownStateTerm, setDropdownStateTerm] = useState();
    const [tabChange, setTabChange] = useState('OutstandingBalance_Tab_Balance');
    const [studentInfo, setStudentInfo] = useState();
    const [payLink, setPayLink] = useState();

    const payLinkUS = 'https://test.secure.touchnet.net:8443/C21220test_tsa/web/caslogin.jsp';
    const paylinkIntl = 'https://ssb-prod.ec.pasadena.edu/PROD/bwymtfxp.P_MTFXPayment';

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                setFormatTransDate(() => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }));
                const residencyResult = await getEthosQuery({
                    queryId: 'residency-info'
                });
                const residencyData = (residencyResult?.data?.students?.edges.map(edge => edge.node));
                const currResidency = residencyData.pop()?.residencies.pop();
                const { residency: { code: residencyCode, title: residencyTitle } } = currResidency;
                if (residencyTypeCode.includes(residencyCode)) {
                    setPayLink(() => payLinkUS);
                } else {
                    setPayLink(() => paylinkIntl);
                }
                setResidency(() => residencyData);

                const balanceResponse = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&testPersonId=${personId}`);
                const balanceResult = await balanceResponse.json();
                const [{ TBRACCD_CTRL, TBRACCD }] = balanceResult;

                setSumarize(() => TBRACCD_CTRL);

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
                setGroupTransByTerm(() => groupByTermCode);

                const studentInfoResponse = await authenticatedEthosFetch(`${pipelineAPIStudentInfo}?cardId=${cardId}&testPersonId=${personId}`);
                const studentInfoResult = await studentInfoResponse.json();
                setStudentInfo(() => studentInfoResult[0])

                setLoadingStatus(false);

            } catch (error) {
                console.log(error)
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

    const handleTabChange = (event) => {
        setTabChange(() => event.target.id);
    }

    function buttonClicked() {
        window.open(payLink, '_blank');
    }
    const testing = ['']

    if (summarize && payLink && studentInfo) {
        const [{ accountBalance, amountDue }] = summarize;
        const specialCase = ["vetStatus", "financialAid", "eops", "calwork", "dualEnrollment"].some(key => studentInfo[key]);

        return (
            <div className={classes.root}>
                <div className={classes.content}>
                    <Tabs
                        id={`${customId}_Tabs`}
                        onChange={handleTabChange}
                        value={tabChange}
                        variant="card"
                        scrollButtons="true">
                        <Tab id={`${customId}_Tab_Balance`} label="Balance" />
                        <Tab id={`${customId}_Tab_Summarize`} label="Summarize" />
                    </Tabs>
                    {
                        tabChange === 'OutstandingBalance_Tab_Balance' ? (
                            <div id={`${customId}_Tab_Balance`} role="tabpanel">
                                {accountBalance > 0 ? (
                                    <div className={classes.balanceContainer}>
                                        <Typography variant={'h4'} className={classes.balanceAmount}>
                                            Balance Due: <Typography color='error' variant={'h4'} className={classes.accountBalance}>${accountBalance}</Typography>
                                        </Typography>
                                        <Button
                                            color='secondary'
                                            startIcon={<Icon name="cart" />}
                                            onClick={buttonClicked}
                                        >
                                            <Typography variant={'h4'}>Pay Now</Typography>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className={classes.balanceContainer}>
                                        <Typography variant={'h4'} className={classes.balanceAmount}>
                                            Your Balance: <Typography color='error' variant={'h4'} className={classes.accountBalance}>${accountBalance}</Typography>
                                        </Typography>
                                    </div>
                                )}

                                {!(accountBalance > 100 && specialCase) && (
                                    <div className={classes.balanceContainer}>
                                        {todayDate <= deadlineDate ? (
                                            <Typography variant={'body2'}>
                                                To ensure you are not dropped from classes, pay your fees at the time of your registration or make sure you have a financial aid application on file.
                                            </Typography>
                                        ) : (
                                            <Typography variant={'body2'}>
                                                Upcoming drop for non-payment on {deadlineDate.toLocaleDateString('en-US')}. Make sure all your fees are paid before this date to avoid being dropped from all classes.
                                            </Typography>
                                        )}
                                    </div>
                                )}

                                <div className={classes.balanceContainer}>
                                    <Typography variant={'h4'} align={'center'}>
                                        <TextLink
                                            id={`${customId}_apply_for_aid`}
                                            href='https://pasadena.edu/admissions-and-aid/financial-aid/receiving-aid/apply-for-aid.php'
                                        >
                                            Click here to apply for Financial Aid
                                        </TextLink>
                                    </Typography>
                                </div>
                            </div>
                        ) : (
                            <div id={`${customId}_Tab_Summarize`} role="tabpanel">
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
                                <div><br></br></div>
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
                        )
                    }
                </div>
            </div >
        );
    } else {
        return (
            <div>
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