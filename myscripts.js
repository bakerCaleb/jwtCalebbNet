$(document).ready(function () {
    var inputboxWatermarkText = "Enter JWT Here";

    var token = purl(window.location.href, true).fparam("jwt");

    $("#inputBox").bind('input', function () {
        if (false == $('#inputBox').hasClass("watermark")) {
            DisplayToken($('#inputBox').val());
        }
    });

    //watermark jwt input box
    $('#inputBox').blur(function () {
        if ($(this).val().length == 0) {
            $(this).val(inputboxWatermarkText).addClass("watermark");
        }
    });

    $('#inputBox').focus(function () {
        if ($(this).hasClass("watermark")) {
            $(this).val("").removeClass("watermark");
        }

    });

    $('.autoselect').focus(function () {

        $(this).select();
    });

    $('.autoselect').mouseup(function (e) {
        e.preventDefault();
    });

    $(".rightItem").hide();

    //set token if present

    if (undefined != token) {
        $('#inputBox').val(token);
        DisplayToken(token);
    } else {
        $('#inputBox').val(inputboxWatermarkText).addClass("watermark");
    }

});

function DisplayToken(jwtEncoded) {

    // get formated token
    var formattedToken;

    try {
        formattedToken = FormatJWT(jwtEncoded);
        // populate deepLink
        var dLink = CreateDeepLink(jwtEncoded)

        if ("" == dLink) {
            $(".rightItem").hide();
        }

        $('#deepLink').val(dLink);

        if ("" != dLink) {
            $(".rightItem").fadeIn("medium", "swing");
        }

        // write JWT to content
        WriteFormatedTokenToPage(formattedToken);
    } catch (err) {
        WriteFormatedTokenToPage(err);
    }
}

function WriteFormatedTokenToPage(token) {
    $('#decodedToken').html(token);
}



////////////////////////////
// Util functions
//////////////////////////
function CreateDeepLink(token) {
    var base = "http://" + window.location.host + "/";

    var segments = token.split('.');
    if (segments.length == 3) {
        if ("" == segments[2]) {
            return base + "#jwt=" + segments[0] + "." + segments[1] + ".";
        } else {
            return base  + "#jwt=" + segments[0] + "." + segments[1] + ".X";
        }

    } else {
        return "";
    }
}

function Base64URLDecode(base64UrlEncodedValue) {
    var newValue = base64UrlEncodedValue.replace("+", "-").replace("/", "_");
    var result;

    try {
        result = window.atob(newValue);
    } catch (e) {
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

    if (jsonStringIn == "") {
        return "";
    }

    try {
        $.parseJSON(jsonStringIn);
    } catch (e) {
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
            PrintChar(indention, i > 0, inputAsArray[i], chars);
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

        if ('\\' == inputAsArray[i]) {
            slashCount++;
        } else {
            slashCount = 0;
        }
    }

    // return the characters as a string
    return chars.join("");
}

function PrintChar(indentCount, newline, c, outputArray) {
    if (newline) {
        outputArray = AddStringToBuffer(outputArray, "<br/>");
        for (var i = 0; i < indentCount; i++) {
            outputArray = AddStringToBuffer(outputArray, "<span class='indent'>&nbsp</span>");
        }
    }
    outputArray.push(c);
}

function FormatJWT(jwt) {
    var segments = jwt.split('.');

    if (jwt == "") {
        return "";
    }

    if (segments.length != 3) {
        throw "JWT is required to have three segments"
    }

    var header = FormatJson(Base64URLDecode(segments[0]));
    var content = FormatJson(Base64URLDecode(segments[1]));

    var signature = "[signature]";

    if (segments.length < 3) {
        signature = "[no signature]";
    }

    return header + ".<br/>" + content + ".<br/>" + signature;
}

function AddStringToBuffer(buffer, value) {
    var valueArray = value.split('');

    for (var i = 0; i < valueArray.length; i++) {
        buffer.push(valueArray[i]);
    }

    return buffer;
}