import TabNavigation from "./tabs/TabNavigation";
import VisitDetailHeader from "./VisitDetailHeader";

interface VisitDetailsProps {
  params: {
    visit: any;
  };
}

export default function VisitDetailsPage({ params }: VisitDetailsProps) {
  const { visit } = params;
  return (
    <div className="p-6">
      <VisitDetailHeader visit={visit} />
      <TabNavigation visit={visit} />
    </div>
  );
}
