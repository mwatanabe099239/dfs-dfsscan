import AddressContent from "./AddressContent";

export default async function AddressDetail({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const resolvedParams = await params;
  return <AddressContent address={resolvedParams.address} />;
}
