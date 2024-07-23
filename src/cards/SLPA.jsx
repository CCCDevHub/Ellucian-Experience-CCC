import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink, Button, Dropdown, DropdownItem, Popover, CircularProgress, Snackbar } from '@ellucian/react-design-system/core';
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
    loading: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
});

function SLPA({ classes }) {
    const customId = 'SPLA';
    const { configuration:
        {
            microsoftPipelineAPI,
            bannerPipelineAPI
        }, cardId
    } = useCardInfo();
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const [excelData, setExcelData] = useState([]);
    const [dropdownStateTerm, setDropdownStateTerm] = useState();
    const [termList, setTermList] = useState([]);
    const [popoverState, setPopoverState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState(false);
    const [snackbarDuration, setSnackbarDuration] = useState(0);

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const termResult = await getEthosQuery({
                    queryId: 'term-list'
                });
                const termData = (termResult?.data?.academicPeriods?.edges?.map(edge => edge.node));
                setTermList(() => termData);
                const excelResponse = await authenticatedEthosFetch(`${microsoftPipelineAPI}?cardId=${cardId}`);
                const excelResult = await excelResponse.json();
                setExcelData(() => excelResult);
                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);

    const handleClick = async () => {
        if (dropdownStateTerm) {
            setLoading(true);
            const fetchPromises = [];

            excelData.forEach((stuId, index) => {
                if (index !== 0) {
                    setSnackbarDuration(1000);
                    const fetchPromise = authenticatedEthosFetch(`Test-Post-BPAPI?cardId=${cardId}&termCode=${dropdownStateTerm}&studentId=${stuId}`);
                    fetchPromises.push(fetchPromise);
                }
            });
            try {
                await Promise.all(fetchPromises);
                setLoading(false);
                setSnackbar(true);
            } catch (error) {
                console.error('Error fetching data: ', error);
                setLoading(false);
            }
        } else {
            setPopoverState(event.currentTarget);
        }
    };

    const handleChangeTerm = (event) => {
        setDropdownStateTerm(() => event.target.value);
    };

    const popoverHandleClose = () => {
        setPopoverState(null);
    };
    const snackbarClose = () => {
        setSnackbar(false);
    };
    if (termList && excelData) {
        return (
            <div className={classes.card}>
                <div>
                    <Dropdown
                        id={`${customId}_DropdownTerm}`}
                        label={'Select Term'}
                        onChange={handleChangeTerm}
                        value={dropdownStateTerm}
                        fullWidth
                    >
                        {termList.map(term => {
                            return (
                                <DropdownItem
                                    key={term.code}
                                    label={term.title}
                                    value={term.code}
                                />
                            );
                        })}
                    </Dropdown>
                </div>
                <br></br>
                {loading && (
                    <div className={classes.loading} >
                        <CircularProgress aria-valuetext="Inserting records..." />
                    </div>
                )}
                {snackbar && (
                    <Snackbar
                        open={snackbar}
                        variant='success'
                        message='Records Inserted.'
                        autoHideDuration={snackbarDuration}
                        onClose={snackbarClose}
                    />
                )}
                <br></br>

                <div>
                    <Button
                        id={`${customId}_Button`}
                        color="primary"
                        fluid
                        size="default"
                        onClick={handleClick}
                        variant="contained"
                        disabled={loading}
                    >
                        Process
                    </Button>
                    <Popover
                        id={`${customId}_Popover}`}
                        open={popoverState}
                        anchorEl={popoverState}
                        onClose={popoverHandleClose}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'center'
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'center'
                        }}
                    >
                        <Typography id={`${customId}_PopoverText}`}>Please select term.</Typography>
                    </Popover>
                </div>

            </div >
        );
    } else {
        return (
            <div>
                <Typography className={classes.message} variant="body1" component="div">
                    {`Something wrong`}
                </Typography>
            </div>
        );
    }

}

SLPA.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SLPA);