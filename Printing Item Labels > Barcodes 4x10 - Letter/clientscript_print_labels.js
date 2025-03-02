/**
 * 
 * This client script is applied on both "suitelet_print_labels.js" and "usereventscript_print_labels.js".
 * The script contains two functions:
 *  fieldChanged:
 *      To handle user interactions on Suitelet.
 *  
 *  printLabelsSO:
 *      To redirect the UI to the suitelet, by taking record type and id. 
 * 
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/dialog', 'N/log', 'N/search'],
    /**
     * @param{currentRecord} currentRecord
     * @param{log} log
     * @param{search} search
     */
    function(currentRecord, dialog, log, search) {
        
    
        function fieldChanged(scriptContext) {

            var changedFieldId = scriptContext.fieldId;
            var currentRec = currentRecord.get();

            try{
                if (changedFieldId === 'custpage_print_orig_qty' || changedFieldId === 'custpage_print_var_qty' || changedFieldId === 'custpage_print_fix_qty') {

                    var cb1Value = currentRec.getValue({ fieldId: 'custpage_print_orig_qty' });
                    var cb2Value = currentRec.getValue({ fieldId: 'custpage_print_var_qty' });
                    var cb3Value = currentRec.getValue({ fieldId: 'custpage_print_fix_qty' });
 
                    if (changedFieldId === 'custpage_print_orig_qty' || changedFieldId === 'custpage_print_var_qty' || changedFieldId === 'custpage_print_fix_qty') {
            
                        if (cb1Value && cb2Value) { // Both are checked, uncheck the other one
                            currentRec.setValue({
                                fieldId: changedFieldId === 'custpage_print_orig_qty' ? 'custpage_print_var_qty' : 'custpage_print_orig_qty',
                                value: false
                            });
                        }

                        if (cb2Value && cb3Value) { // Both are checked, uncheck the other one
                            currentRec.setValue({
                                fieldId: changedFieldId === 'custpage_print_var_qty' ? 'custpage_print_fix_qty' : 'custpage_print_var_qty',
                                value: false
                            });
                        }

                        if (cb3Value && cb1Value) { // Both are checked, uncheck the other one
                            currentRec.setValue({
                                fieldId: changedFieldId === 'custpage_print_fix_qty' ? 'custpage_print_orig_qty' : 'custpage_print_fix_qty',
                                value: false
                            });
                        }

                    }
                    
                }


            }
            catch(ex){
                dialog.alert({title: ex.name, message: ex.message});
            }
        }


        function printLabelsSO(){

            log.debug({title: 'printLabelsSO button click', details: 'Function printLabelsSO: executed.'});
            window.location.href = "https://<accountId>.app.netsuite.com/app/site/hosting/scriptlet.nl?script=<id>&deploy=<id>&custscript_recordtype=" + currentRecord.get().getValue('baserecordtype') + "&custscript_recordid=" + currentRecord.get().getValue('id');

        }

        return {

            fieldChanged: fieldChanged,
            printLabelsSO: printLabelsSO
        };
        
    });
    