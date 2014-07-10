// Copyright (c) 2014 Juan Grande
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
// 
//     (1) Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer. 
// 
//     (2) Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in
//     the documentation and/or other materials provided with the
//     distribution.  
//     
//     (3)The name of the author may not be used to
//     endorse or promote products derived from this software without
//     specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
// IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
// IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE. 

const { Cc, Ci } = require("chrome");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var cm = require("sdk/context-menu");
var panel = require("sdk/panel");
var self = require("sdk/self");
var keepassxdb = require("./keepassxdb");
var pageMod = require("sdk/page-mod");
var prefs = require("sdk/simple-prefs").prefs;
var winutils = require("sdk/window/utils");
var hotkeys = require("sdk/hotkeys");
var keepassx = new keepassxdb.KeePassX();

var focusManager = Cc["@mozilla.org/focus-manager;1"].getService(Ci.nsIFocusManager);

// `withDb` calls `f` passing a KeePassX database as first parameter. The
// database passed is the one referenced by the global variable `keepassx`.
// A panel may be opened asking the user for the passphrase if the database
// hasn't already been opened.
//
function withDb(f) {
	if (!keepassx.isOpen()) {
		var p = panel.Panel({
			width: 400,
			height: 120,
			contentURL: self.data.url("passphrase.html"),
			contentScriptFile: [
				self.data.url("jquery-1.11.1.min.js"),
				self.data.url("panel_passphrase.js"),
			],
			onHide: function() {
				p.destroy();
			},
		});
		p.port.on('passphraseAvailable', function(passphrase) {
			p.hide();
			p.destroy();
			keepassx.open(prefs.dbFilePath, passphrase, prefs.dbTimeoutMins);
			if (keepassx.isOpen()) {
				f && f(keepassx);
			} else {
				console.log('Unable to open database');
			}
		});
		p.show();
	} else {
			f && f(keepassx);
	}
}

// Register hotkey to fetch username or password
//
hotkeys.Hotkey({
    combo: "control-space",
    onPress: function() {
        var el = winutils.getFocusedElement();
        var url = tabs.activeTab.url;
        if (el && el.tagName === 'INPUT') {
            withDb(function(db) {
                var entry = db.search(url);
                if (entry) {
                    if (el.getAttribute('type') === 'password') {
                        el.setAttribute('value', entry.password);
                    } else {
                        el.setAttribute('value', entry.username);
                    }
                }
                focusManager.setFocus(el, 0);
            });
        }
    }
});

/*

// this code was used to provide two context menu items that allowed to read a
// username or password from the database
//
// it's commented out since it doesn't play well with the current design, but
// the idea is to re-enable it some time in the near future

cm.Item({
	label: "KeePassX Username",
	context: cm.SelectorContext("input[type='text']"),
	contentScriptFile: [
		self.data.url("jquery-1.11.1.min.js"),
		self.data.url("guid.js"),
		self.data.url("context_menu.js"),
	],
	onMessage: function(data) {
		withDb(fetchUsername(data.node_guid, data.url));
	}
});

cm.Item({
	label: "KeePassX Password",
	context: cm.SelectorContext("input[type='password']"),
	contentScriptFile: [
		self.data.url("jquery-1.11.1.min.js"),
		self.data.url("guid.js"),
		self.data.url("context_menu.js"),
	],
	onMessage: function(data) {
		withDb(fetchPassword(data.node_guid, data.url));
	}
});
*/
