var load;
(function(){
    var sanatizedPageRegexp = /(\w+).(?:md|markdown)/;
    var oldSelection;
    "use strict"; //strict mode is good.
    function done(responseText){
        var htmlPage = document.getElementById("page");
        marked(responseText, function (err, renderedHTML) {
            if (err) throw err;
            console.log(renderedHTML);
            htmlPage.innerHTML = renderedHTML;
            var qs = htmlPage.querySelector("h1");
            document.title = qs.innerText;
            qs.tabIndex = -1;
            document.body.setAttribute("aria-busy", "false");
            qs.focus();
        });
    }
    var recursionSafety = 0; //If this gets above two, the error page is not tried again.
    load = function(page){ //export it from the  closure
        
        var item = document.getElementById("nav"+page.replace(sanatizedPageRegexp, "$1"));
        if(item){ //This is a menu item.
            oldSelection.parentNode.classList.remove("active");
            oldSelection.removeAttribute("aria-current");
            item.parentNode.classList.add("active");
            item.setAttribute("aria-current", "page");
            oldSelection = item;
        }
        if(recursionSafety >1) {
            recursionSafety = 0;
            done("<h1>Error</h1>error, Sorry, something went wrong.");
        }
        document.body.setAttribute("aria-busy", "true");
        
        //based on w3 schools example
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4 && xhttp.status == 200) {
                recursionSafety = 0;
                done(xhttp.responseText);
            }
            else
            {
                if(xhttp.status == 404){
                    recursionSafety++;
                    load("404.md")
                }
            }
        };
        xhttp.open("GET", page, true);
        xhttp.send();
    }
    function run(){
        //Url is the first side of the hash, the link text is the second item.
        var i=0;
        for(i in files){
            if(!sanatizedPageRegexp.test(i)){
                throw("Invalid page  file name.");
            }
            var navLiItem = document.createElement("li");
            navLiItem.classList.add("nav_item");
            navLiItem.classList.add("flex-column");
            var navItem = document.createElement("a");
            navItem.classList.add("nav_link");
            navItem.setAttribute("id", "nav"+i.replace(sanatizedPageRegexp, "$1"));
            navItem.setAttribute("href", "javascript:void(load('"+i+"'));");
            var node = document.createTextNode(files[i]);
            navItem.appendChild(node);
            navLiItem.appendChild(navItem);
            var element = document.getElementById("nav");
            element.appendChild(navLiItem);
        }
        var fileParam = document.location.hash;
        console.log(fileParam);
        oldSelection = document.getElementById("navindex")
        if(fileParam){
            var fileName = fileParam.match(/#(\w+.(?:md|markdown))\/?/)[1];
            console.log(fileName);
            load(fileName);
        }
        else{
            load("index.md");
        }
    }
    window.addEventListener("load", run);
})(); //closure