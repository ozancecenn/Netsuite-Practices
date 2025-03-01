<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<#if record??>
    <pdf>

        <head>
            <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
            <#if .locale=="zh_CN">
                <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
                <#elseif .locale=="zh_TW">
                    <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
                    <#elseif .locale=="ja_JP">
                        <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
                        <#elseif .locale=="ko_KR">
                            <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
                            <#elseif .locale=="th_TH">
                                <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />
            </#if>
            <macrolist>
                <macro id="nlheader">
                        <table class="header" style="width: 100%; line-height: 125%; height: 60px;">
                            <tr style="height: 30px;">
                                <td style="height: 30px;">
                                    <#if companyInformation.logoUrl?length !=0>
                                        <@filecabinet nstype="image" style="float: left; " src="${companyInformation.logoUrl}" />
                                    </#if>
                                </td>
                                <td style="height: 30px;" align="right"><span class="title">
                                        ${record@title}
                                    </span></td>
                            </tr>
                            <tr>
                              <td>&nbsp;</td>
                              <td>&nbsp;</td>
                            </tr>
                            <tr style="height: 15px;">
                                <td style="height: 15px; margin-left: 5px"><span class="nameandaddress">
                                        ${companyInformation.companyName}
                                    </span></td>
                                <td style="height: 15px; margin-right: 5px" align="right">
                                    ${customer.entityid} ${customer.id}
                                </td>
                            </tr>
                            <tr style="height: 15px;">
                                <td style="height: 15px; margin-left: 5px"><span class="nameandaddress">
                                        ${companyInformation.addressText}
                                    </span></td>
                                <td style="height: 15px; margin-right: 5px" align="right">
                                    ${record.trandate?string['dd-MMM-YYYY']}
                                </td>
                            </tr>
                        </table>

                </macro>
                <macro id="nlfooter">
                    <table class="footer" style="width: 100%;">
                        <tr>
                            <td align="right">
                                <pagenumber /> of
                                <totalpages />
                            </td>
                        </tr>
                    </table>
                </macro>
            </macrolist>
            <style type="text/css">
            * {
                <#if .locale=="zh_CN">font-family: NotoSans, NotoSansCJKsc, sans-serif;
                <#elseif .locale=="zh_TW">font-family: NotoSans, NotoSansCJKtc, sans-serif;
                <#elseif .locale=="ja_JP">font-family: NotoSans, NotoSansCJKjp, sans-serif;
                <#elseif .locale=="ko_KR">font-family: NotoSans, NotoSansCJKkr, sans-serif;
                <#elseif .locale=="th_TH">font-family: NotoSans, NotoSansThai, sans-serif;
                <#else>font-family: NotoSans, sans-serif;
                </#if>
            }

            table {
                font-size: 9pt;
                table-layout: auto;
            }

            th {
                font-weight: bold;
                font-size: 8pt;
                vertical-align: middle;
                padding: 5px 6px 3px;
                background-color: #e3e3e3;
                color: #333333;
            }

            td {
                padding: 4px 6px;
            }

            td p {
                align: left
            }

            b {
                font-weight: bold;
                color: #333333;
            }

            table.header td {
                padding: 0;
                font-size: 10pt;
            }

            table.footer td {
                padding: 0;
                font-size: 8pt;
            }

            table.itemtable th {
                padding-bottom: 10px;
                padding-top: 10px;
            }

            table.body td {
                padding-top: 2px;
            }

            td.addressheader {
                font-size: 8pt;
                padding-top: 6px;
                padding-bottom: 2px;
            }

            td.address {
                padding-top: 0px;
            }

            span.title {
                font-size: 28pt;
            }

            span.number {
                font-size: 16pt;
            }

            hr {
                border-top: 1px dashed #d3d3d3;
                width: 100%;
                color: #ffffff;
                background-color: #ffffff;
                height: 1px;
            }
            </style>
        </head>

            <body header="nlheader" header-height="20%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">

              <#assign paymentDetails = subsidiary.custrecord_acs_subs_bank_details?split("<br />") />
              <#assign contactDetails = subsidiary.custrecord_acs_subs_contact_details?split("<br />") />
              
                <table style="width: 100%; margin-top: 25px;">
                    <tr>
                        <td style="width: 69.9653%;"><strong>
                                ${record.billaddress@label}
                            </strong></td>
                        <td align="right" style="width: 30.0343%;">
                          <#if paymentDetails[0]?has_content>
                            <strong>Payment Details:<br /></strong>
                          </#if>
                        </td>
                    </tr>
                    <tr>
                        <td class="address" style="width: 69.9653%;" rowspan="10">
                            ${record.billaddress}
                        </td>
                        <td align="right" style="width: 30.0343%; line-height: 60%;">
                          <#if paymentDetails[0]?has_content>
                            ${paymentDetails[0]}
                          </#if>
                        </td>
                    </tr>
                    <#if paymentDetails[1]?has_content>
                    <tr> 
                      <td align="right" style="width: 30.0343%; line-height: 60%;">${paymentDetails[1]}</td>
                    </tr>
                    </#if>
                    <#if paymentDetails[2]?has_content>  
                    <tr>            
                      <td align="right" style="width: 30.0343%; line-height: 60%;">${paymentDetails[2]}</td>                      
                    </tr>
                    </#if>
                    <#if paymentDetails[3]?has_content>  
                    <tr>            
                      <td align="right" style="width: 30.0343%; line-height: 60%;">${paymentDetails[3]}</td>                      
                    </tr>
                    </#if>
                    <#if paymentDetails[4]?has_content>  
                    <tr>            
                      <td align="right" style="width: 30.0343%; line-height: 60%;">${paymentDetails[4]}</td>                      
                    </tr>
                    </#if>

                    <#if contactDetails[0]?has_content> 
                    <tr>
                      <td align="right" style="width: 30.0343%;"><strong>Contact Details:</strong></td>                      
                    </tr>
                    </#if>
                    <#if contactDetails[0]?has_content> 
                    <tr> 
                      <td align="right" style="width: 30.0343%; line-height: 60%;">${contactDetails[0]}</td>
                    </tr>
                    </#if>
                    <#if contactDetails[1]?has_content> 
                    <tr>    
                      <td align="right" style="width: 30.0343%; line-height: 60%;">${contactDetails[1]}</td>                      
                    </tr>
                    </#if>
                    <#if contactDetails[2]?has_content> 
                    <tr>    
                      <td align="right" style="width: 30.0343%; line-height: 60%;">${contactDetails[2]}</td>                      
                    </tr>
                    </#if>
                    <#if contactDetails[3]?has_content> 
                    <tr>    
                      <td align="right" style="width: 30.0343%; line-height: 60%;">${contactDetails[3]}</td>                      
                    </tr>
                    </#if>
                    <#if contactDetails[4]?has_content> 
                    <tr>    
                      <td align="right" style="width: 30.0343%; line-height: 60%;">${contactDetails[4]}</td>                      
                    </tr>
                    </#if>
                  
                </table>
              
                <#assign today = .now?date>

<!-- input = date1, date2, output = number (days) -->                  
<#function calculateDateDiff(date1, date2)>

  <#assign date1elems = date1?split("/") />
  <#assign date2elems = date2?split("/") />

  <#assign date1day = date1elems[0]?number />
  <#assign date1month = date1elems[1]?number />
  <#assign date1year = date1elems[2]?number />
  <#assign date2day = date2elems[0]?number />
  <#assign date2month = date2elems[1]?number />
  <#assign date2year = date2elems[2]?number />
                    
  <#assign dayDiff = date2day - date1day />
  <#if dayDiff lt 0>
    <#assign dayDiff = dayDiff + 30 /> <#-- carry 1 from month = 30 days -->
    <#assign date2month = date2month - 1 />   
  </#if>

  <#assign monthDiff = date2month - date1month />
    <#if monthDiff lt 0>
      <#assign monthDiff = monthDiff + 12 /> <#-- carry 1 from year = 12 months -->
      <#assign date2year = date2year - 1 />
    </#if>

  <#assign yearDiff = date2year - date1year />
  <#return  yearDiff*365 +  monthDiff*30 + dayDiff />        
</#function>

<!-- input = string, output = parsed JSON object -->    
<#function parseTransactionData(transactionString)>
  <#assign hashIndex = transactionString?index_of("#")>
  <#if hashIndex != -1> <#-- Check if '#' exists -->
    <#assign transactionType = transactionString?substring(0, hashIndex - 1)?trim>

    <#assign dashIndex = transactionString?index_of("-")>
    <#if dashIndex == -1>
      <#assign dashIndex = transactionString?length>
    </#if>

    <#assign transactionNumber = transactionString?substring(hashIndex + 1, dashIndex)?trim>

    <#return {"type": transactionType, "number": transactionNumber}>
  <#else> <#-- Handle the case where '#' is not found -->
    <#return {"type": transactionString, "number": ""}> <#-- Or return an error indicator -->
  </#if>
</#function>

<!-- input = number, output string -->
<#function formatNumber(number)>
  <!-- handle negative numbers as well -->
  <#if number?string?substring(0, 1) = "-">
    <#assign number_str = number?string("0.00")?substring(1) />
    <#assign sign = "-" />
  <#else>  
    <#assign number_str = number?string("0.00") />
    <#assign sign = "" />
  </#if>

  <#assign splitted_str = number_str?split(".") />
    
  <#assign integerpart = splitted_str[0] />
  <#assign reversed_integerpart = integerpart?split("")?reverse?join("") />
  <#assign decimalpart = splitted_str[1] />
    
  <#assign result = "" />
  <#assign counter = 0 />
  <#list reversed_integerpart?split("") as char> 
    <#if counter == 3 && char != "." && char != "," >
      <#assign result = result + "," + char />
      <#assign counter = 1 />
    <#else>
      <#assign result = result + char />
      <#assign counter = counter + 1 />
    </#if>
  </#list>
  <#assign returnResult = result?split("")?reverse?join("") />
  <#assign returnResult = returnResult + "." + decimalpart />
  <#return sign + returnResult />
</#function>
      
                <table class="itemtable" style="width: 100%; margin-top: 25px;">
                    <!-- start items -->
                    <thead>
                        <tr>
                            <th colspan="3">
                                ${record.lines.datecol@label}
                            </th>
                            <th colspan="9">
                                ${record.lines.description@label}
                            </th>
                            <th colspan="3">
                                Aging
                            </th>
                            <th colspan="4" align="right">
                                Amount
                            </th>
                            <th colspan="4" align="right">
                                Allocated<br />Amount
                            </th>
                            <th colspan="4" align="right">
                                ${record.lines.balance@label}
                            </th>
                            <th colspan="4" align="right">Cumulative</th>
                        </tr>
                    </thead>

                    <#list record.lines as line>

                      <!-- HANDLE EACH TRANSACTION SEPARATELY -->
                      <!-- find Transaction Type -->
                      <#assign transactionDetails = parseTransactionData(line.description) />

                      <#if transactionDetails.type == "Balance Forward">
                        
                      <#elseif transactionDetails.type == "Invoice">

                        <!-- currency symbol is a must -->
                        <#assign currencySymbol = line.charge?substring(0, 1)>

                        <!-- find original amount to be placed in "Amount" column -->
                        <#assign amountString = line.charge?substring(1)?replace(",", "")>
                        <#assign origamount = amountString?number>

                        <!-- find paid amount to be placed in "Allocated Amount" column -->
                        <#if line.amountremaining?length != 0>
                          <#assign amountString = line.amountremaining?substring(1)?replace(",", "")>
                          <#assign remainingAmount = amountString?number>
                        <#else>
                          <#assign remainingAmount = 0 />                        
                        </#if>
                        <!-- Allocated amount = origamount - remainingAmount -->
                        <#assign allocamount = origamount - remainingAmount />   

                        <!-- find open balance per transaction to be placed in "Balance" column -->
                        <#assign tranbalance = origamount - allocamount />

                          
                      <#elseif transactionDetails.type == "Credit Memo">

                        <!-- currency symbol is a must -->
                        <#assign currencySymbol = line.payment?substring(0, 1)>

                        <!-- find original amount to be placed in "Amount" column -->
                        <#assign amountString = line.payment?substring(1)?replace(",", "")>
                        <#assign origamount = amountString?number * -1>

                        <!-- find paid amount to be placed in "Allocated Amount" column -->
                        <#if line.amountremaining?length != 0>
                          <#assign amountString = line.amountremaining?substring(1)?replace(",", "")>
                          <#assign remainingAmount = amountString?number * -1>
                        <#else>
                          <#assign remainingAmount = 0 />                        
                        </#if>
                        <!-- Allocated amount = origamount - remainingAmount -->
                        <#assign allocamount = origamount - remainingAmount />   

                        <!-- find open balance per transaction to be placed in "Balance" column -->
                        <#assign tranbalance = origamount - allocamount />
                                                  
                        
                      <#elseif transactionDetails.type == "Payment">
                       
                        <!-- currency symbol is a must -->
                        <#assign currencySymbol = line.payment?substring(0, 1)>

                        <!-- find original amount to be placed in "Amount" column -->
                        <#assign amountString = line.payment?substring(1)?replace(",", "")>
                        <#assign origamount = amountString?number * -1>

                        <!-- find paid amount to be placed in "Allocated Amount" column -->
                        <#if line.amountremaining?length != 0>
                          <#assign amountString = line.amountremaining?substring(1)?replace(",", "")>
                          <#assign remainingAmount = amountString?number * -1>
                        <#else>
                          <#assign remainingAmount = 0 />                        
                        </#if>
                        <!-- Allocated amount = origamount - remainingAmount -->
                        <#assign allocamount = origamount - remainingAmount />   

                        <!-- find open balance per transaction to be placed in "Balance" column -->
                        <#assign tranbalance = origamount - allocamount />
                          

                      <#elseif transactionDetails.type == "Customer Refund">

                        <!-- currency symbol is a must -->
                        <#assign currencySymbol = line.charge?substring(0, 1)>

                        <!-- find original amount to be placed in "Amount" column -->
                        <#assign amountString = line.charge?substring(1)?replace(",", "")>
                        <#assign origamount = amountString?number * -1>

                        <!-- find paid amount to be placed in "Allocated Amount" column -->
                        <#if line.amountremaining?length != 0>
                          <#assign amountString = line.amountremaining?substring(1)?replace(",", "")>
                          <#assign remainingAmount = amountString?number * -1>
                        <#else>
                          <#assign remainingAmount = 0 />                        
                        </#if>
                        <!-- Allocated amount = origamount - remainingAmount -->
                        <#assign allocamount = origamount - remainingAmount />   

                        <!-- find open balance per transaction to be placed in "Balance" column -->
                        <#assign tranbalance = origamount - allocamount />
                        
                      <#elseif transactionDetails.type == "Deposit">

                        <!-- currency symbol is a must -->
                        <#assign currencySymbol = line.payment?substring(0, 1)>

                        <!-- find original amount to be placed in "Amount" column -->
                        <#assign amountString = line.payment?substring(1)?replace(",", "")>
                        <#assign origamount = amountString?number * -1>

                        <!-- find paid amount to be placed in "Allocated Amount" column -->
                        <#if line.amountremaining?length != 0>
                          <#assign amountString = line.amountremaining?substring(1)?replace(",", "")>
                          <#assign remainingAmount = amountString?number * -1>
                        <#else>
                          <#assign remainingAmount = 0 />                        
                        </#if>
                        <!-- Allocated amount = origamount - remainingAmount -->
                        <#assign allocamount = origamount - remainingAmount />   

                        <!-- find open balance per transaction to be placed in "Balance" column -->
                        <#assign tranbalance = origamount - allocamount />

                        
                      <#elseif transactionDetails.type == "Customer Deposit">
                      <#elseif transactionDetails.type == "Journal">

                        <!-- currency symbol is a must -->
                        <#assign currencySymbol = line.charge?substring(0, 1)>

                        <!-- find original amount to be placed in "Amount" column -->
                        <#assign amountString = line.charge?substring(1)?replace(",", "")>
                        <#assign origamount = amountString?number>

                        <!-- find paid amount to be placed in "Allocated Amount" column -->
                        <#if line.amountremaining?length != 0>
                          <#assign amountString = line.amountremaining?substring(1)?replace(",", "")>
                          <#assign remainingAmount = amountString?number>
                        <#else>
                          <#assign remainingAmount = 0 />                        
                        </#if>
                        <!-- Allocated amount = origamount - remainingAmount -->
                        <#assign allocamount = origamount - remainingAmount />   

                        <!-- find open balance per transaction to be placed in "Balance" column -->
                        <#assign tranbalance = origamount - allocamount />

                        
                      </#if>

                      <#if line_index == 0>

                        <#if transactionDetails.type == "Balance Forward">
                          <#assign cumulative = line.balance?substring(1)?replace(",", "")?number />
                        <#else>
                          <#if line.balance?length != 0>
                            <#assign cumulative = tranbalance />
                          <#else>
                            <#assign cumulative = 0 />
                          </#if>
                        </#if>

                      <#else>
                        <#assign cumulative = cumulative + tranbalance />
                      </#if>
              
                        <tr>
                            <td colspan="3">
                                ${line.datecol?string['dd-MMM-YYYY']}
                            </td>
                            <td colspan="9">
                                ${line.description}
                            </td>
                            <td colspan="3"> <!-- AGING COLUMN -->
                               
                              <#if line.description != "Balance Forward"> 
                                <#if tranbalance != 0>
                                  <#if line.duedate?string != "">
                                    <#if record.trandate?string != "">
                                      ${((record.trandate?date?long - line.duedate?date?long) / (1000*60*60*24))?int}
                                    </#if>
                                  <#else>
                                    <#if line.datecol?string != "">
                                      <#if record.trandate?string != "">
                                        ${((record.trandate?date?long - line.datecol?date?long) / (1000*60*60*24))?int}
                                      </#if>
                                    </#if>  
                                  </#if>
                                </#if>
                              </#if>
                                       
                            </td>
                            <td colspan="4" align="right"> <!-- AMOUNT COLUMN -->
                              <#if line.description != "Balance Forward">
                                <#if transactionDetails.type == "Invoice">
                                  ${currencySymbol}${formatNumber(origamount)}
                                <#elseif transactionDetails.type == "Payment">
                                  ${currencySymbol}${formatNumber(origamount)}
                                <#elseif transactionDetails.type == "Customer Refund">
                                  ${currencySymbol}${formatNumber(origamount)}
                                <#elseif transactionDetails.type == "Journal">
                                  ${currencySymbol}${formatNumber(origamount)}
                                <#elseif transactionDetails.type == "Deposit">
                                  ${currencySymbol}${formatNumber(origamount)}
                                <#elseif transactionDetails.type == "Credit Memo">
                                  ${currencySymbol}${formatNumber(origamount)}
                                <#else>
                                  ${line.charge}
                                </#if>
                              </#if>
                                  
                            </td>
                            <td colspan="4" align="right"> <!-- ALLOCATED AMOUNT COLUMN -->
                              <#if line.description != "Balance Forward">
                              <#if transactionDetails.type == "Invoice">
                                ${currencySymbol}${formatNumber(allocamount)}
                              <#elseif transactionDetails.type == "Payment">
                                ${currencySymbol}${formatNumber(allocamount)}
                              <#elseif transactionDetails.type == "Customer Refund">
                                ${currencySymbol}${formatNumber(allocamount)}
                              <#elseif transactionDetails.type == "Journal">
                                ${currencySymbol}${formatNumber(allocamount)}
                              <#elseif transactionDetails.type == "Deposit">
                                ${currencySymbol}${formatNumber(allocamount)}
                              <#elseif transactionDetails.type == "Credit Memo">
                                ${currencySymbol}${formatNumber(allocamount)}
                              <#else>
                                <#if line.payment?string != "">
                                  <#if line.payment gt 0>
                                    ${line.payment*-1}
                                  <#elseif line.payment lt 0>
                                    ${line.payment}
                                  </#if>
                                </#if>
                              </#if>
                              </#if>
                              
                            </td>
                            <td colspan="4" align="right"> <!-- BALANCE COLUMN -->
                              <#if line.description != "Balance Forward">
                              <#if transactionDetails.type == "Invoice">
                                ${currencySymbol}${formatNumber(tranbalance)}
                              <#elseif transactionDetails.type == "Payment">
                                ${currencySymbol}${formatNumber(tranbalance)}
                              <#elseif transactionDetails.type == "Customer Refund">
                                ${currencySymbol}${formatNumber(tranbalance)}
                              <#elseif transactionDetails.type == "Journal">
                                ${currencySymbol}${formatNumber(tranbalance)}
                              <#elseif transactionDetails.type == "Deposit">
                                ${currencySymbol}${formatNumber(tranbalance)}
                              <#elseif transactionDetails.type == "Credit Memo">
                                ${currencySymbol}${formatNumber(tranbalance)}
                              <#else>
                                ${line.charge}-${line.payment}-${line.amountremaining}
                              </#if>
                              </#if>  
                            </td>
                            <td colspan="4" align="right"> <!-- CUMULATIVE COLUMN -->
                              ${currencySymbol}${formatNumber(cumulative)}
                            </td>
                        </tr>
                    </#list>
                </table>
                <table class="body" style="width: 100%;">
                    <tr>
                        <th align="right">
                            ${record.amountDue@label}
                        </th>
                    </tr>
                    <tr>
                        <td align="right">
                            ${record.amountDue}
                        </td>
                    </tr>
                </table>

                <#if preferences.RETURNFORM && remittanceSlip??>
                    <hr />
                    <div class="remittanceSlip">&nbsp;</div>
                </#if>
            </body>

    </pdf>
    <#else>
        <pdf>

            <head>
            </head>

            <body>
                <p>Multi currency customer setting was detected. Please use Multi Currency Advanced Printing Template</p>
            </body>
        </pdf>
</#if>