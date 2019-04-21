chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        let count = 0;
		document.querySelectorAll('td.tree-item-file-name').forEach(function(item) {
			// get extension icon
			icon = chrome.extension.getURL("src/assets/icons/gitlab_icon16.png");
			// create img element with icon
			glsfdownloader = document.createElement('img');
			glsfdownloader.setAttribute('class', 'glsfdownloader');
			glsfdownloader.setAttribute("id", "img" + count.toString());
			glsfdownloader.setAttribute("src", icon);
			glsfdownloader.setAttribute("class", "glsfdownloader");
			
			// link to download page
			link = document.createElement('a')
			link.setAttribute("id", "linkraw" + count.toString());
            link.setAttribute('class', 'glsfdownloader');
            link.setAttribute("target", "_self");


			// put image in to link
			link.appendChild(glsfdownloader)
            item.appendChild(link);
            
            //file size info
			fileInfo = document.createElement('span')
			fileInfo.setAttribute("id", "filesize" + count.toString());
			fileInfo.setAttribute('class', 'glsfdownloader');
			item.appendChild(fileInfo)
        

			count++;

          });

          for(let i=0; i < count; i++){
              fetchDownloadLink(i)
        }

        //get raw download link to file and check if is a directory
		function getRawLink(id){
		    tdContainer = document.querySelectorAll('td.tree-item-file-name')[id]
            linkElement = tdContainer.childNodes[3]
			link = linkElement.getAttribute("href");
			var regex_ext = /(?:\.([^.]+))?$/;
			// console.log(id)
			let dir = false;
			if(regex_ext.exec(link)[1] == null){
				// console.log("dir")
				dir = true;
				raw_link = link;
			}else{
				raw_link = "https://gitlab.com" + link.replace("blob/","raw/")
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
						tdTree_linkid = document.querySelectorAll('td.tree-item-file-name')[id]
                        newLinkElement = tdTree_linkid.childNodes[5]
						
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
			tdTree_linkid = document.querySelectorAll('td.tree-item-file-name')[id]		
			newLinkElement = tdTree_linkid.childNodes[5]
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
            tdTree_linkid = document.querySelectorAll('td.tree-item-file-name')[id]
            newSpanElement = tdTree_linkid.childNodes[6]
			body = webPage.getElementsByTagName("body")[0];
			divInfo = body.getElementsByTagName("small")[0];
			fileInfo = divInfo.innerHTML
			newSpanElement.innerHTML = fileInfo
		  }

		  

	}
	}, 10);
});