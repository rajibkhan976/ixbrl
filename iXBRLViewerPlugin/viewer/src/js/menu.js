// Copyright 2019 Workiva Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import $ from 'jquery'

export function Menu(elt) {
    this._elt = elt;
    var menu = this;

    elt.find(".title").click(function (e) {
        elt.find(".content-container").toggle();
        /* Stop an opening click from also being treated as an "out-of-menu"
         * closing click */
        e.stopPropagation();
    });

    $('html').click(function(event) {
        if ($(".content",elt).find($(event.target)).length === 0) {
            menu.close();
        }
    });
}

Menu.prototype.reset = function() {
    this._elt.find(".content").empty();
}

Menu.prototype.close = function() {
    this._elt.find(".content-container").hide();
}

Menu.prototype._add = function(item, after) {
    var i;
    if (after !== undefined) {
        i = this._elt.find(".content > div").filter(function () {
            return $(this).data('iv-menu-item-name') == after;     
        });
    }
    if (i !== undefined && i.length > 0) {
        i.after(item);
    }
    else {
        item.appendTo(this._elt.find(".content"));
    }
}

Menu.prototype.addCheckboxItem = function(name, callback, itemName, after) {
    var menu = this;
    var item = $('<div class="item checkbox"></div>')
        .text(name)
        .data("iv-menu-item-name", itemName)
        .click(function () {
            $(this).toggleClass("checked");
            callback($(this).hasClass("checked"));
            menu.close(); 
        });
    this._add(item, after);
}

Menu.prototype.addCheckboxGroup = function(values, names, def, callback, name, after) {
    var menu = this;
    var group = $('<div class="group"></div>').data("iv-menu-item-name", name);
    this._add(group, after);

    $.each(values, function (i, v) {
        var item = $('<div class="item checkbox"></div>')
            .text(names[v])
            .appendTo(group)
            .click(function () {
                group.find(".item.checkbox").removeClass("checked");
                $(this).addClass("checked");
                callback(v);
                menu.close(); 
            });
        if (v == def) {
            item.addClass("checked");
        }

    });
    
}

Menu.prototype.addCredentialItem = function(cred, idx, def, callback, name, after) {
    var menu = this;
    let signType = ""
    let signer = ""
    let role = ""
    let lei = ""
    let img = $("img.gleif-logo").clone()
    img.css("display", "inline").removeClass("gleif-logo")


    if("oor" in cred) {
        let oor = cred["oor"]
        lei =  oor["LEI"]
        signer = oor["personLegalName"];
        if ("f" in cred) {
            signType += "Partially Signed By "
        } else {
            signType += "Signed in Full By "
        }
        role = " Official Role: " + oor["officialRole"]

    } else if ("ecr" in cred) {
        let ecr = cred["ecr"]
        lei = ecr["LEI"]
        signer = ecr["personLegalName"];
        if ("f" in cred) {
            signType += "Partially Signed By "
        } else {
            signType += "Signed in Full By "
        }
        role = "Engagement Role: " + ecr["engagementContextRole"]
    } else {
        return;
    }


    let item = $('<div class="item checkbox signed ' + 'highlight-' + idx + '"></div>')
    let table = $('<table style="width: 100%"></table>')
    item.append(table);
    let tr = $('<tr></tr>');
    table.append(tr);

    let td = $('<td style="padding-right: 5px;width:285px"></td>')
    tr.append(td)
    td.append($('<b></b>').text(signType+signer))
        .append($('<p></p>').text(role))
        .append($('<p></p>').text("LEI: " + lei))

    let imgTD = $('<td valign="top"></td>')
        .append(img)
        .data("iv-menu-item-name", cred['i']);

    tr.append(imgTD)
    item.click(function () {
        $(this).toggleClass("checked");
        callback($(this).hasClass("checked"));
        menu.close();
    })

    this._add(item, after);
}