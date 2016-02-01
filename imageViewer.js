module.exports = function(pageTitle, imageURL) {
	var page = tabris.create("Page", {
		title : pageTitle,
		topLevel : false,
		background : "#000"
	});

	var image = tabris.create("ImageView", {
		layoutData : {
			centerY : 0,
			centerX : 0
		},
		image : imageURL,
		scaleMode: "fill"
	}).appendTo(page);

	return page;
}