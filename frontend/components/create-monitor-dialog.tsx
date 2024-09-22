"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";  
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { toast } from "sonner";

interface CreateMonitorDialogProps {
  sendMonitorRequest: (url: string, interval: string) => void;
}

export function CreateMonitorDialog({
  sendMonitorRequest,
}: CreateMonitorDialogProps) {
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState("");
  const [open, setOpen] = useState(false);
  const [urlError, setUrlError] = useState("");
  const [intervalError, setIntervalError] = useState("");

  const validateUrl = (value: string) => {
    if (!value) {
      setUrlError("URL is required");
      return false;
    }
    try {
      new URL(value);
      setUrlError("");
      return true;
    } catch {
      setUrlError("Invalid URL");
      return false;
    }
  };

  const validateInterval = (value: string) => {
    if (!value) {
      setIntervalError("Interval is required");
      return false;
    }
    setIntervalError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isUrlValid = validateUrl(url);
    const isIntervalValid = validateInterval(interval);

    if (isUrlValid && isIntervalValid) {
      sendMonitorRequest(url, interval);
      setUrl("");
      setInterval("");
      setOpen(false);
      toast.success("Monitor added", {
        description: `Successfully added monitor for ${url}`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setUrl(e.target.value);
                  validateUrl(e.target.value);
                }}
                placeholder="https://example.com"
              />
              {urlError && <p className="text-sm text-red-500 mt-1">{urlError}</p>}
            </div>    
            <div>
              <Label htmlFor="interval">Check Interval</Label>
              <Select 
                value={interval} 
                onValueChange={(value) => {
                  setInterval(value);
                  validateInterval(value);
                }}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent className="bg-background text-white">
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="45">45 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="180">3 minutes</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                </SelectContent>
              </Select>
              {intervalError && <p className="text-sm text-red-500 mt-1">{intervalError}</p>}
            </div>
            <Button type="submit">Add Monitor</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
