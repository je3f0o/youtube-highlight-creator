/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : ajax_hijack.js
* Created at  : 2018-12-06
* Updated at  : 2018-12-06
* Author      : jeefo
* Purpose     : Creating youtube highlight video from live stream.
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
(function main () { "use strict";
	
var ajax_hijacker = function () {
	var SECONDS_PER_CHUNK = 2;
	var original_xhr_open = XMLHttpRequest.prototype.open;
	var original_xhr_send = XMLHttpRequest.prototype.send;

	var highlight = {
		hours    : 4,
		minutes  : 18,
		seconds  : 53,
		duration : 6, // seconds

		calculate_chunk_numbers : function () {
		  var starts_at_by_seconds = (this.hours * 3600) + (this.minutes * 60) + this.seconds;

		  this.start_chunk_number = starts_at_by_seconds / SECONDS_PER_CHUNK;
		  this.end_chunk_number   = this.start_chunk_number + (this.duration / SECONDS_PER_CHUNK);
		}
	};

	XMLHttpRequest.prototype.open = function (http_method, url) {
		this._url    = url;
		this._method = http_method;
		original_xhr_open.apply(this, arguments);
	};

	XMLHttpRequest.prototype.send = function (data) {
		if (this._method === "POST" && this._url === "/live_events_highlights_ajax?action_upload=1") {
			highlight.calculate_chunk_numbers();

			arguments[0] = data.split('&').map(function (part) {
				if (part.startsWith('highlight_start_time_chunk_number=')) {
					return 'highlight_start_time_chunk_number=' + highlight.start_chunk_number;
				} else if (part.startsWith('highlight_end_time_chunk_number=')) {
					return 'highlight_end_time_chunk_number=' + highlight.end_chunk_number;
				}
				return part;
			}).join('&');

			console.log("Hijacked!");
		}

		original_xhr_send.apply(this, arguments);
	};

	// Monkey patched. xD
	XMLHttpRequest.prototype.open.toString = function () {
		return "open() { [native code] }";
	};
	XMLHttpRequest.prototype.send.toString = function () {
		return "send() { [native code] }";
	};
};
var source_code = `(function ajax_hijacker () {${ ajax_hijacker.toString().slice(13, -1) }}());`;

var script    = document.createElement("script");
var text_node = document.createTextNode(source_code);
script.appendChild(text_node);
(document.body || document.head).appendChild(script);

}());
