import { IFormSubmission } from "@/types/forms";
import { useState, useEffect } from "react";

export function useFormSubmission(submissionId: string) {
  const [submission, setSubmission] = useState<IFormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await fetch(`/api/submissions/${submissionId}`);
        if (!res.ok) throw new Error('Failed to fetch submission');
        setSubmission(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [submissionId]);

  return { submission, loading, error };
}