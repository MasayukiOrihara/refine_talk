import { SubPage } from "@/components/sub-page";

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  console.log(slug);
  return <SubPage />;
}
