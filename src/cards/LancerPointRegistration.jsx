import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink, Dropdown, DropdownItem, Button, Popover } from '@ellucian/react-design-system/core';
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
    loading: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    spacing: {
        marginBottom: spacing40
    }
});

function LancePointRegistration({ classes }) {
    const customId = 'LancerPointRegistration';
    const { configuration:
        {
            PCCVTEA
        }, cardId
    } = useCardInfo();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();

    const [termList, setTermList] = useState([]);
    const [dropdownStateTerm, setDropdownStateTerm] = useState();
    const [personId, setPersonId] = useState([]);
    const [pccvtea, setPCCVTEA] = useState([]);
    const [popoverState, setPopoverState] = useState(null);
    const [popOverMsg, setPopOverMsg] = useState();

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const termResult = await getEthosQuery({
                    queryId: 'term-list'
                });
                const termData = (termResult?.data?.academicPeriods?.edges?.map(edge => edge.node));
                setTermList(() => termData);
                const personResult = await getEthosQuery({
                    queryId: 'getPerson'
                });
                const personData = (personResult?.data?.persons?.edges?.map(edge => edge.node));
                setPersonId(() => personData[0]?.credentials[0]?.value);
                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);


    const handleChangeTerm = (event) => {
        setDropdownStateTerm(() => event.target.value);
        const termCode = event.target.value
        const fetchData = async () => {
            try {
                setLoadingStatus(true);
                const response = await authenticatedEthosFetch(`${PCCVTEA}?cardId=${cardId}&termCode=${termCode}&studentId=${personId}`);
                const result = await response.json();
                setPCCVTEA(result);
                setLoadingStatus(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoadingStatus(false);
            }
        };
        fetchData()
    };

    const popoverHandleClose = () => {
        setPopoverState(null);
    };

    const renderBody = () => {
        const hasData = pccvtea.length !== 0;
        let href = '#';
        if (dropdownStateTerm) {
            href = hasData
                ? 'https://reg-test.ec.pasadena.edu:8103/StudentRegistrationSsb'
                : `https://generalssb-test.ec.pasadena.edu:8101/BannerExtensibility/customPage/page/pbsxVteaSurvey?termcode=${dropdownStateTerm}`;
        }

        return (
            <div>
                {!hasData && (
                    <Typography paragraph>
                        You have not filled out the required survey, please fill out the PCC VTEA survey in order to proceed
                    </Typography>
                )}
                <TextLink href={href} target="_blank" rel="noopener noreferrer">
                    <Button
                        id={`${customId} _Button`}
                        color="primary"
                        fluid
                        size="default"
                        onClick={(event) => {
                            if (!dropdownStateTerm) {
                                setPopoverState(event.currentTarget);
                            }
                        }}
                        variant="contained"
                    >
                        {hasData ? 'Click Here to Register' : 'PCC VTEA Survey'}
                    </Button>
                </TextLink>
                <Popover
                    id={`${customId} _Popover`}
                    open={Boolean(popoverState)}
                    anchorEl={popoverState}
                    onClose={popoverHandleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    PaperProps={{
                        style: {
                            padding: '12px 16px',
                            backgroundColor: '#fef3c7',
                            border: '1px solid #fcd34d',
                            borderRadius: '4px',
                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                    }}
                >
                    <Typography id={`${customId} _PopoverText`} variant="body2" color="textPrimary">
                        {popOverMsg || 'Please select term.'}
                    </Typography>
                </Popover>
            </div>
        );
    };


    return (
        <div className={classes.card} >
            <div className={classes.content}>
                <Typography paragraph>
                    Please select the term you wish to register for:
                </Typography>
                <Dropdown
                    id={`${customId} _DropdownTerm`}
                    label={'Select Term'}
                    onChange={handleChangeTerm}
                    value={dropdownStateTerm}
                    fullWidth
                    className={classes.spacing}
                >
                    {termList.map(term => (
                        <DropdownItem
                            key={term.code}
                            label={term.title}
                            value={term.code}
                        />
                    ))}
                </Dropdown>
                {dropdownStateTerm && renderBody()}

            </div>
        </div >
    );
}

LancePointRegistration.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(LancePointRegistration);