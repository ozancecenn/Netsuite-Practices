/**
 * 
 * The script gets two saved searches as input and delete the records in there.
 * First search type: TIME_SHEET
 * Second search type: RESOURCE_ALLOCATION
 * 
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/search'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (log, record, runtime, search) => {

        /**
         * Defines the Scheduled script trigger point.
         * @param {Object} scriptContext
         * @param {string} scriptContext.type - Script execution context. Use values from the scriptContext.InvocationType enum.
         * @since 2015.2
         */
        const execute = (scriptContext) => {

            //  get the saved searches from script parameters
            const scriptObj = runtime.getCurrentScript();

            const ss_time = scriptObj.getParameter("custscript_acs_ss_time");
            const ss_resourcealloc = scriptObj.getParameter("custscript_acs_ss_resourcealloc");

            log.debug("ss_time", ss_time);
            log.debug("ss_resourcealloc", ss_resourcealloc);

            //  load timesheet saved search
            const timeSheetSavedSearch = search.load({
                type: search.Type.TIME_SHEET,
                id: ss_time
            });
            const timeSheetSavedSearchResults = timeSheetSavedSearch.run().getRange({
                start: 0,
                end: 1000
            });

            //  delete row by row
            timeSheetSavedSearchResults.forEach(row => {
                
                let deletedTSId = record.delete({
                    type: record.Type.TIME_BILL,
                    id: row.getValue({ name: 'internalid', join: 'timebill' })
                });
                log.debug("Timebill Deleted.", `ID: ${deletedTSId}`);

            });


            //  load resource allocation saved search
            const resourceAllocSavedSearch = search.load({
                type: search.Type.RESOURCE_ALLOCATION,
                id: ss_resourcealloc
            });
            const resourceAllocSavedSearchResults = resourceAllocSavedSearch.run().getRange({
                start: 0,
                end: 1000
            });

            //  delete row by row
            resourceAllocSavedSearchResults.forEach(row => {
                
                let deletedRAId = record.delete({
                    type: record.Type.RESOURCE_ALLOCATION,
                    id: row.getValue("internalid")
                });
                log.debug("ResAlloc Deleted.", `ID: ${deletedRAId}`);

            });

        }

        return {execute}

    });
