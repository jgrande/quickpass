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

$(document).ready(function() {
		self.port.on('username_available', function(data) {
			var el = $('input[quickpass_id="' + data.node_guid + '"]');
			el.val(data.username);
			el.focus();
			self.port.emit('done');
		});
		self.port.on('password_available', function(data) {
			var el = $('input[quickpass_id="' + data.node_guid + '"]');
			el.val(data.password);
			el.focus();
			self.port.emit('done');
		});
		$('input[type!="password"]').keypress(function(ev) {
			if (ev.key.toLowerCase() === 'k' && ev.ctrlKey && ev.shiftKey) {
				var node_guid = guid();
				$(this).attr('quickpass_id', node_guid);
				self.port.emit('fetch_username', { url: document.URL, node_guid: node_guid });
				return false;
			}
		});
		$('input[type="password"]').keypress(function(ev) {
			if (ev.key.toLowerCase() === 'k' && ev.ctrlKey && ev.shiftKey) {
				var node_guid = guid();
				$(this).attr('quickpass_id', node_guid);
				self.port.emit('fetch_password', { url: document.URL, node_guid: node_guid });
				return false;
			}
		});
});
