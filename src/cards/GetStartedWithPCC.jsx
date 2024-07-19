import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { Icon } from '@ellucian/ds-icons/lib';
import { Button, IconButton, Popover } from "@ellucian/react-design-system/core";

const styles = () => ({
    card: {
        marginTop: 0,
        marginRight: spacing40,
        marginBottom: 0,
        marginLeft: spacing40
    },
    text: {
        marginRight: spacing40,
        marginLeft: spacing40
    },
    button: {
        marginLeft: -30,
        marginBottom: 10,
        width: "350px",
        paddingLeft: "20px",
        justifyContent: "left"
    },
    iconRoot: {
        marginRight: "10px",
        justifyContent: "flex-start"
    },
    completeBadge: {
        textAlign: "center"
    },
    completeButton: {
        marginLeft: -30,
        marginBottom: 10,
        paddingLeft: "20px",
        justifyContent: "center"
    }
});

const customId = 'SimpleButtons';

const MyInfo = (props) => {
    const {
        classes,
        cardInfo: { configuration: { pipelineAPI }, cardId },
        data: { authenticatedEthosFetch },
        cardControl: {
            setLoadingStatus,
            setErrorMessage,
            setPreventRemove
        },
        userInfo: { roles }
    } = props;

    const personId = roles.at(-1);
    const [checkLists, setCheckLists] = useState();
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverid, setPopoverid] = useState();

    const handlePopoverOpen = (event, popid) => {
        setAnchorEl(event.currentTarget);
        setPopoverid(popid);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
        setPopoverid(null);
    };

    setPreventRemove(true);

    useEffect(() => {
        (async () => {
            setLoadingStatus(true);
            try {
                const gettingStarted = await authenticatedEthosFetch(`${pipelineAPI}?cardId=${cardId}&testPersonId=${personId}`);
                const gettingStartedResult = await gettingStarted.json();
                setCheckLists(() => gettingStartedResult[0]);
                setLoadingStatus(false);

            } catch (error) {
                console.log('ethosQuery failed', error);
                setErrorMessage({
                    headerMessage: ({ id: 'GraphQLQueryCard-fetchFailed' }),
                    textMessage: ({ id: 'GraphQLQueryCard-classesFetchFailed' }),
                    iconName: 'error',
                    iconColor: '#D42828'
                });
            }
        }
        )();
    }, []);

    // Check if all the data is loaded
    if (checkLists) {
        // const person = destructPersonData(persons);

        // check if all milestones are complete
        // const c = person[0];
        const c = destructData(checkLists);

        return (
            <div className={classes.card}>

                {/* Comment: Display "Early Registration" badge if all milestones are completed */}
                <div className={classes.completeBadge}>
                    <img src={c.complete ? "https://admin.pasadena.edu/dev/badges/images/reg_pri.png" : ""} alt=""></img>
                </div>

                <ul>
                    {c.map(m => (
                        <li key={m.id}
                            style={{
                                listStyleType: "none",
                                display: "flex",
                                alignItems: "start"

                            }}
                        >
                            <Button
                                id={`${customId}_PrimaryButton`}
                                className={m.complete ? classes.completeButton : classes.button}
                                href={m.linkURL}
                                color={m.buttoncolor}
                                fullWidth
                            >
                                <div>
                                    <Icon name={m.iconname} className={classes.iconRoot} color={m.iconcolor} />
                                    {m.name}
                                </div>
                            </Button>

                            <IconButton
                                color="black"
                                id={`${customId}_GrayButtonBlueBackground`}
                                aria-label="help"
                                className={classes.buttonSpacing}
                                onClick={(e) => handlePopoverOpen(e, m.id)}
                            >
                                <Icon name="help" />
                            </IconButton>

                            <Popover
                                className={classes.popover}
                                classes={{
                                    paper: classes.paper
                                }}
                                open={popoverid === m.id}
                                onClose={handlePopoverClose}
                                anchorEl={anchorEl}
                                transformOrigin={{
                                    horizontal: "left",
                                    vertical: "center"
                                }}
                                anchorOrigin={{
                                    horizontal: "right",
                                    vertical: "center"
                                }}
                            >
                                {m.hovertext}
                            </Popover>
                        </li>
                    ))}
                </ul>
                <div className={classes.iconRoot}>
                    <p><b>Note:</b> High School Dual or Concurrent Enrollment students do not need to complete these badges to register.</p>
                </div>
            </div>
        );
    }
    else {
        return (null);
    }
};

function createData(id, name, value, hovertext, linkURL, buttoncolor, iconname, iconcolor, complete) {
    return { id, name, value, hovertext, linkURL, buttoncolor, iconname, iconcolor, complete };
}

function createHoverText(isComplete, completedText, incompleteText, link) {
    return isComplete ? completedText : (
        <p>{incompleteText} <a rel="noreferrer" target="_blank" href={link}>{link}</a>.</p>
    );
}

function getButtonColor(isComplete) {
    return isComplete ? 'secondary' : 'primary';
}

function getIconProps(isComplete) {
    return {
        name: isComplete ? 'check-circle' : 'circle',
        color: isComplete ? 'green' : 'white'
    };
}

function checkAllMilestonesComplete(checklist) {
    return checklist.orientation === "1" &&
        checklist.assessment === "1" &&
        checklist.edPlan === "1" &&
        checklist.regPri === "1";
}

function destructData(checklist) {
    let id = 0;
    function createData(name, value, hovertext, linkURL, buttoncolor, iconname, iconcolor, complete) {
        id += 1;
        return { id, name, value, hovertext, linkURL, buttoncolor, iconname, iconcolor, complete };
    }
    // if all milestones are complete, show completed badge
    if (checklist.orientation === 1 &&
        checklist.assessment === 1 &&
        checklist.edPlan === 1 &&
        checklist.regPri === 1) {
        return [
            createData('Register',
                'null',
                'You have completed steps for early registration!',
                'https://ssb-prod.ec.pasadena.edu/PROD/bwskflib.P_SelDefTerm',
                'null',
                'null',
                'null',
                1)
        ]
    }
    else {
        return [
            createData('Orientation',
                checklist.orientation,
                checklist.orientation == 1 ? 'You have completed the online orientation.' : <p>You have not completed your online orientation. Please visit <a rel="noreferrer" target="_blank" href="https://orientation.pasadena.edu"> https://orientation.pasadena.edu </a> to get started.</p>,
                'https://orientation.pasadena.edu',
                checklist.orientation == 1 ? 'secondary' : 'primary',
                checklist.orientation == 1 ? 'check-circle' : 'circle',
                checklist.orientation == 1 ? "green" : "white",
                0),
            createData('Placement',
                checklist.assessment,
                checklist.assessment == 1 ? <p>You have completed your placement process. For help selecting appropriate classes visit: <a rel="noreferrer" target="_blank" href="https://pasadena.edu/academics/support/counseling/academic-planning/placement.php">https://pasadena.edu/academics/support/counseling/academic-planning/placement.php </a>.</p>
                    : <p>You have not completed the placement process. To know what English and math courses are right for you, get started by visiting <a rel="noreferrer" target="_blank" href="https://pasadena.edu/academics/support/counseling/academic-planning/placement.php">https://pasadena.edu/academics/support/counseling/academic-planning/placement.php </a>.</p>,
                'https://pasadena.edu/academics/support/counseling/academic-planning/placement.php',
                checklist.assessment == 1 ? 'secondary' : 'primary',
                checklist.assessment == 1 ? 'check-circle' : 'circle',
                checklist.assessment == 1 ? "green" : "white",
                0),
            createData('Ed Plan',
                checklist.edPlan,
                checklist.edPlan == 1 ? <p>You have completed an educational plan. To view, please visit <a rel="noreferrer" target="_blank" href="https://pasadena.edu/academics/support/counseling/academic-planning/">https://pasadena.edu/academics/support/counseling/academic-planning/ </a>.</p>
                    : <p>Completing an educational plan will make sure you’re taking the correct classes. (You can register without a plan) To request a plan use this link: <a rel="noreferrer" target="_blank" href="https://pasadena.edu/academics/support/counseling/ask-a-counselor/new-students.php">https://pasadena.edu/academics/support/counseling/ask-a-counselor/new-students.php </a>.</p>,
                'https://pasadena.edu/academics/support/counseling/academic-planning/',
                checklist.edPlan == 1 ? 'secondary' : 'primary',
                checklist.edPlan == 1 ? 'check-circle' : 'circle',
                checklist.edPlan == 1 ? "green" : "white",
                0),
            createData('Early Registration',
                checklist.regPri,
                checklist.regPri == 1 ? 'You have completed steps for early registration!' : 'To get registration priority, you must first complete the online orientation, assessment, and Ed Plan.',
                'https://pasadena.edu/academics/support/counseling/academic-planning/placement.php',
                checklist.regPri == 1 ? 'secondary' : 'primary',
                checklist.regPri == 1 ? 'check-circle' : 'circle',
                checklist.regPri == 1 ? "green" : "white",
                0)
        ];
    }
}


MyInfo.propTypes = {
    classes: PropTypes.object.isRequired,
    cardControl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    cardInfo: PropTypes.object.isRequired,
    userInfo: PropTypes.object.isRequired
}

export default withStyles(styles)(MyInfo);
