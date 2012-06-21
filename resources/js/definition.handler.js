
function attachDefinitionByVersion(version) {
    if (typeof(version) !== "undefined" && version.match(/\d\.\d/)) {
        console.debug("HL7 Version: " + version);
    } else {
        console.error("Invalid version: " + version);
        version = "0.0"; // this should load default
    }
    
    var loadedDefault = false;
    $.ajax({
        url: "resources/js/definition."+version+".json",
        dataType: "json",
        statusCode: {
            404: function() {
                console.warn("404 on loading "+ version + " definition. Loading default.");
                // Try to load default definition
                if (!loadedDefault) {
                    loadedDefault = true;
                    $.getJSON("resources/js/definition.default.json", attachDefinition);
                }
            }
        },
        success: attachDefinition
    });
}
            
function attachDefinition(definition) {
    if (definition == null) {
        return;
    }

    for (var segmentIndex in definition.segments) {
        var segment = definition.segments[segmentIndex];
        var $segment = $(".segment."+segment.name.toLowerCase());
        if ($segment.size() == 0) {
            console.warn("Defined segment "+segment.name+" not found");
            continue;
        }

        for (var fieldIndex in segment.fields) {
            var field = segment.fields[fieldIndex];
            var $field = $(".field:eq("+fieldIndex+")", $segment);
            if ($field.size() == 0) {
                console.warn("Defined field with index "+fieldIndex+" in "+segment.name+" was not found");
                continue;
            }
            
            // Build XML path
            var xmlPath = [segment.name.toUpperCase(), fieldIndex];

            if (typeof field.components === "undefined") {
                // Check if field has a data type defined
                if (typeof field.dataType !== "undefined") {
                    var fieldDataType = DataTypes[field.dataType.toLowerCase()];
                    if (fieldDataType == null) {
                        console.warn("Unable to find data type "+field.dataType+" for field "+field.name);
                    } else {
                        console.debug("Populating "+fieldDataType.components.length+" components for data type " + field.dataType);
                        field.components = fieldDataType.components;
                    }
                }
            }

            if (typeof field.components === "undefined") {
                // Field always has at least one component even if not defined in definition
                // Assign field description as component title
                $(".component", $field).attr("title", field.name + " ["+ xmlPath.join(".") +"]");
            } else {
                // For each repetition we need to set same component descriptions
                var $repetitions = $(".repetition", $field);
                $repetitions.each(function(i) {
                    var $repetition = $(this);
                    for (var componentIndex in field.components) {
                        var component = field.components[componentIndex];
                        var $component = $(".component:eq("+componentIndex+")", $repetition);
                        if ($component.size() == 0) {
                            console.warn("Defined component with index "+componentIndex+" in "+segment.name+"."+ fieldIndex +" was not found");
                            continue;
                        }

                        // Add component index to the path
                        xmlPath.push(parseInt(componentIndex)+1);
                        // Assign tooltip text
                        $component.attr("title", field.name + " &rsaquo; " + component.name + " ["+ xmlPath.join(".") +"]");
                    
                        // See if component has value descriptions
                        if (typeof(component.values) !== "undefined") {
                            var value = $component.text().trim();
                            console.log("Searching for component value description: " + value);
                        
                            var valueIndex = -1;
                            // Search for value
                            for (var searchIndex in component.values) {
                                var searchValue = component.values[searchIndex];
                                if (searchValue.value == value) {
                                    valueIndex = searchIndex;
                                    break;
                                }
                            }
                        
                            if (valueIndex !== -1) {
                                $component.attr("data-popover-title", field.name + " > " + component.name);
                                $component.attr("data-content", "<strong>"+ value +"</strong> - " + component.values[valueIndex].description);
                            } else {
                                console.warn("Undefined component value " + value + " for " + field.name + " > " + component.name);
                            }
                        }
                        
                        // Remove the component that was just added to allow for multiple components
                        xmlPath.pop();
                    }
                });
            }
        }
    }

    $(".component").tooltip({
        trigger: 'manual'
    });
    
    $(".component[data-content]").popover({
        trigger: 'manual'
    }).click(function() {
        $(this).tooltip('hide');
        $(this).popover('show');
    });
    
    
    var lastSelected = null;
    $(".component").hover(function() {
        $(this).tooltip('show');
        if ($(this).attr("data-content")) {
            $(this).popover('hide');
        }
    }, function() {
        $(this).tooltip('hide');
        if ($(this).attr("data-content")) {
            $(this).popover('hide');
        }
    }).click(function(){
        if (lastSelected != null) {
            lastSelected.removeClass("selected");
        }
        
        var $this = $(this);
        $this.addClass("selected");
        lastSelected = $this;
    });
}