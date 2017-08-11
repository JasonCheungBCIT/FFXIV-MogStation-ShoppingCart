chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");		
		// ----------------------------------------------------------
		
		var t0 = performance.now();

		// ----------------------------------------------------------		
		// Objects 
		function Product(id, name, price, imgUrl, sessionId) {
			this.id = id;
			this.name = name;
			this.price = price;
			this.imgUrl = imgUrl;
			this.sessionId = sessionId;	// used to determine if this product's ID is still valid. 
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

		var $newDiv2 = $("<div class='testButton'>Reset storage</div>");
		$newDiv2.click(function() {
			console.log("Clicked on new div 2");
			var ids = [
				// new Product("111", "Test Product 1 ","10.00","img_link"),
				// new Product("222", "Test Product 2 ","20.00","img_link"),
				// new Product("333", "Test Product 3 ","30.00","img_link"),
			];
			chrome.storage.sync.set({ "shoppingCart": ids }, function(){
				//  A data saved callback omg so fancy
			});
		});

		var $newDiv3 = $("<div class='testButton'>Check storage</div>");
		$newDiv3.click(function() {
			console.log("Clicked on new div 3");        
			chrome.storage.sync.get(/* String or Array */["shoppingCart"], function(items){
				//  items = [ { "yourBody": "myBody" } ]
				console.log(items);	
			});
			chrome.storage.sync.get(/* String or Array */"shoppingCart", function(items){
				//  items = [ { "yourBody": "myBody" } ]
				console.log(items["shoppingCart"]);
				console.log(items["shoppingCart"]["shoppingCart"]);		
				console.log(items.shoppingCart);										
			});
		});


		// Shopping Cart Initialization 
		var currentSessionId = $("input[name='_st_acc']").attr('value');
		console.log(currentSessionId);

		var foobar = $("input[name='event']").attr('value');
		console.log(foobar);

		var $updateCart = $("<div class='testButton'>Update Cart</div>");
		$updateCart.click(function() {
			console.log("Clicked on update cart button");        
			updateCart();
		});

		var $shoppingCart = $("<div id='shoppingCart'><h1>Shopping Cart</h1></div>");
		var $itemCount = $("<span id='itemCount'>(0)</span>")
		var $totalCost = $("<span id='totalCost'></span>")
		var $itemList = $("<table id='cartList'></table>");
		
		$shoppingCart.append($itemCount, $totalCost, $itemList);
		$($buttonHolder).append($newDiv, $newDiv2, $newDiv3, $updateCart, $shoppingCart);
		$("body").append($buttonHolder);
		// ----------------------------------------------------------

		// ----------------------------------------------------------
		// Adding buttons into page 
		function createAddToCartButton(product) {
			var btn = $("<button value=" + product.id + ">Add to Cart</button>");
			btn.click(function() {
				var itemId = $(this).attr("value");
				
				// retrieve shopping cart 
				chrome.storage.sync.get("shoppingCart", function(items){
					
					console.log(items["shoppingCart"]);

					items.shoppingCart.push(product);

					// add to  shopping cart 
					chrome.storage.sync.set({"shoppingCart": items.shoppingCart}, function() {});
					
					console.log(items);
				});
			});
			return btn;
		}

		// Adding buttons to items 
		var $items = $(".content_box4"); // each item 
		$items.each( function(index, element) {
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
			
			var product = new Product(itemId, title, price, imgUrl, currentSessionId);

			var button = createAddToCartButton(product);
			$(this).children(":first").append(button);
		});
		// ----------------------------------------------------------
				
		// ----------------------------------------------------------
		// Shopping Cart 
		function updateCart() {
			console.log("updating cart");
			chrome.storage.sync.get("shoppingCart", function(items) {
				// keep track of total cost 
				var total = 0;

				// clear the list 
				$itemList.html('');

				// go thru all products in shopping cart 
				for (var i = 0; i < items["shoppingCart"].length; i++) {
					// retrieve the product 
					var product = items["shoppingCart"][i];
					
					// create the parent DOM element 
					var $item = $("<tr class='cartItem'></tr>");
					var $name = $("<td><a>" + product.name + "</a></td>");
					var $price = $("<td>" + product.price + "</td>");
					var $buyBtn = $("<td><img class='cartIcon' src=" + chrome.extension.getURL('img/buy_icon.png') + "></td>");
					var $removeBtn = $("<td><img class='cartIcon' src=" + chrome.extension.getURL('img/remove_icon.png') + "></td>");
					var $previewImg = $("<div class='hover_img'><img src=" + product.imgUrl + " height=100></div>")

					// attach event handlers 
					if (product.sessionId === currentSessionId) {
						$name.click({product: product}, onCartItemClick);	// pass product item (key 'product') to event handler.  
						$buyBtn.click({product: product}, onCartItemClick);						
					} else {
						$name.addClass("invalidSession");
						$buyBtn.addClass("invalidSession");
					}
					$removeBtn.click({product: product}, onCartItemRemoveClick);
					

					$item.append($name, $price, $buyBtn, $removeBtn, $previewImg);
					$itemList.append($item);

					// update the total 
					total += parseFloat(product.price);
				}
				
				$itemCount.html("(" + items.shoppingCart.length + ")");
				$totalCost.html("Total: $" + total.toFixed(2));
			});
		}

		function onCartItemClick(event) {
			$input = $('<input name="_pr_selectItem_string" type="radio" value=' + event.data.product.id + ' id="skuidFOOBAR" checked>');
			$("form").append($input);	
			location.href = "javascript:contentEvent('select', 'skuidFOOBAR');"
		}

		function onCartItemRemoveClick(event) {
			// retrieve shopping cart 
			chrome.storage.sync.get("shoppingCart", function(items){
				
				console.log(items["shoppingCart"]);

				var targetIndex = -1;

				console.log(event.data.product);
				for (var i = 0; i < items.shoppingCart.length; i++) {
					console.log(items.shoppingCart[i].name);
					if (items.shoppingCart[i].name == event.data.product.name) {
						targetIndex = i;
						break;
					}
				}

				if (targetIndex == -1) {
					console.log("Could not remove item from cart - item not found");
				} else {
					items.shoppingCart.splice(targetIndex, 1);	// remove element from array 
					chrome.storage.sync.set({"shoppingCart": items.shoppingCart}, function() {});				
				}

				console.log(items);
			});
		}

		updateCart();
		// ----------------------------------------------------------
		
		var t1 = performance.now();
		console.log("Extension loaded. Took " + (t1 - t0) + " milliseconds.")

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