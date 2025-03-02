Instructions
----------------------

*   Place all three scripts into the same folder in FileCabinet.

*   **Deploy** "usereventscript_print_labels.js" and "suitelet_print_template.js" to [Inventory Item](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N3190421.html) and [Sales Order](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N3197103.html).

*   Create script parameters for "suitelet_print_template.js":
    *   Record Type (custscript_recordtype)
    *   Record Id   (custscript_recordid)

*   Create a custom record type "customrecord_acs_adv_pdf_html_templates", and add PDF templates which could print the item labels. (In case multiple templates should be an option with slight differences)
