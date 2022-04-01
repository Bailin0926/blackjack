package blackjack

import (
	"math/rand"
	"sort"
	"strconv"
	"time"
)

const (
	GAMESTOP         = -1
	GAMEUNDONE       = 0
	GAMEPUSH         = 1
	GAMEWINBEST      = 2
	GAMEWINBUST      = 3
	GAMEWINBLACKJACK = 4
	GAMELOSEBEST     = 5
	GAMELOSEBUST     = 6
)

type Poker struct {
	Suit int `json:"suit"` // 0: Clubs, 1: Diamonds, 2: Hearts, 3: Spades
	Rank int `json:"rank"` // 1: A , 2-10: 2-10, 11: J, 12: Q, 13: K
}

type Player struct {
	Pokers []Poker `json:"pokers"`
	Money  int     `json:"money"`
}

type Game struct {
	Pokers []Poker
	Bet    int
	Player Player
	Dealer Player
}

type GameReturn struct {
	Status       int     `json:"status"`
	Continue     bool    `json:"continue"`
	Double       bool    `json:"double"`
	Bet          int     `json:"bel"`
	Player       Player  `json:"player"`
	DealerPokers []Poker `json:"dealer_pokers"`
	PlayerHint   string  `json:"player_hint"`
	DealerHint   string  `json:"dealer_hint"`
}

func (g *Game) gameReturn(status int) GameReturn {
	var gr GameReturn
	gr.Status = status
	gr.Continue = g.canContinue()
	gr.Bet = g.Bet
	gr.Player = g.Player
	if status > 0 {
		gr.DealerPokers = g.Dealer.Pokers
	} else if len(g.Dealer.Pokers) > 0 {
		gr.DealerPokers = g.Dealer.Pokers[:1]
	}
	gr.Double = g.canDouble()
	gr.DealerHint = g.dealerHint(status > 0)
	gr.PlayerHint = g.playererHint(status > 0)
	return gr
}

func (g *Game) Load() GameReturn {
	g.Player.Pokers = []Poker{}
	g.Dealer.Pokers = []Poker{}
	return g.gameReturn(GAMESTOP)
}

func (g *Game) New(bet int) GameReturn {
	g.creatPokers(1)
	g.Player.Pokers = []Poker{}
	g.Dealer.Pokers = []Poker{}

	if !g.canContinue() {
		return g.gameReturn(GAMESTOP)
	}

	if bet > g.Player.Money {
		bet = g.Player.Money
	} else if bet < 1 {
		bet = 1
	}

	g.Player.Money -= bet
	g.Bet = bet

	g.Dealer.draw(g.pop())
	g.Player.draw(g.pop())
	g.Player.draw(g.pop())
	g.Dealer.draw(g.pop())
	return g.gameReturn(GAMEUNDONE)
}

func (g *Game) PlayerStand() GameReturn {
	return g.playerFinish()
}

func (g *Game) PlayerHit() GameReturn {
	g.Player.draw(g.pop())
	if g.Player.Points() >= 21 {
		return g.playerFinish()
	}
	return g.gameReturn(GAMEUNDONE)
}

func (g *Game) PlayerDouble() GameReturn {
	if g.canDouble() {
		g.Player.Money -= g.Bet
		g.Bet += g.Bet
		g.Player.draw(g.pop())
		return g.playerFinish()
	}
	return g.gameReturn(GAMEUNDONE)
}

func (g *Game) canDouble() bool {
	if g.Player.Money >= g.Bet && len(g.Player.Pokers) == 2 {
		return true
	}
	return false
}
func (g *Game) canContinue() bool {
	return g.Player.Money > 0
}

func (g *Game) dealerHint(finish bool) string {
	if finish {
		return strconv.Itoa(g.Dealer.Points())
	}
	if len(g.Dealer.Pokers) == 0 {
		return ""
	}
	if g.Dealer.Pokers[0].Rank == 1 {
		return "11"
	}
	if g.Dealer.Pokers[0].Rank > 10 {
		return "10"
	}
	if g.Dealer.Pokers[0].Rank != 0 {
		return strconv.Itoa(g.Dealer.Pokers[0].Rank)
	}
	return ""
}

func (g *Game) playererHint(finish bool) string {
	if finish {
		return strconv.Itoa(g.Player.Points())
	}
	hint := ""
	t := g.Player.total()
	for i := range t {
		if t[i] <= 21 {
			if len(hint) == 0 {
				hint += strconv.Itoa(t[i])
			} else {
				hint += "/" + strconv.Itoa(t[i])
			}
		}
	}
	if hint == "0" {
		return ""
	}
	return hint
}

func (g *Game) playerFinish() GameReturn {
	g.dealerDraw()
	if g.Player.Points() > 21 {
		return g.gameReturn(GAMELOSEBUST)
	} else {

		if g.Dealer.Points() > 21 {
			g.Player.Money += g.Bet * 2
			return g.gameReturn(GAMEWINBUST)
		} else {
			if g.Player.Points() > g.Dealer.Points() {
				g.Player.Money += g.Bet * 2
				if g.Player.Points() == 21 {
					return g.gameReturn(GAMEWINBLACKJACK)
				}
				return g.gameReturn(GAMEWINBEST)
			} else if g.Player.Points() < g.Dealer.Points() {
				return g.gameReturn(GAMELOSEBEST)
			} else {
				g.Player.Money += g.Bet
				return g.gameReturn(GAMEPUSH)
			}
		}
	}

}

func (p *Player) Points() (points int) {
	t := p.total()
	points = t[0]
	for i := range t {
		if t[i] > points && t[i] <= 21 {
			points = t[i]
		}
	}
	return
}
func (p *Player) AddMoney(money int) {
	p.Money += money
}

func (g *Game) creatPokers(numBox int) {
	g.Pokers = []Poker{}
	for box := 0; box < numBox; box++ {
		for suit := 0; suit < 4; suit++ {
			for rank := 1; rank <= 13; rank++ {
				g.Pokers = append(g.Pokers, Poker{suit, rank})
			}
		}
	}
	g.shuffle()
}

func (g *Game) shuffle() {
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(g.Pokers), func(i, j int) { g.Pokers[i], g.Pokers[j] = g.Pokers[j], g.Pokers[i] })
}

func (g *Game) pop() (poker Poker) {
	if len(g.Pokers) > 0 {
		poker = g.Pokers[0]
		g.Pokers = g.Pokers[1:]
	}
	return
}

func (g *Game) dealerDraw() {
	for g.Dealer.Points() < 17 {
		g.Dealer.draw(g.pop())
	}
}

func (p *Player) draw(poker Poker) {
	p.Pokers = append(p.Pokers, poker)
}

func (p *Player) total() (total []int) {
	t := []int{0}
	for _, poker := range p.Pokers {
		if poker.Rank == 1 {
			p := make([]int, len(t))
			copy(p, t)
			for i := range t {
				t[i] += 1
			}
			for i := range p {
				p[i] += 11
			}
			t = append(t, p...)
		} else if poker.Rank > 10 {
			for i := range t {
				t[i] += 10
			}
		} else {
			for i := range t {
				t[i] += poker.Rank
			}
		}
	}
	for i := range t {
		flag := true
		for j := range total {
			if t[i] == total[j] {
				flag = false
				break
			}
		}
		if flag {
			total = append(total, t[i])
		}
	}
	sort.Ints(total)
	return
}
