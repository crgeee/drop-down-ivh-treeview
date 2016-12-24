(function () {
    'use strict';

    angular
        .module('app')
        .config(treeViewConfig)
        .directive('dropDownTreeview', dropDownTreeview);

    dropDownTreeview.$inject = ['$document'];

    /**
     * @namespace dropDownTreeview
     * @desc Filter combining dropdown and tree view. 
     * @memberOf Directives
     */
    function dropDownTreeview($document, logger) {
        /**
         * @function controller
         * @desc Controller for dropDownTreeview directive.
         * @param {object} $scope - directive scope
         * @param {object} $attrs - directive attrs 
         * @param {object} data - logging service
         * @param {object} ivhTreeviewMgr - provider for accessing treeview functions
         * @param {object} ivhTreeviewBfs - provider for accessing treeview search functions
         * @memberOf Directives.dropDownTreeview
         * @instance
         */
        controller.$inject = ['$scope', '$attrs', 'ivhTreeviewMgr', 'ivhTreeviewBfs'];
        function controller(scope, attrs, ivhTreeviewMgr, ivhTreeviewBfs) {
            var vm = this;
            vm.filterNames = [];
            vm.ivhModel = {};
            vm.isLoaded = false;

            /**
             * @function getData
             * @desc Gets data for the tree
             * @param {string} filterName - The name of the entity to get data for.
             * @memberOf Directives.dropDownTreeview
             * @instance
             */
            function getData(filterName) {
                vm.ivhModel = {}; // clear or instantiate vm.ivhModel

                return data.list(filterName, null)
                    .then(function (results) {

                        var convertedResults = [];
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].name == null) {
                                continue;
                            }
                            var newObj = {};
                            newObj.label = results[i].name;
                            newObj.value = results[i].id;
                            newObj.type = filterName;

                            // if children, add button using dummy child
                            if (results[i].hasChildren) {
                                var filterNameIndex = vm.filterNames.indexOf(filterName); // get filter index
                                var childFilterName = vm.filterNames[filterNameIndex + 1];
                                if (filterNameIndex == null || childFilterName == null) {
                                    logger.error('Error getting child filter name or index');
                                    return;
                                }
                                newObj.children = []; // instantiate children
                                newObj.childFilterName = childFilterName; // get child filter name for data call
                                newObj.childFilterIndex = filterNameIndex + 1; // get child filter index for retrieving next filter
                                newObj.children.push({
                                    label: 'Loading...',
                                    id: 0,
                                    type: 'DEL', //Use for determine whether to load from server or delete the node
                                    children: []
                                });
                            }
                            convertedResults.push(newObj);
                        }

                        // assign results to treeview model
                        vm.ivhModel = convertedResults;

                        // check preselect
                        preselect();

                        // set selected text
                        vm.setSelectedText();
                    });
            }

            /**
             * @function getSelected
             * @desc Gets the selected notes from the treeview model. If parent node is selected, don't get children nodes.
             * @param {object} ivhModel - Tree Node Model
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            function getSelected() {
                var selectedItems = [];
                ivhTreeviewBfs(vm.ivhModel, function (node) {
                    if (node.selected && node.type !== 'DEL') {
                        if (selectedItems[node.type] == null) {
                            selectedItems[node.type] = [];
                        }
                        selectedItems[node.type].push(node.value);
                    }
                });
                return selectedItems;
            }

            /**
             * @function getSelectedCount
             * @desc Gets count of selected items.
             * @param {} ivhModel 
             * @returns {} 
             */
            function getSelectedCount() {
                var count = 0;
                var selectedItems = getSelected(vm.ivhModel);
                for (var prop in selectedItems) {
                    if (selectedItems.hasOwnProperty(prop)) {
                        count += selectedItems[prop].length;
                    }
                }
                return count;
            }

            /**
             * @function getTotalCount
             * @desc Get's the total count of nodes in the tree.
             * @param {object} ivhModel - Treeview model
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            function getTotalCount() {
                var totalCount = 0;
                ivhTreeviewBfs(vm.ivhModel, function (node) {
                    if (node.type !== 'DEL') {
                        totalCount++;
                    }
                });
                return totalCount;
            }

            /**
             * @function onClickShowHideDropdown
             * @desc On click function for the dropdown to show the tree view.
             * @param {} e - event for the onlick
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            vm.onClickShowHideDropdown = function (e) {
                if (e.target.classList[0] === 'dropDown' &&
                    e.target.parentElement.children.length === 2 &&
                    e.target.parentElement.children[1].classList[0] === 'dropDownContent') {
                    e.target.parentElement.children[1].classList.toggle('show');
                } else if (e.target.classList[0] === 'dropDownButton' &&
                    e.target.parentElement.parentElement.children.length === 2 &&
                    e.target.parentElement.parentElement.children[1].classList[0] === 'dropDownContent') {

                    e.target.parentElement.parentElement.children[1].classList.toggle('show');
                } else if (e.target.classList[0] === 'dropDownButtonIcon' &&
                    e.target.parentElement.parentElement.parentElement.children.length === 2 &&
                    e.target.parentElement.parentElement.parentElement.children[1].classList[0] === 'dropDownContent') {

                    e.target.parentElement.parentElement.parentElement.children[1].classList.toggle('show');
                }
                e.stopPropagation();
            };

            /**
             * @function preselect
             * @desc Selects nodes if preselect is true on render.
             * @returns {} 
             */
            function preselect() {
                // check preselect
                if (vm.ddPreselect === 'true') {
                    ivhTreeviewMgr.selectAll(vm.ivhModel);
                }
            }

            /**
             * @function render
             * @desc Renders the dropdown treeview and assigns variables.
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            vm.render = function (element) {
                // establish new id for combobox
                vm.cbUUID = 12341234; //todo create GUID function
                element.attr('id', vm.cbUUID);

                vm.filterNames = (vm.ddFilters != null) ? vm.ddFilters.split(',') : null;
                if (vm.filterNames == null || vm.filterNames.length === 0) {
                    throw ('dropDownTreeview: No filter names provided.');
                    //return;
                }

                // load the first level
                getData(vm.filterNames[0]);

                setZindex(element);
            };

            /**
             * @function resetFilter
             * @desc Resets this filter to default
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            function resetFilter() {
                getData(vm.filterNames[0]);
                vm.setSelectedText();
            }

            /**
             * @function restoreViewSelections
             * @desc Restores selected values from view.
             * @param {} restoreData 
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            function restoreViewSelections(restoreData) {
                var values = restoreData[vm.ddId];
                if (values == null) {
                    return;
                }
                ivhTreeviewMgr.selectEach(vm.ivhModel, values);
                vm.setSelectedText();
            }

            /**
             * @function selectAll
             * @desc Selects all checkbox options
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            vm.selectAll = function (value) {
                if (value) {
                    ivhTreeviewMgr.selectAll(vm.ivhModel);
                    selectCheckbox(true);
                } else {
                    ivhTreeviewMgr.deselectAll(vm.ivhModel);
                    selectCheckbox(false);
                }
                vm.setSelectedText();
            };

            /**
             * @function selectCheckbox
             * @desc Selects an individual checkbox via jquery
             * @param {boolean} checked 
             * @memberof Directives.dropDownTreeview
             * @instance             
             */
            function selectCheckbox(checked) {
                if (checked == null) {
                    checked = true;
                }
                var dropdown = angular.element('#' + vm.cbUUID);
                var inputs = dropdown.find('input');
                for (var i = 0; i < inputs.length; i++) {
                    var el = angular.element(inputs[i]);
                    el.prop('checked', checked);
                    el.triggerHandler('input');
                }
            }

            /**
             * @function setSelectedText
             * @desc Set's the dropdown's text based on what is selected.
             * @param {object[]} selectedItems - List of selected items
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            vm.setSelectedText = function () {
                var selectedCount = getSelectedCount();
                var totalCount = getTotalCount();
                if (selectedCount === totalCount) {
                    vm.selectedText = 'All items selected';
                } else if (selectedCount > 0) {
                    vm.selectedText = '1 or more items selected';
                } else {
                    vm.selectedText = vm.ddPlaceholder;
                }
            };

            /**
             * @function setZindex
             * @desc Sets the dropdown content (with treeview) location
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            function setZindex(element) {
                var zIndexDropDownButton = parseInt(element[0].children[0].style.zIndex === '' ? 0 : element[0].children[0].style.zIndex);
                element[0].children[0].style.zIndex = zIndexDropDownButton;
                element[0].children[0].children[0].style.zIndex = zIndexDropDownButton + 1;
                element[0].children[1].style.zIndex = zIndexDropDownButton + 2;
            }
        }

        /**
         * @function link
         * @desc Link function for the directive
         * @param {object} scope - directive scope
         * @param {object} element - directive element
         * @param {object} attrs - directive attributes
         * @param {object} ctrl - directive controller
         * @memberof Directives.dropDownTreeview
         * @instance
         */
        function link(scope, element, attrs, ctrls) {
            // organize controllers
            var ctrl = ctrls[0];
            ctrl.parentCtrl = ctrls[1];

            // get filter names and load the first level
            ctrl.render(element);

            /**
             * @desc On click to hide the dropdown when clicking elsewhere
             * @memberof Directives.dropDownTreeview
             * @instance
             */
            $document.bind('click', function (event) {
                var isClickedElementChildOfPopup = element.find(event.target).length > 0;
                if (!isClickedElementChildOfPopup && element[0].children[1].classList.contains('show')) {
                    element[0].children[1].classList.toggle('show');
                }
            });
        }

        return {
            bindToController: true,
            controller: controller,
            controllerAs: 'vm',
            link: link,
            replace: true,
            require: ['dropDownTreeview', '^filterManager'],
            restrict: 'EA',
            scope: {
                ddId: '@',
                ddFilters: '@',
                ddFilterType: '@',
                ddPlaceholder: '@',
                ddPreselect: '@'
            },
            templateUrl: 'dropDownTreeview.html'
        };
    }

    /**
     * @function treeViewConfig
     * @desc Used for configuring treeview without use of scope variables.
     * @param {} ivhTreeviewOptionsProvider - provider for third party tree view
     * @memberof Directives.dropDownTreeview
     * @instance
     */
    treeViewConfig.$inject = ['ivhTreeviewOptionsProvider'];
    function treeViewConfig(ivhTreeviewOptionsProvider) {
        ivhTreeviewOptionsProvider.set({
            useCheckboxes: true,
            expandToDepth: 0,
            defaultSelectedState: true,
            validate: true,
            twistieExpandedTpl: '<tree-leaf><span class="glyphicon glyphicon-triangle-bottom" style="font-size: .7em;"></span></tree-leaf>',
            twistieCollapsedTpl: '<tree-leaf><span class="glyphicon glyphicon-triangle-right" style="font-size: .7em;"></span></tree-leaf>',
            twistieLeafTpl: '<tree-leaf><span style="margin-left: 14px;"></span></tree-leaf>',
            nodeTpl: [
                  '<div class="ivh-treeview-node-content">',
                    '<span ivh-treeview-toggle>',
                      '<span class="ivh-treeview-twistie-wrapper" ivh-treeview-twistie></span>',
                    '</span>',
                    '<tree-checkbox></tree-checkbox>',
                    '<span class="ivh-treeview-node-label" ivh-treeview-toggle>',
                      '{{::trvw.label(node)}}',
                    '</span>',
                    '<div ivh-treeview-children></div>',
                  '</div>'
            ].join('\n')
        });
    }
})();