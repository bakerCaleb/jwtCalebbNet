function DecodeJWT(textArea) {
    // need to add whitespace trim
    try{
        textArea.val(FormatJWT(textArea.val()));
    } catch (err) {
        textArea.val(err);
    }
}


////////////////////////////
// Util functions
//////////////////////////
function Base64URLDecode(base64UrlEncodedValue) {
    var newValue = base64UrlEncodedValue.replace("+", "-").replace("/", "_");
    var result;
    
    try{
        result = window.atob(newValue);
    }catch(e)
    {
        throw "Base64URL decode of JWT segment failed";
    }

    return result;
}

function FormatJson(jsonStringIn) {
    var jsonStringOut = "";
    var chars = [];
    var inputAsArray = jsonStringIn.split('');
    var inToken = false;
    var indention = 0;
    var newlineNext = false;
    var slashCount = 0;

    try{
        $.parseJSON(jsonStringIn);
    }catch(e){
        return "[THIS SEGEMENT DOES NOT CONTAIN A VALID JSON OBJECT]";
    }

    for (var i = 0; i < inputAsArray.length ; i++) {

        // Determine if entering or exiting a quoted token
        if (i > 0 && "\"".indexOf(inputAsArray[i]) > -1 && (slashCount % 2) == 0) {
            inToken = !inToken;
        }

        // If outside of a token, a newline char may be needed. Otherwise, just the char is added. 
        if (false == inToken && ",".indexOf(inputAsArray[i]) > -1) {
            PrintChar(indention, newlineNext, inputAsArray[i], chars);
            newlineNext = true;
        }

        // If outside of a token, a newline char may be needed. Otherwise, just the char is added. Indent.
        else if (false == inToken && "{[".indexOf(inputAsArray[i]) > -1) {
            PrintChar(indention, i>0, inputAsArray[i], chars);
            indention += 1;
            newlineNext = true;
        }
        else if (false == inToken && "}]".indexOf(inputAsArray[i]) > -1) {
            indention -= 1;
            PrintChar(indention, true, inputAsArray[i], chars);
            newlineNext = true;
        } else {
            PrintChar(indention, newlineNext, inputAsArray[i], chars);
            newlineNext = false;
        }

        if('\\' == inputAsArray[i])
        {
            slashCount ++;
        }else{
            slashCount = 0;
        }
    }

    // return the characters as a string
    return chars.join("");
}

function PrintChar(indentCount, newline, c, outputArray) {
    if (newline) {
        outputArray.push('\n');
        for (var i = 0; i < 3 * indentCount; i++) {
            outputArray.push(' ');
        }
    }
    outputArray.push(c);
}

function FormatJWT(jwt) {
    var segments = jwt.split('.');

    if(segments.length != 3)
    {
        throw "JWT is required to have three segments"
    }

    var header = FormatJson(Base64URLDecode(segments[0]));
    var content = FormatJson(Base64URLDecode(segments[1]));

    var signature = "[signature]";

    if (segments.length < 3) {
        signature = "[no signature]";
    }

    return header + ".\n" + content + ".\n" + signature;
}
