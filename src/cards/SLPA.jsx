import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    Dropdown,
    DropdownItem,
    makeStyles
} from '@ellucian/react-design-system/core';
import { useCardControl, useData } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

const useStyles = makeStyles()({
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

const SLPA = () => {
    const customId = 'SPLA';
    const { classes } = useStyles();
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
                window.localStorage.setItem('termList', JSON.stringify(termData));
                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
            }
        })();
    }, []);


    const handleChangeTerm = (event) => {
        setDropdownStateTerm(() => event.target.value);
        window.localStorage.setItem('selectedTerm', event.target.value);
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


export default SLPA;