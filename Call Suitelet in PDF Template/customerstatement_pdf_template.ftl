<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdfset>
    <#if statements?has_content>
        <#list statements as statement>
        <pdf>
        <head>
            <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
            <#if .locale == "zh_CN">
                <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
            <#elseif .locale == "zh_TW">
                <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
            <#elseif .locale == "ja_JP">
                <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
            <#elseif .locale == "ko_KR">
                <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
            <#elseif .locale == "th_TH">
                <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />
            </#if>

            <macrolist>
                <macro id="nlheader">
                    <table class="header" style="width: 100.001%; height: 120.92px;">
                        <tr style="height: 102.257px;">
                            <td style="width: 33.3792%;" rowspan="2"><@filecabinet nstype="image" style="float: left; margin: 7px;" src="${companyInformation.logoUrl}" width="150" height="75" /></td>
                            <td style="height: 120.92px; width: 33.3792%;" rowspan="2"><span class="nameandaddress">${companyInformation.companyName}</span><br /><span class="nameandaddress">${companyInformation.addressText}</span></td>
                            <td style="height: 102.257px; width: 33.3792%;" align="right"><span class="title">${record@title}</span></td>
                        </tr>
                        <tr style="height: 18.6632px;">
                            <td style="height: 18.6632px; width: 33.3792%;" align="right"></td>
                        </tr>
                    </table>

                </macro>
                <macro id="nlfooter">     
                    <table class="footer" style="width: 100%;">
                        <tr>
                            <td align="right"><pagenumber/> of <totalpages/></td>
                        </tr>  
                    </table>
                </macro>
            </macrolist>

            <style type="text/css">
                * {
                    <#if .locale == "zh_CN">
                        font-family: NotoSans, NotoSansCJKsc, sans-serif;
                    <#elseif .locale == "zh_TW">
                        font-family: NotoSans, NotoSansCJKtc, sans-serif;
                    <#elseif .locale == "ja_JP">
                        font-family: NotoSans, NotoSansCJKjp, sans-serif;
                    <#elseif .locale == "ko_KR">
                        font-family: NotoSans, NotoSansCJKkr, sans-serif;
                    <#elseif .locale == "th_TH">
                        font-family: NotoSans, NotoSansThai, sans-serif;
                    <#else>
                        font-family: NotoSans, sans-serif;
                    </#if>
                }
                table {
                    font-size: 9pt;
                    table-layout: fixed;
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
                td p { align:left }
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
                    font-weight: bold;
                    font-size: 8pt;
                    padding-top: 6px;
                    padding-bottom: 2px;
                }
                td.address {
                    padding-top: 0;
                }
                span.title {
                    font-size: 28pt;
                }
                span.number {
                    font-size: 16pt;
                }
                div.remittanceSlip {
                    width: 100%;
                    /* To ensure minimal height of remittance slip */
                    height: 200pt;
                    page-break-inside: avoid;
                    page-break-after: avoid;
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
        <body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter-LANDSCAPE">
        
            <table style="width: 100%; margin-top: 10px; height: 31.7014px;">
            <tr style="height: 14.9132px;">
            <td class="addressheader" style="height: 14.9132px;" colspan="3">${statement.billaddress@label}</td>
            </tr>
            <tr style="height: 16.7882px;">
            <td class="address" style="height: 16.7882px;" colspan="3">${statement.billaddress}</td>
            <td align="right" class="address" style="height: 16.7882px;" colspan="3">${statement.trandate}</td>
            </tr>
            </table>
        
        <table class="body" style="width: 100%;">
            <tr>
            <th align="right">${statement.amountDue@label}</th>
            </tr>
            <tr>
                <td align="right">${statement.amountDue}</td>
            </tr>
        </table>

        <#assign general_currency = statement.amountDue?split(" ")[0] />

        
        <#function extractFloat(input)>
        <#if input?trim?length gt 0>
            <#assign inputset = input?split(" ")>
            <#assign value    = inputset[1]>
        <#--      <#return value?replace(",", "")?replace(".", "")?trim?number / 100>  -->
            <#assign uglyNum = value?replace(",", "")?replace(".", "")?trim?number / 100 /> 
            <#return uglyNum?string("0.00")?number > 

        <#else>
            <#return 0.00>
        </#if>
        </#function>

        <#function formatNumber(number)>
        <#assign number_str = number?string("0.00") />

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
        <#return returnResult />
        </#function>
            
        <#assign total_charge = 0.00 />
        <#assign total_payment = 0.00 />
        <#assign total_amount = 0.00 />
        <#assign total_amount_base = 0.00 />

        <#if statement.lines?has_content>
            <table class="itemtable" style="width: 100%; margin-top: 10px;"><!-- start items --> 
                <#list statement.lines as line> 
                <#if line_index==0>
                    <thead>
                        <tr>
                            <th colspan="4">${line.datecol@label}</th>
                            <th colspan="8">${line.description@label}</th>
                            <th colspan="4" align="right">${line.charge@label}</th>
                            <th colspan="4" align="right">${line.payment@label}</th>
                            <th colspan="4" align="right">${line.balance@label}</th>
                            <th colspan="4" align="right">${line.amountremaining@label}</th>
                            <th colspan="4" align="right">Open Amount €</th>
                        </tr>
                    </thead>
                    
                    <!-- do only once -->
                    <#assign base_currency = "0" />  
                    
                </#if>

                    <tr>
                    <#if line_index != 0>

                        <#assign args = line.description?split("#") />
                        <#assign _suiteletURL=("<suiteletExternalLink>&tranid="+args[1]+"&type="+args[0])/>
                        <#include _suiteletURL />  

                    <!-- CALCULATE TOTALS -->

                        <#assign total_charge = total_charge + extractFloat(line.charge) />
                        <#assign total_payment = total_payment + extractFloat(line.payment) />
                        <#assign total_amount = total_amount + extractFloat(line.amountremaining) />
                        <#assign total_amount_base = total_amount_base + extractFloat(amountLine.amount) />

                        <!-- do only once -->
                        <#if base_currency = "0">
                            <#assign base_currency = amountLine.currency />
                        </#if>
                    
                    </#if>
                    
                        <td colspan="4">${line.datecol}</td>
                        <td colspan="8">${line.description}</td>
                        <td colspan="4" align="right">${line.charge}</td>
                        <td colspan="4" align="right">${line.payment}</td>
                        <td colspan="4" align="right">${line.balance}</td>
                        <td colspan="4" align="right">${line.amountremaining}</td>

                        <#if line_index != 0>
                        <td colspan="4" align="right">${amountLine.amount}</td>
                        </#if>

                    </tr>
                </#list><!-- end items -->
            </table>
        
        <table class="aging" style="width: 100%; margin-top: 10px;">
        
            <tr>
                <th colspan="4">&nbsp;</th>
                <th colspan="8">&nbsp;</th>
                <th colspan="4" align="right">Total Charge</th>
                <th colspan="4" align="right">Total Payment</th>
                <th colspan="4" align="right">&nbsp;</th>
                <th colspan="4" align="right">Total Amount</th>
                <th colspan="4" align="right">Total Amount €</th>
            </tr>
            
            <tr>
                <td colspan="4">&nbsp;</td>
                <td colspan="8">&nbsp;</td>
            
                <#if total_charge != 0>
                <td colspan="4" align="right">${general_currency} ${formatNumber(total_charge)}</td>
                <#else>
                <td colspan="4" align="right">&nbsp;</td>
                </#if>
                
                <#if total_payment != 0>
                <td colspan="4" align="right">${general_currency} ${formatNumber(total_payment)}</td>
                <#else>
                <td colspan="4" align="right">&nbsp;</td>  
                </#if>
                
                <td colspan="4" align="right">&nbsp;</td>
                <#if total_amount != 0>
                <td colspan="4" align="right">${general_currency} ${formatNumber(total_amount)}</td>
                <#else>
                <td colspan="4" align="right">&nbsp;</td>  
                </#if>
                <#if total_amount_base != 0>
                <td colspan="4" align="right">${base_currency} ${formatNumber(total_amount_base)}</td>
                <#else>
                <td colspan="4" align="right">&nbsp;</td>  
                </#if>

            </tr>
            
        </table>
        
    </#if> 

    <#if preferences.RETURNFORM && remittanceSlip??>
        <hr />

        <div class="remittanceSlip">
            <table style="width: 100%; margin-top: 10px;">
                <tr>
                    <td><span class="nameandaddress">${companyInformation.companyName}</span></td>
                    <td align="right"><span class="number">${remittanceSlip@title}</span></td>
                </tr>
            </table>
            <table style="width: 100%; margin-top: 10px;">
                <tr>
                    <th>${remittanceSlip.customername@label}</th>
                    <th>${statement.trandate@label}</th>
                    <th>${statement.amountDue@label}</th>
                    <th>${remittanceSlip.amountPaid@label}</th>
                </tr>
                <tr>
                    <td>${companyInformation.addressText}</td>
                    <td>${statement.trandate}</td>
                    <td align="right">${statement.amountDue}</td>
                    <td>&nbsp;</td>
                </tr>
            </table>
            <table style="width: 100%;">
                <tr>
                    <th>${remittanceSlip.ccinfo@label}</th>
                    <th>${remittanceSlip.companyaddress@label}</th>
                </tr>
                <tr>
                    <td>${remittanceSlip.ccinfo}</td>
                    <td>${companyInformation.addressText}</td>
                </tr>
            </table>
        </div>
    </#if>
        </body>
        </pdf>
        </#list>
        <#else>
            <pdf>
            <head>
            </head>
            <body>
                <p>Please use Single Currency Advanced Printing Template</p>
            </body>
        </pdf>
    </#if>
</pdfset>