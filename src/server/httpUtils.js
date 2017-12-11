var http = require('http');
var logger = require("./log")

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
				try {	
					resolve(JSON.parse(data));
				} catch(e) {
					logger.error(`Failed to parse JSON: ${data}`);
					reject(e);
				}	
			});

		}).on("error", function(e){
		  reject(e);
		});
	});
}