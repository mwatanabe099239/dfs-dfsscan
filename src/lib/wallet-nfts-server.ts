import type { Firestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { ScanNftHolding } from "@/src/types";

const NFT_REGISTRY = "nfts";
const NFT_TOKEN_SUB = "tokens";
const NFT_PER_OWNER_LIMIT = 200;
/** Max `nfts/{collectionId}` parent docs to scan (avoids collection-group indexes). */
const NFT_REGISTRY_PARENT_LIMIT = 500;

function inferNftCollectionIdFromPath(path: string): string {
  const parts = path.split("/");
  const i = parts.indexOf(NFT_REGISTRY);
  if (i >= 0 && parts[i + 2] === NFT_TOKEN_SUB) {
    return parts[i + 1] || "legacy";
  }
  return "legacy";
}

function mergeNftTokenDoc(
  dedupe: Map<string, ScanNftHolding>,
  docSnap: QueryDocumentSnapshot,
  explicitFallbackCollectionId?: string
) {
  const data = docSnap.data();
  const tokenId =
    (typeof data.tokenId === "string" && data.tokenId.trim()) || docSnap.id;
  if (!tokenId) return;
  const cid =
    (typeof data.contractAddress === "string" && data.contractAddress.trim()) ||
    explicitFallbackCollectionId ||
    inferNftCollectionIdFromPath(docSnap.ref.path);
  const key = `${cid}\0${tokenId}`;
  if (dedupe.has(key)) return;
  const image =
    (typeof data.image === "string" && data.image.trim()) ||
    (typeof data.imageUrl === "string" && data.imageUrl.trim()) ||
    "";
  dedupe.set(key, {
    docId: docSnap.id,
    collectionId: cid,
    tokenId,
    name: (data.name as string) || "NFT",
    image,
    state: data.state as string | undefined,
    owner: (data.owner as string) || "",
    tokenURI: data.tokenURI as string | undefined,
  });
}

async function resolveOwnerUidsForWallet(
  db: Firestore,
  walletAddress: string
): Promise<string[]> {
  const raw = walletAddress.trim();
  const lower = raw.toLowerCase();
  if (!lower.startsWith("dfs_0x")) return [];

  const variants = Array.from(new Set([raw, lower].filter((v) => v.length > 0)));
  const uids = new Set<string>();

  for (const w of variants) {
    for (const collName of ["users", "non_users"] as const) {
      try {
        const snap = await db
          .collection(collName)
          .where("walletAddress", "==", w)
          .limit(1)
          .get();
        if (!snap.empty) uids.add(snap.docs[0].id);
      } catch (e) {
        console.warn("resolveOwnerUidsForWallet", collName, e);
      }
    }
  }
  return [...uids];
}

/**
 * Query each `nfts/{collectionId}/tokens` subcollection (no collection-group index).
 * Collection-group queries return FAILED_PRECONDITION until composite indexes exist in Firebase.
 */
async function mergeNftsFromRegistrySubcollections(
  db: Firestore,
  dedupe: Map<string, ScanNftHolding>,
  ownerLower: string,
  ownerUids: string[]
) {
  const registryRoots = await db
    .collection(NFT_REGISTRY)
    .limit(NFT_REGISTRY_PARENT_LIMIT)
    .get();

  const constraints: { field: string; value: string }[] = [
    { field: "owner", value: ownerLower },
    ...ownerUids.map((uid) => ({ field: "ownerUid", value: uid })),
  ];

  const tasks: Promise<void>[] = [];
  for (const col of registryRoots.docs) {
    const tokensRef = col.ref.collection(NFT_TOKEN_SUB);
    for (const { field, value } of constraints) {
      tasks.push(
        tokensRef
          .where(field, "==", value)
          .limit(NFT_PER_OWNER_LIMIT)
          .get()
          .then((snap) => {
            snap.docs.forEach((d) => mergeNftTokenDoc(dedupe, d, col.id));
          })
          .catch((e) =>
            console.warn(
              "getWalletNftsForAddress registry subcollection",
              col.id,
              field,
              e
            )
          )
      );
    }
  }
  await Promise.all(tasks);
}

async function mergeLegacyRootTokensCollection(
  db: Firestore,
  dedupe: Map<string, ScanNftHolding>,
  ownerLower: string,
  ownerUids: string[]
) {
  const col = db.collection("tokens");
  const constraints: { field: string; value: string }[] = [
    { field: "owner", value: ownerLower },
    ...ownerUids.map((uid) => ({ field: "ownerUid", value: uid })),
  ];

  await Promise.all(
    constraints.map(({ field, value }) =>
      col
        .where(field, "==", value)
        .limit(NFT_PER_OWNER_LIMIT)
        .get()
        .then((snap) => {
          snap.docs.forEach((d) => mergeNftTokenDoc(dedupe, d, "legacy"));
        })
        .catch((e) =>
          console.warn("getWalletNftsForAddress legacy root tokens", field, e)
        )
    )
  );
}

/** Server-only: same registry rules as metaface; bypasses client Firestore security rules. */
export async function getWalletNftsForAddress(
  db: Firestore,
  walletAddress: string
): Promise<ScanNftHolding[]> {
  const owner = walletAddress.trim().toLowerCase();
  if (!owner.startsWith("dfs_0x")) return [];

  const ownerUids = await resolveOwnerUidsForWallet(db, walletAddress);
  const dedupe = new Map<string, ScanNftHolding>();

  try {
    await mergeNftsFromRegistrySubcollections(db, dedupe, owner, ownerUids);
  } catch (e) {
    console.warn("getWalletNftsForAddress registry subcollections failed:", e);
  }

  try {
    await mergeLegacyRootTokensCollection(db, dedupe, owner, ownerUids);
  } catch (e) {
    console.warn("getWalletNftsForAddress legacy root failed:", e);
  }

  return Array.from(dedupe.values()).sort((a, b) =>
    `${a.collectionId}:${a.tokenId}`.localeCompare(
      `${b.collectionId}:${b.tokenId}`,
      undefined,
      { numeric: true }
    )
  );
}
