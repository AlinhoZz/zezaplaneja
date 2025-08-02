"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase" // Importa o cliente Supabase do lado do cliente

interface AuthFormProps {
  onAuthSuccess: () => void
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos.")
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(), // Adicionado .trim()
          password: password.trim(), // Adicionado .trim()
        })
        if (signInError) throw signInError
        setMessage("Login bem-sucedido!")
        onAuthSuccess()
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(), // Adicionado .trim()
          password: password.trim(), // Adicionado .trim()
        })
        if (signUpError) throw signUpError
        setMessage("Cadastro realizado! Verifique seu e-mail para confirmar.")
        setIsLogin(true)
      }
    } catch (err: any) {
      console.error("Auth error:", err)
      setError(err.message || "Ocorreu um erro na autenticação.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold dark:text-white">{isLogin ? "Entrar" : "Criar Conta"}</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Acesse seu planejador" : "Comece a organizar sua vida"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md dark:bg-red-900/20 dark:text-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            {message && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-800 bg-green-100 border border-green-200 rounded-md dark:bg-green-900/20 dark:text-green-200 dark:border-green-800">
                <AlertCircle className="h-4 w-4" />
                {message}
              </div>
            )}
            <div>
              <Label htmlFor="email" className="dark:text-gray-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="password" className="dark:text-gray-200">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Cadastrar"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm dark:text-gray-400">
            {isLogin ? (
              <>
                Não tem uma conta?{" "}
                <Button
                  variant="link"
                  onClick={() => setIsLogin(false)}
                  className="p-0 h-auto text-blue-600 dark:text-blue-400"
                >
                  Cadastre-se
                </Button>
              </>
            ) : (
              <>
                Já tem uma conta?{" "}
                <Button
                  variant="link"
                  onClick={() => setIsLogin(true)}
                  className="p-0 h-auto text-blue-600 dark:text-blue-400"
                >
                  Entrar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
