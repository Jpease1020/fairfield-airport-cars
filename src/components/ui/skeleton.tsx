import { cn } from "@/lib/utils/utils";
import { Container } from '@/components/ui';

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
  <Container>
    <Container>
      <Skeleton />
      <Container>
        {[...Array(4)].map((_, i) => (
          <Container key={i}>
            <Skeleton />
            <Skeleton />
          </Container>
        ))}
      </Container>
    </Container>
    <Skeleton />
  </Container>
);

export const BookingCardSkeleton = () => (
  <div >
    <div >
      <div >
        <Skeleton  />
        <Skeleton  />
      </div>
      <Skeleton  />
    </div>
    <div >
      <Skeleton  />
      <Skeleton  />
    </div>
    <div >
      <Skeleton  />
      <Skeleton  />
    </div>
  </div>
);

export const AdminDashboardSkeleton = () => (
  <div >
    <div >
      {[...Array(5)].map((_, i) => (
        <div key={i} >
          <div >
            <Skeleton  />
            <div >
              <Skeleton  />
              <Skeleton  />
            </div>
          </div>
        </div>
      ))}
    </div>
    <div >
      {[...Array(2)].map((_, i) => (
        <div key={i} >
          <Skeleton  />
          <div >
            {[...Array(4)].map((_, j) => (
              <div key={j} >
                <Skeleton  />
                <Skeleton  />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div >
    <div >
      <Skeleton  />
      <Skeleton  />
    </div>
    <div >
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i}  />
      ))}
    </div>
    <div >
      <Skeleton  />
      <Skeleton  />
    </div>
  </div>
); 