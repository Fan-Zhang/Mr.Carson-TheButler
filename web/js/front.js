// TODO AUTO-COMPLETION
//      AJAX
//      MANUAL  G GOOGLE SL SLACK
//      MODIFY OUTPUT BOX TO SHOW NAV BAR
//      WHAT FEATURE IS ACTIVATED
/*** Frontend script ***/
jQuery(document).ready(function() {
    jQuery('#s').on('keypress',
        function(evt) {
            // on carriage return
            if (evt.which === 13) {
                var input = jQuery(this).val();
                var inputKeywords = input.substring(input.indexOf(' ')+1);
                updateOutputDiv(dispatch(input, inputKeywords))
                return false;
            }
        }
    );
    jQuery('#config-drop-zone').on('dragover',
        function(evt) {
          evt.stopPropagation();
          evt.preventDefault();
          evt.originalEvent.dataTransfer.dropEffect = 'copy';
        }
    );
    jQuery('#config-drop-zone').on('drop',
        function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            var configFile = evt.originalEvent.dataTransfer.files[0];
            var reader = new FileReader();
            reader.onload = function(evt) {
                config = JSON.parse(evt.target.result);
            };
            reader.readAsText(configFile);
            return false;
        }
    );
});

var config;

function dispatch(input, inputKeywords)
{
    for (var i = 0; i < plugins.length; i++) {
        var plugin = plugins[i];
        if (plugin.pattern.test(input)) {
            var pluginConfig = config ?  config.PluginConfig[plugin.id] : {};
            return plugin.action(
                pluginConfig,
                input,
                inputKeywords,
                updateOutputDiv
            );
        }
    }
}

function updateOutputDiv(output) {
    jQuery('#output').text(output);
}

var plugins = [
    /* Each plugin needs to provide a pattern
     * and an action, which is executed when matched.
     *
     * Action is a function that takes
     *     - the config object
     *     - the whole input string
     *     - the substring after the first space
     *     - a callback function that is executed
     *       if an ajax call is made successfully.
     * Action returns a string that servers as an immediate feedback.
     */
    { id: 'calculator',  pattern: /^= /,          action: calculator   },
    { id: 'google',      pattern: /^(g|google) /, action: googleSearch },
    { id: 'dict',        pattern: /^(d|dic) /,    action: openApp      },
    { id: 'slack',       pattern: /^(s|slack) /,  action: openApp      },
    { id: 'file-search', pattern: /^'/,           action: fileSearch   },
];

function calculator(config, input, inputKeywords, callback) {
    // allowed symbols: + - * / % space () . 0-9
    var regex = /^[+-\\*/\d%() .]*$/;
    var output = '';
    if (regex.test(inputKeywords)) {
        output = eval(inputKeywords);
    } else {
        output = 'Invalid expression';
    }
    return output;
}

function googleSearch(config, input, inputKeywords, callback) {
    window.open('https://www.google.com/?q='+inputKeywords);
    return 'Opening new window...';
}

function openApp(config, input, inputKeywords, callback) {
    jQuery.get('/app', {name: input, config: config}, function(data, status) {});
    return 'Opening ' + input + ' ...';
}

function fileSearch(config, input, inputKeywords, callback) {
    jQuery.get('/search', {name: input.substring(1), config: config}, function(data, status) {
        callback(data.toString());
    });
    return 'Searching...';
}
