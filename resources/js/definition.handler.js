
function attachDefinitionByVersion(version) {
    if (typeof(version) !== "undefined" && version.match(/\d\.\d/)) {
        console.log("HL7 Version: " + version);
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
                    $.getJSON("resources/js/definition.default.json", attachDefinitionAndUi);
                }
            }
        },
        success: attachDefinitionAndUi
    });
}

function attachDefinitionAndUi(definition) {
    attachDefinition(definition);
    attachUiEvents();
}

function getSegmentDefinitionByName(definition, segmentName) {
    for (var segmentIndex in definition.segments) {
        if (definition.segments[segmentIndex].name.toLowerCase() == segmentName.toLowerCase()) {
            return definition.segments[segmentIndex];
        }
    }
    
    return null;
}

function getComponentDescription(values, value) {
    console.log("Searching for component value description: " + value);

    var valueIndex = -1;
    // Search for value
    for (var searchIndex in values) {
        var searchValue = values[searchIndex];
        if (searchValue.value.toLowerCase() == value.toLowerCase()) {
            valueIndex = searchIndex;
            break;
        }
    }
    
    return valueIndex >= 0 ? values[valueIndex].description : null;
}
            
function attachDefinition(definition) {
    if (definition == null) {
        return;
    }
    
    var $container = $("#parsedHl7")
    var $segments = $(".segment", $container);    
    for (var segmentIndex = 0; segmentIndex < $segments.size(); segmentIndex++) {
        var $segment = $($segments[segmentIndex]);
        var segmentName = $segment.attr("data-name");
        if (segmentName == null || segmentName.length == 0) {
            continue;
        }
        
        // Get segment definition based on name
        var segment = getSegmentDefinitionByName(definition, segmentName);
        if (segment == null) {
            console.warn("Message segment "+segmentName+" not found in definition");
            continue;
        }
        
        // Assign definitions for each field
        var $fields = $(".field", $segment);
        for (var fieldIndex = 0; fieldIndex < $fields.size(); fieldIndex++) {
            var $field = $($fields[fieldIndex]);
            var field = segment.fields[fieldIndex];
            if (field == null) {
                console.warn("Defined field with index "+fieldIndex+" in "+segment.name+" was not found");
                continue;
            }
            
            
            // Set field description
            $field.attr("data-name", field.name);
            
            // Build XML path
            var xmlPath = [segment.name.toUpperCase(), (segment.name == "MSH" ? fieldIndex + 1 : fieldIndex)];

            // Attempt to populate field components based on type definition
            if (typeof field.components === "undefined") {
                // Check if field has a data type defined
                if (typeof field.dataType !== "undefined") {
                    var fieldDataType = DataTypes[field.dataType.toLowerCase()];
                    if (fieldDataType == null) {
                        console.warn("Unable to find data type "+field.dataType+" for field "+field.name);
                    } else {
                        console.log("Populating "+fieldDataType.components.length+" components for data type " + field.dataType);
                        field.components = fieldDataType.components;
                    }
                }
            }
            
            if (typeof field.components === "undefined") {
                // Field does not have any components
                // Field always has at least one component even if not defined in definition
                // Assign field description as component title
                $(".component", $field).attr("title", field.name + " ["+ xmlPath.join(".") +"]");
                continue;
            }
            
            // Field has components defined
            // Since a field can be repeated there is always one repetition
            // Assing definition to the first repetition and copy it over to others if any
            var $repetitions = $(".repetition", $field);
            var $repetition = $($repetitions[0]); // first repetition
            var $components = $(".component", $repetition);
            for (var componentIndex = 0; componentIndex < $components.size(); componentIndex++) {
                var $component = $($components[componentIndex]);
                var component = field.components[componentIndex];
                if (component == null) {
                    console.warn("Defined component with index "+componentIndex+" in "+segment.name+"."+ fieldIndex +" was not found");
                    continue;
                }

                // Add component index to the path
                xmlPath.push(parseInt(componentIndex)+1);
                // Assign tooltip text
                $component.attr("title", field.name + " > " + component.name + " ["+ xmlPath.join(".") +"]");
                
                // See if component has value descriptions
                if (typeof(component.values) !== "undefined") {
                    var value = $component.text().trim();
                    var description = getComponentDescription(component.values, value);

                    if (description != null) {
                        $component.attr("data-content", "<strong>"+ value +"</strong> - " + description);
                    } else {
                        console.warn("Undefined component value " + value + " for " + field.name + " > " + component.name);
                    }
                } else if (typeof(component.table) !== "undefined") { 
                    // Set table attribute that would be used later to load 
                    // and attach table definition
                    $component.attr("data-table", component.table);
                    // Set to empty to properly attach popover event
                    $component.attr("data-content", "");
                }

                // Remove the component that was just added to allow for multiple components
                xmlPath.pop();
            }
            
            // Copy data from the first repetition
            for (var repetitionIndex = 1; repetitionIndex < $repetitions.length; repetitionIndex++) {
                var $repetitionComponents = $(".component", $repetitions[repetitionIndex]);
                if ($repetitionComponents.length == 0) {
                    continue;
                }
                
                // For each component get attribute values from 1st repetition components
                for (componentIndex = 0; componentIndex < Math.max($components.length, $repetitionComponents.length); componentIndex++) {
                    var originalComponent = $components[componentIndex];
                    var copytoComponent = $repetitionComponents[componentIndex];
                    
                    if (originalComponent == null || copytoComponent == null) {
                        continue;
                    }
                    
                    try {
                        copytoComponent.setAttribute("title", originalComponent.getAttribute("title"));
                        originalComponent.hasAttribute("data-content") ? copytoComponent.setAttribute("data-content", originalComponent.getAttribute("data-content")) : null;
                        originalComponent.hasAttribute("data-table") ? copytoComponent.setAttribute("data-table", originalComponent.getAttribute("data-table")) : null;
                    } catch (err) {
                        console.error(err);
                    }
                }
            }
        }
    }
}

function attachUiEvents() {
    // For each component with defined table load and attache the table
    // This must be done before tooltip
    $(".component[data-table]").each(function(){
        var $component = $(this);
        var value = $component.text().trim().toLowerCase();
        $.getJSON("resources/js/tables/" + $component.attr("data-table") + ".json", function(table){
            var tableValue;
            for (var valueIndex in table.values) {
                tableValue = table.values[valueIndex];
                if (tableValue.value.toLowerCase() == value) {
                    $component.attr("data-content", tableValue.description);
                    return;
                }
            }
            
            // In case we could not find a value description
            // remove the attribute
            console.warn("Value description not found in [" + $component.attr("data-table") + "] for value [" + value + "]" );
            $component.removeAttr("data-content");
        });
    });

    
    $(".component").tooltip({
        trigger: 'manual',
        animation: false
    });
    
    $(".component[data-content]").popover({
        trigger: 'manual',
        animation: false
    }).click(function() {
        $(this).tooltip('hide');
        $(this).popover('show');
    });
    
    $(".segment .field:first-child").click(function(){
        $.modal($(this).parent().html(), {
            overlayClose: true,
			onShow: function(dialog) {
				// Always show field counts within dialog
				$(".count", dialog.data).show();
			}
        });
        
        var $fields = $("#simplemodal-data .field");
        console.log("Populating field names for " + $fields.size() + " fields");
        
        // Go thru each field and append field name as tag
        $fields.each(function(){
            var $field = $(this);
            $("<span />").addClass("name").text($field.attr("data-name")).appendTo($field);
        });
    });
    
    
    var lastSelected = null;
    $(".component").hover(function(event) {
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