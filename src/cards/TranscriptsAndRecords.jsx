import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    List,
    ListItem,
    ListItemIcon,
    TextLink
} from '@ellucian/react-design-system/core';
import { Icon } from '@ellucian/ds-icons/lib';
import {
    useCache,
    useCardInfo,
    useData,
    useExperienceInfo,
    useExtensionControl,
    useExtensionInfo,
    useThemeInfo,
    useUserInfo,
    useDashboardInfo,
    useCardControl,
    usePageControl,
    usePageInfo
} from '@ellucian/experience-extension-utils';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

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

const TranscriptsAndRecords = (classes) => {
    const customId = 'TranscriptsAndRecords';
    const { setLoadingStatus, setErrorMessage, navigateToPage } = useCardControl();
    const { authenticatedEthosFetch, getEthosQuery } = useData();
    const [sections, setSections] = useState([]);
    const [dropdownStateSection, setDropdownStateSection] = useState();

    const { configuration: {
        pipelineAPI }, cardId } = useCardInfo();

    const [person, setPerson] = useState();

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const personResult = await getEthosQuery({ queryId: 'person-info' });
                const personData = (personResult?.data?.persons?.edges.map(edge => edge.node));
                setPerson(() => personData[0]);
                setLoadingStatus(false);
            } catch (error) {
                console.log('ethosQuery failded', error);
                setErrorMessage({
                    headerMessage: ({ id: 'GraphQLQueryCard-fetchFailed' }),
                    textMessage: ({ id: 'GraphQLQueryCard-classesFetchFailed' }),
                    iconName: 'error',
                    iconColor: '#D42828'
                });
            }
        })();
    }, []);


    const bannerId = person?.credentials?.find(cred => cred.type === 'bannerId')?.value;


    const handleClick = () => {
        (async () => {
            setLoadingStatus(true);
            try {
                const response = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&bannerId=${bannerId}`);
                const htmlContent = await response.text();
                const tokenMatch = htmlContent.match(/name=\\"token_name\\"\s+value=\\"([^"]+)\\"/);
                const token = tokenMatch ? tokenMatch[1] : '';
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = 'https://secure.studentclearinghouse.org/sssportalui/sssportal';
                form.target = '_blank';

                const tokenInput = document.createElement('input');
                tokenInput.type = 'hidden';
                tokenInput.name = 'token_name';
                tokenInput.value = token;

                form.appendChild(tokenInput);
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);

                setLoadingStatus(false);
            } catch (error) {
                console.log(error);
                setLoadingStatus(false);
            }
        })();
    }

    return (
        <div className={classes.card}>
            <Typography variant="body2">
                <List>
                    <ListItem divider="true">
                        <ListItemIcon className={classes.itemText}>
                            <Icon name="show" color="gray"
                                className={classNames(classes.check, classes.icon)}
                            />
                        </ListItemIcon>
                        <TextLink
                            id={"viewUnofficialTranscript"}
                            href="https://studentssb-prod.ec.pasadena.edu/StudentSelfService/ssb/academicTranscript"
                        >
                            View My Unofficial Transcript
                        </TextLink>
                    </ListItem>
                    <ListItem divider="true">
                        <ListItemIcon className={classes.itemText}>
                            <Icon name="cart" color="gray"
                                className={classNames(classes.check, classes.icon)}

                            />
                        </ListItemIcon>
                        <TextLink
                            id={"orderTranscript"}
                            href="https://www.parchment.com/u/registration/34562/institution"
                        >
                            Order Official Transcripts & GE Certification
                        </TextLink>
                    </ListItem>
                    <ListItem divider="true">
                        <ListItemIcon className={classes.itemText}>
                            <Icon name="check" color="gray"
                                className={classNames(classes.check, classes.icon)}

                            />
                        </ListItemIcon>
                        <TextLink
                            id={"clearingHouseLink"}
                            onClick={() => handleClick()}>
                            Enrollment Verification
                        </TextLink>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon className={classes.itemText}>
                            <Icon name="help" color="gray"
                                className={classNames(classes.check, classes.icon)}
                            />
                        </ListItemIcon>
                        <TextLink
                            id={"help"}
                            href="http://www.pasadena.edu/admissions-and-aid/admissions-and-records/records-transcripts/transcript-request.php"
                        >
                            Transcript Help
                        </TextLink>
                    </ListItem>
                </List>
            </Typography>
        </div>
    );
};

TranscriptsAndRecords.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(TranscriptsAndRecords);