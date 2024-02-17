"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { type ButtonProps, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<typeof Link>;

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}: PaginationLinkProps) => (
  <Link
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

const Paginator = ({
  totalPages,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
}) => {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const pages = React.useMemo(() => {
    const range = 2;
    const rangeStart = Math.max(1, currentPage - range);
    const rangeEnd = Math.min(totalPages, currentPage + range);

    const pagesArr: Array<number | null> = Array.from(
      { length: rangeEnd - rangeStart + 1 },
      (_, i) => rangeStart + i,
    );

    if (rangeStart > 1) {
      pagesArr.unshift(null);
    }

    if (rangeEnd < totalPages) {
      pagesArr.push(null);
    }

    return pagesArr;
  }, [currentPage, totalPages]);

  const makePageLink = (page: number) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("page", page.toString());

    return `?${searchParams.toString()}`;
  };

  return (
    <Pagination>
      <PaginationContent>
        {hasPrevious && (
          <PaginationPrevious href={makePageLink(currentPage - 1)} />
        )}

        {pages.map((page, index) => {
          if (page === null) {
            if (index === 0) {
              return (
                <React.Fragment key={index}>
                  <PaginationItem>
                    <PaginationLink
                      href={makePageLink(1)}
                      isActive={1 === currentPage}
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>{" "}
                  <PaginationEllipsis />
                </React.Fragment>
              );
            }

            return (
              <React.Fragment key={index}>
                <PaginationEllipsis />{" "}
                <PaginationItem>
                  <PaginationLink
                    href={makePageLink(totalPages)}
                    isActive={totalPages === currentPage}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </React.Fragment>
            );
          }

          return (
            <PaginationItem key={index}>
              <PaginationLink
                href={makePageLink(page)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {hasNext && <PaginationNext href={makePageLink(currentPage + 1)} />}
      </PaginationContent>
    </Pagination>
  );
};

export default Paginator;
