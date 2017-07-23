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
                updateOutput(dispatch(input))
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
            if (evt.originalEvent.dataTransfer.files.length != 1) {
                updateOutput('Only one JSON config file allowed.');
            } else {
                var configFile = evt.originalEvent.dataTransfer.files[0];
                var reader = new FileReader();
                reader.onload = function(evt) {
                    try {
                        config = JSON.parse(evt.target.result);
                        updateOutput('Config file loaded successfully!');
                        jQuery('#s').prop("disabled", false)
                                    .val("How may I help you, sir/ma'am?")
                                    .focus();
                        jQuery('#config-drop-zone').toggle();
                    } catch (err) {
                        updateOutput(err.message);
                    }
                };
                reader.readAsText(configFile);
            }
            return false;
        }
    );
});

var config = {};

function dispatch(input)
{
    // If no space's found, indexOf() returns -1,
    // then pluginInput is the same as input
    var pluginInput = input.substring(input.indexOf(' ')+1);
    for (var i = 0; i < plugins.length; i++) {
        var plugin = plugins[i];
        if (plugin.pattern.test(input)) {
            var pluginConfig = config.PluginConfig[plugin.id];
            var output = '';
            try {
                output = plugin.action(
                    pluginConfig,
                    input,
                    pluginInput,
                    updateOutput
                );
            } catch (err) {
                output = err.message;
            }
            return output;
        }
    }
    return "No matching plugin.";
}

function updateOutput(output) {
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
     * Action returns a string that serves as an immediate feedback.
     * Action may throw exceptions.
     */
    { id: 'calculator',  pattern: /^= /,          action: calculator    },
    { id: 'google',      pattern: /^(g|google) /, action: googleSearch  },
    { id: 'dict',        pattern: /^(d|dic) /,    action: openApp       },
    { id: 'slack',       pattern: /^(s|slack) /,  action: openApp       },
    { id: 'file-search', pattern: /^'/,           action: fileSearch    },
    { id: 'keepass',     pattern: /^k|kee /,      action: keePassSearch },
];

function calculator(config, input, pluginInput, callback) {
    // Allowed symbols: + - * / % space () . 0-9
    var regex = /^[+-\\*/\d%() .]*$/;
    var output = '';
    if (regex.test(pluginInput)) {
        output = eval(pluginInput);
    } else {
        output = 'Invalid expression';
    }
    return output;
}

function googleSearch(config, input, pluginInput, callback) {
    var newWindow = window.open('https://www.google.com/?q='+pluginInput);
    if (newWindow) {
        return 'Opening new window...';
    } else {
        return 'Something went wrong...';
    }
}

function openApp(config, input, pluginInput, callback) {
    jQuery.get('/app',
               { input: input, config: config },
               function(data, status) {
                   callback(data);
               }
    );
    return 'Opening app ...';
}

function fileSearch(config, input, pluginInput, callback) {
    jQuery.get('/search',
               { input: input.substring(1), config: config },
               function(data, status) {
                   callback(data);
               }
    );
    return 'Searching...';
}

function keePassSearch(config, input, pluginInput, callback) {
    jQuery.get('/keepass',
               { input: input, config: config },
               function(data, status) {
                   callback(data);
               }
    );
    return 'Searching...';
}
