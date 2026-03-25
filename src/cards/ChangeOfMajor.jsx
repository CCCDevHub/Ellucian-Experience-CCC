import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextField, Button } from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },
    spacing: {
        marginBottom: spacing40
    }
});

function ChangeOfMajor({ classes }) {
    const customId = 'change-of-major';
    const { setLoadingStatus, navigateToPage } = useCardControl();
    useCardInfo();
    const [studentId, setStudentId] = useState('');

    const handleSubmit = async () => {
        setLoadingStatus(true);
        navigateToPage({ route: '/change-of-major' });
        setLoadingStatus(false);
    };

    const handleInputChange = (event) => {
        localStorage.setItem('studentId', event.target.value);
        setStudentId(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && studentId.trim()) handleSubmit();
    };

    return (
        <div className={classes.card}>
            <Typography style={{ marginBottom: spacing40, textAlign: 'center' }}>
                Enter Student ID to change major and concentration
            </Typography>

            <TextField
                id={`${customId}-student-id`}
                label="Student ID"
                placeholder="Enter Student ID"
                value={studentId}
                fullWidth
                className={classes.spacing}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
            />

            <Button
                id={`${customId}-submit-button`}
                color="primary"
                variant="contained"
                disabled={!studentId.trim()}
                fluid
                className={classes.spacing}
                onClick={handleSubmit}
            >
                Open
            </Button>
        </div>
    );
}

ChangeOfMajor.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ChangeOfMajor);
