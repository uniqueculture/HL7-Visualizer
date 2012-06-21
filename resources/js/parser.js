
String.prototype.trim = function() {
    return this.replace(/^\s*/, '').replace(/\s*$/, '');
}

function parseMessage(content, fn) {
    // Default separators not defined in a message
    var separators = [
        { 
            character: /[\n\r]/g,
            escapeReplace: "",
            wrap: $("<div />").addClass("segment")
        },
    ];
    // Parsed message container
    var container = $("#parsedHl7");
    content = content.trim();
                
    // Empty container
    container.empty();
                
    // Extract encoding/separator characters from the message
    parseSeparators(separators, content);
                
    // Remove encoding characters to avoid parsing them
    var encodingChars = content.slice(4,8);
    console.log("Encoding chars: " + encodingChars);
    content = content.substring(0, 4).concat(content.substring(8));
                
    // Split the content into HL7 parts
    splitMessage(separators, 0, content, container);
                
    // Set encoding charts back
    $(".segment.msh .field:eq(1) .component").text(encodingChars);
                
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
                
    // Repetition separator
    defaultSeparators.push({
        character: message.charAt(5),
        escapeReplace: "\\R\\",
        wrap: $("<span />").addClass("repetition")
    });
                
    // Component separator
    defaultSeparators.push({
        character: message.charAt(4),
        escapeReplace: "\\S\\",
        wrap: $("<span />").addClass("component")
    });
                
    // Sub-Component separator
    defaultSeparators.push({
        character: message.charAt(7),
        escapeReplace: "\\T\\",
        wrap: $("<span />").addClass("sub-component")
    });
                
    console.debug("Found the following separators: ", defaultSeparators);
}
            
function splitMessage(separators, separatorIndex, content, container) {
    if (separatorIndex < 0 || separatorIndex > separators.length - 1) {
        if (content.trim().length == 0) {
            content = " ";
        }
                    
        container.text(content);
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
            elementContainer.addClass(element.substring(0, 3).toLowerCase());
        }
                    
        if (elementIndex != elements.length - 1 && typeof(separator.character) == "string") {
            container.append(separator.character);
        }
    }
}