// TODO AUTO-COMPLETION
//      AJAX
//      MANUAL  G GOOGLE SL SLACK
//      MODIFY OUTPUT BOX TO SHOW NAV BAR
//      WHAT FEATURE IS ACTIVATED
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
                } else if (/^(s|slack)/.test(input)) {
                    jQuery.get('/app', {name: input}, function(data, status) {
                    });
                } else if (/^'/.test(input)) {
                    jQuery.get('/search', {name: input.substring(1)}, function(data, status) {
                        jQuery('#output')
                            .css({
                                'font-size':'17px',
                            })
                            .text(data.toString());
                    });
                }
                return false;
            }
        });
})
