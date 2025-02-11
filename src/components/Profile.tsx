"use client"

import { useState } from "react";
import { useUser } from '@clerk/nextjs';
import { Loader2,UserCog  } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FormData {
    firstName: string;
    lastName: string;
    userName: string;
  }
const ProfileDropdown = () => {
  const [isOpen, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const hasChanges = Object.values(formData).some(value => value.length > 0);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleChangeName = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/update-user", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...formData
        })
      });

      if (response.ok) {
        await user?.reload();
        setFormData({ firstName: "", lastName: "", userName: "" });
        setOpen(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!isOpen)}
        className="flex items-center gap-2 bg-yellow-400/5 hover:bg-yellow-400/20 hover:text-yellow-600 text-yellow-400"
      >
        <UserCog className="w-4 h-4" />
        <span>Edit Profile</span>
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-4 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="space-y-3">
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="First Name"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Last Name"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Input
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              placeholder="Username"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button
              onClick={handleChangeName}
              disabled={!hasChanges || isLoading}
              className="w-full bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 disabled:opacity-50 disabled:hover:bg-yellow-400/10"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span>Saving</span>
                  <Loader2 className="animate-spin h-4 w-4" />
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;