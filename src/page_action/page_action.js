console.log("page_action.js loading");


// ----------------------------------------------------------		
// Helpers  
function mapToJson(map) {
    return JSON.stringify([...map]);
}
function jsonToMap(jsonStr) {
    return new Map(JSON.parse(jsonStr));
}
// ----------------------------------------------------------		


// ----------------------------------------------------------		
// Functions
function clearCart() {
    var map = new Map();
    chrome.storage.sync.set({"shoppingCart": mapToJson(map)}, function(){
        updateCart();
    });
}

function updateCart() {
    chrome.storage.sync.get("shoppingCart", function(items) {
        var cart = jsonToMap(items.shoppingCart);
        
        // Update cart size 
        $("#itemCount").text(cart.size);
        
        // Update total cost 
        var total = 0;
        for (var item of cart.values())
            total += parseFloat(item.price);
        $("#totalCost").text(total.toFixed(2));
    });
}
// ----------------------------------------------------------		


// ----------------------------------------------------------		
// Initialization
updateCart();
$("#clearCartBtn").click(function() { 
    clearCart(); 
});
// ----------------------------------------------------------		


console.log("page_action.js loaded.");
