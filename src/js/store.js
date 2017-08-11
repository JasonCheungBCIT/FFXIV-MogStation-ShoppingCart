/*
chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		
		var $newDiv = $("<div id='testButton'>Click this!</div>");
		$newDiv.click(function() {
			$testInput = $('<input name="_pr_selectItem_string" type="radio" value="F058409474A6A3ACD8B6140242F84F08B4" id="skuidFOOBAR">');
			$("body").append($testInput);	
			contentEvent("select", "skuidFOOBAR");
		});
		$("body").append($newDiv);
		
		// ----------------------------------------------------------

	}
	}, 10);
});
*/
var readyStateCheckInterval = setInterval(function() {
if (document.readyState === "complete") {
    clearInterval(readyStateCheckInterval);

    // ----------------------------------------------------------
    // This part of the script triggers when page is done loading
    console.log("Hello. This message was sent from scripts/inject.js");
    
    var $buttonHolder = $("<div id='buttonHolder'></div>");

    var $newDiv = $("<div class='testButton'>Click this!</div>");
    $newDiv.click(function() {
        console.log("test button clicked");
        $testInput = $('<input name="_pr_selectItem_string" type="radio" value="43F9B78FAB7F44D09A819E688B4296D9B6" id="skuidFOOBAR" checked>');
        $("form").append($testInput);	
        contentEvent("select", "skuidFOOBAR");
    });

    var $newDiv2 = $("<div class='testButton'>Add to storage</div>");
    $newDiv2.click(function() {
        console.log("Clicked on new div 2");
        chrome.storage.sync.set({ "yourBody": "myBody" }, function(){
            //  A data saved callback omg so fancy
        });
    });

    var $newDiv3 = $("<div class='testButton'>Check storage</div>");
    $newDiv2.click(function() {
        console.log("Clicked on new div 3");        
        chrome.storage.sync.get(/* String or Array */["yourBody"], function(items){
            //  items = [ { "yourBody": "myBody" } ]
            console.log(items);
        });
    });

    $($buttonHolder).append($newDiv, $newDiv2, $newDiv3);
    $("body").append($buttonHolder);

    // ----------------------------------------------------------

}
}, 10);