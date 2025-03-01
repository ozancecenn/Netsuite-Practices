/**
 * The script is created to write off the journal entries manually, if the custom checkbox is checked.
 * After the journal is created, it is applied on the credit memo.
 * 
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/ui/serverWidget'],
/**
 * @param{log} log
 * @param{record} record
 * @param{serverWidget} serverWidget
 */
    (log, record, serverWidget) => {
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
            
            const newRecord = scriptContext.newRecord;
            const form = scriptContext.form;
            const tranStatus = newRecord.getValue("status");

            try{

                let writeOffField = form.getField("custbody_acs_cb_writeoff_credmemo");

                // get apply count
                const applyCount = newRecord.getLineCount("apply");
                log.debug("applyCount/BL", applyCount);
                log.debug("scriptContext.type", scriptContext.type);

                                    
                if(tranStatus == "Fully Applied"){
                    
                    let journalApplied = false;
                    let amountremaining = newRecord.getValue("amountremaining");

                    for(let i = 0; i < applyCount; i++){    // check if anything applied

                        let applyType = newRecord.getSublistValue({
                            sublistId: "apply",
                            fieldId: "type",
                            line: i
                        });
                        let apply = newRecord.getSublistValue({
                            sublistId: "apply",
                            fieldId: "apply",
                            line: i
                        });
    
                        if(applyType == "Journal" && apply == true){

                            journalApplied = true;
                            break;  
                        }
    
                    }

                    if(journalApplied == true && amountremaining == 0.00){

                        writeOffField.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.DISABLED
                        });        
    
                    }   //  writing off no more possible

    
                    return;
                
                }
                else{

                    writeOffField.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.NORMAL
                    });
                    
                    if(applyCount == 0 && scriptContext.type == "edit"){
                        newRecord.setValue("custbody_acs_cb_writeoff_credmemo", false);
                    }
    
                    return;

                }
    
            }
            catch(ex){
                log.error("Error at beforeLoad", ex.message);
            }


        }




        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
        
            const newRecord = scriptContext.newRecord;
            const oldRecord = scriptContext.oldRecord;

            const writeoffCBNew = newRecord.getValue("custbody_acs_cb_writeoff_credmemo");
            const writeoffCBOld = oldRecord.getValue("custbody_acs_cb_writeoff_credmemo");

            try{

                if(writeoffCBNew != writeoffCBOld){
                    return; //  if the value is changed, then do not apply checkbox initialization logic
                }
    
                // get apply count
                const applyCount = newRecord.getLineCount("apply");
                log.debug("applyCount/BS", applyCount);

                let isApply = false;

                for(let i = 0; i < applyCount; i++){    // check if anything applied

                    let applyCB = newRecord.getSublistValue({
                        sublistId: "apply",
                        fieldId: "apply",
                        line: i
                    });

                    if(applyCB == true){
                        isApply = true;
                        break;  //  return when a single doc is applied
                    }

                }
                    
                if(isApply == false){   //  if nothing is applied, then initialize the checkbox
                    newRecord.setValue("custbody_acs_cb_writeoff_credmemo", false);
                }

            }
            catch(ex){

                log.error("Error at beforeSubmit", ex.message);

            }


        }




        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

            log.debug("scriptContext.newRecord", JSON.stringify(scriptContext.newRecord));

            let newRecord = record.load({
                type: scriptContext.newRecord.type,
                id: scriptContext.newRecord.id,
                isDynamic: false
            });

            try{
                //  create journal
                const journalId = createJournal(newRecord);
                log.debug("journalId", journalId);

                // reload the credit memo to see the newly created journal in apply sublist
                newRecord = record.load({
                    type: scriptContext.newRecord.type,
                    id: scriptContext.newRecord.id,
                    isDynamic: true
                });

                // get line count
                const applyListCount = newRecord.getLineCount("apply");

                for(let i = 0; i < applyListCount; i++){

                    let docId = newRecord.getSublistValue({
                        sublistId: "apply",
                        fieldId: "doc",
                        line: i
                    });

                    // unapply everything first
                    // select existing line
                    newRecord.selectLine({
                        sublistId: "apply",
                        line: i
                    });

                    // untick the apply checkbox
                    newRecord.setCurrentSublistValue({
                        sublistId: "apply",
                        fieldId: "apply",
                        value: false
                    }); 

                    // commit the line
                    newRecord.commitLine("apply");


                    if(docId == journalId){ //  apply the journal only

                        // find which line to be applied by journalId
                        let lineNumber = newRecord.findSublistLineWithValue({
                            sublistId: "apply",
                            fieldId: "doc",
                            value: journalId
                        });
                        log.debug(journalId, `lineNumber = ${lineNumber}`);

                        // select existing line
                        newRecord.selectLine({
                            sublistId: "apply",
                            line: lineNumber
                        });

                        // tick the apply checkbox
                        newRecord.setCurrentSublistValue({
                            sublistId: "apply",
                            fieldId: "apply",
                            value: true
                        }); 

                        // commit the line
                        newRecord.commitLine("apply");
                        
                        // break;
                    }

                }

                newRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

            }
            catch(ex){

                log.error("Error at afterSubmit", ex.message);

            }


        }




        /**
         * 
         * @param {Object} recordObj 
         * @returns {String}
         */
        const createJournal = (recordObj) => {

            // create journal object
            let journalRec = record.create({
                type: record.Type.JOURNAL_ENTRY,
                isDynamic: true
            });

            // subsidiary
            journalRec.setValue("subsidiary", recordObj.getValue("subsidiary"));
            // currency
            journalRec.setValue("currency", recordObj.getValue("currency"));
            // memo
            journalRec.setValue("memo", `Write off Credit Memo - ${recordObj.getValue("tranid")}`);

            // add new line - DEBIT amount
            journalRec.selectNewLine({
                sublistId: "line"
            });

            // account
            journalRec.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "account",
                value: recordObj.getValue("account"),
                // ignoreFieldChange: true
            });

            // debit amount
            journalRec.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "debit",
                value: recordObj.getValue("total"),    //  amountremaining
                // ignoreFieldChange: true
            });
            // class
            journalRec.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "class",
                value: recordObj.getSublistValue("item", "class", 0),
                // ignoreFieldChange: true
            });
            // entity
            journalRec.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "entity",
                value: recordObj.getValue("entity"),
                // ignoreFieldChange: true
            });

            // commit line
            journalRec.commitLine({
                sublistId: "line",
            });

            // add new line - CREDIT amount
            journalRec.selectNewLine({
                sublistId: "line"
            });

            // account
            journalRec.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "account",
                value: "359",   //  53060 Bad Debt
                // ignoreFieldChange: true
            });

            // debit amount
            journalRec.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "credit",
                value: recordObj.getValue("total"),  //  amountremaining
                // ignoreFieldChange: true
            });
            // class
            journalRec.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "class",
                value: recordObj.getSublistValue("item", "class", 0),
                // ignoreFieldChange: true
            });
            // entity
            journalRec.setCurrentSublistValue({
                sublistId: "line",
                fieldId: "entity",
                value: recordObj.getValue("entity"),
                // ignoreFieldChange: true
            });

            // commit line
            journalRec.commitLine({
                sublistId: "line",
            });


            const journalId = journalRec.save({
                ignoreMandatoryFields: true
            });

            return journalId;

        }


        return {beforeLoad, beforeSubmit, afterSubmit}

    });
