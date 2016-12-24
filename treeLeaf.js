(function () {
    'use strict';

    angular
        .module('app')
        .directive('treeLeaf', treeLeaf);

    treeLeaf.$inject = ['ivhTreeviewMgr', 'treeFactory'];

    /**
     * @namespace treeLeaf
     * @desc Nodes inside the Treeview
     * @memberOf Directives.scDropDownTreeView
     * @example 
     * For filter views with single reset buttons:
     * <tree-leaf></tree-leaf>
     */
    function treeLeaf(ivhTreeviewMgr, treeFactory) {

        /**
         * @function link
         * @desc Link function for directive
         * @param {object} scope - directive scope
         * @param {object} element - directive element
         * @param {object} attrs - directive attributes
         * @memberof Directives.scDropDownTreeView
         * @instance
         */
        link.$inject = ['$scope', '$element', '$attrs'];
        function link(scope, element, attrs, ctrl) {
            // check if any children - do not set if there aren't
            if (scope.node.childFilterName != null) {
                // add click event for next level data
                element.on('click', function () {                    
                    if (scope.node.childFilterName == null) {
                        return;
                    }

                    // check if already loaded
                    if (scope.node.children !== null && scope.node.children.length > 0) {
                        if (scope.node.children[0].type !== 'DEL') {
                            return; //Loaded Parent, not need to load again
                        }
                    }

                    // get child data
                    data.list(scope.node.childFilterName.trim(), { id: scope.node.value })
                        .then(function (results) {
                            scope.node.nextChildFilterName = ctrl.filterNames[scope.node.childFilterIndex + 1];
                            treeFactory.genNode(results, scope.node);

                            if (scope.node.children[0] != null && scope.node.children[0].type === 'DEL') {
                                //Remove the dummy node
                                scope.node.children.splice(0);
                            }
                        });
                });
            }
        }

        return {
            link: link,
            require: '^scDropDownTreeView2',
            restrict: 'EA'
        };
    }
})();