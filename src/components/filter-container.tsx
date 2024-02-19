import Spinner from "./ui/spinner";

interface FilterContainerProps {
  title: string;
  isLoading?: boolean;
  titleChildren?: React.ReactNode;
  children: React.ReactNode;
}

export default function FilterContainer({
  title,
  isLoading,
  titleChildren,
  children,
}: FilterContainerProps) {
  return (
    <div className="relative rounded-md p-4 sm:border sm:border-input sm:bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg">
          <span className="flex items-center">
            {title}
            {isLoading && <Spinner className="ml-2 h-4 w-4" />}
          </span>
        </h3>

        {titleChildren}
      </div>

      <div className="mt-3">{children}</div>
    </div>
  );
}
