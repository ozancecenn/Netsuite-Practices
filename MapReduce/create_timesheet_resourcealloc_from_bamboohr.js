/*
 * See BambooHR API documentation here.
 * https://documentation.bamboohr.com/docs/api-details
 *
 * The script gets PTO/Leave Request details from 3rd Party HR portal, and creates below accordingly:
 * record.Type.RESOURCE_ALLOCATION
 * record.Type.TIME_SHEET
 * 
 */ 
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/encode', 'N/format', 'N/https', 'N/log', 'N/record', 'N/runtime', 'N/search'],
    /**
 * @param{encode} encode
 * @param{format} format
 * @param{https} https
 * @param{log} log
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (encode, format, https, log, record, runtime, search) => {

        const projectMappingTable = {

            "Annual Leave  UK": "1704",
            "Annual Leave UK": "1704",
            "Annual PTO (US)": "1704",
            "Compassionate Leave": "1686",
            "Discretionary Time": "1702",
            "Family Care (US)": "1916",
            "Jury Service": "1703",
            "KIT days (UK)": "1917",
            "Maternity Leave UK": "1705",
            "Medical Leave/STD (US)": "1918",
            "Parental Leave (US)": "3446",
            "Paternity Leave UK": "1706",
            "Shared Parental Leave UK": "1913",
            "Sick Leave": "1914",
            "SPLIT days (UK)": "1919",
            "Unpaid (Extended) Leave ": "3445"

        };


        /**
         * Helper function to get previous monday to set it on weekly timesheet
         * @param {String} dateString 
         * @returns {String}
         */
        const getPreviousMonday = (dateString) => {

            const date = new Date(dateString);
            const dayOfWeek = date.getDay();
            log.debug("dayOfWeek", dayOfWeek);

            if (dayOfWeek === 0) { // Check if it's already Monday (0)
                return dateString; // Return the original date string if it's Monday
            } 
            else {
                const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                const previousMonday = new Date(date); // Crucial: Create a copy!
                previousMonday.setDate(date.getDate() - daysToSubtract);
        
                const year = previousMonday.getFullYear();
                const month = String(previousMonday.getMonth() + 1).padStart(2, '0');
                const day = String(previousMonday.getDate()).padStart(2, '0');
        
                return `${year}-${month}-${day}`;
            }      

        }


        /**
         * 
         * @param {Array} dates 
         * @returns {Array}
         */
        const groupDatesByWeek = (dates) => {

            const groupedDates = [];
            const weekMap = new Map(); // Use a Map to store weeks efficiently
        
            dates.forEach(dateString => {
                const date = new Date(dateString);
                let weekNumber = getWeekNumber(date);
        
                // Handle week 53 and week 1 merging
                if (weekNumber === 53 && new Date(date.getFullYear(), 11, 31).getDay() < 4) { //check if the last day of the year is before Thursday
                    weekNumber = 1; // Treat week 53 as week 1 of the next year if the last day of the year is before Thursday
                }
        
                if (!weekMap.has(weekNumber)) {
                    weekMap.set(weekNumber, []);
                }
                weekMap.get(weekNumber).push(dateString);
            });
        
            // Convert Map to array of objects
            weekMap.forEach((dates, week) => {
                groupedDates.push({ week, dates });
            });
        
            // Sort by week number (important after merging)
            groupedDates.sort((a, b) => a.week - b.week);
        
        
            return groupedDates;
        }
          
        
        /**
         * 
         * @param {Date} date 
         * @returns {number}
         */
        const getWeekNumber = (date) => {
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        }
          
          
        /**
         * 
         * @param {String} date1String 
         * @param {String} date2String 
         * @returns {String}
         */
        const dateDifference = (date1String, date2String) => {

            // Create Date objects from the input strings
            const date1 = new Date(date1String);
            const date2 = new Date(date2String);
          
            // Calculate the time difference in milliseconds
            const timeDifference = Math.abs(date1 - date2); 
          
            // Convert milliseconds to days
            const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); 
          
            return daysDifference;

        }


        /**
         * Helper function to format the date as yyyy-MM-dd
         * @param {Date} date 
         * @returns {String}
         */
        const formatDate = (date, format) => {

            if(format == "dd/MM/yyyy"){

                const [year, month, day] = date.split('-');
                return `${day}/${month}/${year}`;
              
            }
            else{

                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;

            }

        }


        /**
         * 
         * @param {String} name 
         * @returns {String}
         */
        const findProjectIdByName = (name) => {

            return projectMappingTable[name] ? projectMappingTable[name] : "1702";

        }


        /**
         * 
         * @param {String} number 
         * @returns {String}
         */
        const findEmployeeIdByNumber = (number) => {

            const employeeSearchFilters = [
                ['entityid', 'is', number]
            ];
                        
            const employeeSearch = search.create({
                type: 'employee',
                filters: employeeSearchFilters,
                columns: [
                    search.createColumn({ name: 'internalid' })
                ]
            });

            const employeeSearchResult = employeeSearch.run().getRange({ start: 0, end: 1 });

            if (employeeSearchResult.length > 0) {

                let empId = employeeSearchResult[0].getValue({ name: 'internalid' });
                // log.debug('Employee ID:', empId);

                return empId;
            }

            return null;

        }


        /**
         * Searches if a time entry is created for the same employee with the same Bamboo PTO id on the same date
         * 
         * @param {String} bambooId 
         * @param {String} employeeId 
         * @param {String} date 
         * @returns {Boolean}
         */
        const checkExistingTimeEntryWithBambooID = (bambooId, employeeId, day) => {

            const timeBillSearchFilters = [
                ['employee', 'anyof', employeeId], // 3452],
                'AND',
                ['date', 'on', formatDate(day, "dd/MM/yyyy")],      //  '22/01/2025'
                'AND',
                ['custcol_acs_bamboohr_pto_id', 'is', bambooId]
            ];

            const timeBillSearch = search.create({
                type: 'timebill',
                filters: timeBillSearchFilters,
                columns: [
                    search.createColumn({ name: 'internalid' })
                ]
            });

            const timeBillSearchResult = timeBillSearch.run().getRange({ start: 0, end: 1 });

            if (timeBillSearchResult.length > 0) {

                return true;
            }
            else{

                return false;
            }

        }


        /**
         * 
         * @param {Object} pto 
         * @returns {String}
         */
        const createTimesheet = (pto) => {

            //  get headers
            const employeeId = findEmployeeIdByNumber(pto.employeeId);
            const projectId = findProjectIdByName(pto.type.name.replace("-", ""));
            const bambooPTOid = pto.id;

            //  list to be returned
            let createdRecords = [];

            //  get active days (keys) where value = "1"
            let datesArray = Object.keys(pto.dates).filter(key => pto.dates[key] === "1");

            const superList = groupDatesByWeek(datesArray);
            log.debug("superList", JSON.stringify(superList));

            //  superList[weeknumber][days] to create weekly timesheet

            //  create timesheet for each sub-array of superList
            superList.forEach(timesheet => {

                log.debug("timesheet", JSON.stringify(timesheet));
                log.debug("timesheet[0]", timesheet.dates[0]);
                
                let monday = getPreviousMonday(timesheet.dates[0]);
                log.debug("createTimesheet/monday", monday);
    
                const startdate = format.parse({
                    value: formatDate(monday, "dd/MM/yyyy"),
                    type: format.Type.DATE
                });
                log.debug("createTimesheet/startdate", startdate);
    
                let timeSheetObj = record.create({
                    type: record.Type.TIME_SHEET,
                    isDynamic: true
                });
    
                //  set headers
                timeSheetObj.setValue("employee", employeeId);
                timeSheetObj.setValue("trandate", startdate);

                //  set sublist values
                timeSheetObj.selectNewLine({
                    sublistId: "timeitem"
                });
                timeSheetObj.setCurrentSublistValue({
                    sublistId: "timeitem",
                    fieldId: "customer",
                    value: projectId
                });
                timeSheetObj.setCurrentSublistValue({
                    sublistId: "timeitem",
                    fieldId: "custcol_acs_bamboohr_pto_id",
                    value: bambooPTOid
                });
                timeSheetObj.setCurrentSublistValue({
                    sublistId: "timeitem",
                    fieldId: "item",
                    value: "164"    //  service item => Management Consultancy Services
                });

                //  enter time for each day
                timesheet.dates.forEach(day => {

                    //  check duplicity here
                    let check = checkExistingTimeEntryWithBambooID(bambooPTOid, employeeId, day);
                    log.debug("check time entry", check);

                    if(check) return;

                    //  calculate the day margin to determine sublist field id
                    let hoursFieldId = `hours${dateDifference(day, monday)}`; //    hours0, hours1, hours2, hours3, hours4, hours5, hours6
                    log.debug("hoursFieldId", hoursFieldId);

                    timeSheetObj.setCurrentSublistValue({
                        sublistId: "timeitem",
                        fieldId: hoursFieldId,
                        value: 8
                    });
    

                });

                //  commmit line
                timeSheetObj.commitLine("timeitem");

                //  save timesheet
                let timesheetId = timeSheetObj.save({
                    ignoreMandatoryFields: true
                });

                createdRecords.push(timesheetId);
    
            });

            return createdRecords;

        }


        /**
         * 
         * @param {String} resource 
         * @param {String} project 
         * @param {String} day 
         * @returns {Boolean}
         */
        const checkExistingResourceAllocation = (resource, project, day) => {

            const resourceAllocationSearchFilters = [
                ['resource', 'anyof', resource],
                'AND',
                ['project', 'anyof', project],
                'AND',
                ['startdate', 'on', formatDate(day, "dd/MM/yyyy")],
                'AND',
                ['enddate', 'on', formatDate(day, "dd/MM/yyyy")]
            ];
            
            const resourceAllocationSearch = search.create({
                type: 'resourceallocation',
                filters: resourceAllocationSearchFilters,
                columns: [
                    
                    search.createColumn({ name: 'internalid' }),
                    search.createColumn({ name: 'startdate' }),
                    search.createColumn({ name: 'enddate' })
                ]
            });

            const resourceAllocationSearchResult = resourceAllocationSearch.run().getRange({ start: 0, end: 1 });

            log.debug("resourceAllocationSearchResult[0]", resourceAllocationSearchResult[0]);

            if(resourceAllocationSearchResult[0]){
                return true;
            }
            else{
                return false;
            }

        }


        /**
         * 
         * @param {Object} pto 
         * @returns {List}
         */
        const createResourceAllocation = (pto) => {

            //  list to be returned
            let createdRecords = [];

            const employeeId = findEmployeeIdByNumber(pto.employeeId);
            const projectId = findProjectIdByName(pto.type.name.replace("-", ""));

            //  set start & end date
            const datesArray = Object.keys(pto.dates).filter(key => pto.dates[key] === "1");

            datesArray.forEach(day => {
                
                //  check if not created per employee, project, date
                let check = checkExistingResourceAllocation(employeeId, projectId, day);
                log.debug(day, `check = ${check}`);

                if(check) return;

                //  create object
                let resAllocObj = record.create({
                    type: record.Type.RESOURCE_ALLOCATION,
                    isDynamic: true
                });

                //  custom form
                resAllocObj.setValue("customform", "361"); //   custom entry form
                
                //  set resource / employee
                resAllocObj.setValue("allocationresource", employeeId);

                //  set project 
                pto.type.name = pto.type.name.replace("-", "");
                resAllocObj.setValue("project", projectId);

                //  set startdate
                const startdate = format.parse({
                    value: formatDate(day, "dd/MM/yyyy"),
                    type: format.Type.DATE
                });
                resAllocObj.setValue("startdate", startdate);

                //  set enddate
                const enddate = format.parse({
                    value: formatDate(day, "dd/MM/yyyy"),
                    type: format.Type.DATE
                });
                resAllocObj.setValue("enddate", enddate);

                //  allocation amount = 8
                resAllocObj.setValue("allocationamount", 8);

                //  allocation type = 2 soft
                resAllocObj.setValue("allocationtype", "2");

                //  notes
                if(pto.notes.employee){
                    resAllocObj.setValue("notes", pto.notes.employee);
                }

                const recordId = resAllocObj.save({
                    ignoreMandatoryFields: true
                });

                createdRecords.push(recordId);

            });
            
            return createdRecords;

        }


        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */
        const getInputData = (inputContext) => {

            const scriptObj = runtime.getCurrentScript();

            //  get connection details from script parameters
            const apiKey = scriptObj.getParameter("custscript_bamboohr_apikey");
            let url = scriptObj.getParameter("custscript_bamboohr_pto_url");

            let auth = `${apiKey}:x`;

            const encodedAuth = encode.convert({
                string: auth,
                inputEncoding: encode.Encoding.UTF_8,
                outputEncoding: encode.Encoding.BASE_64
            });

            log.debug("auth", encodedAuth);

            //  get parameters start/end
            const today = new Date();

            const firstDayPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            const lastDayOfYear = new Date(today.getFullYear(), 11, 31);

            url += `&start=${formatDate(firstDayPreviousMonth, "yyyy-MM-dd")}&end=${formatDate(lastDayOfYear, "yyyy-MM-dd")}`;
            // url += `&start=2024-12-01&end=2024-12-31`;//${formatDate(lastDayPreviousMonth, "yyyy-MM-dd")}`;
            // url += '&employeeId=133'; //   limit respnse.body length = 1

            log.debug("url", url);

            // get via API
            let response = https.get({
                url: url,
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Basic ${encodedAuth}`
                }
            });

            log.debug("response", JSON.parse(response.body).length);

            if(response.code == 200){
                //  loop at response body
                return JSON.parse(response.body);
            }

        }


        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */
        const map = (mapContext) => {

            log.debug("mapContext.value", JSON.stringify(mapContext.value));

            const valueObj = JSON.parse(mapContext.value);

            try{

                //  create time sheet
                const timeSheetId = createTimesheet(valueObj);
                log.debug("Time Sheet", `Created, ID: ${timeSheetId.join(", ")}`);

                //  create resource allocation
                const resAllocId = createResourceAllocation(valueObj);
                log.debug("Resource allocation", `Created, ID: ${resAllocId.join(", ")}`);

            }
            catch(ex){
                log.error("Error at MAP", ex.message);
            }

        }


        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {

        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        return {getInputData, map, reduce, summarize}

    });
