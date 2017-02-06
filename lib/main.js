const { openToolbox } = require("dev/utils");
var { viewFor } = require("sdk/view/core");
var tabs = require("sdk/tabs");
var tab_utils = require("sdk/tabs/utils");



var contextMenu = require("sdk/context-menu");
contextMenu.Item({
    label: "Inspect Angular scope",
    context: contextMenu.SelectorContext('.ng-scope, .ng-isolate-scope'),
    contentScript: 'self.on("click", function (node, data) { node.setAttribute("data-ng-inspect-scope-selected", 1);' +
                 '  self.postMessage();' +
                 '});',
    onMessage: function (node) {
        return openToolbox({prototype: {}, id: "inspector"}).then(function(toolbox) {
            var lowLevelTab = viewFor(tabs.activeTab);
            var browser = tab_utils.getBrowserForTab(lowLevelTab);

            var node = browser.contentDocument.querySelector('[data-ng-inspect-scope-selected]');
            if (node) {
                let inspector = toolbox.getCurrentPanel();
                inspector.walker.querySelector(inspector.walker.rootNode, '[data-ng-inspect-scope-selected]').then(nodeFront => {
                    inspector.selection.setNodeFront(nodeFront, "browser-context-menu");
                    node.removeAttribute('data-ng-inspect-scope-selected');
                }).then(function() {
                    openToolbox({prototype: {}, id: 'webconsole'}).then(function (toolbox) {
                        let panel = toolbox.getCurrentPanel();
                        let jsterm = panel.hud.jsterm;
                        jsterm.execute("inspect(angular.element($0).scope())");
                    });
                });
            }
        });
    }
});
