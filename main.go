package main

import (
	"blackjack/blackjack"
	"encoding/json"
	"html/template"
	"log"
	"net/http"
	"strconv"
)

var game blackjack.Game

func main() {

	game.Player.AddMoney(2000)

	http.HandleFunc("/new", blackjackNew)
	http.HandleFunc("/game", blackjackGame)
	http.HandleFunc("/player", blackjackPlayer)
	http.HandleFunc("/", homePage)

	http.Handle("/data/", http.StripPrefix("/data/", http.FileServer(http.Dir("data"))))

	log.Println("Starting web server on port 8080")
	http.ListenAndServe(":8080", nil)
}
func blackjackNew(w http.ResponseWriter, r *http.Request) {
	bet, _ := strconv.Atoi(r.URL.Query().Get("bet"))
	result := game.New(bet)
	out, err := json.MarshalIndent(result, "", "    ")
	if err != nil {
		log.Println(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(out)
}
func blackjackGame(w http.ResponseWriter, r *http.Request) {
	var result blackjack.GameReturn
	gameSelect, _ := strconv.Atoi(r.URL.Query().Get("select"))
	if gameSelect == 0 {
		result = game.PlayerDouble()
	} else if gameSelect == 1 {
		result = game.PlayerStand()
	} else if gameSelect == 2 {
		result = game.PlayerHit()
	}

	out, err := json.MarshalIndent(result, "", "    ")
	if err != nil {
		log.Println(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(out)
}

func blackjackPlayer(w http.ResponseWriter, r *http.Request) {
	money, _ := strconv.Atoi(r.URL.Query().Get("add_money"))
	game.Player.AddMoney(money)
	result := game.Load()
	out, err := json.MarshalIndent(result, "", "    ")
	if err != nil {
		log.Println(err)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(out)
}

func homePage(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "index.html")
}

func renderTemplate(w http.ResponseWriter, page string) {
	t, err := template.ParseFiles(page)
	if err != nil {
		log.Println(err)
		return
	}

	err = t.Execute(w, nil)
	if err != nil {
		log.Println(err)
		return
	}
}
