import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { Typography, TextLink, TextField } from '@ellucian/react-design-system/core';
import PropTypes from 'prop-types';
import React from 'react';

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    }
});

function FreshService  ({classes})  {
    const customId = 'api';
    return (
        <div className={classes.card}>
            <h1>Hello World</h1>
        </div>
    );
}

FreshService.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(FreshService);