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

const { Cu } = require("chrome");
var data = require("sdk/self").data;
var url = require("sdk/url");
var timers = require("sdk/timers");
var sys = require("sdk/system");

Cu.import("resource://gre/modules/ctypes.jsm");

var libs = [
  { name: 'libkeepassx_cbind.Darwin_x86_64.so', abi: ctypes.default_abi },
	{ name: 'libkeepassx_cbind.Linux_x86_64.so',  abi: ctypes.default_abi },
];


var EntryType = new ctypes.StructType('KeePassX_Entry', [
		{'title': 	 ctypes.char.ptr},
		{'username': ctypes.char.ptr},
		{'password': ctypes.char.ptr},
]);

var keepassx = (function() {
	for (i in libs) {
		try {
			console.log("Trying to open library `" + libs[i].name + "`");
			var lib = ctypes.open(url.toFilename(data.url('lib/' + libs[i].name)));
			var abi = libs[i].abi;
			if (lib != null) {
				var keepassx = {
					init:      lib.declare('KeePassX_Init', abi, ctypes.void_t),
					open:      lib.declare('KeePassX_Open', abi, ctypes.voidptr_t, ctypes.char.ptr, ctypes.char.ptr),
					freedb: 	 lib.declare('KeePassX_FreeDb', abi, ctypes.void_t, ctypes.voidptr_t),
					freeentry: lib.declare('KeePassX_FreeEntry', abi, ctypes.void_t, ctypes.voidptr_t),
					search:    lib.declare('KeePassX_Search', abi, EntryType.ptr, ctypes.voidptr_t, ctypes.char.ptr),
				}
				keepassx.init();
				console.log("Successfully opened library `" + libs[i].name + "`");
				return keepassx;
			}
		} catch(ex) {
			console.log(ex.toString());
		}
	}
})();

var KeePassX = function() {

	this.open = function(dbfile, passphrase, timeoutmins) {
		this.db = keepassx.open(dbfile, passphrase);
		if (typeof(timeoutmins) === "number" && timeoutmins > 0) {
			var timeoutms = timeoutmins * 60000;
			timers.setTimeout(function(obj) {
				obj.close();
			}, timeoutms, this);
		}
	}

	this.isOpen = function() {
		return this.db && !this.db.isNull();
	}

	this.close = function() {
		keepassx.freedb(this.db);
		this.db = null;
	}

	this.search = function(url) {
		var match = keepassx.search(this.db, url);
		var entry = null;

		if (!match.isNull()) {
			entry = {
				title:    match.contents.title.readString(),
				username: match.contents.username.readString(),
				password: match.contents.password.readString(),
			};
			keepassx.freeentry(match);
		}

		return entry;
	}

	return this;
}

exports.KeePassX = KeePassX;
