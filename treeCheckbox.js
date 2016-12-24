(function () {
    'use strict';

    angular
        .module('app')
        .directive('treeCheckbox', treeCheckbox);

    treeCheckbox.$inject = ['ivhTreeviewMgr', 'ivhTreeviewBfs'];

    function treeCheckbox(ivhTreeviewMgr, ivhTreeviewBfs) {

        /**
         * @function link
         * @desc Link function for checkbox
         * @param {} scope 
         * @param {} element 
         * @param {} attrs 
         * @param {} ctrl 
         * @returns {} 
         */
        function link(scope, element, attrs, ctrls) {
            // check if this node is selected. if so, set checkboxes checked
            var n = scope.node;
            if (ctrls[0].isSelected(n)) {
                var inputs = element.find('input');
                for (var i = 0; i < inputs.length; i++) {
                    var el = angular.element(inputs[i]);
                    el.prop('checked', true);
                }
            }

            /**
             * @desc On click of the checkbox event.
             */
            element.on('click', function (e) {
                // get checkbox
                var checkbox = angular.element(e.target).prev();
                if (checkbox == null || checkbox.length < 1) {
                    return;
                }
                var checked = !checkbox.is(':checked');
                checkbox.prop('checked', checked);

                // get checkbox children
                var checkboxChildren = checkbox.closest('.ivh-treeview-node-content')
                    .children('div[ivh-treeview-children]')
                    .find('input');
                for (var i = 0; i < checkboxChildren.length; i++) {
                    var el = angular.element(checkboxChildren[i]);
                    el.prop('checked', checked);
                }

                // select node in ivhTreeview
                ivhTreeviewMgr.select(ctrls[0].root(), scope.node, !scope.node.selected);
                ctrls[1].setSelectedText();

                // get parent and determine if indeterminate
                if (scope.node.hasParent) {
                    var indeterminate = scope.node.parent.__ivhTreeviewIndeterminate;
                    var parentCheckboxWrapper = checkbox.closest('.ivh-treeview-node-content')
                        .parents('.ivh-treeview-node-content')
                        .children()[1];
                    var parentCheckboxes = angular.element(parentCheckboxWrapper).find('input');
                    for (var j = 0; j < parentCheckboxes.length; j++) {
                        var elem = angular.element(parentCheckboxes[j]);
                        elem.prop('indeterminate', indeterminate);
                        elem.prop('checked', !indeterminate);
                    }
                }

                scope.$apply();
            });
        }

        return {
            link: link,
            restrict: 'EA',
            require: ['^ivhTreeview', '^dropDownTreeview'],
            template: [
            '<span class="k-checkbox-wrapper ivh-treeview-checkbox-wrapper" role="presentation">',
                '<input type="checkbox" name="ivh-dropdown-checkbox" tabindex="-1" class="k-checkbox" ivh-treeview-checkbox>',
                '<label class="k-checkbox-label"></label>',
            '</span>'
            ].join('')
        };
    }
})();