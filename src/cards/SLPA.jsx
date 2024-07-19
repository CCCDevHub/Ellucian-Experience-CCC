import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink, Button, Dropdown, DropdownItem, Popover } from '@ellucian/react-design-system/core';
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

    const handleClick = () => {
        if (dropdownStateTerm) {
            console.log(dropdownStateTerm);
            console.log(excelData);
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
                <div>
                    <Button
                        id={`${customId}_Button`}
                        color="primary"
                        fluid
                        size="default"
                        onClick={handleClick}
                        variant="contained"> Process </Button>
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