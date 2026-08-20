import { formatTime } from './dateTime';

export const fetchDedupedSections = async (authenticatedEthosFetch, sectionPipelineAPI, cardId, termCode) => {
    const sectionResponse = await authenticatedEthosFetch(`${sectionPipelineAPI}?cardId=${cardId}&termCode=${termCode}`);
    const sectionResult = await sectionResponse.json();
    const sectionDataResult = (sectionResult?.data?.sectionInstructors10?.edges?.map(edge => edge.node));
    const seen = new Set();

    return sectionDataResult.filter(sec => {
        const key = sec?.section16?.alternateIds?.[0]?.value;
        if (!key || seen.has(key)) { return false }
        seen.add(key);
        return true;
    });
};

export const extractCourseInfo = (selectedSection) => {
    const course = selectedSection.section16?.course16;
    const instructor = selectedSection.instructor12;
    const startTime = selectedSection?.instructionalEvents11?.[0]?.recurrence?.timePeriod?.startOn || '';
    const endTime = selectedSection?.instructionalEvents11?.[0]?.recurrence?.timePeriod?.endOn || '';

    return {
        courseName: `${course?.subject6?.abbreviation} ${course?.number}`,
        courseTitle: selectedSection.section16?.titles?.[0]?.value || '',
        courseSubject: course?.subject6?.abbreviation || '',
        courseCredits: course?.credits[0]?.minimum || '',
        courseInstructor: instructor ? instructor.names[0]?.fullName : '',
        courseType: selectedSection?.instructionalMethod6?.title || '',
        courseMeetingDays: selectedSection?.instructionalEvents11?.[0]?.recurrence?.repeatRule?.daysOfWeek?.join(', ') || '',
        courseMeetingTimes: startTime && endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : '',
        courseBuilding: selectedSection?.instructionalEvents11?.[0]?.locations?.[0]?.location?.room10?.building6?.title || '',
        courseRoom: selectedSection?.instructionalEvents11?.[0]?.locations?.[0]?.location?.room10?.number || ''
    };
};
