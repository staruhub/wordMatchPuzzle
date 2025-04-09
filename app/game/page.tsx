"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { defaultWordList } from "@/lib/word-list"
import { toast } from "@/components/ui/use-toast"

// Define types
type WordPair = {
  word: string
  translation: string
}

type CardItem = {
  id: number
  content: string
  type: "word" | "translation"
  pairId: number
  isFlipped: boolean
  isMatched: boolean
}

export default function GamePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "default"

  const [cards, setCards] = useState<CardItem[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isGameComplete, setIsGameComplete] = useState(false)
  const [consecutiveFailures, setConsecutiveFailures] = useState(0)
  const [hintPairId, setHintPairId] = useState<number | null>(null)

  // Initialize game
  useEffect(() => {
    let wordList: WordPair[] = []

    if (mode === "custom") {
      try {
        const savedList = localStorage.getItem("customWordList")
        if (savedList) {
          wordList = JSON.parse(savedList)
        } else {
          toast({
            title: "未找到自定义单词",
            description: "将使用默认单词列表",
            variant: "destructive",
          })
          wordList = defaultWordList
        }
      } catch (error) {
        toast({
          title: "加载自定义单词失败",
          description: "将使用默认单词列表",
          variant: "destructive",
        })
        wordList = defaultWordList
      }
    } else {
      wordList = defaultWordList
    }

    // Limit to 10 pairs for the game
    const gamePairs = wordList.slice(0, 10)

    // Create cards from word pairs
    const newCards: CardItem[] = []
    gamePairs.forEach((pair, index) => {
      newCards.push({
        id: index * 2,
        content: pair.word,
        type: "word",
        pairId: index,
        isFlipped: false,
        isMatched: false,
      })

      newCards.push({
        id: index * 2 + 1,
        content: pair.translation,
        type: "translation",
        pairId: index,
        isFlipped: false,
        isMatched: false,
      })
    })

    // Shuffle cards
    const shuffledCards = [...newCards].sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
    setStartTime(Date.now())

    // Start timer
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [mode])

  // Handle card click
  const handleCardClick = useCallback(
    (id: number) => {
      // Ignore if game is complete or card is already matched
      if (isGameComplete) return

      const clickedCard = cards.find((card) => card.id === id)
      if (!clickedCard || clickedCard.isMatched || flippedCards.includes(id)) return

      // Play sound if it's a word card
      if (clickedCard.type === "word" && typeof window !== "undefined") {
        // 使用setTimeout确保在客户端渲染完成后执行
        setTimeout(() => {
          speakWord(clickedCard.content);
        }, 100);
      }

      // Flip the card
      const newFlippedCards = [...flippedCards, id]
      setFlippedCards(newFlippedCards)

      // If two cards are flipped, check for a match
      if (newFlippedCards.length === 2) {
        const [firstId, secondId] = newFlippedCards
        const firstCard = cards.find((card) => card.id === firstId)
        const secondCard = cards.find((card) => card.id === secondId)

        if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
          // Match found
          setMatchedPairs([...matchedPairs, firstCard.pairId])
          setConsecutiveFailures(0)

          // Update cards
          setCards(cards.map((card) => (card.pairId === firstCard.pairId ? { ...card, isMatched: true } : card)))

          // Clear flipped cards
          setTimeout(() => {
            setFlippedCards([])
          }, 500)
        } else {
          // No match
          setAttempts(attempts + 1)
          setConsecutiveFailures(consecutiveFailures + 1)

          // Show hint after 3 consecutive failures
          if (consecutiveFailures + 1 >= 3) {
            // Find an unmatched pair for hint
            const unmatchedPairs = cards
              .filter((card) => !card.isMatched)
              .map((card) => card.pairId)
              .filter((value, index, self) => self.indexOf(value) === index)

            if (unmatchedPairs.length > 0) {
              const randomPairId = unmatchedPairs[Math.floor(Math.random() * unmatchedPairs.length)]
              setHintPairId(randomPairId)

              // Clear hint after 1 second
              setTimeout(() => {
                setHintPairId(null)
              }, 1000)
            }

            setConsecutiveFailures(0)
          }

          // Flip cards back
          setTimeout(() => {
            setFlippedCards([])
          }, 1000)
        }
      }
    },
    [cards, flippedCards, matchedPairs, isGameComplete, attempts, consecutiveFailures],
  )

  // Check if game is complete
  useEffect(() => {
    if (cards.length > 0 && matchedPairs.length === cards.length / 2) {
      setIsGameComplete(true)

      // Save stats to localStorage
      const gameStats = {
        time: elapsedTime,
        attempts: attempts,
        date: new Date().toISOString(),
        mode: mode,
      }

      const savedStats = localStorage.getItem("gameStats")
      const statsArray = savedStats ? JSON.parse(savedStats) : []
      statsArray.push(gameStats)
      localStorage.setItem("gameStats", JSON.stringify(statsArray))
    }
  }, [matchedPairs, cards.length, elapsedTime, attempts, mode])

  // Text-to-speech function
  const speakWord = useCallback((word: string) => {
    // 确保只在客户端执行
    if (typeof window === "undefined") return;

    try {
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Restart game
  const handleRestart = () => {
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        {/* Game header */}
        <div className="flex flex-wrap justify-between items-center mb-4 p-2 sm:p-3 bg-white rounded-lg shadow gap-2">
          <div className="text-purple-700">
            <span className="font-bold">时间：</span> {formatTime(elapsedTime)}
          </div>
          <div className="text-purple-700">
            <span className="font-bold">尝试次数：</span> {attempts}
          </div>
          <Link href="/" passHref>
            <Button variant="outline" size="sm" className="border-purple-300 text-purple-700">
              返回首页
            </Button>
          </Link>
        </div>

        {/* Game board */}
        {!isGameComplete ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 mb-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`
                  aspect-[3/4] cursor-pointer transition-all duration-300 transform perspective-1000
                  ${card.isMatched ? "opacity-0 pointer-events-none" : ""}
                  ${flippedCards.includes(card.id) ? "rotate-y-180" : ""}
                  ${hintPairId === card.pairId ? "ring-4 ring-yellow-400" : ""}
                `}
                onClick={() => handleCardClick(card.id)}
              >
                <Card
                  className={`
                  h-full flex items-center justify-center p-2 text-center relative rounded-xl shadow-md
                  ${
                    flippedCards.includes(card.id)
                      ? card.type === "word"
                        ? "bg-gradient-to-br from-blue-50 to-blue-200 border-blue-300"
                        : "bg-gradient-to-br from-green-50 to-green-200 border-green-300"
                      : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  }
                  ${card.type === "word" ? "text-blue-700" : "text-green-700"}
                  ${flippedCards.includes(card.id) ? "" : "hover:from-purple-600 hover:to-pink-600"}
                `}
                >
                  <div className={`w-full text-sm sm:text-lg md:text-xl font-medium ${flippedCards.includes(card.id) ? "rotate-y-180" : ""}`}>
                    {flippedCards.includes(card.id) ? card.content : "?"}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          // Game complete screen
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">恭喜！你完成了游戏！</h2>
            <div className="space-y-2 mb-6">
              <p className="text-lg">
                <span className="font-semibold">用时：</span> {formatTime(elapsedTime)}
              </p>
              <p className="text-lg">
                <span className="font-semibold">尝试次数：</span> {attempts}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-center">
              <Button
                onClick={handleRestart}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                再玩一次
              </Button>
              <Link href="/" passHref>
                <Button variant="outline" className="border-purple-300 text-purple-700">
                  返回首页
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
