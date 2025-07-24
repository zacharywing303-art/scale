import { useRouter } from "next/navigation";

export function EditButton({ employeeId }: { employeeId: string }) {
  const router = useRouter();

  return (
    <button
      className="text-blue-600 underline"
      onClick={() => {
        router.push(`/dashboard/hr/employees/${employeeId}`);
      }}
    >
      Edit
    </button>
  );
}
