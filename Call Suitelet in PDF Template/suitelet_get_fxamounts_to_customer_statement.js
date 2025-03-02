/**
 * 
 * Deploy the suitelet, and allow it to be called externally as well. See the instructions. 
 * 
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/search'],
    /**
 * @param{log} log
 * @param{search} search
 */
    (log, search) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            try{

                const tranid = scriptContext.request.parameters.tranid;
                const type = scriptContext.request.parameters.type;
                log.debug("params", tranid + ', ' + type);

                if(!tranid || !type){
                    scriptContext.response.write(null);
                    return;
                }

                //  get mapped type in terms of search
                let mappedType = mapType(type);
                log.debug("mappedType", mappedType);

                const transactionSearchFilters = [
                    ['numbertext', 'contains', tranid],
                    'AND',
                    ['type', 'anyof', mappedType],
                    'AND',
                    ['mainline', 'is', 'T'],
                    'AND',
                    ['currency', 'noneof', '1'],
                ];


                const transactionSearch = search.create({
                    type: 'transaction',
                    filters: transactionSearchFilters,
                    columns: [
                        search.createColumn({ name: 'fxamount' }),
                        search.createColumn({ name: 'fxamountremaining' }),
                        search.createColumn({ name: 'exchangerate' }),
                        search.createColumn({ name: 'amount' }),
                        search.createColumn({ name: 'currency', join: 'subsidiary' }),
                        search.createColumn({ name: 'currency' })
                    ]
                });

                const transactionSearchResult = transactionSearch.run().getRange({
                    start: 0,
                    end:   1
                });

                let result = {};
                log.debug("transactionSearchResult", JSON.stringify(transactionSearchResult[0]));

                if(!transactionSearchResult[0] || transactionSearchResult[0].getValue({ name: 'currency'}) == "1"){
                    result.fxamountLine = "";
                    result.fxamountremainingLine = "";
                    result.exchangerate = "";
                    result.amount = "";
                    result.amountremaining = "";
                    result.currency = "";

                    scriptContext.response.write(`<#assign amountLine = ${JSON.stringify(result)} />`);


                }
                
                result.fxamountLine             = transactionSearchResult[0].getValue({ name: 'fxamount' });
                result.fxamountremainingLine    = transactionSearchResult[0].getValue({ name: 'fxamountremaining' }) || "0.00";
                if(result.fxamountremainingLine == ".00"){
                    result.fxamountremainingLine = "0.00";
                }
                result.exchangerate             = transactionSearchResult[0].getValue({ name: 'exchangerate' });

                if(result.exchangerate[0] == "."){
                    result.exchangerate = "0" + result.exchangerate;
                }
                result.amount                   = transactionSearchResult[0].getValue({ name: 'amount' });
                result.amountremaining          = transactionSearchResult[0].getValue({ name: 'amountremaining' }) || "0.00";
                result.currency                 = transactionSearchResult[0].getValue({ name: 'currency', join: 'subsidiary' });

                const currSymbol = search.lookupFields({
                    type: search.Type.CURRENCY,
                    id: result.currency,
                    columns: "symbol"
                })["symbol"];

                //let finalVal = `${currSymbol} ${parseFloat(result.amount).toLocaleString()}`;
                // log.debug("finalVal", finalVal);

                result.amount                   = `${currSymbol} ${parseFloat(result.amount).toLocaleString()}`;
                result.amountremaining          = `${currSymbol} ${parseFloat(result.amountremaining).toLocaleString()}`;
                result.currency                 = currSymbol;


                log.debug("result", JSON.stringify(result));
                scriptContext.response.write(`<#assign amountLine = ${JSON.stringify(result)} />`);
                

            }
            catch(ex){
                log.error("Error at onRequest", ex.message);
            }

        }



        /**
         * 
         * @param {string} type 
         * @returns {string}
         */
        const mapType = (type) => {

            let mappedType;
            log.debug("type", type);
            switch(type){
                case "Bill":
                    mappedType = "VendBill";
                    break;
                case "Bill Credit":
                    mappedType = "VendCred";
                    break;
                case "Bill Payment":
                    mappedType = "VendPymt";
                    break;
                case "Cash Refund":
                    mappedType = "CashRfnd";
                    break;
                case "Cash Sale":
                    mappedType = "CashSale";
                    break;
                case "CCard Refund":
                    mappedType = "CardRfnd";
                    break;
                case "Check":
                    mappedType = "Check";
                    break;
                case "Credit Card":
                    mappedType = "CardChrg";
                    break;
                case "Credit Memo":
                    mappedType = "CustCred";
                    break;
                case "Currency Revaluation":
                    mappedType = "FxReval";
                    break;
                case "Customer Deposit":
                    mappedType = "CustDep";
                    break;
                case "Customer Refund":
                    mappedType = "CustRfnd";
                    break;
                case "Deposit":
                    mappedType = "Deposit";
                    break;
                case "Deposit Application":
                    mappedType = "DepAppl";
                    break;
                case "Deprecated Custom Transaction":
                    mappedType = "DeprCust";
                    break;
                case "Estimate":
                    mappedType = "Estimate";
                    break;
                case "Expense Report":
                    mappedType = "ExpRept";
                    break;
                case "FAM Special Depreciation Entry":
                    mappedType = "Custom106";
                    break;
                case "Finance Charge":
                    mappedType = "FinChrg";
                    break;
                case "Fixed Asset Depreciation Entry":
                    mappedType = "Custom110";
                    break;
                case "Fixed Asset Disposal Entry":
                    mappedType = "Custom108";
                    break;
                case "Fixed Asset Revaluation Entry":
                    mappedType = "Custom111";
                    break;
                case "Fixed Asset Transfer Entry":
                    mappedType = "Custom109";
                    break;
                case "Inventory Adjustment":
                    mappedType = "InvAdjst";
                    break;
                case "Inventory Cost Revaluation":
                    mappedType = "InvReval";
                    break;
                case "Inventory Count":
                    mappedType = "InvCount";
                    break;
                case "Bill":
                    mappedType = "VendBill";
                    break;
                case "Bill":
                    mappedType = "VendBill";
                    break;
                case "Inventory Distribution":
                    mappedType = "InvDistr";
                    break;
                case "Inventory Transfer":
                    mappedType = "InvTrnfr";
                    break;
                case "Inventory Worksheet":
                    mappedType = "InvWksht";
                    break;
                case "Invoice":
                    mappedType = "CustInvc";
                    break;
                case "Item Fulfillment":
                    mappedType = "ItemShip";
                    break;
                case "Item Receipt":
                    mappedType = "ItemRcpt";
                    break;
                case "Journal":
                    mappedType = "Journal";
                    break;
                case "Lease":
                    mappedType = "Custom107";
                    break;
                case "Payment":
                    mappedType = "CustPymt";
                    break;
                case "Purchase Order":
                    mappedType = "PurchOrd";
                    break;
                case "Return Authorization":
                    mappedType = "RtnAuth";
                    break;
                case "Sales Order":
                    mappedType = "SalesOrd";
                    break;
                case "Sales Tax Payment":
                    mappedType = "TaxPymt";
                    break;
                case "Statement Charge":
                    mappedType = "CustChrg";
                    break;
                case "System Journal":
                    mappedType = "SysJrnl";
                    break;
                case "Transfer":
                    mappedType = "Transfer";
                    break;
                case "Transfer Order":
                    mappedType = "TrnfrOrd";
                    break;
                case "Vendor Prepayment":
                    mappedType = "VPrep";
                    break;
                case "Vendor Prepayment Application":
                    mappedType = "VPrepApp";
                    break;
                case "Vendor Return Authorization":
                    mappedType = "VendAuth"; 
                    break;
            }

            return mappedType;

        }


        return {onRequest}

    });
