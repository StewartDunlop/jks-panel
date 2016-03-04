# jks-panel
Angular directive for draggable, resizable accordion panel, using code injection with no dependency on jquery.

### TODO
Add some default templates that link to data types that I think might be useful.
Checklist
Time tracking
Notes with weblinks

##### Examples
In your page
    '<div jks-panel paneldata="panelData1"></div>
    <div jks-panel paneldata="panelData2"></div>'

##### In your controller
'
        $scope.panelData1 = {
            // Initial conditions
            id: 'yourPanelId',
            panelleft: 100,
            paneltop: 120,
            width: 700,
            minHeight: 25,
            expandedHeight: 300,
            // height is used internally by the directive
            heading: 'Panel Title',
            accordion: true,        //Clicking on the title bar closes the panel
            draggable: true,        //You can reposition the panel on the screen
            resizable: false,       //You can resize the panel
            isVisibleFlag: true,    //Starting visibility of the panel
            isVisible: function(){  //Function to control whether the panel now visible - allows you to dynamically control visibility
                return ($scope.checkValue1 || $scope.checkValue2);
            },
            isClosable: false,      //Whether the panel can be closed by the user
            showBody: true,         //Starting visibility of the body - if false only the title is visible
            message: {},            //Displays a message under the title
            // Overrides
            charWidth:12,           //Used for dynamically sizing controls of the form
            type : 'create',
            getTemplateUrl: function () {
                return '/path/to/html/template.html';
            },
            // Recalculates the height of panel based on whats being displayed
            recalc: function() {
                var panel = document.getElementById(this.id+'_panel');
                var headerHeight = 0;
                var header = document.getElementById(this.id+'_panelAccordionHeading');
                if (header) {
                    headerHeight = header.offsetHeight;
                }
                var messageHeight = 0;
                var message = document.getElementById(this.id+'_panelMessage');
                if (message) {
                    messageHeight = message.offsetHeight;
                }
                var body = document.getElementById(this.id+'_changeNoteForm');
                var bodyHeight  = 0;
                if (body) {
                    bodyHeight = body.offsetHeight;
                }
                var newHeight = headerHeight + messageHeight + bodyHeight + 20;  // For the Add Char div
                panel.style.height = newHeight+'px';
            },
            otherFunctions: function() {
                if (this.something.value==='something') {
                    this.sensesSomething.value='';
                }
            }
        };
'
