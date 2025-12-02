import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40, spacing20, spacing60 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextField, Button } from '@ellucian/react-design-system/core';
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
    header: {
        marginBottom: spacing40
    },
    inputContainer: {
        marginBottom: spacing40
    },
    buttonContainer: {
        marginTop: spacing40,
        textAlign: 'center'
    },
    button: {
        minWidth: '200px',
        padding: '12px 24px',
        textTransform: 'none',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
        }
    }
});

function Transcript({ classes }) {
    const customId = 'Unofficial-Transcript';
    const { setLoadingStatus, setErrorMessage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const [currentTerm, setCurrentTerm] = useState([]);
    const [studentId, setStudentId] = useState('');
    const testLink = 'https://studentssb-test.ec.pasadena.edu:8100'
    const prodLink = 'https://studentssb-prod.ec.pasadena.edu';

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const termResult = await getEthosQuery({
                    queryId: 'current-term', properties: { todayDate: new Date().toJSON().slice(0, 10) }
                });
                // const sectionResult = await mock;
                console.log('termResult', termResult);
                const termData = (termResult?.data?.academicPeriods?.edges?.map(edge => edge.node));
                setCurrentTerm(termData[0]);
                setLoadingStatus(false);
            } catch (error) {
                console.error('Failed to load sections:', error);
                setErrorMessage('Failed to load sections. Please try again.');
                setLoadingStatus(false);
            }
        })();
    }, []);
    const handleChange = (event) => {
        setStudentId(event.target.value);
    };

    return (
        <div className={classes.card}>
            <Typography variant="h6" className={classes.header}>
                Student Transcript Lookup
            </Typography>
            <div className={classes.inputContainer}>
                <TextField
                    id={`${customId}_studentId_input`}
                    label="Student Id"
                    name="studentIdLabel"
                    onChange={handleChange}
                    value={studentId}
                    fullWidth
                    variant="outlined"
                />
            </div>
            <div className={classes.buttonContainer}>
                <Button
                    variant="contained"
                    color="primary"
                    href={`${prodLink}/StudentSelfService/ssb/academicTranscript?studentId=${studentId}&termCode=${currentTerm.code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.button}
                    disabled={!studentId}
                >
                    View Unofficial Transcript
                </Button>
            </div>
        </div>
    );
}

Transcript.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(Transcript);