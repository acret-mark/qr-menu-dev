import { InactiveMenuScreen } from "@/components/menu/inactive-menu-screen";

export default async function MenuCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <InactiveMenuScreen slug={slug} />;
}
