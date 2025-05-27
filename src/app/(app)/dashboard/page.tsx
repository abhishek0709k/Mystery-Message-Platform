"use client";

import MessageCard from "@/components/message-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message } from "@/model/User";
import { isAcceptableMessageSchema } from "@/schemas/acceptableMessageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [profileUrl, setProfileUrl] = useState("")
  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(isAcceptableMessageSchema),
  });
  const { register, watch, setValue } = form;
  const acceptMessage = watch("isAcceptable");

  const handleDeleteMessage = (MessageId: string) => {
    setMessages(
      messages.filter((message: Message) => message._id !== MessageId)
    );
  };

  const getMessages = async () => {
    setIsLoading(true);
    const response = await axios.get(`/api/get-messages`);
    if (!response.data.success) {
      toast.error(response.data.message);
    } else {
      setValue("isAcceptable", response.data.isAcceptable);
      setMessages(response.data.Messages || []);
      toast.success("Getted Message successfully");
    }
  };
  useEffect(() => {
    getMessages();
    const username = session?.user?.username;
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    setProfileUrl(`${baseUrl}/u/${username}`);
    setIsLoading(false);
  }, [session]);

  const handleToggleIsAcceptingMessage = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/api/accept-message`, {
        isAcceptingMessage: !acceptMessage,
      });
      if (!response.data.success) {
        toast.error("Error while accepting message");
      }
      setValue("isAcceptable", !acceptMessage);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage =
        (axiosError.response?.data as { message?: string })?.message ??
        "Error while checking username";
      toast.error(errorMessage);
    }
    setIsLoading(false);
  };

  // making profile Url

  const handleCopyToClipboard = async () => {
    setIsLoading(true);
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success("Copied to clipboard");
    } catch (error) {
      console.error("Failed to copy: ", error);
    }
  };

  if (!session || !session.user) {
    return <p className="text-center text-[100px] font-bold">user not found</p>;
  }
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={handleCopyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("isAcceptable")}
          checked={acceptMessage}
          onCheckedChange={handleToggleIsAcceptingMessage}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessage ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          getMessages();
        }}
      >Refresh</Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
