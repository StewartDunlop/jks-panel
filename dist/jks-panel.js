/**
 * Created by Stew on 29-Feb-16.
 */
/**
 * Created by stewartdunlop on 11/12/2015.
 */
'use strict';
/*jshint multistr: true */
angular.module('jks-panel', [])
    .directive('jksPanel', ['$document', function ($document) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                paneldata: '='
            },
            // The panel holds the positioning and size controls
            template: '<div id="{{paneldata.id}}_panel" class="jks_panel" ng-show="paneldata.isVisible()" style="left:{{paneldata.panelleft}}px; top:{{paneldata.paneltop}}px; width:{{paneldata.width}}px; height:{{paneldata.height}}px">\
                <div id="{{paneldata.id}}_panelAccordionHeading" panelaccordionheading></div>\
                <div panelaccordionmessage></div>\
                <div panelaccordionbody></div>\
                <div panelsdiv></div>\
                <div panelediv></div>\
                <div panelsediv></div>\
                </div>',
            controller: function($scope, $element, $attrs)  {
                // Move the panel
                var xConst = $scope.paneldata.panelleft;
                var yConst = $scope.paneldata.paneltop;
                this.updatePanelPosn = function(xVal, yVal) {
                    $scope.paneldata.moving = 'moving';
                    if ($scope.paneldata.topLimit!==undefined && (yVal+yConst)<$scope.paneldata.topLimit) {
                        $scope.paneldata.paneltop = $scope.paneldata.topLimit;
                    } else {
                        $scope.paneldata.paneltop = yConst+yVal;
                    }
                    if ($scope.paneldata.leftLimit!==undefined && (xVal+xConst)<$scope.paneldata.leftLimit) {
                        $scope.paneldata.panelleft = $scope.paneldata.leftLimit;
                    } else {
                        $scope.paneldata.panelleft = xConst + xVal;
                    }

                    $scope.$apply();
                };

                this.toggleBody = function() {
                    if ($scope.paneldata.showBody === true) {
                        $scope.paneldata.showBody = false;
                        $scope.paneldata.height = $scope.paneldata.minHeight;
                    } else {
                        $scope.paneldata.showBody = true;
                        $scope.paneldata.height = $scope.paneldata.expandedHeight;
                    }
                    //$scope.$apply();
                };

                this.calcHeight = function(paneldata) {
                    var bodyEl = document.getElementById(paneldata.id+'_panelAccordionBody');
                    var panelHeight = paneldata.expandedHeight;
                    if (paneldata.showBody && bodyEl) {
                        var headerHeight = 0;
                        var header = document.getElementById(paneldata.id+'_panelAccordionHeading');
                        if (header && header.offsetHeight) {
                            headerHeight = header.offsetHeight;
                        }
                        var messageHeight = 0;
                        var message = document.getElementById(paneldata.id+'_panelMessage');
                        if (message && message.offsetHeight) {
                            messageHeight = message.offsetHeight;
                        }
                        var newHeight = panelHeight - headerHeight - messageHeight;
                        //console.log('show body calc height '+paneldata.id+' '+newHeight);
                        bodyEl.style.height = newHeight+'px';
                    } else {
                        if (bodyEl) {
                            bodyEl.style.height = '0px';
                        }
                    }
                };

                // Initialise height
                if (!$scope.paneldata.height) {
                    if ($scope.paneldata.showBody) {
                        $scope.paneldata.height = $scope.paneldata.expandedHeight;
                        //console.log('no height '+$scope.paneldata.id +' maximise ');
                    } else {
                        $scope.paneldata.height = $scope.paneldata.minHeight;
                    }
                }

                var direction;
                var panelElement;
                $scope.jks_dragStart = function(event, element, dir) {
                    direction = dir;
                    //console.log('in drag start '+direction+' div '+JSON.stringify(element[0].id));
                    var panelElementId = element[0].id.substring(0, element[0].id.indexOf('_'))+'_panel';
                    //console.log('looking for '+panelElementId);
                    panelElement = angular.element($document[0].querySelector('#'+panelElementId));
                    //console.log('panel element id '+JSON.stringify(panelElement));

                    var unbindMoveListen = function () {
                        // Unbind the document
                        angular.element($document).unbind('mousemove', moveListen);
                        // Unbing the element
                        element.unbind('mouseup', unbindMoveListen);
                    };

                    var startPosition;
                    var moveListen = function (event) {
                        //console.log('move listen');
                        event.preventDefault();
                        if (!startPosition) {
                            //console.log('initialising start position '+panelElement.id+' height '+panelElement[0].offsetHeight);
                            startPosition = {startx: event.clientX, starty: event.clientY, startheight: panelElement[0].style.height.replace('px',''), startwidth: panelElement[0].style.width.replace('px','') };
                            //console.log('load startPosition '+JSON.stringify(startPosition));
                        }
                        //console.log('move? x '+Math.abs(event.clientX - startPosition.startx)+' y '+ Math.abs(event.clientY - startPosition.starty));
                        if ( ((direction==='s' || direction==='se') && Math.abs(event.clientY - startPosition.starty) > 1) ||
                            ((direction==='e' || direction==='se') && Math.abs(event.clientX - startPosition.startx) > 1) ) {
                            // Ok we're moving, so stop checking for moving, listen for the actual move itself
                            unbindMoveListen();
                            $scope.startPosition = startPosition;
                            //console.log('attaching dragging event');
                            // Bind the move listeners
                            angular.element($document).bind('mousemove', $scope.jks_dragging);
                            angular.element($document).bind('mouseup', $scope.jks_dragEnd);
                            element.bind('mouseup', $scope.jks_dragEnd);
                        }
                    };
                    // Binds a local function to the mousemove on the document
                    angular.element($document).bind('mousemove', moveListen);
                    // Binds a mouseup cancel function on the element in case we just click then stop
                    element.bind('mouseup', unbindMoveListen);
                    event.stopPropagation();
                    //console.log('done drag start ');
                };

                $scope.jks_dragging = function(event) {
                    event.preventDefault();
                    if ($scope.startPosition) {
                        var startPosition = $scope.startPosition;
                        //console.log('dragging start x ' + $scope.startPosition.startx + ' y ' + $scope.startPosition.starty + ' startwidth ' + $scope.startPosition.startwidth+' start height '+$scope.startPosition.startheight);
                        var offsetx = startPosition.startx - event.clientX;
                        var offsety = startPosition.starty - event.clientY;
                        //console.log('dragging y ' + offsety+' x '+offsetx+' giving '+(startPosition.startheight - offsety));
                        switch (direction) {
                            case 's':
                                //console.log('dragging s '+$element[0].id);
                                if (offsety !== 0) {
                                    panelElement[0].style.height =startPosition.startheight - offsety + 'px';
                                    $scope.paneldata.height = startPosition.startheight - offsety;
                                    $scope.paneldata.expandedHeight = startPosition.startheight - offsety;
                                }
                                break;
                            case 'e':
                                if (offsetx !== 0) {
                                    panelElement[0].style.width = startPosition.startwidth - offsetx + 'px';
                                    panelElement[0].style.maxWidth = startPosition.startwidth - offsetx + 'px';
                                    $scope.paneldata.width = startPosition.startwidth - offsetx;
                                }
                                break;
                            case 'se':
                                if (offsetx !== 0) {
                                    panelElement[0].style.width = startPosition.startwidth - offsetx + 'px';
                                    $scope.paneldata.width = startPosition.startwidth - offsetx;
                                }
                                if (offsety !== 0) {
                                    panelElement[0].style.height = startPosition.startheight - offsety + 'px';
                                    $scope.paneldata.height = startPosition.startheight - offsety;
                                    $scope.paneldata.expandedHeight = startPosition.startheight - offsety;
                                }
                                break;
                        }
                        if ($scope.paneldata.recalc) {
                            $scope.paneldata.recalc();
                        }
                    }
                };

                $scope.jks_dragEnd = function (event) {
                    event.preventDefault();
                    $scope.paneldata.width = panelElement[0].style.width.replace('px','');
                    $scope.paneldata.height = panelElement[0].style.height.replace('px','');
                    $scope.paneldata.expandedHeight = panelElement[0].style.height.replace('px','');
                    angular.element($document).unbind('mousemove', $scope.jks_dragging);
                    angular.element($document).unbind('mouseup', $scope.jks_dragEnd);
                    $element.unbind('mouseup', $scope.jks_dragEnd);
                    if ($scope.paneldata.recalc) {
                        $scope.paneldata.recalc();
                    }
                };


            },
            link: function(scope, element, attrs, controller) {

            }
        };
    }])
    .directive('panelsdiv', ['$document', function($document) {
        return {
            restrict: 'EA',
            require: '^jksPanel',
            replace: true,
            template: '<div id="{{paneldata.id}}_jks_sdiv" ng-show="paneldata.resizable===true && paneldata.showBody===true" class="ui-resizable-handle ui-resizable-s" style="z-index: 90;"></div>',
            link: function(scope, element, attr, parentCtrl) {
                var dragStart_s = function(event) {
                    scope.jks_dragStart(event, element, 's');
                };
                element.bind('mousedown', dragStart_s);
            }
        };
    }])
    .directive('panelediv', ['$document', function($document) {
        return {
            restrict: 'EA',
            require: '^jksPanel',
            replace: true,
            template: '<div id="{{paneldata.id}}_jks_ediv" ng-show="paneldata.resizable===true && paneldata.showBody===true" class="ui-resizable-handle ui-resizable-e" style="z-index: 90;"></div>',
            link: function(scope, element, attr, parentCtrl) {
                var dragStart_e = function(event) {
                    scope.jks_dragStart(event, element, 'e');
                };
                element.bind('mousedown', dragStart_e);
            }
        };
    }])
    .directive('panelsediv', ['$document', function($document) {
        return {
            restrict: 'EA',
            require: '^jksPanel',
            replace: true,
            template: '<div id="{{paneldata.id}}_jks_sediv" ng-show="paneldata.resizable===true && paneldata.showBody===true" class="ui-resizable-handle ui-resizable-se" style="z-index: 90;"></div>',
            link: function(scope, element, attr, parentCtrl) {
                var dragStart_se = function(event) {
                    scope.jks_dragStart(event, element, 'se');
                };
                element.bind('mousedown', dragStart_se);
            }
        };
    }])
    .directive('panelaccordionheading', ['$document', function($document) {
        return {
            restrict: 'EA',
            // All the data is on the top level dir - require this to get data and funcs
            require: '^jksPanel',
            template: '<div id={{paneldata.id}}_panelHeadingBackground" class="jks_panelHeadingBackground">\
                <span ng-click="jks_toggleBody()" ng-show="paneldata.accordion && paneldata.showBody!==true" id="{{paneldata.id}}_accordionCtrl" class="jks_accordionCtrl glyphicon glyphicon-menu-down"></span>\
                <span ng-click="jks_toggleBody()" ng-show="paneldata.accordion && paneldata.showBody===true" id="{{paneldata.id}}_accordionCtrl" class="jks_accordionCtrl glyphicon glyphicon-menu-right"></span>\
                <span ng-click="jks_toggleBody()" id="{{paneldata.id}}_panelHeading" class="jks_panelHeading">{{paneldata.heading}}</span>\
                <span ng-click="jks_closePanel()" ng-show="paneldata.isClosable===true" id="{{paneldata.id}}_panelClose" class="jks_accordionCtrl glyphicon glyphicon-remove-circle"></span>\
                </div>',
            // The panel holds the positioning and size controls
            // Add conditional code for whether draggable is on or off
            link: function(scope, element, attr, parentCtrl) {
                if (scope.paneldata.draggable) {
                    // add or remove cursor move
                    element.css('cursor', 'move');
                }
                // Closes the panel
                scope.jks_closePanel = function() {
                    scope.paneldata.isVisibleFlag = false;
                };

                // on click - should only work for icon
                scope.jks_toggleBody = function() {
                    if (scope.paneldata.accordion && scope.paneldata.moving === '') {
                        parentCtrl.toggleBody();
                    }
                    scope.paneldata.moving = '';
                };

                // Draggable code start
                var startX = 0, startY = 0, x = 0, y = 0;
                element.on('mousedown', function(event) {
                    if (scope.paneldata.draggable) {
                        // Prevent default dragging of selected content
                        event.preventDefault();
                        // Work out where your cursor is in respect of the panel when you first click
                        startX = event.pageX - x;
                        startY = event.pageY - y;
                        // Attach handlers
                        $document.bind('mousemove', mousemove);
                        $document.bind('mouseup', mouseup);
                    }
                });
                var mousemove = function(event) {
                    y = event.pageY - startY;
                    x = event.pageX - startX;
                    // Send the coords up to the parent so the Panel moves with the Heading
                    parentCtrl.updatePanelPosn(x,y);
                };

                var mouseup = function(event) {
                    //console.log('mouseup el width '+ element[0].style.width);
                    event.preventDefault();
                    // Disconnect the handlers
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                };
                // Draggable code end
            }
        };
    }])
    .directive('panelaccordionmessage', ['$document', function($document) {
        return {
            restrict: 'EA',
            require: '^jksPanel',
            template: '<div ng-show="paneldata.showBody===true && paneldata.message.value.length>0" id="{{paneldata.id}}_panelMessage" class="jks_panelMessage">\
                            <span id="{{paneldata.id}}_message" class="jks_message" ng-style="{\'color\':getColour()}">{{paneldata.message.value}}</span>\
                            <span ng-style="{\'display\':\'inline-block\', \'vertical-align\':\'top\'}">\
                            <a class="btn-sm btn-default" data-ng-click="handleMessage()">OK</a>\
                            </span>\
                       </div>',
            link: function(scope, element, attr, parentCtrl) {
                scope.getColour = function() {
                    if (scope.paneldata.message && scope.paneldata.message.type) {
                        var colour = '';
                        if (scope.paneldata.message && scope.paneldata.message.type) {
                            switch (scope.paneldata.message.type) {
                                case('success'):
                                    colour = 'green';
                                    break;
                                case('error'):
                                    colour = 'red';
                                    break;
                                case('busy'):
                                    colour = 'orange';
                                    break;
                            }
                        }
                        return colour;
                    }
                };

                scope.handleMessage = function() {
                    if (scope.paneldata.handleMessage) {
                        scope.paneldata.handleMessage();
                    } else {
                        scope.paneldata.message = {};
                    }
                    parentCtrl.calcHeight(scope.paneldata);
                };
            }
        };
    }])
    .directive('panelaccordionbody', ['$document', function($document) {
        return {
            restrict: 'EA',
            // All the data is on the top level dir - require this to get data and funcs
            require: '^jksPanel',
            replace: true,
            template: '<div id="{{paneldata.id}}_panelAccordionBody" ng-style="calcHeight()" ng-include="paneldata.getTemplateUrl()"></div>',
            link: function(scope, element, attr, parentCtrl) {
                scope.calcHeight = function() {
                    parentCtrl.calcHeight(scope.paneldata);
                };
            }
        };
    }]);
