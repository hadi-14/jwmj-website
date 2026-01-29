-- Create temp table to store column definitions
IF OBJECT_ID('tempdb..#FieldColumns') IS NOT NULL DROP TABLE #FieldColumns;
CREATE TABLE #FieldColumns (
    ColumnDef NVARCHAR(MAX)
);

-- Insert column definitions into temp table
INSERT INTO #FieldColumns (ColumnDef)
SELECT 'MAX(CASE WHEN ff.fieldName = N''' + ff.fieldName + ''' THEN fv.value END) AS [' + ff.fieldLabel + ']'
FROM FormField ff
INNER JOIN Form f ON ff.formId = f.id
WHERE f.formType = 'zakat_application'
ORDER BY ff.fieldOrder;

-- Check if we have any fields
IF NOT EXISTS (SELECT 1 FROM #FieldColumns)
BEGIN
    PRINT 'No fields found for form type: zakat_application';
END
ELSE
BEGIN
    -- Build the SQL using temp table
    DECLARE @SQL NVARCHAR(MAX);
    
    SET @SQL = 
        N'SELECT
            fs.id AS SubmissionId,
            f.name AS FormName,
            f.formType AS FormType,
            fs.submissionDate,
            fs.status,
            fs.submittedBy,
            fs.memberComputerId, ' + 
        (SELECT STUFF((SELECT ',' + ColumnDef FROM #FieldColumns FOR XML PATH('')), 1, 1, '')) +
        N' FROM FormSubmission fs
            INNER JOIN Form f ON fs.formId = f.id
            LEFT JOIN FormFieldValue fv ON fv.submissionId = fs.id
            LEFT JOIN FormField ff ON fv.fieldId = ff.id
        WHERE
            f.formType = N''zakat_application''
            AND fs.isDeleted = 0
        GROUP BY
            fs.id, f.name, f.formType, fs.submissionDate,
            fs.status, fs.submittedBy, fs.memberComputerId
        ORDER BY
            fs.submissionDate DESC';
    
    -- Print for debugging (optional)
    PRINT @SQL;
    
    -- Execute
    EXEC(@SQL);
END

-- Cleanup
DROP TABLE #FieldColumns;



-- Query to retrieve children along with their grandparents' IDs
SELECT DISTINCT
    child.Chd_memberId AS child_id,
    child.Chd_MotherMemberID AS mother_id,
    child.Chd_FatherMemberID AS father_id,
    mother.Chd_MotherMemberID AS maternal_grandmother_id,
    mother.Chd_FatherMemberID AS maternal_grandfather_id,
    father.Chd_MotherMemberID AS paternal_grandmother_id,
    father.Chd_FatherMemberID AS paternal_grandfather_id
FROM Children_List child
INNER JOIN Children_List mother 
    ON child.Chd_MotherMemberID = mother.Chd_memberId
INNER JOIN Children_List father 
    ON child.Chd_FatherMemberID = father.Chd_memberId
WHERE EXISTS (
    SELECT 1 
    WHERE mother.Chd_MotherMemberID IS NOT NULL 
       OR mother.Chd_FatherMemberID IS NOT NULL
       OR father.Chd_MotherMemberID IS NOT NULL 
       OR father.Chd_FatherMemberID IS NOT NULL
)
ORDER BY child.Chd_memberId;