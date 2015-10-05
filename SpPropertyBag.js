/*
 * SpPropertyBag.js
 * by rlv-dan (https://github.com/rlv-dan)
 * License: GPL3
*/

window.spPropertyBag = {};
window.spPropertyBag.init = function() {
	"use strict";

	var ctx = new SP.ClientContext.get_current();
	var web = ctx.get_web();
	var allProperties = web.get_allProperties();
	ctx.load(web);
	ctx.load(allProperties);

	var reloadRequired = false;

	ctx.executeQueryAsync(function () {
		showPropertiesDialog(allProperties.get_fieldValues());
	}, function (req,err) {
		SP.UI.Notify.addNotification("Failed to get web properties...<br>" + err.get_message());
	});


	window.spPropertyBag.executeChanges = function() {
		ctx.get_web().update();
		ctx.executeQueryAsync(function () {
			console.log("Web properties successfully modified");
		}, function () {
			console.error("Failed to set web property!");
		});
	};
	window.spPropertyBag.setProperty = function(key, inputId) {
		var value = document.getElementById(inputId).value;
		allProperties.set_item(key, value);
		window.spPropertyBag.executeChanges();
	};
	window.spPropertyBag.deleteProperty = function(key, inputId) {
		if (confirm('Are you sure you want to remove this property?')) {
			var table = document.getElementById(inputId).parentNode.parentNode;
			table.parentNode.removeChild(table);

			allProperties.set_item(key);
			window.spPropertyBag.executeChanges();
			reloadRequired = true;
		}
	};
	window.spPropertyBag.addProperty = function() {
		var key = document.getElementById("newKey").value;
		var value = document.getElementById("newValue").value;
		document.getElementById("newValue").value = "";
		document.getElementById("newKey").value = "";
		allProperties.set_item(key, value);
		window.spPropertyBag.executeChanges();
	};

	function showPropertiesDialog(props) {
		var p, type;
		var items = [];
		for(p in props) {
			if (props.hasOwnProperty(p)) {
				type = typeof(props[p]);
				if(type === "string") {
					items.push({"prop": p, "value": props[p].replace(/"/g, '&quot;')});
				}
			}
		}
		items.sort(function(a, b) {
			return a.prop.localeCompare(b.prop);
		});


		var html = document.createElement('div');
		var h = '<hr><table style="margin: 1em;">';
		var i;
		for(i=0; i<items.length; i++) {
			h += '<tr>';
			h += '<td style="text-align: right; padding-top: 15px;"><b>' + items[i].prop + '</b></td>';
			h += '<td style="padding-top: 15px;"><input id="prop' + i + '" style="width:240px; " type="text" value="' + items[i].value + '"></inpu></td>';
			h += '<td style="padding-top: 15px;"><button onclick="window.spPropertyBag.setProperty(\'' + items[i].prop + '\',\'prop' + i +'\'); return false;">Update</button></td>';
			h += '<td style="padding-top: 15px;"><button style="color: red; min-width: 1em;" onclick="window.spPropertyBag.deleteProperty(\'' + items[i].prop + '\',\'prop' + i +'\'); return false;">X</button></td>';
			h += '</tr>';
		}
		h += '</table>';

		h += '<hr><h3>Add a new property:</h3>';
		h += '<div style="margin: 1em; padding-bottom: 2em;">Key: <input id="newKey"></inpu>';
		h += '&nbsp;&nbsp;&nbsp;Value: <input id="newValue"></inpu>';
		h += '&nbsp;<button onclick="window.spPropertyBag.addProperty(); return false;">Add</button></div>';
		h += '<div></div>';

		html.innerHTML = h;

		OpenPopUpPageWithDialogOptions({
		 title: "Property Bag Editor",
		 html:html,
		 allowMaximized: true,
		 showClose: true,
		 autoSize: true,
		 /*width: 800,*/
		 dialogReturnValueCallback: function(dialogResult) {
			if(reloadRequired){
				window.location.reload();
			}
		 }
		});
	}
};
window.spPropertyBag.init();
