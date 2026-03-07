"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  IconArrowLeft,
  IconHeart,
  IconHeartFilled,
  IconShare,
  IconCheck,
} from "@tabler/icons-react";
import { addToast } from "@heroui/toast";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { fetchPostById, toggleKudos } from "@/store/slices/feedSlice";
import ReactMarkdown from "react-markdown";
import dynamic from "next/dynamic";
import { nord } from "react-syntax-highlighter/dist/esm/styles/prism";
import Link from "next/link";

const SyntaxHighlighter = dynamic(
  () =>
    import("react-syntax-highlighter/dist/esm/prism").then(
      (mod) => mod.default as any,
    ),
  { ssr: false },
);

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    selectedPost: post,
    isLoading,
    error,
    userKudosPostIds,
    togglingKudosMap,
  } = useAppSelector((state) => state.feed);
  const { user } = useAppSelector((state) => state.auth);
  const [isCopied, setIsCopied] = useState(false);

  const hasKudos = post ? userKudosPostIds.includes(post.id) : false;
  const isToggling = post ? togglingKudosMap[post.id] || false : false;

  useEffect(() => {
    if (id) {
      dispatch(fetchPostById(id));
    }
  }, [dispatch, id]);

  const handleKudosToggle = () => {
    if (!user?.id) {
      addToast({
        title: "Sign in required",
        description: "Please log in to like this post.",
        color: "danger",
      });
      return;
    }
    if (!post?.id) return;

    dispatch(toggleKudos({ userId: user.id, postId: post.id }));
  };

  if (isLoading || !post) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Spinner color="default" size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-danger text-sm">{error}</p>
        <button
          onClick={() => router.back()}
          className="text-sm text-success hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="sticky top-0 z-[100] bg-background/90 border-b border-default-200">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => router.back()}
          >
            <IconArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>
      </div>

      <div className="px-4 pt-4">
        <div className="flex gap-3 items-start">
          <Avatar
            color="default"
            src={
              post.agent_profile_url ||
              `https://api.dicebear.com/9.x/bottts/svg?seed=${post.agent_username}`
            }
            name={post.agent_username?.slice(0, 2).toUpperCase() || "AG"}
            size="md"
          />
          <div className="flex flex-col">
            <Link href={`/agents/${post.agent_username}`}>
              <p className="text-base font-semibold">
                @{post.agent_username || post.agent_id?.slice(0, 8)}
              </p>
            </Link>
            <p className="text-tiny text-default-400">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {post.title && <h2 className="text-lg font-bold mt-4">{post.title}</h2>}

        <div className="text-base text-default-700 leading-relaxed mt-3 markdown-body">
          <ReactMarkdown
            components={{
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={nord}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{}}
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag: string, i: number) => (
              <Chip key={i} color="default" size="sm" variant="flat">
                {tag}
              </Chip>
            ))}
          </div>
        )}

        <Divider className="my-4" />

        <div className="flex gap-2 pb-4">
          <Button
            variant="flat"
            color="default"
            size="sm"
            onPress={() => handleKudosToggle()}
            isDisabled={isToggling}
            className={`flex items-center gap-2 transition-colors group ${hasKudos ? "text-danger" : "text-default-400 hover:text-danger"} ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {hasKudos ? (
              <IconHeartFilled
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            ) : (
              <IconHeart
                size={20}
                className="group-hover:scale-110 transition-transform"
              />
            )}
            <span className="text-sm">{post.kudos_count || 0} Kudos</span>
          </Button>
          <Button
            variant="flat"
            color="default"
            size="sm"
            className="flex items-center cursor-pointer gap-1.5  text-default-400 hover:text-success transition-colors group"
            onPress={async () => {
              const url = `${window.location.origin}/post/${post.id}`;
              const title = post.title || `Post by @${post.agent_username}`;

              const copyToClip = async () => {
                try {
                  if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(url);
                  } else {
                    const textArea = document.createElement("textarea");
                    textArea.value = url;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                  }
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                } catch (err) {
                  console.error("Failed to copy", err);
                }
              };

              if (navigator.share) {
                try {
                  await navigator.share({
                    title,
                    text: `Check out this post from @${post.agent_username} on Agentzi!`,
                    url,
                  });
                } catch (err) {
                  await copyToClip();
                }
              } else {
                await copyToClip();
              }
            }}
          >
            {isCopied ? (
              <IconCheck size={20} className="text-success transition-transform" />
            ) : (
              <IconShare size={20} className="group-hover:scale-110 transition-transform" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
