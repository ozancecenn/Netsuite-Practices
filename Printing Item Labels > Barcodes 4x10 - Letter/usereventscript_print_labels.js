/**
 * 
 * This user event script is created to add a button called "Print Labels".
 * The script has been deployed on "salesorder" and "inventoryitem" record types.
 * 
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log'],
/**
 * @param{log} log
 */
    (log) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

            const currentForm = scriptContext.form;
            const newRecord = scriptContext.newRecord;
            const recType = newRecord.type;
            log.debug({title: 'recType', details: recType});

            scriptContext.form.clientScriptModulePath = './clientscript_print_labels.js';


            if (recType == "salesorder" || recType ==  "inventoryitem") {
                currentForm.addButton({
                    id: "custpage_print_labels_so",
                    label: "Print Labels",
                    functionName: "printLabelsSO()"
                });
            }
        }

        return {beforeLoad}

    });
