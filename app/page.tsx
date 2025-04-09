"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export default function HomePage() {
  const [showTestCase, setShowTestCase] = useState(false)
  
  const handleTestCase = () => {
    // 保存测试用例到localStorage
    const testWords = [
      { word: "algorithm", translation: "算法" },
      { word: "variable", translation: "变量" },
      { word: "function", translation: "函数" },
      { word: "database", translation: "数据库" },
      { word: "interface", translation: "接口" },
      { word: "component", translation: "组件" },
      { word: "framework", translation: "框架" },
      { word: "library", translation: "库" },
      { word: "debugging", translation: "调试" },
      { word: "deployment", translation: "部署" }
    ]
    
    localStorage.setItem("customWordList", JSON.stringify(testWords))
    setShowTestCase(true)
    
    // 3秒后隐藏提示
    setTimeout(() => {
      setShowTestCase(false)
    }, 3000)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-2 border-purple-200 relative overflow-hidden">
        {showTestCase && (
          <div className="absolute top-0 left-0 right-0 bg-green-500 text-white p-2 text-center animate-bounce">
            测试用例已加载！点击"导入自定义单词"按钮进入导入页面
          </div>
        )}
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">单词消消乐</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col space-y-3">
            <Link href="/game?mode=default" passHref>
              <Button className="h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-md rounded-xl transition-all duration-300 transform hover:scale-105">
                使用内置词库
              </Button>
            </Link>
            <Link href="/import" passHref>
              <Button
                variant="outline"
                className="h-14 text-lg border-2 border-purple-300 text-purple-700 hover:bg-purple-100 shadow-md rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                导入自定义单词
              </Button>
            </Link>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow-inner">
            <h3 className="font-semibold text-lg text-purple-800 mb-2">游戏说明：</h3>
            <ul className="list-disc pl-5 space-y-1 text-purple-700">
              <li>点击配对的英文单词和中文释义卡片将它们消除</li>
              <li>消除所有卡片即可完成关卡</li>
              <li>点击英文卡片可以听到单词发音</li>
              <li>连续3次错误匹配后会有提示</li>
            </ul>
          </div>
          
          <div className="flex justify-center mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleTestCase}
              className="text-purple-500 hover:text-purple-700 text-sm"
            >
              加载测试用例
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
