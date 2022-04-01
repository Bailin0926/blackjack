const CHIP0 = 1;
const CHIP1 = 5;
const CHIP2 = 10;
const CHIP3 = 25;
const CHIP4 = 100;
const MAXCHIP = 500;

var playerMoney = 0;
var totalChips = [0, 0, 0, 0, 0];
var game;

function loadGame() {
    alignChipBar();
    addMoney(0);

}
async function addMoney(x) {
    await fetch("/player?add_money=" + x)
        .then(response => response.json())
        .then(data => {
            game = data
            console.log(game);
        });
    refreshStatus();
}
async function startGame() {
    chipCenter();
    await fetch("/new?bet=" + calTotalChips())
        .then(response => response.json())
        .then(data => {
            game = data
            console.log(game);
        });
    refreshStatus();
}

async function gameSelect(x) {

    await fetch("/game?select=" + x)
        .then(response => response.json())
        .then(data => {
            game = data
            console.log(game);
        });
    refreshStatus();
}



function showResult(x) {
    let fline = "";
    let sline = "";
    switch (x) {
        case 1:
            fline = "PUSH!";
            sline = "It's push";
            break;
        case 2:
            fline = "WIN!";
            sline = "You have the best score";
            break;
        case 3:
            fline = "WIN!";
            sline = "Dealer busts";
            break;
        case 4:
            fline = "BLACKJACK!";
            sline = "You win";
            break;
        case 5:
            fline = "LOSE...";
            sline = "Dealer has the best score";
            break;
        case 6:
            fline = "BUST!";
            sline = "You're busted";
            break;
    }
    document.getElementById("result-main").innerHTML = fline ;
    document.getElementById("result-more").innerHTML = sline ;
    let a = document.getElementById("result");
    $(a).css('bottom', '50%');
    $(a).css('opacity', '1');
    let h = (function(){
        let a = document.getElementById("result");
        $(a).css('bottom', '40%');
        $(a).css('opacity', '0');
    });
    setTimeout(h, 1000);
}


function addChip(x) {
    if (game.status == -1 && canAdd(x)) {
        totalChips[x] += 1;
        addAtChip(x);
        refreshStatus();
    }
}

function deleteChip(x) {
    if (game.status == -1) {
        if (totalChips[x] > 0) {
            totalChips[x] -= 1;
        }
        deleteAtChip(x);
        refreshStatus();
    }
}

function clearChip() {
    if (game.status == -1) {
        totalChips = [0, 0, 0, 0, 0];
        clearAtChip();
        refreshStatus();
    }
}

function maxChip() {
    clearChip()
    var money = calPlayerMoney();
    if (money > MAXCHIP) {
        money = MAXCHIP;
    }
    for (let i = 0; i < Math.floor(money / CHIP4); ++i) {
        addChip(4);
    }
    for (let i = 0; i < Math.floor(Math.floor(money % CHIP4) / CHIP3); ++i) {
        addChip(3);
    }
    for (let i = 0; i < Math.floor(Math.floor(money % CHIP3) / CHIP2); ++i) {
        addChip(2);
    }
    for (let i = 0; i < Math.floor(Math.floor(money % CHIP2) / CHIP1); ++i) {
        addChip(1);
    }
    for (let i = 0; i < Math.floor(money % CHIP1); ++i) {
        addChip(0);
    }
}

function refreshStatus() {
    playerMoney = game.player.money
    let time = 0;



    let playerAdd = (function (i) {
        addCard("player-card", "#player-cards", game.player.pokers[i].suit, game.player.pokers[i].rank, "");
    });
    let playerDelete = (function () {
        deleteAllCard("player-card", "#player-cards");
    });
    let dealerAdd = (function (i) {
        addCard("dealer-card", "#dealer-cards", game.dealer_pokers[i].suit, game.dealer_pokers[i].rank, "");
    });
    let dealerAddBack = (function () {
        addCard("dealer-card", "#dealer-cards", 0, 0, "dealer-back");
    });
    let dealerDelete = (function () {
        deleteAllCard("dealer-card", "#dealer-cards");
    });
    let dealerDeleteBack = (function () {
        deleteBackCard("dealer-back");
    });



    if (game.status == -1) {
        document.getElementById("total-chips").style.display = "";

        let chips = document.getElementsByClassName("chip-delete");


        if (chips.length == 0 && calTotalChips() != 0) {
            if (calPlayerMoney() < calTotalChips()) {
                totalChips = [0, 0, 0, 0, 0];
            } else {
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < totalChips[i]; j++) {
                        $("#bet-chips").append(getChip(i));
                    }
                }
                alignChips();
            }

        }
    } else {
        document.getElementById("total-chips").style.display = "none";
    }


    if (game.status == 0) {
        let dealerCards = document.getElementsByClassName("dealer-card");
        if (dealerCards.length != 2) {
            setTimeout(dealerAdd, 1, 0);
            setTimeout(dealerAddBack, 300);
            time = 600
        }

    }

    if (game.status >= 0) {
        let playerCards = document.getElementsByClassName("player-card");
        for (let i = 0; i < game.player.pokers.length; i++) {
            if (i >= playerCards.length) {
                setTimeout(playerAdd, 300 * (playerCards.length - i + 1) + time, i);
            }
        }
    }

    if (game.status > 0) {
        setTimeout(dealerDeleteBack, time + 50);
        let dealerCards = document.getElementsByClassName("dealer-card");
        for (let i = 0; i < game.dealer_pokers.length; i++) {
            if (i >= dealerCards.length - 1) {
                setTimeout(dealerAdd, 300 * (dealerCards.length - i + 1) + time, i);
            }
        }
    }

    if (game.status >= 5) {
        setTimeout(chipLose, 3000);
    } else if (game.status >= 2) {
        setTimeout(chipWin, 3000);
    } else if (game.status == 1) {
        setTimeout(chipPush, 3000);
    }


    if (game.status > 0) {
        setTimeout(showResult, 1000, game.status);
        setTimeout(playerDelete, 3500);
        setTimeout(dealerDelete, 3500);
        setTimeout(loadGame, 4000);
    }

    if (game.status == 0) {
        document.getElementById("table-play").style.display = "";
        document.getElementById("table-start").style.display = "none";
    } else {
        document.getElementById("table-play").style.display = "none";
        document.getElementById("table-start").style.display = "";
    }


    if (calTotalChips() == 0) {
        document.getElementById("start-game").disabled = true;
        document.getElementById("add-chip-clear").disabled = true;
    } else {
        document.getElementById("start-game").disabled = false;
        document.getElementById("add-chip-clear").disabled = false;
    }

    
        document.getElementById("game-double").disabled = (!game.double);

    document.getElementById("player-money").innerHTML = "$" + game.player.money;
    document.getElementById("total-chips").innerHTML = "BET : $" + calTotalChips();

    document.getElementById("dealer-card-hint").innerHTML = game.dealer_hint;
    document.getElementById("player-card-hint").innerHTML = game.player_hint;

    document.getElementById("add-chip-max").disabled = false;
    document.getElementById("add-chip-4").setAttribute("src", "/data/img/chip/4.png");
    document.getElementById("add-chip-3").setAttribute("src", "/data/img/chip/3.png");
    document.getElementById("add-chip-2").setAttribute("src", "/data/img/chip/2.png");
    document.getElementById("add-chip-1").setAttribute("src", "/data/img/chip/1.png");
    document.getElementById("add-chip-0").setAttribute("src", "/data/img/chip/0.png");

    var pm = calPlayerMoney();
    if (pm > MAXCHIP-calTotalChips()) {
        pm = MAXCHIP-calTotalChips();
    }
    if (pm < CHIP4) {
        document.getElementById("add-chip-4").setAttribute("src", "/data/img/chip/5.png");
        if (pm < CHIP3) {
            document.getElementById("add-chip-3").setAttribute("src", "/data/img/chip/5.png");
            if (pm < CHIP2) {
                document.getElementById("add-chip-2").setAttribute("src", "/data/img/chip/5.png");
                if (pm < CHIP1) {
                    document.getElementById("add-chip-1").setAttribute("src", "/data/img/chip/5.png");
                    if (pm == 0) {
                        document.getElementById("add-chip-0").setAttribute("src", "/data/img/chip/5.png");
                        document.getElementById("add-chip-max").disabled = true;
                    }
                }
            }
        }
    }

}

function canAdd(x) {
    let max = 5;
    var pm = calPlayerMoney();

    if (pm > MAXCHIP-calTotalChips()) {
        pm = MAXCHIP-calTotalChips();
    }
    if (pm < CHIP4) {
        max = 4;
        if (pm < CHIP3) {
            max = 3;
            if (pm < CHIP2) {
                max = 2;
                if (pm < CHIP1) {
                    max = 1;
                    if (pm == 0) {
                        max = 0;
                    }
                }
            }
        }
    }
    return (x < max);
}

function calPlayerMoney() {
    return playerMoney - calTotalChips();
}
function calTotalChips() {
    var total = 0;
    for (let i = 0; i < totalChips.length; ++i) {
        switch (i) {
            case 0:
                total += CHIP0 * totalChips[i];
                break;
            case 1:
                total += CHIP1 * totalChips[i];
                break;
            case 2:
                total += CHIP2 * totalChips[i];
                break;
            case 3:
                total += CHIP3 * totalChips[i];
                break;
            case 4:
                total += CHIP4 * totalChips[i];
                break;
        }
    }
    return total
}