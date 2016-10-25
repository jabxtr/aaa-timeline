(function (window) {
    function timeLineConstuctor() {
        this.years = 0;
        this.heightPx = 0;

        this.getPixels = function (arrObj, totalY, totalPh) {
            if (!totalPh) {
                var totalPh = window.innerHeight * 4;
            } else {
                var totalPh = totalPh;
            };

            // setting total years on timeline and 
            // total pixel height of time line
            this.years = totalY;
            this.heightPx = totalPh;

            // output pixel data for event placement 
            for (var i = 0; i < arrObj.length; i++) {

                // getting proportional length of event in pixels 
                if (arrObj[i].endDate === null || arrObj[i].startDate == arrObj[i].endDate) {
                    var eventPixels = 50;
                } else if (arrObj[i].endDate === 0) {
                    var eventYears = arrObj[i].startDate - arrObj[i].endDate;
                    var eventPixels = Math.round((eventYears / totalY) * totalPh);
                    var eventPixels = eventPixels + 197;
                } else {
                    var eventYears = arrObj[i].startDate - arrObj[i].endDate;
                    var eventPixels = Math.round((eventYears / totalY) * totalPh);
                }

                arrObj[i].eventPixels = eventPixels + 'px';

                // Getting # pixels from the top of the timeline
                // based on start date 
                var topYears = totalY - arrObj[i].startDate;
                var topPixels = Math.round((topYears / totalY) * totalPh);
                arrObj[i].topPixels = topPixels + 'px';

                // Output the end point of each object, in pixels
                var endPixels = topPixels + eventPixels;
                arrObj[i].endPixels = endPixels + 'px';

            };

            return arrObj;
        };


        // shortening the years to readable version of number with suffix
        var shorten = function (years) {
            var formattedYears;
            switch (true) {

            case (years >= 1000000):
                formattedYears = (years / 1000000) + ' million years ago';
                break;

            case (years && years < 1000000):
                formattedYears = years + ' years ago';
                break;

            case (years === 0):
                formattedYears = 'present day';
                break;

            default:
                formattedYears = null;
            }

            if (arguments[1] == true) {
                formattedYears = parseFloat(formattedYears);
            }

            return formattedYears;
        }

        // Uses shorten to shorten years to readable format 
        this.formatYears = function (arrObj) {
            for (var i = 0; i < arrObj.length; i++) {
                arrObj[i].startDate = arrObj[i].endDate ? shorten(arrObj[i].startDate, true) : shorten(arrObj[i].startDate);
                arrObj[i].endDate = shorten(arrObj[i].endDate);
            }

            //sort items by location on page
            arrObj.sort(function (a, b) {
                if (parseInt(a.topPixels) > parseInt(b.topPixels)) {
                    return 1;
                }
                if (parseInt(a.topPixels) < parseInt(b.topPixels)) {
                    return -1;
                }
                if (parseInt(a.topPixels) === parseInt(b.topPixels)) {
                    if (parseInt(a.endPixels) < parseInt(b.topPixels)) {
                        return -1;
                    }
                    if (parseInt(a.endPixels) > parseInt(b.endPixels)) {
                        return 1;
                    }
                    return 0;
                }
            });

            // compare the date range for objects
            // to determine overlap
            for (var arrObjIndex = 0; arrObj.length > arrObjIndex + 1; arrObjIndex++) {

                compare(arrObj[arrObjIndex], arrObj[arrObjIndex + 1]);

            };

            return arrObj;
        }

    };

    // Determine offset for overlapping items 
    function compare(a, b) {

        a.topPixelsN = parseInt(a.topPixels);
        a.endPixelsN = parseInt(a.endPixels);
        b.topPixelsN = parseInt(b.topPixels);
        b.endPixelsN = parseInt(b.endPixels);

        // test: is b overlapping a
        function overlapTest(object1, object2) {

            if (object1.topPixelsN > object2.endPixelsN || object1.endPixelsN < object2.topPixelsN) {
                return false;
            } else {
                return true;
            }
        };

        // test: does b overlap any other objects 
        function overlappingFilter(a, b) {

            // creating overlappingObjs if none exists
            if (!a.overlappingObjs) a.overlappingObjs = [];
            if (!b.overlappingObjs) b.overlappingObjs = [];


            for (var overlappingObjIndex = 0; overlappingObjIndex < a.overlappingObjs.length; overlappingObjIndex++) {

                var currentObj = a.overlappingObjs[overlappingObjIndex];

                var result = overlapTest(currentObj, b);

                if (result) {
                    //currentObj = a.overlappingObjs;
                    b.overlappingObjs.push(currentObj);
                }
            }
        };

        var abTestResult = overlapTest(a, b);
        if (abTestResult) {
            // if a and b overlap, do this

            // push a to overlapping objs property on b
            b.overlappingObjs = [];
            b.overlappingObjs.push(a);;

            // test if any other objects overlap with b 
            // and remove them if they don't

            overlappingFilter(a, b);

            // create overlapping lvl property on b and
            // give appropriate lvl
            b.overlappingLvl = b.overlappingObjs.length;

            // create class property on b
            // assign overlapping class + overlapping lvl
            b.class = 'overlapping' + b.overlappingLvl;

        } else {
            //if a and b do not overlap, do this

            // create class property on a (if none)     
            if (!a.class) {
                a.class = 'notOverlapping';
            }

            // determine if b is overlapping with any of the 
            // objects that a is overlapping with
            //     -take any objects b is not overlapping with 
            //     out of the overlapping objs array
            //     -get new array length

            overlappingFilter(a, b);

            // create class property on b

            b.overlappingLvl = b.overlappingObjs.length;

            if (b.overlappingObjs.length) {
                b.class = 'overlapping' + b.overlappingLvl;
            } else {
                b.class = 'notoverlap';
            }
            //     give class 'notOverlapping' or 'overlapping' + 
            //     new overlapping objs array length for b
        };

    };





    function createFromTemplates(jsonData) {

        //loop through array
        $.each(jsonData, function (index, obj) {

            //change title to lower case 
            //for use as class name in scale items
            var titleClass = (obj.name).toLowerCase();

            // combine dates into single variable
            // to make styling easier 
            var endDate = parseInt(obj.endDate);
            var startDate = parseInt(obj.startDate);

            if (endDate > 0100 && startDate < 100) {
                var date = obj.startDate + ' million - ' + obj.endDate;

            } else if (startDate == endDate) {
                var date = obj.startDate + ' million years ago';

            } else if (obj.endDate === null) {
                var date = obj.startDate;

            } else {
                var date = obj.startDate + ' - ' + obj.endDate;
            };

            //revert to 0 (aka top of page) if earliest date is before the start of the timeline 
            if (parseInt(obj.topPixels) < 0) {
                var backToZero = 0;
                var newEventPixels = parseInt(obj.eventPixels) + parseInt(obj.topPixels);

                obj.topPixels = backToZero + 'px';
                obj.eventPixels = newEventPixels;
            };

            // plug objects into template 
            listEvents +=
                template.replace(/{{eventType}}/ig, obj.eventType)
                .replace(/{{location}}/ig, obj.location)
                .replace(/{{period}}/ig, obj.period)
                .replace(/{{epoch}}/ig, obj.epoch)
                .replace(/{{age}}/ig, obj.age)
                .replace(/{{index}}/ig, index)
                .replace(/{{img}}/ig, obj.eventImage)
                .replace(/{{name}}/ig, obj.name)
                .replace(/{{startEndDate}}/ig, date)
                .replace(/{{desc}}/ig, obj.desc)
                .replace(/{{top}}/ig, obj.topPixels)
                .replace(/{{eventPixels}}/ig, obj.eventPixels)
                .replace(/{{class}}/ig, obj.class)
                .replace(/{{titleClass}}/ig, titleClass);
        })

    };


    window.timeLineConstructor = new timeLineConstuctor();
    window.compare = compare;
    window.createFromTemplates = createFromTemplates;

})(window)