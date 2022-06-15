import { withStyles } from '@ellucian/react-design-system/core/styles';
import {spacing10, spacing40, spacingSmall, widthFluid} from '@ellucian/react-design-system/core/styles/tokens';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {useCardInfo} from "@ellucian/experience-extension/extension-utilities";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextLink,
    Typography
} from "@ellucian/react-design-system/core";


const cacheKey = 'section-table-data';

const styles = () => ({
    card: {
        marginLeft: spacing40,
        marginRight: spacing40,
        paddingTop: spacing10
    },
    text: {
        marginRight: spacing40,
        marginLeft: spacing40
    },
    root: {
        width: widthFluid,
        paddingTop: spacing10,
        overflowX: 'auto'
    }
});

const PropsPage = (props) => {
    const { classes,
            cache: {
                getItem,
                storeItem
            },
        cardControl: {
            setLoadingStatus,
            setErrorMessage,
            navigateToPage
        }
    } = props;
    const { cardId } = useCardInfo();
    const [tableData, setTableData] = useState();

    useEffect(() => {
        (async () => {
            const { data } = await getItem({ key: cacheKey, scope: cardId });
            setTableData(() => data);
        })();

        // load and increment view count

    }, []);

    return (
        <div className={classes.root}>
            <Typography>
                <Table layout={{ variant: 'card', breakpoint: 'sm'}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Status</TableCell>
                            <TableCell>Course Title</TableCell>
                            <TableCell>Dept</TableCell>
                            <TableCell>CSN</TableCell>
                            <TableCell>Term</TableCell>
                            <TableCell>CRN</TableCell>
                            <TableCell>Session</TableCell>
                            <TableCell>Enrolled</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData?.map(n => {
                            return (
                                <TableRow key={n.id}>
                                    <TableCell columnName="Status">
                                        {n.status}
                                    </TableCell>
                                    <TableCell columnName="Course Title">
                                        // TODO: remove TEST link
                                        <TextLink id={n.id}
                                                 // href={`https://ssb-prod.ec.pasadena.edu/PROD/bwlkffgd.P_FacFinGrd?TERM=${n.termCode}&CRN=${n.crn}`}>
                                                  href={`https://ssb-dev.ec.pasadena.edu:9003/TEST/bwlkffgd.P_FacFinGrd?TERM=${n.termCode}&CRN=${n.crn}`}>                                            {n.title}
                                        </TextLink>
                                    </TableCell>
                                    <TableCell columnName="Dept">
                                        {n.dept}
                                    </TableCell>
                                    <TableCell columnName="CSN">
                                        {n.csn}
                                    </TableCell>
                                    <TableCell columnName="Term">
                                        {n.term}
                                    </TableCell>
                                    <TableCell columnName="CRN">
                                        {n.crn}
                                    </TableCell>
                                    <TableCell columnName="Session">
                                        -
                                    </TableCell>
                                    <TableCell columnName="Enrolled">
                                        {n.enrolled}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </Typography>
        </div>
    )

};

PropsPage.propTypes = {
    classes: PropTypes.object.isRequired,
    cache: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired

};

export default withStyles(styles)(PropsPage);