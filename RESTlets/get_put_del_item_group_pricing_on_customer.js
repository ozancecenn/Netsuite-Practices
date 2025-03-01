/**
 * The RESTlet is created to fetch, delete insert/update customer-item and customer group pricing subrecord, on customer.
 **********************************
 **********************************
 * Method: GET
 *  customer: <id> Number|String
 *  type: item|group
 *      itemid: <id>|null   =>      <id>:returns single | null: returns all
 *      groupid: <id>|null  =>      <id>:returns single | null: returns all
 * 
 **********************************
 * Method: PUT
 *  Request Body:
 *  {
        "customer": <id>{String},
        "type":     "group",
        "groupid":  <id>{String},
        "level":    <id>{String}
    }
 *  {
        "customer": <id>{String},
        "type": "item",
        "itemid": <id>{String},
        "level": <id>{String},
        "currency": <id>{String},         // must be filled when level = -1, otherwise blank
        "price": <id>{String}             // must be filled when level = -1, otherwise blank
    }
 **********************************
 * Method: DELETE
 *  customer: <id> Number|String
 *  type: item|group
 *      itemid: <id>
 *      groupid: <id>
 **********************************
 **********************************
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/error', 'N/log', 'N/record', 'N/scriptTypes/restlet'],
    /**
 * @param{error} seerrorrch
 * @param{log} log
 * @param{record} record
 * @param{restlet} restlet
 */
    (error, log, record, restlet) => {


        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {

            const customerId = requestParams.customer;
            const type       = requestParams.type;

            let returnList = [];

            log.debug("GET", `customerId: ${customerId}`);
            log.debug("GET", `type: ${type}`);

            try{

                if(!type || (type != "item" && type != "group")){

                    log.debug("GET", "raise error");
                    // raise error
                    let incorrectTypeError = error.create({
                        name: 'INCORRECT_TYPE',
                        message: '"type" parameter must be either "group" or "item"',
                        notifyOff: true
                    });
                    throw incorrectTypeError;
                }

                // load customer object in view mode
                const customerObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: customerId
                });

                log.debug("GET", "Customer is loaded.")


                if(type == "group"){

                    const groupId    = requestParams.groupid;

                    if(groupId){    //  return single line

                        let lineNoOfItem = customerObj.findSublistLineWithValue({
                            sublistId: "grouppricing",
                            fieldId: "group",
                            value: groupId
                        });

                        if(lineNoOfItem > -1){

                            let group = customerObj.getSublistValue({
                                sublistId: "grouppricing",
                                fieldId: "group",
                                line: lineNoOfItem
                            });
                            let group_text = customerObj.getSublistText({
                                sublistId: "grouppricing",
                                fieldId: "group",
                                line: lineNoOfItem
                            });
                            let level = customerObj.getSublistValue({
                                sublistId: "grouppricing",
                                fieldId: "level",
                                line: lineNoOfItem
                            });
                            let level_text = customerObj.getSublistText({
                                sublistId: "grouppricing",
                                fieldId: "level",
                                line: lineNoOfItem
                            });
    
                            return `{"group": ${group}, "group_display": ${group_text}, "level": ${level}, "level_display": ${level_text}}`;

                        }
                        else{   //  group not found, throw error

                            // raise error
                            let groupNotFoundError = error.create({
                                name: 'GROUP_NOT_FOUND',
                                message: `groupid = ${groupId} is not found in grouppricing in customer ${customerId} - ${customerObj.getValue("altname")}`,
                                notifyOff: true
                            });
                            throw groupNotFoundError;

                        }


                    }
                    else{   //  return all

                        log.debug("GET", "return all group prices");
                        const lineCount = customerObj.getLineCount("grouppricing");

                        for(let i = 0; i < lineCount; i++){

                            let group = customerObj.getSublistValue({
                                sublistId: "grouppricing",
                                fieldId: "group",
                                line: i
                            });
                            let group_text = customerObj.getSublistText({
                                sublistId: "grouppricing",
                                fieldId: "group",
                                line: i
                            });
                            let level = customerObj.getSublistValue({
                                sublistId: "grouppricing",
                                fieldId: "level",
                                line: i
                            });
                            let level_text = customerObj.getSublistText({
                                sublistId: "grouppricing",
                                fieldId: "level",
                                line: i
                            });          
                            
                            returnList.push({
                                "group": group, "group_display": group_text, "level": level, "level_display": level_text
                            });
                        }

                        return JSON.stringify(returnList);

                    }

                }
                else{   //  item

                    const itemId     = requestParams.itemid;

                    if(itemId){ //  return single line

                        let lineNoOfItem = customerObj.findSublistLineWithValue({
                            sublistId: "itempricing",
                            fieldId: "item",
                            value: itemId
                        });

                        if(lineNoOfItem > -1){

                            let currency = customerObj.getSublistValue({
                                sublistId: "itempricing",
                                fieldId: "currency",
                                line: lineNoOfItem
                            });
                            let currency_text = customerObj.getSublistText({
                                sublistId: "itempricing",
                                fieldId: "currency",
                                line: lineNoOfItem
                            });
                            let item = customerObj.getSublistValue({
                                sublistId: "itempricing",
                                fieldId: "item",
                                line: lineNoOfItem
                            });
                            let item_text = customerObj.getSublistText({
                                sublistId: "itempricing",
                                fieldId: "item",
                                line: lineNoOfItem
                            });
                            let level = customerObj.getSublistValue({
                                sublistId: "itempricing",
                                fieldId: "level",
                                line: lineNoOfItem
                            });
                            let level_text = customerObj.getSublistText({
                                sublistId: "itempricing",
                                fieldId: "level",
                                line: lineNoOfItem
                            });
                            let price = customerObj.getSublistValue({
                                sublistId: "itempricing",
                                fieldId: "price",
                                line: lineNoOfItem
                            });
    
                            return `{"currency": ${currency}, "currency_display": ${currency_text}, "item": ${item}, "item_display": ${item_text}, "level": ${level}, "level_display": ${level_text}, "price": ${price}}`;

                        }
                        else{   //  item not found, throw error

                            // raise error
                            let itemNotFoundError = error.create({
                                name: 'ITEM_NOT_FOUND',
                                message: `itemid = ${itemId} is not found in itempricing in customer ${customerId} - ${customerObj.getValue("altname")}`,
                                notifyOff: true
                            });
                            throw itemNotFoundError;

                        }


                    }
                    else{   // return all
                        const lineCount = customerObj.getLineCount("itempricing");
                        log.debug("GET", "return all item prices");

                        for(let i = 0; i < lineCount; i++){

                            let currency = customerObj.getSublistValue({
                                sublistId: "itempricing",
                                fieldId: "currency",
                                line: i
                            });
                            let currency_text = customerObj.getSublistText({
                                sublistId: "itempricing",
                                fieldId: "currency",
                                line: i
                            });
                            let item = customerObj.getSublistValue({
                                sublistId: "itempricing",
                                fieldId: "item",
                                line: i
                            });
                            let item_text = customerObj.getSublistText({
                                sublistId: "itempricing",
                                fieldId: "item",
                                line: i
                            });
                            let level = customerObj.getSublistValue({
                                sublistId: "itempricing",
                                fieldId: "level",
                                line: i
                            });
                            let level_text = customerObj.getSublistText({
                                sublistId: "itempricing",
                                fieldId: "level",
                                line: i
                            });
                            let price = customerObj.getSublistValue({
                                sublistId: "itempricing",
                                fieldId: "price",
                                line: i
                            });
                                
                            returnList.push({
                                "currency": currency, "currency_display": currency_text, "item": item, "item_display": item_text, "level": level, "level_display": level_text, "price": price
                            });
                        }

                        return JSON.stringify(returnList);

                    }
                }

            }
            catch(ex){
                log.error("Error at GET", ex.message);

                return JSON.stringify({
                    "error": "Error at GET",
                    "name": ex.name,
                    "message": ex.message
                });
            }

        }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {

            const customerId = requestBody.customer;
            const type       = requestBody.type;

            log.debug("PUT", `customerId: ${customerId} - type: ${type}`);

            try{

                if(!type || (type != "item" && type != "group")){
                    // raise error
                    let incorrectTypeError = error.create({
                        name: 'INCORRECT_TYPE',
                        message: '"type" parameter must be either "group" or "item"',
                        notifyOff: true
                    });
                    throw incorrectTypeError;
                }

                //  load the customer record to delete requested subrecord
                const customerObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: customerId,
                    isDynamic: true
                });

                if(type == "group"){

                    const groupId = requestBody.groupid;
                    const level = requestBody.level;

                    //  check if exists
                    let lineNo = customerObj.findSublistLineWithValue({
                        sublistId: "grouppricing",
                        fieldId: "group",
                        value: groupId
                    });

                    if(lineNo > -1){
                        //  update line value
                        let selectedLine = customerObj.selectLine({
                            sublistId: "grouppricing",
                            line: lineNo
                        });

                        customerObj.setCurrentSublistValue({
                            sublistId: "grouppricing",
                            fieldId: "level",
                            value: level
                        });

                        customerObj.commitLine({
                            sublistId: "grouppricing"
                        });

                        customerObj.save();

                        return JSON.stringify({
                            "action": "Successfull",
                            "message": `Group Pricing for group = ${groupId} - level = ${level} has been updated.`
                        })

                    }
                    else{
                        //  insert line
                        let newLine = customerObj.insertLine({
                            sublistId: "grouppricing",
                            line: 0
                        });

                        customerObj.setCurrentSublistValue({
                            sublistId: "grouppricing",
                            fieldId: "group",
                            value: groupId
                        });
                        customerObj.setCurrentSublistValue({
                            sublistId: "grouppricing",
                            fieldId: "level",
                            value: level
                        });
                        customerObj.commitLine({
                            sublistId: "grouppricing"
                        });

                        customerObj.save();

                        return JSON.stringify({
                            "action": "Successfull",
                            "message": `Group Pricing for group = ${groupId} - level = ${level} has been created.`
                        })
                    }
                    
                }
                else{   //  item

                    const itemId = requestBody.itemid;
                    const level  = requestBody.level;

                    if(level == "-1" && (!requestBody.currency || !requestBody.price)){
                        //  raise exception
                        let missingValuesError = error.create({
                            name: 'MISSING_VALUES',
                            message: 'When the level is "-1" for item pricing, you must supply both currency and price.',
                            notifyOff: true
                        });
                        throw missingValuesError;
    
                    }

                    //  check if exists
                    let lineNo = customerObj.findSublistLineWithValue({
                        sublistId: "itempricing",
                        fieldId: "item",
                        value: itemId
                    });

                    if(lineNo > -1){
                        //  update line value
                        let selectedLine = customerObj.selectLine({
                            sublistId: "itempricing",
                            line: lineNo
                        });

                        customerObj.setCurrentSublistValue({
                            sublistId: "itempricing",
                            fieldId: "level",
                            value: level
                        });

                        if(requestBody.currency){
                            customerObj.setCurrentSublistValue({
                                sublistId: "itempricing",
                                fieldId: "currency",
                                value: requestBody.currency
                            });
                        }
                        if(requestBody.price){
                            customerObj.setCurrentSublistValue({
                                sublistId: "itempricing",
                                fieldId: "price",
                                value: requestBody.price
                            });                                
                        }

                        customerObj.commitLine({
                            sublistId: "itempricing"
                        });

                        customerObj.save();

                        return JSON.stringify({
                            "action": "Successfull",
                            "message": `Item Pricing for item = ${itemId} - level = ${level} has been updated.`
                        })


                    }
                    else{
                        //  insert line
                        let newLine = customerObj.insertLine({
                            sublistId: "itempricing",
                            line: 0
                        });

                        customerObj.setCurrentSublistValue({
                            sublistId: "itempricing",
                            fieldId: "item",
                            value: itemId
                        });
                        customerObj.setCurrentSublistValue({
                            sublistId: "itempricing",
                            fieldId: "level",
                            value: level
                        });
                        
                        if(requestBody.currency){
                            customerObj.setCurrentSublistValue({
                                sublistId: "itempricing",
                                fieldId: "currency",
                                value: requestBody.currency
                            });
                        }
                        if(requestBody.price){
                            customerObj.setCurrentSublistValue({
                                sublistId: "itempricing",
                                fieldId: "price",
                                value: requestBody.price
                            });                                
                        }

                        customerObj.commitLine({
                            sublistId: "itempricing"
                        });

                        customerObj.save();

                        return JSON.stringify({
                            "action": "Successfull",
                            "message": `Item Pricing for item = ${itemId} - level = ${level} has been created.`
                        })
                    }

                }

            }
            catch(ex){

                log.error("Error at PUT", ex.message);
                return JSON.stringify({
                    "error": "Error at PUT",
                    "name": ex.name,
                    "message": ex.message
                })

            }

        }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {

        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {

            const customerId = requestParams.customer;
            const type       = requestParams.type;
            let sublistName  = "";
            let fieldName    = "";
            let value        = "";
            
            log.debug("DELETE", `customerId: ${customerId} - type: ${type}`);

            try{

                if(!type || (type != "item" && type != "group")){
                    // raise error
                    let incorrectTypeError = error.create({
                        name: 'INCORRECT_TYPE',
                        message: '"type" parameter must be either "group" or "item"',
                        notifyOff: true
                    });
                    throw incorrectTypeError;
                }

                //  load the customer record to delete requested subrecord
                const customerObj = record.load({
                    type: record.Type.CUSTOMER,
                    id: customerId,
                    isDynamic: true
                });

                if(type == "group"){

                    const groupId     = requestParams.groupid;

                    if(!groupId){

                        // raise error
                        let missingGroupIdError = error.create({
                            name: 'MISSING_GROUP_ID',
                            message: '"groupid" is missing for type = "group"',
                            notifyOff: true
                        });
                        throw missingGroupIdError;

                    }

                    sublistName = "grouppricing";
                    fieldName = "group";
                    value = groupId;


                }
                else{   //  item

                    const itemId     = requestParams.itemid;

                    if(!itemId){

                        // raise error
                        let missingItemIdError = error.create({
                            name: 'MISSING_ITEM_ID',
                            message: '"itemid" is missing for type = "item"',
                            notifyOff: true
                        });
                        throw missingItemIdError;
                        
                    }

                    sublistName = "itempricing";
                    fieldName = "item";
                    value = itemId;


                }

                //  find the relevant line
                const lineNo = customerObj.findSublistLineWithValue({
                    sublistId: sublistName,
                    fieldId: fieldName,
                    value: value
                });

                if(lineNo == -1){
                    //  raise error
                    let lineNotFoundError = error.create({
                        name: 'LINE_NOT_FOUND',
                        message: `Line not found for ${fieldName} = ${value}`,
                        notifyOff: true
                    });
                    throw lineNotFoundError;

                }
                else{

                    customerObj.removeLine({
                        sublistId: sublistName,
                        line: lineNo
                    });

                    customerObj.save();

                    return JSON.stringify({
                        "action": "Successfull",
                        "message": `${fieldName} ${value} has been deleted in customer ${customerId}.`
                    });
                }


            }
            catch(ex){
                log.error("Error at DELETE", ex.message);

                return JSON.stringify({
                    "error": "Error at DELETE",
                    "name": ex.name,
                    "message": ex.message
                });
            }

        }

        return {get, put, post, delete: doDelete}

    });
