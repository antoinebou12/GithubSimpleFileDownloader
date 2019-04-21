chrome.extension.sendMessage({}, function(response) {
	let readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------
		let count = 0;
		document.querySelectorAll('td.content').forEach(function(item) {
			
			icon = chrome.extension.getURL("icons/icon16.png");

			ghsfdownloader = document.createElement('img');
			ghsfdownloader.setAttribute('class', 'ghsfdownloader');
			ghsfdownloader.setAttribute("id", "img" + count.toString());
			ghsfdownloader.setAttribute("src", icon);
			ghsfdownloader.setAttribute("class", "ghsfdownloader");

			link = document.createElement('a')
			link.setAttribute("id", "linkraw" + count.toString());
			link.setAttribute('class', 'ghsfdownloader');

			link.appendChild(ghsfdownloader)
			item.appendChild(link);

			count++;

		  });
		  let downloadlinks = [];
		  for(let i=0;i < count;i++){
			  if(i >= 1){
				fetchDownloadLink(i)
			  }
		  }

		  function getRawLink(id){
			tdContainer = document.querySelectorAll('td.content')[id]
			span = tdContainer.childNodes[1]
			linkElement = span.childNodes[0]
			link = linkElement.getAttribute("href");
			var regex_ext = /(?:\.([^.]+))?$/;
			console.log(id)
			let dir = false;
			if(regex_ext.exec(link)[1] == null){
				console.log("dir")
				dir = true;
				raw_link = chrome.extension.getURL("src/html/error.txt");
			}else{
				raw_link = "https://raw.githubusercontent.com" + link.replace("blob/",'')
			}
			console.log(raw_link)
			return [raw_link, dir]
		  }

		  async function fetchDownloadLink(id){
			return await fetch(getRawLink(id)[0])
				.then(function(response) {
					response.text().then(function(text) {
						if(getRawLink(id)[1] == false){
							let dataFile = new Blob([text], {type: 'text/plain'});
							newDownloadUrl = window.URL.createObjectURL(dataFile);
							tdContainer_linkId = document.querySelectorAll('td.content')[id]
							newLinkElement = tdContainer_linkId.childNodes[3]
							newLinkElement.setAttribute("href", newDownloadUrl)
							newLinkElement.setAttribute("download", /[^/]*$/.exec(getRawLink(id)[0])[0])
						}
					})
				.catch(function(error){
					console.error(id, error)
				})
			}) 
		  }


	}
	}, 10);
});