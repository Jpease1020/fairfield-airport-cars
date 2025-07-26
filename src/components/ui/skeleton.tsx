import { cn } from "@/lib/utils/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className, 
  width, 
  height 
}) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

// Pre-built skeleton components for common use cases
export const BookingFormSkeleton = () => (
  <div className="">
    <div className="">
      <Skeleton className="" />
      <div className="">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="">
            <Skeleton className="" />
            <Skeleton className="" />
          </div>
        ))}
      </div>
    </div>
    <Skeleton className="h-12 w-full" />
  </div>
);

export const BookingCardSkeleton = () => (
  <div className="">
    <div className="">
      <div className="">
        <Skeleton className="" />
        <Skeleton className="" />
      </div>
      <Skeleton className="" />
    </div>
    <div className="">
      <Skeleton className="" />
      <Skeleton className="" />
    </div>
    <div className="">
      <Skeleton className="" />
      <Skeleton className="" />
    </div>
  </div>
);

export const AdminDashboardSkeleton = () => (
  <div className="">
    <div className="">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="">
          <div className="">
            <Skeleton className="" />
            <div className="">
              <Skeleton className="" />
              <Skeleton className="" />
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="">
          <Skeleton className="" />
          <div className="">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="">
                <Skeleton className="" />
                <Skeleton className="" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div className="">
    <div className="space-y-4">
      <Skeleton className="" />
      <Skeleton className="" />
    </div>
    <div className="">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="" />
      ))}
    </div>
    <div className="">
      <Skeleton className="" />
      <Skeleton className="" />
    </div>
  </div>
); 