var http = require('http');

/**
 * Download JSON data from a URL.
 */
module.exports.download = function download(url) {
	return new Promise((resolve, reject) => {
		http.get(url, resp => {
			let data = '';
		 
			resp.on('data', chunk => {
				data += chunk;
			});
			 
			resp.on('end', () => {
				resolve(JSON.parse(data));
			});

		}).on("error", function(e){
		  reject(e);
		});
	});
}