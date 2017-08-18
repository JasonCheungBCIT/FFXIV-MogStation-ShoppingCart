# FFXIV - MogStation Shopping Cart
Add a shopping cart to MogStation's Optional Items store. Quickly see your total, preview items you've added, and go back to item's details page when you're ready to buy!

**Warning: Logging out will disable going to an item's details page, but your cart will be intact.**
This feature is re-enabled when you visit a page with your cart's items. This is just due to how MogStation was made, as product ID's are randomized everytime you login. **This also means a buy-all button is not possible :(**

### Usage
Simply navigate to [MogStation's Optional Items Store](https://secure.square-enix.com/account/app/svc/ffxivshopitemshop) and use your shopping cart on the bottom left. 
Click on the cart icon below an item to add to your cart, and the "X" icon on your cart to remove it.

### Privacy
Your cart is automatically synced with your Google account if you are logged in so you can access it on other devices. Otherwise, information is stored locally on your machine. 
You can always clear your data by removing items from your cart or clicking on "Clear cart" in the icon on the top right. 
This application is not connected to any other services; your cart's contents and purchases are not stored or shared.

- - - -

## Contribute
All open source, feel free to add features or fix bugs. A few things to note:

`src/inject/inject.js` is where all the code is found. 
CSS is generated from a SCSS file in `src/inject/inject.scss`, compiled with http://beautifytools.com/scss-compiler.php online because I'm lazy.

`_pr_selectItem_string` value found on an hidden input is used to determine a product's ID. 
`_st_acc` value found on an hidden input is used to determine the session ID. 
Both values do not change even if the user closes, opens, or refreshes the tab; only when they log out. 

Navigating to an item's detail page uses the `contentEvent(action, id)` which then uses the `ctrEvent(form, arg/ID)` JS functions in the source HTML page. 
Most actions use `ctrEvent()` such as changing pages, purchasing, etc. Probably the function you'll want to use if you want to add some features. 

### Known Issues
* There is no `_pr_selectItem_string` on an item's detail page, which is why there is no add to cart button.
* There is no way to directly go to an item's purchasing page; That uses `_st_itemDetailData` (I think) which changes *everytime* you perform an action. 

- - - -

## Credits
Extension icon ripped from [MogStation.](https://secure.square-enix.com/account/app/svc/mogstation)
Created by Jason Cheung. 