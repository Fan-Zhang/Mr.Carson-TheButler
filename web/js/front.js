// TODO AUTO-COMPLETION
//      keepass password input -- use pop up window
//      webSearch: Max
//      merge webSearch url to plugins
//      MANUAL  G GOOGLE SL SLACK
//      WHAT FEATURE IS ACTIVATED

/*** Frontend script ***/
jQuery(document).ready(function() {
    jQuery('#s').on('keypress', function(evt) {
            // on carriage return
            if (evt.which === 13) {
                var input = jQuery(this).val();
                updateOutput(dispatch(input))
                return false;
            }
        }
    );

    jQuery('#config-drop-zone').on('dragover', function(evt) {
          evt.stopPropagation();
          evt.preventDefault();
          evt.originalEvent.dataTransfer.dropEffect = 'copy';
        }
    );

    jQuery('#config-drop-zone').on('drop', function(evt) {
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

                        jQuery('#s').prop("disabled", false);

                        var s = document.getElementById('s');
						var type_this = "How may I help you, sir/ma\'am?";
                        var index = 0;

                        window.next_letter = function() {
                            if (index <= type_this.length) {
                                s.value = type_this.substr(0, index++);
                                setTimeout("next_letter()", 80);
                            }
                        }

                        next_letter();

                        jQuery('#s').focus();

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

});  // jQuery(document).ready(function() {...});

var config = {};

function dispatch(input)
{
    // If no space's found, indexOf() returns -1,
    // then `pluginInput` is the same as `input`
    var pluginInput = input.substring(input.indexOf(' ')+1);
    for (var i = 0; i < plugins.length; i++) {
        var plugin = plugins[i];
        if (plugin.pattern.test(input)) {
            // `pluginConfig` could be `undefined` if not in the config file
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
    { id: 'calculator',  pattern: /^= /,            action: calculator    },
    { id: 'google',      pattern: /^(g|google) /,   action: webSearch     },
    { id: 'lucky',       pattern: /^lucky /,        action: webSearch     },
    { id: 'youtube',     pattern: /^(yo|youtube) /,   action: webSearch   },
    { id: 'yahoo',       pattern: /^(y|yahoo) /,   action: webSearch      },
    { id: 'bing',        pattern: /^(b|bing) /,   action: webSearch       },
    { id: 'amazon',      pattern: /^(a|amazon) /, action: webSearch       },
    { id: 'maps',        pattern: /^maps /,       action: webSearch       },
    { id: 'dict',        pattern: /^(d|dic) /,      action: openApp       },
    { id: 'slack',       pattern: /^(s|slack)/,    action: openApp        },
    { id: 'firefox',     pattern: /^(f|firefox)/,    action: openApp      },
    { id: 'chrome',     pattern: /^(c|chrome)/,    action: openApp      },
    { id: 'text-edit',     pattern: /^(t|text)/,    action: openApp      },
    { id: 'file-search', pattern: /^'/,             action: fileSearch    },
    { id: 'file-open',   pattern: /^\//,               action: openApp    },
    { id: 'keepass',     pattern: /^k|kee /,        action: keePassSearch },
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

function webSearch(config, input, pluginInput, callback) {
    var newWindow = null;
    if (/^(g|google) /.test(input)) {
        newWindow = window.open('https://www.google.com/search?q='+encodeURIComponent(pluginInput));
    } else if (/^lucky /.test(input)) {
        newWindow = window.open('http://www.google.com/search?q='+encodeURIComponent(pluginInput)+'&btnI');
    } else if (/^(yo|youtube) /.test(input)) {
        newWindow = window.open('https://www.youtube.com/results?search_query='+encodeURIComponent(pluginInput));
    } else if (/^(y|yahoo) /.test(input)) {
        newWindow = window.open('https://search.yahoo.com/search?p='+encodeURIComponent(pluginInput));
    } else if (/^(b|bing) /.test(input)) {
        newWindow = window.open('https://www.bing.com/search?q='+encodeURIComponent(pluginInput));
    } else if (/^(a|amazon) /.test(input)) {
        newWindow = window.open('https://www.amazon.com/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords='+encodeURIComponent(pluginInput));
    } else if (/^maps /.test(input)) {
		// https://developers.google.com/maps/documentation/urls/guide
        newWindow = window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(pluginInput))
    }

    if (newWindow) {
        return 'Opening new window...';
    } else {
        return 'Something went wrong...';
    }
}

function openApp(config, input, pluginInput, callback) {
    jQuery.get('/app',
               { input: input, pluginInput: pluginInput, config: config },
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
                   var arr = data.split('\n');
                   var result = [];
                   for (var i in arr) {
                       if (arr[i] != '') {
                           result.push(arr[i].link('#'));
                       }
                   }
                   jQuery('#output').html(result.join('\n'));
                   jQuery('#output a').on('click', function() {
                       dispatch(jQuery(this).text());
                   });
               }
    );
    return 'Searching...';
}

function keePassSearch(config, input, pluginInput, callback) {
    jQuery.get('/keepass',
               { input: input, config: config },
               function(data, status) {
                   callback(data.map(entryToString).join("\n\n"));
               }
    );
    return 'Searching...';
}

// helper functions of the KeePass plugin
function entryToString(e) {
    return e.map(pairToString).join("\n");
}

function pairToString(p) {
    if (p.Key === 'Password') {
        return 'Password: ' + p.Value._;
    } else {
        return p.Key + ': ' + p.Value;
    }
}
