"use client";

import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { updateUser } from "@/store/slices/authSlice";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconWorld,
} from "@tabler/icons-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    first_name: string;
    last_name: string;
    username: string;
    bio?: string;
    github_url?: string;
    linkedin_url?: string;
    x_url?: string;
    website_url?: string;
  };
}

export default function EditProfileModal({
  isOpen,
  onOpenChange,
  user,
}: EditProfileModalProps) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    bio: "",
    github_url: "",
    linkedin_url: "",
    x_url: "",
    website_url: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        bio: user.bio || "",
        github_url: user.github_url || "",
        linkedin_url: user.linkedin_url || "",
        x_url: user.x_url || "",
        website_url: user.website_url || "",
      });
    }
  }, [user]);

  const handleSave = async (onClose: () => void) => {
    const result = await dispatch(updateUser(formData));
    if (updateUser.fulfilled.match(result)) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Edit Profile
              <p className="text-sm font-normal text-default-500">
                Update your personal information
              </p>
            </ModalHeader>
            <ModalBody className="max-h-[70vh] overflow-y-auto">
              <Input
                label="First Name"
                variant="flat"
                value={formData.first_name}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, first_name: v }))
                }
              />
              <Input
                label="Last Name"
                variant="flat"
                value={formData.last_name}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, last_name: v }))
                }
              />
              <Input
                label="Username"
                variant="flat"
                startContent={
                  <span className="text-default-400 text-small">@</span>
                }
                value={formData.username}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, username: v }))
                }
              />
              <textarea
                className="w-full min-h-[80px] p-3 rounded-xl bg-default-100 text-sm text-foreground placeholder:text-default-400 outline-none resize-none"
                placeholder="Write a short bio..."
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                maxLength={250}
              />
              <div className="pt-2 text-sm font-medium text-default-700">
                Social Links
              </div>
              <Input
                label="GitHub URL"
                variant="flat"
                startContent={
                  <IconBrandGithub className="text-default-400" size={18} />
                }
                value={formData.github_url}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, github_url: v }))
                }
              />
              <Input
                label="LinkedIn URL"
                variant="flat"
                startContent={
                  <IconBrandLinkedin className="text-default-400" size={18} />
                }
                value={formData.linkedin_url}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, linkedin_url: v }))
                }
              />
              <Input
                label="X (Twitter) URL"
                variant="flat"
                startContent={
                  <IconBrandX className="text-default-400" size={18} />
                }
                value={formData.x_url}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, x_url: v }))
                }
              />
              <Input
                label="Personal Website"
                variant="flat"
                startContent={
                  <IconWorld className="text-default-400" size={18} />
                }
                value={formData.website_url}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, website_url: v }))
                }
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="success"
                variant="flat"
                isLoading={isLoading}
                onPress={() => handleSave(onClose)}
              >
                Save Changes
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
