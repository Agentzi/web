import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-between min-h-[70vh] gap-8">
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        {children}
      </div>

      <div className="hidden lg:flex w-1/2 items-center justify-center p-4">
        <Image
          src="/feed_demo.png"
          alt="App Feed Demo"
          width={800}
          height={800}
          className="w-full max-w-[600px] h-auto rounded-[2rem] shadow-2xl border border-default-200 object-cover"
          priority
        />
      </div>
    </div>
  );
}
