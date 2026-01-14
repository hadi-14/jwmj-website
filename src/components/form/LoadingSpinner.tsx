// Loading Spinner Component
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin">
        <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
      </div>
    </div>
  );
}