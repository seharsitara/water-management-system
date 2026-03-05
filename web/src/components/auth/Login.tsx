"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Chrome, Droplets, Eye, EyeOff, LogIn } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

import { Button } from "../../components/ui/button"

export default function Login() {
	const [showPassword, setShowPassword] = useState(false)
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const { login, user, loading: authLoading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!authLoading && user) {
			router.push('/dashboard')
		}
	}, [authLoading, user, router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")
		setIsLoading(true)
		try {
			await login(email, password)
		} catch (err: any) {
			setError(err.message || "Login failed. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex justify-center items-center bg-linear-to-b from-sky-50 via-white to-sky-50 text-slate-900">
				<div className="w-full max-w-lg rounded-2xl bg-white/90 p-8 shadow-xl ring-1 ring-sky-100 backdrop-blur">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
						<Droplets className="size-6" />
					</div>
					<div className="mt-4 text-center">
						<h1 className="text-2xl font-semibold text-slate-900">Welcome Back</h1>
						<p className="mt-2 text-sm text-slate-600">
							Enter your credentials to manage your water usage.
						</p>
					</div>


<form className="mt-6 space-y-5" onSubmit={handleSubmit} autoComplete="on">
					{error && (
						<div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-200">
							{error}
						</div>
					)}
					<div className="space-y-4">
						<label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
							Email Address
						</label>
						<input
							id="email"
							name="email"
							autoComplete="email"
							type="email"
							placeholder="e.g. user@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition outline-none hover:border-sky-200"
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between text-sm font-medium text-slate-700">
							<label className="block text-sm font-medium text-slate-700" htmlFor="password">Password</label>
						</div>
						<div className="relative">
							<input
								id="password"
								name="current-password"
								autoComplete="current-password"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-sm transition outline-none hover:border-sky-200"
							/>
							<button
								type="button"
								aria-label="Toggle password visibility"
								onClick={() => setShowPassword((prev) => !prev)}
								className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
							>
								{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
							</button>
						</div>
					</div>

					<Button disabled={isLoading} className="flex w-full items-center justify-center gap-2 bg-sky-600 text-white hover:bg-sky-700">
						{isLoading ? "Signing in..." : "Sign In"}
						</Button>
					</form>

          <div className="mt-8 space-y-4">
            	<div className="flex items-center gap-3 text-xs text-slate-500">
							<span className="h-px w-full bg-slate-200" />
							<span className="whitespace-nowrap">OR</span>
							<span className="h-px w-full bg-slate-200" />
						</div>
						<Button
							type="button"
							variant="outline"
							className="w-full mt-3 border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
						>
							<Chrome className="size-4" />
							Continue with Google
						</Button>
					
					</div>

					<div className="mt-6 flex flex-col items-center gap-4 text-sm text-slate-600">
						<div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />
						<p>
							Don&apos;t have an account?{" "}
							<Link href="/sign-up" className="font-semibold text-sky-700 hover:text-sky-800">
								Create an account
							</Link>
						</p>
					</div>
				</div>
			</div>
		
	)
}
