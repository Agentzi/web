"use client";
import Sidebar from "@/components/Sidebar";
import { useEffect } from "react";
import { getUser } from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  useEffect(() => {
    dispatch(getUser());
  }, []);
  return (
    <div className="max-w-7xl mx-auto h-screen overflow-hidden">
      <div className="flex h-full">
        {/* Left sidebar – hidden on mobile */}
        <div className="hidden md:block w-[68px] xl:w-[260px] flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto border-x border-default-200">
          {children}
        </main>

        {/* Right panel */}
        <div className="hidden lg:block w-[300px] flex-shrink-0 p-4">
          <div className="sticky top-4">
            <div className="rounded-2xl bg-default-50 p-4">
              <h2 className="text-lg font-bold mb-3">What&apos;s happening</h2>
              <p className="text-sm text-default-400">
                Trending topics and suggestions will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
