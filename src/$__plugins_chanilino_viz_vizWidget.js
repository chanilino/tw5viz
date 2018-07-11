(function(){

    var Widget = require("$:/core/modules/widgets/widget.js").widget;
    var Viz = require("$:/plugins/chanilino/viz/viz.js");
    var {Module, render } = require("$:/plugins/chanilino/viz/lite.render.js");
    var viz = new Viz({ Module, render });
    

    var VizWidget = function(parseTreeNode,options) {
        this.initialise(parseTreeNode,options);
    };

    VizWidget.prototype = new Widget();

    VizWidget.prototype.render = function(parent,nextSibling) {
        this.parentDomNode = parent;
        this.computeAttributes();
        this.execute();
        var domNode = this.create(parent, nextSibling);
        this.domNodes.push(domNode);
        parent.insertBefore(domNode,nextSibling);
        this.renderChildren(domNode,null);
    };

    VizWidget.prototype.execute = function() {
        // get attributes
        this.my_text = this.getAttribute("text");
        this.selectClass = this.getAttribute("class");
        this.tiddler = this.getAttribute("tiddler",this.getVariable("currentTiddler"));
        this.setName = this.getAttribute("name","currentTiddler");
        // make child widgets 
        //this.makeChildWidgets();
    };

    //refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
    VizWidget.prototype.refresh = function(changedTiddlers) {
        var changedAttributes = this.computeAttributes();
        if(changedAttributes.my_text || changedAttributes.tiddler) {
            this.refreshSelf();
            return true;
        } else {
            return this.refreshChildren(changedTiddlers);		
        }
    };

    VizWidget.prototype.removeChildDomNodes = function() {
        $tw.utils.each(this.domNodes,function(domNode) {
            domNode.parentNode.removeChild(domNode);
        });
        this.domNodes = [];
    };

    VizWidget.prototype.create = function() {
        // create a <div> container for the image
        var domNode = $tw.utils.domMaker("div",{class:this.selectClass});

        viz.renderSVGElement(this.my_text).then(
           element => { 
              domNode.appendChild(element);
           }).catch(
             error => {
               viz = new Viz({ Module, render });
         });
        return domNode;
    };


    VizWidget.prototype.handleChangeEvent = function(event) {
        // set the widget variable to inform the children
        this.setVariable(this.setName,event.target.value,this.parseTreeNode.params);
        // refresh this widget, and thereby the child widgets AND the enclosed content of this widget 
        this.refreshSelf();
        return true;
    };

    exports.viz = VizWidget;

})();
