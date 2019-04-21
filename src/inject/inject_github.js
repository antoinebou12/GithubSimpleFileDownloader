chrome.extension.sendMessage({}, function(response) {
	let readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		let count = 0;
		document.querySelectorAll('td.content').forEach(function(item) {
			if(count >= 1){
				// get extension icon
				icon = chrome.extension.getURL("src/assets/icons/github_icon16.png");
				// create img element with icon
				ghsfdownloader = document.createElement('img');
				ghsfdownloader.setAttribute('class', 'ghsfdownloader');
				ghsfdownloader.setAttribute("id", "img" + count.toString());
				ghsfdownloader.setAttribute("src", icon);
				ghsfdownloader.setAttribute("class", "ghsfdownloader");
			
				// link to download page
				link = document.createElement('a')
				link.setAttribute("id", "linkraw" + count.toString());
				link.setAttribute('class', 'ghsfdownloader');
				link.setAttribute("target", "_self");


				// put image in to link
				link.appendChild(ghsfdownloader)
				item.appendChild(link);

				fileInfo = document.createElement('span')
				fileInfo.setAttribute("id", "filesize" + count.toString());
				fileInfo.setAttribute('class', 'ghsfdownloader');
				item.appendChild(fileInfo)
			}
			
			count++;

		  });
		  
		  for(let i=0; i < count; i++){
			  if(i >= 1){
				fetchDownloadLink(i)
			  }
		  }
		  
			//get raw download link to file and check if is a directory
			function getRawLink(id){
			tdContainer = document.querySelectorAll('td.content')[id]
			span = tdContainer.childNodes[1]
			linkElement = span.childNodes[0]
			link = linkElement.getAttribute("href");
			var regex_ext = /(?:\.([^.]+))?$/;
			// console.log(id)
			let dir = false;
			if(regex_ext.exec(link)[1] == null){
				// console.log("dir")
				dir = true;
				raw_link = link;
			}else{
				raw_link = "https://raw.githubusercontent.com" + link.replace("blob/",'')
			}
			// console.log(raw_link)
			return [raw_link, dir]
		  }

		  // fetch data for webpage 
		  async function fetchDownloadLink(id){
			return await fetch(getRawLink(id)[0])
				.then(function(response) {
					response.text().then(function(text) {
						// get link element
						tdContainer_linkId = document.querySelectorAll('td.content')[id]
						newLinkElement = tdContainer_linkId.childNodes[3]
						
						if(getRawLink(id)[1] == false){
							let dataFile = new Blob([text], {type: 'text/plain'});
							newDownloadUrl = window.URL.createObjectURL(dataFile);
							
							newLinkElement.setAttribute("href", newDownloadUrl)
							newLinkElement.setAttribute("download", /[^/]*$/.exec(getRawLink(id)[0])[0])
							getFileURLDocument(id).then(function(result) {
								changeFileSize(id, result);
							});
						}else{

							newLinkElement.setAttribute("href", getRawLink(id)[0])
						}
						
					})
				.catch(function(error){
					console.error(id, error)
				})
			}) 
		  }

		 async function getFileURLDocument(id){
			tdContainer_linkId = document.querySelectorAll('td.content')[id]		
			newLinkElement = tdContainer_linkId.childNodes[3]
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

		  function changeFileSize(id, webPage){
			tdContainer_linkId = document.querySelectorAll('td.content')[id]
			body = webPage.getElementsByTagName("body")[0];
			console.log(body)
			newSpanElement = tdContainer_linkId.childNodes[4]
			divInfo = body.getElementsByClassName("text-mono f6 flex-auto pr-3 flex-order-2 flex-md-order-1 mt-2 mt-md-0")[0];
			fileInfo = ((divInfo.innerHTML).split(/\r?\n/));
			for(let i=0;i<fileInfo.length;i++){
				if(fileInfo[i].includes("Bytes") || fileInfo[i].includes("KB") || fileInfo[i].includes("MB") || fileInfo[i].includes("GB")){
					fileSize = fileInfo[i].replace("    "," ")
					console.log(id ,fileSize)
				}

			}
			newSpanElement.innerHTML = fileSize
		  }
		  


	}
	}, 10);
});