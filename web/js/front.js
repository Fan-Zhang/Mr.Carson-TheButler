// Copyright (c) 2017 Fan Zhang
// This work is available under the "MIT license".
// Please see the file COPYING in this source
// distribution for license terms.


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
                        var config = JSON.parse(evt.target.result);
                        plugins = config.PluginConfig;
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

/* Each plugin needs to provide an id, a pattern,
 * an action, which is executed when matched,
 * and some other plugin-specific configurations.
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
var plugins = [];

function dispatch(input)
{
    // If no space's found, indexOf() returns -1,
    // then `pluginInput` is the same as `input`
    var pluginInput = input.substring(input.indexOf(' ')+1);
    for (var i in plugins) {
        var pluginConfig = plugins[i];
        var pattern = new RegExp(pluginConfig.pattern);

        if (pattern.test(input)) {
            var output = '';
            try {
                var action = window[pluginConfig.action];;
                output = action(
                    pluginConfig,
                    input,
                    pluginInput,
                    updateOutput
                );
            } catch (err) {
                if (err.message === 'action is not a function') {
                    output = 'No matching plugin.'
                } else {
                    output = err.message;
                }
            }
            return output;
        }
    }
    return "No matching plugin.";
}

function updateOutput(output) {
    jQuery('#output').text(output);
}

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

    if (config.id === 'lucky') {
        newWindow = window.open(config.url + encodeURIComponent(pluginInput) + config.param);
    } else {
        newWindow = window.open(config.url + encodeURIComponent(pluginInput));
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
                   //if (data === 'Yes\nNo') {
                   if (data.includes('Trash')) {
                       emptyTrash();
                   } else {
                       callback(data);
                   }
               }
    );
    return 'Opening app ...';
}

// helper function for empty Trash after openning Trash
function emptyTrash() {
    for (var i in plugins) {
        if (plugins[i].id === 'empty trash') {
            var pluginConfig = plugins[i];
        }
    }

    jQuery('#output').html('Do you want to empyt the Trash ?'+'\n'+'\n'+'Yes'.link('#')+'\n'+'No'.link('#'));

    jQuery('#output a').on('click', function() {
        if (jQuery(this).text() === 'Yes') {
            system(pluginConfig, 'et', 'et', updateOutput);
        }
    });
}

function system(config, input, pluginInput, callback) {
    jQuery.get('/sys',
               { input: input, pluginInput: pluginInput, config: config },
               function(data, status) {
                   callback(data);
               }
    );
    return config.message;
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
