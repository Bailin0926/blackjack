let a = -0.02;
let h = 5;
let k = 0.5;

let diff = 0.1;
let multi = 1.6;

$(window).resize(function () {
    alignChipBar();
    alignCards("player-card", "#player-cards");
    alignCards("dealer-card", "#dealer-cards");
    if (game.status == -1) {
        alignChips()
    } else {
        chipCenter();
    }
});

function getCard(cardname, suit, rank, id) {
    if (id != "") {
        return `<div id="` + id + `" class="` + cardname + `"><img src="/data/img/cards/${suit}-${rank}.svg"></img></div>`;
    }
    return `<div class="` + cardname + `"><img src="/data/img/cards/${suit}-${rank}.svg"></img></div>`;
}


function alignChipBar() {
    let chips = document.getElementsByClassName("chip");
    let chipSize = getChipSize();

    for (i = 0; i < 5; i++) {
        $(chips[i]).css("width", chipSize[0] + "px");
        $(chips[i]).css("height", chipSize[0] + "px");
        $(chips[i]).css("left", (i * (chipSize[0] + chipSize[1]) + chipSize[1]) + "px");
        $(chips[i]).css("top", chipSize[2] + "px");

    }
}

function getChip(x) {
    return `<img class="chip-delete chip-${x}" onclick="deleteChip(${x});" src="/data/img/chip/${x}.png">`;
}

function clearAtChip() {
    for (let i = 0; i < 5; i++) {
        let chips = document.getElementsByClassName("chip-" + i);
        for (let j = 0; j < chips.length; j++) {
                deleteAtChip(i);
        }
    }
}

function deleteAtChip(x) {
    let chipSize = getChipSize();

    let chips = document.getElementsByClassName("chip-" + x);

    $(chips[0]).css("left", (x * (chipSize[0] + chipSize[1]) + chipSize[1]) + "px");
    $(chips[0]).css('bottom', '-100px');
    $(chips[0]).css('opacity', '0');
    let delet = (function () {
        $(chips[0]).remove();
    });
    setTimeout(delet, 300);
    setTimeout(alignChips, 300);
}

function addAtChip(x) {
    $("#bet-chips").append(getChip(x));
    alignChips();
}


function chipCenter() {
    let chips = document.getElementsByClassName("chip-delete");
    let placewidth = parseFloat($("#bet-chips").css("width").replace("px", ""));
    let chipSize = getChipSize();
    let center = (placewidth - chipSize[0]) / 2
    Array.from(chips).forEach(chip => new function () {
        $(chip).css("width", chipSize[0] + "px");
        $(chip).css("height", chipSize[0] + "px");
        let r = getRandomArbitrary(-10, 10)
        $(chip).css("left", (center + r) + "px");
        $(chip).css('bottom', r + "px");
        $(chip).css('opacity', '1');
    });

    let bet = document.getElementById("bet-chips");
    $(bet).css('top', "30%");
}
function chipLose() {
    let bet = document.getElementById("bet-chips");
    $(bet).css('top', "-15%");
    setTimeout(deleteAllChip, 300);
    setTimeout(chipReplce, 400);
}
function chipPush() {
    let bet = document.getElementById("bet-chips");
    $(bet).css('top', "100%");
    setTimeout(deleteAllChip, 300);
    setTimeout(chipReplce, 400);
}

function chipWin() {
    let f = (function () {
        let bet = document.getElementById("bet-chips");
        $(bet).css('top', "100%");
    })
    setTimeout(f, 300);
    setTimeout(deleteAllChip, 400);
    setTimeout(chipReplce, 500);
}

function chipReplce() {
    let bet = document.getElementById("bet-chips");
    $(bet).css('top', "62.5%");
}

function getChipSize() {
    let placeheight = parseFloat($("#table-chip").css("height").replace("px", ""));
    let placewidth = parseFloat($("#table-chip").css("width").replace("px", ""));
    let size = 0;
    if (placewidth / 5 < placeheight) {
        size = placewidth / 5;
    } else {
        size = placeheight;
    }
    let gap = (placewidth - (size * 5)) / 6;
    let top = (placeheight - size) / 2;
    return new Array(size, gap, top);
}

function deleteAllChip() {
    $("#bet-chips").empty();
    $("#bet-chips").append(`<p id="total-chips"></p>`);

}


function alignChips() {
    let chipSize = getChipSize();
    let types = 0;
    for (let i = 0; i < 5; i++) {
        let chips = document.getElementsByClassName("chip-" + i);
        if (chips.length > 0) {
            types++
        }
        Array.from(chips).forEach(chip => new function () {
            $(chip).css("width", chipSize[0] + "px");
            $(chip).css("height", chipSize[0] + "px");
            $(chip).css("left", (i * (chipSize[0] + chipSize[1]) + chipSize[1]) + "px");
        });
    }
    let ngap = chipSize[1] + (((5 - types) * (chipSize[0] + chipSize[1])) / 2);
    let j = 0;
    for (let i = 0; i < 5; i++) {
        let chips = document.getElementsByClassName("chip-" + i);
        Array.from(chips).forEach(chip => new function () {
            let move = (function (x) {
                $(chip).css("bottom", "0px");
                $(chip).css("left", x + "px");
                $(chip).css('opacity', '1');
            });
            let left = (j * (chipSize[0] + chipSize[1]) + ngap)
            setTimeout(move, 10, left);
        });
        if (chips.length > 0) {
            j++;
        }
    }


}

function addCard(cardname, place, suit, rank, id) {
    $(place).append(getCard(cardname, suit, rank, id));
    alignCards(cardname, place);
}
function deleteAllCard(cardname, place) {
    let cards = document.getElementsByClassName(cardname);
    let move = (function (i) {
        $(cards[i]).css('left', '0px');
        $(cards[i]).css('opacity', '0');
    });
    let delet = (function (i) {
        $(place).empty();
        $(place).append(`<p id="${cardname}-hint" class="cards-hint  ${cardname}-hint"></p>`);
    });
    let i = 0
    for (i = 0; i < cards.length; i++) {
        setTimeout(move, 200 * (i + 1), i);
    }
    setTimeout(delet, 200 * (i + 2));
}

function deleteBackCard(cardid) {
    let card = document.getElementById(cardid);
    let move = (function () {
        $(card).css("bottom", "200px");
        $(card).css('opacity', '0');
    });
    let delet = (function () {
        $("#" + cardid).remove();
    });
    let i = 0
    setTimeout(move, 1);
    setTimeout(delet, 200);

}


// some part from https://codepen.io/johnramberger
function alignCards(cardname, place) {
    let cards = document.getElementsByClassName(cardname);
    let count = cards.length;
    Array.from(cards).forEach(card => new function () {
        let i = Array.from(cards).indexOf(card);

        let placeheight = $(place).css("height").replace("px", "");
        $(card).css("height", placeheight * 0.7 + "px");
        $(card).css("width", placeheight * 0.5 + "px");

        let width = placeheight * 0.5;
        let left = width * i / 2;

        let totalwidth = count * (width / 2) + width / 2;
        let placewidth = $(place).css("width").replace("px", "");

        if (totalwidth > placewidth) {
            let overflow = totalwidth - placewidth;
            let shift = (overflow / (count - 1));
            left -= shift * i;
            totalwidth = placewidth;
        }
        let leftdif = (placewidth - totalwidth) / 2;

        left += leftdif;
        $(card).css('left', left + 'px');

        let center = left + width / 2;
        let xpos = center / placewidth * 10;
        let ypos = getypos(xpos);
        let rot = getrotation(xpos);

        let bottom = (ypos / k) * $(place).css("height").replace("px", "") / 4;
        $(card).css('opacity', '1');
        $(card).css("bottom", bottom + "px");
        $(card).css("transform", "rotate(" + rot + "deg)");
    });
}
//from https://codepen.io/johnramberger
function getrotation(xpos) {
    let ypos = getypos(xpos);
    if (xpos < h) {
        let newx = xpos + diff;
        let newy = getypos(newx);

        let adjacent = newx - xpos;
        let opposite = newy - ypos;
        let angle = Math.atan(opposite / adjacent);
        angle *= 180;
        angle /= Math.PI;
        angle = 0 - angle;
        return angle * multi;
    }
    else if (xpos > h) {
        let newx = xpos - diff;
        let newy = getypos(newx);

        let adjacent = newx - xpos;
        let opposite = newy - ypos;
        let angle = Math.atan(opposite / adjacent);
        angle *= 180;
        angle /= Math.PI;
        angle = 0 - angle;
        return angle * multi;
    }
    else {
        return 0;
    }
}
//from https://codepen.io/johnramberger
function getypos(xpos) {
    let ypos = a * Math.pow((xpos - h), 2) + k;
    return ypos;
}
//from https://codepen.io/johnramberger
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}