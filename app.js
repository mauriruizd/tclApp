Promise = require("promise");
require("whatwg-fetch");

tabris.ui.set("background", "#ed1c24");
tabris.ui.set("textColor", "#fff");
tabris.ui.set("toolbarVisible", false);

var lang = tabris.device.get("language").replace(/-.*/, "");
var texts = require("./texts/" + lang + ".json") || require("./texts/es.json");

var resource = "http://107.170.79.152/";

var units = {
	largo 		: 0,
	ancho		: 0,
	alto		: 0,
	personas	: 0,
	watts		: 0
}

var page =  tabris.create("Page", {
	title : "TCL | The Creative Life",
	topLevel : true
});

var composite = tabris.create("ScrollView", {
	layoutData : {
		top : 0,
		left : 0,
		bottom : 0,
		right : 0
	},
	opacity : 0
}).appendTo(page);

var logo = tabris.create("ImageView", {
	image : {
		src : "img/logo.png"
	},
	scale : 3,
	scaleMode : "stretch",
	layoutData : {
		centerX : 0,
		centerY : 0
	},
	opacity : 0
}).appendTo(page);
createLabel(texts.dimensionesLabel).appendTo(composite);
createSlider(texts.largoInput.label, "largo", texts.largoInput.placeholder, composite);
createSlider(texts.anchoInput.label, "ancho", texts.anchoInput.placeholder, composite);
createSlider(texts.altoInput.label, "alto", texts.altoInput.placeholder, composite);
createLabel(texts.cantidadLabel).appendTo(composite);
createSlider(texts.personasInput.label, "personas", texts.personasInput.placeholder, composite);
createSlider(texts.aparatosInput.label, "watts", texts.aparatosInput.placeholder, composite);

tabris.create("Button", {
	layoutData : {
		top : "prev() 10",
		left : 50,
		right : 50
	},
	background : "#ed1c24",
	textColor : "#fff",
	font : "25px",
	text : texts.calcularBtn
})
.on("select", function(){
	openCalcPage();
})
.appendTo(composite);

page.open();

logo.animate({ opacity : 1 }, { duration : 1500 });
setTimeout(function(){
	logo.animate({ opacity : 0 }, { duration : 500, delay : 1500 });
	setTimeout(function() {
		logo.dispose();
		tabris.ui.set("toolbarVisible", true);
		composite.animate({ opacity : 1 }, { duration : 1000 });
	}, 2000);
}, 3000);

function createSlider(labelTxt, unit, itemLabel, parent) {
	var items = [];
	for(var i = 0; i < 31; i++) {
		items.push(i);
	}

	var composite = tabris.create("Composite", {
		layoutData : {
			top : "prev() 15",
			left : 0,
			right : 0
		}
	}).appendTo(parent);

	var label = tabris.create("TextView", {
		id : "input_label_" + unit,
		layoutData : {
			centerY : 0,
			left : 15
		},
		font : "15px",
		text : labelTxt
	}).appendTo(composite);

	var slider = tabris.create("TextInput", {
		id : "input_" + unit,
		layoutData : {
			centerY : 0,
			right : 5,
			width : 100
		},
		//items : items,
		/*itemText : function(item) {
			return item + itemLabel
		},
		selection : units[unit]*/
		message : itemLabel,
		keyboard : "numbersAndPunctuation",
		alignment : "center"
	})
	.on("change:text", function(widget, selection) {
		saveUnit(unit, selection);
		//setUnitLabel(unit, label, labelTxt);
	})
	.appendTo(composite);
}

function createLabel(label) {
	return tabris.create("TextView", {
		id : "label_" + label,
		layoutData : {
			top : "prev() 20",
			left : 5
		},
		text : label,
		font : "25px"
	});
}

function saveUnit(unit, value) {
	units[unit] = value;
}

function setUnitLabel(unit, element, label) {
	element.set("text", label + units[unit]);
}

function openCalcPage(){
	var page = tabris.create("Page", {
		title : "Calculo",
		topLevel : false
	});

	var list = createList([], page);

	var url = resource + "api/v1/items?btu=" + calcBTU();

	fetch(url)
	.then(function(res) {
		return JSON.parse(res._bodyInit);
	})
	.then(function(items) {
		list.set({
			items : items,
			refreshIndicator : false
		});
	})
	.catch(function(error) {
		console.log('Fetch Error: ' + error);
	});

	tabris.create("TextView", {
		layoutData : {
			top : 10,
			centerX : 0
		},
		font : "18px",
		text : texts.calcPageH1 + calcBTU() + " BTU/hr"
	}).appendTo(page);

	page.apply(texts).open();
}

function calcBTU(){
	var cVolumen  = units.largo * units.ancho * units.alto * 230;
	var cPyE = (units.personas + units.watts) * 476;
	var final = cVolumen + cPyE;
	return String(final);
}

function createList(items, parent) {
	var listView = tabris.create("CollectionView", {
		layoutData : {
			top : "prev() 40",
			left : 5,
			right : 5,
			bottom : 5
		},
		itemHeight : 70,
		items : items,
		refreshIndicator : true,
		initializeCell : function(cell) {
			var image = tabris.create("ImageView", {
				layoutData : {
					top : 5,
					left : 20,
					bottom : 5
				}
			}).appendTo(cell);

			var composite = tabris.create("Composite", {
				layoutData : {
					top : 0,
					left : "prev() 10",
					right : 0,
					bottom : 0
				}
			}).appendTo(cell);

			var titulo = tabris.create("TextView", {
				layoutData : {
					top : 15,
					left : 0
				}
			}).appendTo(composite);

			var btuLabel = tabris.create("TextView", {
				layoutData : {
					top : "prev() 1",
					left : 0
				},
				textColor : "#AAA"
			}).appendTo(composite);

			cell.on("change:item", function(widget, item) {
				image.set({
					image : {
						src : resource + item.imagen
					}
				});
				titulo.set("text", item.titulo);
				btuLabel.set("text", item.btu + " BTU/hr");
			});
		}
	})
	.on("select", function(widget, item) {
		require("./detail")("Detalle", resource + item.imagen, item.descripcion, item.titulo, item.btu + " BTU/hr").open();
	})
	.appendTo(parent);
	return listView;
}