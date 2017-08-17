chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		var t0 = performance.now();

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("FFXIV - MogStation Shopping Cart Loading: scripts/inject.js");		
		// ----------------------------------------------------------
		

		// ----------------------------------------------------------		
		// Objects 
		function Product(id, name, price, imgUrl, sessionId) {
			this.id = id;
			this.name = name;
			this.price = price;
			this.imgUrl = imgUrl;
			this.sessionId = sessionId;	// used to determine if this product's ID is still valid. 
		}

		let PAGE_TYPE = Object.freeze({
			HOME: "home",
			DETAILS: "details", 
		});
		// ----------------------------------------------------------		
			

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
		// Debug buttons 
		var $buttonHolder = $("<div id='buttonHolder'></div>");

		var $newDiv = $("<div class='testButton'>Click this!</div>");
		$newDiv.click(function() {
			console.log("test button clicked");
			$testInput = $('<input name="_pr_selectItem_string" type="radio" value="3580E6113F7910F5CA37FF86BAEB9241C7" id="skuidFOOBAR" checked>');
			$("form").append($testInput);	
			location.href = "javascript:contentEvent('select', 'skuidFOOBAR');"
		});

		var $newDiv2 = $("<div class='testButton'>Reset Storage</div>");
		$newDiv2.click(function() {
			console.log("Clicked on Reset Storage button");
			var ids = new Map();
			console.log(ids);
			var serialized = mapToJson(ids);
			chrome.storage.sync.set({ "shoppingCart": serialized }, function(){
				//  A data saved callback omg so fancy
			});
		});

		var $newDiv3 = $("<div class='testButton'>Check storage</div>");
		$newDiv3.click(function() {
			console.log("Clicked on Check Storage button");        
			chrome.storage.sync.get("shoppingCart", function(items){
				console.log(items);
				var products = jsonToMap(items.shoppingCart);
				console.log(products);
			});
		});

		var $updateCart = $("<div class='testButton'>Update Cart</div>");
		$updateCart.click(function() {
			console.log("Clicked on Update Cart button");        
			updateCart();
		});


		// Shopping Cart Initialization 
		var pageType = PAGE_TYPE.HOME; 
		if ($("#shop_item_purchase_button").length) {
			pageType = PAGE_TYPE.DETAILS;
		}
		console.log("Page type: " + pageType);

		var currentSessionId = $("input[name='_st_acc']").attr('value');
		console.log(currentSessionId);

		var $shoppingCart = $("<div id='shoppingCart'><h1>Shopping Cart</h1></div>");
		var $itemCount = $("<span id='itemCount'>(0)</span>")
		var $totalCost = $("<span id='totalCost'></span>")
		var $itemList = $("<table id='cartList'></table>");
		
		$shoppingCart.append($itemCount, $totalCost, $itemList);
		$($buttonHolder).append($newDiv, $newDiv2, $newDiv3, $updateCart, $shoppingCart);
		$("body").append($buttonHolder);
		// ----------------------------------------------------------

		
		// ----------------------------------------------------------
		// Adding buttons into page & Updating cart session ID's if possible. 
		function createAddToCartButton(product) {
			var btn = $("<input type='image' class='addToCartBtn' value=" + product.id + " src=" + chrome.extension.getURL('img/cart_icon.png') + ">");	// TODO: Product id here is useless. 
			btn.click(function() {
				var itemId = $(this).attr("value");
				
				// retrieve shopping cart
				chrome.storage.sync.get("shoppingCart", function(items) {					
					// add or update cart
					var shoppingCart = jsonToMap(items.shoppingCart);
					shoppingCart.set(product.name, product);

					// save changes to storage 
					chrome.storage.sync.set({"shoppingCart": mapToJson(shoppingCart)}, function() {});
					
					// update cart display
					updateCart();
				});
			});
			return btn;
		}

		// Update cart session ID and adding buttons to items 
		chrome.storage.sync.get("shoppingCart", function(items) {
			var cachedCart = jsonToMap(items.shoppingCart);

			var updateCount = 0; // keep track of how many items were updated (debug)

			var $items = $(".content_box4"); // each item 
			$items.each( function(index, element) {
				// retrieve product info from DOM
				var itemId = $(this).find("input").attr("value");
				var title = $(this).find("td.text_left a").html();
				var price = 0; 
				if ($(this).find("div.price_bg").length) {  
					// normal price 
					price = $(this).find("div.price_bg div").html().replace("USD", "").trim();
				} else {	
					// discount price  
					price = $(this).find("div.discount_bg span:last").html().replace("USD", "").trim();				
				}
				var imgUrl = $(this).find("div.img_space img:first").attr("src");
				
				// create product object 
				var product = new Product(itemId, title, price, imgUrl, currentSessionId);

				// create and add button display 
				var button = createAddToCartButton(product);
				$(this).find("div.box_body .contents").children(":last").children(":first").append(button);	// append to price ribbon

				// update item in cart 
				var existingProduct = cachedCart.get(product.name);
				if (existingProduct && existingProduct.currentSessionId != currentSessionId) {
					cachedCart.set(product.name, product);
					updateCount++;
				}
			});

			if (updateCount > 0) {
				chrome.storage.sync.set({"shoppingCart": mapToJson(cachedCart)}, function(){});
				updateCart();
				console.log("Updated " + updateCount + " items.");
			}
		});
		// ----------------------------------------------------------
				
		// ----------------------------------------------------------
		// Shopping Cart 
		function updateCart() {
			console.log("updating cart");
			chrome.storage.sync.get("shoppingCart", function(items) {

				// retrieve shopping cart map
				var shoppingCart = jsonToMap(items.shoppingCart);

				// keep track of total cost 
				var total = 0;

				// clear the cart display 
				$itemList.html('');

				for (var [key, product] of shoppingCart) {
					
					// create the parent DOM element 
					var $item = $("<tr class='cartItem'></tr>");
					var $name = $("<td><a>" + product.name + "</a></td>");
					var $price = $("<td>" + product.price + "</td>");
					// buy button removed as the backend uses _st_itemDetailData which is completely random.
					// var $buyBtn = $("<td><img class='cartIcon' src=" + chrome.extension.getURL('img/buy_icon.png') + "></td>");
					var $removeBtn = $("<td><img class='cartIcon' src=" + chrome.extension.getURL('img/remove_icon.png') + "></td>");
					var $previewImg = $("<div class='hover_img_container'><div class='hover_img_border'><img src=" + product.imgUrl + "></div></div>")

					// attach event handlers 
					if (product.sessionId === currentSessionId) {
						$name.click({product: product}, onCartItemClick);	// pass product item (key 'product') to event handler.  
						// $buyBtn.click({product: product}, onCartItemClick);						
					} else {
						$name.addClass("invalidSession");
						// $buyBtn.addClass("invalidSession");
					}
					$removeBtn.click({product: product}, onCartItemRemoveClick);
					
					// add to the cart display
					$item.append($name, $price, $removeBtn, $previewImg);
					$itemList.append($item);

					// calculate the total 
					total += parseFloat(product.price);
				}

				// update the total display
				$itemCount.html("(" + shoppingCart.size + ")");
				$totalCost.html("Total: $" + total.toFixed(2));
			});
		}

		function onCartItemClick(event) {
			$input = $('<input type="hidden" name=' 
				+ (pageType == PAGE_TYPE.HOME ? "_pr_selectItem_string" : "_pr_selectRPItem_string") 
				+ ' type="radio" value=' + event.data.product.id + ' id="skuidFOOBAR" checked>');
			$("form").append($input);	
			location.href = "javascript:contentEvent('select', 'skuidFOOBAR');";	// using function from original page. 
		}

		function onCartItemRemoveClick(event) {
			// retrieve shopping cart 
			chrome.storage.sync.get("shoppingCart", function(items){
				var shoppingCart = jsonToMap(items.shoppingCart);
				var productName = event.data.product.name; 

				// remove product if found
				if (shoppingCart.has(productName)) {
					console.log("Removing " + productName + " from shopping cart");
					shoppingCart.delete(productName);
					chrome.storage.sync.set({"shoppingCart": mapToJson(shoppingCart)}, function() {});
					updateCart();
				} else {
					console.log("Warning: Could not remove item " + productName + " from cart - item not found");
				}
			});
		}

		updateCart();
		// ----------------------------------------------------------
		
		var t1 = performance.now();
		console.log("Extension loaded. Took " + (t1 - t0) + " milliseconds.");
	}
	}, 10);
});


// ALTERNATIVE 
// var s = document.createElement('script');
// s.src = chrome.extension.getURL('src/js/store.js');
// s.onload = function() {
// 		chrome.storage.sync.set({ "yourBody": "myBody" }, function(){
//         chrome.storage.sync.get(/* String or Array */["yourBody"], function(items){
//             //  items = [ { "yourBody": "myBody" } ]
//             console.log(items);
//         });        });
// 	this.remove();
// };
// (document.head || document.documentElement).appendChild(s);


// var mogPlusEvent = document.createEvent('Event');
// mogPlusEvent.initEvent('mogPlusEvent', true, false);