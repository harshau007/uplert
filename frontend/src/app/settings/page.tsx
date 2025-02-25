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
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function EmailSettings() {
  const [emails, setEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch(
          `http://${process.env.API_BASE_ENDPOINT}/api/me`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch emails");
        }
        const data: UserData = await response.json();
        setEmails(data.emails || []);
        setUnsavedChanges(false);
      } catch (error) {
        console.error("Error fetching emails:", error);
        toast.error("Failed to load existing emails");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
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
          body: JSON.stringify({ emails }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update emails");
      }

      toast.success("Email notification settings updated!");
      setUnsavedChanges(false);
    } catch (error) {
      console.error("Error updating emails:", error);
      toast.error("Failed to update email settings");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="w-full max-w-2xl space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-56" />
          <Skeleton className="h-10 w-1/4 ml-auto" />
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Email Notification Settings</CardTitle>
        <CardDescription>
          Manage email addresses for notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={addEmail} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Add Email Address</Label>
            <div className="flex space-x-2">
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
        <div className="mt-4">
          <Label>Notification Recipients</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {emails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-sm font-semibold text-primary-foreground"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/80"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove email</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleUpdate}>Update Settings</Button>
      </CardFooter>
    </Card>
  );
}
