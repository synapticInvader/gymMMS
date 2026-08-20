import { MemberDetailView } from "@/components/domain/members/MemberDetailView";

export default async function MemberDetailPage({ params }: PageProps<"/members/[id]">) {
  const { id } = await params;

  return <MemberDetailView memberId={id} />;
}
