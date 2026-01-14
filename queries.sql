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