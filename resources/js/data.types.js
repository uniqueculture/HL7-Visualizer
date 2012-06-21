/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


DataTypes = {
    ce: {
        name: "Coded element",
        components: [
            { name: "Identifier" },
            { name: "Text" },
            { name: "Name of Coding System" },
            { name: "Alternate Identifier" },
            { name: "Alternate Text" },
            { name: "Name of Alternate Coding System" }
        ]
    },
    
    cx: {
        name: "Extended composite ID with check digit",
        components: [
            { name: "ID Number" },
            { name: "Check Digit" },
            { name: "Check Digit Scheme" },
            { name: "Assigning Authority" },
            { 
                name: "Identifier Type Code",
                values: [
                    { value: "PN", description: "Person number" },
                    { value: "MR", description: "Medical record number" },
                    { value: "SS", description: "Social Security number" }
                ]
            },
            { name: "Assigning Facility" },
            { name: "Effective Date" },
            { name: "Expiration Date" },
        ]
    },
    
    ck: {
        name: "Composite ID with check digit",
        components: [
            { name: "ID Number" },
            { name: "Check Digit" },
            { name: "Check Digit Scheme" },
            { name: "Assigning Authority" }
        ]
    },
    
    cn: {
        name: "Composite ID number and name",
        components: [
            { name: "ID Number" },
            { name: "Family Name" },
            { name: "Given Name" },
            { name: "Second Given Name" },
            { name: "Suffix" },
            { name: "Prefix" },
            { name: "Degree" },
            { name: "Source Table" },
            { name: "Assigning Authority" }
        ]
    },
    
    cp: {
        name: "Composite price",
        components: [
            { name: "Price" },
            { name: "Type" },
            { name: "From Value" },
            { name: "To Value" },
            { name: "Range Units" },
            { name: "Range Type" }
        ]
    },
    
    cq: {
        name: "Composite quantity with units",
        components: [
            { name: "Quantity" },
            { name: "Units" }
        ]
    },
    
    ei: {
        name: "Entity identifier",
        components: [
            { name: "Entity Identifier" },
            { name: "Namespace ID" },
            { name: "Universal ID" },
            { name: "Universal ID Type" },
        ]
    },
    
    pl: {
        name: "Person location",
        components: [
            { name: "Point of Care" },
            { name: "Room" },
            { name: "Bed" },
            { name: "Facility" },
            { name: "Location Status" },
            { name: "Person Location Type" },
            { name: "Building" },
            { name: "Floor" },
            { name: "Location Description" }
        ]
    },
    
    pt: {
        name: "Processing type",
        components: [
            { 
                name: "ID", 
                values: [
                    { value: "D", description: "Debugging" } , 
                    { value: "P", description: "Production" },
                    { value: "T", description: "Training" }
                ]
            },
            { name: "Mode" }
        ]
    },
    
    tq: {
        name: "Quantity and timing",
        components: [
            { name: "Quantity" },
            { name: "Interval" },
            { name: "Duration" },
            { name: "Start Date/Time" },
            { name: "End Date/Time" },
            { name: "Priority" },
            { name: "Condition" },
            { name: "Text" },
            { name: "Conjunction" },
            { name: "Order Sequencing" },
            { name: "Occurrence Duration" },
            { name: "Total Occurrences" }
        ]
    },
    
    xad: {
        name: "Extended address",
        components: [
            { name: "Street Address" },
            { name: "Other Designation" },
            { name: "City" },
            { name: "State or Province" },
            { name: "Zip or Postal code" },
            { name: "Country" },
            { name: "Address Type" },
            { name: "Other Geographic Designation" },
            { name: "County/Parish code" },
            { name: "Census Tract" },
            { name: "Address Representation Code" },
            { name: "Address Validity Range" }
        ]
    },
    
    xcn: {
        name: "Extended composite ID number and name for persons",
        components: [
            { name: "ID Number" },
            { name: "Family Name" },
            { name: "Given Name" },
            { name: "Second Given Name" },
            { name: "Suffix" },
            { name: "Prefix" },
            { name: "Degree" },
            { name: "Source Table" },
            { name: "Assigning Authority" },
            { name: "Name Type Code" },
            { name: "Check Digit" },
            { name: "Check Digit Scheme" },
            { name: "Identifier Type Code" },
            { name: "Assigning Facility" },
            { name: "Representation Code" },
            { name: "Context" },
            { name: "Validity Range" },
            { name: "Assembly Order" }
        ]
    },
    
    xpn: {
        name: "Extended person name",
        components: [
            { name: "Family Name" },
            { name: "Given Name" },
            { name: "Middle Name" },
            { name: "Suffix" },
            { name: "Prefix" },
            { name: "Degree" },
            { name: "Type Code" },
            { name: "Representation Code" },
        ]
    },
    
    xon: {
        name: "Extended composite name and identification number for organizations",
        components: [
            { name: "Organization Name" },
            { name: "Organization Name Type Code" },
            { name: "ID Number" },
            { name: "Check Digit" },
            { name: "Check Digit Scheme" },
            { name: "Assigning Authority" },
            { name: "Identifier Type Code" },
            { name: "Assigning Facility" },
            { name: "Name Representation" },
        ]
    },
    
    xtn: {
        name: "Extended telecommunication number",
        components: [
            { name: "Telephone Number" }, 
            { 
                name: "Telecommunication Use Code",
                values: [
                    { value: "PRN", description: "Primary Residence Number" },
                    { value: "ORN", description: "Other Residence Number" },
                    { value: "WPN", description: "Work Number" },
                    { value: "VHN", description: "Vacation Home Number" },
                    { value: "ASN", description: "Answering Service Number" },
                    { value: "EMR", description: "Emergency Number" },
                    { value: "NET", description: "Network (email) Address" },
                    { value: "BPN", description: "Beeper Number" }
                ]
            }, 
            { name: "Telecommunication Equipment Type" }, 
            { name: "Email Address" }, 
            { name: "Country Code" }, 
            { name: "Area/city Code" }, 
            { name: "Phone Number" }, 
            { name: "Extension" }, 
            { name: "Any Text" }
        ]
    }
}