import Link from "next/link";
import { prisma } from "../../lib/prisma";
import ListingCard from "../../components/ListingCard";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; category?: string; country?: string; university?: string; minPrice?: string; maxPrice?: string; sort?: string; location?: string; sellerType?: string }>;

const categories = ["", "Accommodation", "Beauty & dressing", "Electronics", "Food", "Furniture", "Jobs", "Printing & photography", "Services", "Stationery", "Utensils", "Other"];

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const category = params.category?.trim() || "";
  const country = params.country?.trim() || "";
  const university = params.university?.trim() || "";
  const minPrice = Number(params.minPrice);
  const maxPrice = Number(params.maxPrice);
  const sort = params.sort?.trim() || "newest";
  const location = params.location?.trim() || "";
  const sellerType = params.sellerType?.trim() || "";

  const priceFilter = {
    ...(Number.isFinite(minPrice) && minPrice >= 0 ? { gte: minPrice } : {}),
    ...(Number.isFinite(maxPrice) && maxPrice >= 0 ? { lte: maxPrice } : {}),
  };

  const sellerFilters: any = {};
  if (country) sellerFilters.country = { equals: country, mode: "insensitive" };
  if (sellerType === "STUDENT" || sellerType === "OUTSIDER") sellerFilters.accountType = sellerType;
  if (university) sellerFilters.university = { equals: university, mode: "insensitive" };

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(category ? { category: { equals: category, mode: "insensitive" as const } } : {}),
      ...(Object.keys(sellerFilters).length ? { seller: sellerFilters } : {}),
      ...(Object.keys(priceFilter).length ? { price: priceFilter } : {}),
      ...(location ? { location: { contains: location, mode: "insensitive" as const } } : {}),
      ...(q ? { OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { category: { contains: q, mode: "insensitive" as const } },
        { location: { contains: q, mode: "insensitive" as const } },
      ] } : {}),
    },
    orderBy:
      sort === "price-low" ? [{ price: "asc" as const }] :
      sort === "price-high" ? [{ price: "desc" as const }] :
      sort === "title-az" ? [{ title: "asc" as const }] :
      sort === "title-za" ? [{ title: "desc" as const }] :
      sort === "oldest" ? [{ createdAt: "asc" as const }] :
      [{ promoted: "desc" as const }, { createdAt: "desc" as const }],
    take: 60,
    select: {
      id: true, title: true, description: true, price: true, currency: true, category: true,
      imageUrl: true, location: true, promoted: true, createdAt: true,
      seller: { select: { id: true, name: true, university: true, country: true, emailVerified: true, phoneVerified: true } },
    },
  });

  const hasFilters = Boolean(q || category || country || university || params.minPrice || params.maxPrice || (params.sort && params.sort !== "newest") || location || sellerType);

  return (
    <div className="marketplace-page">
      <div className="market-page-head">
        <div>
          <span className="hero-kicker">MARKETPLACE</span>
          <h1>All items</h1>
        </div>
      </div>

      <div className="market-section-head">
        <div>
          <h2>{listings.length} {listings.length === 1 ? "item" : "items"}</h2>
        </div>
        {hasFilters && <span>Filtered</span>}
      </div>

      {listings.length === 0 ? (
        <div className="compact-empty"><strong>No items found</strong><Link href="/listings">Clear filters</Link></div>
      ) : (
        <div className="listing-grid">
          {listings.map(listing => (
            <ListingCard key={listing.id} item={{
              id: listing.id, title: listing.title, description: listing.description,
              price: listing.price.toString(), currency: listing.currency, category: listing.category,
              imageUrl: listing.imageUrl, location: listing.location, promoted: listing.promoted,
              seller: { id: listing.seller.id, name: listing.seller.name, university: listing.seller.university, emailVerified: listing.seller.emailVerified, phoneVerified: listing.seller.phoneVerified },
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
