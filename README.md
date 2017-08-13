# Mr.Carson-TheButler
Copyright (c) 2017 Fan Zhang

This is a web-based utility application that allows a user to control the operating system and perform tasks rapidly from keyboard.  By using a user-defined keyboard shortcut, `Mr.Carson` provides a quick way to find and launch applications and files on the operating system, to search the web for often-used sites such as Google, Yahoo, Amazon & Youtube and to serve as an interface for controlling the operating system with predifined hotkeys.

With the configuration system, `Mr.Carson` can be configured to work on various operating systems and supports user custom searches and features.

## Building & Deploying

### Prerequisites
Make sure to have [node](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) installed.

Check that you have node and npm installed:

	node -v
	npm -v

### Installing

	git clone https://github.com/Fan-Zhang/Mr.Carson-TheButler.git
	cd Mr.Carson-TheButler
	npm install

### Deploying
Start the server on port 3000 by calling `node server.js`

## Dependencies

Since the project consists of several components and each component has individual dependencies, they are being listed separately.

### `server.js`
* `express` - The web framework
* `npm` - Dependency Management
* `keepass.io` - Read KeePass databases

### `index.html`
* `jquey` - HTML document traversal, event handling and Ajax
* `bootStrap` - Front-end framework
* `css` - Styling

### Current Status:
* Finished calculator
* Working on web searching feature

### Next Step:
* Create a server and implement the file searching feature

# Contact Info
Email me at fzhang at pdx dot edu

# License
This program is available under the "MIT License". Please see the file [COPYING](COPYING,md) for license terms.
