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
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Icon } from '@ellucian/ds-icons/lib';
import mock from '../data/mock.json';

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
    },
    dropDown: {
        marginTop: spacing30,
        marginBottom: spacing30
    },
    buttonContainer: {
        marginBottom: spacing30
    },
    linksRow: {
        display: 'flex',
        gap: spacing30,
        alignItems: 'center',
        marginTop: spacing20,
        marginBottom: spacing30
    },
    linkItem: {
        fontWeight: 600
    },
    hiddenForm: {
        display: 'none'
    }
});

function OutstandingBalance({ classes }) {
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { configuration: {
        pipelineAPI, pipelineAPIStudentInfo, paymentDate
    }, cardId } = useCardInfo();
    const { roles } = useUserInfo();
    const formRef = useRef(null);

    const deadlineDate = new Date(paymentDate);
    const residencyTypeCode = ['R', 'M', 'D', 'B']
    const seasonMap = {
        '70': 'Fall',
        '30': 'Spring',
        '50': 'Summer',
        '20': 'Winter'
    };
    const personId = roles.at(-1);
    const customId = 'OutstandingBalance';
    const [summarize, setSumarize] = useState()
    const [balanceDetails, setBalanceDetails] = useState();
    const [residency, setResidency] = useState();
    const [formatTransDate, setFormatTransDate] = useState();
    const [groupTransByTerm, setGroupTransByTerm] = useState();
    const [dropdownStateTerm, setDropdownStateTerm] = useState();
    const [tabChange, setTabChange] = useState(0);
    const [studentInfo, setStudentInfo] = useState();
    const [payLink, setPayLink] = useState();
    const [studentId, setStudentId] = useState();
    const [fullName, setFullName] = useState('');

    // const studentInfo = {
    //     vetStatus: "Vet"
    // }

    const todayDate = new Date().toJSON().slice(0, 10);

    // Check if PayMyTuition should be disabled (after deadline)
    const isPayMyTuitionDisabled = paymentDate && todayDate > paymentDate;


    const payLinkUS = 'https://secure.touchnet.net/C21220_tsa/web/caslogin.jsp';

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                setFormatTransDate(() => new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: '2-digit' }));
                const residencyResult = await getEthosQuery({
                    queryId: 'residency-info'
                });
                const residencyData = (residencyResult?.data?.students?.edges.map(edge => edge.node));
                const studentFullName = residencyData[0]?.person12?.names[0]?.fullName;
                const studentIdData = residencyData[0]?.person12?.credentials.filter(cred => cred.type === 'bannerId')[0]?.value;
                setFullName(() => studentFullName);
                setStudentId(() => studentIdData);

                setPayLink(() => payLinkUS);

                const balanceResponse = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&testPersonId=${personId}`);
                const balanceResult = await balanceResponse.json();
                // const balanceResult = mock;
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
            setDropdownStateTerm(entries[0][0]);
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

    const handleTabChange = (event, value) => {
        setTabChange(() => value);
    }

    const handlePayMyTuitionPayment = () => {
        if (formRef.current && !isPayMyTuitionDisabled) {
            formRef.current.submit();
        }
    };

    if (summarize && payLink && studentInfo) {
        const [{ accountBalance, amountDue }] = summarize;
        const specialCase = ["vetStatus", "financialAid", "eops", "calwork", "dualEnrollment"].some(key => studentInfo[key]);
        return (
            <div className={classes.root}>
                <div className={classes.content}>
                    <form
                        ref={formRef}
                        className={classes.hiddenForm}
                        id="tuitionForm"
                        action="https://www.paymytuition.com/server/post_to_pmt.aspx"
                        method="post"
                    >
                        <input type="hidden" name="External_Institute_Id" value="pasadena" />
                        <input type="hidden" name="mtfx_website" value="https://www.paymytuition.com/server/post_to_pmt.aspx" />
                        <input type="hidden" name="Routing_Type" value="International" />
                        <input type="hidden" name="Student_Id" value={studentId || ''} />
                        <input type="hidden" name="full_name" value={fullName || ''} />
                        <input type="hidden" name="Balance_Due" value={summarize?.[0]?.accountBalance || ''} />
                        <input type="hidden" name="Payment_Amount" value={summarize?.[0]?.accountBalance || ''} />
                    </form>
                    <Tabs
                        id={`${customId}_Tabs`}
                        onChange={handleTabChange}
                        value={tabChange}
                        variant="card">
                        <Tab id={`${customId}_Tab_Balance`} label="Balance" />
                        <Tab id={`${customId}_Tab_Summarize`} label="Details" />
                    </Tabs>
                    {
                        tabChange === 0 ? (
                            <div id={`${customId}_Tab_Balance`} role="tabpanel">
                                {accountBalance > 0 ? (
                                    <>
                                        <div className={classes.balanceContainer}>
                                            <Typography variant={'h4'} className={classes.balanceAmount}>
                                                Balance Due: <Typography color='error' variant={'h4'} className={classes.accountBalance}>${accountBalance}</Typography>
                                            </Typography>
                                        </div>

                                        <div className={classes.buttonContainer}>
                                            <Button
                                                id={`${customId}_PayMyTuitionButton`}
                                                fluid
                                                color="primary"
                                                onClick={handlePayMyTuitionPayment}
                                                disabled={isPayMyTuitionDisabled}
                                            >
                                                Pay with International Currency
                                            </Button>
                                        </div>

                                        <div className={classes.buttonContainer}>
                                            <Button
                                                id={`${customId}_TouchNetButton`}
                                                fluid
                                                color="primary"
                                                href={payLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Pay with U.S. Currency
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className={classes.balanceContainer}>
                                        <Typography variant={'h4'} className={classes.balanceAmount}>
                                            Your Balance: <Typography color='error' variant={'h4'} className={classes.accountBalance}>${accountBalance}</Typography>
                                        </Typography>
                                    </div>
                                )}

                                {!(accountBalance > 100 && specialCase) && (
                                    <div className={classes.balanceContainer}>
                                        {deadlineDate <= todayDate ? (
                                            <Typography variant={'body2'}>
                                                To ensure you are not dropped from classes, pay your fees at the time of your registration or make sure you have a financial aid application on file.
                                            </Typography>
                                        ) : (
                                            <Typography variant={'body2'}>
                                                {/* To submit payment, go to the Billing & Payments Card. */}
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
                            <div id={`${customId}_Tab_Summarize`} role="tabpanel" >
                                <div className={classes.dropDown}>
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
                                <div className={classes.linksRow}>
                                    <TextLink
                                        onClick={handlePayMyTuitionPayment}
                                        className={classes.linkItem}
                                        title={'Pay with International Currency'}
                                    >
                                        Pay with International Currency
                                    </TextLink>
                                    <TextLink
                                        href={payLink}
                                        className={classes.linkItem}
                                        title={'Pay with U.S. Currency'}
                                    >
                                        Pay with U.S. Currency
                                    </TextLink>
                                </div>
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
                                                            <TableRow key={`${item.termCode} - ${index}`} className={classes.transactionsTableRow}>
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
    } else if (summarize && payLink) {
        const [{ accountBalance }] = summarize;

        return (
            <div className={classes.root}>
                <div className={classes.content}>
                    <form
                        ref={formRef}
                        className={classes.hiddenForm}
                        id="tuitionForm"
                        action="https://www.paymytuition.com/server/post_to_pmt.aspx"
                        method="post"
                    >
                        <input type="hidden" name="External_Institute_Id" value="pasadena" />
                        <input type="hidden" name="mtfx_website" value="https://www.paymytuition.com/server/post_to_pmt.aspx" />
                        <input type="hidden" name="Routing_Type" value="International" />
                        <input type="hidden" name="Student_Id" value={studentId || ''} />
                        <input type="hidden" name="full_name" value={fullName || ''} />
                        <input type="hidden" name="Balance_Due" value={summarize?.[0]?.accountBalance || ''} />
                        <input type="hidden" name="Payment_Amount" value={summarize?.[0]?.accountBalance || ''} />
                    </form>
                    <Tabs
                        id={`${customId}_Tabs`}
                        onChange={handleTabChange}
                        value={tabChange}
                        variant="card">
                        <Tab id={`${customId}_Tab_Balance`} label="Balance" />
                        <Tab id={`${customId}_Tab_Summarize`} label="Details" />
                    </Tabs>
                    {
                        tabChange === 0 ? (
                            <div id={`${customId}_Tab_Balance`} role="tabpanel">
                                {accountBalance > 0}
                                <div className={classes.balanceContainer}>
                                    <Typography variant={'h4'} className={classes.balanceAmount}>
                                        Balance Due: <Typography color='error' variant={'h4'} className={classes.accountBalance}>${accountBalance}</Typography>
                                    </Typography>
                                </div>

                                <div className={classes.buttonContainer}>
                                    <Button
                                        id={`${customId}_PayMyTuitionButton`}
                                        fluid
                                        color="primary"
                                        onClick={handlePayMyTuitionPayment}
                                        disabled={isPayMyTuitionDisabled}
                                    >
                                        Pay with International Currency
                                    </Button>
                                </div>

                                <div className={classes.buttonContainer}>
                                    <Button
                                        id={`${customId}_TouchNetButton`}
                                        fluid
                                        color="primary"
                                        href={payLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Pay with U.S. Currency
                                    </Button>
                                </div>


                            </div>
                        ) : (
                            <div id={`${customId}_Tab_Summarize`} role="tabpanel" >
                                <div className={classes.dropDown}>
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
                                <div className={classes.linksRow}>
                                    <TextLink
                                        onClick={handlePayMyTuitionPayment}
                                        className={classes.linkItem}
                                        title={'Pay with International Currency'}
                                    >
                                        Pay with International Currency
                                    </TextLink>
                                    <TextLink
                                        href={payLink}
                                        className={classes.linkItem}
                                        title={'Pay with U.S. Currency'}
                                    >
                                        Pay with U.S. Currency
                                    </TextLink>
                                </div>
                                <div>
                                    {dropdownStateTerm && (
                                        <Table>
                                            <TableBody>
                                                <Typography variant={"h6"}>
                                                    Transaction History
                                                </Typography>
                                                {groupTransByTerm[dropdownStateTerm].transactions
                                                    .map((item, index) => {
                                                        const transactionDate = formatTransDate.format(new Date(item.transDate));
                                                        return (
                                                            <TableRow key={`${item.termCode} - ${index}`} className={classes.transactionsTableRow}>
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
    }
    else {
        return (
            <div className={classes.root}>
                <Typography variant={'h4'} align={'center'}>
                    Loading...
                </Typography>
            </div>
        );
    }

}

OutstandingBalance.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(OutstandingBalance);
