"use client";

import { X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface UserData {
  emails: string[];
  fromEmail?: string;
  appPassword?: string;
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function EmailSettings() {
  // "To" emails for notifications
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // "From" credentials (for sending notifications)
  const [fromEmail, setFromEmail] = useState("");
  const [appPassword, setAppPassword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://${process.env.API_BASE_ENDPOINT}/api/me`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data: UserData = await response.json();
        setEmails(data.emails || []);
        setFromEmail(data.fromEmail || "");
        setAppPassword(data.appPassword || "");
        setUnsavedChanges(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChanges]);

  const validateEmail = (email: string) => {
    return emailRegex.test(email);
  };

  const addEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      currentEmail &&
      validateEmail(currentEmail) &&
      !emails.includes(currentEmail)
    ) {
      setEmails([...emails, currentEmail]);
      setCurrentEmail("");
      setIsError(false);
      setUnsavedChanges(true);
    } else {
      setIsError(true);
      if (inputRef.current) {
        inputRef.current.classList.add("animate-shake");
        setTimeout(() => {
          inputRef.current?.classList.remove("animate-shake");
        }, 500);
      }
      toast.error("Please enter a valid email address");
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove));
    setUnsavedChanges(true);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `http://${process.env.API_BASE_ENDPOINT}/api/me`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emails, fromEmail, appPassword }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      toast.success("Email notification settings updated!");
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update email settings");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8">
        <Skeleton className="h-12 w-1/2 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
        <div className="mt-10 ml-auto w-1/4">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle>Email Notification Settings</CardTitle>
        <CardDescription>
          Configure your sender ("From") credentials on the left and manage
          recipient ("To") email addresses on the right.
        </CardDescription>
      </CardHeader>
      <CardContent className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email Address</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="Enter sender email"
                value={fromEmail}
                onChange={(e) => {
                  setFromEmail(e.target.value);
                  setUnsavedChanges(true);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appPassword">App Password</Label>
              <Input
                id="appPassword"
                type="password"
                placeholder="Enter app password"
                value={appPassword}
                onChange={(e) => {
                  setAppPassword(e.target.value);
                  setUnsavedChanges(true);
                }}
              />
            </div>
          </div>
          {/* Right column: To fields */}
          <div className="space-y-8">
            <form onSubmit={addEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Add Recipient Email Address</Label>
                <div className="flex space-x-4">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    className={isError ? "border-red-500" : ""}
                    ref={inputRef}
                  />
                  <Button type="submit">Add</Button>
                </div>
              </div>
            </form>
            <div className="space-y-2">
              <Label>Notification Recipients</Label>
              <div className="mt-2 flex flex-wrap gap-4">
                {emails.map((email) => (
                  <span
                    key={email}
                    className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground"
                  >
                    {email}
                    <button
                      type="button"
                      onClick={() => removeEmail(email)}
                      className="ml-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/80"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove email</span>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-6">
        <Button onClick={handleUpdate}>Update Settings</Button>
      </CardFooter>
    </Card>
  );
}
