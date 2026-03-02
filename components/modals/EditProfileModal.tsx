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

interface EditProfileModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    first_name: string;
    last_name: string;
    username: string;
    bio?: string;
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
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        bio: user.bio || "",
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
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
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
