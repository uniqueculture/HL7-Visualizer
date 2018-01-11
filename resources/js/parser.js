
String.prototype.trim = function() {
    return this.replace(/^\s*/, '').replace(/\s*$/, '');
}

function parseMessageToHtml(content, fn) {
    // Default separators not defined in a message
    var separators = [
        { 
            character: /[\n\r]/g,
            escapeReplace: "",
            wrap: $("<div />").addClass("segment")
        }
    ];
    // Parsed message container
    var container = $("<div />");
    content = content.trim();
                
    // Empty container
    container.empty();
    
    // Remove multiple line endings
    content = content.replace(/[\n\r]+/g, "\r");
                
    // Extract encoding/separator characters from the message
    parseSeparators(separators, content);
                
    // Remove encoding characters to avoid parsing them
    var encodingChars = content.slice(4,8);
    console.log("Encoding chars: " + encodingChars);
    content = content.substring(0, 4).concat(content.substring(8));
                
    // Split the content into HL7 parts
    splitMessage(separators, 0, content, container);
    
    // Set the message to display
    $("#parsedHl7").html(container.html());
                
    // Set encoding charts back
    $(".segment:eq(0) .field:eq(1) .component").text(encodingChars);
	
	// Fix the counts on first segment since first field is a separator, typically a pipe
	$(".segment:eq(0) .field .count").each(function(){
		this.innerText = parseInt(this.innerText) + 1;
	});
                
    if (typeof(fn) == "function") {
        fn(container);
    }
}

function parseSeparators(defaultSeparators, message) {
    message = $.trim(message);
    if (message.length == 0) {
        return;
    }
                
    if (message.lastIndexOf("MSH", 0) !== 0) {
        console.error("HL7 message is expected to begin with MSH segment. Instead: " + message.substr(0, 10));
        return;
    }
            
    // Field separator
    defaultSeparators.push({
        character: message.charAt(3),
        escapeReplace: "\\F\\",
        wrap: $("<span />").addClass("field")
    });
    
    // Parse encoding characters, if less than expected use default ones
    var encodeFieldStart = message.indexOf(defaultSeparators[0].character);
    var encodeFieldEnd = message.indexOf(defaultSeparators[0].character, encodeFieldStart);
    var encodeChars = message.substring(encodeFieldStart, encodeFieldEnd - encodeFieldStart);
    if (encodeChars.trim().length < 4) {
        // Use default encoding chars
        encodeChars = "^~\\&";
    }

    // Repetition separator
    defaultSeparators.push({
        character: encodeChars.charAt(1),
        escapeReplace: "\\R\\",
        wrap: $("<span />").addClass("repetition")
    });
                
    // Component separator
    defaultSeparators.push({
        character: encodeChars.charAt(0),
        escapeReplace: "\\S\\",
        wrap: $("<span />").addClass("component")
    });
                
    // Sub-Component separator
    defaultSeparators.push({
        character: encodeChars.charAt(3),
        escapeReplace: "\\T\\",
        wrap: $("<span />").addClass("sub-component")
    });
                
    console.log("Found the following separators: ", defaultSeparators);
}
            
function splitMessage(separators, separatorIndex, content, container) {
    if (separatorIndex < 0 || separatorIndex > separators.length - 1) {
        if (content.trim().length == 0) {
            container.html("&nbsp;");
        } else {
            container.text(content);
        }

        return;
    }
                
    var separator = separators[separatorIndex];
    var elements = content.split(separator.character);
    for (var elementIndex in elements) {
        var element = elements[elementIndex];
        var elementContainer = separator.wrap.clone();
        // Continue splitting by more fine-grained separators
        splitMessage(separators, separatorIndex + 1, element, elementContainer);
                    
        container.append(elementContainer);
                    
        if (separatorIndex == 0 && element.length >= 3) {
            // Segments separator. get segment name to assing as a class
            elementContainer.attr("data-name", element.substring(0, 3).toLowerCase());
        } else if (separatorIndex == 1) {
            // Field separator
            if (elementIndex > 0) {
                // Add field count element
                var $count = $("<span />").addClass("count").text(parseInt(elementIndex));
                elementContainer.prepend($count);
            }
        }
                    
        if (elementIndex != elements.length - 1 && typeof(separator.character) == "string") {
            container.append($("<span />").addClass("separator").text(separator.character));
        }
    }
}

function getValueByHl7Path(path) {
	var regex = /^([A-Z]{3})(\[\d+\])?((\.\d)+)/i
	var match = regex.exec(path);
	if (match == null) {
		return null;
	}
	
	var segment = match[1];
	var segmentRepetition = match[2] ? parseInt(match[2]) : 0;
	var fieldPath = match[3].substring(1);
	var fieldPaths = fieldPath.split(".");
	var $container = $("#parsedHl7");
	
	// Get the segment
	var $segment = $(".segment[data-name="+ segment.toLowerCase() +"]", $container)[segmentRepetition];
	if (!$segment) {
		return null;
	}
	
	var levels = [
		{cls: "field"},
		//{cls: "repetition"},
		{cls: "component"},
		{cls: "sub-component"}
	];
	
	// Adjust field counts for MSH segment since first field is a pipe
	if (segment.toLowerCase() != "msh") {
		fieldPaths[0] = fieldPaths[0] + 1;
	}
	
	var localContext = $segment;
	for (var i = 0; i < fieldPaths.length; i++) {
		var cls = levels[i].cls;
		var $element = $("." + cls, localContext);
		if (!$element) {
			return null;
		}
		
		var index = fieldPaths[i] - 1;
		if (index < 0 || $element.size() < index) {
			return null;
		}
		
		localContext = $element[index];
	}
	
	// Grab only deepest level
	return $("." + levels[levels.length - 1].cls, localContext).text().trim();
}