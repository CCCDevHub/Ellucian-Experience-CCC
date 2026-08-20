import { formatDate } from './dateTime';

export const printBlankSheet = ({
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
    waitlistData,
    includeEmailInPrint,
    showRoster,
    showWaitlist
}) => {
    const waitlistPrintHtml = (() => {
        if (!showWaitlist) { return ''; }
        if (!waitlistData?.length) { return '<p style="margin-top: 32px; border-top: 2px solid #dee2e6; padding-top: 16px; color: #6c757d; font-style: italic;">No students on the waitlist.</p>'; }
        return `<h3 style="margin-top: 32px; border-top: 2px solid #dee2e6; padding-top: 16px;">
                    Waitlist <span style="font-size: 0.85em; background: #e9ecef; border-radius: 12px; padding: 2px 10px; margin-left: 8px;">${waitlistData.length}</span>
                </h3>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            ${includeEmailInPrint ? '<th>Email</th>' : ''}
                            <th></th><th></th><th></th><th></th><th></th><th></th><th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${waitlistData?.map((student, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${student.student_id}</td>
                                <td>${student.student_name}</td>
                                ${includeEmailInPrint ? `<td>${student.student_email}</td>` : ''}
                                <td class="empty-cell"></td><td class="empty-cell"></td><td class="empty-cell"></td><td class="empty-cell"></td><td class="empty-cell"></td><td class="empty-cell"></td><td class="empty-cell"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
    })();

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Blank Roster Sheet</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                    h1 { color: #333; margin-bottom: 10px; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
                    .course-info {
                        background: #f8f9fa;
                        border: 2px solid #dee2e6;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 12px 24px;
                        margin-bottom: 12px;
                    }
                    .info-item {
                        display: flex;
                        align-items: baseline;
                        padding: 4px 0;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #495057;
                        min-width: 120px;
                        margin-right: 8px;
                    }
                    .info-value {
                        color: #212529;
                    }
                    .section-header {
                        grid-column: 1 / -1;
                        font-size: 1.1em;
                        font-weight: bold;
                        color: #0066cc;
                        margin-top: 8px;
                        padding-bottom: 4px;
                        border-bottom: 1px solid #dee2e6;
                    }
                    .date-field {
                        margin-top: 15px;
                        padding: 12px;
                        background: white;
                        border: 1px solid #dee2e6;
                        border-radius: 4px;
                    }
                    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; min-height: 40px; }
                    th { background-color: #0066cc; color: white; font-weight: bold; }
                    .empty-cell { height: 40px; }
                    @media print {
                        body { margin: 0; }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                        .course-info { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <h1>Roster Sheet</h1>
                <div class="course-info">
                    <div class="info-grid">
                        <div class="section-header">Course Information</div>
                        <div class="info-item">
                            <span class="info-label">Section:</span>
                            <span class="info-value">${courseName}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">CRN:</span>
                            <span class="info-value">${crn}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Title:</span>
                            <span class="info-value">${courseTitle}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Subject:</span>
                            <span class="info-value">${courseSubject}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Credits:</span>
                            <span class="info-value">${courseCredits}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Instructor:</span>
                            <span class="info-value">${courseInstructor}</span>
                        </div>
                        <div class="section-header">Schedule & Location</div>
                        <div class="info-item">
                            <span class="info-label">Class Type:</span>
                            <span class="info-value">${courseType}</span>
                        </div>
                        ${!courseType.includes('Online') ? `
                        <div class="info-item">
                            <span class="info-label">Meeting Days:</span>
                            <span class="info-value">${courseMeetingDays}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Meeting Times:</span>
                            <span class="info-value">${courseMeetingTimes}</span>
                        </div>` : ''}
                        <div class="info-item">
                            <span class="info-label">Location:</span>
                            <span class="info-value">${courseBuilding} ${courseRoom}</span>
                        </div>
                        <div class="section-header">Critical Dates</div>
                        <div class="info-item">
                            <span class="info-label">Date to Enroll:</span>
                            <span class="info-value">${formatDate(criticalDatesData?.lastDateToEnroll)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Last day to add:</span>
                            <span class="info-value">${formatDate(criticalDatesData?.lastDateToEnroll)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Drop with refund:</span>
                            <span class="info-value">${formatDate(criticalDatesData?.refundDate)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Census Date:</span>
                            <span class="info-value">${formatDate(criticalDatesData?.censusDate)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Drop w/o a "W":</span>
                            <span class="info-value">${formatDate(criticalDatesData?.dropNoWDate)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Declare grade mode:</span>
                            <span class="info-value">${formatDate(criticalDatesData?.grademodeDate)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Drop with a "W":</span>
                            <span class="info-value">${formatDate(criticalDatesData?.dropWDate)}</span>
                        </div>
                    </div>
                    <div class="date-field">
                        <span class="info-label">Date:</span> _______________
                    </div>
                </div>
                ${showRoster ? `<table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            ${includeEmailInPrint ? '<th>Email</th>' : ''}
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${studentList?.map((student, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${student.student_id}</td>
                                <td>${student.student_name}</td>
                                ${includeEmailInPrint ? `<td>${student.student_email}</td>` : ''}
                                <td class="empty-cell"></td>
                                <td class="empty-cell"></td>
                                <td class="empty-cell"></td>
                                <td class="empty-cell"></td>
                                <td class="empty-cell"></td>
                                <td class="empty-cell"></td>
                                <td class="empty-cell"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>` : ''}

                ${waitlistPrintHtml}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
};
