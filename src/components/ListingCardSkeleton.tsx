export const ListingCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-square rounded-xl bg-secondary mb-3" />
    <div className="space-y-2">
      <div className="flex justify-between">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-4 bg-secondary rounded w-10" />
      </div>
      <div className="h-3 bg-secondary rounded w-1/2" />
      <div className="h-3 bg-secondary rounded w-2/3" />
      <div className="h-3 bg-secondary rounded w-1/3" />
      <div className="h-4 bg-secondary rounded w-1/4 mt-1" />
    </div>
  </div>
);
