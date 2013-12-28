$(document).ready(function () {
    var inputboxWatermarkText = "Enter JWT Here";

    var token = purl(window.location.href, true).fparam("jwt");

    if (undefined === token) {
        token = purl(window.location.href, true).param("id_token");
    }

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
            return base + "#jwt=" + segments[0] + "." + segments[1] + ".X";
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

function FormatJWT(jwt) {
    var segments = jwt.split('.');


    if (jwt == "") {
        return "";
    }

    if (segments.length != 3) {
        throw "JWT is required to have three segments"
    }

    var header = DisplayJSON(Base64URLDecode(segments[0])).GetFormattedValue();
    var content = DisplayJSON(Base64URLDecode(segments[1])).GetFormattedValue();

    var signature = "[signature]";

    if (segments.length < 3) {
        signature = "[no signature]";
    }

    return header + ".</div>" + content + ".</div>" + signature;
}

function StringBuilder() {
    var value = [];

    return {
        Value: function () {
            return value.join("");
        },

        Add: function (string) {

            var valueArray = string.split('');

            for (var i = 0; i < valueArray.length; i++) {
                value.push(valueArray[i]);
            }
        }
    };
}

function DisplayJSON(value) {

    var inputChars = value.split('');
    var index;

    try {
        $.parseJSON(value);
    } catch (e) {
        return "[THIS SEGEMENT DOES NOT CONTAIN A VALID JSON OBJECT]";
    }


    return {

        GetFormattedValue: function () {
            var builder = StringBuilder();
            index = 0;
            indent = 0;
            this.FormatNext(builder, indent);

            return builder.Value();
        },

        FormatNext: function (builder, indent) {

            switch (this.NextValueType()) {
                case "value":
                    this.FormatValue(builder, indent);
                    break;
                case "object":
                    this.FormatObject(builder, indent);
                    break;
                case "array":
                    this.FormatArray(builder, indent);
                    break;
                default:
                    throw "unexpected condition in FormatNext";
                    break;
            }
        },

        FormatObject: function (builder, indent) {
            var done = false;
            // this.StartLine(builder);
            builder.Add(this.ExpectedChar("{"));
            indent++;
            this.EndLine(builder);

            while (done == false) {



                this.StartLine(builder, indent);
                this.FormatType(builder, indent);
                builder.Add(this.ExpectedChar(":"));
                builder.Add(" ");
                this.FormatNext(builder, indent);

                if (this.Peek() == ",") {
                    builder.Add(this.ExpectedChar(","));
                } else {
                    done = true;
                }

                this.EndLine(builder);
            }

            indent--;
            this.StartLine(builder, indent);
            builder.Add(this.ExpectedChar("}"));
            //this.EndLine(builder);
        },

        FormatArray: function (builder, indent) {
            var done = false;

            //this.StartLine(builder, indent);
            builder.Add(this.ExpectedChar("["));
            indent++;
            //this.EndLine(builder);


            while (done == false) {
                this.StartLine(builder, indent);
                this.FormatNext(builder);

                if (this.Peek() == ",") {
                    builder.Add(this.ExpectedChar(","));
                } else {
                    done = true;
                }
                this.EndLine(builder);
            }


            indent--;
            this.StartLine(builder, indent);

            builder.Add(this.ExpectedChar("]"));

        },

        FormatValue: function (builder, indent) {
            builder.Add("<span class='jsonValue'>");
            if (this.Peek() == "\"") {
                this.ReadQuotedString(builder);
            } else {
                while (" \t\r\n,}]".indexOf(inputChars[index]) < 0) {
                    builder.Add(inputChars[index]);
                    index++;
                }
            }
            builder.Add("</span>");
        },

        FormatType: function (builder, indent) {
            builder.Add("<span class='jsonField'>");
            this.ReadQuotedString(builder);
            builder.Add("</span>");
        },

        ReadQuotedString: function (builder) {
            var slashCount = 0;

            if (this.Peek() == "\"") {
                slashCount = 0;
                builder.Add("\"");
                index++;

                while ("\"" != inputChars[index] && (slashCount % 2) == 0) {
                    builder.Add(inputChars[index]);

                    if ("\\" == inputChars[index]) {
                        slashCount++;
                    } else {
                        slashCount = 0;
                    }

                    index++;
                }

                builder.Add(inputChars[index]);
                index++;
            } else {
                throw "expected quote for type";
            }
        },

        ExpectedChar: function (char) {
            if (this.Peek() == char) {
                index++;
                return char
            }

            throw "unexpected char";
        },

        Peek: function () {
            while (" \t\r\n".indexOf(inputChars[index]) > -1) {
                index++;
            }

            return inputChars[index];
        },

        NextValueType: function () {
            switch (this.Peek()) {
                case "{":
                    return "object";
                    break;
                case "[":
                    return "array";
                    break;
                case ",":
                    return ",";
                    break;
                case ":":
                    return ":";
                    break;
                case "]":
                    return "]";
                    break;
                case "}":
                    return "}";
                    break;
                default:
                    return "value";
            }
        },

        StartLine: function (builder, indent) {
            builder.Add("<div>");
            //builder.Add("(" + indent + ")");
            for (var i = 0; i < indent; i++) {
                builder.Add("<span class='indent'>&nbsp</span>");
            }
        },

        EndLine: function (builder) {
            builder.Add("</div>");
        }
    }

}