"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardNav } from "@/components/dashboard-nav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Camera, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserProfile, updateUserProfile, changePassword } from "@/app/actions/user-actions"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  cardNumber: string
}

export default function ProfilePage() {
  const { toast } = useToast()
  const router = useRouter()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const result = await getUserProfile()

        if (result.success && result.user) {
          setProfileData({
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone || "",
            cardNumber: result.user.cardNumber,
          })
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to load profile data",
            variant: "destructive",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchUserProfile()
    }
  }, [status, router, toast])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsUpdating(true)

    try {
      const formData = new FormData()
      formData.append("name", profileData.name)
      formData.append("phone", profileData.phone)

      const result = await updateUserProfile(formData)

      if (result.success) {
        setSuccess("Profile updated successfully")

        if (result.user) {
          setProfileData({
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone || "",
            cardNumber: result.user.cardNumber,
          })
        }

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        })
      } else {
        setError(result.message || "Failed to update profile")
      }
    } catch (error) {
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsUpdating(true)

    try {
      const formData = new FormData()
      formData.append("currentPassword", passwordData.currentPassword)
      formData.append("newPassword", passwordData.newPassword)
      formData.append("confirmPassword", passwordData.confirmPassword)

      const result = await changePassword(formData)

      if (result.success) {
        setSuccess("Password updated successfully")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        toast({
          title: "Password updated",
          description: "Your password has been updated successfully",
        })
      } else {
        setError(result.message || "Failed to update password")
      }
    } catch (error) {
      setError("Failed to update password. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b sticky top-0 bg-background z-10">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="h-8 w-32">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <div className="w-64 border-r bg-muted/20 hidden md:block">
            <Skeleton className="h-full w-full" />
          </div>

          <main className="flex-1 p-4 md:p-6">
            <div className="container mx-auto max-w-4xl">
              <Skeleton className="h-10 w-64 mb-6" />

              <div className="space-y-6">
                <Skeleton className="h-[150px] w-full" />
                <Skeleton className="h-[400px] w-full" />
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold">
            DigiCard
          </Link>
          <MobileNav />
        </div>
      </header>

      <div className="flex flex-1">
        <DashboardNav />

        <main className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Profile Settings</h1>

            <div className="mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                        <AvatarFallback>
                          {profileData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <h2 className="text-xl font-semibold">{profileData.name}</h2>
                    <p className="text-muted-foreground">Card Number: {profileData.cardNumber}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="personal">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="personal">Personal Information</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          required
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          required
                          disabled={true} // Email cannot be changed
                          className="bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          disabled={isUpdating}
                        />
                      </div>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Profile"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          required
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          required
                          disabled={isUpdating}
                        />
                        <p className="text-xs text-muted-foreground">
                          Password must be at least 8 characters and include letters and numbers
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          required
                          disabled={isUpdating}
                        />
                      </div>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

