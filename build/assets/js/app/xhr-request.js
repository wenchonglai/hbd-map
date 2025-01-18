let xhrRequest = function request( url, type = 'get', data ) {
	return new Promise(function (resolve, reject) {
		const xhr = new XMLHttpRequest();
		xhr.timeout = 2000;
		xhr.onreadystatechange = function(e) {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					resolve(xhr.response)
				} else {
					reject(xhr.status)
				}
			}
		}
		xhr.ontimeout = function () {
			reject('timeout')
		}
		xhr.open(type, url, true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(data));
	})
}
