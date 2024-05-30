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
    const personId = roles.pop();
    const customId = 'OutstandingBalance';
    const [summarize, setSumarize] = useState()
    const [balanceDetails, setBalanceDetails] = useState();
    const [residency, setResidency] = useState();
    const [studentInfo, setStudentInfo] = useState();
    const [payLink, setPayLink] = useState();

    const payLinkUS = 'https://test.secure.touchnet.net:8443/C21220test_tsa/web/caslogin.jsp';
    const paylinkIntl = 'https://ssb-prod.ec.pasadena.edu/PROD/bwymtfxp.P_MTFXPayment';

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
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

                const studentInfoResponse = await authenticatedEthosFetch(`${pipelineAPIStudentInfo}?cardId=${cardId}&testPersonId=${personId}`);
                const studentInfoResult = await studentInfoResponse.json();
                setStudentInfo(() => studentInfoResult[0])

                setLoadingStatus(false);

            } catch (error) {
                console.log(error)
            }
        })();
    }, []);


    function buttonClicked() {
        window.open(payLink, '_blank');
    }


    if (summarize && payLink && studentInfo) {
        const [{ accountBalance, amountDue }] = summarize;
        // const specialCase = ["vetStatus", "financialAid", "eops", "calwork", "dualEnrollment"].some(key => studentInfo[key].trim() != "");
        const specialCase = true;
        return (
            <div className={classes.root}>
                <div className={classes.content}>
                    {accountBalance > 100 && !specialCase && (<>
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
                        <div className={classes.balanceContainer}>
                            {todayDate <= deadlineDate ? (
                                <Typography variant={'body2'}>
                                    To ensure you are not dropped from classes, pay your fees at the time of your registration or make sure you have a financial aid application on file.
                                </Typography>
                            ) : (
                                <Typography variant={'body2'}>
                                    Upcoming drop for non-payment on {deadlineDate.toLocaleDateString('en-US')}. Make sure all your fees are paid before {deadlineDate.toLocaleDateString('en-US')} to avoid being dropped from all classes.
                                </Typography>
                            )}
                        </div>
                        <div className={classes.balanceContainer}>
                            <Typography variant={'h4'} align={'center'}>
                                <TextLink id={`${customId}_apply_for_aid`}
                                    href='https://pasadena.edu/admissions-and-aid/financial-aid/receiving-aid/apply-for-aid.php'>
                                    Click here to apply for Financial Aid</TextLink>
                            </Typography>
                        </div>
                    </>
                    )}
                    <div>
                        <Typography className={classes.message} variant="body1" component="div">
                            {`You don't have any outstanding Balance`}
                        </Typography>
                    </div>
                </div>
            </div >
        );
    } else {
        return (
            <div>
                <h1>testing</h1>
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