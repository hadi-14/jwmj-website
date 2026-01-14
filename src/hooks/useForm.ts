import { IForm } from '@/types/forms';
import { useState, useEffect } from 'react';

export function useForm(formType: string) {
  const [form, setForm] = useState<IForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/forms/${formType}`);
        if (!res.ok) throw new Error('Failed to fetch form');
        setForm(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formType]);

  return { form, loading, error };
}