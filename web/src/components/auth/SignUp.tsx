"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Droplets, Eye, EyeOff, UserPlus } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

import { Button } from "../../components/ui/button"

export default function SignUp() {
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirm, setShowConfirm] = useState(false)
	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [error, setError] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const { signup, user, loading: authLoading } = useAuth()
	const router = useRouter()

	useEffect(() => {
		if (!authLoading && user) {
			router.push('/dashboard')
		}
	}, [authLoading, user, router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError("")

		if (password !== confirmPassword) {
			setError("Passwords do not match")
			return
		}

		setIsLoading(true)
		try {
			await signup(email, name, password)
		} catch (err: any) {
			setError(err.message || "Signup failed. Please try again.")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="min-h-screen flex justify-center items-center bg-linear-to-b from-sky-50 via-white to-sky-50 text-slate-900">
			<div className="w-full max-w-lg rounded-2xl bg-white/90 p-12 shadow-xl ring-1 ring-sky-100 backdrop-blur">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-600">
						<Droplets className="size-6" />
					</div>
					<div className="mt-4 text-center">
						<h1 className="text-2xl font-semibold text-slate-900">Create Account</h1>
						<p className="mt-2 text-sm text-slate-600">
							Sign up to monitor and optimize your water usage.
						</p>
					</div>

<form className="mt-8 space-y-5" onSubmit={handleSubmit}>
					{error && (
						<div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-200">
							{error}
						</div>
					)}
					<div className="space-y-4">
						<label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="name">
							Full Name
						</label>
						<input
							id="name"
							type="text"
							placeholder="e.g. Jane Doe"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition outline-none hover:border-sky-200"
						/>
					</div>

					<div className="space-y-4">
						<label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="email">
							Email Address
						</label>
						<input
							id="email"
							type="email"
							placeholder="e.g. user@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition outline-none hover:border-sky-200"
						/>
					</div>

					<div className="space-y-4">
						<label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="password">
							Password
						</label>
						<div className="relative">
							<input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Choose a strong password"
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

					<div className="space-y-4">
						<label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="confirm">
							Confirm Password
						</label>
						<div className="relative">
							<input
								id="confirm"
								type={showConfirm ? "text" : "password"}
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900 shadow-sm transition outline-none hover:border-sky-200"
							/>
							<button
								type="button"
								aria-label="Toggle confirm password visibility"
								onClick={() => setShowConfirm((prev) => !prev)}
								className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
							>
								{showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
							</button>
						</div>
					</div>

					<Button disabled={isLoading} className="flex w-full items-center justify-center gap-2 bg-sky-600 text-white hover:bg-sky-700">
						<UserPlus className="size-4" />
						{isLoading ? "Creating Account..." : "Create Account"}
						</Button>
					</form>

					<div className="mt-6 flex flex-col items-center gap-4 text-sm text-slate-600">
						<div className="h-px w-full bg-linear-to-r from-transparent via-slate-200 to-transparent" />
						<p>
							Already have an account?{" "}
							<Link href="/login" className="font-semibold text-sky-700 hover:text-sky-800">
								Sign in
							</Link>
						</p>
					</div>
				</div>
			</div>

			
		
	)
}
