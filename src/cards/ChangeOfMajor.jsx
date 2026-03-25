import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    TextLink,
    TextField,
    Button
} from '@ellucian/react-design-system/core';
import { useCardControl, useCardInfo, useExtensionControl, useUserInfo, useData, useDashboardInfo } from '@ellucian/experience-extension-utils';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { Icon } from '@ellucian/ds-icons/lib';
import { use } from 'react';

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
    const { setLoadingStatus, setErrorMessage, navigateToPage } = useCardControl();
    const { configuration:
        {
            studentInfoAPI, majorInfoAPI, updateMajorAPI, updateConcentrationAPI
        }
        , cardId
    } = useCardInfo();

    const { authenticatedEthosFetch } = useData();
    const [studentId, setStudentId] = useState("");

    const handleSubmit = async () => {
        setLoadingStatus(true);
        navigateToPage({
            route: `/change-of-major/${studentId}`
        });
        setLoadingStatus(false);
    };

    const handleInputChange = (event) => {
        localStorage.setItem('studentId', event.target.value);
        setStudentId(event.target.value);
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
                size="default"
                className={classes.spacing}
                onChange={handleInputChange}
            />

            <Button
                id={`${customId}-submit-button`}
                color="primary"
                variant="contained"
                size="default"
                fluid
                className={classnames(classes.spacing)} onClick={handleSubmit}
            >
                Submit
            </Button>
        </div>
    );
}


ChangeOfMajor.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(ChangeOfMajor);