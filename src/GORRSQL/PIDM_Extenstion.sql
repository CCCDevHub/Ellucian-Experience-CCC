SELECT
    gorguid_guid AS guid,
    spriden_pidm
FROM
    gorguid,
    spriden
WHERE
    gorguid_ldm_name='persons'
    AND gorguid_domain_key=spriden_pidm
    AND spriden_change_ind IS NULL
    AND gorguid_guid IN (:guid_list)