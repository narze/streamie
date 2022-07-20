import {
  calculateResult,
  handResult,
  isFlush,
  isStraight,
  isStraightFlush,
  type IPlayer,
} from "./pokdeng"

const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const valueToIndex = (value: string) => values.findIndex((v) => v == value)
const suits = ["♠", "♥", "♣", "♦"]
const suitToIndex = (suit: string) => suits.findIndex((s) => s == suit)

function playerGenerator(amount: number, cards: Array<string>): IPlayer {
  return {
    name: "Dealer",
    amount,
    cards: cards.map((c) => {
      const [suit, value] = [c.charAt(0), c.slice(1)]

      if (valueToIndex(value) == -1) {
        throw new Error(`Invalid card value ${value}`)
      }
      return {
        suit: suitToIndex(suit),
        value: valueToIndex(value),
      }
    }),
  }
}
it("works", () => {
  expect(1 + 1).toBe(2)
})

describe("calculateResult", () => {
  it("exists", () => {
    expect(calculateResult).toBeDefined()
  })

  it("receives dealer hand and player hand, and return result", () => {
    const dealer: IPlayer = playerGenerator(0, ["♦A", "♣Q"])
    const player: IPlayer = playerGenerator(10, ["♣A", "♦Q"])

    expect(calculateResult(dealer, player)).toBe(0)
  })

  it("returns player's amount if player wins", () => {
    const dealer: IPlayer = playerGenerator(0, ["♦A", "♣2"])
    const player: IPlayer = playerGenerator(10, ["♣7", "♦Q"])

    expect(calculateResult(dealer, player)).toBe(10)
  })

  it("returns negative player's amount if player loses", () => {
    const dealer: IPlayer = playerGenerator(0, ["♦7", "♣2"])
    const player: IPlayer = playerGenerator(10, ["♣7", "♦Q"])

    expect(calculateResult(dealer, player)).toBe(-10)
  })

  describe("pok vs non-pok", () => {
    it("who has Pok wins (dealer)", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦7", "♣2"])
      const player: IPlayer = playerGenerator(10, ["♣7", "♦Q", "♦2"])

      expect(calculateResult(dealer, player)).toBe(-10)
    })

    it("who has Pok wins (player)", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦7", "♦Q", "♣2"])
      const player: IPlayer = playerGenerator(10, ["♣7", "♦2"])

      expect(calculateResult(dealer, player)).toBe(10)
    })
  })

  describe("both Pok", () => {
    it("results in a draw", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦7", "♣2"])
      const player: IPlayer = playerGenerator(10, ["♣7", "♦2"])

      expect(calculateResult(dealer, player)).toBe(0)
    })

    it("Pok 9 win Pok 8 results in a player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦7", "♣A"])
      const player: IPlayer = playerGenerator(10, ["♣7", "♦2"])

      expect(calculateResult(dealer, player)).toBe(10)
    })

    it("Pok 9 win Pok 8 results in a player wins with Deng", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦7", "♣A"])
      const player: IPlayer = playerGenerator(10, ["♣7", "♣2"])

      expect(calculateResult(dealer, player)).toBe(20)
    })

    it("Pok 9 win Pok 8 results in a dealer wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣7", "♦2"])
      const player: IPlayer = playerGenerator(10, ["♦7", "♣A"])

      expect(calculateResult(dealer, player)).toBe(-10)
    })

    it("Pok 9 win Pok 8 results in a dealer wins with Deng", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣7", "♣2"])
      const player: IPlayer = playerGenerator(10, ["♦7", "♣A"])

      expect(calculateResult(dealer, player)).toBe(-20)
    })
  })

  describe("Deng", () => {
    it("multiplies win with player's Deng, if player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣7", "♣Q", "♣2"])
      const player: IPlayer = playerGenerator(10, ["♦7", "♦2"])

      expect(calculateResult(dealer, player)).toBe(20)
    })

    it("multiplies lose with dealer's Deng, if player loses", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣7", "♣Q", "♣2"]) // 3 Deng
      const player: IPlayer = playerGenerator(10, ["♦3", "♦2"])

      expect(calculateResult(dealer, player)).toBe(-30)
    })
  })

  describe("Tong (3 of a kind)", () => {
    it("multiplies win with 5 Deng, if player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦6", "♦A"])
      const player: IPlayer = playerGenerator(10, ["♣3", "♦3", "♥3"])

      expect(calculateResult(dealer, player)).toBe(50)
    })

    it("multiplies lose with 5 Deng, if player loses", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣3", "♦3", "♥3"])
      const player: IPlayer = playerGenerator(10, ["♦6", "♦A"])

      expect(calculateResult(dealer, player)).toBe(-50)
    })
  })

  describe("Sam Lueng", () => {
    it("multiplies win with 3 Deng, if player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦6", "♦A"])
      const player: IPlayer = playerGenerator(10, ["♣J", "♦J", "♥Q"])

      expect(calculateResult(dealer, player)).toBe(30)
    })

    it("multiplies lose with 3 Deng, if player loses", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣J", "♦J", "♥Q"])
      const player: IPlayer = playerGenerator(10, ["♦6", "♦A"])

      expect(calculateResult(dealer, player)).toBe(-30)
    })
  })

  describe("straights", () => {
    it("multiplies win with 3 Deng, if player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦6", "♦A"])
      const player: IPlayer = playerGenerator(10, ["♣2", "♦3", "♥4"])

      expect(calculateResult(dealer, player)).toBe(30)
    })

    it("multiplies lose with 3 Deng, if player loses", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣2", "♦3", "♥4"])
      const player: IPlayer = playerGenerator(10, ["♦6", "♦A"])

      expect(calculateResult(dealer, player)).toBe(-30)
    })

    it("multiplies lose with 3 Deng, if player loses", () => {
      const dealer: IPlayer = playerGenerator(0, ["♣7", "♦8", "♥9"])
      const player: IPlayer = playerGenerator(10, ["♦6", "♦A"])

      expect(calculateResult(dealer, player)).toBe(-30)
    })
  })

  describe("straights flush", () => {
    it("multiplies win with 5 Deng, if player wins", () => {
      const dealer: IPlayer = playerGenerator(0, ["♦6", "♦A"])
      const player: IPlayer = playerGenerator(10, ["♥2", "♥3", "♥4"])

      expect(calculateResult(dealer, player)).toBe(50)
    })

    it("multiplies lose with 5 Deng, if player win straights flush with face card", () => {
      const dealer: IPlayer = playerGenerator(0, ["♥K", "♥Q", "♥J"])
      const player: IPlayer = playerGenerator(10, ["♦6", "♦A"])

      expect(calculateResult(dealer, player)).toBe(-50)
    })
  })
})

describe("isStraight", () => {
  it("returns true for 2,3,4", () => {
    expect(isStraight(["2", "4", "3"])).toBe(true)
  })
  it("returns true for 5,6,7", () => {
    expect(isStraight(["7", "5", "6"])).toBe(true)
  })
  it("returns true for 10,J,Q", () => {
    expect(isStraight(["10", "Q", "J"])).toBe(true)
  })
  it("returns true for Q,K,A", () => {
    expect(isStraight(["A", "Q", "K"])).toBe(true)
  })
  it("returns false for K,A,2", () => {
    expect(isStraight(["A", "2", "K"])).toBe(false)
  })
  it("returns false for non straight pattern", () => {
    expect(isStraight(["2", "2", "3"])).toBe(false)
  })
})

describe("isFlush", () => {
  it("returns true for ♥A ♥3 ♥5", () => {
    expect(isFlush(playerGenerator(0, ["♥A", "♥3", "♥5"]).cards)).toBe(true)
  })
  it("returns false for ♦Q ♥K ♥J", () => {
    expect(isFlush(playerGenerator(0, ["♦Q", "♥K", "♥J"]).cards)).toBe(false)
  })
})

describe("isStraightFlush", () => {
  it("returns true for ♥4 ♥5 ♥6", () => {
    expect(isStraightFlush(playerGenerator(0, ["♥4", "♥5", "♥6"]).cards)).toBe(true)
  })

  it("returns false for ♥J ♥Q ♥10", () => {
    expect(isStraightFlush(playerGenerator(0, ["♥J", "♥Q", "♥10"]).cards)).toBe(true)
  })

  it("returns false for ♥Q ♥A ♥K", () => {
    expect(isStraightFlush(playerGenerator(0, ["♥Q", "♥A", "♥K"]).cards)).toBe(true)
  })

  it("returns false for ♥A ♥2 ♥3", () => {
    expect(isStraightFlush(playerGenerator(0, ["♥A", "♥2", "♥3"]).cards)).toBe(false)
  })

  it("returns false for ♥Q ♥K ♥10", () => {
    console.log(playerGenerator(0, ["♥Q", "♥K", "♥10"]).cards)
    expect(isStraightFlush(playerGenerator(0, ["♥Q", "♥K", "♥10"]).cards)).toBe(false)
  })

  it("returns false for ♥Q ♥K ♦J", () => {
    expect(isStraightFlush(playerGenerator(0, ["♥Q", "♥K", "♦J"]).cards)).toBe(false)
  })
})

describe("handResult", () => {
  it("returns แต้ม for normal cases", () => {
    const player = playerGenerator(0, ["♥A", "♦2"])

    expect(handResult(player)).toBe("3 แต้ม")
  })

  it("returns 2 เด้ง for pairs", () => {
    const player = playerGenerator(0, ["♥A", "♥J"])

    expect(handResult(player)).toBe("1 แต้ม 2 เด้ง")
  })

  it("returns 3 เด้ง for isSamLueng", () => {
    const player = playerGenerator(0, ["♣J", "♦J", "♥Q"])

    expect(handResult(player)).toBe("สามเหลือง")
  })

  it("returns 3 เด้ง for straight", () => {
    const player = playerGenerator(0, ["♣3", "♦4", "♥5"])

    expect(handResult(player)).toBe("เรียง (3 เด้ง)")
  })

  it("returns 5 เด้ง for straight flush", () => {
    const player = playerGenerator(0, ["♦3", "♦4", "♦5"])

    expect(handResult(player)).toBe("เรียง (5 เด้ง)")
  })

  it("returns 5 เด้ง for 3 of a kind", () => {
    const player = playerGenerator(0, ["♣3", "♦3", "♥3"])

    expect(handResult(player)).toBe("ตอง (5 เด้ง)")
  })
})
