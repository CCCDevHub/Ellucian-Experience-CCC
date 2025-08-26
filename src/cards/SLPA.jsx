import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    Dropdown,
    DropdownItem
} from '@ellucian/react-design-system/core';
import { useCardControl, useData } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const styles = () => ({
    container: {
        padding: spacing40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
    },
    dropdownContainer: {
        width: '100%',
        maxWidth: '400px',
        marginBottom: spacing20
    },
    title: {
        marginBottom: spacing40,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    description: {
        marginBottom: spacing40,
        textAlign: 'center',
        color: '#666'
    }
});

function SLPA({ classes }) {
    const customId = 'SPLA';
    const { setLoadingStatus, navigateToPage } = useCardControl();
    const { getEthosQuery } = useData();
    const [dropdownStateTerm, setDropdownStateTerm] = useState();
    const [termList, setTermList] = useState([]);

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const termResult = await getEthosQuery({
                    queryId: 'term-list'
                });
                const termData = (termResult?.data?.academicPeriods?.edges?.map(edge => edge.node));
                setTermList(() => termData);
                localStorage.setItem('termList', JSON.stringify(termData));
                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);


    const handleChangeTerm = (event) => {
        setDropdownStateTerm(() => event.target.value);
        localStorage.setItem('selectedTerm', event.target.value);
        navigateToPage({
            route: `/SLPA`
        });
    };



    if (termList.length === 0) {
        return (
            <div className={classes.container}>
                <Typography variant="h6" className={classes.title}>
                    Student Registration Permit Override
                </Typography>
                <Typography variant="body2" className={classes.description}>
                    Loading terms...
                </Typography>
            </div>
        );
    }

    return (
        <div className={classes.container}>
            <Typography variant="h6" className={classes.title}>
                Student Registration Permit Override
            </Typography>
            <Typography variant="body2" className={classes.description}>
                Select a term to manage student registration overrides
            </Typography>

            <div className={classes.dropdownContainer}>
                <Dropdown
                    id={`${customId}_DropdownTerm`}
                    label="Select Term"
                    onChange={handleChangeTerm}
                    value={dropdownStateTerm}
                    fullWidth
                    variant="outlined"
                >
                    {termList.map(term => (
                        <DropdownItem
                            key={term.code}
                            label={term.title}
                            value={term.code}
                        />
                    ))}
                </Dropdown>
            </div>
        </div>
    );

}

SLPA.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SLPA);