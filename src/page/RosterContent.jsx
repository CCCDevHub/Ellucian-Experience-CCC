import { spacing20, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import {
    Typography,
    Table,
    TableRow,
    TableCell,
    TableBody,
    TableHead,
    Button,
    IconButton,
    Tooltip,
    Switch
} from '@ellucian/react-design-system/core';
import { Icon } from '@ellucian/ds-icons/lib';
import React from 'react';

const RosterContent = ({
    studentList,
    waitlistData,
    includeEmailInPrint,
    setIncludeEmailInPrint,
    showRoster,
    setShowRoster,
    showWaitlist,
    setShowWaitlist,
    onPrintBlankSheet,
    onExportToExcel,
    onCopyAllEmails,
    onCopyWaitlistEmails
}) => (
    <div style={{ marginTop: spacing40, marginBottom: spacing40 }}>
        <div style={{ marginTop: spacing40, marginBottom: spacing40, display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Button onClick={onPrintBlankSheet} variant="contained" color="primary">
                Print Weekly Roster
            </Button>
            <Button onClick={onExportToExcel} variant="contained" color="primary">
                Export to Excel
            </Button>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                    checked={includeEmailInPrint}
                    onChange={(e) => setIncludeEmailInPrint(e.target.checked)}
                />
                <Typography>Include Email</Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                    checked={showRoster}
                    onChange={(e) => setShowRoster(e.target.checked)}
                />
                <Typography>Show Roster</Typography>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                    checked={showWaitlist}
                    onChange={(e) => setShowWaitlist(e.target.checked)}
                />
                <Typography>Show Waitlist</Typography>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: spacing20 }}>
            <Typography variant="h5" style={{ display: 'inline' }}>Student Roster</Typography>
            {studentList?.length > 0 && (
                <Typography variant="body2" style={{ background: '#e0e0e0', borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>
                    {studentList.length}
                </Typography>
            )}
        </div>
        {showRoster && <Table>
            <TableHead>
                <TableRow>
                    <TableCell><Typography variant="h6">#</Typography></TableCell>
                    <TableCell><Typography variant="h6">Student ID</Typography></TableCell>
                    <TableCell><Typography variant="h6">Student Name</Typography></TableCell>
                    <TableCell>
                        <Typography variant="h6" style={{ display: 'inline' }}>Email</Typography>
                        <Tooltip title="Copy all emails">
                            <IconButton
                                size="small"
                                color="default"
                                onClick={onCopyAllEmails}
                                style={{ marginLeft: '4px', padding: '2px' }}
                            >
                                <Icon name="copy" style={{ fontSize: '14px', color: '#666' }} />
                            </IconButton>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {studentList?.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.student_id}</TableCell>
                        <TableCell>{item.student_name}</TableCell>
                        <TableCell>{item.student_email}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>}

        <div style={{ marginTop: spacing40, borderTop: '1px solid #e0e0e0', paddingTop: spacing40, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Typography variant="h5" style={{ display: 'inline' }}>Waitlist</Typography>
            {waitlistData?.length > 0 && (
                <Typography variant="body2" style={{ background: '#e0e0e0', borderRadius: '12px', padding: '2px 10px', fontWeight: 600 }}>
                    {waitlistData.length}
                </Typography>
            )}
        </div>
        {showWaitlist && (!waitlistData || waitlistData.length === 0 ? (
            <Typography style={{ marginTop: spacing20, color: '#757575', fontStyle: 'italic' }}>
                No students on the waitlist.
            </Typography>
        ) : (
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><Typography variant="h6">#</Typography></TableCell>
                        <TableCell><Typography variant="h6">Student ID</Typography></TableCell>
                        <TableCell><Typography variant="h6">Student Name</Typography></TableCell>
                        <TableCell>
                            <Typography variant="h6" style={{ display: 'inline' }}>Email</Typography>
                            <Tooltip title="Copy all emails">
                                <IconButton
                                    size="small"
                                    color="default"
                                    onClick={onCopyWaitlistEmails}
                                    style={{ marginLeft: '4px', padding: '2px' }}
                                >
                                    <Icon name="copy" style={{ fontSize: '14px', color: '#666' }} />
                                </IconButton>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {waitlistData?.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.student_id}</TableCell>
                            <TableCell>{item.student_name}</TableCell>
                            <TableCell>{item.student_email}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        ))}
    </div>
);

export default RosterContent;
