const http = require("http");
const logger = require("./logUtils").logger;

let debug = false;

/**
 * Download JSON data from a URL.
 */
function download(url) {
	return new Promise((resolve, reject) => {
		http.get(url, resp => {
			let data = "";
		 
			resp.on("data", chunk => {
				data += chunk;
			});
			 
			resp.on("end", () => {
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

/**
 * Sets whether to debug or not.
 */
function setDebug(d) {
	debug = d;
}

module.exports.download = download;
module.exports.setDebug = setDebug;
