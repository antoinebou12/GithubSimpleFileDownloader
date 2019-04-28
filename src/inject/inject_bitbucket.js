chrome.extension.sendMessage({}, function(response) {
	let readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		let count = 0;
		document.querySelectorAll('tr.iterable-item').forEach(function(item) {
				// get extension icon
				icon = chrome.extension.getURL("src/assets/icons/bitbucket_icon16.png");
				// create img element with icon
				bbsfdownloader = document.createElement('img');
				bbsfdownloader.setAttribute('class', 'bbsfdownloader');
				bbsfdownloader.setAttribute("id", "img" + count.toString());
				bbsfdownloader.setAttribute("src", icon);
				bbsfdownloader.setAttribute("class", "bbsfdownloader");
			
				// link to download page
				link = document.createElement('a')
				link.setAttribute("id", "linkraw" + count.toString());
				link.setAttribute('class', 'bbsfdownloader');
				link.setAttribute("target", "_self");
                
                td = item.childNodes[1]
                
				// put image in to link
                link.appendChild(bbsfdownloader)
                if(td.className.split(/\s+/)[1] === "filename"){
                    item.childNodes[1].childNodes[1].appendChild(link);

                }else if(td.className.split(/\s+/)[1] === "dirname"){
                    item.childNodes[1].appendChild(link);
                }
			
			count++;

		  });
		  
		  for(let i=0; i < count; i++){
				fetchDownloadLink(i)
		  }
		  
			//get raw download link to file and check if is a directory
			function getRawLink(id){
            trContainer = document.querySelectorAll('tr.iterable-item')[id]
            td = trContainer.childNodes[1]
            let dir = false;
			if(td.className.split(/\s+/)[1] === "dirname"){
                linkElement = td.childNodes[1]
                link = linkElement.getAttribute("href");
				dir = true;
				raw_link = link;
			}else if(td.className.split(/\s+/)[1] === "filename"){
                div = td.childNodes[1]
                linkElement = div.childNodes[1]
                link = linkElement.getAttribute("href");

                raw_link = link.replace("src",'raw')
			}
			return [raw_link, dir]
		  }

		  // fetch data for webpage 
		  async function fetchDownloadLink(id){
			return await fetch(getRawLink(id)[0])
				.then(function(response) {
					response.text().then(function(text) {
						// get link element
                        trContainer_linkId = document.querySelectorAll('tr.iterable-item')[id]
                        td = trContainer_linkId.childNodes[1]

						if(getRawLink(id)[1] == false){
                            div = td.childNodes[1]
                            newLinkElement = div.childNodes[3]
							let dataFile = new Blob([text], {type: 'text/plain'});
							newDownloadUrl = window.URL.createObjectURL(dataFile)
							
							newLinkElement.setAttribute("href", newDownloadUrl)
							newLinkElement.setAttribute("download", (/[^/]*$/.exec(getRawLink(id)[0])[0]).replace("?at=master", ""))
						}else{
                            newLinkElement = td.childNodes[3]
                            console.log(td.childNodes)
							newLinkElement.setAttribute("href", getRawLink(id)[0])
						}
						
					})
				.catch(function(error){
					console.error(id, error)
				})
			}) 
		  }

		 async function getFileURLDocument(id){
            trContainer_linkId = document.querySelectorAll('tr.iterable-item')[id]
            td = trContainer_linkId.childNodes[1]
            div = td.childNodes[1]
            newLinkElement = div.childNodes[3]
			return await new Promise(function (resolve, reject) {
				var request = new XMLHttpRequest();
				request.open('GET', linkElement.href , true);
				request.responseType = "document";
				request.onload = function () {
					if (request.status == 200) {
						resolve(this.responseXML);
					}else{
						reject(request.status);
					}
				};
				request.send();
			});
		  }

	}
	}, 10);
});