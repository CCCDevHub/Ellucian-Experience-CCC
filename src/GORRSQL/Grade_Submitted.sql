SELECT
    DISTINCT ssbsgid_guid AS guid,
    CASE
        WHEN sfrstcr_pidm IS NOT NULL THEN
            0
        WHEN sfrstcr_pidm IS NULL THEN
            1
    END          grade_entered
FROM
    ssbsect
    INNER JOIN sirasgn
    ON ssbsect_crn = sirasgn_crn
    AND ssbsect_term_code = sirasgn_term_code
    AND sirasgn_primary_ind = 'Y'
    LEFT OUTER JOIN sfrstcr
    ON ssbsect_crn = sfrstcr_crn
    AND sfrstcr_term_code = ssbsect_term_code
    AND sfrstcr_rsts_code IN ( 'RC',
    'RE',
    'RS',
    'RW' )
    AND sfrstcr_grde_code IS NULL
    INNER JOIN ssbsgid
    ON ssbsgid_term_code = ssbsect_term_code
    AND ssbsgid_crn = ssbsect_crn
WHERE
    ssbsect_ssts_code = 'A'
    AND ssbsgid_guid IN (:guid_list)