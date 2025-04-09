"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

export default function ImportPage() {
  const [wordInput, setWordInput] = useState("")
  const router = useRouter()

  const handleImport = () => {
    if (!wordInput.trim()) {
      toast({
        title: "输入为空",
        description: "请输入单词和翻译",
        variant: "destructive",
      })
      return
    }

    try {
      // Parse input - expecting format: "word,translation" per line
      const wordPairs = wordInput
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const [word, translation] = line.split(/[,\t]/).map((item) => item.trim())
          if (!word || !translation) {
            throw new Error(`格式错误: ${line}`)
          }
          return { word, translation }
        })

      if (wordPairs.length < 3) {
        toast({
          title: "单词太少",
          description: "请至少输入3对单词和翻译",
          variant: "destructive",
        })
        return
      }

      // Save to localStorage
      localStorage.setItem("customWordList", JSON.stringify(wordPairs))

      toast({
        title: "导入成功",
        description: `已导入 ${wordPairs.length} 对单词`,
      })

      // Redirect to game with custom mode
      router.push("/game?mode=custom")
    } catch (error) {
      toast({
        title: "导入失败",
        description:
          error instanceof Error ? error.message : "格式错误，请确保每行包含一个单词和一个翻译，用逗号或制表符分隔",
        variant: "destructive",
        action: <ToastAction altText="了解更多">了解更多</ToastAction>,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-2 border-purple-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-700">导入自定义单词</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 mb-2">
            每行输入一对单词和翻译，用逗号或制表符分隔。
            <br />
            例如：<code>apple,苹果</code> 或 <code>book,书</code>
          </div>

          <Textarea
            placeholder="apple,苹果&#10;book,书&#10;cat,猫"
            className="min-h-[200px] text-base border-purple-200"
            value={wordInput}
            onChange={(e) => setWordInput(e.target.value)}
          />

          <div className="flex space-x-3 pt-2">
            <Button
              variant="default"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={handleImport}
            >
              导入单词
            </Button>
            <Link href="/" passHref>
              <Button variant="outline" className="flex-1 border-purple-300 text-purple-700">
                返回首页
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
