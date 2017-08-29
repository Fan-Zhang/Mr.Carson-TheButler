# Mr.Carson-TheButler
Copyright (c) 2017 Fan Zhang

This is a web-based utility application that allows a user to control the operating system and perform tasks promptly from keyboard.  By using user-defined keyboard shortcuts, `Mr.Carson` provides a quick way to find and launch applications and files on the operating system, to search the web for frequently-used web sites and to serve as an interface for controlling the operating system.

With the configuration system, `Mr.Carson` can be configured to work on various operating systems and support user custom searches and features.

For a short demo of the use cases:

[https://youtu.be/rqtykRWg8uo](https://youtu.be/rqtykRWg8uo)

## Deploying

### Prerequisites
Make sure to have [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/) installed.

Check that you have node and npm:

	node -v
	npm -v

### Installing
Clone the repo

	git clone https://github.com/Fan-Zhang/Mr.Carson-TheButler.git

Change directory to the repo

	cd Mr.Carson-TheButler

Install dependencies

	npm install

### Running
Start the server

    npm start

Then open [http://localhost:3000](http://localhost:3000) in the browser and follow the `Manual` on the webpage.

### Configuration
This application is now configured for macOS, but given proper config file, it is compatible with other operating systems.
When the server is ready, go to port 3000 and load the configuration file `mrcarson-config.mac.json` as instructed.
The config file doesn't have to be under the same directory as the application, you can keep it wherever you wish.

## Dependencies

Since the project consists of several components and each component has individual dependencies, they are being listed separately.

### `server.js`
* `Express` - The web framework
* `npm` - Dependency Management
* `keepass.io` - Read KeePass databases

### `index.html`
* `jQuery` - HTML document traversal, event handling and Ajax
* `Bootstrap` - Front-end framework / `fontawesome`
* `CSS` - Styling

# Contact Info
Email me at fzhang at pdx dot edu

# License
This program is available under the "MIT License". Please see the file [COPYING](COPYING,md) for license terms.
