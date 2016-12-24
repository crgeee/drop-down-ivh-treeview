(function () {
    'use strict';

    angular
        .module('app')
        .factory('treeFactory', treeFactory);

    treeFactory.$inject = [];

    /**
     * @function treeFactory
     * @desc
     * @returns {} 
     */
    function treeFactory() {
        var service = {
            genNode: genNode
        };

        return service;

        /**
         * @function genNode
         * @desc
         * @param {object} list - json data getting from server
         * @param {boject} parent - parent node
         * @memberof Directives.scDropDownTreeView
         * @instance
         */
        function genNode(list, parent) {
            var node = [],
                i = 0,
                nodes = [];

            while (list != null && list.length) {
                node = makeNode(list.shift(), parent);
                node.selected = parent == null ? node.selected : parent.selected;

                if (parent != null) {
                    if (parent.children[0].type === 'DEL') {
                        //Remove the dummy node
                        parent.children.splice(0);
                    }
                    parent.children.push(node);
                } else {
                    nodes.push(node);
                }
                i++;
            }

            if (parent != null) {
                return parent;
            } else {
                return nodes;
            }
        }

        /**
         * @function makeNode
         * @desc
         * @param {} label 
         * @param {} parent 
         * @memberof Directives.scDropDownTreeView
         * @instance
         * @returns {object} node - the new node 
         */
        function makeNode(label, parent) {
            if (label.name != null) {
                var node = {
                    label: label.name,
                    value: label.id,
                    type: parent.childFilterName.trim(),
                    hasParent: true,
                    parent: parent,
                    children: []
                };

                //Create dummy for speed up loading & make library show "Expand" icon
                //child nodes only load when 'leaf element click in directive
                if (label.hasChildren && parent.nextChildFilterName != null) {
                    node.childFilterName = parent.nextChildFilterName;
                    node.children.push({
                        label: 'Loading...',
                        id: 0,
                        type: 'DEL',  //Use for determine whether to load from server or delete the node
                        children: []
                    });
                }
                return node;
            }
        }
    }
})();