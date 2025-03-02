/**
 * 
 * This suitelet is created to print barcodes/labels 4 in a single row, 10 columns per page. 4x10
 * The template "pdf_template_4x10_labels" is used.
 * The suitelet can be called from "salesorder" and "inventoryitem" record type via the button "Print Labels", which is added via the "usereventscript_print_labels.js".
 * The suitelet is also deployed externally (stand alone) which accepts a csv files (with two columns, item name/number and quantity).
 * 
 * input file:
 *      item1   2
 *      item2   2
 *      item1   4
 *      item3   4
 * 
 * output:
 *      item1   item1   item2   item2
 *      item1   item1   item1   item1
 *      item3   item3   item3   item3
 * 
 * 
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/record', 'N/render', 'N/search', 'N/https', 'N/ui/serverWidget'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{render} render
 * @param{search} search
 * @param{https} https
 * @param{serverWidget} serverWidget
 */
    (log, record, render, search, https, serverWidget) => {


        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {


            try{
                if(scriptContext.request.method === 'GET'){         //  GET method

                    let [_recordtype, _recordid, _itemlabellayout, _print_orig_qty, _print_var_qty, _print_fix_qty, _fix_no_qty] = getParams(scriptContext);
        
                    var form = serverWidget.createForm({ 
                        title: 'Print Item Labels' 
                    });
        
                    //  add submit button
                    form.addSubmitButton({
                        label: 'Print Labels'
                    });
    
    
                    //  create header fields
                    let [itemLabelLayout, aiCustPricing, prtOrigQty, prtVarQty, prtFixQty, fixNoOfQty] = createHeaderFields(form);
        
                    let printingTemplateData = buildCustomListOfPrintingTemplates();
                    let defaultTemplateId;
    
                    // Source the options to the select field
                    printingTemplateData.forEach(function(template) {
                        if(template.name == "ACS 4x10 Item Label PDF/HTML Template"){
                            defaultTemplateId = template.id;
                        }
                        itemLabelLayout.addSelectOption({
                            value: template.id,
                            text: template.name
                        });
                    });
                    
                    // Add default @none value for selection
                    aiCustPricing.addSelectOption({
                        value: "@None",
                        text: "-"
                    });
        
                    //  set default values on header fields
                    itemLabelLayout.defaultValue    = defaultTemplateId;//'CUSTTMPL_324_4480498_SB1_926';
                    prtOrigQty.defaultValue         = 'T';
                    aiCustPricing.defaultValue      = '@None'
       
        
                    form.clientScriptModulePath = './clientscript_print_labels.js';
    
    
                    if(!_recordtype && !_recordid){ //  for file upload mode - STAND ALONE
    
                        // hide unnecessary fields
                        prtOrigQty.updateDisplayType({
                            displayType : serverWidget.FieldDisplayType.HIDDEN
                        });
                        prtVarQty.updateDisplayType({
                            displayType : serverWidget.FieldDisplayType.HIDDEN
                        });
                        prtFixQty.updateDisplayType({
                            displayType : serverWidget.FieldDisplayType.HIDDEN
                        });
                        fixNoOfQty.updateDisplayType({
                            displayType : serverWidget.FieldDisplayType.HIDDEN
                        });
    
                        // Add a hidden field to store the file ID
                        var fileIdField = form.addField({
                            id: 'custpage_file',
                            type: serverWidget.FieldType.FILE,
                            label: 'File to upload'
                        });
    
    
                        //  source all available customers for AI customer pricing - UPLOAD
                        let aiCustPricingAll = sourceCustPricingAll();
    
                        //log.debug({title: 'sourceCustPricingAll', details: JSON.stringify(aiCustPricingAll)});
    
                        aiCustPricingAll.forEach(function(row) {
                            aiCustPricing.addSelectOption({
                                value: row.getValue({                               
                                    name: 'custrecord_customer',
                                    summary: search.Summary.GROUP                             
                                }),                           
                                text: row.getText({
                                    name: 'custrecord_customer',
                                    summary: search.Summary.GROUP                             
                                })
                            });
                        });
                        
                        
                    }
                    else{                           //  navigated from either sales order or inventory item screen
    
                        //  load the record here
                        let precRecord = record.load({
                            id: _recordid,
                            type: _recordtype,
                            isDynamic: true
                        });
    
                        if(_recordtype == record.Type.SALES_ORDER){ //  hide AI customer pricing when navigated from Sales Order
                            aiCustPricing.updateDisplayType({
                                displayType: serverWidget.FieldDisplayType.HIDDEN
                            });
                        }
                        else{
                            //  source available AI customer pricing for inventory item
                            let aiCustPricingPerItem = sourceCustPricingPerItem(_recordid);
    
                            aiCustPricingPerItem.forEach(function(row) {
                                aiCustPricing.addSelectOption({
                                    value: row.getValue("custrecord155"),
                                    text: `${row.getText("custrecord_customer")} - ${row.getValue("custrecord155")}`
                                });
                            });
                        }
    
                        //  create sublist on SL page here on GET !!
                        var sublist = createSublist(form, precRecord);
    
                        log.debug({title: 'GET / RECORD', details: `sublist length: ${sublist.length}`})
                        log.debug({title: 'GET / RECORD', details: "Sublist created."});
    
                        //  transfer the values to POST request
                        setPOSTParams(form, _recordtype, _recordid);              
                        
                    }   
                    
                    scriptContext.response.writePage(form);
    
                }
    
                else{                                               //  POST method
    
                    const [file, filename] = returnPDF(scriptContext);
    
                    // Set the response headers for PDF download
                    scriptContext.response.setHeader({
                        name: 'Content-Type',
                        value: 'application/pdf'
                    });
                    scriptContext.response.setHeader({
                        name: 'Content-Disposition',
                        value: `attachment; filename=${filename}`
                    });
    
                    scriptContext.response.writeFile(file, false);
    
                }
    
            }
            catch(ex){
                log.error({title: 'Exception', details: ex.message});
            }



        }




        /**
         *  Returns all available customers from custom record "AI - Customer Pricing" 
         *  record type = 691 / customrecord_ai_customer_pricing
         * 
         */
        const sourceCustPricingAll = () => {

            const customrecordAiCustomerPricingSearch = search.create({
                type: 'customrecord_ai_customer_pricing',
                filters: [],
                columns: [
                    search.createColumn({ name: 'custrecord_customer', summary: search.Summary.GROUP }),
                ],
            });

            const AiCustomerPricingResult = customrecordAiCustomerPricingSearch.run().getRange({
                start: 0,
                end: 1000
            });

            return AiCustomerPricingResult;

        }
        



        /**
         *  Returns all available special item pricing per customer from custom record "AI - Customer Pricing" 
         *  record type = 691 / customrecord_ai_customer_pricing
         *  OBSOLETE / DISCONTINUED
         */
        const getCustomerPricingListForUpload = (customerId, itemId) => {
           
            const customrecordAiCustomerPricingSearch = search.create({
                type: 'customrecord_ai_customer_pricing',
                filters: [
                            ['custrecord_customer', 'anyof', customerId],
                            'AND',
                            ['custrecord_item', 'anyof', itemId]
                         ], 
                columns: [
                    search.createColumn({ name: 'custrecord_item' }),
                    search.createColumn({ name: 'custrecord155' })
                ]
            });

            const AiCustomerPricingResult = customrecordAiCustomerPricingSearch.run().getRange({
                start: 0,
                end: 1
            });

            log.debug({title: 'getCustomerPricingListForUpload', details: JSON.stringify(AiCustomerPricingResult)});

            if(AiCustomerPricingResult[0]){
                return {
                    item: AiCustomerPricingResult[0].getValue('custrecord_item'), 
                    price: AiCustomerPricingResult[0].getValue('custrecord155')
                }
            
            }
            else{
                return {
                    item: null, 
                    price: null
                }
            }

        }



        /**
         *  Returns all available special item pricing per customer from custom record "AI - Customer Pricing" 
         *  record type = 691 / customrecord_ai_customer_pricing
         * 
         */
        const getBulkCustomerPricingListForUpload = (lines, customerId) => {

            let returnList = [];

            let itemFilter = ['custrecord_item', 'anyof', lines];
            let customerFilter = ['custrecord_customer', 'anyof', customerId];
            let combinedFilter = [customerFilter, 'AND', itemFilter];


            const customrecordAiCustomerPricingSearch = search.create({
                type: 'customrecord_ai_customer_pricing',
                filters: combinedFilter, 
                columns: [
                    search.createColumn({ name: 'custrecord_item' }),
                    search.createColumn({ name: 'custrecord155' })
                ]
            });

            const pagedData = customrecordAiCustomerPricingSearch.runPaged({
                pageSize: 1000 
            });

            pagedData.pageRanges.forEach(function(pageRange) {

                var page = pagedData.fetch({
                    index: pageRange.index
                });
            
                page.data.forEach(function(result) {

                    returnList.push({ // item, custitemprice
                        item: result.getValue({ name: 'custrecord_item' }),
                        custitemprice: result.getValue({ name: 'custrecord155' }),
                    });

                });

            });

            return returnList;
            
        }



        /**
         *  Returns a single or list of custom record "AI - Customer Pricing" 
         *  record type = 691 / customrecord_ai_customer_pricing
         * 
         */
        const sourceCustPricingPerItem = (item) => {

            const customrecordAiCustomerPricingSearch = search.create({
                type: 'customrecord_ai_customer_pricing',
                filters: ['custrecord_item', 'anyof', item],
                columns: [
                    search.createColumn({ name: 'name', sort: search.Sort.ASC }),
                    search.createColumn({ name: 'scriptid' }),
                    search.createColumn({ name: 'custrecord_item' }),
                    search.createColumn({ name: 'custrecord_customer' }),
                    search.createColumn({ name: 'custrecord155' }),
                    search.createColumn({ name: 'internalid', join: 'custrecord_customer' })
                ]
            });

            const AiCustomerPricingResult = customrecordAiCustomerPricingSearch.run().getRange({
                start: 0,
                end: 1000
            });

            return AiCustomerPricingResult;

        }




        /**
        *   Returns a sublist with columns and data
        *   can be used in both GET and POST requests
        */
        const createSublist = (form, pRecord) => {
            
            var sublist = form.addSublist({
                id: 'custpage_item_sublist',
                type: serverWidget.SublistType.LIST,//serverWidget.SublistType.INLINEEDITOR,
                label: 'Print Item Labels'
            });

            sublist.addMarkAllButtons();

            //  create sublist columns here
            createSublistColumns(sublist);
            sublist = populateSublistWithData(sublist, pRecord);

            return sublist;

        }




        /**
        *   The function takes a sublist to populate with the data from the preceeding record
        *   can be used in both GET and POST requests
        */
        const populateSublistWithData = (sublist, precRecord) => {

            //  define common variable for record type SALES_ORDER and INVENTORY_ITEM
            let itemCount, itemText, itemNo, itemDisplayName, originalQty, units, description;

            if(precRecord.getValue("baserecordtype") === record.Type.SALES_ORDER){

                itemCount = precRecord.getLineCount({
                    sublistId: 'item'
                });

            }
            else if(precRecord.getValue("baserecordtype") === record.Type.INVENTORY_ITEM){

                itemCount = 1;

            }
            
            var currency = record.load({type: record.Type.CURRENCY, id: precRecord.getValue("currency"), isDynamic: true});

            let loopGap = 0;    // this counts how many times the loop is skipped/continued
            // this happens when there are item groups ("Group" or "EndGroup" item type)

            for(let i = 0; i < itemCount; i++){

                //  fetch values
                if(precRecord.getValue("baserecordtype") === record.Type.SALES_ORDER){

                    //  CHECK item type != Group || EndGroup
                    var itemType = precRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype',
                        line: i
                    });

                    if(itemType == 'Group' || itemType == 'EndGroup'){

                        loopGap++;  //  this variable is important in case there are unselected lines on suitelet sublist.
                                    //  no assignment can be made on sublist[Nth] index without an assignment on sublist[(N-1)th]
                        continue; // skip for item group header and end line
                    
                    }

                    itemText = precRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_action_item_number',
                        line: i
                    }) || " ";
                    itemNo = precRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });             
                    itemDisplayName = search.lookupFields({type: search.Type.INVENTORY_ITEM, id: itemNo, columns: ['salesdescription']}).salesdescription;
                    description = precRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'description',
                        line: i
                    }) || " ";
                    originalQty = parseInt(precRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i
                    })) || " ";
                    units = precRecord.getSublistText({
                        sublistId: 'item',
                        fieldId: 'units',
                        line: i
                    }) || " ";
                    srpPrice = `${currency.getValue("displaysymbol")}${precRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_srp_price',//'custcol_ai_base_srp',
                        line: i
                    }) || " " }`;
    
                }
                else if(precRecord.getValue("baserecordtype") === record.Type.INVENTORY_ITEM){
    
                    itemText = precRecord.getValue("itemid");
                    itemNo = precRecord.getValue("id");
                    itemDisplayName = precRecord.getValue("displayname");
                    description = precRecord.getValue("salesdescription") || " ";
                    originalQty = precRecord.getValue("consumptionunit") || "1";
                    units = precRecord.getValue("baseunit");
                    srpPrice = `${currency.getValue("displaysymbol")}${precRecord.getValue("custitem_ai_base_srp")}`;
    
                }
    
                // assign values to the sublist

                sublist.setSublistValue({   // populate ITEM column
                    id: 'item',
                    line: i - loopGap,
                    value: itemText 
                });


                sublist.setSublistValue({   // populate ITEMNO column
                    id: 'itemno',
                    line: i - loopGap,
                    value:  itemNo || " "
                });

                if(itemDisplayName){
                    sublist.setSublistValue({   // populate hidden ITEM DISPLAY NAME column
                        id: 'itemdisplayname',
                        line: i - loopGap,
                        value: itemDisplayName
                    });
    
                }

                sublist.setSublistValue({   // populate hidden LINE column
                    id: 'line',
                    line: i - loopGap,
                    value: i
                });

                sublist.setSublistValue({   // populate QUANTITY column
                    id: 'origqty',
                    line: i - loopGap,
                    value: originalQty
                });

                sublist.setSublistValue({   // populate UNITS column
                    id: 'units',
                    line: i - loopGap,
                    value: units
                });

                sublist.setSublistValue({   // populate DESCRIPTION column
                    id: 'description',
                    line: i - loopGap,
                    value: description
                });

                sublist.setSublistValue({   // populate SRP PRICE column
                    id: 'srpprice',
                    line: i - loopGap,
                    value: srpPrice
                });

            }

            return sublist;


        }




        /**
        *   The function downloads the PDF data
        *   can be used in POST requests
        */
        const returnPDF = (scriptContext) => {


            var [pdf_recordtype, pdf_recordid, pdf_template_id, pdf_print_orig_qty, pdf_print_var_qty, pdf_print_fix_qty, pdf_fix_no_qty] = getParams(scriptContext);

            //  override with POST params
            [pdf_recordtype, pdf_recordid] = getPOSTParams(scriptContext);
            //log.debug({title: 'returnPDF', details: `[pdf_recordtype, pdf_recordid]: [${pdf_recordtype}, ${pdf_recordid}]`});

            let serverRequest = scriptContext.request;

            //  get PDF template
            pdf_template_id = pdf_template_id ? pdf_template_id : serverRequest.parameters.custpage_itemlabellayout;

            // log.debug({title: 'returnPDF', details: pdf_template_id});

            //  create renderer
            const renderer = render.create();
            renderer.setTemplateByScriptId(pdf_template_id);

            //  create "records" renderer alias for printing
            let records = [];    //  holds print structure
            //let creationcount = 0;
        
            // log.debug({title: 'returnPDF', details: `serverRequest.files.custpage_file: ${serverRequest.files.custpage_file}`});

            if(serverRequest.files.custpage_file){      //  if the file is uploaded / STAND ALONE MODE

                const fileContents = serverRequest.files.custpage_file.getContents();

                var lineNumber = 0;
                var lines = fileContents.split(/\r?\n/);
                log.debug("lines", lines);
                
                //  prepare Item search filter
                const searchFilters = prepareItemSearchFilters(lines);
                log.debug("searchFilters", searchFilters);

                const itemSearch = search.create({
                    type: 'item',
                    filters: searchFilters,
                    columns: [
                        search.createColumn({ name: 'itemid', sort: search.Sort.ASC }),
                        search.createColumn({ name: 'displayname' }),
                        search.createColumn({ name: 'salesdescription' }),
                        search.createColumn({ name: 'custitem_ai_base_srp' }),
                        search.createColumn({ name: 'upccode' }),
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: 'vendorpricecurrency' })
                    ]
                });
                const itemResult = itemSearch.run().getRange({
                    start: 0,
                    end: 1000
                });

                // Create a Map to store item data, keyed by internalid
                const itemMap = new Map();

                itemResult.forEach(result => {
                    const itemCode = result.getValue({ name: 'itemid' });
                    const itemData = {
                        internalid: result.getValue({ name: 'internalid' }),
                        displayname: result.getValue({ name: 'displayname' }),
                        salesdescription: result.getValue({ name: 'salesdescription' }),
                        custitem_ai_base_srp: result.getValue({ name: 'custitem_ai_base_srp' }),
                        upccode: result.getValue({ name: 'upccode' }),
                        vendorpricecurrency: result.getValue({ name: 'vendorpricecurrency' }),
                    };
                    itemMap.set(itemCode, itemData);
                });

                log.debug("itemMap", itemMap);

                //  check if customer pricing is applied
                const aiCustPricingCustomerNo = serverRequest.parameters.custpage_aicustpricing;

                let custPriceLookupList;
                if(aiCustPricingCustomerNo != '@None'){

                    //  map internalId list of items
                    const itemInternalIdList = itemResult.map(result => {
                        return result.getValue({ name: 'internalid' });
                    });
                    log.debug("itemInternalIdList", itemInternalIdList);
    
                    //  lookup list is generated => [item, custitemprice]
                    custPriceLookupList = getBulkCustomerPricingListForUpload(itemInternalIdList, aiCustPricingCustomerNo);
                    log.debug("custPriceLookupList", custPriceLookupList);

                }

                //  remove header line of CSV file
                lines.shift()
                
                // itemResult.forEach(line => {
                lines.forEach(line => {
                                        
                    // GET itemcode
                    // var itemcode = line.getValue("itemid");
                    var itemcode = line.split(",")[0];
                    const foundItem = itemMap.get(itemcode);
                    log.debug("foundItem", foundItem);

                    if(!itemcode || itemcode == "" || !foundItem || !foundItem.internalid){
                        return;         //skip the loop
                    }

                    itemcode = itemcode.slice(0, 25); // limit chars to 25

                    //  GET itemname
                    // var itemname = line.getValue("salesdescription") || line.getValue("displayname") || line.getValue("itemid");
                    var itemname = foundItem.salesdescription || foundItem.displayname || foundItem.itemid;
                    itemname = itemname.slice(0, 25); // limit chars to 25

                    // var lineQty = parseInt(getQuantityFromBulkDataPerItemname(lines, itemcode));
                    var lineQty = parseInt(line.split(",")[1]);

                    for(var counter = 0; counter < lineQty; counter ++){    //  print X many times each label

                        var printingPrice = "";
                        var currSymbol = "";

                        //  map currency symbol per ID
                        // var currencyId = line.getValue("vendorpricecurrency");
                        var currencyId = foundItem.vendorpricecurrency;

                        switch(currencyId){
                            case "1":
                                currSymbol = "$";
                                break;
                            case "2":
                                currSymbol = "£";
                                break;
                            case "3":
                                currSymbol = "$";
                                break;
                            case "4":
                                currSymbol = "€";
                                break;
                            case "5":
                                currSymbol = "¥";
                                break;
                            default:
                                currSymbol = "$";
                                break;                                                               
                        }


                        //  if customer pricing is applied, then lookup customer pricing from internal list
                        if(aiCustPricingCustomerNo != '@None'){
                            //  lookup from list to override price
                            // let custpricePerItem = custPriceLookupList.find(item => item.item === line.getValue("internalid"));
                            let custpricePerItem = custPriceLookupList.find(item => item.item === foundItem.internalid);
                            printingPrice = custpricePerItem.custitemprice ? `${currSymbol}${custpricePerItem.custitemprice}` : `${currSymbol}${foundItem.custitem_ai_base_srp}`;
                        }
                        if(!printingPrice){ //  if customer pricing is not applied or not found
                            // printingPrice = `${currSymbol}${line.getValue("custitem_ai_base_srp")}`;
                            printingPrice = `${currSymbol}${foundItem.custitem_ai_base_srp}`;
                        }

                        records.push({
                            line:           lineNumber - 1,
                            // id:             line.getValue("internalid"),
                            id:             foundItem.internalid,
                            item:           itemcode,
                            name:           itemname,  
                            price:          printingPrice,  //`${currency.getValue("displaysymbol")}${itemResult[0].getValue("custitem_ai_base_srp")}`,
                            // skuUpcBarcode:  line.getValue("upccode")
                            skuUpcBarcode:  foundItem.upccode
                        });

                    }

                    lineNumber++;

                });

                // log.debug("records", JSON.stringify(records));

            }
            else{                                       //  if the suitelet ran on a record (salesorder or inventoryitem)

                for(var counter = 0; counter < serverRequest.getLineCount({group: 'custpage_item_sublist'}); counter++){

                    var printcheck = serverRequest.getSublistValue({
                        group: 'custpage_item_sublist', 
                        name: 'custpage_printcheck',
                        line: counter
                    });
    
                    if(printcheck === 'F') {
                        
                        continue;        // dont print if not checked
                    }
    
                    //  GET line
                    var line =      serverRequest.getSublistValue({
                                        group: 'custpage_item_sublist', 
                                        name: 'line',
                                        line: counter
                                    });
                    //  GET itemid
                    var itemno =    serverRequest.getSublistValue({
                                        group: 'custpage_item_sublist', 
                                        name: 'itemno',
                                        line: counter
                                    });
                    //  GET itemname
                    var itemname =  serverRequest.getSublistValue({                         // check if "description" exists
                                        group: 'custpage_item_sublist', 
                                        name: 'description',
                                        line: counter
                                    }) || (serverRequest.getSublistValue({                  // if not, second check is "itemdisplayname"
                                                        group: 'custpage_item_sublist', 
                                                        name: 'itemdisplayname',
                                                        line: counter
                                                    })  || (serverRequest.getSublistValue({ //  third check is on "item"
                                                                group: 'custpage_item_sublist', 
                                                                name: 'item',
                                                                line: counter
                                                            }) || "Item Name")); // check first if Item Display Name has a value, if not take Item no

                    itemname = itemname.slice(0, 25); // limit chars to 25
    
                    //  GET upccode
                    var upccode = itemno ? search.lookupFields({ type: search.Type.INVENTORY_ITEM, id: itemno, columns: ['upccode'] }).upccode : "";
                    upccode = !upccode ? 1 : upccode;
    

                    const aiCustPricingForItem = serverRequest.parameters.custpage_aicustpricing;
                    log.debug({title: 'returnPDF', details: `aiCustPricingForItem: ${aiCustPricingForItem}`});

                    if(pdf_recordtype == record.Type.INVENTORY_ITEM){

                        if(aiCustPricingForItem != '@None'){   //  GET customer srpprice

                            const itemObj  = record.load({type: record.Type.INVENTORY_ITEM, id: pdf_recordid, isDynamic: false});
                            const currency = record.load({type: record.Type.CURRENCY, id: itemObj.getValue("currency"), isDynamic: false});
    
                            var srpprice = `${currency.getValue("displaysymbol")}${aiCustPricingForItem}`;

                        }
                        else{
                            //  GET default srpprice
                            var srpprice = serverRequest.getSublistValue({
                                group: 'custpage_item_sublist', 
                                name: 'srpprice',
                                line: counter
                            }) || 1;

                        }                            
                    }     
                    else{   //  record.Type.SALES.ORDER

                        //  GET default srpprice
                        var srpprice = serverRequest.getSublistValue({
                            group: 'custpage_item_sublist', 
                            name: 'srpprice',
                            line: counter
                        }) || 1;

                    }                            
    
                    //  check printing options
                    if(pdf_print_var_qty === 'T'){
    
                        var variousqty = parseInt(serverRequest.getSublistValue({
                            group: 'custpage_item_sublist', 
                            name: 'labelqty',
                            line: counter
                        }));
                        log.debug({title: 'returnPDF', details: `variousqty: ${variousqty}`});
                        if(!variousqty || variousqty == '0'){
                            variousqty = 1;
                        }
    
                        for(var labelcount = 0; labelcount < variousqty; labelcount++){
                            records.push({
                                line:           line,
                                id:             itemno,
                                item:           serverRequest.getSublistValue({group: 'custpage_item_sublist', name: 'item', line: counter}),
                                name:           itemname,  
                                price:          srpprice,
                                skuUpcBarcode:  upccode
                            });    
                        }
                        
                    }
                    else if(pdf_print_fix_qty === 'T'){
                        log.debug({title: 'returnPDF', details: `pdf_fix_no_qty: ${pdf_fix_no_qty}`});
                        if(!pdf_fix_no_qty || pdf_fix_no_qty == '0'){
                            pdf_fix_no_qty = 1;
                        }
                        
                        for(var labelcount = 0; labelcount < parseInt(pdf_fix_no_qty); labelcount++){
                            records.push({
                                line:           line,
                                id:             itemno,
                                item:           serverRequest.getSublistValue({group: 'custpage_item_sublist',name: 'item',line: counter}),
                                name:           itemname,  
                                price:          srpprice,
                                skuUpcBarcode:  upccode
                            });    
                        }               
                    }
                    else{   //  either nothing selected, then original qty by default; or checkbox original qty is checked
                    //if(pdf_print_orig_qty === 'T'){                      
    
                        var originalqty = parseInt(serverRequest.getSublistValue({
                            group: 'custpage_item_sublist', 
                            name: 'origqty',
                            line: counter
                        }));
                        log.debug({title: 'returnPDF', details: `originalqty: ${originalqty}`});
                        if(!originalqty || originalqty == '0'){
                            originalqty = 1;
                        }
    
                        for(var labelcount = 0; labelcount < originalqty; labelcount++){
                            records.push({
                                line:           line,
                                id:             itemno,
                                item:           serverRequest.getSublistValue({group: 'custpage_item_sublist',name: 'item',line: counter}),
                                name:           itemname,  
                                price:          srpprice,
                                skuUpcBarcode:  upccode
                            });
    
                        }
                        
                    }
    
                }
    
 
            }

            records.forEach((row, index) => {
                //log.debug({title: `${index} replace`, details: `${typeof(row.id)}_${typeof(row.item)}_${typeof(row.name)}_${typeof(row.price)}_${typeof(row.skuUpcBarcode)}` });

                //  replace all non-supported chars in HTML
                row.id              =   row.id              ?   row.id.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")               :   row.id;
                row.item            =   row.item            ?   row.item.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")             :   row.item;
                row.name            =   row.name            ?   row.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")             :   row.name;
                row.price           =   row.price           ?   row.price.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")            :   row.price;
                row.skuUpcBarcode   =   row.skuUpcBarcode   ?   row.skuUpcBarcode.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")    :   row.skuUpcBarcode;
            });

            // log.debug({title: 'returnPDF', details: JSON.stringify({data: records})});

            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "records",
                data: JSON.parse(JSON.stringify({data: records}))
            });
            
            var renderPDF = renderer.renderAsPdf();

            //  assign filename
            var filename = `${Date.now()}.pdf`;

            return [renderPDF, filename];
            
        }



        /**
        *   Doesn't return anything, but create columns for the sublist in the input parameters
        *   can be used in GET requests
        */
        const createHeaderFields = (form) => {

            return[
                itemLabelLayout = form.addField({
                    id: 'custpage_itemlabellayout', 
                    label: 'Item Label Layout',
                    type: serverWidget.FieldType.SELECT
                }) // will be sourced from Advanced PDF records for Item Label
                ,
                aiCustPricing = form.addField({
                    id: 'custpage_aicustpricing', 
                    label: 'AI Customer Pricing',
                    type: serverWidget.FieldType.SELECT
                }) // will be sourced from customer record list
                ,
                prtOrigQty = form.addField({
                    id: 'custpage_print_orig_qty',
                    label: 'PRINT ITEM QUANTITY OF LABELS',
                    type: serverWidget.FieldType.CHECKBOX
                })
                ,
                prtVarQty = form.addField({
                    id: 'custpage_print_var_qty',
                    label: 'PRINT VARIABLE QUANTITY OF LABELS',
                    type: serverWidget.FieldType.CHECKBOX
                })
                ,
                prtFixQty = form.addField({
                    id: 'custpage_print_fix_qty',
                    label: 'PRINT FIX QUANTITY OF LABELS',
                    type: serverWidget.FieldType.CHECKBOX
                })
                ,
                fixNoOfQty = form.addField({
                    id: 'custpage_fix_no_qty',
                    label: 'FIXED NUMBER OF LABELS',
                    type: serverWidget.FieldType.TEXT
                })

            ];
        }




        /**
        *   Doesn't return anything, but create columns for the sublist in the input parameters
        *   can be used in both GET and POST request
        */
        const createSublistColumns = (sublist) => {
 
            //  sublist columns
            sublist.addField({          //  PRINT CHECKBOX
                id: 'custpage_printcheck',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'PRINT'
            }).defaultValue = 'T';

            sublist.addField({          //  LABEL QTY
                id: 'labelqty',
                type: serverWidget.FieldType.TEXT,
                label: 'LABEL QTY'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.ENTRY
            });

            sublist.addField({          //  LINE ID (HIDDEN)
                id: 'line',
                type: serverWidget.FieldType.TEXT,
                label: 'LINE'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            sublist.addField({          //   ITEM
                id: 'item',
                type: serverWidget.FieldType.TEXT,
                label: 'ITEM'
            });

            sublist.addField({          //   ITEM
                id: 'itemdisplayname',
                type: serverWidget.FieldType.TEXT,
                label: 'ITEM DISPLAY NAME'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            sublist.addField({          //   ITEMNO (HIDDEN)
                id: 'itemno',
                type: serverWidget.FieldType.TEXT,
                label: 'ITEMNO'
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            });

            sublist.addField({          //  ORIG QTY
                id: 'origqty',
                type: serverWidget.FieldType.TEXT,
                label: 'QUANTITY'
            });

            sublist.addField({          //  UNITS
                id: 'units',
                type: serverWidget.FieldType.TEXT,
                label: 'UNITS'
            });

            sublist.addField({          //  DESCRIPTION
                id: 'description',
                type: serverWidget.FieldType.TEXT,
                label: 'DESCRIPTION'
            });

            sublist.addField({          //  SRP PRICE
                id: 'srpprice',
                type: serverWidget.FieldType.TEXT,
                label: 'SRP PRICE'
            });

        }




        /**
        *   Returns a list of PDF template name and ID
        *   can be used in GET 
        */
        const buildCustomListOfPrintingTemplates = () => {
            
            const customrecordAcsAdvPdfHtmlTemplatesSearch = search.create({
                type: 'customrecord_acs_adv_pdf_html_templates',
                filters: ['custrecord_acs_pdfhtml_type', 'is', 'ItemLabel'],
                columns: [
                    search.createColumn({ name: 'id'}), //, sort: search.Sort.ASC 
                    search.createColumn({ name: 'custrecord_acs_pdfhtml_scriptid' }),
                    search.createColumn({ name: 'custrecord_acs_pdfhtml_name' })
                ]
            });
           
            const templateResult = customrecordAcsAdvPdfHtmlTemplatesSearch.run().getRange({
                start: 0,
                end: 100 //max
            });

            let templateReturnList = [];

            templateResult.forEach(function(row) {
                templateReturnList.push({
                    id: row.getValue("custrecord_acs_pdfhtml_scriptid"),
                    name: row.getValue("custrecord_acs_pdfhtml_name")
                })

            });

            return templateReturnList;

        }



        /**
         * Returns the quantity, after looking up from the list
         * @param {List} data 
         * @param {string} itemName 
         * @returns 
         */
        const getQuantityFromBulkDataPerItemname = (data, itemName) => {
            // Skip the header row (if it exists)
            const lines = data.slice(1); // Creates a new array *without* the first element

            let totalQty = 0;

            for (const line of lines) {
                
                if (line.trim() === "") continue; // Skip empty lines

                const [name, quantity] = line.split(',');
                if (name === itemName) {
                    totalQty += parseInt(quantity, 10);
                }
            }

            return totalQty;

        }



        /**
         * Returns a parsed list to be used as search filters
         * @param {List} lines 
         * @returns {List}
         */
        const prepareItemSearchFilters = (lines) => {

            let returnList = [];
            let lineNumber = 0;

            lines.forEach(line =>{

                if(lineNumber > 0){     //  skip the first line, for header row

                    returnList.push([
                        'nameinternal', 'is', line.split(",")[0]
                    ]);
                    returnList.push('OR');

                }


                lineNumber++;
            })

            //  delete last 'OR'
            returnList.pop();

            return returnList;

        }



        /**
        *   Returns an array of parameters
        *   can be used in both GET and POST request
        */
        const getParams = (scriptContext) => {

            return [scriptContext.request.parameters.custscript_recordtype,
                    scriptContext.request.parameters.custscript_recordid,
                    scriptContext.request.parameters.custpage_itemlabellayout,
                    scriptContext.request.parameters.custpage_print_orig_qty,
                    scriptContext.request.parameters.custpage_print_var_qty,
                    scriptContext.request.parameters.custpage_print_fix_qty,
                    scriptContext.request.parameters.custpage_fix_no_qty      
                ];
             
        }



        
        /**
        *   Returns an array of parameters
        *   can be used in  GET request
        */
        const setPOSTParams = (form, recordtype, recordid) => {

            //  scriptContext.request.parameters.custpage_post_recordtype
            form.addField({
                id: 'custpage_post_recordtype', 
                type: serverWidget.FieldType.TEXT,
                label: 'custpage_post_recordtype' 
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            }).defaultValue = recordtype;

            //  scriptContext.request.parameters.custpage_post_recordid
            form.addField({
                id: 'custpage_post_recordid', 
                type: serverWidget.FieldType.TEXT,
                label: 'custpage_post_recordid' 
            }).updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            }).defaultValue = recordid;

        }




        /**
        *   Returns an array of parameters
        *   can be used in  POST request
        */
        const getPOSTParams = (scriptContext) => {

            return [scriptContext.request.parameters.custpage_post_recordtype, scriptContext.request.parameters.custpage_post_recordid];
        }
        

        return {onRequest}

    });
