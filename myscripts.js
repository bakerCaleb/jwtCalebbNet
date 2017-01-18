var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-43600044-1']);
_gaq.push(['_trackPageview']);

var diagTipCount = 0;
var diagExampleCount = 0;

(function () {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


WaitForLoad();
    
function WaitForLoad() {
    if (window.jQuery) {
        if (purl) {
            InitPage();
        }
    } else {
        
        setTimeout(WaitForLoad, 50);
    }
}

function InitPage(){
    
    var exampleJWT = "eyJhbGciOiJSUzI1NiIsIng1dCI6IjdkRC1nZWNOZ1gxWmY3R0xrT3ZwT0IyZGNWQSIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2NvbnRvc28uY29tIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvZTQ4MTc0N2YtNWRhNy00NTM4LWNiYmUtNjdlNTdmN2QyMTRlLyIsIm5iZiI6MTM5MTIxMDg1MCwiZXhwIjoxMzkxMjE0NDUwLCJzdWIiOiIyMTc0OWRhYWUyYTkxMTM3YzI1OTE5MTYyMmZhMSJ9.C4Ny4LeVjEEEybcA1SVaFYFS6nH-Ezae_RrTXUYInjXGt-vBOkAa2ryb-kpOlzU_R4Ydce9tKDNp1qZTomXgHjl-cKybAz0Ut90-dlWgXGvJYFkWRXJ4J0JyS893EDwTEHYaAZH_lCBvoYPhXexD2yt1b-73xSP6oxVlc_sMvz3DY__1Y_OyvbYrThHnHglxvjh88x_lX7RN-Bq82ztumxy97rTWaa_1WJgYuy7h7okD24FtsD9PPLYAply0ygl31ReI0FZOdX12Hl4THJm4uI_4_bPXL6YR2oZhYWp-4POWIPHzG9c_GL8asBjoDY9F5q1ykQiotUBESoMML7_N1g";
    var inputboxWatermarkText = "enter token here";
   
    var referrer; 
    if ("" === document.referrer) {
        referrer = "direct";
    } else {
        referrer = document.referrer;
    }

    _gaq.push(['_trackEvent', 'landing_page', 'navigation',referrer]);
   

    var token = purl(window.location.href, true).param("jwt");

    $("#inputBox").bind('input', function () {
        if (false === $('#inputBox').hasClass("watermark")) {
            DisplayToken($('#inputBox').val());
        }
    });

    //watermark jwt input box
    $('#inputBox').blur(function () {
        if ($(this).val().length === 0) {
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

    ShowShareBox(false);

    $("#ExampleLink").click(function (e) {
        $('#inputBox').val(exampleJWT);
        DisplayToken(exampleJWT);
        if (diagExampleCount === 0) {
            _gaq.push(['_trackEvent', 'user_action', 'use_example_token']);
        }
        diagExampleCount++;
    });
    
    //set token if present
    if (undefined !== token) {        
        $('#inputBox').val(token);
        DisplayToken(token);
    } else {
        if ($('#inputBox').val().length === 0) {
            $('#inputBox').val(inputboxWatermarkText).addClass("watermark");
        }
    }
    AddTips();
}

function AddTips() {
    $('.jsonValue[tip]').css("text-decoration", "underline");
    $('.jsonValue[tip]').mouseenter(function () {
        
        if (diagTipCount == 0) {
            _gaq.push(['_trackEvent', 'user_action', 'claim_value_tip']);
            


        }
        diagTipCount++;

    });

    $('.jsonField[tip]').css("text-decoration", "underline");
    $('.jsonField[tip]').mouseenter(function () {
        
        
        if (diagTipCount == 0) {
            _gaq.push(['_trackEvent', 'user_action', 'claim_value_tip']);
        }
        diagTipCount++;

    });
}

function ShowShareBox(boolShow) {

    if (true == boolShow) {
        // run with share link off, until layout is fixed w/ example token up date
        //  $(".rightItem").fadeIn("medium", "swing");
    } else {
        $(".rightItem").hide();
    }
}

function ShowExampleTokenOption(boolShow) {

    if (true == boolShow) {
      $("#ExampleLink").fadeIn("medium", "swing");
    } else {
        $("#ExampleLink").hide();
    }
}

function DisplayToken(jwtEncoded) {

    // get formated token
    var formattedToken;

    try {
        formattedToken = FormatJWT(jwtEncoded);
        // populate deepLink
        var dLink = CreateDeepLink(jwtEncoded);

        if ("" == dLink) {
            ShowShareBox(false);
        }

        $('#deepLink').val(dLink);

        if ("" != dLink) {
            //ShowExampleTokenOption(false);
            ShowShareBox(true);
        }

        // write JWT to content
        WriteFormatedTokenToPage(formattedToken);
        _gaq.push(['_trackEvent', 'user_action', 'token_diplayed']);
        
        AddTips();
    } catch (err) {
        WriteFormatedTokenToPage(err);
    }
}

function WriteFormatedTokenToPage(token) {
    $('#decodedToken').html(token);

   
   if ($('#inputBox').hasClass("watermark")) {
       $('#inputBox').removeClass("watermark");
   }
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
    var result1;
    var result2;
    var newValue = base64UrlEncodedValue.replace("-", "+").replace("_", "/");
    

    try {

            result1 = window.atob(newValue);
            result2 = decodeURIComponent(escape(window.atob(newValue)));
            if (result1 != result2) {
                _gaq.push(['_trackEvent', 'error_prevented', 'unicode decode']);
                
            }


    } catch (e) {
        throw "Base64URL decode of JWT segment failed";
    }

    return result2;
}

function FormatJWT(jwt) {
    var segments = jwt.split('.');


    if (jwt == "") {
        return "";
    }

    if (segments.length != 3) {
        throw "JWT is required to have three segments";
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
    var currentFieldname = "";
    var digits = "1234567890";

    try {
        $.parseJSON(value);
    } catch (e) {
        _gaq.push(['_trackEvent', 'exception', 'jwt parse error']);
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
            var currentValue = "";

            var tempBuilder = StringBuilder();
            
            if (this.Peek() == "\"") {
                //read value as a string
                currentValue = this.ReadQuotedString(tempBuilder);
            }else if(digits.indexOf(inputChars[index]) >= 0) 
            {
                //read value as an int
                currentValue = this.ReadInt(tempBuilder);
            } else {
                while (" \t\r\n,}]".indexOf(inputChars[index]) < 0) {
                    tempBuilder.Add(inputChars[index]);
                    index++;
                }
            }

            //Add Help Text for claim Value
            
            var helpText = this.GetHelpTextForValue(currentFieldname, currentValue);

            if ("" != helpText) {
                builder.Add("<span class='jsonValue tooltip' ");
                builder.Add("tip='");
                builder.Add(helpText);
                builder.Add("'>");
            } else {
                builder.Add("<span class='jsonValue' >");
            }

            builder.Add(tempBuilder.Value());
            builder.Add("</span>");
        },
        
        GetHelpTextForValue: function(propertyName,propertyValue)
        {
            var timeFields = ["exp", "nbf", "iat"];

            var returnValue = StringBuilder();


            /// Check if the value is a EPOCH time value. If it is, help shows the converted time
            if (timeFields.indexOf(propertyName) > -1) {
                var intTime = parseInt(propertyValue);

                if (!isNaN(intTime)) {
                    var date = new Date(intTime * 1000);
                    returnValue.Add(date.toString());
                }
            }

            return returnValue.Value();
        },

        GetHelpTextForName: function(propertyName)
        {
            var value = "";
            switch (propertyName) {
                case 'alg':
                    value = "Algorithm: signing algorithm. (source JWS spec)";
                    break;
                case 'iss':
                    value = "Issuer: identifies principal that issued the JWT (source JWT spec)";
                    break;
                case 'sub':
                    value = "Subject: identifies the principal that is the subject of the JWT (source JWT spec)";
                    break;
                case 'aud':
                    value = "Audience: identifies the recipients that the JWT is intended for (source JWT spec)";
                    break;
                case 'exp':
                    value = "Expiration: identifies the expiration time on or after which the JWT MUST NOT be accepted for processing (source JWT spec)";
                    break;
                case 'nbf':
                    value = "Not Before: identifies the time before which the JWT MUST NOT be accepted for processing (source JWT spec)";
                    break;
                case 'iat':
                    value = "Issued At: identifies the time at which the JWT was issued (source JWT spec)";
                    break;
                case 'jti':
                    value = "JWT ID: provides a unique identifier for the JWT (source JWT spec)";
                    break;
                case 'typ':
                    value = "Type: used to declare the type of the signed content (source JWS spec)";
                    break;
                case 'x5t':
                    value = "x.509 certificate thumbprint: provides a base64url encoded SHA-1 thumbprint  (source JWS spec)";
                    break;
                case 'tid':
                    value = "Tenant ID: identifies the tenant ID of the token issuer. (source Azure Active Directory documentation)";
                    break;
                case 'amr':
                    value = "Authentication Methods References. JSON array of strings that are identifiers for authentication methods used in the authentication. (source OpenID Connect Core specification)";
                    break;
                case 'name':
                    value = "Name: End-User full name in displayable form including all name parts. (source OpenID Connect Core specification)";
                    break;
                case 'given_name':
                    value = "Given name(s) or first name(s) of the End-User. (source OpenID Connect Core specification)";
                    break;
                case 'family_name':
                    value = "Surname(s) or last name(s) of the End-User. (source OpenID Connect Core specification)";
                    break;
                case 'oid':
                    value = "Object ID: identifies the object ID of the token subject. (source Azure Active Directory documentation)";
                    break;
                case 'groups':
                    value = "Groups: A list of groups that the user belongs to, either thorough direct membership, nested groups, or dynamically calculated. (source SCIM 2.0 Core Schema specification)";
                    break;

            }
            return value;
        },

        //This function reads the name of a json property
        FormatType: function (builder, indent) {
            var tempBuilder = StringBuilder();
            currentFieldname = this.ReadQuotedString(tempBuilder);
            var helpText = this.GetHelpTextForName(currentFieldname);

            if ("" != helpText) {
                builder.Add("<span class='jsonField tooltip' ");
                builder.Add("tip='");
                builder.Add(helpText);
                builder.Add("'>");
            } else {
                builder.Add("<span class='jsonField' ");
                builder.Add(" >");

            }

            builder.Add(currentFieldname);
            builder.Add("</span>");

        },

        ReadQuotedString: function (builder) {
            var slashCount = 0;
            var returnValue = StringBuilder();

            if (this.Peek() == "\"") {
                slashCount = 0;
                builder.Add("\"");
                index++;

                //Continue to read characters until the final quote is found. The final quote is not preceeded by an even number of back slaches
                while (!("\"" == inputChars[index] && (slashCount % 2) === 0)) {
                    builder.Add(inputChars[index]);
                    returnValue.Add(inputChars[index]);
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
        
            return returnValue.Value();
        },

        ReadInt: function (builder)
        {
            var returnValue = StringBuilder();
            while (digits.indexOf(inputChars[index]) >= 0) {
                builder.Add(inputChars[index]);
                returnValue.Add(inputChars[index]);
                index++;
            }
            return returnValue.Value();
        },   

        ExpectedChar: function (char) {
            
            var cp = this.Peek();
            if (cp === char) {
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
                case "[":
                    return "array";
                case ",":
                    return ",";
                case ":":
                    return ":";
                case "]":
                    return "]";
                case "}":
                    return "}";
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