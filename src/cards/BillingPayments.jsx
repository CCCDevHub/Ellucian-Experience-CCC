import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40, spacing30, spacing20, spacing10 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextLink,
    Button,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    List,
    ListItem
} from '@ellucian/react-design-system/core';
import { FileText, MoneyCheckEdit } from '@ellucian/ds-icons/lib';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import classnames from 'classnames';
import { Icon } from '@ellucian/ds-icons/lib';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },
    buttonContainer: {
        marginBottom: spacing30
    },
    panelContainer: {
        marginBottom: spacing20
    },
    summaryContent: {
        display: 'flex',
        alignItems: 'center',
        gap: spacing10
    },
    icon: {
        marginRight: spacing10
    },
    linkDetails: {
        paddingTop: spacing10,
        paddingBottom: spacing10,
        display: 'block'
    },
    hiddenForm: {
        display: 'none'
    }
});

function BillingPayments({ classes }) {
    const customId = 'OutstandingBalance';

    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { configuration: {
        pipelineAPI, pipelineAPIStudentInfo, paymentDate
    }, cardId } = useCardInfo();
    const { roles } = useUserInfo();

    const payLinkUS = 'https://secure.touchnet.net/C21220_tsa/web/caslogin.jsp';

    const personId = roles.at(-1);
    const formRef = useRef(null);

    const [payLink, setPayLink] = useState();
    const [accountBalance, setAccountBalance] = useState();
    const [studentId, setStudentId] = useState();
    const [fullName, setFullName] = useState('');

    const todayDate = new Date().toJSON().slice(0, 10);

    // Check if PayMyTuition should be disabled (after deadline)
    const isPayMyTuitionDisabled = paymentDate && todayDate > paymentDate;

    const handlePayMyTuitionPayment = () => {
        if (formRef.current && !isPayMyTuitionDisabled) {
            formRef.current.submit();
        }
    };

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {


                // Fetch student information
                const residencyResult = await getEthosQuery({
                    queryId: 'residency-info'
                });

                const residencyData = (residencyResult?.data?.students?.edges.map(edge => edge.node));
                const studentFullName = residencyData[0]?.person12?.fullName;
                const studentIdData = residencyData[0]?.person12?.credentials.filter(cred => cred.type === 'bannerId')[0]?.value;
                setFullName(() => studentFullName);
                setStudentId(() => studentIdData);

                // Set payLink for TouchNet
                setPayLink(() => payLinkUS);

                // Fetch balance information
                const balanceResponse = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&testPersonId=${personId}`);
                const balanceResult = await balanceResponse.json();
                const [{ TBRACCD_CTRL, TBRACCD }] = balanceResult;

                const [{ accountBalance, amountDue }] = TBRACCD_CTRL;
                setAccountBalance(() => accountBalance);

                // Fetch student information for international students
                if (pipelineAPIStudentInfo) {
                    const studentInfoResponse = await authenticatedEthosFetch(`${pipelineAPIStudentInfo}?cardId=${cardId}&testPersonId=${personId}`);
                    const studentInfoResult = await studentInfoResponse.json();

                    // Extract student ID and name from the response
                    if (studentInfoResult && studentInfoResult.length > 0) {
                        const studentData = studentInfoResult[0];
                        setStudentId(studentData.studentId || personId);
                        setFullName(studentData.fullName || '');
                    }
                }

                setLoadingStatus(false);

            } catch (error) {
                console.log(error)
                setLoadingStatus(false);
            }
        })();
    }, []);

    return (
        <div className={classes.card}>
            <div className={classes.buttonContainer}>
                <Button
                    id={`${customId}_PayMyTuitionButton`}
                    fluid
                    color="primary"
                    onClick={handlePayMyTuitionPayment}
                    disabled={isPayMyTuitionDisabled}
                >
                    Pay with PayMyTuition
                </Button>
            </div>

            <form
                ref={formRef}
                className={classes.hiddenForm}
                id="tuitionForm"
                action="https://www.paymytuition.com/server/post_to_pmt.aspx"
                method="post"
                target="_blank"
            >
                <input type="hidden" name="External_Institute_Id" value="pasadena" />
                <input type="hidden" name="mtfx_website" value="https://www.paymytuition.com/server/post_to_pmt.aspx" />
                <input type="hidden" name="Routing_Type" value="International" />
                <input type="hidden" name="Student_Id" value={studentId || ''} />
                <input type="hidden" name="full_name" value={fullName || ''} />
                <input type="hidden" name="Balance_Due" value={accountBalance || ''} />
                <input type="hidden" name="Payment_Amount" value={accountBalance || ''} />
            </form>

            <div className={classes.buttonContainer}>
                <Button
                    id={`${customId}_TouchNetButton`}
                    fluid
                    color="primary"
                    href={payLink}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Pay with TouchNet
                </Button>
            </div>

            <div className={classes.panelContainer}>
                <ExpansionPanel>
                    <ExpansionPanelSummary>
                        <div className={classes.summaryContent}>
                            <MoneyCheckEdit className={classes.icon} />
                            <Typography>My Payments</Typography>
                        </div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.linkDetails}>
                        <List>
                            <ListItem divider="true">
                                <TextLink
                                    onClick={handlePayMyTuitionPayment}
                                    style={{ cursor: isPayMyTuitionDisabled ? 'not-allowed' : 'pointer', opacity: isPayMyTuitionDisabled ? 0.5 : 1 }}
                                >
                                    Pay with PayMyTuition
                                </TextLink>
                            </ListItem>
                            <ListItem divider="true">
                                <TextLink href={payLink} target="_blank" rel="noopener noreferrer">
                                    Pay with TouchNet
                                </TextLink>
                            </ListItem>
                            <ListItem>
                                <TextLink href="https://studentssb-prod.ec.pasadena.edu/StudentSelfService/ssb/accountDetailByTerm" target="_blank" rel="noopener noreferrer">
                                    View My Account Statement
                                </TextLink>
                            </ListItem>
                        </List>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>

            <div className={classes.panelContainer}>
                <ExpansionPanel>
                    <ExpansionPanelSummary>
                        <div className={classes.summaryContent}>
                            <FileText className={classes.icon} />
                            <Typography>Tax Forms</Typography>
                        </div>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={classes.linkDetails}>
                        <List>
                            <ListItem divider="true">
                                <TextLink href="https://studentssb-prod.ec.pasadena.edu/StudentSelfService/ssb/studentTaxNotification#!/" target="_blank" rel="noopener noreferrer">
                                    1098-T Notification
                                </TextLink>
                            </ListItem>
                            <ListItem>
                                <TextLink href="http://pasadena.edu/business-administrative-services/fiscal-services/form-1098-t.php" target="_blank" rel="noopener noreferrer">
                                    1098-T Information / FAQ
                                </TextLink>
                            </ListItem>
                        </List>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            </div>
        </div>
    );
}

BillingPayments.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BillingPayments);