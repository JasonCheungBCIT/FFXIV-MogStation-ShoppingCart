chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		
		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("FFXIV - MogStation Shopping Cart Loading: scripts/inject.js");		
		var t0 = performance.now();		
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
		// Page initialization 
		var pageType = PAGE_TYPE.HOME; 
		if ($("#shop_item_purchase_button").length) {
			pageType = PAGE_TYPE.DETAILS;
		}
		var currentSessionId = $("input[name='_st_acc']").attr('value');

		console.log("Page type: " + pageType);		
		console.log("Current Session ID: " + currentSessionId);
		// ----------------------------------------------------------


		// ----------------------------------------------------------
		// Shopping Cart 
		var $shoppingCart = $("<div id='shoppingCart'><h1>Shopping Cart</h1></div>");
		var $itemCount = $("<span id='itemCount'>(0)</span>")
		var $totalCost = $("<span id='totalCost'></span>")
		var $itemList = $("<table id='cartList'></table>");
		
		$shoppingCart.append($itemCount, $totalCost, $itemList);
		// $($buttonHolder).append($newDiv, $newDiv2, $newDiv3, $updateCart, $shoppingCart);
		$("body").append($shoppingCart);


		function updateCart() {
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
					var $price = $("<td>$" + product.price + "</td>");
					var $removeBtn = $("<td><img class='cartIcon' src=" + chrome.extension.getURL('img/remove_icon.png') + "></td>");
					var $previewImg = $("<div class='hover_img_container'><div class='hover_img_border'><img src=" + product.imgUrl + "></div></div>")

					// attach event handlers 
					if (product.sessionId === currentSessionId) {
						$name.click({product: product}, onCartItemClick);	// pass product item (key 'product') to event handler.  
					} else {
						$name.addClass("invalidSession");
						$name.attr("title", "Invalid session ID. Please go the page you found this item to update it.")
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
					shoppingCart.delete(productName);
					chrome.storage.sync.set({"shoppingCart": mapToJson(shoppingCart)}, function() {});
					updateCart();
				} else {
					console.log("Warning: Could not remove item " + productName + " from cart - item not found");
				}
			});
		}
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

			var updateCount = 0; // keep track of how many items were updated (debug)

			var cachedCart;
			if (items.hasOwnProperty(shoppingCart)) {
				cachedCart = jsonToMap(items.shoppingCart);
			} else {
				cachedCart = new Map();	
				updateCount++;	// force an update
			}

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

				// create and add button 
				var button = createAddToCartButton(product);
				$(this).find("div.box_body .contents").children(":last").children(":first").append(button);	// append to price ribbon


				// update item in cached cart 
				var existingProduct = cachedCart.get(product.name);
				if (existingProduct && existingProduct.currentSessionId != currentSessionId) {
					cachedCart.set(product.name, product);
					updateCount++;
				}
			});

			// save item updates in storage
			if (updateCount > 0) {
				chrome.storage.sync.set({"shoppingCart": mapToJson(cachedCart)}, function(){
					updateCart();
					console.log("Updated " + updateCount + " items.");
				});
			} else {
				updateCart();
			}

			var t2 = performance.now(); 
			console.log("Final loading finished. Took " + (t2 - t0) + " milliseconds.");		
		});
		// ----------------------------------------------------------

				
		var t1 = performance.now();
		console.log("Extension loaded. Took " + (t1 - t0) + " milliseconds.");
	}
	}, 10);
});