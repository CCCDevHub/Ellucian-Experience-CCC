import * as XLSX from 'xlsx';
import { formatDate } from './dateTime';

export const exportRosterToExcel = ({
    courseName,
    crn,
    courseTitle,
    courseSubject,
    courseCredits,
    courseInstructor,
    courseType,
    courseMeetingDays,
    courseMeetingTimes,
    courseBuilding,
    courseRoom,
    criticalDatesData,
    studentList,
    waitlistData
}) => {
    const wb = XLSX.utils.book_new();

    // --- Roster sheet ---
    const rosterRows = [];

    // Course info header block
    rosterRows.push(['Course Information']);
    rosterRows.push(['Section', courseName, 'CRN', crn]);
    rosterRows.push(['Title', courseTitle, 'Subject', courseSubject]);
    rosterRows.push(['Credits', courseCredits, 'Instructor', courseInstructor]);
    rosterRows.push(['Class Type', courseType]);
    if (!courseType.includes('Online')) {
        rosterRows.push(['Meeting Days', courseMeetingDays, 'Meeting Times', courseMeetingTimes]);
    }
    rosterRows.push(['Location', `${courseBuilding} ${courseRoom}`.trim()]);
    rosterRows.push([]);

    // Critical dates
    rosterRows.push(['Critical Dates']);
    rosterRows.push(['Date to Enroll', formatDate(criticalDatesData?.lastDateToEnroll)]);
    rosterRows.push(['Last day to add class', formatDate(criticalDatesData?.lastDateToEnroll)]);
    rosterRows.push(['Last day to drop with a refund', formatDate(criticalDatesData?.refundDate)]);
    rosterRows.push(['Census Date', formatDate(criticalDatesData?.censusDate)]);
    rosterRows.push(['Last day to drop without a "W"', formatDate(criticalDatesData?.dropNoWDate)]);
    rosterRows.push(['Last day to declare grade mode', formatDate(criticalDatesData?.grademodeDate)]);
    rosterRows.push(['Last day to drop with a "W"', formatDate(criticalDatesData?.dropWDate)]);
    rosterRows.push([]);

    // Roster table header
    rosterRows.push(['#', 'Student ID', 'Student Name', 'Email']);

    // Roster data
    studentList?.forEach((item, index) => {
        rosterRows.push([
            index + 1,
            item.student_id || '',
            item.student_name || '',
            item.student_email || ''
        ]);
    });

    // Waitlist section
    if (waitlistData?.length > 0) {
        rosterRows.push([]);
        rosterRows.push(['Waitlist']);
        rosterRows.push(['#', 'Student ID', 'Student Name', 'Email']);
        waitlistData.forEach((item, index) => {
            rosterRows.push([
                index + 1,
                item.student_id || '',
                item.student_name || '',
                item.student_email || ''
            ]);
        });
    }

    const ws = XLSX.utils.aoa_to_sheet(rosterRows);

    // Widen columns for readability
    ws['!cols'] = [{ wch: 16 }, { wch: 20 }, { wch: 30 }, { wch: 35 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Roster');

    const fileName = `Roster_${courseName || crn}_${new Date().toLocaleDateString('en-CA')}.xlsx`;
    XLSX.writeFile(wb, fileName);
};
