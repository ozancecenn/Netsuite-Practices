/**
 * The RESTlet only supports 'GET' requests.
 * Possible parameters:
 * vendor=<id>
 * folder=<id>
 * file=<id>
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/file', 'N/search'],
    /**
 * @param{file} file
 * @param{search} search
 */
    (file, search) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {

            log.debug("requestParams", JSON.stringify(requestParams.folder));
            log.debug("requestParams", JSON.stringify(requestParams.file));
            log.debug("requestParams", JSON.stringify(requestParams.vendor));
            log.debug("requestParams", JSON.stringify(requestParams.offset));
            log.debug("requestParams", JSON.stringify(requestParams.limit));

            //  default initialization
            let offset = 0;
            let limit = 1000;
            let itemList = [];

            //  object to be returned as JSON string
            let returnObj = {
                "count"     : 0,
                "totalResults": 0,
                "hasMore"   : false,
                "items"     : [],
                "error"     : false,
                "message"   : ""
            };

            if(requestParams.offset && parseInt(requestParams.offset) >= 0){
                offset = parseInt(requestParams.offset);
            }
            if(requestParams.limit && parseInt(requestParams.limit) < 1000){
                limit = parseInt(requestParams.limit);
            }

            try{
                //  &vendor={id}
                if(requestParams.vendor){            // return folder contents per vendor

                    const vendorId = requestParams.vendor;
                    itemList = getFolderContentsPerVendor(vendorId);
                    if(offset > itemList.length){
                        returnObj.error     = true;
                        returnObj.message   = `The offset (${offset}) is out of total index (${itemList.length}).`;
                        returnObj.hasMore   = true;
                    }
                    else{
                        const slicedList = itemList.slice(offset, (offset + limit));
                        returnObj.items     = slicedList;
                        log.debug("end of list?", itemList[-1] != slicedList[-1]);
                        log.debug("itemList[-1]", itemList.slice(-1)[0]);
                        log.debug("slicedList[-1]", slicedList.slice(-1)[0]);
                        
                        returnObj.hasMore   = itemList.slice(-1)[0] != slicedList.slice(-1)[0];//itemList.length > slicedList.length;
                        returnObj.totalResults = itemList.length;
                        returnObj.count     = slicedList.length;
                    }
                    
                    return JSON.stringify(returnObj);
                }

                //  &folder={id}
                else if(requestParams.folder){       // return folder contents

                    const folderId = parseInt(requestParams.folder);
                    itemList = getFolderContents(folderId);
                    if(offset > itemList.length){
                        returnObj.error     = true;
                        returnObj.message   = `The offset (${offset}) is out of total index (${itemList.length}).`;
                        returnObj.hasMore   = true;
                    }
                    else{
                        const slicedList = itemList.slice(offset, (offset + limit));
                        returnObj.items     = slicedList;
                        returnObj.hasMore   = itemList[-1] != slicedList[-1];
                        returnObj.totalResults = itemList.length;
                        returnObj.count     = slicedList.length;
                    }

                    return JSON.stringify(returnObj);

                }

                //  &file={id}
                else if(requestParams.file){    // return file contents

                    const fileId = parseInt(requestParams.file);
                    returnObj.items.push(getFileContents(fileId));
                    returnObj.hasMore   = false;
                    returnObj.count     = 1;
                    returnObj.totalResults = 1;

                    return JSON.stringify(returnObj);
                    
                }


            }
            catch(ex){

                log.error("Error at getInputData", ex.message);
                return ex.message;

            }

        }



        /**
         * 
         * @param {string} vendorId 
         * @returns {List}
         */
        const getFolderContentsPerVendor = (vendorId) => {

            let results = [];

            const transactionSearchFilters = [
                ['mainline', 'is', 'T'],
                'AND',
                ['vendor.internalid', 'anyof', vendorId],
                'AND',
                ['file.name', 'isnotempty', '']
            ];

            const transactionSearchColTransactionNumber = search.createColumn({ name: 'transactionnumber' });
            const transactionSearchColResourceVendorInternalId = search.createColumn({ name: 'internalid', join: 'vendor' });
            const transactionSearchColResourceVendorAltName = search.createColumn({ name: 'altname', join: 'vendor' });
            const transactionSearchColFileName = search.createColumn({ name: 'name', join: 'file' });
            const transactionSearchColFileFolder = search.createColumn({ name: 'folder', join: 'file' });
            const transactionSearchColFileSizeKB = search.createColumn({ name: 'documentsize', join: 'file' });
            const transactionSearchColFileURL = search.createColumn({ name: 'url', join: 'file' });
            const transactionSearchColFileDateCreated = search.createColumn({ name: 'created', join: 'file' });
            const transactionSearchColFileLastModified = search.createColumn({ name: 'modified', join: 'file' });
            const transactionSearchColFileType = search.createColumn({ name: 'filetype', join: 'file' });

            const transactionSearch = search.create({
                type: 'transaction',
                filters: transactionSearchFilters,
                columns: [
                    transactionSearchColTransactionNumber,
                    transactionSearchColResourceVendorInternalId,
                    transactionSearchColResourceVendorAltName,
                    transactionSearchColFileName,
                    transactionSearchColFileFolder,
                    transactionSearchColFileSizeKB,
                    transactionSearchColFileURL,
                    transactionSearchColFileDateCreated,
                    transactionSearchColFileLastModified,
                    transactionSearchColFileType
                ]
            });

            // Get the search results with pagination
            const pagedData = transactionSearch.runPaged({
                pageSize: 1000 
            });


            if(pagedData != null){
                //log.debug("pagedData", JSON.stringify(pagedData));

                pagedData.pageRanges.forEach(function(pageRange){

                    // page indexing
                    let page = pagedData.fetch({
                        index: pageRange.index
                    });
    
                    // Iterate through rows in the page
                    page.data.forEach(function(result){
                        //log.debug(debugtitle, `result = ${JSON.stringify(result)}`);
                        results = results.concat(result);
                    });

                });

            }
            log.debug("results", "results list is populated.");

            return results;

        }


        /**
         * 
         * @param {int} folderId 
         * @returns {List}
         */
        const getFolderContents = (folderId) => {

            let results = [];

            const fileSearchFilters = [
                ['folder', 'anyof', folderId],
                'AND',
                ['name', 'contains', '.pdf'],
            ];
            
            const fileSearchColName = search.createColumn({ name: 'name', sort: search.Sort.ASC });
            const fileSearchColFolder = search.createColumn({ name: 'folder' });
            const fileSearchColSizeKB = search.createColumn({ name: 'documentsize' });
            const fileSearchColURL = search.createColumn({ name: 'url' });
            const fileSearchColDateCreated = search.createColumn({ name: 'created' });
            const fileSearchColLastModified = search.createColumn({ name: 'modified' });
            const fileSearchColType = search.createColumn({ name: 'filetype' });
            
            log.debug("fileSearch", "columns are created.");

            const fileSearch = search.create({
                type: 'file',
                filters: fileSearchFilters,
                columns: [
                    fileSearchColName,
                    fileSearchColFolder,
                    fileSearchColSizeKB,
                    fileSearchColURL,
                    fileSearchColDateCreated,
                    fileSearchColLastModified,
                    fileSearchColType,
                ],
            });

            // Get the search results with pagination
            const pagedData = fileSearch.runPaged({
                pageSize: 1000 
            });


            if(pagedData != null){
                //log.debug("pagedData", JSON.stringify(pagedData));

                pagedData.pageRanges.forEach(function(pageRange){

                    // page indexing
                    let page = pagedData.fetch({
                        index: pageRange.index
                    });
    
                    // Iterate through rows in the page
                    page.data.forEach(function(result){
                        //log.debug(debugtitle, `result = ${JSON.stringify(result)}`);
                        results = results.concat(result);
                    });

                });

            }
            log.debug("results", "results list is populated.");

            return results;

        }




        /**
         * 
         * @param {int} fileId 
         * @returns {string}
         */
        const getFileContents = (fileId) => {

            const fileObj = file.load({
                id: fileId
            });

            log.debug("fileObj", JSON.stringify(fileObj));

            if (fileObj.size < 10485760){
                return fileObj.getContents();
            }

            return null;

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

        }

        return {get, put, post, delete: doDelete}

    });
