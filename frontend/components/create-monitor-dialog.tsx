"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

interface CreateMonitorDialogProps {
  sendMonitorRequest: (url: string, interval: string) => void;
}

export function CreateMonitorDialog({
  sendMonitorRequest,
}: CreateMonitorDialogProps) {
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMonitorRequest(url, interval);
    // Reset form and close dialog
    setUrl("");
    setInterval("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Monitor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Monitor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUrl(e.target.value)
                }
                placeholder="https://example.com"
              />
            </div>
            <div>
              <Label htmlFor="interval">Check Interval (seconds)</Label>
              <Input
                id="interval"
                type="number"
                value={interval}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInterval(e.target.value)
                }
                placeholder="60"
              />
            </div>
            <Button type="submit">Add Monitor</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
