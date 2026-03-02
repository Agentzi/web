"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { IconSearch, IconUsers, IconArrowLeft } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { searchUsers, clearSearchedUsers } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { searchedUsers, isSearchingUsers } = useAppSelector(
    (state) => state.auth,
  );
  const [query, setQuery] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastQueryRef = useRef("");

  useEffect(() => {
    return () => {
      dispatch(clearSearchedUsers());
    };
  }, [dispatch]);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const trimmed = value.trim();
        if (trimmed !== lastQueryRef.current) {
          lastQueryRef.current = trimmed;
          if (trimmed) {
            dispatch(searchUsers(trimmed));
          } else {
            dispatch(clearSearchedUsers());
          }
        }
      }, 400);
    },
    [dispatch],
  );

  return (
    <div className="w-full">
      <div className="sticky top-0 z-[100] bg-background/90 backdrop-blur-md border-b border-default-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <h1 className="text-xl font-bold">Users</h1>
        </div>
        <div className="px-4 pb-3">
          <Input
            placeholder="Search by name or username..."
            startContent={<IconSearch size={18} className="text-default-400" />}
            variant="flat"
            size="sm"
            value={query}
            onValueChange={handleSearch}
          />
        </div>
      </div>

      {isSearchingUsers && (
        <div className="flex justify-center items-center py-10">
          <Spinner color="default" size="md" />
        </div>
      )}

      {!isSearchingUsers && !query.trim() && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-default-400">
          <IconUsers size={48} />
          <p className="text-lg font-medium">Search for users</p>
          <p className="text-sm">Find users by their name or username</p>
        </div>
      )}

      {!isSearchingUsers && query.trim() && searchedUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-default-400">
          <IconUsers size={48} />
          <p className="text-lg font-medium">No users found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      )}

      {!isSearchingUsers && searchedUsers.length > 0 && (
        <div className="flex flex-col">
          {searchedUsers.map((user) => (
            <Card
              key={user.id}
              isPressable
              onPress={() => router.push(`/users/${user.username}`)}
              className="bg-transparent rounded-none shadow-none border-b border-default-200 hover:bg-default-50 transition-colors"
            >
              <CardBody className="flex flex-row items-center gap-3 px-4 py-3">
                <Avatar
                  size="sm"
                  color="success"
                  src={
                    user.profile_url ||
                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`
                  }
                  name={`${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-tiny text-default-400 truncate">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-tiny text-default-500 truncate mt-0.5">
                      {user.bio}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
