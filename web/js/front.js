// TODO AUTO-COMPLETION
//      MANUAL  G GOOGLE SL SLACK
/*** Frontend script ***/
jQuery(document).ready(function() {
    jQuery('input')
        .on('keypress', function() {
            // on carriage return
            if (event.which === 13) {
                var input = jQuery(this).val();
                var inputKeywords = input.substring(input.indexOf(' ')+1);

                // --- Util: Calculator --- //
                if (/^= /.test(input)) {
                    // allowed symbols: + - * /  % space () . 0-9
                    var regex = /^[+-\\*/\d%() .]*$/;
                    if (regex.test(inputKeywords)) {
                        var output = eval(inputKeywords);
                        jQuery('#output').text(output);
                    } else {
                        jQuery('#output').text('invalid expression');
                    }

                    // --- Web Search: Google --- //
                } else if (/^(g|google) /.test(input)) {
                    window.open('https://www.google.com/#q='+inputKeywords);

                    // --- App: Dictionary --- //
                } else if (/^(d|dic) /.test(input)) {
                    jQuery.get('/app', {name: input}, function(data, status) {
                    });
                    // --- App: Slack --- //
                } else if (/(s|slack)/.test(input)) {
                    jQuery.get('/app', {name: input}, function(data, status) {
                    });
                }
                return false;
            }
        });
})
