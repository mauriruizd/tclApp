module.exports = function(pageTitle, imageURL, description, titleTxt, titleSubTxt) {
  var MARGIN_SMALL = 14;
  var MARGIN = 16;

  var INITIAL_TITLE_COMPOSITE_OPACITY = 0.55;

  var titleCompY = 0;

  var page = tabris.create("Page", {
    topLevel: false,
    title: pageTitle
  });

  var scrollView = tabris.create("ScrollView", {
    left: 0, right: 0, top: 0, bottom: 0
  }).appendTo(page);

  var imageView = tabris.create("ImageView", {
    left: 0, top: 0, right: 0,
    image: imageURL,
    scaleMode: "fill"
  })
  .on("tap", function(widget) {
    require("./imageViewer")(pageTitle, imageURL).open();
  })
  .appendTo(scrollView);

  var contentComposite = tabris.create("Composite", {
    left: 0, right: 0, top: "#titleComposite", height: 500,
    background: "white"
  }).appendTo(scrollView);

  tabris.create("TextView", {
    left: MARGIN, right: MARGIN, top: MARGIN,
    text: description
  }).appendTo(contentComposite);

  var titleComposite = tabris.create("Composite", {
    left: 0, right: 0, height: 78,
    id: "titleComposite",
    background: rgba(237, 28, 36, INITIAL_TITLE_COMPOSITE_OPACITY)
  }).appendTo(scrollView);

  tabris.create("TextView", {
    left: MARGIN, top: MARGIN, right: MARGIN,
    markupEnabled: true,
    text: "<b>" + titleSubTxt + "</b>",
    font: "16px",
    textColor: "#FFF"
  }).appendTo(titleComposite);

  tabris.create("TextView", {
    left: MARGIN, bottom: MARGIN_SMALL, right: MARGIN, top: "prev()",
    markupEnabled: true,
    text: "<b>" + titleTxt + "</b>",
    font: "24px",
    textColor: "white"
  }).appendTo(titleComposite);

  scrollView.on("resize", function(widget, bounds) {
    var imageHeight = bounds.height / 2;
    imageView.set("height", imageHeight);
    var titleCompHeight = titleComposite.get("height");
    titleCompY = Math.min(imageHeight - titleCompHeight, bounds.height / 2);
    titleComposite.set("top", titleCompY);
  });

  scrollView.on("scroll", function(widget, offset) {
    imageView.set("transform", {translationY: Math.max(0, offset.y * 0.4)});
    titleComposite.set("transform", {translationY: Math.max(0, offset.y - titleCompY)});
    var opacity = calculateTitleCompositeOpacity(offset.y, titleCompY);
    titleComposite.set("background", rgba(237, 28, 36, opacity));
  });

  function calculateTitleCompositeOpacity(scrollViewOffsetY, titleCompY) {
    var titleCompDistanceToTop = titleCompY - scrollViewOffsetY;
    var opacity = 1 - (titleCompDistanceToTop * (1 - INITIAL_TITLE_COMPOSITE_OPACITY)) / titleCompY;
    return opacity <= 1 ? opacity : 1;
  }

  function rgba(r, g, b, a) {
    return "rgba(" + r + "," + g + "," + b + "," +  a + ")";
  }

  return page;
}