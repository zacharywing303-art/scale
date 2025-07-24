import { useRouter } from "next/navigation";

export function EditButton({ clientId }: { clientId: string }) {
  const router = useRouter();

  return (
    <button
      className="text-blue-600 underline"
      onClick={() => {
        router.push(`/dashboard/hr/clients/${clientId}`);
      }}
    >
      Edit
    </button>
  );
}
