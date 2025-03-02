Instructions
----------------------

* Right-click on the option you would like to hide, and "inspect" html element.

    ![Option to hide](../src/images/hro2.png)

    *   Get html ID. -> remove1href
    ```
    <td class="uir-list-row-cell listtext"><a class="dottedlink" id="remove1href" href="javascript:remove_media(12529);" onclick="setWindowChanged(window, false); ">Remove</a></td>
    ```

* **Create Custom Entity Field:**   Create a new custom entity field, and apply it on record types (in this case we are going to apply it to vendor).

    ![Custom Entity Field](../src/images/hro1.png)

    *   Select Field Type: **Inline HTML**
    *   Store Value = **false**
    *   In Validation/Defaulting tab:
        *   Uncheck "Formula" checkbox 
        *   Add the code into "Default Value":
            ```
                <style>
                #remove1href{
                visibility: hidden;
                display: none;
                }
                </style>
            ```
*   **Save the custom field, and apply it to the forms.**
