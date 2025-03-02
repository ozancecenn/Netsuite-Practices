<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
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
    <style>
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

.container {
  display: grid;   /*Use flexbox for easy side-by-side layout */
  grid-template-columns: repeat(4, 2in);
  grid-auto-flow: column;
  width: 100%; 
  /*flex-direction: row;*/
}

.table-container {
  margin: 0 0px; 
  border: 1px solid black;
  width: 2in;
  height: 1in;
}
          
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0px;
  align:center; 
  vertical-align: middle; 
/*  font-size: 9px; */
}

.company-name {
  font-size: 9px !important;
}

.label-price {
  font-size: 12px !important;
  font-weight: bold;
}

.label-name {
  font-size: 9px !important;
}

.order-code {
  font-size: 9px !important;
  font-weight: bold;
}

.company-url {
  font-size: 4.5px !important;
}

.uppercase {
  text-transform: uppercase;
}          
          
barcode {
  display: block; 
  margin: 0 auto;  
}
          
.barcode-text { 
    font-size: 9px; 
}          

          
</style>
</head>
      
<body padding="0.5in 0.25in 0.5in 0.25in" size="Letter">
<#if records.data??>
  <#assign  rows = records.data>
<#else>
  <#assign  rows = records>
</#if>

<table>
<#list rows as label>
  <#if label_index % 4 == 0>
    <tr style="width: 100%;"> 
  </#if>
    <td style="width: 25%;">
      <div class="table-container">  
  
        <table> <!--style="margin-top: 5px;"-->
          <tr class="company-name">
            <td><br/><span class="uppercase">${companyinformation.legalname}</span></td> 
          </tr>
          <tr class="label-price">
            <td>${label.price}</td> 
          </tr>
          <tr class="label-name">
            <td><span class="uppercase">${label.name}</span></td> 
          </tr>
          <tr class="order-code">
            <td><strong>Order Code: ${label.item}</strong></td> 
          </tr>
          <tr>
            <td><barcode style="width: 135pt; height: 25pt; align: center;" codetype="code128" showtext="true" value="${label.skuUpcBarcode?html}"></barcode></td>
          </tr>
          <tr class="company-url">
            <td>${companyinformation.url}</td> 
          </tr>
        </table>
      </div>
    </td>

  <#if label_index % 4 == 3></tr> </#if>
</#list>

<#assign labelsToAdd = 0 />    
<#if rows?size < 4>
  <#assign labelsToAdd = 4 - rows?size />

  <#list 1..labelsToAdd as i>
    <td style="width: 25%;">
      <div class="table-container">  
        <table> 
          <tr class="company-name">
            <td>&nbsp;</td> 
          </tr>
          <tr class="label-price">
            <td>&nbsp;</td> 
          </tr>
          <tr class="label-name">
            <td>&nbsp;</td> 
          </tr>
          <tr class="order-code">
            <td>&nbsp;</td> 
          </tr>
          <tr>
            <td>&nbsp;</td>
          </tr>
          <tr class="company-url">
            <td>&nbsp;</td> 
          </tr>
        </table>
      </div>
    </td>
  </#list>

</tr> <!-- close the <tr> line, if there are empty labels to be added, </tr> wont be closed below -->
</#if>
    
<#if (rows?size % 4) != 0 && labelsToAdd = 0></tr></#if>
</table>
  
</body>
</pdf>