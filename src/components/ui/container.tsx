import { cn } from "@/lib/utils";

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export default function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto h-full w-full max-w-6xl px-4 py-2", className)}
      {...props}
    />
  );
}
